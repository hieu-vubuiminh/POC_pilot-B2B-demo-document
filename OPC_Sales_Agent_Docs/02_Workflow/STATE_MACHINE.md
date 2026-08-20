# STATE MACHINE

**Scenario:** B2B order from Zalo until payment is received  
**Source of truth:** OPC Sales Agent PRD version 1.0  
**Status:** Proposed for PO/BA/DEV review  
**Workflow decision update:** 2026-08-20

## 1. General rules

1. A state can change only through the deterministic state service after it checks the current state, tenant, entity version, and business rule.
2. The Agent may request an action through a business command. It cannot write a state directly.
3. A human decision must use an approval/review command with actor, permission, and reason.
4. Every transition must create an append-only audit event. Do not edit or delete an old event.
5. A retry with the same idempotency key must return the earlier result and must not run the mutation twice.
6. Technical rollback is used only before a transaction commits. After commit, use a new compensation event.
7. Every entity has `tenant_id`. A transition that refers to an entity in another tenant is rejected.
8. An out-of-order event must be held/rejected for review. It must not force a state forward or backward.
9. A Customer/SKU is auto-matched only when the score is `>= 0,90`, there is exactly one candidate, and there is no conflict in a main field.
10. A Reservation expires after 60 minutes. The Owner may extend it once by 30 minutes before expiry.
11. The Agent cannot create a discount value. The Owner configures the value/program, and ERP applies it with deterministic rules.
12. Partial delivery creates a new Order Draft for the remaining quantity. The MVP does not auto-backorder/split or auto-reserve the new Order.
13. Write-off is outside the MVP. The Order passes the settlement gate only when the Receivable is `PAID`.
14. Reminder/overdue does not change a decision: 15 minutes for an order-blocking task and 4 working hours for a financial task.

## 2. Actor labels

| Label | Meaning |
|---|---|
| Connector | Zalo, delivery, Invoice, or Payment adapter/simulator. |
| Agent | AI reasoning and Workflow Orchestrator. It calls only allowed commands. |
| ERP | Deterministic business/state service. |
| Owner | Owner-operator who reviews and self-approves in the prototype. |
| Timer | Deterministic scheduler for timeout, expiry, and overdue events. |

## 3. Message state machine

### 3.1 States

| State | Meaning |
|---|---|
| `RECEIVED` | A new event passed deduplication and was stored. |
| `PARSING` | The Agent is creating an extraction. |
| `PARSED` | The extraction is stored but may not have enough data for an Order intent. |
| `NEEDS_INFO` | Customer or required data is missing, and more information is needed. |
| `NEEDS_REVIEW` | Candidates exist, but the Owner must select one. |
| `LINKED_TO_ORDER` | The Message is linked to an Order Draft. |
| `RESPONDED` | The Owner approved the response, and the Adapter recorded the send result. |
| `FAILED` | Processing failed after retry and needs action. |
| `CANCELLED` | The Message/case is closed without an Order. |

