# Traffic log

Collected automatically every Monday by `.github/workflows/metrics.yml`.
GitHub's traffic API only exposes a rolling 14-day window, so this file is the only
long-term record.

**Views/clones are 14-day totals**, not weekly deltas — compare stars and referrers
across rows to see what a post actually did.

`n/a` means the traffic columns were not measured, which is not the same as zero.
GitHub's traffic API needs admin rights that the built-in `GITHUB_TOKEN` cannot be
given, so those columns are only filled once a `METRICS_TOKEN` secret exists (a personal
access token with `repo` scope). Stars and forks are recorded either way.

| Date | Stars | Forks | Views (14d) | Uniques | Clones | Referrers |
|---|---|---|---|---|---|---|
| 2026-08-23 | 0 | 0 | 0 | 0 | 0 | — |

The first row is the baseline: the repository had never been visited. Anything above zero
in later rows came from somewhere — the referrer column says where.
