# PRODUCT BACKLOG

**Product:** OPC Sales Operations Agent  
**Release:** Domain MVP / demo prototype  
**Status:** Draft for refinement; not ready for sprint commitment  
**Source:** PRD, Workflow, and UX/UI specifications in folders `01`–`03`  
**SRS status:** `04_SRS` is empty. FR/NFR IDs cannot be mapped yet.  
**Date:** 20 August 2026

## 1. Backlog rules

- The backlog follows the approved vertical order from message intake to Control Tower and audit.
- `Must`, `Should`, and `Could` show product priority for the demo.
- Relative estimate uses `S`, `M`, and `L`. It is a planning estimate, not story points or days. DEV must calibrate it during refinement.
- Every story is small enough for one clear outcome. A story marked `L` must be reviewed for a further technical split without changing its business outcome.
- All stories are currently `Not Ready` because SRS FR/NFR mapping is missing. Some stories have extra blockers listed in their dependency.
- Business commands, database design, API shape, and framework choices are not defined here.

## 2. Definition of Ready

A story is Ready only when:

1. The Product Owner is named and confirms priority and scope.
2. The story maps to approved PRD, Workflow, SRS FR/NFR, and Screen IDs.
3. Business states, permissions, validation, timeout, retry, idempotency, and compensation are clear where relevant.
4. Given–When–Then AC can be tested with named test data.
5. Required simulator or integration contract is available.
6. UX open questions that affect the story are closed.
7. DEV and QA understand dependencies and can estimate the story.
8. No unresolved document defect changes the expected result.

**Current result:** condition 2 fails for every story because `04_SRS` has no file.

## 3. Definition of Done

A story is Done only when:

1. All AC pass in the agreed test environment.
2. Deterministic rules, permissions, idempotency, error handling, and audit behavior pass relevant automated tests.
3. No AI component directly commits inventory, money, price calculation, approval result, or final business state.
4. Tenant isolation checks pass for all affected queries and commands.
5. Responsive behavior passes on agreed desktop and mobile sizes.
6. Offline mode blocks mutation and shows the age of cached data.
7. UAT evidence is stored and linked to the story and requirement IDs.
8. No open critical defect remains in inventory, money, approval, tenant context, state transition, or audit.
9. Traceability and release notes are updated.

## 4. Test data baseline

| Data ID | Purpose |
|---|---|
| TEN-A | Seeded company `Gia Lai Foods A`. |
| TEN-B | Seeded company `Highland Foods B` for tenant isolation. |
| CUST-A-OK | Active hotel customer in TEN-A, valid sender mapping, no overdue debt. |
| CUST-A-OVERDUE | Active hotel customer in TEN-A with at least one overdue receivable. |
| CUST-A-AMB | Two customer candidates for one sender/message. |
| SKU-A-FISH-750 | Active SKU with configured unit and enough stock for happy path. |
| SKU-A-DRY-1KG | Active SKU with limited stock for shortage/concurrency cases. |
| SKU-A-AMB | Two SKU aliases that can match one phrase. |
| PRICE-A | Active standard price list for TEN-A. |
| PROMO-A | Owner-created discount program with explicit scope, value, validity, and limit. |
| MSG-A-HAPPY | Complete Vietnamese hotel order message. |
| MSG-A-MISSING | Message without required quantity or delivery data. |
| MSG-A-UNKNOWN-SKU | Message with an unknown or ambiguous product phrase. |
| PAY-A-EXACT | Unique payment event with exact supported reference and exact outstanding amount. |
| PAY-A-MISMATCH | Partial, excess, combined, or missing-reference payment variants. |
| EVT-A-DUP | Replayed inbound or payment event with the same provider/source ID. |

## 5. Backlog summary

| Epic | Vertical slice | Priority | Story range |
|---|---|---|---|
| EP-01 | Message to validated order intent | Must | US-101–US-103 |
| EP-02 | Customer, product, price, and debt checks | Must | US-201–US-204 |
| EP-03 | Available stock and reservation | Must | US-301–US-304 |
| EP-04 | Exception review and approval | Must | US-401–US-404 |
| EP-05 | Picking, handover, and delivery | Must | US-501–US-503 |
| EP-06 | Invoice workflow | Must | US-601–US-603 |
| EP-07 | Receivable, payment, and reconciliation | Must | US-701–US-704 |
| EP-08 | Control Tower, workflow recovery, audit, and demo shell | Must/Should | US-801–US-806 |

# EP-01 — Message to validated order intent

## Feature F-01.1 — Safe inbound intake

### US-101 — Ingest one simulated Zalo message once

**As a** Owner-Operator  
**I want to** receive each hotel order message once in the Sales Inbox  
**So that** duplicate connector delivery does not create duplicate work.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | Tenant context; Zalo simulator event contract; audit service |
| Test data | TEN-A, MSG-A-HAPPY, EVT-A-DUP |
| Requirement IDs | PRD-028, PRD-049, PRD-080, PRD-094, PRD-136; SRS FR/NFR: MISSING |
| Screen IDs | SCR-002, SCR-010, SCR-011 |
| Workflow | WF-001; MSG-01; RUN-01; DAM-001 |

#### AC1 — New event
- **Given** a valid TEN-A message event with a new source event ID
- **When** the simulator sends the event
- **Then** the system creates one Message and one Workflow Run
- **And** the Inbox shows the original message, source ID, received time, tenant, and simulator label.

#### AC2 — Duplicate event
- **Given** the message event was already accepted
- **When** the same tenant, source, and source event ID are sent again
- **Then** no second Message or Workflow Run is created
- **And** the duplicate result is recorded in audit.