### 3.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| MSG-01 | — | `MESSAGE_INGESTED` | Tenant is valid, and the event ID does not exist. | `RECEIVED` | Stores the envelope, raw-content hash, and correlation ID. | Connector → ERP | Transaction failure: do not create the Message. Connector retries with the same key. |
| MSG-02 | `RECEIVED` | `PARSE_REQUESTED` | Workflow Run is active. | `PARSING` | Locks the optimistic version and calls extraction. | Agent through command | Retryable AI error: Message stays `PARSING`, and Run becomes `RETRY_SCHEDULED`. After all retries, follow MSG-04. |
| MSG-03 | `PARSING` | `PARSE_SUCCEEDED` | Output has a valid schema/version. | `PARSED` | Stores candidates, evidence, and confidence. | Agent output, ERP validates | Invalid output: `FAILED` or retry. Do not use partial invalid output. |
| MSG-04 | `PARSING` | `PARSE_FAILED` | All retries are used, or the error cannot be retried. | `FAILED` | Creates a review task. | ERP/Timer | Owner may create a new `PARSE_REQUESTED` with a new version. |
| MSG-05 | `PARSED` | `REQUIRED_DATA_MISSING` | Schema validation finds a missing required field. | `NEEDS_INFO` | Creates a clarification task/Message Draft. | ERP; Agent drafts | No rollback. Create a new extraction version when information arrives. |
| MSG-06 | `PARSED` | `MATCH_AMBIGUOUS` | Customer/SKU has no unique match above the threshold. | `NEEDS_REVIEW` | Creates a review task with candidates/evidence. | ERP | Owner rejects all → `NEEDS_INFO`. |
| MSG-07 | `NEEDS_INFO` | `CLARIFICATION_RECEIVED` | The reply links to the correct conversation/tenant. | `PARSING` | Creates a new input version and keeps the old raw data. | Connector → ERP; Agent parses | Deduplicate the reply. A parse error follows MSG-04. |
| MSG-08 | `NEEDS_REVIEW` | `MATCH_SELECTED` | Owner has permission, and the selected entity is valid in the same tenant. | `PARSED` | Stores selection + reason and validates again. | Owner | Wrong selection after commit: create a correction event and validate again. Do not edit the old record. |
| MSG-09 | `PARSED` | `ORDER_DRAFT_LINKED` | Order/Reservation transaction succeeds. | `LINKED_TO_ORDER` | Stores Order ID and Run ID. | ERP | If the Order is cancelled, the Message keeps the link and records a cancellation event. |
| MSG-10 | `LINKED_TO_ORDER` | `OUTBOUND_CONFIRMED` | Owner approved the content, and the Adapter received the command. | `RESPONDED` | Stores outbound Message ID and send status. | Owner + Connector | Send failure: keep `LINKED_TO_ORDER` and retry with the same Message key. |
| MSG-11 | `RECEIVED`/`PARSED`/`NEEDS_INFO`/`NEEDS_REVIEW` | `CASE_CANCELLED` | No Order was handed over. | `CANCELLED` | Closes tasks and releases a Reservation, if one exists, through the Order flow. | Owner/ERP | To start again, create a new Workflow Run. Do not reopen the old audit history. |

## 4. Agent Workflow Run state machine

### 4.1 States

| State | Meaning |
|---|---|
| `CREATED` | The Run is created from a Message. |
| `RUNNING` | An automatic step is running. |
| `WAITING_HUMAN` | Waiting for review/approval/customer confirmation managed by the Owner. |
| `WAITING_EXTERNAL` | Waiting for a connector event. |
| `RETRY_SCHEDULED` | Waiting to retry a safe action. |
| `BLOCKED` | Cannot continue without action or a decision. |
| `COMPENSATING` | Releasing, returning, or cancelling committed resources. |
| `COMPLETED` | The Order passed the close gate. |
| `FAILED` | Ended with an error that cannot be compensated automatically. |
| `CANCELLED` | Ended after a cancel decision and completed compensation. |

