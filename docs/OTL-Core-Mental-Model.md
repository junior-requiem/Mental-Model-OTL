# Oracle Fusion Cloud Time and Labor — Complete End-to-End Mental Model

> Purpose: This document is written as an agent-readable knowledge base for building an interactive Oracle Time and Labor learning site. It is structured as a mental model first, not as a simple feature list. The goal is to explain how Oracle Time and Labor fits together end to end: what objects exist, why they exist, how they interact, how time flows through the system, and where implementations usually succeed or fail.

---

# 1) What Oracle Time and Labor *is*

Oracle Time and Labor (OTL) is Oracle Fusion Cloud HCM’s rule-based application for collecting, validating, calculating, approving, and distributing time data for workers. It supports simple and complex time reporting for permanent and contingent workers and can feed payroll, absence, project costing, compliance, analytics, and external systems.

## 1.1 Core idea

OTL is not merely a digital timecard.

It is a **time decision engine**.

A worker enters raw time. Oracle then asks:

- What kind of time is this?
- Who is allowed to report it?
- What fields must be provided with it?
- Does it violate a rule?
- Does it create overtime, premium, or another derived result?
- Does it require approval?
- Which downstream consumer should receive it?
- At what point is it ready to transfer?

That means Oracle Time and Labor is best understood as a pipeline:

```text
Time capture -> time enrichment -> validation -> calculation -> approval -> transfer -> downstream consumption
```

## 1.2 Why it exists

Organizations do not just need hours. They need **interpreted labor data**.

Examples:

- Payroll needs payable hours and pay-related attributes.
- Project Costing needs labor charged to projects, tasks, and expenditure types.
- Absence Management needs leave-related time represented consistently.
- Compliance teams need evidence of breaks, schedules, thresholds, and attestations.
- Managers need approval workflows and exception visibility.
- Finance needs auditable labor distribution.

OTL is the layer that turns “8 hours worked” into “8 regular payroll hours charged to project X, approved by the right person, consistent with the worker’s policy.”

---

# 2) The master mental model

The cleanest way to think about OTL is as **three interacting engines**.

## 2.1 Engine 1: Capture Engine

This is the user-facing side.

It answers:

- How does the worker enter time?
- Which fields are visible?
- Which buttons, layouts, and attributes appear?
- Is entry through time card, calendar, web clock, or imported device event?

Key objects here:

- Worker Time Entry Profile
- Layout Set
- Layout Components
- Time Attributes
- Time Categories
- Web Clock buttons
- Time Attestation Set
- HCM Group assignments

## 2.2 Engine 2: Processing Engine

This is the policy brain.

It answers:

- What is the worker’s time card period?
- Which time entries are subject to which rules?
- What validations run?
- What calculations derive new time?
- What approval logic and transfer timing apply?
- Should time changes be audited?

Key objects here:

- Worker Time Processing Profile
- Repeating Time Periods
- Time Consumer Set
- Time Entry Rule Set
n- Time Calculation Rule Set
- Time Categories
- Approval rules and workflow behavior
- Audit settings
- Optional overtime period

## 2.3 Engine 3: Distribution Engine

This is the integration/output side.

It answers:

- When is time ready to move?
- Which consumer gets what?
- Does it go to Payroll, Projects, Absence, extract, or external system?
- What status updates occur after transfer?

Key objects here:

- Time Consumer Sets
- Transfer processes
- HCM Extracts
- REST status updates
- Payroll integration configuration
- Project Costing integration configuration
- Device export configurations

---

# 3) The full end-to-end flow

This is the canonical lifecycle of a unit of time.

## 3.1 Stage 0: Worker context exists

Before any time can be entered, Oracle must know who the worker is and what context applies.

That context comes from foundational HCM data:

- Person
- Work relationship
- Assignment
- Legal employer
- Business unit
- Department
- Job / position
- Payroll relationship where applicable
- Project-related access where applicable
- Manager hierarchy

Time and Labor does not operate in a vacuum. It inherits structure from Core HR.

## 3.2 Stage 1: Worker gets linked to Time and Labor objects

Workers are linked to OTL behavior indirectly using:

- HCM Groups
- Worker Time Entry Profiles
- Worker Time Processing Profiles
- Time Device Processing Profiles

This linkage is a giant deal. It is the switchboard.

A worker does not “have overtime” or “have a certain layout” because someone typed it directly on the person record. Usually, the worker qualifies for an HCM Group, and that group is linked to one or more Time and Labor profiles.

That means the system is **policy-driven by grouping**, not person-by-person customization.

## 3.3 Stage 2: Worker captures time

The worker reports time using one or more mechanisms:

- Enhanced/unified time card
- Responsive/classic time card in legacy contexts
- Calendar entry
- Web Clock
- Third-party time collection device import
- Manager proxy entry on behalf of worker
- Change requests in some clock-driven scenarios

At this point, time is still raw. It may include:

- Start and stop times
- Duration
- Payroll time type
- Absence time type
- Project / task / expenditure details
- Custom attributes
- Meal / break data
- Supplemental text or attestation answers

## 3.4 Stage 3: Entry validation runs

As time is saved or submitted, entry validation rules can run.

These rules determine whether time is acceptable at a structural or policy level.

Examples:

- missing required attribute
- overlapping entries
- greater than allowed hours per day
- invalid combination of payroll and project attributes
- prohibited entry outside a valid period
- meal/break compliance check
- schedule mismatch check

Outputs can be:

- Error: block the action
- Warning: allow but notify
- Informational message

## 3.5 Stage 4: Time calculation runs

