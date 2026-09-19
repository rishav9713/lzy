"""Running LZY programs on a stack LZY controls.

The problem this solves
-----------------------

A tree-walking interpreter turns nesting in an LZY program into recursion in
Python, and Python recursion into C stack use. How much stack is available
depends on the platform, and the difference is large:

* Linux and macOS give the main thread about 8 MB.
* **Windows gives the main thread 1 MB**, which is roughly 1,000 Python frames
  on CPython 3.9 and 3.10.

``sys.setrecursionlimit`` does not change any of that. It only moves the point
at which CPython raises ``RecursionError``. Setting it above what the real
stack can hold does not buy more room — it removes the guard, so instead of a
catchable error the process dies with a fatal stack overflow.

That is exactly what happened: LZY documents ``max_call_depth = 400``, which is
several thousand Python frames, and on Windows with CPython 3.9 and 3.10 that
does not fit in 1 MB. Programs crashed the interpreter instead of reporting an
LZY error, on the one platform where the default stack is small. CPython 3.11
stopped consuming C stack for Python-to-Python calls, which is why 3.11 and
later were unaffected and why the bug was invisible in local testing.

The fix
-------

Run the program on a thread created with an explicit stack size. Then LZY's own
limits mean the same thing everywhere, and the documented limits are backed by
stack that actually exists.
"""

from __future__ import annotations

import contextlib
import threading
from typing import Callable, TypeVar

from lzy.runtime.limits import Limits

T = TypeVar("T")

#: Smallest stack a platform will accept, per ``threading.stack_size``. Asking
#: for less raises ValueError, so requests are raised to this.
MINIMUM_STACK_BYTES = 32 * 1024


def run_with_stack(work: Callable[[], T], limits: Limits) -> T:
    """Run ``work`` on a thread with ``limits.thread_stack_bytes`` of stack.

    Returns whatever ``work`` returns, and re-raises whatever it raises, in the
    calling thread — so callers cannot tell that a thread was involved, except
    that deep recursion now behaves the same on every platform.

    If the platform refuses to set a thread stack size, the work runs on the
    current thread instead. That is a smaller stack rather than a broken one,
    and LZY's depth limits still apply; it is simply the platform's ceiling
    that applies first.
    """
    try:
        wanted = max(limits.thread_stack_bytes, MINIMUM_STACK_BYTES)
        previous = threading.stack_size(wanted)
    except (ValueError, RuntimeError):
        # Some platforms do not support setting a stack size at all.
        return work()

    box: dict = {}

    def target() -> None:
        try:
            box["value"] = work()
        except BaseException as raised:  # noqa: BLE001 - re-raised below, unchanged
            box["error"] = raised

    worker = threading.Thread(target=target, name="lzy-program", daemon=True)
    try:
        worker.start()
        worker.join()
    finally:
        # Leave the process-wide default as we found it. This setting is
        # global, so an embedder's other threads must not inherit ours.
        with contextlib.suppress(ValueError, RuntimeError):
            threading.stack_size(previous)

    if "error" in box:
        raise box["error"]
    return box.get("value")
