# Public API v1 contract

`formatHandle(value)` must preserve the caller's letter case because handles
are case-sensitive identifiers in API v1. Surrounding whitespace is trimmed;
blank values are rejected.
