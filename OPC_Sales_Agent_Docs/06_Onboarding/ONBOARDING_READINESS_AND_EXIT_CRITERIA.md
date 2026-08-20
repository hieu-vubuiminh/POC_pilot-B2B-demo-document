# OPC SALES AGENT — STATIC ONBOARDING DEV GUIDE AND EXIT CRITERIA

**Document status:** Approved execution sequence for the pre-MVP static demo

**Audience:** Product Owner, BA, UX, DEV, and QA

**Main rule:** Finish and approve this static onboarding milestone before main MVP feature development starts

## 1. Delivery outcome

DEV shall deliver one responsive static clickable onboarding demo that can be presented without a backend.

The demo must cover:

- welcome and scope;
- role and responsibility guidance;
- ERP data readiness;
- simulated connector readiness;
- policy and approval guidance;
- one guided closed order;
- one human-controlled exception;
- Control Tower and audit guidance;
- skip, resume, retry, reset, and error states; and
- a final readiness result.

The demo is complete in experience, but simulated in capability.

## 2. Implementation boundary

### DEV shall build

- A responsive static onboarding shell.
- Clickable routes or screen states for ONB-SCR-001 to ONB-SCR-009.
- Deterministic local fixtures.
- Local progress state and resume behaviour.
- Simulated success, warning, blocked, failure, retry, and duplicate states.
- Simplified guided previews of Inbox, Order, Approval, Workflow, Control Tower, Finance, and Audit.
- Demo reset.
- Clear source and simulator labels.

### DEV shall not build in this milestone

- Production backend services.
- Production database schema or migration.
- Live authentication or tenant provisioning.
- Live ERP services.
- Live Zalo, bank, carrier, invoice, or payment integrations.
- Production Agent or LLM calls.
- Full versions of the 12 MVP screens.
- Real stock, money, tax, invoice, or payment processing.
- Production PWA service worker, push notification, billing, or security platform.

## 3. Recommended static architecture

This guidance is framework-neutral.

| Area | DEV guidance |
|---|---|
| UI shell | Use one responsive shell for all onboarding screens. |
| Navigation | Use stable screen IDs and explicit next/back routes. Do not hide the main path in free navigation. |
| State | Keep onboarding progress, selected fixtures, connector test results, policy confirmation, and guided-run step in local browser state. |
| Persistence | Refreshing the browser shall keep the current onboarding step. Full demo reset shall restore the known seed. |
| Fixtures | Keep all data deterministic. The same action shall create the same visible result after reset. |
| Guided workflow | Use prepared snapshots and controlled transitions. Do not implement the full business engine. |
| Simulators | Use local test actions that create labelled event results. Do not call external APIs. |
| Audit | Show append-only static events. A later action may add an event but shall not rewrite an earlier event. |
| Responsive | Use the same content and actions on desktop and mobile. |
| Demo support | Provide one clear reset action and one default presentation path. |

## 4. DEV execution order

### Milestone ONB-M0 — Handoff freeze

DEV starts only after:

- PO confirms the flow in `ONBOARDING_PRODUCT_FLOW.md`;
- BA confirms screen and click IDs;
- UX provides the visual direction or approves a simple design system;
- the static copy is approved;
- fixtures and expected results are frozen; and
- no open question changes the number of onboarding steps.

**Exit:** ONB-M0 handoff is marked Ready.

### Milestone ONB-M1 — Static shell and fixtures

Build:

- responsive shell;
- ONB-SCR routes;
- progress state;
- static company and actor;
- all fixtures;
- skip, resume, and reset; and
- simulator and source labels.

**Exit:** The user can navigate from ONB-SCR-001 to ONB-SCR-009 with placeholder content and no dead end.

### Milestone ONB-M2 — Setup and readiness journey

Build the full clickable content for:

- ONB-SCR-001 Welcome;
- ONB-SCR-002 Roles;
- ONB-SCR-003 Data Readiness;
- ONB-SCR-004 Connection Plan;
- ONB-SCR-005 Connector Test; and
- ONB-SCR-006 Policy Review.

Include required blocked, failure, retry, duplicate, and not-verified states.

**Exit:** All readiness gates work and explain why Continue is enabled or disabled.

### Milestone ONB-M3 — Guided first order

Build the controlled guided timeline for:

- message;
- extraction;
- ERP checks;
- reservation;
- picking and handover;
- delivery;
- invoice and receivable;
- payment allocation; and
- order closure.

Do not build the real business services. The guided timeline changes only local fixture state.

**Exit:** The prepared order reaches `CLOSED`, and every step has the correct source label.

