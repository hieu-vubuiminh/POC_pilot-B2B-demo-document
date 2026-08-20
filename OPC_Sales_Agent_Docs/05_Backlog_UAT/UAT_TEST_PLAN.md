# UAT TEST PLAN

**Product:** OPC Sales Operations Agent  
**Release:** Domain MVP / demo prototype  
**Status:** Draft; test execution is blocked by missing SRS, environment, contracts, and seed pack  
**Date:** 20 August 2026

## 1. Purpose and limits

This plan checks the agreed B2B order flow from a simulated Zalo message to full payment. It validates user outcomes, deterministic ERP rules, Agent boundaries, approvals, responsive behavior, and audit evidence. It does not certify a live Zalo, carrier, invoice, banking, tax, or legal integration.

All cases are `Not Executed`. Expected results come from the current PRD, Workflow, and UX/UI documents. SRS FR/NFR mapping is marked `MISSING` because folder `04_SRS` is empty.

## 2. Roles

| Role | UAT responsibility |
|---|---|
| Product Owner | Confirms business outcome and accepts or rejects UAT result. |
| Owner-Operator | Tests business approvals and Control Tower. |
| Sales Operator | Tests message and order review within permission. |
| Warehouse Operator | Tests picking, handover, and return receipt. |
| Finance Operator | Tests invoice, receivable, and payment review. |
| Auditor | Tests read-only trace and evidence access. |
| Demo Admin | Loads simulator events and seed data; cannot approve business decisions. |
| QA Lead | Controls data, records evidence, and reports defects. |

## 3. Entry criteria

1. An approved SRS provides mapped FR/NFR IDs.
2. Document defects in `DEV_HANDOFF_READINESS.md` that affect expected results are resolved.
3. A versioned build is deployed to an identified UAT environment.
4. Seeded TEN-A and TEN-B data and all named simulator events are available.
5. Role accounts, browsers, desktop/mobile sizes, and evidence repository are agreed.
6. Zalo, carrier, invoice, and payment simulator contracts are frozen for UAT.
7. Audit, reset, retry, timeout, and idempotency behavior is observable.

## 4. Exit criteria

- All Must cases pass with linked evidence.
- No open critical or high defect affects stock, money, invoice total, approval, tenant isolation, state transition, idempotency, or audit integrity.
- Medium defects have an accepted owner, plan, and release decision.
- Product Owner and QA Lead sign the UAT summary.

## 5. Common test data

Use the named baseline in `PRODUCT_BACKLOG.md`: TEN-A, TEN-B, CUST-A-OK, CUST-A-OVERDUE, SKU-A-FISH-750, SKU-A-DRY-1KG, PRICE-A, PROMO-A, message variants, payment variants, and duplicate events. Exact values, credentials, provider IDs, and expected balances are a missing prerequisite and must be frozen before execution.

## 6. UAT cases

### UAT-001 — Happy path from message to full payment

| Field | Detail |
|---|---|
| Preconditions | TEN-A is selected. CUST-A-OK, PRICE-A, SKU-A-FISH-750, stock, carrier, invoice, and payment simulator data are active. |
| Test data | MSG-A-HAPPY; exact stock quantity; one valid carrier option; PAY-A-EXACT. |
| Steps | 1. Send the message. 2. Observe extraction and deterministic checks. 3. Confirm reservation and order. 4. Select delivery. 5. Pick and hand over. 6. Record delivery. 7. issue the simulator invoice. 8. Send exact payment. |
| Expected result | One continuous case reaches Order `CLOSED`. Stock reduces only at handover. Invoice starts only after delivery. One exact payment closes the Receivable. Agent proposals remain distinct from ERP facts and human decisions. |
| Evidence | Inbox and Order 360 screenshots; entity IDs and state timeline; stock before/after; invoice/payment references; audit export or event view. |
| Requirement mapping | PRD-028–PRD-045, PRD-049, PRD-058; WF-001–WF-022; SCR-001, SCR-002, SCR-004, SCR-008, SCR-009, SCR-010, SCR-011; US-101–US-704, US-801–US-804; SRS: MISSING. |

### UAT-002 — Message is missing required information

