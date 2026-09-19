"""The LZY tree-walking interpreter.

Correctness and clear diagnostics come first here; speed comes later, when the
language has settled enough to justify a bytecode VM (see ROADMAP.md). Every
failure path in this file produces an :class:`~lzy.errors.LzyError` with a
source span, never a bare Python exception.
"""

from __future__ import annotations

import sys
from typing import Callable, List, Optional

from lzy.ast.nodes import (
    Ask,
    Assign,
    Binary,
    Block,
    Break,
    Call,
    Continue,
    Expression,
    ExpressionStatement,
    For,
    FunctionDef,
    Identifier,
    If,
    Index,
    ListLiteral,
    Literal,
    Logical,
    MapLiteral,
    Member,
    Program,
    Return,
    Say,
    Unary,
    While,
)
from lzy.errors import (
    LzyError,
    LzyIOError,
    LzyIndexError,
    LzyLimitError,
    LzyNameError,
    LzyTypeError,
    LzyValueError,
    Span,
)
from lzy.interpreter.builtins import BUILTINS, CallContext
from lzy.interpreter.environment import Environment
from lzy.interpreter.values import (
    Function,
    TooDeep,
    NativeFunction,
    describe,
    equal,
    format_number,
    inspect,
    is_hashable_key,
    is_number,
    is_truth,
    normalise_number,
    show,
    type_name,
)
from lzy.runtime.limits import Limits

#: Names from other languages, mapped to the LZY way of doing the same thing.
_FAMILIAR_NAMES = {
    "print": "say",
    "println": "say",
    "printf": "say",
    "echo": "say",
    "puts": "say",
    "write": "say",
    "input": "ask",
    "readline": "ask",
    "len": "length",
    "size": "length",
    "count": "length",
    "str": "text",
    "string": "text",
    "int": "number",
    "float": "number",
    "push": "append",
    "add": "append",
    "sorted": "sort",
    "lowercase": "lower",
    "uppercase": "upper",
    "strip": "trim",
    "substring": "split",
    "indexof": "find",
    "index_of": "find",
    "random": "random_number",
    "none": "nothing",
    "null": "nothing",
    "nil": "nothing",
    "undefined": "nothing",
}


class _Signal(Exception):
    """Base for the non-error control flow signals used inside the tree walk."""

    __slots__ = ()


class _Return(_Signal):
    __slots__ = ("value", "span")

    def __init__(self, value, span=None):
        self.value = value
        self.span = span


class _Break(_Signal):
    __slots__ = ()


class _Continue(_Signal):
    __slots__ = ()


