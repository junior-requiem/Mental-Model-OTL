# Time Attributes and Categories

## Time Attributes

Time Attributes are the dimensions carried with time. They define what the entry means.

Examples include:

- Payroll time type
- Absence type
- Project
- Task
- Costing-related details
- Custom policy attributes

## Mental Model

Attributes are the data DNA of a time entry.

## Time Categories

Time Categories are filtering and bucketing objects that identify which entries belong to which processing or transfer context.

## Why They Matter

- Rule sets can target categories
- Consumer sets can use categories
- Attestations can use categories
- Transfer logic often depends on categories

## Relationship Between Attributes and Categories

- Attributes define the meaning of each entry
- Categories group entries for policy and routing use

## Common Mistakes

- Attributes created but never exposed in fields
- Category definitions too broad or too narrow
- Mismatch between category logic and consumer/rule usage

## Source Scope

Derived from sections on Time Attributes, Time Categories, layouts, rule sets, and consumer routing in `OTL-Core-Mental-Model.md`.
