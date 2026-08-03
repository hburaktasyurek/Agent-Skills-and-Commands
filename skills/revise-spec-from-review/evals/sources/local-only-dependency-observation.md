# Observed failure

Captured before baseline commit `df5747f` on 2026-08-02. A recovery spec moved
an availability gate but left provider acquisition ahead of local-only paths,
so the paths remained unreachable during provider outage.
