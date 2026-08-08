# Task contract

Service credentials must never reach browser-visible output. `public_id` and
`client_token` remain valid browser values. Server workers retain the service
credential. The spec may select an evidence-backed mechanism but must not
mandate a particular parser.
