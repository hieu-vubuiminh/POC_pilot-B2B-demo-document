# OPC SALES AGENT — STATIC ONBOARDING PRODUCT FLOW

**Document status:** Approved direction for the pre-MVP static demo

**Language level:** English B2

**Product stage:** Static clickable onboarding, before main MVP development

**Source baseline:** Documents 01–05 and SoloMatrix v4 onboarding reference

## 1. Purpose

This document defines a complete onboarding experience for the OPC Sales Operations Agent.

The onboarding must help a customer understand how to:

1. prepare business data;
2. prepare simulated connections;
3. confirm Agent and approval rules;
4. run the first guided sales order;
5. handle one exception;
6. monitor the workflow in the Control Tower; and
7. understand whether the setup is ready.

The result is a static clickable demo. It is not a production onboarding service and does not connect to live systems.

## 2. Confirmed decisions

| ID | Status | Decision |
|---|---|---|
| ONB-REQ-001 | CONFIRMED | DEV shall complete and receive approval for the static onboarding demo before starting main MVP feature development. |
| ONB-REQ-002 | CONFIRMED | The demo shall provide a complete onboarding journey from welcome to readiness result. |
| ONB-REQ-003 | CONFIRMED | The demo shall be clickable and responsive. It shall use one Web/PWA-style UI, not separate web and mobile products. |
| ONB-REQ-004 | CONFIRMED | The demo shall use static and deterministic seed data. It shall not require a backend, database, authentication service, or live connector. |
| ONB-REQ-005 | CONFIRMED | Every connector, Agent action, ERP result, invoice result, delivery event, and payment event shall be labelled as simulated or not verified. |
| ONB-REQ-006 | CONFIRMED | The Owner may skip or pause the learning guide, but the demo shall show that an Agent Workflow cannot start until minimum readiness checks pass. |
| ONB-REQ-007 | CONFIRMED | Demo Admin prepares the tenant, seed data, and simulator state. The Owner confirms business policy, approvals, and guided business decisions. |
| ONB-REQ-008 | CONFIRMED | The first guided workflow shall be the B2B hotel order from a simulated Zalo message to payment and order closure. |
| ONB-REQ-009 | CONFIRMED | The guided journey shall include one human-controlled exception. The default exception is overdue customer debt. |
| ONB-REQ-010 | CONFIRMED | The onboarding shall explain the boundary between AI reasoning, deterministic ERP rules, and human decisions. |
| ONB-REQ-011 | CONFIRMED | Documents 01–05 remain unchanged. This onboarding is a separate pre-MVP demo milestone. |

## 3. Reference patterns from SoloMatrix v4

The static demo should reuse these interaction patterns:

- simple questions and clear choices;
- progress saved at each step;
- `Skip for now` and `Resume onboarding`;
- explain user value before showing setup work;
- create a setup list from the user's answers;
- show who is waiting, what is missing, and what happens next;
- use one permanent setup center instead of many setup pages;
- finish with a real guided task, not only a welcome message; and
- allow Demo Admin to assist without taking the Owner's business decision.

The demo shall not reuse the household-business license, tax threshold, government-program QR, broad marketplace list, or in-app OTP entry from the reference mockup.

## 4. Actors

| Actor | Responsibility in the static demo |
|---|---|
| OPC Owner | Reviews business readiness, confirms policy, runs the guided order, decides the exception, and monitors the Control Tower. |
| Demo Admin | Selects or resets the demo company, prepares deterministic seed data, and changes simulator states for the presentation. |
| Agent | Reads the simulated message, extracts customer and product candidates, proposes actions, and explains exceptions. It does not commit stock or money. |
| ERP / Rule Engine | Returns deterministic customer, price, debt, stock, reservation, order, invoice, receivable, payment, and state results. |
| Connector Simulator | Produces labelled Zalo, delivery, invoice, and payment events. |

## 5. Entry modes

### 5.1 Explore Demo

This is the required mode for the static onboarding release.

- Uses one prepared OPC company.
- Uses simulated data and connectors.
- Guides the Owner through the full journey.
- Can reset to the same starting state.

### 5.2 Prepare Business

This is a visible future concept only.

- The user may view a readiness checklist.
- The user cannot enter production credentials.
- The user cannot claim a live connection.
- The screen must show `Not available in this static demo`.

## 6. End-to-end onboarding flow

| Step ID | Step | Owner action | System response | Completion result |
|---|---|---|---|---|
| ONB-STEP-01 | Welcome and scope | Select `Explore Demo` | Shows demo limits, data source labels, and expected duration | Demo mode selected |
| ONB-STEP-02 | Roles and control | Confirm the Owner role | Explains Agent proposal, ERP commit, human approval, and connector confirmation | Responsibility check passed |
| ONB-STEP-03 | Business data readiness | Review Customer, Product, Price, Credit, and Stock cards | Shows `Ready`, `Missing`, or `Blocked` from seed data | Minimum ERP dataset reviewed |
| ONB-STEP-04 | Connection plan | Review Zalo, Delivery, Invoice, and Payment simulator cards | Shows value, mode, owner, required data, last test, and next action | Required simulator list created |
| ONB-STEP-05 | Connector test | Run each required test event | Shows event ID, simulated source, received result, and audit evidence | Required simulators ready |
| ONB-STEP-06 | Policy and approvals | Confirm confidence, reservation, debt, price, and approval rules | Shows a policy version and explains which actions need the Owner | Policy version accepted |
| ONB-STEP-07 | Guided first order | Start the prepared hotel order | Plays the simulated Zalo-to-payment workflow one controlled step at a time | Happy-path order reaches `CLOSED` |
| ONB-STEP-08 | Guided exception | Review overdue debt evidence and approve or reject | Shows impact, reason, ERP revalidation, and audit record | Human-control concept proven |
| ONB-STEP-09 | Control Tower guide | Open active work, workflow detail, and audit | Highlights current step, waiting actor, retry, error, and evidence | Monitoring guide completed |
| ONB-STEP-10 | Readiness result | Review and acknowledge the result | Shows `Ready`, `Ready with conditions`, or `Blocked` with evidence | Onboarding completed |