class Interpreter:
    def __init__(
        self,
        *,
        limits: Optional[Limits] = None,
        output: Optional[Callable[[str], None]] = None,
        read_line: Optional[Callable[[str], str]] = None,
        file: str = "<input>",
    ) -> None:
        self.limits = limits or Limits()
        self.file = file
        self._output = output if output is not None else _default_output
        self._read_line = read_line if read_line is not None else _default_read_line
        self.globals = Environment(None, "global")
        self.environment = self.globals
        self.call_depth = 0
        self._install_builtins()

    def _install_builtins(self) -> None:
        for name, function in BUILTINS.items():
            self.globals.define(name, name, function)

    # ------------------------------------------------------------------
    # Entry points
    # ------------------------------------------------------------------

    def run(self, program: Program) -> None:
        """Run a whole program. Raises :class:`LzyError` on failure."""
        previous_limit = sys.getrecursionlimit()
        sys.setrecursionlimit(self.limits.python_recursion_limit)
        try:
            self.execute_block(program.body, self.globals)
        except _Return as signal:
            raise LzyError(
                "'return' was used outside a function.",
                _span_of(signal),
                hint="A 'return' only makes sense inside a function body.",
            ) from None
        except _Break:
            raise LzyError(
                "'break' was used outside a loop.",
                None,
                hint="A 'break' only makes sense inside a 'for' or 'while'.",
            ) from None
        except _Continue:
            raise LzyError(
                "'continue' was used outside a loop.",
                None,
                hint="A 'continue' only makes sense inside a 'for' or 'while'.",
            ) from None
        except RecursionError:
            raise LzyLimitError(
                "This program went too deep for LZY to keep track of.",
                None,
                hint="Check for a function or a value that keeps nesting without end.",
            ) from None
        finally:
            sys.setrecursionlimit(previous_limit)

    def evaluate_source_expression(self, expression: Expression):
        """Evaluate a single expression in the global scope (used by the REPL)."""
        return self.evaluate(expression)

    # ------------------------------------------------------------------
    # Statements
    # ------------------------------------------------------------------

    def execute_block(self, block: Block, environment: Environment) -> None:
        previous = self.environment
        self.environment = environment
        try:
            for statement in block.statements:
                self.execute(statement)
        finally:
            self.environment = previous

    def execute(self, statement) -> None:
        method = self._STATEMENTS.get(type(statement))
        if method is None:  # pragma: no cover - guards against an unhandled node
            raise LzyError(
                f"LZY does not yet know how to run a {type(statement).__name__}.",
                getattr(statement, "span", None),
            )
        method(self, statement)

    def _execute_say(self, statement: Say) -> None:
        parts = [show(self.evaluate(value)) for value in statement.values]
        line = " ".join(parts)
        if len(line) > self.limits.max_output_characters:
            raise LzyLimitError(
                "This 'say' would print more text than LZY allows at once.",
                statement.span,
                hint=(
                    f"The limit is {self.limits.max_output_characters:,} characters. "
                    "Print it in smaller pieces."
                ),
            )
        self._output(line)

    def _execute_expression_statement(self, statement: ExpressionStatement) -> None:
        self.evaluate(statement.expression)

    def _execute_assign(self, statement: Assign) -> None:
        value = self.evaluate(statement.value)
        target = statement.target

        if isinstance(target, Identifier):
            self.environment.assign(target.folded, target.name, value)
            return
        if isinstance(target, Index):
            container = self.evaluate(target.target)
            key = self.evaluate(target.key)
            self._store_at(container, key, value, target.span)
            return
        if isinstance(target, Member):
            container = self.evaluate(target.target)
            if not isinstance(container, dict):
                raise LzyTypeError(
                    f"Only a map can have named parts, but this is {describe(container)}.",
                    target.span,
                    hint=f"'{target.name}' can only be stored on a map.",
                )
            container[self._member_key(container, target)] = value
            return
        raise LzyError(  # pragma: no cover - parser rejects these first
            "This is not somewhere a value can be stored.", target.span
        )

    def _execute_if(self, statement: If) -> None:
        if self._truth(self.evaluate(statement.condition), statement.condition, "if"):
            self.execute_block(statement.then_branch, self.environment)
        elif statement.else_branch is not None:
            branch = statement.else_branch
            if isinstance(branch, Block):
                self.execute_block(branch, self.environment)
            else:
                self.execute(branch)

    def _execute_while(self, statement: While) -> None:
        while self._truth(
            self.evaluate(statement.condition), statement.condition, "while"
        ):
            try:
                self.execute_block(statement.body, self.environment)
            except _Break:
                break
            except _Continue:
                continue

    def _execute_for(self, statement: For) -> None:
        iterable = self.evaluate(statement.iterable)
        items = self._items_of(iterable, statement.iterable.span)
        for item in items:
            self.environment.assign(statement.folded, statement.name, item)
            try:
                self.execute_block(statement.body, self.environment)
            except _Break:
                break
            except _Continue:
                continue

    def _items_of(self, value, span: Span) -> List:
        if isinstance(value, list):
            # Copy so that changing the list inside the loop cannot make the
            # loop skip items or run forever.
            return list(value)
        if isinstance(value, str):
            return list(value)
        if isinstance(value, dict):
            return list(value.keys())
        raise LzyTypeError(
            f"A 'for' loop needs a list, a map or text to go through, but this is "
            f"{describe(value)}.",
            span,
            hint="Use range(10) to count, or put the values in a list first.",
        )

    def _execute_function_def(self, statement: FunctionDef) -> None:
        function = Function(
            statement.name,
            statement.parameters,
            statement.body,
            self.environment,
            statement.span,
        )
        self.environment.define(statement.folded, statement.name, function)

    def _execute_return(self, statement: Return) -> None:
        value = self.evaluate(statement.value) if statement.value is not None else None
        raise _Return(value, statement.span)

    def _execute_break(self, statement: Break) -> None:
        raise _Break()

    def _execute_continue(self, statement: Continue) -> None:
        raise _Continue()

    # ------------------------------------------------------------------
    # Expressions
    # ------------------------------------------------------------------

    def evaluate(self, expression):
        method = self._EXPRESSIONS.get(type(expression))
        if method is None:  # pragma: no cover - guards against an unhandled node
            raise LzyError(
                f"LZY does not yet know how to work out a "
                f"{type(expression).__name__}.",
                getattr(expression, "span", None),
            )
        return method(self, expression)

    def _evaluate_literal(self, expression: Literal):
        return expression.value

    def _evaluate_list(self, expression: ListLiteral):
        return [self.evaluate(item) for item in expression.items]

    def _evaluate_map(self, expression: MapLiteral):
        result = {}
        for key_expression, value_expression in expression.entries:
            key = self.evaluate(key_expression)
            if not is_hashable_key(key):
                raise LzyTypeError(
                    f"A map key must be text, a number or a yes/no value, but this is "
                    f"{describe(key)}.",
                    key_expression.span,
                )
            result[key] = self.evaluate(value_expression)
        return result

    def _evaluate_identifier(self, expression: Identifier):
        try:
            return self.environment.get(expression.folded)
        except KeyError:
            raise self._unknown_name(expression) from None

    def _unknown_name(self, expression: Identifier) -> LzyNameError:
        familiar = _FAMILIAR_NAMES.get(expression.folded)
        if familiar is not None:
            return LzyNameError(
                f"LZY does not have anything called '{expression.name}'.",
                expression.span,
                hint=f"In LZY this is called '{familiar}'.",
                suggestion=familiar,
            )
        close = self.environment.closest_names(expression.folded)
        if close:
            return LzyNameError(
                f"'{expression.name}' has not been given a value yet.",
                expression.span,
                hint="LZY knows a name that looks very similar.",
                suggestion=close[0],
            )
        return LzyNameError(
            f"'{expression.name}' has not been given a value yet.",
            expression.span,
            hint=(
                f"Store something in it first, like: {expression.name} = 0\n"
                "Remember that LZY ignores capital letters in names."
            ),
        )

    def _evaluate_unary(self, expression: Unary):
        value = self.evaluate(expression.operand)
        if expression.operator == "-":
            if not is_number(value):
                raise LzyTypeError(
                    f"Only a number can be made negative, but this is {describe(value)}.",
                    expression.span,
                )
            return normalise_number(-value)
        return not self._truth(value, expression.operand, "not")

    def _evaluate_logical(self, expression: Logical):
        left = self._truth(
            self.evaluate(expression.left), expression.left, expression.operator
        )
        if expression.operator == "or":
            if left:
                return True
        elif not left:
            return False
        return self._truth(
            self.evaluate(expression.right), expression.right, expression.operator
        )

    def _evaluate_binary(self, expression: Binary):
        left = self.evaluate(expression.left)
        right = self.evaluate(expression.right)
        operator = expression.operator
        span = expression.operator_span or expression.span

        if operator in ("==", "!="):
            try:
                same = equal(left, right)
            except TooDeep:
                raise LzyLimitError(
                    "These values are nested too deeply to compare.",
                    span,
                    hint="This usually means a list or map contains itself.",
                ) from None
            return same if operator == "==" else not same
        if operator in ("<", "<=", ">", ">="):
            return self._compare(operator, left, right, span)
        return self._arithmetic(operator, left, right, span, expression)

    def _compare(self, operator: str, left, right, span: Span):
        both_numbers = is_number(left) and is_number(right)
        both_text = isinstance(left, str) and isinstance(right, str)
        if not (both_numbers or both_text):
            raise LzyTypeError(
                f"LZY can only compare two numbers or two pieces of text with "
                f"'{operator}', but it was given {describe(left)} and {describe(right)}.",
                span,
                hint="Use '==' to check whether two values are the same.",
            )
        if operator == "<":
            return left < right
        if operator == "<=":
            return left <= right
        if operator == ">":
            return left > right
        return left >= right

    def _arithmetic(self, operator: str, left, right, span: Span, expression: Binary):
        if operator == "+":
            if is_number(left) and is_number(right):
                return normalise_number(left + right)
            if isinstance(left, str) and isinstance(right, str):
                return left + right
            if isinstance(left, list) and isinstance(right, list):
                return left + right
            raise self._addition_error(left, right, span, expression)

        if not is_number(left) or not is_number(right):
            culprit = left if not is_number(left) else right
            raise LzyTypeError(
                f"'{operator}' works on numbers, but it was given {describe(culprit)}.",
                span,
                hint="Use number() to turn text into a number first."
                if isinstance(culprit, str)
                else None,
            )

        if operator == "-":
            return normalise_number(left - right)
        if operator == "*":
            return normalise_number(left * right)
        if operator == "/":
            if right == 0:
                raise LzyValueError(
                    "LZY cannot divide by zero.",
                    span,
                    hint="Check the value on the right of the '/' before dividing.",
                )
            return normalise_number(left / right)
        if operator == "%":
            if right == 0:
                raise LzyValueError(
                    "LZY cannot work out the remainder when dividing by zero.",
                    span,
                    hint="Check the value on the right of the '%' before dividing.",
                )
            return normalise_number(left % right)
        raise LzyError(f"Unknown operator '{operator}'.", span)  # pragma: no cover

    def _addition_error(self, left, right, span: Span, expression: Binary) -> LzyTypeError:
        """The classic 'number + text' mistake gets the clearest message LZY has."""
        if is_number(left) and isinstance(right, str):
            wrong, kind = "right", "text"
        elif isinstance(left, str) and is_number(right):
            wrong, kind = "left", "text"
        else:
            wrong, kind = None, None

        if wrong is not None:
            left_text = _source_text(expression.left)
            right_text = _source_text(expression.right)
            suggestion = None
            if left_text and right_text:
                if wrong == "right":
                    suggestion = f"{left_text} + number({right_text})"
                else:
                    suggestion = f"number({left_text}) + {right_text}"
            return LzyTypeError(
                f"'+' cannot add a number and {kind}.",
                span,
                hint=(
                    "LZY keeps numbers and text apart so that '+' always means the "
                    "same thing. Use number(...) to add them as numbers, or "
                    "text(...) to join them as text."
                ),
                suggestion=suggestion,
            )
        return LzyTypeError(
            f"'+' cannot join {describe(left)} and {describe(right)}.",
            span,
            hint="'+' adds two numbers, joins two pieces of text, or joins two lists.",
        )

    def _evaluate_index(self, expression: Index):
        container = self.evaluate(expression.target)
        key = self.evaluate(expression.key)
        return self._load_at(container, key, expression.span)

    def _load_at(self, container, key, span: Span):
        if isinstance(container, (list, str)):
            if not is_number(key) or isinstance(key, float) and not key.is_integer():
                raise LzyTypeError(
                    f"A position in {'a list' if isinstance(container, list) else 'text'}"
                    f" must be a whole number, but this is {describe(key)}.",
                    span,
                    hint='Use a map with { "key": value } if you want to look things up '
                    "by name.",
                )
            index = int(key)
            if not -len(container) <= index < len(container):
                what = "list" if isinstance(container, list) else "text"
                if not container:
                    raise LzyIndexError(
                        f"This {what} is empty, so there is nothing at position {index}.",
                        span,
                    )
                raise LzyIndexError(
                    f"There is no position {index} in this {what}.",
                    span,
                    hint=f"It holds {len(container)} "
                    f"{'items' if isinstance(container, list) else 'characters'}, so the "
                    f"positions run from 0 to {len(container) - 1}.",
                )
            return container[index]

        if isinstance(container, dict):
            if not is_hashable_key(key):
                raise LzyTypeError(
                    f"A map key must be text, a number or a yes/no value, but this is "
                    f"{describe(key)}.",
                    span,
                )
            if key not in container:
                raise LzyIndexError(
                    f"This map has no key {inspect(key)}.",
                    span,
                    hint=self._key_hint(container, key),
                )
            return container[key]

        raise LzyTypeError(
            f"Only a list, a map or text can be looked into, but this is "
            f"{describe(container)}.",
            span,
        )

    def _key_hint(self, container: dict, key) -> str:
        known = [inspect(existing) for existing in list(container.keys())[:8]]
        if not known:
            return "The map is empty."
        listed = ", ".join(known)
        more = ", ..." if len(container) > 8 else ""
        return f"It has these keys: {listed}{more}"

    def _store_at(self, container, key, value, span: Span) -> None:
        if isinstance(container, list):
            if not is_number(key) or (isinstance(key, float) and not key.is_integer()):
                raise LzyTypeError(
                    f"A position in a list must be a whole number, but this is "
                    f"{describe(key)}.",
                    span,
                    hint='Use a map written as { "key": value } if you want to store '
                    "things by name.",
                )
            index = int(key)
            if not -len(container) <= index < len(container):
                raise LzyIndexError(
                    f"There is no position {index} in this list.",
                    span,
                    hint="Use append() to add a new item to the end of a list.",
                )
            container[index] = value
            return
        if isinstance(container, dict):
            if not is_hashable_key(key):
                raise LzyTypeError(
                    f"A map key must be text, a number or a yes/no value, but this is "
                    f"{describe(key)}.",
                    span,
                )
            container[key] = value
            return
        if isinstance(container, str):
            raise LzyTypeError(
                "Text cannot be changed one character at a time.",
                span,
                hint="Build a new piece of text instead, for example with replace().",
            )
        raise LzyTypeError(
            f"Only a list or a map can be changed this way, but this is "
            f"{describe(container)}.",
            span,
        )

    def _evaluate_member(self, expression: Member):
        container = self.evaluate(expression.target)
        if not isinstance(container, dict):
            raise LzyTypeError(
                f"Only a map has named parts, but this is {describe(container)}.",
                expression.span,
                hint=f"To read '{expression.name}' the value on the left must be a map.",
            )
        key = self._member_key(container, expression, for_reading=True)
        if key not in container:
            raise LzyIndexError(
                f"This map has no key \"{expression.name}\".",
                expression.span,
                hint=self._key_hint(container, expression.name),
            )
        return container[key]

    def _member_key(self, container: dict, expression: Member, for_reading: bool = False):
        """Work out which key ``value.name`` refers to.

        Map keys hold data, which may have come from a file or a network
        response, so they are compared exactly first. Only when there is no
        exact match does LZY fall back to its case-insensitive rule, and an
        ambiguous fallback is an error rather than a guess.
        """
        if expression.name in container:
            return expression.name
        folded = expression.folded
        matches = [
            key
            for key in container
            if isinstance(key, str) and key.casefold() == folded
        ]
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            listed = ", ".join(f'"{match}"' for match in matches)
            raise LzyIndexError(
                f"'{expression.name}' could mean more than one key in this map.",
                expression.span,
                hint=f"These keys all match: {listed}. Use square brackets to say "
                "exactly which one you mean.",
            )
        return expression.name

    def _evaluate_ask(self, expression: Ask):
        prompt = ""
        if expression.prompt is not None:
            prompt = show(self.evaluate(expression.prompt))
        try:
            return self._read_line(prompt)
        except EOFError:
            raise LzyIOError(
                "LZY asked a question but there was no answer to read.",
                expression.span,
                hint="This happens when a program that uses 'ask' is run without "
                "anyone there to type an answer.",
            ) from None
        except KeyboardInterrupt:
            raise LzyIOError(
                "The program was stopped while waiting for an answer.",
                expression.span,
            ) from None

    # ------------------------------------------------------------------
    # Calls
    # ------------------------------------------------------------------

    def _evaluate_call(self, expression: Call):
        callee = self.evaluate(expression.callee)
        arguments = [self.evaluate(argument) for argument in expression.arguments]

        if isinstance(callee, NativeFunction):
            return self._call_native(callee, arguments, expression)
        if isinstance(callee, Function):
            return self.call_function(callee, arguments, expression.span)

        name = _source_name(expression.callee)
        raise LzyTypeError(
            f"{describe(callee).capitalize()} cannot be called like a function.",
            expression.span,
            hint=f"'{name}' holds a value, not a function."
            if name
            else "Only a function can be called with brackets after it.",
        )

    def _call_native(self, function: NativeFunction, arguments: List, expression: Call):
        self._check_arity(
            function.name,
            len(arguments),
            function.min_args,
            function.max_args,
            expression.span,
        )
        context = CallContext(expression.span, function.name)
        return function.call(context, arguments)

    def call_function(self, function: Function, arguments: List, span: Span):
        self._check_arity(
            function.name, len(arguments), function.arity, function.arity, span
        )
        if self.call_depth >= self.limits.max_call_depth:
            raise LzyLimitError(
                f"'{function.name}' called itself too many times.",
                span,
                hint=(
                    f"LZY allows {self.limits.max_call_depth} calls waiting at once. "
                    "A function that calls itself needs a case where it stops and "
                    "returns without calling itself again."
                ),
            )

        scope = Environment(function.closure, function.name)
        for (name, folded), value in zip(function.parameters, arguments):
            scope.define(folded, name, value)

        self.call_depth += 1
        try:
            self.execute_block(function.body, scope)
            return None
        except _Return as signal:
            return signal.value
        except _Break:
            raise LzyError(
                "'break' was used outside a loop.",
                span,
                hint="A 'break' only makes sense inside a 'for' or 'while'.",
            ) from None
        except _Continue:
            raise LzyError(
                "'continue' was used outside a loop.",
                span,
                hint="A 'continue' only makes sense inside a 'for' or 'while'.",
            ) from None
        finally:
            self.call_depth -= 1

    def _check_arity(
        self, name: str, given: int, minimum: int, maximum: Optional[int], span: Span
    ) -> None:
        if given >= minimum and (maximum is None or given <= maximum):
            return
        if maximum is None:
            expected = f"at least {_count(minimum)}"
        elif minimum == maximum:
            expected = _count(minimum)
        else:
            expected = f"between {minimum} and {maximum} inputs"
        raise LzyTypeError(
            f"'{name}' needs {expected}, but it was given {_count(given)}.",
            span,
            hint="Check the brackets for a missing or extra value.",
        )

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    def _truth(self, value, expression: Expression, context: str) -> bool:
        """LZY conditions need a real yes/no value, not a stand-in for one."""
        if is_truth(value):
            return value
        hint = (
            "LZY asks for a clear yes or no here so that a program always means "
            "what it says."
        )
        suggestion = None
        name = _source_name(expression)
        if is_number(value):
            suggestion = f"{name} != 0" if name else "value != 0"
        elif isinstance(value, str):
            suggestion = f'{name} != ""' if name else 'value != ""'
        elif isinstance(value, (list, dict)):
            suggestion = f"length({name}) > 0" if name else "length(value) > 0"
        elif value is None:
            suggestion = f"{name} != nothing" if name else "value != nothing"
        raise LzyTypeError(
            f"'{context}' needs a yes/no value, but it was given {describe(value)}.",
            expression.span,
            hint=hint,
            suggestion=suggestion,
        )

    _STATEMENTS = {}
    _EXPRESSIONS = {}