### Milestone ONB-M4 — Exception, Control Tower, and audit

Build:

- overdue-debt approval case;
- Approve and Reject paths;
- required reason;
- ERP revalidation explanation;
- Control Tower guided highlights;
- Workflow Run preview; and
- append-only Audit preview.

**Exit:** The Owner can decide the exception and trace the result without a presenter explaining the screen.

### Milestone ONB-M5 — Demo hardening and sign-off

Complete:

- responsive review;
- copy review;
- click-path review;
- reset review;
- simulator-label review;
- error-state review;
- static performance smoke test;
- demo script rehearsal; and
- PO/BA/UX/QA acceptance.

**Exit:** Static Onboarding Gate is Passed.

### Milestone MVP-M0 — Main MVP preparation

Main MVP feature development may begin only after ONB-M5 passes and the separate blockers in `05_Backlog_UAT/DEV_HANDOFF_READINESS.md` are closed or accepted by the Product Owner.

Passing onboarding does not replace the missing SRS, integration contracts, security decisions, or main MVP Definition of Ready.

## 5. Static fixture baseline

| Fixture | Required records and states |
|---|---|
| Company | One prepared OPC sales company and one Owner. |
| Customer | Sunrise Hotel with sender mapping, price source, terms, and normal debt state. |
| Exception customer | One hotel with overdue debt for the approval guide. |
| Products | Two active SKUs with sales units and aliases. |
| Stock | On-hand, active reservation, and ATP values that can show hold before stock issue. |
| Policy | One prepared policy version with confidence, reservation, overdue debt, and price controls. |
| Zalo | One inbound hotel order event and one duplicate event ID. |
| Delivery | One quoted/selected/delivered path and one failure result for optional demonstration. |
| Invoice | One Draft, one simulated recorded result, and one rejected result for optional demonstration. |
| Payment | One exact-match event and one duplicate transaction ID. |
| Workflow | One happy-path run, one waiting-human run, and one retryable blocked run. |
| Audit | Events for Agent proposal, ERP commit, Owner decision, and connector simulation. |

Fixture values must be stored in one clear location. Do not copy the same business value into many screens without a single fixture source.

## 6. Definition of Ready for static onboarding DEV

| ID | Ready condition |
|---|---|
| ONB-DOR-01 | ONB-SCR-001 to ONB-SCR-009 are approved. |
| ONB-DOR-02 | The main click path and exception path are approved. |
| ONB-DOR-03 | All static copy is available in English B2. |
| ONB-DOR-04 | The Owner and Demo Admin boundaries are approved. |
| ONB-DOR-05 | Fixture names, values, states, and expected results are frozen. |
| ONB-DOR-06 | All source and simulator labels are approved. |
| ONB-DOR-07 | The default exception is overdue debt. |
| ONB-DOR-08 | Responsive review sizes are agreed. |
| ONB-DOR-09 | Evidence format for QA is agreed. |
| ONB-DOR-10 | DEV understands that no live integration or full MVP screen is required. |

## 7. Acceptance cases

| Case ID | Scenario | Expected result |
|---|---|---|
| ONB-UAT-001 | Start Explore Demo | Welcome scope is clear and opens Roles and Control. |
| ONB-UAT-002 | Open future Prepare Business mode | User sees a read-only future concept and no live setup action. |
| ONB-UAT-003 | Skip and resume | User enters the demo shell and resumes at the last incomplete step. |
| ONB-UAT-004 | Refresh during onboarding | Current step and completed static results remain. |
| ONB-UAT-005 | Answer role check incorrectly | Continue stays blocked and the correct responsibility is explained. |
| ONB-UAT-006 | Demonstrate missing ERP data | Start Workflow stays disabled and the missing group is named. |
| ONB-UAT-007 | Restore ERP seed | Required data returns to Ready and the next step is enabled. |
| ONB-UAT-008 | Run successful connector test | Event ID, simulated source, result, time, and evidence are shown. |
| ONB-UAT-009 | Run connector failure and retry | Failure does not show success; retry reaches the prepared result. |
| ONB-UAT-010 | Send duplicate simulated event | Original event is linked and no second business result is created. |
| ONB-UAT-011 | Try a prohibited Agent action | The action is blocked and the ERP/Human boundary is explained. |
| ONB-UAT-012 | Run guided happy path | The order reaches `CLOSED` in the correct step order. |
| ONB-UAT-013 | Review reservation before handover | UI states that stock is held and not issued. |
| ONB-UAT-014 | Confirm handover | UI shows one stock issue and one consumed reservation. |
| ONB-UAT-015 | Approve overdue debt | Reason is required; ERP revalidates; decision and result are audited. |
| ONB-UAT-016 | Reject overdue debt | No unsafe commit occurs; rejection and compensation/no mutation are shown. |
| ONB-UAT-017 | Open Workflow Run and Audit | Agent, ERP, Human, and Connector events are separate and traceable. |
| ONB-UAT-018 | Produce readiness summary | Result and failed/conditional items match the completed checks. |
| ONB-UAT-019 | Reset demo | All local states return to the known starting fixture. |
| ONB-UAT-020 | Review mobile and desktop | Same content and actions are available without a broken layout. |
| ONB-UAT-021 | Search for unsafe claims or credentials | No live claim, password, API secret, bank OTP, or real credential field exists. |
| ONB-UAT-022 | Follow every visible action | No dead link, empty target, or action without feedback exists. |