#### AC3 — Invalid envelope
- **Given** an inbound event has no tenant ID or source event ID
- **When** the event is received
- **Then** the event is rejected without a business case
- **And** no order or reservation is created.

### US-102 — Extract order candidates with evidence

**As a** Owner-Operator  
**I want to** see the Agent's extraction and confidence beside the original message  
**So that** I can understand what the Agent found before ERP data changes.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-101; Agent output schema; labeled Vietnamese message set |
| Test data | MSG-A-HAPPY, MSG-A-UNKNOWN-SKU |
| Requirement IDs | PRD-029, PRD-097, PRD-098, PRD-117, PRD-128, PRD-149; SRS FR/NFR: MISSING |
| Screen IDs | SCR-002, SCR-010 |
| Workflow | WF-002; MSG-02–MSG-04; DAM-002 |

#### AC1 — Valid extraction
- **Given** a stored message and an active Workflow Run
- **When** extraction succeeds with a valid schema
- **Then** the Inbox shows customer, product, quantity, unit, delivery, invoice, and payment-term candidates
- **And** each AI result is labelled `Agent proposal — not applied` with confidence and evidence.

#### AC2 — Invalid Agent output
- **Given** the Agent returns an invalid or incomplete output schema
- **When** ERP validates the result
- **Then** the invalid result is not used to change a business record
- **And** the message follows the defined retry or failure path.

#### AC3 — Audit evidence
- **Given** extraction has completed
- **When** the Owner opens Workflow Run or Audit
- **Then** model/prompt version, input hash, candidates, confidence, result, and time are visible without exposing secrets.

## Feature F-01.2 — Clarification and message recovery

### US-103 — Ask for missing order information

**As a** Owner-Operator  
**I want to** review and send a short clarification when order data is missing  
**So that** the workflow does not guess quantity, unit, delivery, or invoice data.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-102; outbound Zalo simulator; required-field schema |
| Test data | MSG-A-MISSING |
| Requirement IDs | PRD-029, PRD-098, PRD-100, PRD-117, PRD-151; SRS FR/NFR: MISSING |
| Screen IDs | SCR-002, SCR-005, SCR-010 |
| Workflow | WF-005; MSG-05, MSG-07, MSG-11; APR-003 |

#### AC1 — Missing data
- **Given** a parsed message is missing a required field
- **When** ERP validates the extraction
- **Then** the Message becomes `NEEDS_INFO`
- **And** no reservation or confirmed order is created.

#### AC2 — Owner sends clarification
- **Given** the Agent has drafted a clarification and the Owner sees the missing fields
- **When** the Owner reviews and sends the draft
- **Then** the outbound message ID and final text are recorded
- **And** the case waits for a linked customer reply.

#### AC3 — Reply creates a new version
- **Given** a linked reply is received with a new source event ID
- **When** it is parsed
- **Then** the system creates a new input/extraction version while keeping the old raw messages
- **And** validation runs again.

# EP-02 — Customer, product, price, and debt checks

## Feature F-02.1 — Master-data matching

### US-201 — Match a customer with a safe confidence gate

**As a** Owner-Operator  
**I want to** auto-match only one clear customer or review uncertain candidates  
**So that** the order uses the correct customer, price, invoice profile, and debt.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-102; customer master and sender mapping; confidence policy |
| Test data | CUST-A-OK, CUST-A-AMB |
| Requirement IDs | PRD-030, PRD-104, PRD-138, PRD-151; SRS FR/NFR: MISSING |
| Screen IDs | SCR-002, SCR-005, SCR-006 |
| Workflow | WF-003; MSG-06, MSG-08; APR-001; DAM-003 |

#### AC1 — Safe auto-match
- **Given** one active customer candidate has score at least 0.90 and no main-field conflict
- **When** ERP applies the match rule
- **Then** the customer is selected for the order intent
- **And** the score, evidence, rule version, and selected customer are audited.

#### AC2 — Ambiguous match
- **Given** the score is below 0.90, more than one candidate exists, or a main field conflicts
- **When** matching completes
- **Then** the case enters Owner review with no customer committed
- **And** the Owner can inspect candidates in SCR-006.

#### AC3 — Human selection
- **Given** a current review task and an active same-tenant customer
- **When** the Owner selects the customer with a reason
- **Then** the selection is stored as a new decision event and validation runs again
- **And** a cross-tenant or stale selection is rejected.

### US-202 — Match an SKU and unit safely

**As a** Owner-Operator  
**I want to** confirm an uncertain product or unit before pricing and reservation  
**So that** the order does not use the wrong SKU or quantity conversion.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-102; product, alias, and unit master data |
| Test data | SKU-A-FISH-750, SKU-A-AMB, MSG-A-UNKNOWN-SKU |
| Requirement IDs | PRD-031, PRD-100, PRD-138, PRD-151; SRS FR/NFR: MISSING |
| Screen IDs | SCR-002, SCR-005, SCR-007 |
| Workflow | WF-004; MSG-06, MSG-08; APR-002; DAM-004 |

#### AC1 — Safe auto-match
- **Given** one active SKU/unit candidate has score at least 0.90 and no conflict
- **When** ERP validates the Agent candidate
- **Then** the SKU and configured unit are selected
- **And** no new SKU or unit conversion is created by AI.

#### AC2 — Unknown or ambiguous product
- **Given** no active unique SKU/unit passes the gate
- **When** matching completes
- **Then** the line is blocked for Owner review or customer clarification
- **And** price and reservation do not continue for that line.

#### AC3 — Owner selection
- **Given** a current review task
- **When** the Owner selects an active same-tenant SKU and configured unit with a reason
- **Then** the line is versioned and price, debt, and ATP checks run again.