def _count(n: int) -> str:
    return "1 input" if n == 1 else f"{n} inputs"


#: Longest snippet a suggestion will quote back. Past this, the suggestion is
#: dropped rather than printing a wall of the user's own data.
MAX_SUGGESTION_PART = 40


def _source_text(expression) -> Optional[str]:
    """Re-render a simple expression so a suggestion can quote the user's code.

    Only the shapes that fit comfortably on one line are rendered; anything
    longer or more complex returns None, and the caller drops the suggestion
    rather than printing something unreadable.
    """
    rendered = _render_source_text(expression)
    if rendered is None or len(rendered) > MAX_SUGGESTION_PART:
        return None
    return rendered


def _render_source_text(expression) -> Optional[str]:
    if isinstance(expression, Identifier):
        return expression.name
    if isinstance(expression, Literal):
        return inspect(expression.value)
    if isinstance(expression, Member):
        base = _render_source_text(expression.target)
        return f"{base}.{expression.name}" if base else None
    if isinstance(expression, Call):
        name = _render_source_text(expression.callee)
        if name is None:
            return None
        parts = [_render_source_text(argument) for argument in expression.arguments]
        if any(part is None for part in parts):
            return None
        return f"{name}({', '.join(parts)})"
    return None


def _source_name(expression) -> Optional[str]:
    """The name a user would recognise for an expression, if it has one."""
    if isinstance(expression, Identifier):
        return expression.name
    if isinstance(expression, Member):
        base = _source_name(expression.target)
        return f"{base}.{expression.name}" if base else expression.name
    return None