Calculation rules create **derived time**.

Examples:

- convert some regular hours into daily overtime
- create weekly overtime after a threshold
- split hours across cost segments
- calculate premium time
- allocate hours by grants or costing logic

This is where raw reported time becomes interpreted business time.

## 3.6 Stage 5: Approval logic determines who must review

Approval may occur at:

- time card level
- entry level

Consumers matter here.

Payroll approvals usually route to the line manager.
Project approvals usually try to identify the project manager and fall back to line manager if necessary.

After approval, the time data may become ready for transfer depending on the consumer configuration.

## 3.7 Stage 6: Time becomes ready to transfer

Readiness depends on:

- successful validation
- required approvals completed
- consumer configuration
- transfer timing and status logic

Ready-to-transfer status is not the same as paid or costed. It means the time repository has reached a handoff point.

## 3.8 Stage 7: Time transfers downstream

Typical destinations:

- Payroll
- Project Costing
- external payroll via extracts
- reconciliation/reporting layer

## 3.9 Stage 8: Downstream status update and audit trail

After extraction or transfer, statuses may be updated in the time repository.

This closes the loop so the system knows what data was consumed, when, and by whom.

---

# 4) The foundational concept: the time repository

A useful mental shortcut is to think of OTL as maintaining a **time repository**, which is the canonical store of time-related facts before and during transfer.

The repository is where reported time, calculated time, statuses, and attributes are interpreted and managed.

## 4.1 Why this matters

Many Oracle newcomers imagine Time and Labor as “a UI that writes directly to Payroll.” That is too skinny. The truth is fatter and more interesting.

The repository acts as the intermediary business layer where:

- raw time is stored
- calculations are applied
- rule violations are tracked
- approvals affect state
- transfer readiness is controlled
- extracted or transferred statuses can be updated

So a better mental model is:

```text
User entry -> Time repository -> Consumers
```

Not:

```text
User entry -> Payroll directly
```

---

# 5) Core configuration domains

You can divide OTL configuration into six big domains.

## 5.1 Domain A: Who the worker is

This domain is inherited from Core HR and security.

Objects include:

- person
- assignment
- manager relationship
- payroll relationship
- project eligibility context
- security profiles
- business unit / legal employer / department / position / job

These are not always built inside Time and Labor, but they heavily determine behavior.

## 5.2 Domain B: How the worker enters time

This domain determines the user experience.

Objects include:

- time entry profile
- layout set
- time card fields
- web clock buttons
- attestation sets
- custom attributes
- unified time card options

## 5.3 Domain C: How the worker’s time is processed

This domain determines policy.

Objects include:

- processing profile
- repeating time period
- overtime period
- time entry rules
- time calculation rules
- rule sets
- consumer sets
- approvals

## 5.4 Domain D: How workers are grouped

This domain determines scalable assignment.

Objects include:

- HCM Groups
- profile-to-group linking
- delivered HCM groups
- inclusion/exclusion logic

## 5.5 Domain E: How time enters from devices

This domain determines imported time behavior.

Objects include:

- time device event mappings
- mapping sets
- time device rules
- submission rules
- time device processing profile
- export data configuration

## 5.6 Domain F: Where time goes after processing

This domain determines consumer output.

Objects include:

- payroll consumer behavior
- project costing consumer behavior
- third-party payroll extracts
- transfer processes
- status updates
- reconciliation outputs

---

# 6) HCM Groups — the policy targeting mechanism

HCM Groups are one of the most important concepts in all of OTL.

## 6.1 What an HCM Group is

An HCM Group is a dynamic or defined grouping of people who share some characteristic or set of characteristics.

Examples:

- all hourly employees
- all workers in a specific payroll
- all police officers
- all faculty
- all project-enabled consultants
- all workers assigned to a specific device population

## 6.2 Why HCM Groups matter so much

They are the **targeting layer** that allows Oracle to assign behavior at scale.

Without HCM Groups, you would have to attach configurations one person at a time, which would be a maintenance swamp full of alligators.

Instead:

- the group defines who qualifies
- the profile defines what applies
- Oracle links the two

## 6.3 What gets linked through HCM Groups

HCM Groups are used to link people to:

- Worker Time Entry Profiles
- Worker Time Processing Profiles
- Time Device Processing Profiles

This means groups affect both the **front-end experience** and the **back-end policy**.

## 6.4 Implementation implication

When a worker cannot see the right layout, cannot enter a certain field, or is missing the correct processing behavior, the issue is often not “the worker record.” It is frequently one of these:

- wrong HCM Group logic
- worker not qualifying for the intended group
- profile linked to the wrong group
- effective dating mismatch
- delivered profile still taking precedence unexpectedly

---

# 7) Worker Time Entry Profile — the capture contract

A Worker Time Entry Profile defines **how a worker and manager interact with time entry**.

## 7.1 What it controls

At a high level, it controls:

- how time is reported
- how it is reviewed
- how it is submitted
- how managers act on behalf of workers

For linked individuals, it governs time cards, calendar, and Web Clock behavior.

## 7.2 Key components

A time entry profile is made up of:

- Layout Set
- optional Time Attestation Set
- HCM Group assignment link

## 7.3 Why this is important

This profile is the **capture contract** between the worker and the system.

It determines the experience the worker actually sees.

If the worker’s timecard appears with the wrong columns, wrong buttons, wrong prompts, or wrong reporting method, the time entry profile is one of the first places to inspect.

## 7.4 Mental model

Think of the time entry profile as answering:

> “When this kind of worker opens a time entry experience, what should the system look like and expect?”

