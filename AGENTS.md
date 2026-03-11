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
- flag missing content clearly         Here’s the clean mental model:

**Oracle Time and Labor is a policy engine sitting between “how time is captured” and “where time is consumed.”**
People often think it is just a timecard screen. Nope. The screen is the tip of the weird enterprise iceberg. Underneath, OTL is really a system that does five things: **capture time, classify time, validate/calculate time, route/approve time, and transfer time** to downstream consumers like Payroll, Project Costing, and related project staffing processes. ([Oracle Docs][1])

## The master mental model


## The simplest way to think about OTL

Think of OTL as **three stacked layers**:

### 1. Experience layer — “What does the user see and enter?”

This is the part users notice: time cards, calendar entry, web clock, and sometimes third-party collection devices. Oracle explicitly supports reporting time through time cards, calendar, web clock, and device integrations depending on setup. Managers and time and labor managers can also enter or submit time on behalf of workers. ([Oracle Docs][2])

This layer answers:

* Where does time get entered?
* What fields show up?
* Can the worker enter payroll time, project time, absence, or all of them?
* Does entry happen by punch, elapsed hours, or generated/mass time?

### 2. Policy layer — “What does the system do with the time?”

This is the real brain. Once time is entered, Oracle applies:

* time attributes
* time card fields
* layouts
* validation rules
* calculation rules
* approval logic
* time consumer logic
* transfer rules ([Oracle Docs][2])

This layer answers:

* Is the entry allowed?
* How should it be categorized?
* Does overtime get derived?
* Which approvals apply?
* Is this time meant for payroll, projects, both, or neither?

### 3. Consumer layer — “Where does the time go next?”

Time and Labor does not exist for its own amusement. The processed time is handed off to consuming systems. Oracle identifies major time consumers such as **Global Payroll**, **Project Costing**, and **Project Execution Management**. The consumer set determines which consumers apply and also frames validation, approval period, and transfer rules for those groups. 

This layer answers:

* Is this time to be paid?
* Is it to be costed to a project?
* Is it both payroll and project time?
* What gets transferred, and when?

---

# The core objects, in the right order

Here’s the deeper model that makes OTL click.

## 1) Time entry methods

These are the channels through which time arrives:

* Time card
* Calendar
* Web clock
* Third-party device/file
* Manager entry / mass entry processes ([Oracle Docs][2])

**Mental model:**
This is the **doorway** into OTL.

---

## 2) Time attributes

Time attributes are the atomic pieces of meaning attached to a time entry. Oracle links data dictionary time attributes to payroll elements and absence types so the system knows what the entry represents and where it should go. For example, payroll time type and absence management type become selectable values used on fields and buttons. ([Oracle Docs][2])

Examples of what an attribute might represent:

* Payroll Time Type
* Absence Type
* Project
* Task
* Cost center
* Custom attribute like meal taken

**Mental model:**
Attributes are the **DNA of a time entry**. Without them, the system just has hours floating in the void.

---

## 3) Time card fields

A time card field is how those attributes become something a human can actually interact with on screen. Oracle notes that the time attributes become dropdown values and are used when creating time card fields and web clock buttons. ([Oracle Docs][2])

Examples:

* Payroll Time Type field
* Project field
* Absence Type field
* Cost segment field

**Mental model:**
Attributes are the data definition.
Fields are the **UI wrapper** around that data.

---

## 4) Layout components, categories, and layout sets

This is where you decide how the screen behaves for different worker groups. Oracle’s setup guidance emphasizes deciding what types of time people report, which fields/buttons they need, and how often those fields should appear. Different groups can use different layout sets even with overlapping field logic. ([Oracle Docs][3])

A good mental split:

* **Layout components** = reusable UI pieces
* **Categories** = groupings of those pieces
* **Layout sets** = assembled experiences for a population

**Mental model:**
This is the **screen architecture** of OTL.

---

## 5) Worker Time Entry Profile

This profile controls the user-facing entry experience for a worker population. In practice, this is where you govern how people report time and what configuration they use for entry. Oracle’s implementation materials tie worker time entry profiles directly to time entry objects and implementation choices. ([Oracle Docs][4])

