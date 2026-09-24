"""Keeps us under TMDB's rate limit (40 requests per 10 seconds)."""
import threading
import time
from collections import deque


class SlidingWindow:
    """Allows at most `limit` calls in any `window` seconds; waits when full.

    clock/sleep are parameters only so the test can use a fake clock.
    """

    def __init__(self, limit, window, clock=time.monotonic, sleep=time.sleep):
        self.limit = limit
        self.window = window
        self.clock = clock
        self.sleep = sleep
        self.calls = deque()  # times of recent calls, oldest first
        # FastAPI runs normal endpoints in several threads at once: the lock
        # makes sure two threads don't both take the last free slot.
        self.lock = threading.Lock()

    def wait_for_slot(self):
        # ponytail: in-process only; several API processes would each allow 40. Use Redis if we scale out.
        with self.lock:
            now = self.clock()
            # forget calls that are older than the window
            while self.calls and now - self.calls[0] >= self.window:
                self.calls.popleft()
            if len(self.calls) >= self.limit:
                # full: wait until the oldest call leaves the window
                self.sleep(self.window - (now - self.calls[0]))
                self.calls.popleft()
                now = self.clock()
            self.calls.append(now)
