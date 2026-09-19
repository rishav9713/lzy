"""Lists, maps and the built-in functions that work on them."""

from __future__ import annotations

import pytest

from tests.conftest import error, output


class TestLists:
    def test_indexing(self):
        assert output("items = [10, 20, 30]\nsay items[0], items[2]") == ["10 30"]

    def test_negative_index_counts_from_the_end(self):
        assert output("say [1, 2, 3][-1]") == ["3"]

    def test_storing_at_a_position(self):
        assert output("items = [1, 2]\nitems[0] = 9\nsay items") == ["[9, 2]"]

    def test_index_out_of_range(self):
        err = error("items = [1, 2]\nsay items[5]")
        assert "no position 5" in err.message
        assert "0 to 1" in err.hint

    def test_index_into_an_empty_list(self):
        assert "empty" in error("say [][0]").message

    def test_index_must_be_a_whole_number(self):
        assert "whole number" in error("say [1, 2][0.5]").message

    def test_text_can_be_indexed(self):
        assert output('say "hello"[1]') == ["e"]

    def test_text_cannot_be_changed_in_place(self):
        err = error('t = "abc"\nt[0] = "z"')
        assert "cannot be changed" in err.message

    def test_lists_are_shared_when_stored(self):
        assert output("a = [1]\nb = a\nappend(b, 2)\nsay a") == ["[1, 2]"]

    def test_copy_makes_a_separate_list(self):
        assert output("a = [1]\nb = copy(a)\nappend(b, 2)\nsay a, b") == ["[1] [1, 2]"]

    def test_nested_lists(self):
        assert output("grid = [[1, 2], [3, 4]]\nsay grid[1][0]") == ["3"]

    def test_assigning_into_a_nested_list(self):
        assert output("grid = [[1]]\ngrid[0][0] = 9\nsay grid") == ["[[9]]"]


class TestMaps:
    def test_lookup_by_key(self):
        assert output('m = { "a": 1 }\nsay m["a"]') == ["1"]

    def test_lookup_by_name(self):
        assert output('m = { "a": 1 }\nsay m.a') == ["1"]

    def test_adding_a_key(self):
        assert output('m = {}\nm["a"] = 1\nsay m') == ['{ "a": 1 }']

    def test_adding_a_key_by_name(self):
        assert output("m = {}\nm.a = 1\nsay m") == ['{ "a": 1 }']

    def test_missing_key_lists_what_is_there(self):
        err = error('m = { "a": 1, "b": 2 }\nsay m["c"]')
        assert "no key" in err.message
        assert '"a"' in err.hint

    def test_number_keys(self):
        assert output("m = { 1: \"one\" }\nsay m[1]") == ["one"]

    def test_a_list_cannot_be_a_key(self):
        assert "map key must be" in error("m = {}\nm[[1]] = 2").message

    def test_named_parts_need_a_map(self):
        assert "Only a map" in error("x = 5\nsay x.name").message

    def test_keys_keep_their_order(self):
        source = 'm = { "z": 1, "a": 2 }\nsay keys(m)'
        assert output(source) == ['["z", "a"]']


class TestBuiltins:
    @pytest.mark.parametrize(
        "source,expected",
        [
            ('say length("abc")', "3"),
            ("say length([1, 2])", "2"),
            ('say length({ "a": 1 })', "1"),
            ('say upper("aB")', "AB"),
            ('say lower("aB")', "ab"),
            ('say trim("  a  ")', "a"),
            ('say split("a,b", ",")', '["a", "b"]'),
            ('say split("ab", "")', '["a", "b"]'),
            ('say join(["a", "b"], "-")', "a-b"),
            ('say replace("aXa", "X", "-")', "a-a"),
            ('say starts_with("hello", "he")', "true"),
            ('say ends_with("hello", "lo")', "true"),
            ("say abs(-3)", "3"),
            ("say round(3.456, 2)", "3.46"),
            ("say round(3.5)", "4"),
            ("say floor(3.9)", "3"),
            ("say ceiling(3.1)", "4"),
            ("say sqrt(16)", "4"),
            ("say min(3, 1, 2)", "1"),
            ("say max([3, 1, 2])", "3"),
            ("say sum([1, 2, 3])", "6"),
            ("say range(3)", "[0, 1, 2]"),
            ("say range(1, 4)", "[1, 2, 3]"),
            ("say range(0, 10, 3)", "[0, 3, 6, 9]"),
            ("say sort([3, 1, 2])", "[1, 2, 3]"),
            ('say sort(["b", "a"])', '["a", "b"]'),
            ("say reverse([1, 2])", "[2, 1]"),
            ("say contains([1, 2], 2)", "true"),
            ('say contains("abc", "b")', "true"),
            ('say contains({ "a": 1 }, "a")', "true"),
            ("say find([1, 2], 2)", "1"),
            ("say find([1, 2], 9)", "nothing"),
            ('say find("abc", "c")', "2"),
            ('say number("42")', "42"),
            ('say number("3.5")', "3.5"),
            ("say text(42)", "42"),
            ("say text([1])", "[1]"),
            ('say show("a")', '"a"'),
            ('say keys({ "a": 1 })', '["a"]'),
            ('say values({ "a": 1 })', "[1]"),
        ],
    )
    def test_builtin_results(self, source, expected):
        assert output(source) == [expected]

    def test_append_adds_to_the_end(self):
        assert output("items = [1]\nappend(items, 2)\nsay items") == ["[1, 2]"]

    def test_remove_at_returns_the_item(self):
        assert output("items = [1, 2]\nsay remove_at(items, 0), items") == ["1 [2]"]

    def test_remove_key_returns_the_value(self):
        assert output('m = { "a": 1 }\nsay remove_key(m, "a"), m') == ["1 {}"]

    def test_copy_of_a_map(self):
        assert output('a = { "k": 1 }\nb = copy(a)\nb.k = 2\nsay a.k, b.k') == ["1 2"]

    def test_random_number_stays_in_range(self):
        source = "\n".join(
            [
                "ok = true",
                "for i in range(200)",
                "    n = random_number(1, 6)",
                "    if n < 1 or n > 6",
                "        ok = false",
                "say ok",
            ]
        )
        assert output(source) == ["true"]

    def test_random_number_needs_the_smaller_value_first(self):
        assert "smaller number first" in error("say random_number(6, 1)").message


class TestBuiltinErrors:
    def test_wrong_type(self):
        err = error("say upper(1)")
        assert "first input to 'upper'" in err.message
        assert "some text" in err.message

    def test_too_few_inputs(self):
        assert "needs 2 inputs" in error('say split("a")').message

    def test_too_many_inputs(self):
        assert "1 input" in error("say length([1], 2)").message

    def test_number_cannot_read_words(self):
        err = error('say number("forty")')
        assert "not something LZY can read as a number" in err.message

    def test_length_of_a_number(self):
        assert "'length' works on" in error("say length(5)").message

    def test_sort_of_a_mixed_list(self):
        assert "one kind of value" in error('say sort([1, "a"])').hint

    def test_join_needs_text_items(self):
        assert "list of text" in error("say join([1], \",\")").message

    def test_sum_needs_numbers(self):
        assert "list of numbers" in error('say sum([1, "a"])').message

    def test_sqrt_of_a_negative_number(self):
        assert "negative" in error("say sqrt(-1)").message

    def test_range_with_no_step(self):
        assert "steps of 0" in error("say range(0, 5, 0)").message

    def test_range_that_is_too_large(self):
        assert "too large" in error("say range(50000000)").message