| Field | Detail |
|---|---|
| Preconditions | TEN-A and outbound message simulator are active. |
| Test data | MSG-A-MISSING without quantity or delivery data; linked customer reply. |
| Steps | 1. Send the incomplete message. 2. Review the Agent draft. 3. Send clarification as Owner. 4. Send the linked reply. |
| Expected result | Message becomes `NEEDS_INFO`; no confirmed order or reservation exists. The final clarification and reply are linked. Re-parse creates a new version without overwriting the original evidence. |
| Evidence | Message states; outbound/inbound IDs; order and reservation query/view; Workflow Run and audit timeline. |
| Requirement mapping | PRD-029, PRD-098, PRD-100, PRD-117, PRD-151; WF-005; MSG-05, MSG-07, MSG-11; SCR-002, SCR-005, SCR-010; US-103; SRS: MISSING. |

### UAT-003 — SKU cannot be identified safely

| Field | Detail |
|---|---|
| Preconditions | Two matching aliases or one unknown phrase exist in TEN-A. |
| Test data | MSG-A-UNKNOWN-SKU; SKU-A-AMB. |
| Steps | 1. Send the message. 2. Inspect candidates and confidence. 3. Select a valid SKU as Owner or ask the customer. |
| Expected result | No SKU auto-match occurs unless score is at least 0.90, exactly one candidate exists, and no main-field conflict exists. No reservation is created before resolution. Evidence and final selection are audited. |
| Evidence | Candidate scores/evidence; task screenshot; reservation view; decision audit. |
| Requirement mapping | PRD-031, PRD-098, PRD-117, PRD-166; WF-007; APR-004; SCR-002, SCR-004, SCR-005, SCR-007; US-202, US-401–US-402; SRS: MISSING. |

### UAT-004 — Requested stock is not available

| Field | Detail |
|---|---|
| Preconditions | Requested quantity is greater than deterministic ATP. |
| Test data | SKU-A-DRY-1KG; request above ATP; customer accepts a smaller immediate quantity and a remainder. |
| Steps | 1. Run stock check. 2. Review partial, substitute, or later-date proposals. 3. Record Owner and customer choice. |
| Expected result | Negative stock cannot be approved. The current order uses only the accepted immediate quantity. A linked Order Draft is created for the remainder with no automatic reservation. |
| Evidence | ATP inputs/result; decision package; current order and linked draft; reservation records; audit. |
| Requirement mapping | PRD-036, PRD-110, PRD-152; WF-009; ORD-05P; APR-006; SCR-004, SCR-005, SCR-007; US-301, US-403; SRS: MISSING. |

### UAT-005 — Two workflows try to reserve the same stock

| Field | Detail |
|---|---|
| Preconditions | Available stock can satisfy only one of two orders. Atomic reservation is enabled. |
| Test data | Two different messages for the same TEN-A SKU and quantity; synchronized submit time. |
| Steps | 1. Start both workflows. 2. Let both pass the initial ATP read. 3. Submit both reservations together. |
| Expected result | Only one reservation commits. The other fails or enters shortage handling with a fresh ATP value. No oversell, duplicate hold, or negative ATP occurs. |
| Evidence | Both run IDs; transaction times/results; inventory and reservation before/after; audit correlation. |
| Requirement mapping | PRD-037, PRD-057, PRD-133, PRD-153; WF-010–WF-011; RSV-01; SCR-004, SCR-007, SCR-010, SCR-011; US-302; SRS: MISSING. |

### UAT-006 — Customer has overdue debt

| Field | Detail |
|---|---|
| Preconditions | CUST-A-OVERDUE has a deterministic overdue Receivable. |
| Test data | Complete order message from CUST-A-OVERDUE. |
| Steps | 1. Send the order. 2. Review customer, debt facts, and approval task. 3. Approve once with reason; repeat with a rejection in a new test run. |
| Expected result | Workflow blocks before reservation/order confirmation. Owner sees debt evidence and impact. Approve or reject applies only once to the current version; no Agent decision is committed. |
| Evidence | Debt calculation, task package, decision version/reason, reservation check, audit. |
| Requirement mapping | PRD-034, PRD-043, PRD-074, PRD-108; WF-008; APR-005; SCR-004, SCR-005, SCR-006; US-204, US-401–US-402; SRS: MISSING. |

### UAT-007 — Requested price is outside an Owner program