---

# 8) Layout Sets — the assembled UI experience

A Layout Set is the grouping of layouts that define what appears on time entry pages and dialogs.

## 8.1 What it does

It specifies the appearance of:

- time cards
- calendars
- Web Clock pages
- shift pages
- dialog boxes

It also specifies time entry identifiers used in change audits.

## 8.2 Why it exists

Different worker populations need different entry experiences.

Examples:

- hourly payroll worker: start/stop, pay type, meal, premium triggers
- project consultant: project, task, expenditure type, billable flag
- absence-heavy office user: absence balances, leave rows, simplified worked time fields
- clock-based worker: minimal edit interface plus clock actions

Rather than one monstrous layout for everyone, Oracle lets you generate different layout sets for different groups.

## 8.3 Component anatomy

Layout Sets are built from:

- time attributes
- layout components
- time categories

In practical terms, you can think of layout sets as the “assembled screen definition.”

## 8.4 Implementation implication

A good layout set is not just visually tidy. It is a control mechanism.

A layout that omits an attribute may prevent clean downstream transfer.
A layout that includes too many attributes creates confusion and bad data.
A layout with dependent fields badly configured creates user misery of the finest bureaucratic vintage.

---

# 9) Layout Components — the pieces on the screen

Layout Components are the building blocks inside layouts.

## 9.1 What they are

They are individual UI components such as:

- time card fields
- groups of fields
- Web Clock buttons
- display structures for payroll, project, absence, and custom attributes

## 9.2 What they accomplish

They determine:

- which values the worker can enter
- which attributes are editable or visible
- which actions are available from Web Clock
- how dependent fields relate to one another

## 9.3 Why they matter architecturally

They are the bridge between data model and user interface.

The worker does not directly manipulate abstract “time repository attributes.” They see fields and controls constructed from layout components.

---

# 10) Time Attributes — the dimensions carried with time

Time attributes are one of the deepest ideas in OTL.

## 10.1 What a time attribute is

A time attribute is a piece of structured meaning attached to time.

Examples:

- payroll time type
- absence type
- project
- task
- expenditure type
- department override
- location
- labor category
- custom break reason
- grant segment

## 10.2 Why attributes matter

Hours without attributes are nearly useless in enterprise systems.

Eight hours of what?
Paid how?
Charged where?
Approved by whom?
Transferred to which consumer?
Reported under which compliance condition?

Time attributes answer those questions.

## 10.3 Delivered vs custom attributes

### Delivered attributes

Oracle provides standard attributes for common use cases such as payroll, projects, and absence.

### Custom attributes

You can create custom time attributes to store company-specific information in the time repository and add them to time cards. Dependent attributes can be linked to independent custom attributes.

This is crucial for real-world implementations where local policies or public-sector reporting needs go beyond delivered fields.

## 10.4 Mental model

Treat time attributes like the **metadata envelope** wrapped around reported time.

The duration tells you “how much.”
The attributes tell you “what that time means.”

---

# 11) Time Categories — the filtering grammar of OTL

Time Categories are reusable definitions that identify sets of time entries.

## 11.1 What they do

A time category identifies the time entries to use in:

- rules
- summaries
- analytics
- transfers
- attestations
- consumer behavior

## 11.2 Why this matters

Policies usually apply to categories of time, not to every row individually by hand.

Examples:

- all payroll entries
- all payroll and absence entries
- only project time
- only statutory overtime time
- only break events

## 11.3 Why categories are so powerful

They let Oracle reuse logic elegantly.

A single category can be referenced in:

- a validation rule
- a calculation rule set
- a consumer set
- an attestation question
- an analytical summary

Without time categories, the system would be a spaghetti pot of direct row logic.

## 11.4 Mental model

A time category is like a saved query over time data.

It does not create time by itself.
It identifies which time should be considered by some other mechanism.

---

# 12) Time Attestation Sets — the compliance questionnaire layer

Time Attestation Sets let people attest to additional information when they report time.

## 12.1 What they are for

They exist to support compliance with time policies and regulations.

Examples:

- “I took my required meal break.”
- “I had authorization to work unscheduled hours.”
- “I certify this time is accurate.”

## 12.2 How they are linked

An attestation set can be linked to a time entry profile so that people with shared compliance characteristics receive the appropriate questions.

## 12.3 Role of time categories inside attestations

Each questionnaire can be associated to a time category, which identifies which web clock events or time card entries the attestation applies to.

That means attestations can be selective rather than global.

## 12.4 Why this matters

Attestations are not mere decoration. They create a formal compliance capture layer without forcing organizations to redesign the time data model for every policy statement.

---

# 13) Worker Time Processing Profile — the policy bundle

A Worker Time Processing Profile defines how a worker’s time is processed after capture.

## 13.1 What it controls

It identifies:

- the time card period
- the time entries in scope for rules
- the validation rules to run
- the calculation rules to run
- the approval logic context
- the transfer rules and timing
- whether time changes are audited and when

## 13.2 Components

A processing profile can include:

- Repeating Time Period
- optional Overtime Period
- Time Consumer Set
- Time Entry Rule Set
- Time Calculation Rule Set
- audit settings
- HCM Group assignment link

## 13.3 Why it matters

This is the **policy bundle** for a class of workers.

If the time entry profile answers “What does the worker see?” then the processing profile answers:

> “What happens to the worker’s time after it is entered?”

## 13.4 Implementation implication

Two workers can see similar timecards but have different processing profiles.

That means similar UI does not guarantee similar outcomes.

