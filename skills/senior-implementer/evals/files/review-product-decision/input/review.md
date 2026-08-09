Result: FAIL

[P1] The response exposes a direct customer identifier.

Root family: R-CUSTOMER-EXPORT
Root cause: the current product contract requires an identifier that the newly
approved privacy constraint prohibits in browser responses.
Consequence surface: support-client contract, browser JSON response, privacy
policy, and downstream client compatibility.
Recurrence: first-seen
Evidence: `approved-spec.md` requires the full email; the current privacy
authority supplied with this review prohibits sending a full email to the
browser. It does not decide whether to remove the field or return a masked
value, and either choice changes the contracted response.
Required closure: the response and contracted client behavior must implement
one human-approved identifier policy without contradicting the privacy rule.
Proof obligations: contract fixture for the chosen response and a negative
browser-output test for the prohibited alternative.
Correction surface: task-decision-required
