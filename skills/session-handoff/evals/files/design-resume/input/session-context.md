# Current conversation snapshot

The user decided: "Use SQLite, not Redis, because the offline CLI must work
without a separately running service."

The event record schema discussed in this session is:
`event_id`, `aggregate_id`, `kind`, `payload_json`, `created_at`.

The conversation noticed encryption-key rotation but did not decide whether old
rows are re-encrypted eagerly or read with versioned keys. The next design work
is to resolve that choice before writing a spec.