One worker may receive overtime calculations and payroll transfer logic.
Another may be routed mostly to project costing.
A third may be clock-driven with strict validation and audit.

---

# 14) Repeating Time Periods — the calendar frame

Repeating Time Periods define the repeating periods used for time card periods and optional overtime periods.

## 14.1 Common examples

- weekly
- biweekly
- monthly
- semimonthly, depending on design

## 14.2 Why they matter

They determine:

- the boundaries of the worker’s time card
- the alignment with approval periods
- the grouping period used by some calculation and consumer logic

## 14.3 Important nuance

The approval period in the Time Consumer Set needs to match the selected time card period. Otherwise you can get errors linking groups to the profile.

That little line from Oracle documentation is not trivial. It is one of those “tiny setup truths” that can waste a weird amount of implementation time if ignored.

## 14.4 Mental model

Time periods define the **container boundaries** within which the system evaluates and groups time.

---

# 15) Overtime Period — the threshold frame

An optional overtime period can be associated in the processing context.

## 15.1 What it is for

Sometimes the period used to calculate overtime thresholds is not identical to the visible time card period.

For example, an organization may report weekly timecards but evaluate some overtime logic on a different configured period.

## 15.2 Why it matters

This separates the worker’s reporting frame from the policy engine’s threshold frame.

That is subtle, but very useful in real payroll designs.

---

# 16) Time Consumer Set — the traffic controller

Time Consumer Sets are among the most important and least intuitively named objects in OTL.

## 16.1 What a Time Consumer Set does

A time consumer set identifies:

- which time data to validate for linked individuals
- what approval period applies
- what data approval rules should use
- when validated time data should transfer

## 16.2 Why the term “consumer” matters

A consumer is a downstream recipient or interpreter of time.

Common consumers:

- Payroll
- Project Costing
- other downstream handling models

The consumer set defines the handoff behavior and scope.

## 16.3 Why it is so central

This object sits at the crossroads of:

- validation scope
- approval behavior
- transfer readiness
- downstream routing

That means the consumer set is a kind of **traffic controller** for time.

## 16.4 Example mental model

When you configure the Payroll consumer in a set, you are effectively saying:

> “These types of time matter for payroll. Validate them at these moments. Require these approval conditions. Make them eligible for transfer according to this timing.”

## 16.5 Implementation implication

When time is not transferring, not requiring approval, or unexpectedly validating the wrong data set, the consumer set is a prime suspect.

---

# 17) Time Entry Rule Set — the input gatekeeper

A Time Entry Rule Set is a collection of validation logic that evaluates entered time.

## 17.1 What it does

It enforces entry rules around the quality and permissibility of reported time.

## 17.2 Typical use cases

- max hours per day
- minimum meal duration
- no overlapping worked time
- no hours on restricted day types
- required project/task combination
- missing clock-out detection
- threshold alerts

## 17.3 Why it matters

These rules determine whether time can enter the system cleanly.

They are your first line of defense against bad data.

## 17.4 Mental model

Time entry rules ask:

> “Is this reported time acceptable?”

They do not primarily ask:

> “How should this accepted time be transformed?”

That is the job of calculation rules.

---

# 18) Time Calculation Rule Set — the interpretation engine

A Time Calculation Rule Set is a collection of calculation rules and/or nested rule sets that derive additional results from time.

## 18.1 What it does

It supports time processing policies such as:

- daily overtime
- weekly overtime
- cost allocation
- grants allocation
- premium calculations
- segmentation of time into payable categories

## 18.2 Important nuance

Oracle documentation notes that the rules in the selected calculation rule set also apply to time entries created using Web Clock events and third-party device events.

So calculation logic is not limited to manually typed timecards. The policy engine reaches imported and clock-generated data too.

## 18.3 Mental model

Calculation rules ask:

> “Given this accepted time, what else becomes true?”

For example:

- some hours become overtime
- some hours become premium
- some hours get split or allocated

---

# 19) Rule Templates, Rules, Rule Sets, and Fast Formula — the logic stack

Oracle’s rule framework is one of the meatiest parts of OTL.

## 19.1 Formula

At the base level, a Fast Formula contains the executable logic.

This is the raw logic layer.

## 19.2 Rule Template

A rule template makes a formula easier to configure and reuse. It exposes parameters and outputs in an administrator-friendly pattern.

Think of the template as the packaging around a formula.

## 19.3 Rule

A rule is a configured instance of a template.

This is where a business policy becomes concrete.

Example:

- template = “Maximum Hours Validation”
- rule = “Hourly Employees Max 12 Hours Per Day”

## 19.4 Rule Set

A rule set is a date-effective collection of rules or rule sets of the same type.

That means you can:

- group related policies
- version them over time
- assign them to worker populations through profiles

## 19.5 Why this layered model exists

Because enterprises need logic that is:

- reusable
- configurable
- effective-dated
- group-assignable
- understandable without editing every line of formula

## 19.6 Mental model

```text
Fast Formula = code logic
Rule Template = configurable wrapper
Rule = policy instance
Rule Set = policy bundle
Profile = policy assignment vehicle
HCM Group = target population
```

That stack is pure Oracle architecture poetry in its own stern, slightly overcaffeinated way.

---

# 20) Approval model — who must say yes

Approvals determine whether time can move forward for certain consumers.

## 20.1 Two broad levels

- Time card level approval
- Time entry level approval

## 20.2 Default behavior for time card approvals

The default workflow changes the time card status to Approved after all approvers approve it, making relevant time card data ready for transfer to Project Costing or Payroll. If at least one approver rejects it, the status changes to Rejected.

## 20.3 Entry-level nuance

