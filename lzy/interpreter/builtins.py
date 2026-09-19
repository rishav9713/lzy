"""The built-in functions that are always available in an LZY program.

These are deliberately few. Anything that touches the outside world (files,
network, processes) belongs in the standard library, where it can be given a
proper security review, explicit opt-in and its own documentation. Everything
here is pure computation plus one source of randomness, which uses the
operating system's cryptographically secure generator rather than a seeded
pseudo-random one, so that a program that reaches for ``random_number`` gets a
safe answer by default.
"""

from __future__ import annotations

import math
import random as _random
from dataclasses import dataclass
from typing import Callable

from lzy.errors import LzyTypeError, LzyValueError, Span
from lzy.interpreter.values import (
    NativeFunction,
    TooDeep,
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

#: Cryptographically secure source, used for every random value LZY produces.
_secure_random = _random.SystemRandom()

#: Largest list ``range`` will build. Stops a single typo from exhausting memory.
MAX_RANGE = 10_000_000


@dataclass
class CallContext:
    """What a built-in knows about the call being made."""

    span: Span
    name: str

    def type_error(self, message: str, hint: str | None = None) -> LzyTypeError:
        return LzyTypeError(message, self.span, hint=hint)

    def value_error(self, message: str, hint: str | None = None) -> LzyValueError:
        return LzyValueError(message, self.span, hint=hint)

    def wrong_type(self, position: int, expected: str, got, hint=None) -> LzyTypeError:
        ordinal = _ORDINALS.get(position, f"{position + 1}th")
        return self.type_error(
            f"The {ordinal} input to '{self.name}' should be {expected}, "
            f"but it was {describe(got)}.",
            hint,
        )


_ORDINALS = {0: "first", 1: "second", 2: "third", 3: "fourth", 4: "fifth"}

BUILTINS: dict[str, NativeFunction] = {}


def builtin(name: str, min_args: int, max_args: int | None, summary: str) -> Callable:
    def register(function: Callable) -> Callable:
        BUILTINS[name] = NativeFunction(name, min_args, max_args, function, summary)
        return function

    return register


# ----------------------------------------------------------------------
# Argument checking helpers
# ----------------------------------------------------------------------


def _text(ctx: CallContext, args: list, index: int) -> str:
    value = args[index]
    if not isinstance(value, str):
        raise ctx.wrong_type(index, "some text", value)
    return value


def _number(ctx: CallContext, args: list, index: int):
    value = args[index]
    if not is_number(value):
        raise ctx.wrong_type(index, "a number", value)
    return value


def _whole_number(ctx: CallContext, args: list, index: int) -> int:
    value = _number(ctx, args, index)
    if isinstance(value, float):
        if not value.is_integer():
            raise ctx.value_error(
                f"The input to '{ctx.name}' should be a whole number, "
                f"but it was {format_number(value)}.",
                hint="Use round() first if you want the nearest whole number.",
            )
        value = int(value)
    return value


def _list(ctx: CallContext, args: list, index: int) -> list:
    value = args[index]
    if not isinstance(value, list):
        raise ctx.wrong_type(index, "a list", value)
    return value


def _map(ctx: CallContext, args: list, index: int) -> dict:
    value = args[index]
    if not isinstance(value, dict):
        raise ctx.wrong_type(index, "a map", value)
    return value


# ----------------------------------------------------------------------
# Values and types
# ----------------------------------------------------------------------


@builtin("type", 1, 1, "The name of a value's type, as text.")
def _type(ctx, args):
    return type_name(args[0])


@builtin("length", 1, 1, "How many characters, items or keys a value has.")
def _length(ctx, args):
    value = args[0]
    if isinstance(value, (str, list, dict)):
        return len(value)
    raise ctx.type_error(
        f"'length' works on text, a list or a map, but it was given {describe(value)}.",
        hint="Numbers and yes/no values do not have a length.",
    )


@builtin("text", 1, 1, "Turn any value into text.")
def _to_text(ctx, args):
    return show(args[0])


@builtin("number", 1, 1, "Turn text into a number.")
def _to_number(ctx, args):
    value = args[0]
    if is_number(value):
        return value
    if is_truth(value):
        raise ctx.type_error(
            "'number' cannot turn a yes/no value into a number.",
            hint="Use an if to choose the number you want.",
        )
    if not isinstance(value, str):
        raise ctx.wrong_type(0, "some text", value)
    stripped = value.strip()
    try:
        if any(ch in stripped for ch in (".", "e", "E")):
            return normalise_number(float(stripped))
        return int(stripped)
    except ValueError:
        raise ctx.value_error(
            f'"{value}" is not something LZY can read as a number.',
            hint='Text like "42" or "3.5" works; text like "forty" does not.',
        ) from None


@builtin("show", 1, 1, "How a value looks when written inside a list.")
def _show(ctx, args):
    return inspect(args[0])


# ----------------------------------------------------------------------
# Numbers
# ----------------------------------------------------------------------


@builtin("abs", 1, 1, "The size of a number, ignoring its sign.")
def _abs(ctx, args):
    return normalise_number(abs(_number(ctx, args, 0)))


@builtin("round", 1, 2, "Round a number, optionally to a number of places.")
def _round(ctx, args):
    value = _number(ctx, args, 0)
    places = _whole_number(ctx, args, 1) if len(args) > 1 else 0
    if not -100 <= places <= 100:
        raise ctx.value_error(
            "'round' can use between -100 and 100 decimal places.",
            hint=f"It was given {places}.",
        )
    return normalise_number(round(value, places))


@builtin("floor", 1, 1, "The largest whole number that is not above this one.")
def _floor(ctx, args):
    return math.floor(_number(ctx, args, 0))


@builtin("ceiling", 1, 1, "The smallest whole number that is not below this one.")
def _ceiling(ctx, args):
    return math.ceil(_number(ctx, args, 0))


@builtin("sqrt", 1, 1, "The square root of a number.")
def _sqrt(ctx, args):
    value = _number(ctx, args, 0)
    if value < 0:
        raise ctx.value_error(
            "'sqrt' cannot take the square root of a negative number.",
            hint=f"It was given {format_number(value)}.",
        )
    return normalise_number(math.sqrt(value))


@builtin("min", 1, None, "The smallest of the numbers given, or of a list.")
def _min(ctx, args):
    return _extreme(ctx, args, min)


@builtin("max", 1, None, "The largest of the numbers given, or of a list.")
def _max(ctx, args):
    return _extreme(ctx, args, max)


def _extreme(ctx, args, pick):
    values = args[0] if len(args) == 1 and isinstance(args[0], list) else args
    if not values:
        raise ctx.value_error(
            f"'{ctx.name}' needs at least one number, but the list was empty."
        )
    for index, value in enumerate(values):
        if not is_number(value):
            raise ctx.type_error(
                f"'{ctx.name}' works on numbers, but item {index + 1} was "
                f"{describe(value)}."
            )
    return pick(values)


@builtin("sum", 1, 1, "Add up all the numbers in a list.")
def _sum(ctx, args):
    values = _list(ctx, args, 0)
    total = 0
    for index, value in enumerate(values):
        if not is_number(value):
            raise ctx.type_error(
                f"'sum' works on a list of numbers, but item {index + 1} was "
                f"{describe(value)}."
            )
        total += value
    return normalise_number(total)


@builtin(
    "random_number", 2, 2, "A random whole number between two values, both included."
)
def _random_number(ctx, args):
    low = _whole_number(ctx, args, 0)
    high = _whole_number(ctx, args, 1)
    if low > high:
        raise ctx.value_error(
            "'random_number' needs the smaller number first.",
            hint=f"It was given {low} then {high}.",
        )
    return _secure_random.randint(low, high)


# ----------------------------------------------------------------------
# Text
# ----------------------------------------------------------------------


@builtin("upper", 1, 1, "The same text in capital letters.")
def _upper(ctx, args):
    return _text(ctx, args, 0).upper()


@builtin("lower", 1, 1, "The same text in small letters.")
def _lower(ctx, args):
    return _text(ctx, args, 0).lower()


@builtin("trim", 1, 1, "The same text without spaces at either end.")
def _trim(ctx, args):
    return _text(ctx, args, 0).strip()


@builtin("split", 2, 2, "Break text into a list, cutting at a separator.")
def _split(ctx, args):
    value = _text(ctx, args, 0)
    separator = _text(ctx, args, 1)
    if separator == "":
        return list(value)
    return value.split(separator)


@builtin("join", 2, 2, "Join a list of text into one piece of text.")
def _join(ctx, args):
    items = _list(ctx, args, 0)
    separator = _text(ctx, args, 1)
    for index, item in enumerate(items):
        if not isinstance(item, str):
            raise ctx.type_error(
                f"'join' works on a list of text, but item {index + 1} was "
                f"{describe(item)}.",
                hint="Use text() to turn each item into text first.",
            )
    return separator.join(items)


@builtin("replace", 3, 3, "Text with every copy of one part swapped for another.")
def _replace(ctx, args):
    return _text(ctx, args, 0).replace(_text(ctx, args, 1), _text(ctx, args, 2))


@builtin("starts_with", 2, 2, "Whether text begins with something.")
def _starts_with(ctx, args):
    return _text(ctx, args, 0).startswith(_text(ctx, args, 1))


@builtin("ends_with", 2, 2, "Whether text ends with something.")
def _ends_with(ctx, args):
    return _text(ctx, args, 0).endswith(_text(ctx, args, 1))


def _any_equal(ctx: CallContext, items: list, wanted):
    """Index of the first item equal to ``wanted``, or None.

    Comparison can hit the nesting limit when a list contains itself, so the
    limit is translated into an LZY error here rather than escaping as a
    Python exception.
    """
    for index, existing in enumerate(items):
        try:
            if equal(existing, wanted):
                return index
        except TooDeep:
            raise ctx.value_error(
                f"'{ctx.name}' could not compare these values because they are "
                "nested too deeply.",
                hint="This usually means a list or map contains itself.",
            ) from None
    return None


# ----------------------------------------------------------------------
# Lists and maps
# ----------------------------------------------------------------------


@builtin("range", 1, 3, "A list of numbers counting up to a limit.")
def _range(ctx, args):
    if len(args) == 1:
        start, stop, step = 0, _whole_number(ctx, args, 0), 1
    elif len(args) == 2:
        start, stop, step = _whole_number(ctx, args, 0), _whole_number(ctx, args, 1), 1
    else:
        start = _whole_number(ctx, args, 0)
        stop = _whole_number(ctx, args, 1)
        step = _whole_number(ctx, args, 2)
    if step == 0:
        raise ctx.value_error(
            "'range' cannot count in steps of 0.",
            hint="A step of 0 would never reach the end.",
        )
    counted = range(start, stop, step)
    if len(counted) > MAX_RANGE:
        raise ctx.value_error(
            f"'range' would make a list of {len(counted):,} numbers, which is too "
            "large.",
            hint=f"LZY builds lists of up to {MAX_RANGE:,} numbers. Use a while loop "
            "if you really need to count that far.",
        )
    return list(counted)


@builtin("append", 2, 2, "Add an item to the end of a list.")
def _append(ctx, args):
    _list(ctx, args, 0).append(args[1])
    return None


@builtin("remove_at", 2, 2, "Remove the item at a position and return it.")
def _remove_at(ctx, args):
    items = _list(ctx, args, 0)
    index = _whole_number(ctx, args, 1)
    if not items:
        raise ctx.value_error("'remove_at' cannot take anything from an empty list.")
    if not -len(items) <= index < len(items):
        raise ctx.value_error(
            f"There is no position {index} in a list of {len(items)} items.",
            hint=f"The positions run from 0 to {len(items) - 1}.",
        )
    return items.pop(index)


@builtin("contains", 2, 2, "Whether a list, map or text holds something.")
def _contains(ctx, args):
    container, item = args[0], args[1]
    if isinstance(container, list):
        return _any_equal(ctx, container, item) is not None
    if isinstance(container, dict):
        if not is_hashable_key(item):
            return False
        return item in container
    if isinstance(container, str):
        if not isinstance(item, str):
            raise ctx.type_error(
                "Looking inside text needs text to look for, but it was given "
                f"{describe(item)}."
            )
        return item in container
    raise ctx.type_error(
        "'contains' works on a list, a map or text, but it was given "
        f"{describe(container)}."
    )


@builtin("keys", 1, 1, "A list of every key in a map.")
def _keys(ctx, args):
    return list(_map(ctx, args, 0).keys())


@builtin("values", 1, 1, "A list of every value in a map.")
def _values(ctx, args):
    return list(_map(ctx, args, 0).values())


@builtin("remove_key", 2, 2, "Remove a key from a map and return its value.")
def _remove_key(ctx, args):
    target = _map(ctx, args, 0)
    key = args[1]
    if not is_hashable_key(key) or key not in target:
        raise ctx.value_error(
            f"This map has no key {inspect(key)}.",
            hint="Use contains() to check for a key before removing it.",
        )
    return target.pop(key)


@builtin("sort", 1, 1, "A new list with the items in order.")
def _sort(ctx, args):
    items = _list(ctx, args, 0)
    if not items:
        return []
    kinds = {type_name(item) for item in items}
    if kinds == {"number"}:
        return sorted(items)
    if kinds == {"text"}:
        return sorted(items)
    raise ctx.type_error(
        "'sort' works on a list of numbers or a list of text, but this list holds "
        + " and ".join(sorted(kinds))
        + ".",
        hint="Sort one kind of value at a time.",
    )


@builtin("reverse", 1, 1, "A new list with the items back to front.")
def _reverse(ctx, args):
    return list(reversed(_list(ctx, args, 0)))


@builtin("copy", 1, 1, "A separate copy of a list or map.")
def _copy(ctx, args):
    value = args[0]
    if isinstance(value, list):
        return list(value)
    if isinstance(value, dict):
        return dict(value)
    raise ctx.type_error(
        f"'copy' works on a list or a map, but it was given {describe(value)}.",
        hint="Numbers, text and yes/no values are already copied when you store them.",
    )


@builtin("find", 2, 2, "The position of an item, or nothing if it is not there.")
def _find(ctx, args):
    container, item = args[0], args[1]
    if isinstance(container, list):
        return _any_equal(ctx, container, item)
    if isinstance(container, str):
        if not isinstance(item, str):
            raise ctx.type_error(
                "Searching text needs text to search for, but it was given "
                f"{describe(item)}."
            )
        position = container.find(item)
        return None if position < 0 else position
    raise ctx.type_error(
        f"'find' works on a list or text, but it was given {describe(container)}."
    )
