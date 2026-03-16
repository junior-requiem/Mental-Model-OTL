# Time Consumer Sets

## What They Are

Time Consumer Sets define which downstream applications consume time and how consumer-related behavior is applied.

## What They Influence

- Which consumers apply
- Consumer-specific validation context
- Approval period behavior
- Transfer behavior

## Mental Model

Time Consumer Sets are the traffic controller or routing table for processed time.

## Common Consumer Patterns

- Payroll only
- Projects only
- Projects and payroll
- External or extract-driven consumers

## Common Mistakes

- Wrong delivered set selected
- Category mismatch
- Assuming consumer set alone schedules transfer

## Related Objects

- Worker Time Processing Profile
- Time Categories
- Approvals
- Transfer statuses

## Source Scope

Derived from sections on Time Consumer Set, transfer routing, categories, approvals, and downstream integrations in `OTL-Core-Mental-Model.md`.