### 4.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| RUN-01 | — | `RUN_CREATED` | New Message with no Run for the same business key. | `CREATED` | Stores Workflow definition/version. | ERP | A duplicate returns the earlier Run. |
| RUN-02 | `CREATED` | `RUN_STARTED` | Definition is active. | `RUNNING` | Stores the first current step. | Agent through ERP | Start failure: stay `CREATED` and retry with the same command. |
| RUN-03 | `RUNNING` | `HUMAN_INPUT_REQUIRED` | Review/approval task was created. | `WAITING_HUMAN` | Stores task ID, due time, and blocked step. | ERP/Agent request | If a Reservation is active, the Timer still manages its expiry separately. |
| RUN-04 | `WAITING_HUMAN` | `HUMAN_DECISION_RECORDED` | Permission is valid, task is not closed, and Reservation is valid when needed. | `RUNNING` | Revalidates, then continues or starts compensation. | Owner → ERP | Reject a stale decision. Do not replace the new state. |
| RUN-05 | `RUNNING` | `EXTERNAL_EVENT_REQUIRED` | Connector command was accepted. | `WAITING_EXTERNAL` | Stores connector correlation/key and timeout. | ERP/Agent request | Cancel before external commit under connector rules. Do not create a false success. |
| RUN-06 | `WAITING_EXTERNAL` | `EXPECTED_EVENT_RECEIVED` | Correlation + tenant + event order are valid. | `RUNNING` | Handles the event idempotently. | Connector → ERP | Ignore a duplicate. Conflicting event → `BLOCKED`. |
| RUN-07 | `RUNNING`/`WAITING_EXTERNAL` | `RETRYABLE_FAILURE` | Operation is safe and retry budget remains. | `RETRY_SCHEDULED` | Stores attempt, reason, and next retry time. | ERP/Timer | Do not undo an earlier commit. Retry reads the result with the idempotency key. |
| RUN-08 | `RETRY_SCHEDULED` | `RETRY_DUE` | Current state/entity version is still suitable. | `RUNNING` | Runs the safe action again. | Timer/ERP | State changed → cancel retry and audit `STALE_RETRY`. |
| RUN-09H | `WAITING_HUMAN` | `REMINDER_DUE` | An order-blocking task has waited 15 minutes, or a financial task has waited 4 working hours. | `WAITING_HUMAN` | Sends a reminder. Marks a financial task overdue. Does not auto-approve/reject. | Timer/ERP | Handle Reservation expiry separately. A valid decision can continue after revalidation. |
| RUN-09E | `WAITING_EXTERNAL`/`RETRY_SCHEDULED` | `EXTERNAL_TIMEOUT_REACHED` | Configured timeout/retry budget is used. | `BLOCKED` | Creates an alert/task and does not create a false external success. | Timer/ERP | Owner may resume/reconcile. Do not reverse committed data. |
| RUN-10 | `RUNNING`/`WAITING_HUMAN`/`BLOCKED` | `CANCEL_REQUESTED` | There is no irreversible external step that cannot be handled. | `COMPENSATING` | Releases active Reservation, cancels Shipment before handover, and closes tasks. | Owner/ERP | Compensation failure → `FAILED` + manual task. |
| RUN-11 | `COMPENSATING` | `COMPENSATION_COMPLETED` | Every resource has a final result. | `CANCELLED` | Stores compensation summary. | ERP | Do not reopen. Create a new Run to start again. |
| RUN-12 | `RUNNING` | `CLOSE_GATE_PASSED` | Delivery, Invoice, and Receivable/Payment conditions pass. | `COMPLETED` | Stores final summary. | ERP | Wrong close: create a correction Workflow. Do not edit Run history. |
| RUN-13 | Any non-terminal state | `NON_RECOVERABLE_FAILURE` | No automatic retry/compensation remains. | `FAILED` | Creates an incident/manual recovery task. | ERP | Manual compensation creates a new event. |

## 5. Order state machine

### 5.1 States

| State | Meaning |
|---|---|
| `DRAFT` | The customer has not confirmed the Order, and data can be revalidated. |
| `NEEDS_REVIEW` | Customer/SKU/unit/data needs Owner action. |
| `PENDING_APPROVAL` | Waiting for exception approval. |
| `RESERVED` | The Draft has an active Reservation and can wait for Owner confirmation. |
| `CONFIRMED` | Owner approved/sent the Order confirmation. |
| `PICKING` | Goods are being prepared. |
| `DISPATCHED` | Goods were handed over, and stock was issued. |
| `DELIVERED` | Delivery confirms success. |
| `DELIVERY_EXCEPTION` | A delivery failure/conflict needs a decision. |
| `INVOICE_BLOCKED` | Delivery succeeded, but the Invoice was rejected or is not resolved. |
| `AWAITING_PAYMENT` | Invoice/Receivable is ready and waiting for Payment. |
| `PAID` | Receivable is fully paid. Write-off is outside the MVP. |
| `CLOSED` | Close gate is complete. |
| `CANCELLED` | Cancelled before handover, and resources were released. |

