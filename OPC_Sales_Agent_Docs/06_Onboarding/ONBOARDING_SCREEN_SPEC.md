# OPC SALES AGENT — STATIC ONBOARDING SCREEN AND CLICK SPECIFICATION

**Document status:** DEV handoff for the pre-MVP static demo

**Scope:** Clickable and responsive onboarding only

**Implementation style:** Framework-neutral; no backend or live integration

## 1. Global UX rules

| ID | Rule |
|---|---|
| ONB-UX-001 | Use simple business words. Do not show technical terms such as webhook, OAuth, event bus, or orchestration without a short explanation. |
| ONB-UX-002 | Keep one main action per step. Secondary actions are `Back`, `Skip for now`, and `Exit demo`. |
| ONB-UX-003 | Show progress as step name and count, for example `Step 3 of 10 — Business data`. |
| ONB-UX-004 | Every source shall have a visible label: `Static seed`, `Agent proposal`, `ERP rule`, `Human decision`, or `Simulated connector`. |
| ONB-UX-005 | Never use `Connected` without a mode label. Use `Simulator ready`, `Not verified`, `Blocked`, or `Error`. |
| ONB-UX-006 | The user may pause and resume at the last incomplete step. |
| ONB-UX-007 | Do not ask for a password, API secret, bank OTP, or real credential. |
| ONB-UX-008 | Buttons that represent external actions shall say `Run simulated test`, not `Connect live`. |
| ONB-UX-009 | A disabled main action shall always explain the failed readiness gate. |
| ONB-UX-010 | The same clickable flow shall work on desktop and mobile widths. |
| ONB-UX-011 | Demo Admin actions shall be visually separate from Owner actions. |
| ONB-UX-012 | All reset actions shall require confirmation and explain that only static demo data will change. |

## 2. Navigation shell

The onboarding uses one shell with:

- product and demo label;
- current company;
- progress stepper;
- main content area;
- source and mode labels;
- sticky primary action on mobile;
- `Skip for now`;
- `Resume onboarding`; and
- Demo Admin `Reset demo` action.

The shell shall not copy the full main MVP navigation. It may show a small preview of the future Control Tower only when required by the guided flow.

## 3. Screen inventory

| Screen ID | Screen | Main purpose | Primary actor | Main next screen |
|---|---|---|---|---|
| ONB-SCR-001 | Welcome and Demo Scope | Set expectations and choose entry mode | Owner | ONB-SCR-002 |
| ONB-SCR-002 | Roles and Control | Explain Agent, ERP, Human, and Connector boundaries | Owner | ONB-SCR-003 |
| ONB-SCR-003 | Business Data Readiness | Review the minimum ERP data set | Owner | ONB-SCR-004 |
| ONB-SCR-004 | Connection Plan | Review required simulator connections | Owner | ONB-SCR-005 |
| ONB-SCR-005 | Connector Detail and Test | Run static connector tests and see evidence | Owner; Demo Admin reset only | ONB-SCR-006 |
| ONB-SCR-006 | Policy and Approval Review | Confirm the prepared business policy version | Owner | ONB-SCR-007 |
| ONB-SCR-007 | Guided First Order | Play the happy path from message to closed order | Owner | ONB-SCR-008 |
| ONB-SCR-008 | Guided Exception and Monitoring | Decide an overdue-debt exception and learn Control Tower monitoring | Owner | ONB-SCR-009 |
| ONB-SCR-009 | Readiness Summary | Explain the final result and next steps | Owner | Static demo home or restart |

## 4. ONB-SCR-001 — Welcome and Demo Scope

### Goal

Explain what the demo proves and what it does not prove.

### Required content

- Title: `Set up your OPC Sales Agent`.
- Short value statement: one Owner can supervise the sales workflow while Agent and ERP handle prepared work.
- Visible label: `Static clickable demo — no live systems`.
- Journey summary: `Prepare → Test → Run first order → Handle exception → Monitor`.
- Estimated demo duration.
- Entry choice:
  - `Explore Demo` — enabled and recommended;
  - `Prepare Business` — visible but marked `Future concept`.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-001 | Start Explore Demo | Opens ONB-SCR-002 and saves `Explore Demo`. |
