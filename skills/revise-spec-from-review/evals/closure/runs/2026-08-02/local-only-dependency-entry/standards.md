# Standards

## Test conventions

Exercise production-path service entry, not only direct method calls on a
preconstructed service. Dependency probes must distinguish acquisition,
provider work, and durable mutation.

## Design boundary

Specify observable behavior. Do not make an existing or proposed resolver,
factory, service split, or dependency-injection pattern canonical unless the
binding task contract requires it.