## Feature F-02.2 — Commercial and credit checks

### US-203 — Apply deterministic price and Owner discount policy

**As a** Owner-Operator  
**I want to** use the correct price list, contract, or Owner-created discount program  
**So that** the Agent never invents or negotiates a price.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-201, US-202; PRICE-A; price-program schema decision UX-OQ-012 |
| Test data | PRICE-A, PROMO-A, CUST-A-OK, SKU-A-FISH-750 |
| Requirement IDs | PRD-032, PRD-033, PRD-075, PRD-092, PRD-103, PRD-108; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-012 |
| Workflow | WF-006, WF-008; DAM-006, DAM-007; APR-005 |

#### AC1 — Valid configured price
- **Given** an active price source applies to the customer, date, and SKU
- **When** ERP calculates the order
- **Then** line totals, discount, and tax inputs use the stored policy and formula version
- **And** the UI shows the price source and `ERP checked` result.

#### AC2 — Price outside configuration
- **Given** the customer requests a price not covered by an active configuration
- **When** the commercial check runs
- **Then** the price is not changed automatically
- **And** an Owner decision task is created without an AI discount value.

#### AC3 — Missing price
- **Given** no valid price source exists
- **When** ERP checks the order
- **Then** the workflow becomes blocked and no reservation or confirmation is created.

### US-204 — Check debt exposure and stop overdue customers for approval

**As a** Owner-Operator  
**I want to** see current debt and new exposure before I confirm an overdue customer's order  
**So that** I make a deliberate credit decision.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-201, US-203; receivable data; approval service |
| Test data | CUST-A-OK, CUST-A-OVERDUE |
| Requirement IDs | PRD-032, PRD-035, PRD-099, PRD-109, PRD-164; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-006, SCR-009 |
| Workflow | WF-007; APR-004; DAM-008 |

#### AC1 — Customer without overdue debt
- **Given** the customer has no overdue receivable
- **When** ERP calculates open debt and new exposure
- **Then** the order may continue if all other rules pass
- **And** the debt snapshot and rule result are audited.

#### AC2 — Overdue customer
- **Given** at least one receivable is overdue
- **When** the debt check runs
- **Then** the order cannot be confirmed until the Owner decides
- **And** the task shows total debt, overdue amount, age, due dates, and new exposure.

#### AC3 — Reminder does not decide
- **Given** an overdue-debt task has waited 15 minutes
- **When** the reminder becomes due
- **Then** the task remains `WAITING_HUMAN`
- **And** no automatic approval or rejection occurs.

# EP-03 — Available stock and reservation

## Feature F-03.1 — ATP and atomic reservation

### US-301 — Calculate available-to-promise stock

**As a** Owner-Operator  
**I want to** see available stock after active reservations  
**So that** I do not promise stock already held by another order.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | Product and inventory master; active reservation data |
| Test data | SKU-A-FISH-750, SKU-A-DRY-1KG |
| Requirement IDs | PRD-058, PRD-083, PRD-094, PRD-110, PRD-141; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-007 |
| Workflow | WF-009; DAM-009; INV-A |

#### AC1 — ATP calculation
- **Given** a SKU has on-hand stock and active reservations
- **When** ERP checks availability
- **Then** ATP equals on-hand minus active and extended reservation quantities
- **And** the UI shows on-hand, reserved, ATP, version, and calculation time separately.

#### AC2 — Insufficient ATP
- **Given** requested quantity is greater than ATP
- **When** the stock check runs
- **Then** the request is blocked from reservation
- **And** no user or Agent can approve negative stock.

### US-302 — Create an order draft and reservation atomically

**As a** Owner-Operator  
**I want to** create the draft order and its stock hold as one safe operation  
**So that** the order cannot exist as reserved without a valid hold.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-201–US-204, US-301; deterministic transaction and state service |
| Test data | CUST-A-OK, SKU-A-FISH-750, MSG-A-HAPPY |
| Requirement IDs | PRD-034, PRD-058, PRD-105, PRD-126, PRD-139, PRD-141; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-007, SCR-010 |
| Workflow | WF-010; ORD-01; RSV-01, RSV-06; DAM-010; INV-A |

#### AC1 — Successful transaction
- **Given** all commercial checks pass and ATP is enough
- **When** the workflow requests draft and reservation creation
- **Then** ERP rechecks ATP and creates both records in one transaction
- **And** Order is `RESERVED` and Reservation is `ACTIVE` with a 60-minute expiry.

#### AC2 — Concurrent conflict
- **Given** another workflow consumes the remaining ATP before commit
- **When** this transaction rechecks ATP
- **Then** neither the reserved order state nor an active reservation is committed
- **And** the case enters shortage review.

#### AC3 — Idempotent retry
- **Given** the transaction already succeeded
- **When** the same command ID is retried
- **Then** the existing order and reservation are returned
- **And** no second hold is created.

## Feature F-03.2 — Reservation lifecycle

### US-303 — Extend or expire a reservation safely

**As a** Owner-Operator  
**I want to** extend one valid reservation once and release it at expiry  
**So that** stock is not held forever.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-302; server time; timer service; policy version |
| Test data | Active reservation in TEN-A |
| Requirement IDs | PRD-058, PRD-065, PRD-105, PRD-106; SRS FR/NFR: MISSING |
| Screen IDs | SCR-001, SCR-004, SCR-005, SCR-007 |
| Workflow | WF-011; RSV-02, RSV-05; APR-007 |

#### AC1 — One extension
- **Given** the reservation is active, not expired, and has not been extended
- **When** the Owner confirms extension
- **Then** a new reservation version adds 30 minutes
- **And** the actor, old expiry, new expiry, and reason are audited.

