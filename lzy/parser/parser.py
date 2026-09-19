"""The LZY parser: tokens in, abstract syntax tree out.

A hand-written recursive-descent parser. It is written this way on purpose:
the grammar in ``docs/spec/grammar.ebnf`` reads almost function-for-function
like this file, which keeps the specification and the implementation honest
about each other.

Parsing stops at the first error. LZY does not yet attempt error recovery, so
one clear message is better than a cascade of guesses.
"""

from __future__ import annotations

from contextlib import contextmanager

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
    Statement,
    Unary,
    While,
    deepest_node,
)
from lzy.errors import LzySyntaxError
from lzy.lexer.tokens import Token, TokenType
from lzy.runtime.limits import Limits

T = TokenType

#: Comparison operators, in one place so the grammar and parser agree.
_COMPARISON = {
    T.EQUAL: "==",
    T.NOT_EQUAL: "!=",
    T.LESS: "<",
    T.LESS_EQUAL: "<=",
    T.GREATER: ">",
    T.GREATER_EQUAL: ">=",
}

_ADDITIVE = {T.PLUS: "+", T.MINUS: "-"}
_MULTIPLICATIVE = {T.STAR: "*", T.SLASH: "/", T.PERCENT: "%"}

#: Tokens that can begin an expression. Used to decide whether ``say`` and
#: ``ask`` and ``return`` have an operand on this line.
_EXPRESSION_START = {
    T.NUMBER,
    T.TEXT,
    T.IDENT,
    T.TRUE,
    T.FALSE,
    T.NOTHING,
    T.NOT,
    T.MINUS,
    T.LPAREN,
    T.LBRACKET,
    T.LBRACE,
    T.ASK,
}

#: Words from other languages that only ever appear where a statement starts.
#: Catching them here gives a better message than "unexpected name". Words that
#: are valid in an expression (``print``, ``input``) are handled by the
#: interpreter's name error instead, which can also suggest real names in scope.
_STATEMENT_TYPOS = {
    "elif": ("else if", "Write 'else if' as two words."),
    "elseif": ("else if", "Write 'else if' as two words."),
    "def": ("function", "LZY starts a function with the word 'function'."),
    "fn": ("function", "LZY starts a function with the word 'function'."),
    "func": ("function", "LZY starts a function with the word 'function'."),
    "foreach": ("for", "LZY writes loops as: for item in items"),
    "endif": ("", "LZY ends a block by stopping the indentation, so there is no "
                  "'endif' to write."),
    "endwhile": ("", "LZY ends a block by stopping the indentation."),
    "endfor": ("", "LZY ends a block by stopping the indentation."),
}


