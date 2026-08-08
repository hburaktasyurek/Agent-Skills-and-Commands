# Grounding request

Use task-groundwork to determine whether `TransportConfig::serverOptions()`
can safely be treated as server-only before a browser-safety specification is
written. The intended outcome is that service credentials never reach a
browser while `public_id` and `client_token` remain usable there. Do not
implement anything.