## 8. Definition of Done

The static onboarding is Done only when:

- ONB-UAT-001 to ONB-UAT-022 pass;
- the main path works after a clean reset;
- skip and resume work after browser refresh;
- all static states are deterministic;
- no external network call is required for the demo;
- no console error affects the flow;
- all connectors and external results are labelled simulated or not verified;
- no screen collects a real credential;
- desktop and mobile reviews pass;
- PO confirms the business story;
- BA confirms the rules and source labels;
- UX confirms clarity and responsive behaviour;
- QA stores evidence; and
- the Product Owner signs the Static Onboarding Gate.

## 9. Static Onboarding Gate

| Gate area | Pass condition | Owner |
|---|---|---|
| Product | The demo tells the complete setup, first-use, exception, and monitoring story. | PO |
| Business rules | AI, ERP, Human, and Connector boundaries match documents 01–05. | BA |
| UX | The journey is understandable without presenter help. | UX |
| Functional clicks | All actions, states, skip/resume, retry, and reset work. | DEV + QA |
| Claims | No live, production, legal, bank, or connector claim is false or unverified. | PO + BA |
| Responsive | Main and exception paths work on mobile and desktop. | UX + QA |
| Evidence | Test results, screenshots, and demo recording are available. | QA |

**Gate result:** `Passed`, `Passed with named conditions`, or `Failed`.

Main MVP feature development starts only when this gate is `Passed`, unless the Product Owner records an explicit condition and owner for every remaining item.

## 10. Demo script for stakeholder review

Target presentation time: about 10 minutes.

1. Open the clean Welcome screen.
2. Explain the static demo label.
3. Pass the role knowledge check.
4. Open Customer and Stock readiness evidence.
5. Show one missing-data blocked state, then restore the seed.
6. Run the Zalo simulator test.
7. Show one failed connector test and safe retry.
8. Confirm the policy version.
9. Run the guided hotel order to `CLOSED`.
10. Open the overdue-debt exception and approve it with a reason.
11. Open Workflow Run and Audit evidence.
12. Show the final readiness result.
13. Reset the demo and confirm the known start state.

## 11. Defect versus missing prerequisite

### Static demo defect

A defect exists when approved static behaviour is implemented incorrectly. Examples:

- Continue is enabled while a required gate is missing.
- A duplicate event creates a second result.
- Skip loses the current step.
- Approve works without a reason.
- A connector result is not labelled simulated.
- Mobile has no access to a required action.

### Missing prerequisite

A missing prerequisite is information or approval required before DEV can implement or QA can accept the static behaviour. Examples:

- fixture values are not frozen;
- final copy is not approved;
- Owner/Demo Admin responsibility is unclear;
- responsive review size is not agreed; or
- the PO changes the default exception.

A missing prerequisite is not a software defect.

## 12. Reuse in the main MVP

After the Static Onboarding Gate passes, DEV may reuse:

- design tokens and responsive shell patterns;
- source and simulator labels;
- guided explanation components;
- readiness card patterns;
- connector status card patterns;
- local demo fixtures for development environments; and
- approved business copy.

DEV shall not treat static transitions, local fixture logic, or static audit events as production domain logic. Main MVP behaviour must follow the PRD, Workflow, future SRS, Backlog, and UAT requirements.

## 13. Handoff evidence

DEV shall provide:

- runnable static demo location;
- supported run instruction;
- clean reset instruction;
- screen and click map;
- fixture list;
- acceptance result for ONB-UAT-001 to ONB-UAT-022;
- mobile and desktop screenshots;
- one recording of the default demo script;
- known limitations; and
- Static Onboarding Gate decision.
