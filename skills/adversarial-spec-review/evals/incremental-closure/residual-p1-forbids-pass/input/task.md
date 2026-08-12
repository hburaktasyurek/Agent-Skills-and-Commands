# Task

Disabled recovery support has one provider-request boundary: every recovery
provider request is a Stripe POST and must require a bound account. Keep
null-account local abandon provider-free, and never issue a Stripe provider
POST after the retry deadline.
