"""Name lookup for LZY.

Scoping rules, stated plainly so the specification and the code agree:

* Only a function call creates a new scope. ``if``, ``for`` and ``while``
  bodies do not, so a value stored inside a branch is still there afterwards.
* Reading a name searches the current scope, then the scopes it was defined
  inside, then the global scope.
* Storing into a name updates the nearest scope that already has that name.
  If no scope has it, it is created in the current scope.

Every name is stored under its case-folded spelling, because LZY is
case-insensitive. The spelling the user first wrote is kept alongside the
value so that diagnostics and tooling can echo their own casing back to them.
"""

from __future__ import annotations

import difflib
from typing import Dict, List, Optional, Tuple


class Environment:
    __slots__ = ("values", "parent", "label")

    def __init__(self, parent: Optional["Environment"] = None, label: str = "global") -> None:
        #: folded name -> (original spelling, value)
        self.values: Dict[str, Tuple[str, object]] = {}
        self.parent = parent
        self.label = label

    # ------------------------------------------------------------------

    def define(self, folded: str, name: str, value: object) -> None:
        """Create or replace a name in *this* scope."""
        self.values[folded] = (name, value)

    def has(self, folded: str) -> bool:
        scope: Optional[Environment] = self
        while scope is not None:
            if folded in scope.values:
                return True
            scope = scope.parent
        return False

    def get(self, folded: str):
        """Return the value bound to ``folded``.

        Raises ``KeyError`` when the name is unknown; the interpreter turns
        that into a friendly :class:`~lzy.errors.LzyNameError`.
        """
        scope: Optional[Environment] = self
        while scope is not None:
            found = scope.values.get(folded)
            if found is not None:
                return found[1]
            scope = scope.parent
        raise KeyError(folded)

    def assign(self, folded: str, name: str, value: object) -> None:
        """Store into the nearest scope that already knows this name."""
        scope: Optional[Environment] = self
        while scope is not None:
            if folded in scope.values:
                existing_name = scope.values[folded][0]
                scope.values[folded] = (existing_name, value)
                return
            scope = scope.parent
        self.define(folded, name, value)

    def original_spelling(self, folded: str) -> Optional[str]:
        scope: Optional[Environment] = self
        while scope is not None:
            found = scope.values.get(folded)
            if found is not None:
                return found[0]
            scope = scope.parent
        return None

    # ------------------------------------------------------------------

    def visible_names(self) -> List[str]:
        """Every name reachable from here, using the user's own spelling."""
        seen: Dict[str, str] = {}
        scope: Optional[Environment] = self
        while scope is not None:
            for folded, (name, _value) in scope.values.items():
                seen.setdefault(folded, name)
            scope = scope.parent
        return sorted(seen.values())

    def closest_names(self, folded: str, limit: int = 3) -> List[str]:
        """Names that look like a likely typo for ``folded``."""
        candidates = {}
        scope: Optional[Environment] = self
        while scope is not None:
            for key, (name, _value) in scope.values.items():
                candidates.setdefault(key, name)
            scope = scope.parent
        matches = difflib.get_close_matches(folded, list(candidates), n=limit, cutoff=0.7)
        return [candidates[match] for match in matches]
