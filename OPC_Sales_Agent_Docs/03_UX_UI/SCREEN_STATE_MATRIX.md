# SCREEN STATE MATRIX

**Product:** OPC Sales Operations Agent  
**State sources:** `02_Workflow/STATE_MACHINE.md` and `DECISION_AND_APPROVAL_MATRIX.md`  
**Date:** 20 August 2026

## 1. Cross-entity display rules

| Required distinction | Functional display rule |
|---|---|
| Agent proposal vs completed action | AI result always says `Agent proposal — not applied`. Show `ERP completed` only after a business command/state transition commits. Do not say “Agent reduced stock/collected payment/closed the Order.” |
| Stock held vs stock reduced | Reservation `ACTIVE/EXTENDED` says `Stock held — not reduced`. Only after the handover transaction, show `Stock reduced` and the stock-issue ID. |
| Delivered vs paid | Shipment/Order `DELIVERED` means delivery succeeded only. Receivable may still be `OPEN/OVERDUE/PARTIALLY_PAID`. It becomes `PAID` only when outstanding = 0. |
| Workflow error vs Order failure | Show Run `BLOCKED/FAILED` separately from the current Order state. The MVP has no Order state `FAILED`. The Order may remain `DRAFT`, `RESERVED`, `DISPATCHED`, or another state. |
| Waiting for Approval | Always show task type, Owner action, waiting time, reminder/overdue, entity version, and Reservation expiry when relevant. |
| Connector result | Always show `Simulated` and source/correlation. Do not use wording that claims a production integration or legal result. |
| Overdue task | `OVERDUE` is a UX flag. It does not change business state or automatically approve/reject. |

## 2. Message

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Message | `RECEIVED` | SCR-002, SCR-001 | Request received | View raw event; system starts parsing; Owner may cancel under MSG-11 | Manually create Order/price/stock from raw text | Owner views; Agent/ERP handles | SCR-002 or SCR-010 |
| Message | `PARSING` | SCR-002, SCR-010 | Agent is reading — not applied | View elapsed time/source; retry under policy after an error | Owner selects a candidate that does not exist; treats extraction as committed | Owner views; Agent/ERP handles | SCR-002/SCR-010 |
| Message | `PARSED` | SCR-002 | Extracted — checking | View extraction/evidence; system validates; cancel if MSG-11 allows | Edit raw Message; write candidate directly to ERP | Owner; ERP/Agent | SCR-002, or SCR-004 when linked |
| Message | `NEEDS_INFO` | SCR-002, SCR-001 | Waiting for customer information | Owner reviews/sends clarification, receives reply, or cancels case | Agent guesses missing field; reserve stock without enough quantity data | Owner | SCR-002 |
| Message | `NEEDS_REVIEW` | SCR-002, SCR-005 | Owner confirmation needed | Select Customer/SKU/unit with reason, ask customer, or cancel | Auto-select below 0,90, with multiple candidates/conflict, or across tenants | Owner | SCR-002/006/007 |
| Message | `LINKED_TO_ORDER` | SCR-002, SCR-004 | Linked to Order | Open Order/Run; Owner reviews confirmation | Create a second Order by retrying the same key; edit raw Message | Owner | SCR-004/SCR-010 |
| Message | `RESPONDED` | SCR-002, SCR-004 | Response sent | View outbound ID/content/audit | Automatically send another Message version; edit old audit | Owner | SCR-004/SCR-011 |
| Message | `FAILED` | SCR-002, SCR-001, SCR-010 | Message processing failed | View reason; retry a new extraction version if allowed; cancel | Show false `PARSED`; use partial invalid output | Owner | SCR-010/SCR-002 |
| Message | `CANCELLED` | SCR-002 | Request closed | View reason/history; create a new Run from a new action if business allows | Reopen/edit history; create stock mutation | Owner | SCR-002/SCR-011 |

