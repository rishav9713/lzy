"""The LZY abstract syntax tree.

Nodes are plain dataclasses. Every node carries the :class:`~lzy.errors.Span`
it came from so that runtime errors can point back at the exact source text.
"""

from __future__ import annotations

from dataclasses import dataclass, field, fields

from lzy.errors import Span


@dataclass
class Node:
    span: Span


# ----------------------------------------------------------------------
# Expressions
# ----------------------------------------------------------------------


@dataclass
class Expression(Node):
    pass


@dataclass
class Literal(Expression):
    """A number, text, true, false or nothing written directly in the source."""

    value: object


@dataclass
class ListLiteral(Expression):
    items: list[Expression]


@dataclass
class MapLiteral(Expression):
    #: Key/value pairs in source order. Keys are expressions so that
    #: ``{ name: value }`` and ``{ "name": value }`` share one code path.
    entries: list[tuple[Expression, Expression]]


@dataclass
class Identifier(Expression):
    #: The name exactly as the user typed it, for diagnostics.
    name: str
    #: The case-folded name, used for every lookup.
    folded: str


@dataclass
class Unary(Expression):
    operator: str
    operand: Expression


@dataclass
class Binary(Expression):
    operator: str
    left: Expression
    right: Expression
    #: Span of the operator itself, so errors underline the operator.
    operator_span: Span | None = None


@dataclass
class Logical(Expression):
    """``and`` / ``or``. Separate from Binary because they short-circuit."""

    operator: str
    left: Expression
    right: Expression


@dataclass
class Call(Expression):
    callee: Expression
    arguments: list[Expression]


@dataclass
class Index(Expression):
    """``target[key]`` for lists and maps."""

    target: Expression
    key: Expression


@dataclass
class Member(Expression):
    """``target.name`` for maps."""

    target: Expression
    name: str
    folded: str


@dataclass
class Ask(Expression):
    """``ask "question"`` reads a line from the user."""

    prompt: Expression | None = None


# ----------------------------------------------------------------------
# Statements
# ----------------------------------------------------------------------


@dataclass
class Statement(Node):
    pass


@dataclass
class Block(Node):
    statements: list[Statement] = field(default_factory=list)


@dataclass
class Program(Node):
    body: Block = None


@dataclass
class Say(Statement):
    values: list[Expression]


@dataclass
class ExpressionStatement(Statement):
    expression: Expression


@dataclass
class Assign(Statement):
    """``target = value`` where target is a name, an index or a member."""

    target: Expression
    value: Expression


@dataclass
class If(Statement):
    condition: Expression
    then_branch: Block
    #: Either a Block (``else``) or a nested If (``else if``), or None.
    else_branch: Node | None = None


@dataclass
class While(Statement):
    condition: Expression
    body: Block


@dataclass
class For(Statement):
    #: Loop variable, as written and folded.
    name: str
    folded: str
    iterable: Expression
    body: Block


@dataclass
class FunctionDef(Statement):
    name: str
    folded: str
    #: Parameters as (original spelling, folded name).
    parameters: list[tuple[str, str]]
    body: Block


@dataclass
class Return(Statement):
    value: Expression | None = None


@dataclass
class Break(Statement):
    pass


@dataclass
class Continue(Statement):
    pass


# ----------------------------------------------------------------------
# Walking the tree
# ----------------------------------------------------------------------


def children(node: Node):
    """Yield the child nodes of ``node``, in source order.

    Discovered from the dataclass fields rather than listed per node type, so
    a new node type is walked correctly the day it is added instead of the day
    somebody remembers to update this function.
    """
    for slot in fields(node):
        value = getattr(node, slot.name, None)
        if isinstance(value, Node):
            yield value
        elif isinstance(value, (list, tuple)):
            for item in value:
                if isinstance(item, Node):
                    yield item
                elif isinstance(item, (list, tuple)):
                    # Map entries are (key, value) pairs.
                    for inner in item:
                        if isinstance(inner, Node):
                            yield inner


def deepest_node(root: Node):
    """Return ``(depth, node)`` for the deepest point in the tree.

    Depth is 1 for ``root`` itself. The walk is iterative on purpose: this is
    the check that stops a pathological tree from overflowing the stack, so it
    must not be able to overflow the stack itself.
    """
    deepest = 0
    found = root
    stack = [(root, 1)]
    while stack:
        node, depth = stack.pop()
        if depth > deepest:
            deepest, found = depth, node
        for child in children(node):
            stack.append((child, depth + 1))
    return deepest, found