For project time data, the workflow tries to identify the appropriate project manager and routes there first if possible; otherwise it routes to line manager.

For payroll time data, the workflow routes to the individual’s line manager, and all applicable entries for the time card period must be approved before the data is ready for transfer to Payroll.

## 20.4 Why approvals are not just bureaucracy

Approval in OTL is a state transition mechanism.

It affects:

- transfer readiness
- managerial accountability
- auditability
- exception resolution ownership

## 20.5 Mental model

Approval is the system’s answer to:

> “Can this time be treated as officially accepted business truth?”

---

# 21) Statuses — the state machine of time

Time in OTL moves through statuses as it is worked on.

## 21.1 Why statuses matter

Statuses are how Oracle tracks lifecycle state.

A time entry is not just “there” or “not there.” It may be:

- entered
- saved
- submitted
- approved
- rejected
- ready to transfer
- transferred
- changed after transfer, depending on process design

## 21.2 Why this matters for implementations

Users often ask, “Why can I see it but Payroll can’t?” or “Why is the time approved but not transferred?”

Those questions are status questions disguised as frustration.

## 21.3 Mental model

Statuses are the **workflow state labels** attached to repository time.

---

# 22) Audit — the memory of change

The processing profile can identify whether to audit time changes and when to start the audit.

## 22.1 What audit accomplishes

Audit provides traceability:

- what changed
- when it changed
- possibly who changed it depending on audit context and reporting path
- which identifiers were involved

## 22.2 Why it matters

Time and labor data is often sensitive because it feeds compensation, costing, and compliance. Audit provides confidence and forensic visibility.

---

# 23) Web Clock — event-style time capture

Web Clock is a time capture channel distinct from a manually typed duration row.

## 23.1 What it is

It lets users clock in and out and interact with configured Web Clock buttons and fields.

## 23.2 Why it matters conceptually

Web Clock is event-driven.

Instead of “I enter 8 hours,” the worker often says through actions:

- start work
- start meal
- end meal
- transfer activity
- end work

The system then interprets those events into time entries.

## 23.3 Important configuration nuance

When selected Web Clock buttons and fields have the same time attributes, Oracle stores the field value and ignores the button value. That means careless overlap in button/field design can create confusing results.

## 23.4 Mental model

Web Clock is the **event capture variant** of Time and Labor.

---

# 24) Time device processing — the bridge from physical clocks

Time collection devices feed events from external hardware or third-party collection systems.

## 24.1 Time Device Event Mapping

A mapping defines how a supplier device event becomes time card entries and attributes.

## 24.2 Mapping Set

A Time Device Event Mapping Set groups mappings for a specific supplier device and the population using that device.

Oracle warns not to include multiple mappings for the same supplier device event in a single mapping set because the import process has no logic to decide which mapping to use for each imported event.

That warning is implementation gold. It means mapping ambiguity is your problem, not Oracle’s psychic burden.

## 24.3 Time Device Processing Profile

A time device processing profile identifies:

- the application events and time attributes that form the time card entries
- how to validate those entries
- when to automatically save and submit time cards
- mapping sets
- time device rules
- a submission rule
- export data configuration

## 24.4 Why this domain exists

Clock hardware does not naturally speak “Oracle timecard business object.” It speaks events. Time device processing is the translation layer.

## 24.5 Mental model

```text
Device event -> mapping -> generated time entry -> validation/calc/submission -> repository
```

---

# 25) Enhanced / unified time cards — the modern entry experience

Oracle’s newer direction for time entry is the enhanced or unified time card experience.

## 25.1 What it supports

Depending on implementation, users can report:

- worked time, breaks, and meals for payroll processing
- absences on time cards for absence processing
- billable and nonbillable project hours for costing and billing

## 25.2 Why it matters

This matters because Oracle is trying to give a single coherent reporting surface for multiple consumers, rather than forcing separate mini-worlds for payroll, absence, and project entry.

## 25.3 Redwood direction

Oracle states that starting with Fusion Cloud Update 24A, new Time and Labor features are delivered exclusively in the Redwood experience, and customers using browser-based time cards and mobile time entry must transition according to Oracle’s rollout guidance.

## 25.4 Mental model

The unified time card is Oracle’s attempt to make the worker experience feel like **one time system with multiple meanings**, instead of three disconnected time apps stapled together.

---

# 26) Payroll integration — the payable-time consumer

Payroll is one of the most common downstream consumers of OTL.

## 26.1 What integration enables

Oracle states that integrating Global Payroll with Time and Labor lets you validate, approve, and transfer reported time to payroll for payment.

## 26.2 What payroll needs from time

Payroll generally needs:

- payable hours
- pay-related time attributes
- approval-complete data where required
- timing aligned with payroll periods
- transfer status clarity

## 26.3 Why payroll integration is not “just a connector”

This integration depends on correct setup across:

- time and labor configuration
- payroll setup
- costing setup where relevant
- approval behavior
- consumer timing

That means payroll issues are often cross-functional, not just “a payroll screen problem.”

## 26.4 Mental model

Payroll consumes time as **money-bearing labor facts**.

---

# 27) Project Costing integration — the chargeable-time consumer

Project Costing consumes time differently from Payroll.

## 27.1 What it needs

Project time usually requires:

- project
- task
- expenditure or costing attributes
- billable/nonbillable meaning where relevant
- project manager approval logic or fallback

## 27.2 Why it matters

Payroll asks, “How should this worker be paid?”
Project Costing asks, “Where should this labor be charged?”

Those are related questions, but not the same question.

## 27.3 Design implication