### 5.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| ORD-01 | — | `DRAFT_AND_RESERVATION_CREATED` | ATP recheck passes, and command is unique. | `RESERVED` | Atomically creates Order Draft + Reservation. | Agent request; ERP commits | Transaction failure: create neither. A duplicate returns the earlier record. |
| ORD-02 | `DRAFT`/`RESERVED` | `REVIEW_REQUIRED` | Data is unclear/missing. | `NEEDS_REVIEW` | Blocks confirmation and creates a review task. | ERP | If a Reservation is active, its expiry still runs. Release it at expiry. |
| ORD-03 | `NEEDS_REVIEW` | `ORDER_DATA_CORRECTED` | Owner selects valid data. | `DRAFT` | Creates a new Order version and repeats price/credit/ATP checks. | Owner → ERP | Do not edit the old version. Release the old Reservation if line/quantity changes. |
| ORD-04 | `DRAFT`/`RESERVED` | `APPROVAL_REQUIRED` | Overdue debt, price request outside settings, or shortage alternative. | `PENDING_APPROVAL` | Creates an approval task. For a price outside settings, waits for the Owner to enter a value/program or reject it. | ERP | Reject/timeout → use the standard price again or release/cancel under policy. |
| ORD-05 | `PENDING_APPROVAL` | `APPROVED` | Exception is not partial shortage, Owner and reason exist, and revalidation passes. | `RESERVED` | Links the Approval and keeps/creates a valid Reservation. | Owner → ERP | Reservation expired → reject stale Approval and return to `DRAFT`. |
| ORD-05P | `PENDING_APPROVAL` | `PARTIAL_QUANTITY_ACCEPTED` | Customer agreed to immediate and remaining quantities, and Owner recorded the decision. | `DRAFT` | Creates a current Order version for the immediate quantity and a linked Order Draft for the remaining quantity without Reservation. Repeats price/credit/ATP checks for each Order. | Owner → ERP | Release the old Reservation if quantity changes. A transaction failure does not create only part of the version/Draft. |
| ORD-06 | `PENDING_APPROVAL` | `REJECTED` | Owner + reason. | `CANCELLED` or `DRAFT` | Cancels/releases or asks for a new option. | Owner → ERP | Do not roll back audit. A new option creates a new version. |
| ORD-07 | `RESERVED` | `RESERVATION_EXPIRED` | Not handed over/confirmed under policy. | `DRAFT` | Removes the active Reservation link and requires a new ATP check. | Timer/ERP | Create a new Reservation. Do not restore the old ID. |
| ORD-08 | `RESERVED` | `ORDER_CONFIRMATION_SENT` | Owner approved, Reservation is active, and rules pass. | `CONFIRMED` | Freezes the confirmed Order version. | Owner + ERP | Send failure: do not change state, or retry with the same outbound key. |
| ORD-09 | `CONFIRMED` | `PICKING_STARTED` | Reservation is active. | `PICKING` | Creates a picking task. | Owner/ERP | Stop picking before handover → may cancel and release. |
| ORD-10 | `CONFIRMED`/`PICKING` | `ORDER_CANCELLED_BEFORE_HANDOVER` | No stock issue exists. | `CANCELLED` | Releases Reservation and cancels Shipment before handover. | Owner/ERP | On-hand does not change. Record cancellation in audit. |
| ORD-11 | `PICKING` | `HANDOVER_CONFIRMED` | Actual quantity = reserved quantity, and transaction is unique. | `DISPATCHED` | Atomically creates stock issue + consumes Reservation + records Shipment handover. | Owner confirms; ERP commits | Transaction failure: keep `PICKING` and do not make a partial reduction. |
| ORD-12 | `DISPATCHED` | `DELIVERY_CONFIRMED` | Event is valid for the correct Shipment attempt. | `DELIVERED` | Stores delivered time/recipient evidence if available. | Connector/Owner → ERP | A later reverse event starts an exception/return flow. Do not move the state back directly. |
| ORD-13 | `DISPATCHED` | `DELIVERY_FAILED` | Event is valid. | `DELIVERY_EXCEPTION` | Creates a decision task and does not add stock. | Connector → ERP | Retry creates a new Shipment attempt. Return creates stock only when received. |
| ORD-14 | `DELIVERY_EXCEPTION` | `REDELIVERY_APPROVED` | Owner selects retry, and goods have not returned. | `DISPATCHED` | Links a new Shipment attempt. | Owner/ERP | The old attempt stays `FAILED`. |
| ORD-15 | `DELIVERED` | `INVOICE_REJECTED` | Invoice Adapter rejects. | `INVOICE_BLOCKED` | Creates a correction task. | ERP | Correct/resubmit the Invoice. Do not reverse stock/delivery. |
| ORD-16 | `INVOICE_BLOCKED`/`DELIVERED` | `RECEIVABLE_OPENED` | Invoice reaches the configured result, and Receivable is unique. | `AWAITING_PAYMENT` | Links Invoice + Receivable. | ERP | A duplicate returns the earlier Receivable. |
| ORD-17 | `AWAITING_PAYMENT` | `RECEIVABLE_SETTLED` | Receivable is `PAID`, and outstanding = 0. | `PAID` | Stores settlement summary. | ERP | Payment reversal starts a correction Workflow. Do not delete settlement. |
| ORD-18 | `PAID` | `CLOSE_GATE_PASSED` | Delivery/Invoice/Payment/audit links are complete. | `CLOSED` | Freezes final summary. | ERP | An error after close creates a new correction case. |

