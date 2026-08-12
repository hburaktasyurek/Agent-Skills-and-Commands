FAIL

Review mode: incremental
Review cycle: 2/3
Artifact basis: task.md; spec/shape.md at fixture revision 2
Consequence posture: high — local abandon is unavailable during provider outage

[P1] Local-only abandon still requires provider construction
Evidence: the prior revision preserved eager ProviderTransport construction.
Obligation: a never-submitted null-account abandon is constructible and invocable with zero provider construction and I/O.
Root cause: production entry constructs the provider dependency before selecting the local-only action.
Root cluster: R1 local-only-provider-entry
Consequence surface: controller construction; null-account abandon branch; provider acquisition; retry branch
Required closure: select local-only abandon before provider acquisition while provider-dependent retry fails closed.
Coverage receipt: incremental review of construction, local abandon, provider
acquisition, unavailable-provider behavior, and provider-dependent retry; R1 remained the only P0/P1.