## 3. Agent Workflow Run

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Workflow Run | `CREATED` | SCR-010, SCR-001 | Workflow created | View definition/version; ERP/Agent starts | Mark complete before it runs | Owner views; Agent/ERP starts | SCR-010 |
| Workflow Run | `RUNNING` | SCR-001, SCR-004, SCR-010 | Workflow running | View current step; cancel if RUN-10 allows | Owner edits state; retry a human decision automatically | Owner views/cancels; Agent/ERP runs | SCR-010/SCR-004 |
| Workflow Run | `WAITING_HUMAN` | SCR-001, SCR-005, SCR-010 | Waiting for Owner | Open task, approve/reject/review; cancel if allowed | Auto-approve; continue with a stale task | Owner | SCR-005 |
| Workflow Run | `WAITING_EXTERNAL` | SCR-001, SCR-010 | Waiting for simulated Connector | View correlation/timeout; reconcile when blocked | Create false Connector success; mutate from an out-of-order event | Owner views; Connector/ERP handles | SCR-010 |
| Workflow Run | `RETRY_SCHEDULED` | SCR-001, SCR-010 | Waiting for safe retry | View attempt/next time; system retries; Owner opens Detail | Retry human decision; change idempotency key without rule | Owner views; Timer/ERP retries | SCR-010 |
| Workflow Run | `BLOCKED` | SCR-001, SCR-010 | Workflow blocked — Order keeps its own state | Retry safe step, open human/manual task, or cancel if allowed | Call Order failed/closed; create false success | Owner | SCR-010/SCR-005/SCR-004 |
| Workflow Run | `COMPENSATING` | SCR-010, SCR-004 | Applying compensation | View compensation status; wait for result | Edit/delete old commit; reverse stock/money without a rule | Owner views; ERP handles | SCR-010/SCR-011 |
| Workflow Run | `COMPLETED` | SCR-001, SCR-004, SCR-010 | Workflow completed | View final summary/audit | Retry/reopen old Run | Owner | SCR-004/SCR-011 |
| Workflow Run | `FAILED` | SCR-001, SCR-010 | Workflow ended with error — check Order state | View incident/manual task/audit | Change Order state directly; retry unsafe mutation | Owner | SCR-010/SCR-004/SCR-011 |
| Workflow Run | `CANCELLED` | SCR-010, SCR-004 | Workflow cancelled | View compensation summary; create a new Run for a new request | Reopen history; use old Approval | Owner | SCR-011/SCR-002 |

## 4. Order

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Order | `DRAFT` | SCR-003, SCR-004 | Draft Order — check needed | Correct with a new version, revalidate, reserve if rules pass, or cancel | Confirm/deliver/reduce stock before checks pass | Owner; ERP commits | SCR-004/005 |
| Order | `NEEDS_REVIEW` | SCR-003, SCR-004, SCR-005 | Data confirmation needed | Select/correct Customer/SKU/unit; ask for more data | Auto-confirm; use stale Reservation/Order version | Owner | SCR-002/005/004 |
| Order | `PENDING_APPROVAL` | SCR-003, SCR-004, SCR-005 | Waiting for Owner decision | Approve/reject with reason; record customer alternative | Bypass Approval; approve negative stock; bulk approve | Owner | SCR-005 |
| Order | `RESERVED` | SCR-003, SCR-004, SCR-007 | Stock held — not reduced | Review/send confirmation, extend once, or cancel/release | Record stock issue; auto-send confirmation | Owner | SCR-004/005 |
| Order | `CONFIRMED` | SCR-003, SCR-004, SCR-008 | Confirmed with customer | Select carrier, start picking, or cancel before handover | Create Invoice; reduce stock before handover | Owner | SCR-008 |
| Order | `PICKING` | SCR-003, SCR-004, SCR-008 | Picking goods | Complete picking, cancel before handover, or confirm handover when ready | Edit line directly; hand over a quantity different from reserved quantity in the MVP | Owner | SCR-008 |
| Order | `DISPATCHED` | SCR-003, SCR-004, SCR-008 | Handed over — stock reduced | Track delivery; handle failure | Cancel before handover; release Reservation; add stock automatically | Owner views; Connector/ERP updates | SCR-008 |
| Order | `DELIVERED` | SCR-003, SCR-004, SCR-009 | Delivered — Payment may still be due | Create/submit Invoice Draft; view Finance | Call it Paid/Closed; reduce stock again | Owner; ERP/Connector | SCR-009 |
| Order | `DELIVERY_EXCEPTION` | SCR-001, SCR-003, SCR-004, SCR-008 | Delivery problem | Select redelivery/return; confirm return receipt when goods arrive | Add stock automatically; move state back directly | Owner | SCR-005/008 |
| Order | `INVOICE_BLOCKED` | SCR-001, SCR-003, SCR-004, SCR-009 | Simulated Invoice blocked | View rejection, correct/resubmit, or approve adjustment | Close Order; delete rejected Invoice | Owner | SCR-009/005 |
| Order | `AWAITING_PAYMENT` | SCR-003, SCR-004, SCR-009 | Waiting for Payment | Track Receivable/Payment; review mismatch | Close when outstanding > 0; use write-off in the MVP | Owner | SCR-009/005 |
| Order | `PAID` | SCR-003, SCR-004, SCR-009 | Fully paid | ERP runs close gate; view settlement | Owner sets Closed directly; bypass Invoice/delivery/audit gate | Owner views; ERP closes | SCR-004 |
| Order | `CLOSED` | SCR-003, SCR-004 | Order closed | View final summary/audit; create a new correction case after an error | Edit/reopen history; use old Order for a new mutation | Owner | SCR-011 |
| Order | `CANCELLED` | SCR-003, SCR-004 | Cancelled before handover | View reason/release/audit | Handover/Invoice/close; restore Reservation ID | Owner | SCR-011/SCR-002 |