## 7. Minimum readiness gate

The static user may browse or skip the guide. The `Start Agent Workflow` action shall remain disabled until all items below show `Ready`:

| Gate ID | Required condition |
|---|---|
| ONB-GATE-01 | Customer, Product, Price, Credit, and Stock seed data are present. |
| ONB-GATE-02 | The Owner role and approver are identified. |
| ONB-GATE-03 | A policy version is selected. |
| ONB-GATE-04 | The Zalo simulator test has passed. |
| ONB-GATE-05 | Delivery, Invoice, and Payment simulator modes are visible and labelled. |
| ONB-GATE-06 | No required item is in `Blocked`. |

The UI shall explain every failed gate. It shall not silently enable the workflow.

## 8. Guided first order

The guided order uses one fixed data set:

- Customer: `Sunrise Hotel`;
- Channel: `Zalo Simulator`;
- Product A: available stock;
- Product B: available stock;
- price and payment terms from ERP seed data;
- delivery through a carrier simulator;
- invoice result through an invoice simulator; and
- payment through a payment simulator with an exact reference.

The guided timeline is:

1. simulated Zalo message received;
2. Agent extracts customer, products, quantities, and requested delivery time;
3. ERP confirms customer, SKU, price, debt, and ATP;
4. ERP creates the order and reservation;
5. Owner sees the order confirmation;
6. picking is completed;
7. Owner confirms physical handover;
8. ERP issues stock and consumes the reservation;
9. delivery is confirmed;
10. invoice draft and simulated result are recorded;
11. receivable is created;
12. simulated payment is matched and allocated; and
13. ERP closes the order.

Every step shall show one source label: `Agent proposed`, `ERP committed`, `Owner confirmed`, or `Connector simulated`.

## 9. Guided exception

The default exception is an overdue-debt customer.

The demo shall show:

- the original message;
- customer and debt evidence;
- the deterministic rule result;
- the Agent's proposed options;
- financial and fulfilment impact;
- Owner approval or rejection;
- required decision reason;
- ERP revalidation; and
- an append-only audit event.

The demo shall not auto-approve the exception.

## 10. Pause, resume, reset, and reopen

| Action | Required behaviour |
|---|---|
| Skip for now | Opens the demo shell and keeps a visible `Resume onboarding` entry. |
| Resume | Returns to the last incomplete step. |
| Back | Returns to the previous onboarding step without deleting completed results. |
| Restart guide | Restarts guidance but keeps the same deterministic seed unless Demo Admin selects reset. |
| Reset demo | Demo Admin returns all onboarding, workflow, connector, and audit data to the known start state. |
| Open later | Owner can reopen onboarding from Demo and Policy Settings. |

## 11. Completion result

The final result uses these display states:

| Result | Meaning |
|---|---|
| Ready | All required static checks passed, the guided order closed, the exception was handled, and monitoring was completed. |
| Ready with conditions | The main journey passed, but one optional connector or future production dependency is not verified. |
| Blocked | A required seed, role, policy, simulator test, or guided step did not pass. |

`Ready` means ready to present the static onboarding demo. It does not mean ready for production or ready to start the main MVP without the separate DEV handoff conditions in document 05.

## 12. Product success criteria

The static onboarding is successful when a demo participant can, without help:

1. explain what the Agent, ERP, Owner, and connector each did;
2. identify which sources are simulated;
3. find a blocked or waiting step;
4. make the guided approval decision with evidence;
5. open the audit result; and
6. explain why the final readiness result is `Ready`, `Ready with conditions`, or `Blocked`.

## 13. Out of scope

- Real account registration or login.
- Real tenant provisioning.
- Live ERP import or synchronization.
- Live Zalo, bank, carrier, invoice, or payment connection.
- Collection of passwords, API secrets, bank OTP, or production credentials.
- Production security, billing, subscription, or tenant administration.
- Legal validation or legal invoice issuance.
- Full ERP setup.
- Main MVP business implementation.

## 14. Source documents

- `01_PRD/PRD_OPC_SALES_AGENT.md`
- `02_Workflow/BUSINESS_AND_AGENT_WORKFLOW.md`
- `02_Workflow/STATE_MACHINE.md`
- `02_Workflow/DECISION_AND_APPROVAL_MATRIX.md`
- `03_UX_UI/SCREEN_INVENTORY.md`
- `03_UX_UI/SCREEN_FUNCTIONAL_SPEC.md`
- `05_Backlog_UAT/DEV_HANDOFF_READINESS.md`
- `SOLOMATRIX-Mockup-v4/README.md`
- `SOLOMATRIX-Mockup-v4/docs/plan-v4/out/T1-ONBOARDING-FLOW.md`
