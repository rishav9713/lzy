"""Parser behaviour: structure, precedence and syntax diagnostics."""

from __future__ import annotations

import pytest

from lzy.api import compile_source
from lzy.ast.nodes import (
    Assign,
    Binary,
    Call,
    ExpressionStatement,
    For,
    FunctionDef,
    If,
    Index,
    Literal,
    Logical,
    MapLiteral,
    Member,
    Say,
    Unary,
    While,
)
from lzy.errors import LzySyntaxError
from tests.conftest import error, output


def statements(source: str):
    return compile_source(source).body.statements


def only(source: str):
    parsed = statements(source)
    assert len(parsed) == 1
    return parsed[0]


class TestStatements:
    def test_say(self):
        assert isinstance(only('say "hi"'), Say)

    def test_say_with_several_values(self):
        assert len(only("say 1, 2, 3").values) == 3

    def test_say_with_nothing_prints_a_blank_line(self):
        assert only("say").values == []

    def test_assignment(self):
        node = only("x = 1")
        assert isinstance(node, Assign)
        assert node.target.folded == "x"

    def test_index_assignment(self):
        assert isinstance(only("items[0] = 1").target, Index)

    def test_member_assignment(self):
        assert isinstance(only("user.name = 1").target, Member)

    def test_if_with_else(self):
        node = only("if true\n    say 1\nelse\n    say 2")
        assert isinstance(node, If)
        assert node.else_branch is not None

    def test_else_if_chains_into_a_nested_if(self):
        node = only("if true\n    say 1\nelse if false\n    say 2")
        assert isinstance(node.else_branch, If)

    def test_while(self):
        assert isinstance(only("while true\n    break"), While)

    def test_for(self):
        node = only("for item in [1]\n    say item")
        assert isinstance(node, For)
        assert node.folded == "item"

    def test_function(self):
        node = only("function add(a, b)\n    return a + b")
        assert isinstance(node, FunctionDef)
        assert [name for name, _ in node.parameters] == ["a", "b"]

    def test_function_with_no_parameters(self):
        assert only("function go()\n    return 1").parameters == []

    def test_expression_statement(self):
        assert isinstance(only("go()"), ExpressionStatement)


class TestExpressions:
    def test_literals(self):
        for source, value in [("1", 1), ('"a"', "a"), ("true", True), ("nothing", None)]:
            node = only(f"say {source}").values[0]
            assert isinstance(node, Literal) and node.value == value

    def test_list(self):
        assert len(only("say [1, 2, 3]").values[0].items) == 3

    def test_list_allows_a_trailing_comma(self):
        assert len(only("say [1, 2,]").values[0].items) == 2

    def test_map(self):
        node = only('say { "a": 1 }').values[0]
        assert isinstance(node, MapLiteral)

    def test_map_shorthand_key(self):
        node = only("say { name: 1 }").values[0]
        assert node.entries[0][0].value == "name"

    def test_call(self):
        assert isinstance(only("say f(1)").values[0], Call)

    def test_chained_postfix(self):
        node = only("say a.b[0](1)").values[0]
        assert isinstance(node, Call)
        assert isinstance(node.callee, Index)
        assert isinstance(node.callee.target, Member)


class TestPrecedence:
    @pytest.mark.parametrize(
        "source,expected",
        [
            ("1 + 2 * 3", 7),
            ("(1 + 2) * 3", 9),
            ("10 - 2 - 3", 5),
            ("12 / 2 / 3", 2),
            ("2 + 3 % 2", 3),
            ("-2 + 3", 1),
            ("2 * -3", -6),
            ("1 + 2 == 3", True),
            ("1 < 2 and 3 < 4", True),
            ("true or false and false", True),
            ("not true == false", True),
            ("(1 + 2) * (3 - 1)", 6),
        ],
    )
    def test_evaluation_order(self, source, expected):
        # isinstance, not a dict lookup: in Python 1 == True, so a mapping
        # keyed on booleans would also match the number 1.
        if isinstance(expected, bool):
            expected_text = "true" if expected else "false"
        else:
            expected_text = str(expected)
        assert output(f"say {source}") == [expected_text]

    def test_subtraction_is_left_associative(self):
        node = only("say 1 - 2 - 3").values[0]
        assert isinstance(node, Binary) and node.operator == "-"
        assert isinstance(node.left, Binary)

    def test_and_binds_tighter_than_or(self):
        node = only("say a or b and c").values[0]
        assert isinstance(node, Logical) and node.operator == "or"
        assert node.right.operator == "and"

    def test_unary_minus(self):
        assert isinstance(only("say -x").values[0], Unary)