class Parser:
    def __init__(self, tokens: list[Token], limits: Limits | None = None) -> None:
        self.tokens = tokens
        self.limits = limits or Limits()
        self.current = 0
        self.depth = 0

    # ------------------------------------------------------------------
    # Token helpers
    # ------------------------------------------------------------------

    def peek(self, offset: int = 0) -> Token:
        index = min(self.current + offset, len(self.tokens) - 1)
        return self.tokens[index]

    def previous(self) -> Token:
        return self.tokens[max(0, self.current - 1)]

    def check(self, *types: TokenType) -> bool:
        return self.peek().type in types

    def at_end(self) -> bool:
        return self.peek().type is T.EOF

    def advance(self) -> Token:
        if not self.at_end():
            self.current += 1
        return self.previous()

    def match(self, *types: TokenType) -> Token | None:
        if self.check(*types):
            return self.advance()
        return None

    def consume(self, type: TokenType, message: str, **kwargs) -> Token:
        if self.check(type):
            return self.advance()
        raise self.error(self.peek(), message, **kwargs)

    def error(self, token: Token, message: str, **kwargs) -> LzySyntaxError:
        return LzySyntaxError(message, token.span, **kwargs)

    @contextmanager
    def _nested(self, token: Token):
        """Guard the recursive descent against stack exhaustion."""
        self.depth += 1
        if self.depth > self.limits.max_parse_depth:
            self.depth -= 1
            raise self.error(
                token,
                "This code is nested too deeply for LZY to read.",
                hint=(
                    f"LZY allows up to {self.limits.max_parse_depth} levels of nesting. "
                    "Try giving the inner parts their own names or functions."
                ),
            )
        try:
            yield
        finally:
            self.depth -= 1

    def _skip_newlines(self) -> None:
        while self.match(T.NEWLINE):
            pass

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    def parse(self) -> Program:
        start = self.peek().span
        statements: list[Statement] = []
        self._skip_newlines()
        while not self.at_end():
            if self.check(T.INDENT):
                raise self.error(
                    self.peek(),
                    "This line is indented, but nothing above it opens a block.",
                    hint=(
                        "Indentation in LZY belongs under an 'if', 'for', 'while' or "
                        "'function' line. Remove the extra spaces at the start."
                    ),
                )
            if self.match(T.DEDENT):
                continue
            statements.append(self.statement())
            self._skip_newlines()
        body = Block(start, statements)
        program = Program(start, body)
        self._check_tree_depth(program)
        return program

    def _check_tree_depth(self, program: Program) -> None:
        """Refuse a tree too deep to evaluate without exhausting the stack.

        ``max_parse_depth`` bounds the parser's own recursion, which is not the
        same thing: ``1 + 1 + 1 + ...`` is parsed by a loop, so parser recursion
        stays flat while the tree grows one level per operator. Evaluating that
        tree later recurses once per level, so the tree itself has to be
        bounded. Checked here rather than at run time so that ``lzy check``
        catches it too.
        """
        depth, deepest = deepest_node(program)
        if depth <= self.limits.max_ast_depth:
            return
        raise LzySyntaxError(
            "This code nests too deeply for LZY to work through.",
            deepest.span,
            hint=(
                f"LZY handles up to {self.limits.max_ast_depth:,} levels of nesting, "
                f"and this reaches {depth:,}. A very long chain of operators counts "
                "as nesting, so splitting it across several lines with names for the "
                "parts will fix it."
            ),
        )

    # ------------------------------------------------------------------
    # Statements
    # ------------------------------------------------------------------

    def statement(self) -> Statement:
        token = self.peek()
        with self._nested(token):
            if self.check(T.IF):
                return self.if_statement()
            if self.check(T.WHILE):
                return self.while_statement()
            if self.check(T.FOR):
                return self.for_statement()
            if self.check(T.FUNCTION):
                return self.function_statement()
            if self.check(T.SAY):
                return self.say_statement()
            if self.check(T.RETURN):
                return self.return_statement()
            if self.check(T.BREAK):
                self.advance()
                self.end_of_statement()
                return Break(token.span)
            if self.check(T.CONTINUE):
                self.advance()
                self.end_of_statement()
                return Continue(token.span)
            if self.check(T.ELSE):
                raise self.error(
                    token,
                    "This 'else' has no 'if' to go with it.",
                    hint=(
                        "An 'else' must line up with an 'if' at the same indentation, "
                        "directly after that if's block."
                    ),
                )
            if token.type is T.IDENT and token.value in _STATEMENT_TYPOS:
                replacement, hint = _STATEMENT_TYPOS[token.value]
                raise self.error(
                    token,
                    f"LZY does not have a '{token.text}' instruction.",
                    hint=hint,
                    suggestion=replacement or None,
                )
            return self.assignment_or_expression()

    def end_of_statement(self) -> None:
        """Consume the newline that ends a simple statement."""
        if self.match(T.NEWLINE):
            return
        if self.check(T.EOF, T.DEDENT):
            return
        token = self.peek()
        if token.type is T.ASSIGN:
            raise self.error(
                token,
                "There is an extra '=' here.",
                hint="Use '==' to compare two values and a single '=' to store one.",
            )
        raise self.error(
            token,
            f"LZY did not expect {token.describe()} here.",
            hint="Each statement goes on its own line.",
        )

    def block(self, opener: str) -> Block:
        """Parse the indented block that follows a compound statement header."""
        span = self.peek().span
        if not self.match(T.NEWLINE):
            token = self.peek()
            if token.type is T.COLON:
                raise self.error(
                    token,
                    "LZY does not use ':' at the end of this line.",
                    hint=f"Just end the '{opener}' line and indent the block below it.",
                )
            raise self.error(
                token,
                f"LZY expected the '{opener}' line to end here.",
                hint=f"Put the body of the '{opener}' on the next line, indented.",
            )
        self._skip_newlines()
        if not self.check(T.INDENT):
            raise self.error(
                self.peek(),
                f"The '{opener}' on line {span.line} needs an indented block under it.",
                hint="Indent the lines that belong to it by 4 spaces.",
            )
        self.advance()

        statements: list[Statement] = []
        self._skip_newlines()
        while not self.check(T.DEDENT, T.EOF):
            statements.append(self.statement())
            self._skip_newlines()
        if not self.match(T.DEDENT) and not self.at_end():
            raise self.error(self.peek(), "LZY could not find the end of this block.")
        if not statements:
            raise self.error(
                self.peek(),
                f"The '{opener}' block is empty.",
                hint="Put at least one line of code inside it.",
            )
        return Block(span, statements)

    def condition(self, opener: str) -> Expression:
        expression = self.expression()
        if self.check(T.ASSIGN):
            raise self.error(
                self.peek(),
                f"A single '=' stores a value, so it cannot be used to test something "
                f"in an '{opener}'.",
                hint="Use '==' to check whether two values are the same.",
            )
        return expression

    def if_statement(self) -> If:
        token = self.advance()
        condition = self.condition("if")
        then_branch = self.block("if")
        else_branch = None

        self._skip_newlines()
        if self.check(T.ELSE):
            self.advance()
            else_branch = self.if_statement() if self.check(T.IF) else self.block("else")
        return If(token.span, condition, then_branch, else_branch)

    def while_statement(self) -> While:
        token = self.advance()
        condition = self.condition("while")
        body = self.block("while")
        return While(token.span, condition, body)

    def for_statement(self) -> For:
        token = self.advance()
        name_token = self.consume(
            T.IDENT,
            "A 'for' loop needs a name for each item.",
            hint="Write it like: for item in items",
        )
        self.consume(
            T.IN,
            "A 'for' loop needs the word 'in' after the item name.",
            hint=f"Write it like: for {name_token.text} in items",
        )
        iterable = self.expression()
        body = self.block("for")
        return For(token.span, name_token.text, name_token.value, iterable, body)

    def function_statement(self) -> FunctionDef:
        token = self.advance()
        name_token = self.consume(
            T.IDENT,
            "A function needs a name.",
            hint="Write it like: function add(a, b)",
        )
        self.consume(
            T.LPAREN,
            f"The function '{name_token.text}' needs brackets for its inputs.",
            hint=f"Write it like: function {name_token.text}(a, b), or "
            f"function {name_token.text}() if it takes none.",
        )

        parameters: list[tuple[str, str]] = []
        seen = set()
        if not self.check(T.RPAREN):
            while True:
                param = self.consume(
                    T.IDENT,
                    "Each function input needs a name.",
                    hint="Separate the names with commas, like (a, b).",
                )
                if param.value in seen:
                    raise self.error(
                        param,
                        f"The input '{param.text}' is listed twice.",
                        hint="LZY is case-insensitive, so 'Total' and 'total' are the "
                        "same name. Give each input a different name.",
                    )
                seen.add(param.value)
                parameters.append((param.text, param.value))
                if not self.match(T.COMMA):
                    break
                if self.check(T.RPAREN):
                    break
        self.consume(
            T.RPAREN,
            "LZY expected a ')' to close the function's inputs.",
            hint="Check for a missing comma or bracket.",
        )
        body = self.block("function")
        return FunctionDef(
            token.span, name_token.text, name_token.value, parameters, body
        )

    def say_statement(self) -> Say:
        token = self.advance()
        values: list[Expression] = []
        if self.check(*_EXPRESSION_START):
            values.append(self.expression())
            while self.match(T.COMMA):
                values.append(self.expression())
        self.end_of_statement()
        return Say(token.span, values)

    def return_statement(self) -> Return:
        token = self.advance()
        value = None
        if self.check(*_EXPRESSION_START):
            value = self.expression()
        self.end_of_statement()
        return Return(token.span, value)

    def assignment_or_expression(self) -> Statement:
        start = self.peek()
        target = self.expression()

        if self.check(T.ASSIGN):
            equals = self.advance()
            self._check_assignable(target, equals)
            value = self.expression()
            self.end_of_statement()
            return Assign(start.span, target, value)

        self.end_of_statement()
        return ExpressionStatement(start.span, target)

    def _check_assignable(self, target: Expression, equals: Token) -> None:
        if isinstance(target, (Identifier, Index, Member)):
            return
        if isinstance(target, Call):
            raise self.error(
                equals,
                "LZY cannot store a value into the result of a function call.",
                hint=(
                    "To define a function, start the line with the word 'function'. "
                    "To store a value, put a plain name on the left of the '='."
                ),
                suggestion="function name(a, b)",
            )
        raise self.error(
            equals,
            "The left side of '=' must be somewhere a value can be stored.",
            hint="That means a name, a list position like scores[0], or a map key "
            "like user.name.",
        )

    # ------------------------------------------------------------------
    # Expressions, lowest precedence first
    # ------------------------------------------------------------------

    def expression(self) -> Expression:
        with self._nested(self.peek()):
            return self.or_expression()

    def or_expression(self) -> Expression:
        left = self.and_expression()
        while self.check(T.OR):
            self.advance()
            right = self.and_expression()
            left = Logical(left.span, "or", left, right)
        return left

    def and_expression(self) -> Expression:
        left = self.not_expression()
        while self.check(T.AND):
            self.advance()
            right = self.not_expression()
            left = Logical(left.span, "and", left, right)
        return left

    def not_expression(self) -> Expression:
        if self.check(T.NOT):
            token = self.advance()
            with self._nested(token):
                return Unary(token.span, "not", self.not_expression())
        return self.comparison()

    def comparison(self) -> Expression:
        left = self.additive()
        while self.peek().type in _COMPARISON:
            operator = self.advance()
            right = self.additive()
            left = Binary(
                left.span, _COMPARISON[operator.type], left, right, operator.span
            )
        return left

    def additive(self) -> Expression:
        left = self.multiplicative()
        while self.peek().type in _ADDITIVE:
            operator = self.advance()
            right = self.multiplicative()
            left = Binary(left.span, _ADDITIVE[operator.type], left, right, operator.span)
        return left

    def multiplicative(self) -> Expression:
        left = self.unary()
        while self.peek().type in _MULTIPLICATIVE:
            operator = self.advance()
            right = self.unary()
            left = Binary(
                left.span, _MULTIPLICATIVE[operator.type], left, right, operator.span
            )
        return left

    def unary(self) -> Expression:
        if self.check(T.MINUS):
            token = self.advance()
            with self._nested(token):
                return Unary(token.span, "-", self.unary())
        if self.check(T.NOT):
            token = self.advance()
            with self._nested(token):
                return Unary(token.span, "not", self.unary())
        return self.postfix()

    def postfix(self) -> Expression:
        expression = self.primary()
        while True:
            if self.check(T.LPAREN):
                expression = self._finish_call(expression)
            elif self.check(T.LBRACKET):
                self.advance()
                key = self.expression()
                self.consume(
                    T.RBRACKET,
                    "LZY expected a ']' to close this lookup.",
                    hint="Write it like items[0] or user[\"name\"].",
                )
                expression = Index(expression.span, expression, key)
            elif self.check(T.DOT):
                self.advance()
                name = self.consume(
                    T.IDENT,
                    "LZY expected a name after the '.'.",
                    hint='Write it like user.name, or use user["name"] for a key with '
                    "spaces in it.",
                )
                expression = Member(expression.span, expression, name.text, name.value)
            else:
                return expression

    def _finish_call(self, callee: Expression) -> Expression:
        self.advance()
        arguments: list[Expression] = []
        if not self.check(T.RPAREN):
            while True:
                arguments.append(self.expression())
                if not self.match(T.COMMA):
                    break
                if self.check(T.RPAREN):
                    break
        self.consume(
            T.RPAREN,
            "LZY expected a ')' to close this call.",
            hint="Check for a missing comma or bracket in the inputs.",
        )
        return Call(callee.span, callee, arguments)

    def primary(self) -> Expression:
        token = self.peek()

        if token.type is T.NUMBER:
            self.advance()
            return Literal(token.span, token.value)
        if token.type is T.TEXT:
            self.advance()
            return Literal(token.span, token.value)
        if token.type is T.TRUE:
            self.advance()
            return Literal(token.span, True)
        if token.type is T.FALSE:
            self.advance()
            return Literal(token.span, False)
        if token.type is T.NOTHING:
            self.advance()
            return Literal(token.span, None)
        if token.type is T.IDENT:
            self.advance()
            return Identifier(token.span, token.text, token.value)
        if token.type is T.ASK:
            self.advance()
            prompt = None
            if self.check(*_EXPRESSION_START):
                prompt = self.expression()
            return Ask(token.span, prompt)
        if token.type is T.LPAREN:
            self.advance()
            inner = self.expression()
            self.consume(
                T.RPAREN,
                "LZY expected a ')' to close this group.",
                hint="Every '(' needs a matching ')'.",
            )
            return inner
        if token.type is T.LBRACKET:
            return self.list_literal()
        if token.type is T.LBRACE:
            return self.map_literal()

        raise self._unexpected(token)

    def _unexpected(self, token: Token) -> LzySyntaxError:
        if token.type is T.SAY:
            return self.error(
                token,
                "'say' prints a value, so it cannot be used inside another expression.",
                hint="Put the 'say' on its own line.",
            )
        if token.type is T.NEWLINE:
            return self.error(
                token,
                "This line stops before it says what to do.",
                hint="It looks like a value is missing at the end of the line.",
            )
        if token.type is T.EOF:
            return self.error(
                token,
                "The file ends before this instruction is finished.",
                hint="Check for a missing bracket, quote or value at the end.",
            )
        return self.error(
            token,
            f"LZY expected a value here, but found {token.describe()}.",
            hint="A value is a number, some text, a name, a list or a map.",
        )

    def list_literal(self) -> ListLiteral:
        token = self.advance()
        items: list[Expression] = []
        if not self.check(T.RBRACKET):
            while True:
                items.append(self.expression())
                if not self.match(T.COMMA):
                    break
                if self.check(T.RBRACKET):
                    break
        self.consume(
            T.RBRACKET,
            "LZY expected a ']' to close this list.",
            hint="Separate the items with commas, like [1, 2, 3].",
        )
        return ListLiteral(token.span, items)

    def map_literal(self) -> MapLiteral:
        token = self.advance()
        entries: list[tuple[Expression, Expression]] = []
        if not self.check(T.RBRACE):
            while True:
                entries.append(self._map_entry())
                if not self.match(T.COMMA):
                    break
                if self.check(T.RBRACE):
                    break
        self.consume(
            T.RBRACE,
            "LZY expected a '}' to close this map.",
            hint='Write it like { "name": "Ada", "age": 36 }.',
        )
        return MapLiteral(token.span, entries)

    def _map_entry(self) -> tuple[Expression, Expression]:
        key_token = self.peek()
        if key_token.type is T.IDENT:
            # A bare name is shorthand for its own text: { name: x } is
            # { "name": x }. The folded spelling is used so that map shorthand
            # obeys the same case rules as the rest of the language.
            self.advance()
            key: Expression = Literal(key_token.span, key_token.value)
        else:
            key = self.expression()
        self.consume(
            T.COLON,
            "LZY expected a ':' between the key and its value.",
            hint='Write it like { "name": "Ada" }.',
        )
        return key, self.expression()


def parse(tokens: list[Token], limits: Limits | None = None) -> Program:
    """Parse ``tokens`` into a :class:`~lzy.ast.nodes.Program`."""
    return Parser(tokens, limits).parse()
