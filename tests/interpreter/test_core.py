"""Core semantics: values, operators, control flow, functions and scope."""

from __future__ import annotations

import pytest

from tests.conftest import error, output


class TestValuesAndPrinting:
    @pytest.mark.parametrize(
        "source,expected",
        [
            ("say 1", "1"),
            ("say 1.5", "1.5"),
            ("say 6 / 2", "3"),
            ("say 7 / 2", "3.5"),
            ("say -0.5", "-0.5"),
            ('say "text"', "text"),
            ("say true", "true"),
            ("say false", "false"),
            ("say nothing", "nothing"),
            ("say [1, 2]", "[1, 2]"),
            ('say ["a"]', '["a"]'),
            ("say []", "[]"),
            ('say { "a": 1 }', '{ "a": 1 }'),
            ("say {}", "{}"),
            ('say [{ "a": [1] }]', '[{ "a": [1] }]'),
        ],
    )
    def test_printing(self, source, expected):
        assert output(source) == [expected]

    def test_text_prints_without_quotes_but_nests_with_them(self):
        assert output('say "a"') == ["a"]
        assert output('say ["a"]') == ['["a"]']

    def test_say_joins_values_with_a_space(self):
        assert output('say 1, "two", true') == ["1 two true"]

    def test_say_with_no_value_prints_a_blank_line(self):
        assert output("say") == [""]

    def test_there_is_only_one_number_type(self):
        assert output("say type(1)") == ["number"]
        assert output("say type(1.5)") == ["number"]
        assert output("say 4.0 == 4") == ["true"]

    @pytest.mark.parametrize(
        "source,expected",
        [
            ("say type(1)", "number"),
            ('say type("a")', "text"),
            ("say type(true)", "truth"),
            ("say type([])", "list"),
            ("say type({})", "map"),
            ("say type(nothing)", "nothing"),
            ("say type(length)", "function"),
        ],
    )
    def test_type_names(self, source, expected):
        assert output(source) == [expected]


class TestOperators:
    @pytest.mark.parametrize(
        "source,expected",
        [
            ("say 2 + 3", "5"),
            ("say 2 - 5", "-3"),
            ("say 3 * 4", "12"),
            ("say 10 / 4", "2.5"),
            ("say 10 % 3", "1"),
            ("say -7 % 3", "2"),
            ('say "a" + "b"', "ab"),
            ("say [1] + [2]", "[1, 2]"),
        ],
    )
    def test_arithmetic(self, source, expected):
        assert output(source) == [expected]

    @pytest.mark.parametrize(
        "source,expected",
        [
            ("say 1 == 1", "true"),
            ("say 1 == 2", "false"),
            ('say "a" == "a"', "true"),
            ("say [1, 2] == [1, 2]", "true"),
            ('say { "a": 1 } == { "a": 1 }', "true"),
            ('say 1 == "1"', "false"),
            ("say true == 1", "false"),
            ("say nothing == nothing", "true"),
            ("say nothing == false", "false"),
            ("say 1 != 2", "true"),
            ("say 2 > 1", "true"),
            ('say "a" < "b"', "true"),
        ],
    )
    def test_comparison(self, source, expected):
        assert output(source) == [expected]

    def test_comparing_different_types_is_false_not_an_error(self):
        assert output('say 1 == "one"') == ["false"]

    def test_ordering_different_types_is_an_error(self):
        assert "only compare" in error('say 1 < "one"').message

    def test_and_or_short_circuit(self):
        # If `or` did not short-circuit, the undefined name would be an error.
        assert output("say true or missing_name") == ["true"]
        assert output("say false and missing_name") == ["false"]

    def test_logical_operators_need_yes_no_values(self):
        assert "yes/no" in error("say 1 and true").message

    def test_divide_by_zero(self):
        assert "divide by zero" in error("say 1 / 0").message

    def test_remainder_by_zero(self):
        assert "zero" in error("say 1 % 0").message


class TestConditions:
    def test_if_and_else(self):
        source = "if 5 > 3\n    say \"yes\"\nelse\n    say \"no\""
        assert output(source) == ["yes"]

    def test_else_branch(self):
        source = "if 1 > 3\n    say \"yes\"\nelse\n    say \"no\""
        assert output(source) == ["no"]

    def test_else_if_chain(self):
        source = "\n".join(
            [
                "function grade(n)",
                "    if n >= 90",
                "        return \"A\"",
                "    else if n >= 80",
                "        return \"B\"",
                "    else if n >= 70",
                "        return \"C\"",
                "    else",
                "        return \"F\"",
                "say grade(95), grade(85), grade(75), grade(10)",
            ]
        )
        assert output(source) == ["A B C F"]

    def test_conditions_require_a_yes_no_value(self):
        for value in ["1", "0", '""', '"x"', "[]", "nothing"]:
            assert "yes/no" in error(f"if {value}\n    say 1").message


