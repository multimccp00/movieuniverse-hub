"""The combined score: one 0-10 score from TMDB's votes and this app's votes.

Pure function: numbers in, numbers out. No database, no network, no interface,
so it can be tested alone and reused by anything (movie page, comparison, a future game).

The rule (a "Bayesian average", the idea IMDb uses for its Top 250):
1. Pool all votes: every vote counts once, TMDB or app.
       pooled = (tmdb_avg * tmdb_votes + app_avg * app_votes) / total_votes
2. Pretend every movie also got PRIOR_VOTES extra votes of PRIOR_SCORE, then average:
       score = (pooled * total_votes + PRIOR_SCORE * PRIOR_VOTES) / (total_votes + PRIOR_VOTES)
   Few real votes: the fake ones dominate and the score stays near PRIOR_SCORE.
   Many real votes: the fake ones stop mattering and the score is the real average.
Reasoning and worked examples: DECISIONS.md, "Combined score".
"""
from dataclasses import dataclass

PRIOR_SCORE = 6.0  # where a movie starts with no evidence: slightly above the scale's middle
PRIOR_VOTES = 1000  # how many real votes it takes to count as much as the prior


@dataclass(frozen=True)  # frozen: a result can't be changed after it's made
class CombinedScore:
    score: float | None  # None = no votes at all: not enough information
    votes: int  # total real votes the score is based on
    explanation: str


def combined_score(tmdb_avg: float, tmdb_votes: int, app_avg: float | None, app_votes: int) -> CombinedScore:
    total = tmdb_votes + app_votes
    if total == 0:
        return CombinedScore(None, 0, "Not enough information: no votes on TMDB or in this app.")

    pooled = (tmdb_avg * tmdb_votes + (app_avg or 0) * app_votes) / total
    score = (pooled * total + PRIOR_SCORE * PRIOR_VOTES) / (total + PRIOR_VOTES)

    explanation = (
        f"Based on {total:,} votes ({tmdb_votes:,} TMDB + {app_votes:,} app), every vote counting once. "
        f"Like every movie, it starts with {PRIOR_VOTES:,} imaginary votes of {PRIOR_SCORE}, "
        "so a few votes can't push it to the top."
    )
    return CombinedScore(round(score, 2), total, explanation)