What it usually governs conceptually:

* which layout the person gets
* which entry methods are allowed
* what they can report
* entry period behavior and interaction style

**Mental model:**
The time entry profile is the **front-door policy pack**.

---

## 6) Worker Time Processing Profile

This is one of the most important objects in all of OTL. The processing profile links a worker group to:

* repeating time periods
* time consumer sets
* validation/approval/transfer behavior context 

Oracle explicitly notes the delivered processing profiles use delivered repeating time periods, time categories, time consumer sets, and HCM groups. 

**Mental model:**
If the entry profile governs **how time gets in**, the processing profile governs **what happens to it afterward**.

---

## 7) HCM Groups

HCM Groups are how you target the right time entry and processing configurations to the right people. Oracle’s documentation ties delivered and custom time processing configurations to HCM groups. 

Examples:

* Salaried employees
* Hourly employees
* Nurses
* Bus drivers
* Project workers
* Union group A

**Mental model:**
HCM Groups are the **audience selector**.

---

## 8) Repeating Time Periods

These define the period structure used for time processing and approvals, like weekly, biweekly, semi-monthly, and so on. Oracle documents these as part of the processing configuration stack. 

**Mental model:**
This is the **calendar spine** of OTL.

---

## 9) Time Consumer Sets

This is the downstream routing brain. Oracle says time consumers are the other applications that use time data, and the time consumer set is how you identify which consumers apply to specific groups. The set also controls consumer validation rules, approval periods, and transfer rules for linked groups. 

Common consumers:

* Global Payroll
* Project Costing
* Project Execution Management 

And Oracle provides delivered consumer sets like Payroll Only, Projects Only, and Projects and Payroll. 

**Mental model:**
Time consumer sets are the **routing table** for time.

---

## 10) Time categories

A time category identifies which entries belong to which processing or transfer context. Oracle specifically notes that a consumer uses a linked time category to identify the time data that transfers to it. 

Examples from delivered logic:

* All Payroll Entries
* All Project Entries
* All Absence Entries 

**Mental model:**
Categories are the **buckets** that let Oracle say: “these entries count for payroll; those count for projects.”

---

## 11) Validation rules

Validation rules decide whether an entry is allowed. These can enforce policy such as:

* missing required fields
* too many hours
* overlapping time
* invalid combinations
* break requirements
* schedule adherence

Oracle’s documentation repeatedly frames Time and Labor as a rule-based application and references analysis of validations and calculations as part of maintenance. ([Oracle Docs][5])

**Mental model:**
Validation answers: **“Can this time exist?”**

---

## 12) Calculation rules

Calculation rules derive additional time meaning after entry:

* overtime
* premiums
* differentials
* earned dates
* day split logic
* break deductions
* derived time categories

Oracle’s docs reference calculation processing and specific setups such as midnight-spanning time and overtime day start. ([Oracle Docs][6])

**Mental model:**
Calculation answers: **“What does this raw time become?”**

---

## 13) Approval workflow

Once time is valid and processed, it may need approval. Oracle’s user overview describes the flow as scheduling, reporting, adjusting, approving, then transferring. Consumer sets also participate in approval-period behavior. ([Oracle Docs][1])

**Mental model:**
Approval answers: **“Who must bless this time before it moves on?”**

---

## 14) Transfer

After validation, calculation, and approval status are in the right state, time can be transferred to downstream systems. Oracle explicitly describes transfer to Global Payroll, Project Costing, and external apps, and notes troubleshooting incomplete transfer processes when failures occur. ([Oracle Docs][1])

**Mental model:**
Transfer answers: **“Where does approved, processed time go to do real business?”**

---

# The end-to-end life of a time entry

This is the mental movie to keep in your head:

That’s the whole beast.

---

# The most important distinction in OTL

## Entry profile vs processing profile

This is where many people get tangled in the spaghetti.

### Worker Time Entry Profile

Think:

* what users can enter
* what the UI looks like
* which fields/buttons/layouts they see

### Worker Time Processing Profile

Think:

* how time is validated
* which consumer set applies
* approval periods
* transfer behavior
* repeating time periods