## 5. Inventory Reservation

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Reservation | `ACTIVE` | SCR-004, SCR-007, SCR-008, SCR-005 | Stock held — not reduced | Extend once before expiry, consume at handover, or release after cancel | Reduce on-hand; create a duplicate hold; extend after expiry | Owner triggers; ERP commits | SCR-004/005/008 |
| Reservation | `EXTENDED` | SCR-004, SCR-007, SCR-008 | Hold extended — stock not reduced | Consume at handover, release/cancel, or wait for expiry | Extend a second time; reduce stock before handover | Owner triggers; ERP commits | SCR-008/004 |
| Reservation | `CONSUMED` | SCR-004, SCR-007, SCR-008 | Hold used — stock reduced at handover | View stock issue/audit | Release/expire/consume a second time | Owner views; ERP committed | SCR-011/008 |
| Reservation | `RELEASED` | SCR-004, SCR-007 | Released — on-hand unchanged | View reason/history; create a new Reservation ID after recheck | Reactivate old ID; increase on-hand | Owner views; ERP | SCR-011/004 |
| Reservation | `EXPIRED` | SCR-001, SCR-004, SCR-007 | Expired — on-hand unchanged | Check ATP again; create a new Reservation | Extend/reactivate old ID; continue confirmation with old hold | Owner triggers; ERP | SCR-004 |
| Reservation | `FAILED` | SCR-001, SCR-004, SCR-007, SCR-010 | Stock hold failed | View conflict/ATP, select alternative, and retry after recheck | Show as active; reserve above ATP | Owner | SCR-005/004/010 |

## 6. Shipment

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Shipment | `QUOTED` | SCR-008, SCR-004 | Simulated delivery options available | Select current option; request a new quote after expiry | Use facts remembered by AI; call it booked | Owner | SCR-008 |
| Shipment | `BOOKED` | SCR-008, SCR-004 | Simulated delivery booked | Complete picking; cancel before handover | Reduce stock; mark in transit without an event | Owner | SCR-008 |
| Shipment | `READY_FOR_HANDOVER` | SCR-008, SCR-004 | Ready for handover | Confirm actual/reserved/evidence; cancel before handover | Handover without validation; reduce stock separately | Owner | SCR-008 |
| Shipment | `HANDED_OVER` | SCR-008, SCR-004, SCR-007 | Handed over — stock issued | Wait for carrier event; view stock issue | Release Reservation; issue stock twice | Owner views; Connector/ERP | SCR-008 |
| Shipment | `IN_TRANSIT` | SCR-008, SCR-004 | In transit | Track events; handle failure | Create Invoice before delivered; call paid | Owner views; Connector/ERP | SCR-008 |
| Shipment | `DELIVERED` | SCR-008, SCR-004, SCR-009 | Goods delivered | Create Invoice Draft; view evidence | Call paid/closed; return stock automatically | Owner; ERP | SCR-009 |
| Shipment | `FAILED` | SCR-001, SCR-005, SCR-008 | Delivery failed — Owner action needed | Select redelivery/return; view failure facts | Add stock automatically; select an option automatically | Owner | SCR-005/008 |
| Shipment | `CANCELLED` | SCR-008, SCR-004 | Delivery cancelled before handover | View cancellation/release links | Handover; reactivate booking | Owner | SCR-011/004 |
| Shipment | `RETURNING` | SCR-008, SCR-004 | Goods returning — not received into stock | Track return; confirm physical receipt | Add on-hand before receipt | Owner | SCR-008 |
| Shipment | `RETURNED` | SCR-008, SCR-007, SCR-004 | Returned goods received — compensation receipt exists | View stock receipt/audit | Edit/delete original stock issue; receive twice | Owner views; ERP committed | SCR-011/007 |