def _span_of(signal) -> Optional[Span]:
    return getattr(signal, "span", None)


def _default_output(line: str) -> None:
    print(line)


def _default_read_line(prompt: str) -> str:
    return input(prompt)


Interpreter._STATEMENTS = {
    Say: Interpreter._execute_say,
    ExpressionStatement: Interpreter._execute_expression_statement,
    Assign: Interpreter._execute_assign,
    If: Interpreter._execute_if,
    While: Interpreter._execute_while,
    For: Interpreter._execute_for,
    FunctionDef: Interpreter._execute_function_def,
    Return: Interpreter._execute_return,
    Break: Interpreter._execute_break,
    Continue: Interpreter._execute_continue,
}

Interpreter._EXPRESSIONS = {
    Literal: Interpreter._evaluate_literal,
    ListLiteral: Interpreter._evaluate_list,
    MapLiteral: Interpreter._evaluate_map,
    Identifier: Interpreter._evaluate_identifier,
    Unary: Interpreter._evaluate_unary,
    Logical: Interpreter._evaluate_logical,
    Binary: Interpreter._evaluate_binary,
    Index: Interpreter._evaluate_index,
    Member: Interpreter._evaluate_member,
    Call: Interpreter._evaluate_call,
    Ask: Interpreter._evaluate_ask,
}
