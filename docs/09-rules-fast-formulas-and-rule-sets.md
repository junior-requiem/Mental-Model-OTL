# Rules, Fast Formulas, and Rule Sets

## Logic Stack

```text
Fast Formula -> Rule Template -> Rule -> Rule Set -> Processing or Device Profile
```

## Fast Formula

Fast Formula provides executable logic for validations, calculations, device handling, and related processing.

## Rule Template

Rule Templates expose formula logic in a configurable administrator-friendly wrapper.

## Rule

Rules are the actual configured policy instructions that validate or derive time.

## Rule Set

Rule Sets group rules for assignment and execution context.

## Validation vs Calculation

- Time Entry Rule Sets determine whether time is allowed.
- Time Calculation Rule Sets derive business outcomes such as overtime, premiums, or splits.

## Analyze Rule Processing Details

This is the main diagnostic tool for understanding why a rule passed, failed, or derived a specific result.

## Common Mistakes

- Hard-coded formula values
- Wrong event triggers
- Wrong severity level
- Missing rule from the expected set

## Source Scope

Derived from sections on rule sets, Fast Formula, rule templates, device processing, and debugging in `OTL-Core-Mental-Model.md`.