| ONB-ACT-002 | View Prepare Business | Opens a read-only explanation and returns to this screen. |
| ONB-ACT-003 | Skip for now | Opens the static demo home with `Resume onboarding` visible. |

### Required states

Default, Resume available, Demo reset, Mobile layout.

## 5. ONB-SCR-002 — Roles and Control

### Goal

Make the operating model clear before showing setup work.

### Required content

Four simple cards:

| Card | Message |
|---|---|
| Agent | Reads the message, finds candidates, and proposes the next action. |
| ERP | Calculates price, debt, stock, money, and valid states. |
| Owner | Approves risk, confirms physical events, and handles exceptions. |
| Connector | Reports an external event. In this demo, the event is simulated. |

Add a short knowledge check:

`Who is allowed to approve overdue debt?`

The correct answer is `Owner`. A wrong answer shows an explanation and does not move forward.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-004 | Confirm Owner role | Marks the Owner and approver as ready. |
| ONB-ACT-005 | Answer knowledge check | Shows correct/incorrect feedback. |
| ONB-ACT-006 | Continue | Opens ONB-SCR-003 after the check passes. |

## 6. ONB-SCR-003 — Business Data Readiness

### Goal

Show that the Agent cannot operate safely without ERP facts.

### Required readiness cards

| Card ID | Data group | Static example | Default status |
|---|---|---|---|
| ONB-DATA-01 | Customers | Sunrise Hotel, sender mapping, payment terms | Ready |
| ONB-DATA-02 | Products | Two prepared SKUs and sales units | Ready |
| ONB-DATA-03 | Prices | Customer price list and policy version | Ready |
| ONB-DATA-04 | Credit | Current exposure and one overdue example | Ready with warning |
| ONB-DATA-05 | Stock | On-hand, reserved, and ATP values | Ready |

Each card shall show:

- source: `Static ERP seed`;
- what the workflow needs;
- example records;
- status;
- last checked time; and
- `Why this is needed` explanation.

The screen shall provide a Demo Admin control to switch one required card to `Missing`, so the blocked state can be demonstrated.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-007 | Open data card | Shows the prepared records in a read-only drawer. |
| ONB-ACT-008 | Demonstrate missing data | Changes one card to `Missing` and disables Continue. |
| ONB-ACT-009 | Restore static seed | Returns all required cards to their prepared state. |
| ONB-ACT-010 | Confirm data review | Opens ONB-SCR-004 when required cards are ready. |

## 7. ONB-SCR-004 — Connection Plan

### Goal

Create one clear list of the simulated connections required by the sales scenario.

### Connector cards

| Connector ID | Value shown to Owner | Mode | Required for guided order |
|---|---|---|---|
| ONB-CON-01 | Receive hotel order messages | Zalo Simulator | Yes |
| ONB-CON-02 | Plan and confirm delivery | Delivery Simulator | Yes |
| ONB-CON-03 | Record invoice draft and result | Invoice Simulator | Yes |
| ONB-CON-04 | Receive and match payment event | Payment Simulator | Yes |

Each card shall show:

- business value first;
- mode and verification label;
- responsible actor;
- required input fields;
- current status;
- last test result;
- next action; and
- link to evidence.

Do not show tax, marketplace, booking, accounting, or other connectors outside the approved sales scenario.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-011 | Open connector | Opens ONB-SCR-005 for the selected connector. |
| ONB-ACT-012 | Continue after all tests | Opens ONB-SCR-006 when required tests pass. |
| ONB-ACT-013 | Show production boundary | Opens a read-only note explaining why live setup is not available. |

## 8. ONB-SCR-005 — Connector Detail and Test

### Goal

Prove how a connector will be tested without creating a false live-integration claim.

### Required content

- Connector name and business value.
- Label: `Simulated connector`.
- Static event contract summary.
- Example event ID.
- Required fields.
- Test action.
- Result and evidence timeline.
- Failure simulation.
- Retry simulation.
- Back to Connection Plan.

### Test states