## 7. Invoice

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Invoice | `DRAFT` | SCR-009, SCR-004 | Simulated Invoice Draft | Review demo fields, submit, or cancel before submit | Create before delivery; call legally issued | Owner; ERP | SCR-009 |
| Invoice | `SUBMISSION_PENDING` | SCR-009, SCR-010 | Sending simulated Invoice | Wait/retry with same key under policy | Create another version after timeout; create false accepted result | Owner views; ERP | SCR-010/009 |
| Invoice | `SUBMITTED` | SCR-009, SCR-010 | Sent — waiting for simulated result | Wait for correlated result; reconcile timeout | Call recorded/legally issued | Owner views; Connector/ERP | SCR-009 |
| Invoice | `RECORDED` | SCR-009, SCR-004 | Simulated result recorded | Create Receivable; request adjustment with Approval | Edit original Invoice; remove simulator label | Owner | SCR-009/005 |
| Invoice | `REJECTED` | SCR-001, SCR-004, SCR-005, SCR-009 | Simulated rejection — correction needed | Create a new correction version; resubmit | Delete/overwrite rejection; reverse delivery/stock | Owner | SCR-009 |
| Invoice | `ADJUSTMENT_PENDING` | SCR-005, SCR-009 | Waiting for Invoice-adjustment Approval | Approve/reject with reason; wait for Adapter result | Adjust automatically; edit original | Owner | SCR-005 |
| Invoice | `ADJUSTED` | SCR-009, SCR-011 | Simulated adjustment recorded | View linked adjustment/audit | Replace/delete original Invoice | Owner | SCR-011 |
| Invoice | `CANCELLED` | SCR-009 | Invoice Draft cancelled | View reason; create new Draft/version if flow allows | Submit cancelled Draft; delete history | Owner | SCR-011/009 |

## 8. Receivable

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Receivable | `OPEN` | SCR-009, SCR-004, SCR-006 | Waiting for Payment | Track due date/reference; allocate valid Payment | Close Order; write off; edit amount directly | Owner views; ERP posts | SCR-009 |
| Receivable | `OVERDUE` | SCR-001, SCR-005, SCR-006, SCR-009 | Debt overdue | Review new Order exposure; allocate Payment | Remove overdue with Approval; auto-approve credit exception | Owner | SCR-005/009 |
| Receivable | `PARTIALLY_PAID` | SCR-009, SCR-004 | Partially paid | View allocation/outstanding; allocate more valid Payment | Call paid/closed; write off outstanding | Owner | SCR-009 |
| Receivable | `PAID` | SCR-009, SCR-004 | Fully paid | ERP runs Order close gate; view settlement | Edit/delete allocation; Owner sets Closed directly | Owner views; ERP | SCR-004/011 |
| Receivable | `CANCELLED` | SCR-009 | Receivable cancelled by valid correction | View reason/linked adjustment | Cancel a paid Receivable; delete history | Owner | SCR-011 |

`WRITE_OFF_PENDING` and `WRITTEN_OFF` are not shown because they are outside the MVP.

## 9. Payment

