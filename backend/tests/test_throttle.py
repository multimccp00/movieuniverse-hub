from app.blocks.tmdb.throttle import SlidingWindow


class FakeClock:
    """Time that only moves when the throttle sleeps."""

    def __init__(self):
        self.now = 0.0
        self.slept = []

    def clock(self):
        return self.now

    def sleep(self, seconds):
        self.slept.append(seconds)
        self.now += seconds


def test_waits_only_when_window_is_full():
    fake = FakeClock()
    throttle = SlidingWindow(limit=3, window=10, clock=fake.clock, sleep=fake.sleep)

    for _ in range(3):
        throttle.wait_for_slot()
    assert fake.slept == []  # 3 calls fit in the window

    throttle.wait_for_slot()  # 4th call inside the same 10 s must wait
    assert fake.slept == [10]


def test_old_calls_leave_the_window():
    fake = FakeClock()
    throttle = SlidingWindow(limit=2, window=10, clock=fake.clock, sleep=fake.sleep)
    throttle.wait_for_slot()
    throttle.wait_for_slot()
    fake.now = 11  # both calls are now older than 10 s
    throttle.wait_for_slot()
    assert fake.slept == []
