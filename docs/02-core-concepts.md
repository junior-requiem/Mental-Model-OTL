# Oracle Time and Labor Core Concepts

## What Makes OTL Different

OTL is a decision system for turning reported time into governed labor data.

## Core Concepts

### Time repository

The time repository is the canonical store of reported, derived, approved, and transferred time information.

### Capture vs processing vs distribution

- Capture: how time is entered
- Processing: how time is interpreted
- Distribution: where time goes

### Entry profile vs processing profile

- Worker Time Entry Profile: controls the front-door experience
- Worker Time Processing Profile: controls post-entry policy behavior

### Attributes, fields, and categories

- Time Attributes define meaning
- Time Card Fields expose that meaning in the UI
- Time Categories bucket time for rules and consumers

### Rule hierarchy

- Fast Formula
- Rule Template
- Rule
- Rule Set

### Consumer routing

Time Consumer Sets define which applications receive time and under what approval and transfer behavior.

## Useful Plain-English Glossary

- Front-door experience: Worker Time Entry Profile
- Policy brain: Worker Time Processing Profile
- Data DNA: Time Attributes
- UI wrapper: Time Card Fields
- Routing table: Time Consumer Set

## Source Scope

Derived from sections on the master mental model, repository, attributes, categories, rules, statuses, and summaries in `OTL-Core-Mental-Model.md`.