| Entity | Business state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Payment | `RECEIVED` | SCR-009, SCR-001 | Simulated Payment event received | ERP starts validation; view raw event | Allocate directly; edit raw event | Owner views; ERP | SCR-009 |
| Payment | `DUPLICATE` | SCR-009, SCR-011 | Duplicate event — Payment not posted twice | Open original Payment/audit | Create a second Payment/cash/allocation | Owner views; ERP result | SCR-011/009 |
| Payment | `VALIDATING` | SCR-009, SCR-010 | Checking reconciliation | View progress; wait for ERP rule | Agent/Owner selects before result | Owner views; ERP | SCR-009 |
| Payment | `MATCHED` | SCR-009 | Matched by rule — waiting for allocation | ERP posts idempotent allocation | Owner changes match without correction; call paid before posting | Owner views; ERP | SCR-009 |
| Payment | `NEEDS_REVIEW` | SCR-001, SCR-005, SCR-009 | Payment needs Owner reconciliation | Select valid match, confirm no match, or request refund | Allocate automatically; change Receivable before decision | Owner | SCR-005 |
| Payment | `UNMATCHED` | SCR-009, SCR-005 | Receivable not identified | Add/review data when available; request refund Approval | Allocate automatically; close Order | Owner | SCR-005/009 |
| Payment | `ALLOCATED` | SCR-009, SCR-004 | Payment allocated | View allocation; request reversal if wrong | Edit/delete allocation; allocate twice | Owner | SCR-011/005 |
| Payment | `REFUND_PENDING` | SCR-005, SCR-009 | Waiting for refund Approval/result | Owner approves/rejects; Connector confirms | Refund automatically; call refunded when Connector fails | Owner | SCR-005 |
| Payment | `REFUNDED` | SCR-009, SCR-011 | Simulated refund recorded | View linked refund/audit | Edit original Payment; refund the same request twice | Owner | SCR-011 |
| Payment | `REVERSAL_PENDING` | SCR-005, SCR-009 | Waiting for allocation-reversal Approval | Owner approves/rejects; ERP posts compensation | Delete old allocation; close Order | Owner | SCR-005 |
| Payment | `REVERSED` | SCR-009, SCR-004, SCR-011 | Allocation reversed by compensation | View reopened Receivable/Order impact | Edit/delete original allocation or reversal | Owner | SCR-009/011 |

## 10. Approval Request

Approval Request has no official state machine. The table below is a **temporary UX status mapping** and does not define business transitions. `VIEWED` is an audit event. `OVERDUE` is a flag on an `OPEN` task.

| Entity | Business/view state | Display screen | Proposed status label | Allowed action | Forbidden action | Authorized actor | Next screen |
|---|---|---|---|---|---|---|---|
| Approval Request | `OPEN` | SCR-001, SCR-004, SCR-005 | Waiting for Owner decision | View evidence/impact; approve/reject/select with reason | Demo Admin decides; bulk approval; automatic decision | Owner; Admin views | SCR-005 |
| Approval Request | `OPEN + OVERDUE flag` | SCR-001, SCR-005, SCR-009 | Reminder time passed — still waiting for Owner | Decide on current version; view elapsed time | Auto-reject/approve/block business state only because overdue | Owner | SCR-005 |
| Approval Request | `APPROVED` | SCR-004, SCR-005, SCR-011 | Owner approved | View actor/reason/result; ERP revalidates | Reuse Approval for another version/Order; edit reason | Owner views; ERP applies | Entity context/SCR-011 |
| Approval Request | `REJECTED` | SCR-004, SCR-005, SCR-011 | Owner rejected | View reason/compensation; create a new task for a new version if needed | Reopen/edit old decision | Owner views | Entity context/SCR-011 |
| Approval Request | `STALE` | SCR-005 | Data changed — new decision needed | Open new entity/version; refresh | Approve/reject stale task; copy Approval automatically | Owner | SCR-004/005 |
| Approval Request | `EXPIRED` | SCR-005, SCR-011 | Task expired | View reason/expiry/audit; create a new task after revalidation if flow allows | Decide from an old snapshot; restore Reservation | Owner | SCR-004/010 |

## 11. UX OPEN QUESTION

| ID | Question | Affected state |
|---|---|---|
| UX-OQ-001 | BA must define the official Approval Request state machine and the link between task expiry and Reservation expiry. | Approval Request; Run `WAITING_HUMAN`; Order `PENDING_APPROVAL`. |
| UX-OQ-005 | Provider/legal validation must confirm the correct labels for Invoice states. | Invoice. |
| UX-OQ-006 | Delivery reminder/timeout and real event mapping are not approved. | Shipment; Run `WAITING_EXTERNAL/BLOCKED`. |
| UX-OQ-007 | Audit retention/access may make some states/events unavailable. A replacement UX must be defined. | All entity history. |