| State | Display |
|---|---|
| Not tested | Neutral card and enabled `Run simulated test`. |
| Running | Short progress state; disable duplicate click. |
| Passed | Show event ID, received time, result, and audit link. |
| Failed | Show reason, no business success, and `Retry simulated test`. |
| Duplicate | Show original event link and state that no second business action was created. |
| Not verified | Explain that live API ability is not confirmed. |

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-014 | Run simulated test | Plays one deterministic event and shows the result. |
| ONB-ACT-015 | Simulate failure | Shows failure and keeps the connector not ready. |
| ONB-ACT-016 | Retry simulated test | Uses the same business key and reaches the prepared result. |
| ONB-ACT-017 | Simulate duplicate | Shows deduplication evidence and no second commit. |
| ONB-ACT-018 | Return to plan | Returns to ONB-SCR-004 with updated test status. |

## 9. ONB-SCR-006 — Policy and Approval Review

### Goal

Explain automation limits and collect the Owner's static confirmation.

### Required policy rows

| Policy ID | Prepared value | Explanation |
|---|---|---|
| ONB-POL-01 | Customer/SKU auto-match only at approved confidence and one unique candidate | Agent may rank; ERP applies the gate. |
| ONB-POL-02 | Reservation uses the approved workflow baseline | ERP holds stock; stock is not issued yet. |
| ONB-POL-03 | Every overdue debt requires Owner approval | Agent cannot bypass the rule. |
| ONB-POL-04 | Price outside configuration requires Owner decision | Agent does not invent a discount. |
| ONB-POL-05 | Stock is issued only at physical handover confirmation | Owner confirms the physical event; ERP posts stock. |
| ONB-POL-06 | Refund, reversal, and invoice adjustment require approval | Not used in the first-order happy path. |

The screen shall show policy version, source, effective scope, and a static change-impact preview.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-019 | Open policy explanation | Shows Agent, ERP, and Human responsibility. |
| ONB-ACT-020 | Confirm prepared policy | Saves the static confirmation and policy version. |
| ONB-ACT-021 | Try prohibited Agent action | Shows a blocked result and explains the guardrail. |
| ONB-ACT-022 | Start guided order | Opens ONB-SCR-007 only when readiness gates pass. |

## 10. ONB-SCR-007 — Guided First Order

### Goal

Show the full B2B hotel order workflow without implementing the main MVP.

### Layout

- Left or top: guided step list.
- Main area: simplified preview of the current business screen.
- Right or bottom: `Who acts`, `Source`, `Result`, and `Why`.
- Primary action: `Run next guided step`.
- Optional action: `Show full timeline`.

### Guided steps

| Guided step | Preview | Expected result |
|---|---|---|
| Message received | Simplified Sales Request Inbox | Raw message stored once. |
| Agent extraction | Message evidence card | Customer and SKU candidates proposed. |
| ERP checks | Rule-result card | Price, debt, ATP, and policy result shown. |
| Order and reservation | Simplified Order 360 | Order Draft and active Reservation shown. |
| Picking and handover | Simplified fulfilment card | Stock remains held before handover, then is issued once. |
| Delivery | Connector event card | Simulated delivery confirmation shown. |
| Invoice and receivable | Simplified finance card | Invoice result and Receivable shown. |
| Payment and close | Payment allocation card | Exact match, allocation, Paid, and Closed shown. |

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-023 | Run next guided step | Moves to the next deterministic snapshot. |
| ONB-ACT-024 | Open evidence | Shows the input, source, rule, version, and result. |
| ONB-ACT-025 | Replay current step | Replays the visual explanation without creating a duplicate record. |
| ONB-ACT-026 | Complete happy path | Marks the guided order closed and opens ONB-SCR-008. |

## 11. ONB-SCR-008 — Guided Exception and Monitoring

### Goal

Prove that the Owner stays in control when deterministic rules stop the workflow.

### Part A — Exception decision

Show one overdue-debt case with:

- original message;
- customer and receivable evidence;
- deterministic rule result;
- Agent proposal;
- approval impact;
- approver;
- decision reason; and
- Approve and Reject actions.

