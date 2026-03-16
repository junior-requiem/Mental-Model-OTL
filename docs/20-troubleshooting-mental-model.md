# Troubleshooting Mental Model

## Best Overall Approach

When OTL breaks, troubleshoot in object dependency order rather than in UI order.

## Primary Decision Path

1. Who is the worker?
2. Which HCM Group applies?
3. Which Worker Time Entry Profile applies?
4. Which layout, fields, and buttons appear?
5. Which Worker Time Processing Profile applies?
6. Which consumer set and categories apply?
7. Which validation and calculation rules fired?
8. What approval status exists?
9. What transfer or extract status exists?

## Common Symptom to Root-Cause Patterns

- User cannot see expected field -> layout or entry profile
- User can enter time but it fails policy -> rule set or attribute/category mismatch
- Time is approved but not sent -> consumer or transfer path
- Clock punches exist but no timecard is built -> device mapping or processing profile

## Source Scope

Derived from troubleshooting branches, failure-mode sections, repository/status material, and the end-to-end mental model in `OTL-Core-Mental-Model.md`.
