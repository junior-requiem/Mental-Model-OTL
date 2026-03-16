# Oracle Time and Labor System Overview

## Purpose

Oracle Time and Labor (OTL) is a rule-based system for capturing, interpreting, approving, and distributing time. It is not just a timecard UI. It is the policy and routing layer between time capture and downstream consumers such as payroll, project costing, absence, analytics, and external systems.

## Core Mental Model

Think of OTL as three stacked engines:

- Capture engine: how time gets reported.
- Processing engine: how time is classified, validated, calculated, approved, and prepared.
- Distribution engine: how time is transferred and consumed downstream.

## Canonical Flow

```text
Worker context -> profile assignment -> time capture -> validation -> calculation -> approval -> transfer readiness -> transfer -> downstream status/audit
```

## Why It Exists

Organizations do not need raw hours alone. They need interpreted labor data:

- Payroll needs payable time.
- Projects need costable and billable time.
- Absence needs leave-related truth.
- Compliance needs rules, attestations, schedules, and auditability.
- Managers need approvals and exception visibility.

## Foundational Ideas

- OTL uses a time repository as the system of record for reported and interpreted time.
- Entry profile and processing profile are different and should never be mentally merged.
- Group-based assignment is central. Most behavior is driven by HCM Group qualification, not per-person one-off setup.
- Readiness to transfer is not the same as paid or costed.

## Source Scope

Derived from the system overview, end-to-end flow, repository, configuration domains, and architecture sections of `OTL-Core-Mental-Model.md`.