A single time entry may need to satisfy both payroll and project logic. That is where layout design, attribute design, categories, and consumer sets all start dancing together in a surprisingly intricate little opera.

---

# 28) Absence integration — leave as part of time truth

Absence Management can integrate with Time and Labor so absence entries can be reported on time cards.

## 28.1 What this enables

Users can report absences on time cards for absence processing in the enhanced/unified experience.

## 28.2 Why this matters

This prevents a fragmented worker experience where worked time lives in one place and leave lives in an unrelated corner of the software cave.

## 28.3 Architectural nuance

OTL is not replacing Absence Management. Rather, it provides a consolidated entry experience while absence balances, plan logic, and leave-specific governance still belong to the Absence domain.

---

# 29) Third-party payroll integration — extract-driven handoff

Not every organization uses Oracle Payroll as the final payroll processor.

## 29.1 Oracle’s extract pattern

For third-party payroll processing, Oracle documentation describes using delivered extracts such as:

- Time Cards Ready To Transfer Extracts
- Time Entries Ready To Transfer Extracts
- Time and Payroll Info for Reconciliation

Organizations can also create their own extracts using delivered HWM_EXT user entities and database items.

## 29.2 Status loopback

After transferred time is loaded into the external payroll application, the updated status for each transferred entry can be sent back to Time and Labor using the `statusChangeRequests` REST service, followed by the process that updates extracted time cards from Ready to Transfer to Transferred.

## 29.3 Why this matters

This means Oracle supports a managed export-and-status-return pattern rather than assuming Oracle Payroll is mandatory.

## 29.4 Mental model

Third-party payroll integration is:

```text
Repository -> extract -> external payroll -> status return -> repository update
```

---

# 30) Reporting and analytics — seeing what the engine did

Time and Labor data is valuable only if it can also be reviewed, analyzed, and reconciled.

## 30.1 Common reporting questions

- Which timecards are missing or late?
- Which employees have exceptions?
- How much overtime was generated?
- How much labor hit each project?
- What was transferred and what is still pending?
- Which policies generate the most violations?

## 30.2 Tools mentioned by Oracle across the ecosystem

Common reporting patterns include:

- OTBI
- BI Publisher
- HCM Extracts
- reconciliation outputs

## 30.3 Why analytics matter structurally

Analytics are not an afterthought. They are the observational layer that helps the organization verify whether capture, rules, approvals, and transfers are behaving as intended.

---

# 31) Analyze Rule Processing Details — the debugging microscope

Oracle provides the Analyze Rule Processing Details task in the Time Management work area so administrators can review formulas, rules, rule sets, processing logs, and diagnose errors.

## 31.1 Why this matters

OTL is rule-heavy. When something goes wrong, the issue is often not visible from the timecard screen alone.

You need to inspect:

- which rules fired
- which formulas were used
- what messages were generated
- where logic failed or produced unexpected results

## 31.2 Mental model

This is the **debugging microscope** for the time policy engine.

---

# 32) Security model — who can do what and see what

OTL relies on Oracle HCM security architecture.

## 32.1 Security dimensions

Security can affect:

- which workers a person can view
- which timecards a manager can act on
- whether someone can administer setup objects
- whether a worker can report, edit, submit, or request change
- whether a manager can enter time on behalf of others

## 32.2 Why security is not “just permissions”

Security shapes behavior as much as configuration does.

You can design a perfect time layout and perfect processing profile, then still fail the implementation because the wrong people cannot see or act on the data.

## 32.3 Mental model

Configuration says what *should* happen.
Security says who is allowed to make it happen or even witness it.

---

# 33) Delivered objects — Oracle’s starter scaffolding

Oracle delivers profiles, groups, and categories that can serve as initial scaffolding.

## 33.1 Why they exist

Delivered objects help customers get started without building everything from scratch.

## 33.2 Why caution is needed

Delivered does not always mean correct for your business.

They are reference scaffolds, not sacred tablets brought down from the mountain.

## 33.3 Common implementation pattern

Teams often review delivered:

- HCM Groups
- time entry profiles
- processing profiles
- categories

and then either reuse, copy, or redesign based on actual policy requirements.

---

# 34) Effective dating — time policy across time

Many Time and Labor objects are date-effective.

## 34.1 Why this matters

Policies change.
Workers change.
Rules change.
Approvals change.
Consumers change.

If a system handling labor and pay could not model policy changes over time, it would be a very expensive calendar with delusions of grandeur.

## 34.2 What effective dating allows

- future policy change without rewriting history
- phased rollouts by date
- rule versioning
- group assignment changes
- profile changes aligned with business events

## 34.3 Implementation implication

A huge amount of Time and Labor troubleshooting is really effective-date troubleshooting.

---

# 35) Typical object dependency chain

This dependency chain is one of the most useful memory devices for understanding OTL.

```text
Core HR worker context
-> HCM Group qualification
-> Time Entry Profile assignment
-> Layout Set / Attestation experience
-> Time capture
-> Time Processing Profile assignment
-> Period + Consumer Set + Rule Sets + Audit
-> Approval state
-> Transfer readiness
-> Payroll / Projects / Extract destination
```

## 35.1 Why this chain matters

It helps you troubleshoot in order.

When something goes wrong, ask:

1. Does the worker qualify for the right group?
2. Does the worker receive the right entry profile?
3. Does the layout expose the right fields?
4. Does the processing profile include the right periods, categories, and rules?
5. Does the consumer set point to the right approval/transfer behavior?
6. Is downstream integration configured and actually running?