class TestLoops:
    def test_for_over_a_list(self):
        assert output("for n in [1, 2, 3]\n    say n") == ["1", "2", "3"]

    def test_for_over_text(self):
        assert output('for c in "abc"\n    say c') == ["a", "b", "c"]

    def test_for_over_a_map_walks_the_keys(self):
        source = 'for key in { "a": 1, "b": 2 }\n    say key'
        assert output(source) == ["a", "b"]

    def test_for_over_a_range(self):
        assert output("for n in range(3)\n    say n") == ["0", "1", "2"]

    def test_for_needs_something_to_walk_through(self):
        assert "go through" in error("for n in 5\n    say n").message

    def test_while(self):
        source = "i = 0\nwhile i < 3\n    say i\n    i = i + 1"
        assert output(source) == ["0", "1", "2"]

    def test_break(self):
        source = "for n in [1, 2, 3]\n    if n == 2\n        break\n    say n"
        assert output(source) == ["1"]

    def test_continue(self):
        source = "for n in [1, 2, 3]\n    if n == 2\n        continue\n    say n"
        assert output(source) == ["1", "3"]

    def test_break_in_a_while(self):
        source = "i = 0\nwhile true\n    i = i + 1\n    if i > 2\n        break\nsay i"
        assert output(source) == ["3"]

    def test_continue_in_a_while_does_not_skip_the_condition(self):
        source = "\n".join(
            [
                "i = 0",
                "seen = 0",
                "while i < 5",
                "    i = i + 1",
                "    if i % 2 == 0",
                "        continue",
                "    seen = seen + 1",
                "say seen",
            ]
        )
        assert output(source) == ["3"]

    def test_changing_a_list_while_looping_does_not_loop_forever(self):
        source = "items = [1, 2]\nfor item in items\n    append(items, item)\nsay length(items)"
        assert output(source) == ["4"]

    def test_break_outside_a_loop(self):
        assert "outside a loop" in error("break").message

    def test_nested_loops(self):
        source = "\n".join(
            [
                "total = 0",
                "for a in [1, 2]",
                "    for b in [10, 20]",
                "        total = total + a * b",
                "say total",
            ]
        )
        assert output(source) == ["90"]

    def test_break_only_leaves_the_inner_loop(self):
        source = "\n".join(
            [
                "count = 0",
                "for a in [1, 2, 3]",
                "    for b in [1, 2, 3]",
                "        break",
                "    count = count + 1",
                "say count",
            ]
        )
        assert output(source) == ["3"]


class TestFunctions:
    def test_define_and_call(self):
        assert output("function add(a, b)\n    return a + b\nsay add(2, 3)") == ["5"]

    def test_function_with_no_return_gives_nothing(self):
        assert output("function f()\n    say 1\nsay f()") == ["1", "nothing"]

    def test_bare_return_gives_nothing(self):
        assert output("function f()\n    return\nsay f()") == ["nothing"]

    def test_recursion(self):
        source = "\n".join(
            [
                "function fact(n)",
                "    if n <= 1",
                "        return 1",
                "    return n * fact(n - 1)",
                "say fact(10)",
            ]
        )
        assert output(source) == ["3628800"]

    def test_mutual_recursion(self):
        source = "\n".join(
            [
                "function even(n)",
                "    if n == 0",
                "        return true",
                "    return odd(n - 1)",
                "function odd(n)",
                "    if n == 0",
                "        return false",
                "    return even(n - 1)",
                "say even(10), odd(7)",
            ]
        )
        assert output(source) == ["true true"]

    def test_functions_are_values(self):
        source = "\n".join(
            [
                "function double(n)",
                "    return n * 2",
                "function apply(f, v)",
                "    return f(v)",
                "say apply(double, 21)",
            ]
        )
        assert output(source) == ["42"]

    def test_closures_capture_their_scope(self):
        source = "\n".join(
            [
                "function counter()",
                "    count = 0",
                "    function step()",
                "        count = count + 1",
                "        return count",
                "    return step",
                "c = counter()",
                "say c(), c(), c()",
            ]
        )
        assert output(source) == ["1 2 3"]

    def test_two_closures_are_independent(self):
        source = "\n".join(
            [
                "function counter()",
                "    count = 0",
                "    function step()",
                "        count = count + 1",
                "        return count",
                "    return step",
                "a = counter()",
                "b = counter()",
                "say a(), a(), b()",
            ]
        )
        assert output(source) == ["1 2 1"]

    def test_wrong_number_of_inputs(self):
        err = error("function add(a, b)\n    return a + b\nsay add(1)")
        assert "2 inputs" in err.message and "1 input" in err.message

    def test_calling_something_that_is_not_a_function(self):
        assert "cannot be called" in error("x = 1\nsay x(2)").message

    def test_return_outside_a_function(self):
        assert "outside a function" in error("return 1").message


class TestScope:
    def test_blocks_do_not_create_a_new_scope(self):
        source = "if true\n    message = \"set inside\"\nsay message"
        assert output(source) == ["set inside"]

    def test_loop_variable_survives_the_loop(self):
        assert output("for n in [1, 2]\n    say n\nsay n") == ["1", "2", "2"]

    def test_functions_see_globals(self):
        assert output('name = "Ada"\nfunction f()\n    return name\nsay f()') == ["Ada"]

    def test_parameters_are_local(self):
        source = "\n".join(
            [
                "value = 1",
                "function f(value)",
                "    value = 99",
                "    return value",
                "say f(5), value",
            ]
        )
        assert output(source) == ["99 1"]

    def test_assignment_updates_the_nearest_existing_name(self):
        source = "\n".join(
            [
                "total = 0",
                "function add()",
                "    total = total + 1",
                "add()",
                "add()",
                "say total",
            ]
        )
        assert output(source) == ["2"]

    def test_a_new_name_inside_a_function_stays_local(self):
        source = "function f()\n    helper = 1\n    return helper\nsay f()\nsay helper"
        assert "has not been given a value" in error(source).message
