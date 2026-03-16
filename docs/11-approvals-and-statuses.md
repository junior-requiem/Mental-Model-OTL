# Approvals and Statuses

## Approval Model

Approval is the governance layer that determines who must authorize time before it moves downstream.

## Approval Behavior

Depending on the configuration and consumer:

- approvals may occur at time card level
- approvals may occur at entry level
- routing may target line managers, project approvers, or fallback approvers

## Statuses

Statuses express lifecycle state in the repository.

Typical status concepts include:

- Saved
- Submitted
- Approved
- Rejected
- Transferred

## Mental Model

Approvals answer who must say yes. Statuses answer where this time is in the lifecycle.

## Common Mistakes

- Thinking submitted means ready for transfer
- Assuming approvals are always manager-only
- Ignoring repository status during troubleshooting

## Source Scope

Derived from sections on Approval model, Statuses, Transfer, and repository concepts in `OTL-Core-Mental-Model.md`.