## 6. Inventory Reservation state machine

### 6.1 States

`ACTIVE`, `EXTENDED`, `CONSUMED`, `RELEASED`, `EXPIRED`, `FAILED`.

### 6.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| RSV-01 | — | `RESERVE_REQUESTED` | ATP is enough, and the unique key does not exist. | `ACTIVE` | Uses atomic check-and-reserve and sets expiry. | Agent request; ERP commits | Failure: hold nothing. A duplicate returns the earlier Reservation. |
| RSV-02 | `ACTIVE` | `EXTEND_APPROVED` | Owner has permission, Reservation has not expired, and policy allows it. | `EXTENDED` | Updates expiry with a new event/version. | Owner/ERP | **PROPOSED:** allow one extension only and reject a stale request. |
| RSV-03 | `ACTIVE`/`EXTENDED` | `HANDOVER_COMMITTED` | Stock issue succeeds in the same transaction. | `CONSUMED` | Finalizes the issued reserved quantity. | ERP | Transaction failure: keep Reservation active, and stock does not change. |
| RSV-04 | `ACTIVE`/`EXTENDED` | `ORDER_CANCELLED` | No handover. | `RELEASED` | Returns ATP. On-hand does not change. | Owner/ERP | Duplicate release has no effect. |
| RSV-05 | `ACTIVE`/`EXTENDED` | `EXPIRY_REACHED` | Current time ≥ expiry, and no handover. | `EXPIRED` | Returns ATP and creates a notice. | Timer/ERP | Do not restore it. Create a new Reservation ID to continue. |
| RSV-06 | — | `RESERVE_FAILED` | Conflict/concurrency/ATP is not enough. | `FAILED` | Stores the reason and creates no hold. | ERP | Agent proposes an alternative. Retry only after a new check. |

## 7. Shipment state machine

### 7.1 States

`QUOTED`, `BOOKED`, `READY_FOR_HANDOVER`, `HANDED_OVER`, `IN_TRANSIT`, `DELIVERED`, `FAILED`, `CANCELLED`, `RETURNING`, `RETURNED`.

