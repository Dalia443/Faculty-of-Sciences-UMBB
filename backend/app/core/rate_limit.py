"""Limiteur de fréquence simple, en mémoire (suffisant pour un seul processus).

Protège la connexion (force brute) et le formulaire de contact (spam).
Pour plusieurs serveurs en parallèle, il faudrait un stockage partagé (Redis).
"""
import threading
import time
from collections import defaultdict, deque

from app.core.errors import AppError


class RateLimiter:
    def __init__(self, max_events: int, window_seconds: int):
        self.max_events = max_events
        self.window = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def _purge(self, key: str, now: float) -> deque[float]:
        q = self._events[key]
        while q and now - q[0] > self.window:
            q.popleft()
        return q

    def is_blocked(self, key: str) -> bool:
        with self._lock:
            return len(self._purge(key, time.monotonic())) >= self.max_events

    def record(self, key: str) -> None:
        with self._lock:
            now = time.monotonic()
            self._purge(key, now).append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._events.pop(key, None)

    def clear_all(self) -> None:
        with self._lock:
            self._events.clear()

    def raise_if_blocked(self, key: str, message: str) -> None:
        if self.is_blocked(key):
            raise AppError(429, message, "too_many_requests", headers={"Retry-After": str(self.window)})


# 5 échecs de connexion par (IP + e-mail) sur 15 minutes
login_limiter = RateLimiter(max_events=5, window_seconds=15 * 60)
# 5 messages de contact par IP et par heure
contact_limiter = RateLimiter(max_events=5, window_seconds=60 * 60)