class TestSyntaxErrors:
    def test_colon_after_condition(self):
        err = error("if true:\n    say 1")
        assert "does not use ':'" in err.message

    def test_single_equals_in_a_condition(self):
        err = error("x = 1\nif x = 1\n    say 1")
        assert "'=='" in err.hint

    def test_missing_indented_block(self):
        err = error("if true\nsay 1")
        assert "needs an indented block" in err.message

    def test_empty_block(self):
        err = error("if true\n\nsay 1")
        assert "needs an indented block" in err.message

    def test_unexpected_indentation(self):
        err = error("say 1\n    say 2")
        assert "nothing above it opens a block" in err.message

    def test_else_without_if(self):
        err = error("else\n    say 1")
        assert "no 'if'" in err.message

    def test_two_statements_on_one_line(self):
        assert error("say 1 say 2") is not None

    def test_assigning_to_a_call(self):
        err = error("f(1) = 2")
        assert err.suggestion == "function name(a, b)"

    def test_assigning_to_a_literal(self):
        assert error("1 = 2") is not None

    def test_missing_value_at_end_of_line(self):
        err = error("x = ")
        assert "missing" in err.hint

    def test_for_without_in(self):
        err = error("for item [1]\n    say item")
        assert "'in'" in err.message

    def test_function_without_brackets(self):
        err = error("function add\n    return 1")
        assert "brackets" in err.message

    @pytest.mark.parametrize(
        "source,expected",
        [
            ("elif true\n    say 1", "else if"),
            ("def f()\n    return 1", "function"),
            ("foreach x in [1]\n    say x", "for"),
        ],
    )
    def test_words_from_other_languages(self, source, expected):
        err = error(source)
        assert expected in (err.suggestion or "") or expected in err.hint

    def test_say_inside_an_expression(self):
        err = error("x = say 1")
        assert "own line" in err.hint


class TestNesting:
    def test_deeply_nested_brackets_are_refused_cleanly(self):
        source = "say " + "(" * 500 + "1" + ")" * 500
        err = error(source)
        assert isinstance(err, LzySyntaxError)
        assert "brackets" in err.message or "deeply" in err.message

    def test_deeply_nested_blocks_are_refused_cleanly(self):
        lines = []
        for depth in range(200):
            lines.append("    " * depth + "if true")
        lines.append("    " * 200 + "say 1")
        err = error("\n".join(lines))
        assert isinstance(err, LzySyntaxError)
        assert "deeply" in err.message

    def test_long_chain_of_operators_is_handled(self):
        # Parsing this is a loop, but the tree it builds is 2000 levels deep
        # and evaluating it recurses once per level. See tests/regression,
        # fixed bug 007: an earlier version of this comment claimed the whole
        # thing was flat, and a 1 MB Windows stack proved otherwise.
        source = "say " + " + ".join(["1"] * 2000)
        assert output(source) == ["2000"]

    def test_an_absurdly_long_chain_is_refused_rather_than_crashing(self):
        source = "say " + " + ".join(["1"] * 8000)
        err = error(source)
        assert isinstance(err, LzySyntaxError)
        assert "nests too deeply" in err.message
        assert "5,000" in err.hint

    def test_the_depth_limit_counts_nesting_not_program_length(self):
        # 5000 statements in a row is shallow, and must stay allowed.
        program = "\n".join(["say 1"] * 5000)
        assert output(program) == ["1"] * 5000
