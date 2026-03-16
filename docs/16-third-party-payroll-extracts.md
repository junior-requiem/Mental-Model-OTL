# Third-Party Payroll Extracts

## Purpose

When Oracle payroll is not the paying system, OTL often hands off time through extract-driven integration patterns.

## Main Mechanisms

- HCM Extracts
- Time Cards Ready To Transfer extracts
- Time Entries Ready To Transfer extracts
- REST status update or `statusChangeRequests` loopback

## Mental Model

OTL remains the master record for time even when another system performs payment.

## Typical Flow

```text
OTL repository -> HCM Extract -> external payroll system -> REST status update -> repository status reconciliation
```

## Common Mistakes

- No previous-transfer logic for retro changes
- No REST status loopback
- Assuming extract completion means repository status is correct

## Source Scope

Derived from sections on third-party payroll integration, HCM Extracts, repository concepts, statuses, and later gap-detail content in `OTL-Core-Mental-Model.md`.
