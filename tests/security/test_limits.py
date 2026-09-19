"""Hostile and malformed input must fail as an LZY error, never as a crash.

The rule this suite enforces: whatever you feed LZY, it either runs it or
reports an :class:`~lzy.errors.LzyError`. It must not raise a bare Python
exception, exhaust the C stack, or hang while formatting a value.
"""

from __future__ import annotations

import random
import string

import pytest

from lzy.api import run_source
from lzy.errors import LzyError, LzyLimitError
from lzy.runtime.limits import Limits
from tests.conftest import error, output, run


class TestRecursionLimits:
    def test_endless_recursion_is_reported_not_crashed(self):
        source = "function f(n)\n    return f(n + 1)\nsay f(0)"
        err = error(source)
        assert isinstance(err, LzyLimitError)
        assert "called itself too many times" in err.message

    def test_the_limit_is_configurable(self):
        source = "function f(n)\n    return f(n + 1)\nsay f(0)"
        err = error(source, limits=Limits().sandboxed())
        assert isinstance(err, LzyLimitError)

    def test_legitimate_deep_recursion_still_works(self):
        source = "\n".join(
            [
                "function countdown(n)",
                "    if n <= 0",
                "        return 0",
                "    return countdown(n - 1)",
                "say countdown(300)",
            ]
        )
        assert output(source) == ["0"]

    def test_mutual_recursion_is_also_limited(self):
        source = "\n".join(
            [
                "function a(n)",
                "    return b(n)",
                "function b(n)",
                "    return a(n)",
                "say a(1)",
            ]
        )
        assert isinstance(error(source), LzyLimitError)

    def test_the_python_recursion_limit_is_restored_afterwards(self):
        import sys

        before = sys.getrecursionlimit()
        run("function f(n)\n    return f(n + 1)\nsay f(0)")
        assert sys.getrecursionlimit() == before


class TestNestingLimits:
    def test_deeply_nested_brackets(self):
        depth = 5000
        err = error("say " + "(" * depth + "1" + ")" * depth)
        assert isinstance(err, LzyError)

    def test_deeply_nested_lists(self):
        depth = 5000
        err = error("say " + "[" * depth + "]" * depth)
        assert isinstance(err, LzyError)

    def test_deeply_nested_blocks(self):
        lines = ["    " * d + "if true" for d in range(500)]
        lines.append("    " * 500 + "say 1")
        assert isinstance(error("\n".join(lines)), LzyError)

    def test_deeply_nested_unary_operators(self):
        assert isinstance(error("say " + "not " * 5000 + "true"), LzyError)


class TestSizeLimits:
    def test_a_source_file_that_is_too_large(self):
        limits = Limits(max_source_characters=100)
        err = error("say 1\n" * 100, limits=limits)
        assert "too large" in err.message

    def test_output_that_is_too_large(self):
        limits = Limits(max_output_characters=50)
        source = 'text = "abcdefghij"\nfor i in range(3)\n    text = text + text\nsay text'
        err = error(source, limits=limits)
        assert isinstance(err, LzyLimitError)

    def test_range_cannot_be_used_to_exhaust_memory(self):
        assert "too large" in error("say range(999999999)").message


class TestSelfReferentialValues:
    def test_printing_a_list_that_contains_itself_terminates(self):
        source = "a = [1]\nappend(a, a)\nsay a"
        result = run(source)
        # Either it prints with an elision, or it reports a limit. It must not
        # hang or raise a Python RecursionError.
        assert result.ok or isinstance(result.error, LzyError)
        if result.ok:
            assert "..." in result.output[0]

    def test_comparing_a_list_that_contains_itself_terminates(self):
        source = "a = [1]\nappend(a, a)\nb = [1]\nappend(b, b)\nsay a == b"
        result = run(source)
        assert result.ok or isinstance(result.error, LzyError)

    def test_a_map_that_contains_itself(self):
        source = 'm = {}\nm["self"] = m\nsay m'
        result = run(source)
        assert result.ok or isinstance(result.error, LzyError)


class TestInputHandling:
    def test_ask_with_no_answer_available(self):
        err = error('name = ask "who?"')
        assert "no answer to read" in err.message

    def test_ask_reads_an_answer(self):
        assert output('name = ask "who?"\nsay name', answers=["Ada"]) == ["Ada"]

    def test_ask_never_runs_what_it_reads(self):
        # Whatever arrives on input is data, not code.
        answer = 'say "this must not run"'
        assert output("x = ask\nsay x", answers=[answer]) == [answer]


class TestFuzzing:
    """Random input must always produce a clean result or a clean LZY error."""

    ALPHABET = string.printable + "áé漢字​﻿"

    @pytest.mark.parametrize("seed", range(300))
    def test_random_text_never_crashes_lzy(self, seed):
        rng = random.Random(seed)
        length = rng.randint(0, 120)
        source = "".join(rng.choice(self.ALPHABET) for _ in range(length))
        try:
            result = run_source(source, "<fuzz>", read_line=lambda prompt: "")
        except LzyError:
            return
        except RecursionError:  # pragma: no cover - a real failure if hit
            pytest.fail(f"RecursionError escaped for seed {seed}: {source!r}")
        except Exception as exception:  # pragma: no cover - a real failure if hit
            pytest.fail(
                f"{type(exception).__name__} escaped for seed {seed}: "
                f"{source!r} -> {exception}"
            )
        assert result.ok or isinstance(result.error, LzyError)

    @pytest.mark.parametrize("seed", range(120))
    def test_random_token_soup_never_crashes_lzy(self, seed):
        pieces = [
            "say", "if", "else", "for", "in", "while", "function", "return",
            "break", "continue", "true", "false", "nothing", "and", "or", "not",
            "ask", "x", "1", '"t"', "(", ")", "[", "]", "{", "}", ",", ":", ".",
            "=", "==", "+", "-", "*", "/", "%", "<", ">=", "\n", "    ", "#c\n",
        ]
        rng = random.Random(seed + 10_000)
        source = " ".join(rng.choice(pieces) for _ in range(rng.randint(1, 60)))
        try:
            result = run_source(source, "<fuzz>", read_line=lambda prompt: "")
        except LzyError:
            return
        except Exception as exception:  # pragma: no cover - a real failure if hit
            pytest.fail(
                f"{type(exception).__name__} escaped for seed {seed}: "
                f"{source!r} -> {exception}"
            )
        assert result.ok or isinstance(result.error, LzyError)


class TestSandboxProfile:
    def test_sandboxed_limits_are_tighter(self):
        strict = Limits().sandboxed()
        default = Limits()
        assert strict.max_call_depth < default.max_call_depth
        assert strict.max_source_characters < default.max_source_characters
        assert strict.max_parse_depth < default.max_parse_depth

    def test_a_normal_program_still_runs_under_the_sandbox_profile(self):
        source = "function add(a, b)\n    return a + b\nsay add(1, 2)"
        assert output(source, limits=Limits().sandboxed()) == ["3"]


class TestNoHostAccess:
    """LZY 0.0.1 has no file, network or process access at all."""

    @pytest.mark.parametrize(
        "name",
        ["open", "read_file", "write_file", "run", "exec", "eval", "system",
         "import", "require", "connect", "socket", "http", "shell"],
    )
    def test_there_is_no_way_to_reach_the_host(self, name):
        result = run(f"say {name}")
        assert not result.ok
        # Either the name does not exist, or it is a reserved word.
        assert isinstance(result.error, LzyError)
