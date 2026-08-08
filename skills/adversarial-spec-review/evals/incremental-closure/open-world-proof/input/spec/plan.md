# Plan

Add a release scanner that inventories every direct call to `serverOptions()`
next to `echo`, JSON response, and script-localization APIs. The inventory is
normative and exhaustive. Release passes when every listed call is approved
and the scanner's fixtures are green.