| Field | Detail |
|---|---|
| Preconditions | PROMO-A has an Owner-defined value, scope, validity, and limit. No global discount threshold is assumed. |
| Test data | Customer asks for a price beyond PROMO-A; standard PRICE-A. |
| Steps | 1. Send the price request. 2. Inspect the decision task. 3. As Owner, enter/select a valid program or order price and reason. 4. Repeat with rejection. |
| Expected result | AI does not choose or prefill the discount value. ERP validates the Owner value and recalculates price, debt, and ATP. Rejection keeps the standard price or requests customer confirmation. |
| Evidence | Active policy version; decision package; entered value/reason; recalculation and audit events. |
| Requirement mapping | PRD-035, PRD-075, PRD-099, PRD-108, PRD-150; WF-008; APR-005; SCR-004, SCR-005, SCR-012; US-203, US-404; SRS: MISSING; source defect DD-001 applies. |

### UAT-008 — User rejects an Agent proposal

| Field | Detail |
|---|---|
| Preconditions | A current approval task has a complete Agent proposal and version. |
| Test data | Any stock, price, delivery, invoice, or payment exception task. |
| Steps | 1. Open the task. 2. Review facts and proposal. 3. Reject with a reason. 4. Refresh Order 360. |
| Expected result | No proposed business mutation is applied. The task becomes rejected, the case follows its safe next state, and the reason is visible in audit. |
| Evidence | Before/after entity state; task state; rejection reason; audit event. |
| Requirement mapping | PRD-043, PRD-112, PRD-137; DAM-006–DAM-012; SCR-004, SCR-005, SCR-011; US-401–US-402; SRS: MISSING. |

### UAT-009 — Workflow step times out and is retried

| Field | Detail |
|---|---|
| Preconditions | Agent/connector delay can be simulated; retryable and unsafe result classes are observable. |
| Test data | One timeout before commit; one timeout with unknown stock/invoice/payment result. |
| Steps | 1. Trigger the first timeout and retry. 2. Confirm one safe result. 3. Trigger the unknown-result timeout and try to retry. |
| Expected result | Safe retry reuses correlation/idempotency and completes at most once. Unknown mutation result blocks blind retry and asks for reconciliation. No duplicate stock, invoice, or payment effect occurs. |
| Evidence | Run attempts, timers, correlation/idempotency values, business record count, audit. |
| Requirement mapping | PRD-047, PRD-049, PRD-105, PRD-136, PRD-139; RUN-02–RUN-09; SCR-001, SCR-010, SCR-011; US-803; SRS: MISSING. |

### UAT-010 — Delivery fails after handover

| Field | Detail |
|---|---|
| Preconditions | Shipment is handed over and stock was issued once. |
| Test data | Failed delivery event and one approved redelivery option. |
| Steps | 1. Send failed event. 2. Check inventory. 3. Review and approve redelivery. 4. Complete redelivery. |
| Expected result | Shipment enters delivery failure and a task is created. Stock is not added back. Approved redelivery does not issue the same goods again. Final delivery is linked to the original shipment. |
| Evidence | Stock ledger; shipment timeline; decision; task; audit. |
| Requirement mapping | PRD-060, PRD-107, PRD-140; WF-015; SHP-05–SHP-10; SCR-001, SCR-005, SCR-008, SCR-011; US-503; SRS: MISSING. |

### UAT-011 — Returned goods are physically received

| Field | Detail |
|---|---|
| Preconditions | A failed handed-over shipment returns to the warehouse. |
| Test data | Physical return receipt for the original shipment and SKU. |
| Steps | 1. Record carrier return without warehouse receipt. 2. Check stock. 3. Record physical return receipt. 4. Check stock again. |
| Expected result | Carrier return alone does not increase stock. Physical receipt creates one separate stock compensation linked to the original issue. Repeated receipt does not add stock twice. |
| Evidence | Stock ledger before/after; return receipt ID; original issue link; duplicate result; audit. |
| Requirement mapping | PRD-107, PRD-140, PRD-167; WF-015; SHP-08–SHP-10; SCR-007, SCR-008, SCR-011; US-503; SRS: MISSING. |

### UAT-012 — Invoice is rejected by the simulator