### 7.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| SHP-01 | — | `DELIVERY_OPTIONS_RECEIVED` | Adapter data is valid and has a simulator label. | `QUOTED` | Stores option snapshot. | Connector/ERP | Expired option → request a new quote. Do not edit the snapshot. |
| SHP-02 | `QUOTED` | `CARRIER_SELECTED` | Option is still valid. | `BOOKED` | Creates an idempotent booking. | Owner or deterministic policy through ERP | Booking failure: keep `QUOTED` and retry safely. |
| SHP-03 | `BOOKED` | `PICKING_COMPLETED` | Order picking is complete, and Reservation is active. | `READY_FOR_HANDOVER` | Creates the handover checklist. | Owner/ERP | Cancel before handover → `CANCELLED` and release Reservation. |
| SHP-04 | `READY_FOR_HANDOVER` | `HANDOVER_CONFIRMED` | Actual quantity passes, and handover ID is unique. | `HANDED_OVER` | Stores evidence and creates stock issue in the same transaction. | Owner → ERP | Transaction failure: keep `READY_FOR_HANDOVER` and do not issue stock. |
| SHP-05 | `HANDED_OVER` | `CARRIER_ACCEPTED` | Event is for the correct attempt. | `IN_TRANSIT` | Stores tracking status. | Connector/ERP | Timeout → alert. Do not create a false `IN_TRANSIT` state. |
| SHP-06 | `HANDED_OVER`/`IN_TRANSIT` | `DELIVERY_CONFIRMED` | Event has the correct order/attempt. | `DELIVERED` | Stores delivered time/evidence. | Connector or Owner → ERP | A dispute creates an exception. Do not move back or delete the delivered event. |
| SHP-07 | `HANDED_OVER`/`IN_TRANSIT` | `DELIVERY_FAILED` | Failure reason is valid. | `FAILED` | Creates a decision task. | Connector/ERP | Do not add stock. Retry creates a new Shipment attempt. |
| SHP-08 | `BOOKED`/`READY_FOR_HANDOVER` | `SHIPMENT_CANCELLED` | No handover. | `CANCELLED` | Cancels the booking. | Owner/ERP | The Order flow releases the Reservation. |
| SHP-09 | `FAILED` | `RETURN_STARTED` | Owner decides to return the goods. | `RETURNING` | Creates return tracking. | Owner/ERP | No stock receipt until `RETURN_RECEIVED`. |
| SHP-10 | `RETURNING` | `RETURN_RECEIVED` | Owner confirms physical goods and quantity/condition. | `RETURNED` | Creates a new stock-receipt compensation. | Owner → ERP | Wrong quantity → review. Do not edit the original stock issue. |

## 8. Invoice state machine

### 8.1 States

`DRAFT`, `SUBMISSION_PENDING`, `SUBMITTED`, `RECORDED`, `REJECTED`, `ADJUSTMENT_PENDING`, `ADJUSTED`, `CANCELLED`.

These states describe only the prototype/simulator. They do not confirm the legal states of a real provider.

### 8.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| INV-01 | — | `INVOICE_DRAFT_REQUESTED` | Order is `DELIVERED`, and no matching Invoice version exists. | `DRAFT` | Creates a Draft from the delivered Order snapshot. | Agent request; ERP commits | A duplicate returns the earlier Draft. |
| INV-02 | `DRAFT` | `SUBMIT_REQUESTED` | Required demo fields pass, and idempotency key is valid. | `SUBMISSION_PENDING` | Creates a connector command. | ERP | Command-creation failure: keep `DRAFT`. |
| INV-03 | `SUBMISSION_PENDING` | `CONNECTOR_ACCEPTED` | Adapter receives the command. | `SUBMITTED` | Stores external correlation. | Connector/ERP | Timeout/retry with the same key. Do not create another Invoice version. |
| INV-04 | `SUBMITTED` | `INVOICE_RESULT_ACCEPTED` | Result matches correlation/tenant/version. | `RECORDED` | Stores the simulated result and immutable response. | Connector/ERP | Ignore a duplicate. Conflicting result → review. |
| INV-05 | `SUBMITTED` | `INVOICE_RESULT_REJECTED` | Rejection has a reason. | `REJECTED` | Creates a correction task and keeps the old version. | Connector/ERP | Do not undo delivery/stock. Correct with a new version. |
| INV-06 | `REJECTED` | `CORRECTION_SAVED` | Owner provides valid data. | `DRAFT` | Creates a new Invoice version linked to the rejected version. | Owner/ERP | Do not edit or hide the old rejection. |
| INV-07 | `RECORDED` | `ADJUSTMENT_REQUESTED` | Reason exists, and an approval task is created. | `ADJUSTMENT_PENDING` | Blocks direct editing. | Owner/ERP | Rejected Approval → keep `RECORDED`. |
| INV-08 | `ADJUSTMENT_PENDING` | `ADJUSTMENT_APPROVED_AND_RECORDED` | Owner approves, and adapter result succeeds. | `ADJUSTED` | Creates a linked adjustment record. | Owner + Connector + ERP | Failure keeps pending/blocked. Do not edit the original Invoice. |
| INV-09 | `DRAFT` | `INVOICE_CANCELLED` | Not submitted, and Owner reason exists. | `CANCELLED` | Closes the Draft. | Owner/ERP | Create a new Draft with a new ID/version if needed. |

