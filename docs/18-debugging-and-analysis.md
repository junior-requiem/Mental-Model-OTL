# Debugging and Analysis

## Recommended Debug Order

1. Confirm worker foundation.
2. Confirm HCM Group qualification.
3. Confirm Worker Time Entry Profile.
4. Confirm layouts, fields, and attributes.
5. Confirm Worker Time Processing Profile.
6. Confirm categories and consumer routing.
7. Review rule outcomes.
8. Review approval state.
9. Review transfer or extract status.

## Analyze Rule Processing Details

This is the key Oracle diagnostic tool for rule behavior.

Use it to inspect:

- formulas
- rules
- rule sets
- logs
- error outcomes
- derived time behavior

## Common Failure Modes

- wrong group assignment
- misaligned periods
- hidden or missing attribute
- category mismatch
- unexpected rule behavior
- approval bottleneck
- transfer misconception

## Source Scope

Derived from sections on Analyze Rule Processing Details, common failure modes, troubleshooting logic, and repository/status concepts in `OTL-Core-Mental-Model.md`.