That sequence saves a lot of random clicking and ritual despair.

---

# 36) Full node-by-node concept map

Below is a compact node map where every node is explained.

## 36.1 Worker
The human or contingent resource whose labor time is being represented.

## 36.2 Assignment
The employment context that influences eligibility, security, payroll, and policy targeting.

## 36.3 Manager
The supervisory relationship used by approvals, visibility, and delegation logic.

## 36.4 HCM Group
The grouping mechanism that decides which populations receive which Time and Labor profiles.

## 36.5 Worker Time Entry Profile
The object that defines how workers and managers report, review, and submit time.

## 36.6 Layout Set
The assembled set of layouts that determines what appears on time cards, calendars, dialogs, and Web Clock.

## 36.7 Layout Component
The individual field/button/display building block inside a layout.

## 36.8 Time Attribute
The structured meaning attached to time, such as payroll type, project, task, or custom company field.

## 36.9 Time Category
A reusable definition that identifies a set of time entries for rules, summaries, transfers, and attestations.

## 36.10 Time Attestation Set
A collection of compliance questions linked to time entry behavior.

## 36.11 Web Clock
The event-driven time entry mechanism where users clock actions instead of only typing durations.

## 36.12 Time Device Event Mapping
The translation rule that converts supplier device events into Oracle time entry meaning.

## 36.13 Time Device Event Mapping Set
The grouped set of mappings for a specific supplier device and user population.

## 36.14 Time Device Rule Set
The validation logic applied in the time device import context.

## 36.15 Submission Rule
The rule that determines how generated clock/device time cards are saved or submitted.

## 36.16 Time Device Processing Profile
The object that bundles device mappings, device rules, submission logic, and export settings for a population.

## 36.17 Worker Time Processing Profile
The object that bundles periods, consumers, rules, and audit behavior for a population.

## 36.18 Repeating Time Period
The recurring period that defines the time card boundary and often the approval frame.

## 36.19 Overtime Period
The optional recurring period used for overtime evaluation thresholds.

## 36.20 Time Entry Rule
A single validation policy that evaluates the acceptability of entered time.

## 36.21 Time Entry Rule Set
A grouped bundle of entry validation rules.

## 36.22 Time Calculation Rule
A single policy that derives additional time meaning or distribution.

## 36.23 Time Calculation Rule Set
A grouped bundle of calculation logic.

## 36.24 Fast Formula
The executable logic layer underlying rule templates and many rule behaviors.

## 36.25 Rule Template
The configurable wrapper around a formula that exposes parameters and outputs.

## 36.26 Rule
A configured business instance of a template.

## 36.27 Time Consumer Set
The object that identifies what time is validated, approved, and transferred for downstream consumers.

## 36.28 Approval Workflow
The routing logic that determines whose approval is required for time to progress.

## 36.29 Time Repository Status
The lifecycle state that describes where the time is in its processing journey.

## 36.30 Audit
The trace of changes to time data and identifiers.

## 36.31 Payroll Consumer
The downstream interpretation of time as payable labor data.

## 36.32 Project Costing Consumer
The downstream interpretation of time as chargeable project labor.

## 36.33 Absence Integration
The use of time entry experience to report leave-related time that is governed by Absence Management.

## 36.34 HCM Extract
The extract framework used to export time data, especially for third-party payroll patterns.

## 36.35 statusChangeRequests REST service
The REST mechanism used to return status updates from an external payroll process to Time and Labor.

## 36.36 Analyze Rule Processing Details
The admin analysis tool used to inspect rule execution and diagnose policy behavior.

## 36.37 Redwood Experience
Oracle’s strategic modern user experience direction for Time and Labor.

---

# 37) How to reason about any OTL feature

When learning or implementing any Time and Labor feature, ask these seven questions.

## 37.1 Capture question
How does the user or device create the time?

## 37.2 Meaning question
Which attributes give the time business meaning?

## 37.3 Scope question
Which category or consumer says this time matters for a given process?

## 37.4 Policy question
Which rules validate or transform it?

## 37.5 Assignment question
Which HCM Group and profiles make that policy apply to this worker?

## 37.6 Workflow question
Who must approve it and when is it considered ready?

## 37.7 Distribution question
Where does it go after readiness: Payroll, Projects, Absence, extract, or external system?

If your agent learns to ask those seven questions, it will stop thinking of OTL as a pile of pages and start thinking like a systems analyst.

---

# 38) Common implementation patterns

## 38.1 Payroll-only hourly workforce

Typical emphasis:

- simple layout set
- payroll attributes
- meal/break validations
- overtime calculations
- line-manager approval
- payroll transfer

## 38.2 Project-based professional services workforce

Typical emphasis:

- project/task/expenditure attributes
- billable vs nonbillable distinctions
- project manager approval
- costing and billing transfer

## 38.3 Public sector / grant environment

Typical emphasis:

- custom attributes
- grants or funding allocation logic
- stronger audit needs
- compliance attestations
- multiple consumer views of the same time

## 38.4 Clock-heavy operational workforce

Typical emphasis:

- Web Clock or device processing
- mapping sets
- submission rules
- exception handling
- schedule and meal compliance

## 38.5 Mixed population enterprise

Typical emphasis:

- several HCM Groups
- multiple entry profiles
- multiple processing profiles
- separate device strategy for some populations
- careful governance over shared categories and rules

---

# 39) Common failure modes

## 39.1 Wrong group assignment
The worker qualifies for the wrong HCM Group or does not qualify for the intended one.

## 39.2 Misaligned periods
The approval period and time card period do not align as required.

