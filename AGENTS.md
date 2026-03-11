# AGENTS.md

## Project goal
Build a highly visual interactive HTML site that teaches the Oracle Time and Labor mental model.

## Source of truth
Use the markdown files in `/docs` as the source of truth.
Do not invent Oracle configuration objects, flows, or relationships that are not supported by the docs in this repository.
When a concept is uncertain, mark it as "Needs review" in comments or placeholder text rather than hallucinating.

## Output requirements
Create a polished interactive learning site using plain HTML, CSS, and JavaScript.
Prefer a clean diagram-heavy interface.
The site should help a learner understand:
- the end-to-end OTL flow
- core setup objects
- how objects relate to one another
- downstream integrations
- troubleshooting logic

## UX expectations
Include:
- a home overview screen
- a layered architecture diagram
- a clickable object relationship map
- an end-to-end time entry lifecycle flow
- a troubleshooting decision tree
- glossary hover cards or modal definitions
- expandable sections for setup vs runtime vs downstream processing

## Content rules
Translate enterprise jargon into plain English first, then show the Oracle term.
Every major object should have:
- definition
- purpose
- where it fits in the flow
- common mistakes
- related objects

## Data structure
Create a structured JSON file in `/src/data/otl-model.json` that contains:
- objects
- relationships
- lifecycle stages
- glossary terms
- troubleshooting branches

## Technical rules
Use semantic HTML, accessible labels, and responsive layout.
Keep code modular and well-commented.
No frameworks unless explicitly needed.
If adding a dependency, explain why first.

## Build workflow
Before finalizing:
- validate links between sections
- ensure diagrams match repository docs
- flag missing content clearly
