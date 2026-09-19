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