#### AC2 — Invalid extension
- **Given** the reservation expired or was already extended once
- **When** an extension is requested
- **Then** the request is rejected without changing ATP or the old record.

#### AC3 — Expiry
- **Given** an active or extended reservation reaches its expiry before handover
- **When** the timer processes expiry
- **Then** the reservation becomes `EXPIRED` and ATP is released
- **And** on-hand stock does not increase.

### US-304 — Cancel an order before handover and release its hold

**As a** Owner-Operator  
**I want to** cancel a pre-handover order with a reason  
**So that** held stock returns to ATP without creating a false stock receipt.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-302; order/shipment/reservation state service |
| Test data | Reserved, confirmed, and picking orders without stock issue |
| Requirement IDs | PRD-059, PRD-106, PRD-153; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-008, SCR-010, SCR-011 |
| Workflow | ORD-10; RSV-04; SHP-08; RUN-10–RUN-11 |

#### AC1 — Valid cancellation
- **Given** an order has not reached handover and has no stock issue
- **When** the Owner confirms cancellation with a reason
- **Then** the order and unhanded shipment become `CANCELLED`
- **And** the reservation becomes `RELEASED` while on-hand stays unchanged.

#### AC2 — Cancellation after handover
- **Given** the stock issue was committed at handover
- **When** the Owner tries the pre-handover cancel action
- **Then** the action is blocked
- **And** the Owner is directed to the delivery/return correction flow.

# EP-04 — Exception review and approval

## Feature F-04.1 — Decision queue and safe approval

### US-401 — Review a complete decision package

**As a** Owner-Operator  
**I want to** see the evidence and impact for each exception in one queue  
**So that** I can make a safe decision quickly.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | Approval Request state machine UX-OQ-001; US-201–US-204, US-301 |
| Test data | Customer, SKU, debt, price, shortage, invoice, and payment tasks |
| Requirement IDs | PRD-035, PRD-063, PRD-088, PRD-099–PRD-101, PRD-116; SRS FR/NFR: MISSING |
| Screen IDs | SCR-001, SCR-004, SCR-005 |
| Workflow | APR-001–APR-016; DAM-003–DAM-024; RUN-03 |

#### AC1 — Decision package
- **Given** a current exception task exists
- **When** the Owner opens it
- **Then** the screen shows tenant, entity/version, current state, original trigger, Agent proposal, confidence/evidence, ERP rule result, impact, compensation, approver, waiting time, and reservation expiry when relevant.

#### AC2 — Source distinction
- **Given** the task contains AI, ERP, human, and connector information
- **When** it is displayed
- **Then** each item has the correct source label
- **And** an Agent proposal is never shown as an applied result.

#### AC3 — Demo Admin access
- **Given** a Demo Admin opens a tenant task
- **When** the task detail loads
- **Then** it is read-only
- **And** Approve, Reject, and review-selection actions are not allowed.

### US-402 — Approve or reject only the current task version

**As a** Owner-Operator  
**I want to** approve or reject a current exception with a reason  
**So that** stale or reused decisions cannot change the wrong order.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-401; formal Approval Request states; permission service |
| Test data | Open, stale, rejected, and expired task versions |
| Requirement IDs | PRD-026, PRD-099–PRD-102, PRD-145, PRD-150, PRD-170; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-011 |
| Workflow | RUN-04; ORD-04–ORD-06; approval rules 1–8 |

#### AC1 — Approve current task
- **Given** the task is open, current, same-tenant, and all non-overridable rules still pass
- **When** the Owner approves with a reason
- **Then** the approval is recorded for that entity and version
- **And** ERP revalidates before applying the next transition.

#### AC2 — Reject current task
- **Given** the task is open and current
- **When** the Owner rejects with a reason
- **Then** the task is rejected and the defined cancel, release, or safe fallback runs
- **And** the old task remains in immutable history.

#### AC3 — Stale decision
- **Given** the entity changed after the task was opened
- **When** the Owner submits a decision using the old version
- **Then** no business mutation occurs
- **And** the UI loads the current task or asks for a new decision.

#### AC4 — Reminder or overdue
- **Given** a decision task reaches its reminder or overdue time
- **When** the timer records the event
- **Then** the task remains waiting for the Owner
- **And** no automatic approval, rejection, refund, or invoice adjustment occurs.

## Feature F-04.2 — Sales exceptions

### US-403 — Decide a stock-shortage alternative

**As a** Owner-Operator  
**I want to** offer verified shortage options and record the customer's choice  
**So that** the order continues without negative stock.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-301, US-401, US-402; customer response evidence |
| Test data | SKU-A-DRY-1KG with requested quantity above ATP |
| Requirement IDs | PRD-036, PRD-110, PRD-152; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-007 |
| Workflow | WF-009; ORD-05P; APR-006; DAM-009 |

#### AC1 — Show safe alternatives
- **Given** requested quantity is greater than ATP
- **When** the shortage task is created
- **Then** the Owner sees current stock facts and Agent proposals for partial quantity, substitute, or later date
- **And** no option is committed before Owner and customer decisions.

#### AC2 — Customer accepts partial quantity
- **Given** the customer accepts a defined immediate quantity and remainder
- **When** the Owner records the response
- **Then** the current order gets a new version for the immediate quantity
- **And** a linked Order Draft is created for the remainder without automatic reservation.

#### AC3 — Customer rejects the proposal
- **Given** the customer rejects all shortage options
- **When** the Owner records rejection
- **Then** the current order is cancelled or returned to draft by the defined rule
- **And** any active reservation is released.