| Field | Detail |
|---|---|
| Preconditions | Order is delivered and an Invoice Draft exists. |
| Test data | Rejection code and message from the invoice simulator; corrected draft data. |
| Steps | 1. Submit the draft. 2. Receive rejection. 3. Review the Finance task. 4. correct and resubmit the new version. |
| Expected result | Invoice becomes rejected with one correction task. No Receivable opens from the rejected version. A corrected version is traceable and a duplicate submit cannot issue twice. |
| Evidence | Simulator request/result; invoice versions/states; Receivable query; task; audit. |
| Requirement mapping | PRD-040, PRD-061, PRD-106, PRD-132; WF-017–WF-018; INV-03–INV-10; SCR-004, SCR-005, SCR-009, SCR-011; US-602–US-603; SRS: MISSING. |

### UAT-013 — Payment amount is lower than outstanding amount

| Field | Detail |
|---|---|
| Preconditions | One open Receivable exists. |
| Test data | PAY-A-MISMATCH partial-payment variant with exact order reference. |
| Steps | 1. Send the payment. 2. Review the mismatch task. 3. Approve a supported partial allocation. |
| Expected result | Payment does not auto-match under the exact rule. After valid human decision, allocation occurs once and the remaining balance is deterministic. Order stays open. |
| Evidence | Payment and Receivable amounts before/after; task and reason; order state; audit. |
| Requirement mapping | PRD-042, PRD-043, PRD-063, PRD-112, PRD-142; WF-020–WF-021; PAY-06–PAY-12; SCR-004, SCR-005, SCR-009; US-703–US-704; SRS: MISSING. |

### UAT-014 — Payment amount is higher than outstanding amount

| Field | Detail |
|---|---|
| Preconditions | One open Receivable exists; refund process is not assumed. |
| Test data | PAY-A-MISMATCH excess-payment variant. |
| Steps | 1. Send the payment. 2. Review candidates and excess amount. 3. Attempt automatic and manual next actions. |
| Expected result | No automatic allocation or refund occurs. Task shows exact impact. Any unsupported refund path remains blocked; Agent cannot move money. |
| Evidence | Payment state; task package; attempted action result; balances; audit. |
| Requirement mapping | PRD-043, PRD-063, PRD-112, PRD-156; WF-020; SCR-005, SCR-009, SCR-011; US-703; SRS: MISSING. |

### UAT-015 — Payment has no supported order reference

| Field | Detail |
|---|---|
| Preconditions | At least two open Receivables can be plausible candidates. |
| Test data | PAY-A-MISMATCH missing-reference or combined-payment variant. |
| Steps | 1. Send payment. 2. Inspect Agent candidates. 3. Select a supported allocation as Owner or reject. |
| Expected result | AI candidates are proposals only. No money auto-allocates. Human decision requires facts, amount impact, evidence, and reason; one approved allocation applies once. |
| Evidence | Raw payment description; candidates/confidence; allocation; decision and audit. |
| Requirement mapping | PRD-042, PRD-043, PRD-104, PRD-112; WF-020; SCR-004, SCR-005, SCR-009; US-703; SRS: MISSING. |

### UAT-016 — Same webhook is sent again

| Field | Detail |
|---|---|
| Preconditions | One inbound message event and one payment event were accepted. |
| Test data | EVT-A-DUP for both source types. |
| Steps | 1. Resend the message webhook. 2. Resend the payment webhook. 3. Count Messages, Runs, Orders, Payments, allocations, and audit events. |
| Expected result | Each source event produces at most one business effect per tenant/source/event ID. Duplicate receipt is recorded but creates no duplicate case, payment, allocation, or stock effect. |
| Evidence | Before/after counts; event IDs; idempotent response; audit. |
| Requirement mapping | PRD-049, PRD-080, PRD-094, PRD-136; MSG-01; PAY-01; SCR-010, SCR-011; US-101, US-702; SRS: MISSING. |

### UAT-017 — Cancel an order and release stock

| Field | Detail |
|---|---|
| Preconditions | Order has an active reservation and has not been handed over. |
| Test data | Reserved TEN-A order; cancellation reason. |
| Steps | 1. Record stock and reservation. 2. Cancel as Owner. 3. Repeat the cancel command. |
| Expected result | Reservation releases once, ATP is restored, order is cancelled, and open downstream tasks become stopped or stale. No stock issue occurs. Repeated cancel has no second effect. |
| Evidence | Order/reservation states; ATP before/after; task states; audit and idempotent result. |
| Requirement mapping | PRD-037, PRD-057, PRD-107, PRD-139; WF-012; ORD-07–ORD-08; RSV-04; SCR-004, SCR-007, SCR-010; US-304, US-803; SRS: MISSING. |

