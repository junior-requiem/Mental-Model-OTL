# HCM Groups

## What They Are

HCM Groups are the policy targeting mechanism in OTL. They identify which population of workers should inherit a given configuration.

## Why They Matter

Workers usually do not receive OTL behavior through direct one-off setup. They qualify for a group, and the group is linked to entry, processing, and sometimes device-related profiles.

## What They Commonly Drive

- Worker Time Entry Profile assignment
- Worker Time Processing Profile assignment
- Time Device Processing Profile assignment

## Mental Model

HCM Groups are the audience selector for Time and Labor.

## Common Mistakes

- Wrong population criteria
- Overlapping groups with conflicting behavior
- Forgetting to run Evaluate HCM Group Membership after changes

## Troubleshooting Questions

- Which HCM Group does the worker qualify for?
- Was membership evaluated recently?
- Is the expected entry profile assigned through that group?
- Is the expected processing profile assigned through that group?

## Source Scope

Derived from sections on HCM Groups, effective dating, and troubleshooting in `OTL-Core-Mental-Model.md`.