### US-404 — Set an Owner price decision outside current configuration

**As a** Owner-Operator  
**I want to** enter or select the discount program for an out-of-policy price request  
**So that** the system applies my decision instead of an AI-generated discount.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-203, US-401, US-402; UX-OQ-012 price-program schema; PRD/workflow wording defect DD-001 |
| Test data | PRICE-A, PROMO-A, customer request beyond PROMO-A limit |
| Requirement IDs | PRD-035, PRD-075, PRD-099, PRD-108, PRD-150; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-012 |
| Workflow | WF-008; APR-005; DAM-007 |

#### AC1 — Agent does not choose the value
- **Given** a customer asks for a price outside active configuration
- **When** the workflow creates a price decision task
- **Then** no discount percentage is preselected by AI
- **And** the standard price and request impact are visible.

#### AC2 — Owner sets a valid price decision
- **Given** the Owner provides the required program or order-price scope, value, validity, and reason
- **When** the decision is submitted
- **Then** ERP creates a new policy/order-price version and recalculates the order
- **And** price, debt, and ATP checks run again.

#### AC3 — Owner rejects the request
- **Given** the price task is current
- **When** the Owner rejects it with a reason
- **Then** the order keeps the standard configured price or returns for customer confirmation
- **And** no AI price is applied.

# EP-05 — Picking, handover, and delivery

## Feature F-05.1 — Delivery planning

### US-501 — Select a carrier option

**As a** Owner-Operator  
**I want to** review available delivery options and select one  
**So that** fulfilment uses a known carrier fact, not an Agent guess.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-302; carrier simulator facts; delivery timeout decision |
| Test data | Confirmed TEN-A order with active reservation; two carrier options |
| Requirement IDs | PRD-038, PRD-060, PRD-085, PRD-134, PRD-175; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-008, SCR-012 |
| Workflow | WF-013; SHP-01–SHP-02; APR-009 |

#### AC1 — Show verified options
- **Given** an order is ready for fulfilment
- **When** carrier options are requested
- **Then** the Owner sees only options returned by the carrier simulator or configured source
- **And** the Agent may rank them but cannot create a carrier fact.

#### AC2 — Select one option
- **Given** a current delivery option is available
- **When** the Owner selects it
- **Then** one Shipment is created with the selected service, cost, and expected time
- **And** the decision and source facts are audited.

#### AC3 — No valid option
- **Given** no carrier option is available or the request times out
- **When** delivery planning ends
- **Then** the order remains reserved within its valid time
- **And** an exception task is shown without automatic carrier selection.

## Feature F-05.2 — Physical fulfilment

### US-502 — Pick and hand over stock atomically

**As a** Warehouse Operator  
**I want to** confirm picking and carrier handover against the reservation  
**So that** stock changes once at the correct physical event.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-303, US-501; warehouse event and atomic transaction design |
| Test data | Active reservation for SKU-A-FISH-750; duplicate handover event |
| Requirement IDs | PRD-039, PRD-058, PRD-107, PRD-153, PRD-167; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-007, SCR-008, SCR-011 |
| Workflow | WF-014; ORD-09–ORD-11; RSV-03; SHP-03–SHP-04 |

#### AC1 — Picking does not issue stock
- **Given** the reservation is active
- **When** picking is confirmed
- **Then** the Shipment becomes ready for handover
- **And** on-hand stock is not reduced.

#### AC2 — Handover consumes reservation and stock once
- **Given** picked goods and an active reservation match the order version
- **When** carrier handover is confirmed
- **Then** ERP atomically consumes the reservation, reduces on-hand stock, and marks the Shipment handed over
- **And** all three results use one transaction reference.

#### AC3 — Invalid or repeated handover
- **Given** the reservation is expired, changed, already consumed, or the handover event is repeated
- **When** handover is submitted
- **Then** no second stock issue occurs
- **And** the conflict or idempotent result is audited.

### US-503 — Handle delivery failure and physical return

**As a** Owner-Operator  
**I want to** manage failed delivery, redelivery, and return receipt  
**So that** delivery problems do not create false stock.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-502; carrier status events; warehouse return receipt |
| Test data | Handed-over shipment; failed delivery event; physical return event |
| Requirement IDs | PRD-060, PRD-107, PRD-140, PRD-167; SRS FR/NFR: MISSING |
| Screen IDs | SCR-001, SCR-004, SCR-005, SCR-008, SCR-011 |
| Workflow | WF-015; SHP-05–SHP-10; APR-010 |

#### AC1 — Delivery success
- **Given** a handed-over Shipment
- **When** a valid delivered event is received
- **Then** the Shipment and Order become delivered
- **And** the workflow may start invoice drafting.

#### AC2 — Delivery failure
- **Given** stock was already issued at handover
- **When** a failed delivery event is received
- **Then** the Shipment becomes delivery failed and an exception task is created
- **And** stock is not increased automatically.

#### AC3 — Redelivery
- **Given** the Owner approves a valid redelivery option
- **When** the decision is applied
- **Then** the Shipment follows the approved redelivery path
- **And** no new stock issue is created for the same handed-over goods.

#### AC4 — Physical return
- **Given** returned goods are physically received and checked
- **When** the Warehouse Operator records the return receipt
- **Then** ERP creates a separate stock receipt compensation
- **And** the receipt links to the original stock issue and audit trail.

# EP-06 — Invoice workflow

## Feature F-06.1 — Invoice draft and submission

### US-601 — Create an invoice draft after delivery

