"""Case-insensitivity is a defining LZY feature, so it gets its own suite.

These tests pin down the rules written in SPEC.md section "Names and case":
folding is Unicode NFKC + full case fold, it applies to every kind of name,
and the spelling the user wrote is preserved for diagnostics.
"""

from __future__ import annotations

import pytest

from lzy.lexer.tokens import fold
from tests.conftest import error, output


class TestFolding:
    @pytest.mark.parametrize(
        "left,right",
        [
            ("name", "NAME"),
            ("Name", "nAmE"),
            ("TOTAL", "total"),
            ("my_var", "MY_VAR"),
            ("café", "CAFÉ"),
            ("ÄPFEL", "äpfel"),
        ],
    )
    def test_names_that_must_match(self, left, right):
        assert fold(left) == fold(right)

    @pytest.mark.parametrize("left,right", [("name", "names"), ("a", "b")])
    def test_names_that_must_not_match(self, left, right):
        assert fold(left) != fold(right)

    def test_full_case_fold_not_just_lowercase(self):
        # Documented consequence: the German sharp s folds to "ss".
        assert fold("straße") == fold("STRASSE")

    def test_nfkc_normalisation(self):
        # Composed and decomposed forms of the same letter are one name.
        assert fold("é") == fold("é")


class TestKeywords:
    @pytest.mark.parametrize("word", ["say", "SAY", "Say", "SaY", "sAY"])
    def test_say_in_any_case(self, word):
        assert output(f'{word} "hello"') == ["hello"]

    def test_every_keyword_in_upper_case(self):
        source = "\n".join(
            [
                "FUNCTION double(N)",
                "    RETURN n * 2",
                "items = [1, 2, 3]",
                "TOTAL = 0",
                "FOR item IN items",
                "    IF item == 2",
                "        CONTINUE",
                "    ELSE",
                "        total = total + double(item)",
                "WHILE FALSE",
                "    BREAK",
                "SAY total",
                "SAY NOT TRUE AND FALSE OR TRUE",
                "SAY NOTHING",
            ]
        )
        assert output(source) == ["8", "true", "nothing"]


class TestNames:
    def test_variables(self):
        assert output('Name = "Ada"\nsay NAME') == ["Ada"]

    def test_functions(self):
        source = "function Greet(who)\n    return \"hi \" + who\nsay GREET(\"ada\")"
        assert output(source) == ["hi ada"]

    def test_parameters(self):
        source = "function add(Left, Right)\n    return LEFT + right\nsay add(2, 3)"
        assert output(source) == ["5"]

    def test_loop_variable(self):
        assert output("for Item in [1, 2]\n    say ITEM") == ["1", "2"]

    def test_builtins(self):
        assert output("say LENGTH([1, 2, 3])") == ["3"]
        assert output('say Upper("abc")') == ["ABC"]

    def test_duplicate_parameters_differing_only_in_case_are_rejected(self):
        message = error("function f(total, TOTAL)\n    return 1").message
        assert "listed twice" in message


class TestSpellingIsPreserved:
    def test_error_echoes_the_users_own_spelling(self):
        assert "'MyVariable'" in error("say MyVariable").message

    def test_suggestion_uses_the_spelling_that_was_defined(self):
        err = error('Total = 1\nsay Totl')
        assert err.suggestion == "Total"

    def test_first_spelling_wins_for_diagnostics(self):
        # The name is defined as "Score" then reassigned as "SCORE"; the
        # original spelling is what tooling should show.
        err = error("Score = 1\nSCORE = 2\nsay Scor")
        assert err.suggestion == "Score"


class TestMapKeysAreData:
    """Map keys hold data, so they are matched exactly before folding."""

    def test_exact_key_wins(self):
        source = 'm = { "Name": "exact", "name": "folded" }\nsay m.Name'
        assert output(source) == ["exact"]

    def test_folded_fallback_when_there_is_one_match(self):
        source = 'm = { "Name": "only" }\nsay m.name'
        assert output(source) == ["only"]

    def test_ambiguous_fallback_is_an_error_not_a_guess(self):
        source = 'm = { "NAME": 1, "Name": 2 }\nsay m.nAmE'
        err = error(source)
        assert "more than one key" in err.message

    def test_square_brackets_are_always_exact(self):
        source = 'm = { "Name": 1 }\nsay m["name"]'
        assert "no key" in error(source).message