### UAT-018 — Role and tenant permission checks

| Field | Detail |
|---|---|
| Preconditions | Accounts exist for Owner, Sales, Warehouse, Finance, Auditor, and Demo Admin in TEN-A, plus a TEN-B user. |
| Test data | One order, task, invoice, payment, and audit record in each tenant. |
| Steps | 1. Try each permitted role action. 2. Try approval as Demo Admin. 3. Try Finance and Warehouse cross-actions. 4. Try TEN-B access to TEN-A IDs. |
| Expected result | UI and service both enforce role and tenant rules. Owner alone performs configured business approval. Demo Admin cannot approve. Cross-tenant data and counts are not returned. |
| Evidence | Permission matrix; UI states; service denial results; audit; tenant-scoped query screenshots. |
| Requirement mapping | PRD-068, PRD-071–PRD-079, PRD-109, PRD-160; all relevant APR/DAM rules; SCR-001–SCR-012; US-402, US-801, US-804–US-806; SRS: MISSING. |

### UAT-019 — Audit log is complete and cannot be changed

| Field | Detail |
|---|---|
| Preconditions | Happy path, rejection, retry, and compensation events exist. |
| Test data | UAT-001, UAT-008, UAT-009, and UAT-017 records. |
| Steps | 1. Find events by correlation/entity. 2. verify actor, tenant, version, result, reason, evidence, and time. 3. Try edit/delete as all roles. 4. create a permitted correction. |
| Expected result | Important actions are reconstructable. Existing events cannot be edited or deleted. A correction is a new linked event. Access and masking follow the approved policy. |
| Evidence | Audit view/export; failed mutation responses; new correction link; role results. |
| Requirement mapping | PRD-047, PRD-067, PRD-109, PRD-147, PRD-158; DAM audit fields; SCR-011; US-804; SRS: MISSING. |

### UAT-020 — Responsive mobile operation and offline safety

| Field | Detail |
|---|---|
| Preconditions | Agreed desktop/mobile viewport and browser matrix is available; PWA can be put offline. |
| Test data | One current approval, one Order 360 case, one queue, and cached data. |
| Steps | 1. Open Control Tower, Inbox, Order 360, Approval, Fulfilment, and Finance views at each size. 2. Complete a permitted approval online. 3. Go offline. 4. try an approval or mutation. |
| Expected result | Required facts and primary actions remain usable without hidden content. Online action succeeds once. Offline mutation is blocked and cached-data age is visible. No separate mobile behavior changes the business rule. |
| Evidence | Screenshots for each agreed size; browser/device details; successful online event; blocked offline result; audit. |
| Requirement mapping | PRD-025, PRD-068, PRD-091, PRD-116, PRD-135; SCR-001–SCR-012; US-805; SRS: MISSING. |

### UAT-021 — Reservation expires and can be extended only once

| Field | Detail |
|---|---|
| Preconditions | Reservation timer can be controlled; Owner account exists. |
| Test data | One 60-minute reservation; one request before expiry; one after expiry. |
| Steps | 1. Extend once by 30 minutes before expiry. 2. Attempt a second extension. 3. Let another reservation expire. 4. try to act on the expired task/version. |
| Expected result | First valid extension succeeds and is audited. Second extension is rejected. Expiry releases stock once. Stale approval or handover cannot use the expired reservation. |
| Evidence | Reservation timestamps/versions; ATP before/after; rejected commands; task states; audit. |
| Requirement mapping | PRD-037, PRD-133, PRD-153, PRD-166; WF-010–WF-012; RSV-01–RSV-04; SCR-004, SCR-005, SCR-007; US-303; SRS: MISSING; source defect DD-005 applies. |

## 7. Defect handling

- A **product defect** is a built result that differs from an approved requirement or expected UAT result.
- A **document defect** is a conflict, stale statement, missing state, or unclear rule inside the approved source set. It must be corrected by Product/BA before it becomes the test oracle.
- A **missing prerequisite** is an absent SRS, contract, environment, account, seed pack, or decision needed to build or execute. It is not evidence that the product is defective.
- QA must record these categories separately and must not convert an open decision into an expected result.

## 8. UAT result record

For each execution, record build version, environment, executor, time, actual result, `Pass/Fail/Blocked`, linked evidence, defect ID, and retest result. A `Blocked` case does not count as Pass.