**As a** Finance Operator  
**I want to** review an invoice draft created from delivered order facts  
**So that** invoice data is complete and deterministic.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-503; invoice field specification; tax rules in ERP |
| Test data | Delivered TEN-A order with customer invoice data |
| Requirement IDs | PRD-040, PRD-061, PRD-103, PRD-132, PRD-159; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-009, SCR-012 |
| Workflow | WF-016; INV-01–INV-02 |

#### AC1 — Correct start condition
- **Given** the order is not delivered
- **When** invoice drafting is requested
- **Then** no Invoice Draft is created.

#### AC2 — Deterministic draft
- **Given** the order is delivered and required invoice data exists
- **When** ERP creates the draft
- **Then** customer, items, quantity, price, tax, total, and order reference come from ERP records
- **And** the UI labels the provider as a simulator.

#### AC3 — Missing invoice data
- **Given** required invoice data is missing
- **When** draft validation runs
- **Then** the Invoice stays in an exception state
- **And** a correction task lists the missing fields without guessed values.

### US-602 — Submit an invoice once and process its result

**As a** Finance Operator  
**I want to** submit an approved invoice draft idempotently  
**So that** repeated requests do not create duplicate invoices.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-601; invoice simulator contract and result codes |
| Test data | Valid Invoice Draft; duplicate submit event; rejected result |
| Requirement IDs | PRD-040, PRD-049, PRD-061, PRD-106, PRD-132; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-009, SCR-010, SCR-011 |
| Workflow | WF-017; INV-03–INV-07 |

#### AC1 — Accepted result
- **Given** a valid current Invoice Draft
- **When** it is submitted to the simulator
- **Then** one submission reference is stored
- **And** an accepted result changes the Invoice to issued.

#### AC2 — Duplicate submission
- **Given** the same invoice version and idempotency key were submitted
- **When** the request is repeated
- **Then** the prior result is returned
- **And** no second Invoice is issued.

#### AC3 — Rejected result
- **Given** the simulator rejects the invoice
- **When** the result is processed
- **Then** the Invoice becomes rejected and a Finance correction task is created
- **And** the rejection code and message are visible and audited.

### US-603 — Approve an invoice adjustment

**As a** Finance Operator  
**I want to** request an Owner decision for a material invoice adjustment  
**So that** financial records are not changed without authority.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-602, US-401, US-402; invoice adjustment rules |
| Test data | Rejected or issued simulator invoice requiring correction |
| Requirement IDs | PRD-043, PRD-062, PRD-113, PRD-137; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-009, SCR-011 |
| Workflow | WF-018; INV-08–INV-10; APR-011 |

#### AC1 — Decision package
- **Given** an invoice adjustment requires approval
- **When** the task is opened
- **Then** current values, proposed changes, reason, impact, evidence, and version are shown.

#### AC2 — Approved adjustment
- **Given** the Owner approves the current task with a reason
- **When** ERP validates the decision
- **Then** a new invoice version or simulator adjustment is created by the defined rule
- **And** the old record remains traceable.

#### AC3 — Rejected adjustment
- **Given** the current task is rejected
- **When** the decision is stored
- **Then** no invoice value changes
- **And** the Finance Operator sees the next safe action.

# EP-07 — Receivable, payment, and reconciliation

## Feature F-07.1 — Receivable and payment intake

### US-701 — Open a receivable with a unique reference

**As a** Finance Operator  
**I want to** create a receivable from an issued invoice  
**So that** payment can be matched to an exact outstanding amount.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-602; receivable reference format |
| Test data | Issued invoice for CUST-A-OK |
| Requirement IDs | PRD-041, PRD-078, PRD-104, PRD-141; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-009 |
| Workflow | WF-019; RCV-01–RCV-02 |

#### AC1 — Open receivable
- **Given** an Invoice is issued and no Receivable exists for it
- **When** ERP opens the Receivable
- **Then** it stores one unique payment reference, original amount, outstanding amount, due date, customer, invoice, and order links.

#### AC2 — Repeat event
- **Given** a Receivable already exists for the Invoice
- **When** opening is requested again
- **Then** the existing Receivable is returned
- **And** no duplicate outstanding balance is created.

### US-702 — Ingest and auto-match an exact payment

**As a** Finance Operator  
**I want to** auto-match only a unique exact payment  
**So that** money is allocated by deterministic rules.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-701; payment simulator contract; idempotency key |
| Test data | PAY-A-EXACT, EVT-A-DUP |
| Requirement IDs | PRD-042, PRD-049, PRD-063, PRD-078, PRD-104, PRD-141; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-009, SCR-010, SCR-011 |
| Workflow | WF-019; PAY-01–PAY-05; RCV-03 |

#### AC1 — Exact unique match
- **Given** one open Receivable has the exact supported reference and outstanding amount
- **When** a valid payment event arrives
- **Then** ERP creates one Payment and one allocation to that Receivable
- **And** the match rule, references, and balances are audited.

#### AC2 — Duplicate payment event
- **Given** the tenant, source, and payment event ID were already accepted
- **When** the event is sent again
- **Then** no second Payment or allocation is created.

#### AC3 — AI boundary
- **Given** a payment description contains unstructured text
- **When** the Agent suggests candidates
- **Then** AI suggestions do not allocate money
- **And** only the deterministic exact-match rule can auto-apply the payment.

## Feature F-07.2 — Reconciliation exceptions and closure

### US-703 — Review a payment mismatch

**As a** Finance Operator  
**I want to** review partial, excess, combined, reversed, or unidentified payments  
**So that** money changes require evidence and authority.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-702, US-401, US-402; refund/reversal rules and payment contract |
| Test data | PAY-A-MISMATCH variants |
| Requirement IDs | PRD-043, PRD-063, PRD-112, PRD-137, PRD-156; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-005, SCR-009, SCR-011 |
| Workflow | WF-020; PAY-06–PAY-12; APR-012 |

