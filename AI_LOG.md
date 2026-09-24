# AI log

Situations where the AI suggested something wrong, or something I chose not to use, and what I did instead.

## 1. MySQL healthcheck said "ready" too early
- **AI suggested:** `mysqladmin ping -h localhost` as the Docker healthcheck.
- **Problem:** on a fresh database, MySQL first runs a temporary setup server that only listens on the local socket. `localhost` uses that socket, so the check passed before the real server was up. The api started, got `Connection refused`, and crashed.
- **What I did instead:** changed it to `-h 127.0.0.1`, which forces a network (TCP) check, the same way the api connects. Verified by wiping the database (`docker compose down -v`) and starting again.