Approve continues the prepared workflow after ERP revalidation. Reject closes the exception path and shows compensation/no mutation.

### Part B — Control Tower guide

Show a simplified preview of:

- active workflow;
- waiting human task;
- connector status;
- retryable failure;
- blocked run;
- linked order state; and
- audit entry.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-027 | Approve with reason | Shows Owner decision, ERP revalidation, and new state. |
| ONB-ACT-028 | Reject with reason | Shows no unsafe commit and the prepared compensation result. |
| ONB-ACT-029 | Open workflow detail | Shows Agent, ERP, Human, and Connector steps separately. |
| ONB-ACT-030 | Open audit evidence | Shows append-only decision and state-transition evidence. |
| ONB-ACT-031 | Complete monitoring guide | Opens ONB-SCR-009. |

## 12. ONB-SCR-009 — Readiness Summary

### Goal

Explain what is ready and what is still only a future production dependency.

### Required sections

- Final state: `Ready`, `Ready with conditions`, or `Blocked`.
- Business data result.
- Simulator test result.
- Policy result.
- Guided order result.
- Exception result.
- Monitoring result.
- Production gaps.
- Evidence links.
- Next milestone: `Review static demo with PO/BA/UX/QA`.

### Actions

| Action ID | Action | Result |
|---|---|---|
| ONB-ACT-032 | Open result evidence | Opens the related static screen or timeline. |
| ONB-ACT-033 | Restart guide | Returns to ONB-SCR-001 and keeps the seed. |
| ONB-ACT-034 | Reset full demo | Demo Admin confirmation, then restores the known start state. |
| ONB-ACT-035 | Enter demo home | Opens a static Control Tower preview with onboarding complete. |

## 13. Main click paths

### 13.1 Complete demo path

`ONB-SCR-001 → 002 → 003 → 004 ↔ 005 → 006 → 007 → 008 → 009`

### 13.2 Skip and resume

`Any ONB screen → Skip for now → Demo home → Resume onboarding → Last incomplete ONB screen`

### 13.3 Blocked data path

`ONB-SCR-003 → Demonstrate missing data → Continue disabled → Restore static seed → Continue`

### 13.4 Connector failure path

`ONB-SCR-005 → Simulate failure → Failed → Retry → Passed → Connection Plan`

### 13.5 Approval path

`ONB-SCR-008 → Review evidence → Enter reason → Approve or Reject → ERP revalidation/result → Audit`

## 14. Static fixtures

| Fixture ID | Purpose |
|---|---|
| ONB-FIX-01 | Clean onboarding start. |
| ONB-FIX-02 | One missing ERP data group. |
| ONB-FIX-03 | All simulator tests passed. |
| ONB-FIX-04 | Zalo simulator failed, then retry passed. |
| ONB-FIX-05 | Happy-path guided order. |
| ONB-FIX-06 | Overdue-debt approval case. |
| ONB-FIX-07 | Duplicate payment event. |
| ONB-FIX-08 | Final `Ready with conditions` summary. |

All fixtures must reset to the same values after a full demo reset.

## 15. Responsive behaviour

### Desktop

- Stepper may be a left sidebar.
- Evidence and explanation may use a right panel.
- Guided order may show timeline and screen preview side by side.

### Mobile

- Stepper becomes a compact top progress bar.
- Evidence opens in a full-screen sheet or drawer state.
- Primary action stays visible at the bottom.
- Tables become cards; no horizontal scroll for the main path.

### Required review sizes

- Mobile narrow width.
- Mobile wide width.
- Standard desktop width.

Exact breakpoint values are a DEV/UX implementation choice for the static demo, but the same content and click path must remain available.

## 16. Copy and claim rules

Always show:

- `Static demo`;
- `Simulated connector`;
- `Not verified for live use` where relevant; and
- source labels for Agent, ERP, Human, and Connector.

Never show:

- `Live connected`;
- `Legally issued invoice`;
- `Production ready`;
- `Bank verified`;
- `Zalo connected`; or
- any live price, SLA, legal rule, or API promise that has not been approved.