#### AC1 — Create review task
- **Given** exact auto-match conditions are not met
- **When** the payment is processed
- **Then** no automatic allocation or refund occurs
- **And** a review task shows payment facts, candidate Receivables, balance impact, evidence, and confidence where used.

#### AC2 — Approve a supported allocation
- **Given** the Owner selects a valid allocation and provides a reason
- **When** ERP validates amount, version, and permission
- **Then** the allocation is applied once
- **And** new outstanding balances are calculated deterministically.

#### AC3 — Refund or reversal
- **Given** a refund or reversal is requested
- **When** the Owner approves it
- **Then** ERP follows the configured financial process or keeps the task blocked if that process is missing
- **And** no Agent directly moves money.

#### AC4 — Reject proposal
- **Given** the Owner rejects the Agent proposal
- **When** the decision is stored
- **Then** the payment remains unallocated or follows the selected safe action
- **And** the rejection reason is audited.

### US-704 — Close an order only after full payment

**As a** Owner-Operator  
**I want to** close an order only when all required business facts are complete  
**So that** delivery or a proposed financial exception cannot hide debt.

| Field | Value |
|---|---|
| Priority / Estimate | Must / M |
| Dependency | US-503, US-602, US-701–US-703; resolve DD-002 and DD-004 about write-off wording |
| Test data | Delivered/issued order with zero and non-zero outstanding balances |
| Requirement IDs | PRD-044, PRD-064, PRD-142; SRS FR/NFR: MISSING |
| Screen IDs | SCR-001, SCR-004, SCR-009, SCR-011 |
| Workflow | WF-021; ORD-14–ORD-15; RCV-04 |

#### AC1 — Full-payment close
- **Given** delivery and invoice are complete and total outstanding amount is zero
- **When** ERP evaluates the close gate
- **Then** the Receivable becomes paid and the Order becomes closed.

#### AC2 — Outstanding amount remains
- **Given** any required Receivable has an outstanding amount above zero
- **When** the close gate runs
- **Then** the Order does not close
- **And** the remaining amount is visible.

#### AC3 — Write-off is not an MVP close path
- **Given** a user requests a write-off
- **When** the request is evaluated in this MVP
- **Then** no write-off closes the Receivable
- **And** the request is recorded as outside MVP pending source-document alignment.

# EP-08 — Control Tower, recovery, audit, and demo shell

## Feature F-08.1 — Operational control

### US-801 — Prioritize work in Control Tower

**As a** Owner-Operator  
**I want to** see blocked, overdue, failed, and next-best work across the case  
**So that** one person can focus on decisions that need attention.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-101–US-704; task priority and timer rules |
| Test data | Mixed happy, blocked, overdue, and failed TEN-A cases |
| Requirement IDs | PRD-045, PRD-065, PRD-086, PRD-114, PRD-144; SRS FR/NFR: MISSING |
| Screen IDs | SCR-001, SCR-005 |
| Workflow | WF-022; DAM-003–DAM-005 |

#### AC1 — Operational summary
- **Given** TEN-A has active cases in different states
- **When** the Owner opens Control Tower
- **Then** counts and queues are calculated from current ERP/workflow states
- **And** each item links to the exact case and next action.

#### AC2 — Timer meaning
- **Given** an order-blocking task waits 15 minutes or a financial task waits 4 hours
- **When** its timer is evaluated
- **Then** the UI marks reminder or overdue status as defined
- **And** it does not make the decision automatically.

#### AC3 — Tenant scope
- **Given** the user is working in TEN-A
- **When** Control Tower loads
- **Then** no TEN-B count, customer, order, task, or amount is shown.

### US-802 — Inspect one continuous Order 360 case

**As a** Owner-Operator  
**I want to** inspect the full message-to-money case in one view  
**So that** I can understand status, evidence, and pending action without opening many systems.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-101–US-704; cross-entity read model |
| Test data | Complete happy case and one exception case |
| Requirement IDs | PRD-045, PRD-066, PRD-115, PRD-145; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004 |
| Workflow | WF-022; all linked entity states |

#### AC1 — Full case view
- **Given** a user can access the order tenant
- **When** Order 360 opens
- **Then** it shows original message, extraction, customer, items, price, debt, reservation, Shipment, Invoice, Receivable, Payment, tasks, and timeline links that exist.

#### AC2 — Facts and proposals are distinct
- **Given** the case includes AI output and ERP facts
- **When** both are displayed
- **Then** Agent proposals are labelled and visually separate from applied facts and human decisions.

#### AC3 — Current action
- **Given** the case is blocked or needs approval
- **When** the view loads
- **Then** it shows one clear current status, blocking reason, owner, timer, and permitted next action.

## Feature F-08.2 — Recovery and evidence

### US-803 — Retry or cancel a workflow safely

**As a** Owner-Operator  
**I want to** retry a failed safe step or cancel an eligible workflow  
**So that** recovery does not repeat business effects.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | US-101–US-704; retry classes, timeout rules, compensation map |
| Test data | Timed-out Agent step; timed-out connector step; pre-handover order |
| Requirement IDs | PRD-047, PRD-049, PRD-105, PRD-136, PRD-139; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-010, SCR-011 |
| Workflow | RUN-02–RUN-09; DAM-004–DAM-011 |

#### AC1 — Safe retry
- **Given** a retryable step failed before a business effect committed
- **When** an authorised user retries it
- **Then** the workflow uses the same correlation and idempotency context
- **And** either completes once or records another controlled failure.

