"""The combined score rules from the brief, tested directly on the pure function."""
from app.blocks.scoring.combined import PRIOR_SCORE, combined_score


def score(tmdb_avg, tmdb_votes, app_avg=None, app_votes=0):
    return combined_score(tmdb_avg, tmdb_votes, app_avg, app_votes).score


def test_few_votes_cannot_beat_many_votes():
    # Brief: 8.9 with 12 votes must not end above 8.4 with 30,000 votes
    assert score(8.9, 12) < score(8.4, 30_000)


def test_three_app_users_giving_10_do_not_change_the_order():
    # Brief: three users giving 10 must not change the order
    assert score(8.9, 12, app_avg=10, app_votes=3) < score(8.4, 30_000)


def test_no_votes_means_no_score():
    # Brief: no TMDB votes and no app votes = no combined score, "not enough information"
    result = combined_score(0, 0, None, 0)
    assert result.score is None
    assert result.votes == 0
    assert "Not enough information" in result.explanation


def test_many_votes_keep_the_real_average():
    assert abs(score(8.4, 30_000) - 8.4) < 0.1


def test_few_votes_stay_near_the_prior():
    assert abs(score(9.5, 5) - PRIOR_SCORE) < 0.1


def test_app_votes_alone_give_a_score():
    assert score(0, 0, app_avg=9, app_votes=2) > PRIOR_SCORE


def test_every_vote_counts_once():
    # 100 TMDB votes of 8 + 100 app votes of 6 is the same as 200 votes averaging 7
    assert score(8, 100, app_avg=6, app_votes=100) == score(7, 200)


def test_result_explains_itself():
    result = combined_score(8.4, 30_000, 10.0, 3)
    assert result.votes == 30_003
    assert "30,003 votes" in result.explanation
    assert "30,000 TMDB + 3 app" in result.explanation