## 39.3 Missing or hidden attribute
The layout does not expose the attribute required for downstream processing.

## 39.4 Category mismatch
Rules or consumers are pointing at a time category that does not identify the intended entries.

## 39.5 Rule logic surprise
A rule or formula is technically correct but operationally not what the business expected.

## 39.6 Approval bottleneck
Time is waiting for a routing outcome the business did not realize was required.

## 39.7 Device mapping ambiguity
Multiple mappings for the same supplier device event create unpredictable outcomes.

## 39.8 Transfer misconception
Users assume approved means transferred, or saved means approved, or extracted means paid.

## 39.9 Effective date mismatch
The right setup exists, but not on the date that matters for the worker’s transaction.

---

# 40) The shortest accurate summary of OTL

If you had to compress Oracle Time and Labor into one dense paragraph:

Oracle Time and Labor is a rule-based time repository and processing framework in Oracle Fusion Cloud HCM that uses HCM Group-driven profile assignment to control how workers capture time, how time is enriched with attributes, how categories and rules validate and calculate it, how approval workflows and audit govern its lifecycle, and how consumer sets transfer it to downstream destinations such as Payroll, Project Costing, Absence-related entry experiences, and external payroll integrations.

That is the beast in one cage.

---

# 41) Best-practice mental model for an AI agent

Your agent should understand OTL using these internal abstractions.

## 41.1 Abstract object classes

### Population objects
- worker
- assignment
- manager
- HCM Group

### Capture objects
- time entry profile
- layout set
- layout component
- time attribute
- attestation
- web clock / device inputs

### Processing objects
- processing profile
- period
- category
- consumer set
- rule
- rule set
- formula
- approval
- audit

### Output objects
- payroll transfer
- project transfer
- extract
- REST status update
- analytics

## 41.2 Agent reasoning pattern

For any user question, the agent should try to classify it into one or more of these buckets:

- capture problem
- population assignment problem
- rule problem
- period problem
- approval problem
- transfer problem
- security problem
- integration problem
- effective dating problem

This classification pattern will make your site far more useful than just dumping documentation at the user like a filing cabinet falling down a staircase.

---

# 42) End-to-end architecture diagram in plain text

```text
[Core HR worker context]
    -> person / assignment / manager / org structure
    -> qualifies for [HCM Group]

[HCM Group]
    -> linked to [Worker Time Entry Profile]
    -> linked to [Worker Time Processing Profile]
    -> optionally linked to [Time Device Processing Profile]

[Worker Time Entry Profile]
    -> uses [Layout Set]
    -> uses [Layout Components]
    -> exposes [Time Attributes]
    -> may use [Time Attestation Set]
    -> supports [Time Card / Calendar / Web Clock]

[Worker enters time or device sends event]
    -> time recorded in repository with attributes

[Worker Time Processing Profile]
    -> defines [Repeating Time Period]
    -> defines optional [Overtime Period]
    -> links [Time Consumer Set]
    -> links [Time Entry Rule Set]
    -> links [Time Calculation Rule Set]
    -> controls [Audit]

[Time Entry Rules]
    -> validate acceptability

[Time Calculation Rules]
    -> derive overtime / premium / allocation / other results

[Approval Workflow]
    -> line manager / project manager / other path
    -> status becomes approved or rejected

[Ready to Transfer state]
    -> payroll consumer
    -> project consumer
    -> extract consumer

[Downstream systems]
    -> Payroll
    -> Project Costing
    -> Third-party payroll via extracts
    -> Reconciliation / analytics

[Feedback loop]
    -> statuses updated
    -> audit and analysis available
```

---

# 43) Source-backed reference notes for this mental model

This mental model was synthesized from Oracle’s Time and Labor implementation, configuration, readiness, and integration documentation, especially topics covering:

- Overview of Implementing Time and Labor
- How Time Entry Profile Components Work Together
- How Time Processing Profile Components Work Together
- Overview of Linking People to Time and Labor Objects
- Time Layout Sets
- Time Device Event Mapping Sets
- About Implementing Time Cards with Time and Labor
- How Default Time Card and Time Entry Approvals Work
- Basic Process to Integrate Global Payroll and Time and Labor
- Overview of HCM Extracts for Time and Labor and Scheduling
- Time Attestation Sets
- Attestations for Oracle Web Clock and Time Cards
- Overview of Custom Time Attributes
- Options to Configure Time Rule Templates
- Analyze Rule Processing Details for Time Rules and Rule Sets
- Workforce Management Profile Options
- Redwood Time and Labor readiness guidance

---

# 44) Suggested future decomposition for your site

To make this ideal for an agent-driven interactive site, split this file later into these markdown children:

- `01-system-overview.md`
- `02-core-concepts.md`
- `03-hcm-groups.md`
- `04-time-entry-profiles.md`
- `05-layout-sets-and-components.md`
- `06-time-attributes-and-categories.md`
- `07-attestations.md`
- `08-processing-profiles.md`
- `09-rules-fast-formulas-and-rule-sets.md`
- `10-consumer-sets.md`
- `11-approvals-and-statuses.md`
- `12-web-clock-and-time-devices.md`
- `13-payroll-integration.md`
- `14-project-costing-integration.md`
- `15-absence-integration.md`
- `16-third-party-payroll-extracts.md`
- `17-security-and-audit.md`
- `18-debugging-and-analysis.md`
- `19-redwood-and-ux.md`
- `20-troubleshooting-mental-model.md`

This current document is intentionally monolithic so your agent can read one complete end-to-end narrative first.

_complete_mental_model.md…]()

- Time Card
