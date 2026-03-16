# Worker Time Entry Profiles

## What They Control

Worker Time Entry Profiles define the capture contract for a worker population.

They govern:

- Allowed entry methods
- Layout experience
- Time card, calendar, and Web Clock behavior
- Attestation linkage
- User-facing interaction style

## Mental Model

This is the front-door policy pack for time capture.

## What It Does Not Control

It does not control the core rule, consumer, approval-period, or transfer behavior after entry. That belongs to the Worker Time Processing Profile.

## Common Mistakes

- Wrong entry method enabled for a worker population
- Layout set mismatched to business use case
- Required fields missing from the user experience

## Related Objects

- HCM Groups
- Layout Sets
- Time Card Fields
- Time Attributes
- Time Attestation Sets

## Source Scope

Derived from sections on Worker Time Entry Profile, layouts, attestations, Web Clock, and troubleshooting in `OTL-Core-Mental-Model.md`.