**Shortcut memory trick:**

* **Entry profile = “screen and entry behavior”**
* **Processing profile = “policy and downstream behavior”**

That little distinction saves an absurd amount of confusion.

---

# The hidden architecture behind “just entering hours”

When someone enters `8 Regular Hours on Monday`, Oracle is quietly asking a ridiculous number of questions:

1. Who is this person?
2. Which HCM Group are they in?
3. Which entry profile applies?
4. Which layout set should render?
5. Which fields are available?
6. Which attributes are being populated?
7. Is the time valid?
8. Do calculation rules derive overtime, premium, or earned date?
9. Which time category does the entry belong to?
10. Which time consumer set applies?
11. Does it need approval?
12. Can it transfer to payroll, projects, or both? ([Oracle Docs][2])

That is why OTL can feel magical when it works and haunted when it doesn’t.

---

# The downstream integrations mental model

## Payroll

Time destined for payroll needs payroll elements and related time attributes/fields so reported time can be processed for payment and costing. Oracle explicitly calls out creating payroll elements and configuring payroll costing for cost segment allocation and overrides. ([Oracle Docs][2])

**Think:**
“Pay this person correctly.”

## Project Costing

Project-related time is transferred so labor can be billed or costed correctly. Oracle’s user guide overview explicitly includes transfer to project costing. ([Oracle Docs][1])

**Think:**
“Charge this labor correctly.”

## Project Execution Management

This consumer can use time for staffing/project execution analysis. Oracle lists it as a time consumer in the implementation guide. 

**Think:**
“Use the labor data operationally.”

---

# The practical admin mental model

If you are troubleshooting OTL, work in this order:

That order matters. A lot.

Because most OTL issues boil down to one of these:

* wrong group
* wrong profile
* wrong layout
* wrong consumer mapping
* wrong rule firing
* approval stuck
* transfer failure

Classic enterprise goblin behavior.

---

# The best one-sentence mental model for each major object

* **HCM Group** = who gets the config
* **Time Entry Profile** = how they enter time
* **Layout Set** = what the UI looks like
* **Time Attributes** = what the entry means
* **Time Card Fields** = how that meaning is exposed in the UI
* **Time Processing Profile** = how the entry is processed after capture
* **Repeating Time Period** = the calendar cycle for processing
* **Time Category** = which entries belong to which bucket
* **Time Consumer Set** = which downstream systems care about the time
* **Validation Rule** = can the time be saved/submitted
* **Calculation Rule** = what the time turns into
* **Approval** = who must approve it
* **Transfer** = where it goes next

---

# Final “map of the city” version

## The essence

**Oracle Time and Labor is not primarily a time-entry tool. It is a configurable decision system for turning reported time into valid, approved, categorized labor data that other systems can consume.** ([Oracle Docs][5])

I can turn this into a **clean one-page study sheet** or a **more visual “city map” style diagram** next.

[1]: https://docs.oracle.com/en/cloud/saas/human-resources/fautl/overview-of-using-time-and-labor.html "Overview of Using Time and Labor"
[2]: https://docs.oracle.com/en/cloud/saas/human-resources/faitl/time-entry-setup-and-maintenance-tasks.html "Time Entry Setup and Maintenance Tasks"
[3]: https://docs.oracle.com/en/cloud/saas/human-resources/faitl/how-many-time-entry-layout-components-categories-and-layout-sets.html "How Many Time Entry Layout Components, Categories, and Layout Sets to Create"
[4]: https://docs.oracle.com/en/cloud/saas/human-resources/faitc/how-do-i-implement-time-cards-in-time-and-labor.pdf?utm_source=chatgpt.com "Oracle Fusion Cloud Human Resources"
[5]: https://docs.oracle.com/en/cloud/saas/human-resources/faitl/overview-of-implementing-time-and-labor.html "Overview of Implementing Time and Labor"
[6]: https://docs.oracle.com/en/cloud/saas/human-resources/faitl/setup-to-handle-midnight-spanning-time-and-overtime-day-start.html?utm_source=chatgpt.com "Setup to Handle Midnight-Spanning Time and Overtime ..."