#### AC2 — Unsafe retry blocked
- **Given** the prior result is unknown for stock, invoice, or money mutation
- **When** retry is requested
- **Then** the system does not repeat the mutation
- **And** it requires reconciliation or recovery evidence first.

#### AC3 — Cancel with compensation
- **Given** an order is eligible for cancellation before handover
- **When** the Owner cancels it with a reason
- **Then** active reservation is released and open downstream work is stopped or marked stale
- **And** each compensation is audited.

### US-804 — Keep an append-only audit history

**As an** Auditor  
**I want to** review immutable evidence for every important action  
**So that** AI, ERP, and human responsibility can be reconstructed.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | All Must stories; audit retention, masking, access, and export decisions |
| Test data | Happy case; rejected task; failed retry; TEN-B user |
| Requirement IDs | PRD-047, PRD-067, PRD-109, PRD-147, PRD-158; SRS FR/NFR: MISSING |
| Screen IDs | SCR-004, SCR-010, SCR-011 |
| Workflow | WF-022; all DAM audit fields |

#### AC1 — Required event fields
- **Given** an important Agent, ERP, or human action occurs
- **When** its audit event is written
- **Then** actor type and ID, tenant, time, correlation, entity/version, before/after or result, reason, and evidence reference are stored as applicable.

#### AC2 — Append-only behavior
- **Given** an audit event exists
- **When** any user attempts to edit or delete it
- **Then** the operation is denied
- **And** any permitted correction is a new linked event.

#### AC3 — Access boundary
- **Given** a user lacks the required role or tenant access
- **When** Audit is opened or exported
- **Then** restricted events and sensitive values are not returned.

### US-805 — Use the MVP safely on desktop and mobile

**As an** authorised user  
**I want to** review and act from one responsive PWA  
**So that** I can operate the demo without separate web and mobile products.

| Field | Value |
|---|---|
| Priority / Estimate | Must / L |
| Dependency | Identity/RBAC specification; agreed viewport/browser matrix; notification decision |
| Test data | Owner, Sales, Warehouse, Finance, Auditor, Demo Admin users in TEN-A/TEN-B |
| Requirement IDs | PRD-025, PRD-068, PRD-070, PRD-091, PRD-116, PRD-135; SRS FR/NFR: MISSING |
| Screen IDs | SCR-001–SCR-012 |
| Workflow | Cross-cutting permissions and safe mutation |

#### AC1 — Responsive task completion
- **Given** an authorised user uses an agreed desktop or mobile viewport
- **When** they open a permitted queue or task
- **Then** core facts, risk, timer, and primary action are readable without hidden required data.

#### AC2 — Role permissions
- **Given** the user does not hold the required business role
- **When** they attempt a protected approval or mutation
- **Then** the action is hidden or disabled in UI and rejected by the service.

#### AC3 — Demo Admin restriction
- **Given** a user has only Demo Admin permission
- **When** they try to approve a business task
- **Then** the decision is rejected.

#### AC4 — Offline safety
- **Given** the PWA is offline or cached data may be stale
- **When** a user tries to approve or mutate business data
- **Then** the mutation is blocked
- **And** the UI shows offline status and last known data time.

## Feature F-08.3 — Demonstration controls

### US-806 — Configure and reset a labelled demo tenant

**As a** Demo Admin  
**I want to** select seeded tenants, simulator events, and configurable policy values  
**So that** the end-to-end scenario can be repeated safely.

| Field | Value |
|---|---|
| Priority / Estimate | Should / L |
| Dependency | Seed data pack; safe reset design; validation ranges; simulator contracts |
| Test data | TEN-A, TEN-B, all named message/payment/delivery/invoice variants |
| Requirement IDs | PRD-025, PRD-070, PRD-092, PRD-168; SRS FR/NFR: MISSING |
| Screen IDs | SCR-012 |
| Workflow | Demo setup; cross-cutting policy and simulator controls |

#### AC1 — Visible demo context
- **Given** a Demo Admin selects TEN-A
- **When** the demo shell loads
- **Then** the current tenant and simulator status remain clearly visible
- **And** no production integration claim is shown.

#### AC2 — Valid configuration only
- **Given** a Demo Admin edits an allowed policy value
- **When** the value is saved
- **Then** it is accepted only within approved validation rules
- **And** a new policy version and audit event are created.

#### AC3 — Safe reset
- **Given** no protected run is active and the Demo Admin confirms the exact tenant
- **When** reset is executed
- **Then** only that demo tenant returns to the approved seed state
- **And** reset evidence is recorded without giving Demo Admin approval rights.

## 6. Backlog readiness summary

| Story group | Current readiness | Main condition |
|---|---|---|
| US-101–US-404 | Not Ready | Add approved SRS FR/NFR; resolve policy wording and connector/test-data prerequisites. |
| US-501–US-503 | Not Ready | Define carrier events, delivery timeout, and warehouse handover/return evidence. |
| US-601–US-603 | Not Ready | Define invoice fields, result codes, adjustment rules, and simulator contract. |
| US-701–US-704 | Not Ready | Define payment contract and refund/reversal process; align write-off wording. |
| US-801–US-806 | Not Ready | Define RBAC, audit policy, responsive matrix, seed data, and safe reset behavior. |

## 7. INVEST review notes

- Stories describe one user outcome and avoid technical component tasks.
- Each story has a clear value, named dependency, test data, and observable AC.
- `L` stories may need DEV task splits during refinement, but their business outcome should stay intact.
- No story invents missing FR/NFR IDs or a legal/integration capability.
- Final INVEST approval is pending SRS mapping and closure of the listed document defects and prerequisites.

*User Story and Acceptance Criteria structure follows guidance originally by Phúc NT · BA Zone · Digital School.*
