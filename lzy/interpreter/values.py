"""LZY's value model: what a value is, what it is called, and how it prints.

LZY has one numeric type, ``number``. Internally it is a Python ``int`` when
the value is a whole number and a ``float`` otherwise, but that split is an
implementation detail: ``6 / 2`` and ``3`` are the same value and print the
same way. Keeping one visible numeric type removes a whole category of
beginner confusion without giving anything up at this stage of the language.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable, List, Optional, Tuple

from lzy.errors import Span

#: How deep ``show`` and ``inspect`` will walk a value before eliding the rest.
#: Prevents a self-referential structure from exhausting memory or the stack
#: while formatting output or an error message.
MAX_SHOW_DEPTH = 32

#: How deep ``equal`` will walk two values before giving up. A list or map can
#: contain itself, so comparison needs a hard floor or it would run until the
#: interpreter process died rather than raising anything LZY could report.
MAX_COMPARE_DEPTH = 100


class TooDeep(Exception):
    """Raised when a value is nested too deeply to compare.

    The interpreter turns this into an :class:`~lzy.errors.LzyLimitError` with
    a source span; it is never shown to an LZY user as-is.
    """ 


@dataclass
class Function:
    """A function written in LZY."""

    name: str
    parameters: List[Tuple[str, str]]
    body: object
    closure: object
    span: Span

    @property
    def arity(self) -> int:
        return len(self.parameters)


@dataclass
class NativeFunction:
    """A function provided by LZY itself, implemented in Python."""

    name: str
    #: Minimum and maximum argument counts. ``None`` for max means unlimited.
    min_args: int
    max_args: Optional[int]
    call: Callable
    summary: str = ""

    @property
    def arity(self) -> int:
        return self.min_args


def normalise_number(value):
    """Collapse a whole-valued float back to an int.

    LZY presents a single ``number`` type, so ``4.0`` and ``4`` must be
    indistinguishable to the user. Doing this after every arithmetic operation
    keeps that promise without a separate integer type.
    """
    if isinstance(value, float) and value.is_integer() and math.isfinite(value):
        return int(value)
    return value


def is_number(value) -> bool:
    # bool is a subclass of int in Python, so it has to be excluded explicitly.
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def is_truth(value) -> bool:
    return isinstance(value, bool)


def type_name(value) -> str:
    """The one-word name of a value's type, as the ``type`` builtin returns."""
    if value is None:
        return "nothing"
    if is_truth(value):
        return "truth"
    if is_number(value):
        return "number"
    if isinstance(value, str):
        return "text"
    if isinstance(value, list):
        return "list"
    if isinstance(value, dict):
        return "map"
    if isinstance(value, (Function, NativeFunction)):
        return "function"
    return "unknown"


def describe(value) -> str:
    """How an error message should refer to a value's type."""
    return {
        "nothing": "nothing",
        "truth": "a yes/no value",
        "number": "a number",
        "text": "some text",
        "list": "a list",
        "map": "a map",
        "function": "a function",
    }.get(type_name(value), "an unknown kind of value")


def describe_type_name(name: str) -> str:
    """Same as :func:`describe` but starting from a type name."""
    return {
        "nothing": "nothing",
        "truth": "a yes/no value",
        "number": "a number",
        "text": "some text",
        "list": "a list",
        "map": "a map",
        "function": "a function",
    }.get(name, "an unknown kind of value")


def format_number(value) -> str:
    if isinstance(value, int):
        return str(value)
    if math.isnan(value):
        return "not a number"
    if math.isinf(value):
        return "infinity" if value > 0 else "-infinity"
    if value.is_integer():
        return str(int(value))
    return repr(value)


def show(value, _depth: int = 0) -> str:
    """Render a value the way ``say`` prints it: text appears without quotes."""
    if isinstance(value, str):
        return value
    return inspect(value, _depth)


def inspect(value, _depth: int = 0) -> str:
    """Render a value the way it appears inside a list or map: text is quoted."""
    if _depth > MAX_SHOW_DEPTH:
        return "..."

    if value is None:
        return "nothing"
    if is_truth(value):
        return "true" if value else "false"
    if is_number(value):
        return format_number(value)
    if isinstance(value, str):
        return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'
    if isinstance(value, list):
        inner = ", ".join(inspect(item, _depth + 1) for item in value)
        return "[" + inner + "]"
    if isinstance(value, dict):
        if not value:
            return "{}"
        inner = ", ".join(
            f"{inspect(key, _depth + 1)}: {inspect(item, _depth + 1)}"
            for key, item in value.items()
        )
        return "{ " + inner + " }"
    if isinstance(value, Function):
        return f"<function {value.name}>"
    if isinstance(value, NativeFunction):
        return f"<built-in function {value.name}>"
    return f"<{type(value).__name__}>"


def equal(left, right, _depth: int = 0) -> bool:
    """Value equality. Different types are never equal, and never an error.

    Raises :class:`TooDeep` if the values nest further than
    :data:`MAX_COMPARE_DEPTH`, which is how a list that contains itself is
    kept from taking the interpreter down with it.
    """
    if is_truth(left) or is_truth(right):
        return is_truth(left) and is_truth(right) and left is right
    if is_number(left) and is_number(right):
        return left == right
    if type_name(left) != type_name(right):
        return False

    if isinstance(left, (list, dict)):
        if left is right:
            # Identity short-circuit: the same object is equal to itself, and
            # this makes the common self-referential case cheap.
            return True
        if _depth >= MAX_COMPARE_DEPTH:
            raise TooDeep()

    if isinstance(left, list):
        return len(left) == len(right) and all(
            equal(a, b, _depth + 1) for a, b in zip(left, right)
        )
    if isinstance(left, dict):
        if len(left) != len(right):
            return False
        return all(
            key in right and equal(item, right[key], _depth + 1)
            for key, item in left.items()
        )
    if isinstance(left, (Function, NativeFunction)):
        return left is right
    return left == right


def is_hashable_key(value) -> bool:
    """Whether a value may be used as a map key."""
    return isinstance(value, str) or is_number(value) or is_truth(value)
