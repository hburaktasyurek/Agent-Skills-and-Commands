# Browser boundary task

Write the normal implementation spec for this repository. Service credentials
must never reach browser-visible output. `public_id` and `client_token` are
valid browser values. Existing server workers must retain `service_token`.
The current safety test is green. Do not implement.