## 9. Receivable state machine

### 9.1 States

`OPEN`, `OVERDUE`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`.

`WRITE_OFF_PENDING` and `WRITTEN_OFF` are not part of the MVP state machine.

### 9.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| AR-01 | — | `RECEIVABLE_CREATED` | Invoice result is eligible, and Invoice/type is unique. | `OPEN` | Stores amount, due date, and reference. | ERP | A duplicate returns the earlier Receivable. |
| AR-02 | `OPEN` | `DUE_DATE_PASSED` | Outstanding > 0. | `OVERDUE` | Creates an alert/aging snapshot. | Timer/ERP | A later Payment can still be allocated normally. |
| AR-03 | `OPEN`/`OVERDUE` | `PARTIAL_ALLOCATION_APPROVED` | Owner approved the Payment review, and amount is valid. | `PARTIALLY_PAID` | Posts allocation atomically. | Owner → ERP | Wrong allocation → reversal Workflow. Do not edit the allocation. |
| AR-04 | `OPEN`/`OVERDUE`/`PARTIALLY_PAID` | `FULL_ALLOCATION_POSTED` | Total allocation = outstanding. | `PAID` | Settles the Receivable. | ERP | Payment reversal creates a negative allocation and reopens with a new event. |
| AR-07 | `OPEN` | `RECEIVABLE_CANCELLED` | Invoice Draft has no financial effect, or an adjustment was approved. | `CANCELLED` | Creates a cancellation link. | Owner/ERP | Do not delete. A paid Receivable does not use this transition. |

## 10. Payment state machine

### 10.1 States

`RECEIVED`, `DUPLICATE`, `VALIDATING`, `MATCHED`, `NEEDS_REVIEW`, `UNMATCHED`, `ALLOCATED`, `REFUND_PENDING`, `REFUNDED`, `REVERSAL_PENDING`, `REVERSED`.

`DUPLICATE` is an intake/audit result that points to the original Payment. It is not a second financial Payment.

### 10.2 Transitions

| ID | From | Event | Condition | To | Action | Allowed actor | Rollback / compensation |
|---|---|---|---|---|---|---|---|
| PAY-01 | — | `PAYMENT_INGESTED` | New tenant/provider/transaction ID. | `RECEIVED` | Stores immutable raw event/hash. | Connector/ERP | Ingest failure: Connector retries with the same key. |
| PAY-02 | — | `PAYMENT_INGESTED` | Idempotency key exists. | `DUPLICATE` | Stores a duplicate link and creates no cash/allocation. | ERP | No compensation because no mutation exists. |
| PAY-03 | `RECEIVED` | `VALIDATION_STARTED` | Schema/currency is supported. | `VALIDATING` | Finds Receivable candidates in the same tenant. | ERP; Agent explains only | Invalid schema → `NEEDS_REVIEW`. |
| PAY-04 | `VALIDATING` | `EXACT_MATCH_FOUND` | Exact supported reference + exact outstanding amount + one candidate. | `MATCHED` | Stores deterministic match. | ERP | Stale outstanding amount → reject allocation and revalidate. |
| PAY-05 | `VALIDATING` | `MATCH_EXCEPTION_FOUND` | Partial/combined/excess/missing/conflicting/wrong-tenant case. | `NEEDS_REVIEW` | Creates a review task and does not post. | ERP | No AR/cash-allocation mutation. |
| PAY-06 | `MATCHED` | `ALLOCATION_POSTED` | Idempotent allocation transaction passes. | `ALLOCATED` | Atomically posts cash allocation and updates Receivable. | ERP | Transaction failure: post neither and retry with the same key. |
| PAY-07 | `NEEDS_REVIEW` | `MATCH_SELECTED_AND_APPROVED` | Owner selects a valid Receivable/allocation. | `MATCHED` | Stores decision/reason and revalidates amount/outstanding. | Owner → ERP | Stale candidate → keep review and show an error. |
| PAY-08 | `NEEDS_REVIEW` | `NO_MATCH_CONFIRMED` | Owner confirms that data is not enough. | `UNMATCHED` | Keeps Payment in suspense in the demo and creates follow-up. | Owner/ERP | When data is available, create a new review event. |
| PAY-09 | `NEEDS_REVIEW`/`UNMATCHED` | `REFUND_REQUESTED` | Reason and payee evidence exist. | `REFUND_PENDING` | Creates an approval task and does not mark refunded. | Owner/ERP | Reject/timeout keeps the old state. Do not refund automatically. |
| PAY-09R | `REFUND_PENDING` | `REFUND_REJECTED` | Owner rejects, or Approval times out. | State before request | Removes the pending lock and keeps Payment not refunded. | Owner/Timer → ERP | Do not create a refund record. Audit the decision/timeout. |
| PAY-10 | `REFUND_PENDING` | `REFUND_CONFIRMED` | Approval + Connector confirmation. | `REFUNDED` | Stores a refund record linked to the original Payment. | Owner + Connector + ERP | Refund failure → blocked/retry. Do not edit the original Payment. |
| PAY-11 | `ALLOCATED` | `REVERSAL_REQUESTED` | Wrong allocation is found, and Approval is required. | `REVERSAL_PENDING` | Creates a correction task. | Owner/ERP | Do not delete the old allocation. |
| PAY-12 | `REVERSAL_PENDING` | `REVERSAL_POSTED` | Owner approves, and compensation transaction passes. | `REVERSED` | Creates a negative allocation/reopens Receivable if needed. | Owner → ERP | Failure: keep pending and use manual recovery. |

## 11. Cross-entity invariants

| ID | Required invariant |
|---|---|
| INV-A | An Order cannot be `RESERVED` without exactly one active Reservation set for the current Order version. |
| INV-B | No stock issue exists before Shipment `HANDED_OVER`. |
| INV-C | One handover ID creates at most one stock issue. |
| INV-D | A `CONSUMED` Reservation cannot move to `RELEASED` or `EXPIRED`. |
| INV-E | Delivery failure after handover does not increase on-hand stock. Stock increases only through a new return receipt. |
| INV-F | Do not create an Invoice Draft before Order `DELIVERED`. |
| INV-G | One Invoice version has only one submission business key. |
| INV-H | One provider transaction ID in one tenant/provider has only one original Payment. |
| INV-I | A Payment in `NEEDS_REVIEW` cannot change the outstanding Receivable. |
| INV-J | An Order becomes `CLOSED` only when delivery, Invoice, fully paid Receivable, and audit links pass the close gate. Write-off cannot close an Order in the MVP. |
| INV-K | The Agent is not the committing actor for inventory, money, Invoice result, or final status. |
| INV-L | An appended audit record has no edit/delete transition. A correction is a new event. |

## 12. Remaining gaps and PRD alignment

- PRD-163 still asks for a discount threshold. The workflow uses no 3% threshold. The Owner creates a value/program, ERP applies it, and the Agent does not propose a discount. The PRD was not changed in this task.
- PRD-165 is still OPEN. The workflow auto-matches only with score `>= 0,90`, one candidate, and no conflict.
- PRD-166 is still OPEN. The workflow uses a 60-minute Reservation and allows one 30-minute Owner extension.
- PRD-172 is still OPEN. The current Order receives the immediate quantity and creates a linked Order Draft for the remaining quantity, with no auto-reservation/backorder/split.
- Invoice field/result-state mapping with a real provider: PRD-176.
- PRD-044 mentions write-off. The workflow places it outside the MVP, and the close gate accepts only a `PAID` Receivable.
- The PRD does not define SLA. The workflow uses a 15-minute reminder for an order-blocking task and marks a financial task overdue after 4 working hours, without an automatic decision. Connector timeout is a separate GAP.
- Invoice state `RECORDED` is only an internal prototype name. It is not a legal conclusion.
