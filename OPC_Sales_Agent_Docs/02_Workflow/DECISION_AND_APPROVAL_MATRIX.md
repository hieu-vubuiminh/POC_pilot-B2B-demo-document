# DECISION AND APPROVAL MATRIX

**Scenario:** B2B order from Zalo until payment is received  
**Source of truth:** OPC Sales Agent PRD version 1.0  
**Status:** Proposed for PO/BA approval  
**Workflow decision update:** 2026-08-20

## 1. Three decision layers

| Layer | Allowed | Not allowed |
|---|---|---|
| **AI reasoning** | Understand natural language, create candidates, summarize data, propose options, explain them, and draft content. | Must not calculate or write price, stock, money, tax input, approval result, or final status. |
| **Deterministic business rule** | Find ERP data, calculate, validate, enforce thresholds, change states, apply idempotency, and commit transactions. | Must not decide an exception that needs judgment or present a claim without evidence as a fact. |
| **Human decision** | Select unclear data, approve/reject exceptions, confirm physical events, and approve customer messages. | Must not bypass tenant, negative-stock, invalid-state, duplicate, or audit rules. |

## 2. Automation and decision matrix

| ID | Action / decision | AI reasoning | Deterministic rule | Human decision | Automation level | Result |
|---|---|---|---|---|---|---|
| DAM-001 | Receive Message | Not needed. | Validates tenant/event ID, deduplicates, and creates Message/Run. | None. | Automatic. | `RECEIVED` or duplicate ignored. |
| DAM-002 | Extract intent | Extracts Customer, item, quantity, unit, delivery, Invoice, and terms with confidence/evidence. | Validates output schema/version. | None if output is valid. | Automatic AI reasoning. | Candidate extraction; business data not committed. |
| DAM-003 | Match Customer | Ranks candidates and explains them. | Searches in the same tenant and applies confidence + unique-match rules. | Selects when confidence is low or the result is unclear. | Hybrid. | `customer_id` or review. |
| DAM-004 | Match SKU/unit | Proposes SKU/alias/unit. | Validates active SKU and configured conversion. | Selects when unclear. | Hybrid. | Standard Order intent line. |
| DAM-005 | Find missing data | Drafts a short question. | Checks required schema fields. | Approves the customer question. | Hybrid. | Clarification request. |
| DAM-006 | Select price list | Summarizes only. | Selects a price list by tenant/Customer/date/SKU. | Reviews only when there is no valid price. | Automatic deterministic. | Standard price source. |
| DAM-007 | Calculate amount/discount/tax input | Does not calculate or propose a discount value. | Selects the Owner-configured price list/contract/program, checks validity/conditions, and calculates by formula/policy version. | Owner enters the value/program when the request is outside the settings, or rejects it. | Deterministic; human decision when a new price is needed. | Commercial calculation or Owner task. |
| DAM-008 | Check debt | Summarizes debt age/exposure. | Calculates open debt, overdue debt, and new exposure. | Approves every overdue case. | Deterministic + required approval when overdue. | Credit result/approval. |
| DAM-009 | Check ATP | Proposes alternatives when stock is short. | Uses `on_hand - active reservation` and prevents a negative result. | Approves partial/substitute/later options. | Deterministic; human selects an alternative. | Eligible or alternative plan. |
| DAM-010 | Create Reservation | Does not decide quantity. | Uses atomic recheck-and-reserve, a unique key, and expiry. | None when conditions pass. | Automatic deterministic. | One active Reservation. |
| DAM-011 | Extend Reservation | May send a reminder. | Validates policy, expiry, and extension count. | Owner selects extension. | Human decision + deterministic enforcement. | New expiry version. |
| DAM-012 | Confirm Order for customer | Drafts from the current Order version. | Revalidates Order + Reservation + approvals. | Owner must review and send. | Human required. | `CONFIRMED` + outbound Message. |
| DAM-013 | Compare delivery | Explains options. | Uses only facts from adapter/configuration. | Selects when policy has no single result. | Hybrid. | Shipment booking. |
| DAM-014 | Hand over goods | Reminds about the checklist. | Validates actual quantity and atomically records stock issue + Reservation consumption. | Owner confirms the physical event. | Human trigger + deterministic commit. | `DISPATCHED`; stock reduces once. |
| DAM-015 | Update delivery | Makes no conclusion beyond the event. | Normalizes, deduplicates, and orders the event. | Handles exceptions only. | Automatic deterministic. | Shipment state. |
| DAM-016 | Delivery failure | Proposes redelivery/return. | Prevents automatic stock receipt. | Owner selects an option. | Human required. | New Shipment attempt or return flow. |
| DAM-017 | Create Invoice Draft | Finds missing fields and does not calculate with AI. | Runs only after `DELIVERED` and creates an idempotent Draft/request. | None if data passes. | Automatic deterministic. | Invoice Draft/submission. |
| DAM-018 | Invoice rejected | Summarizes the reason and fields to correct. | Keeps the rejected version and blocks the Receivable if policy requires it. | Owner corrects/approves resubmission. | Human correction. | New version/resubmission. |
| DAM-019 | Create Receivable | None. | Creates one by Invoice/type and calculates amount/due date from terms. | None if conditions pass. | Automatic deterministic. | Receivable `OPEN`. |
| DAM-020 | Receive Payment | None. | Deduplicates by tenant/provider/transaction ID. | None. | Automatic deterministic. | New Payment or duplicate ignored. |
| DAM-021 | Exact Payment match | Explains the match. | Requires exact supported reference + exact amount + one candidate. | None. | Automatic deterministic. | Allocation + Receivable paid. |
| DAM-022 | Payment mismatch | Ranks candidates/options. | Does not post an allocation. | Owner selects allocation/keep waiting/refund request. | Human required. | Review decision. |
| DAM-023 | Refund | May summarize impact. | Validates amount/payee/original Payment. | Owner always approves/rejects. | Human required. | Refund request/result. |
| DAM-024 | Invoice adjustment | May summarize reason/impact. | Does not change the original Invoice and creates a linked adjustment. | Owner always approves/rejects. | Human required. | Adjustment record. |
| DAM-025 | Close Order | Summarizes the case. | Close gate: delivered + Invoice state + Receivable fully paid + audit links. | None. | Automatic deterministic. | Order `CLOSED`; Run `COMPLETED`. |
| DAM-026 | Write-off | No action is available in the MVP. | There is no write-off command/state. A Receivable with debt stays open. | Not applicable. | **OUT OF MVP**. | Order does not close when outstanding > 0. |

## 3. Human approval and review matrix

### 3.1 Common SLA

- **CONFIRMED for the workflow:** an order-confirmation blocking task gets a reminder after 15 minutes. It keeps waiting and is not automatically blocked, approved, or rejected.
- **CONFIRMED for the workflow:** a post-delivery Invoice/Payment/refund task is marked overdue after 4 working hours. Its state and financial data do not change automatically.
- A timeout is never treated as approval.
- The Owner-operator is the prototype approver under PRD-170.
- The Demo Administrator cannot approve for a tenant.
- The 60-minute Reservation expiry and one 30-minute extension are separate from reminders.
- The 30-minute delivery-exception reminder and connector timeouts are still **PROPOSED**.

### 3.2 Approval / review matrix

| ID | Approval/review action | Required condition | Authorized role | Reminder / limit | Action at the limit | Required data before the decision |
|---|---|---|---|---|---|---|
| APR-001 | Select Customer | There is no unique match above the confidence threshold. | Owner | Reminder after 15 minutes | Keep `WAITING_HUMAN`; do not reserve or auto-select. | Original Message, sender, candidate Customer, tax code/contact if available, score, evidence, and current debt. |
| APR-002 | Select SKU/unit | SKU or unit is unclear/invalid. | Owner | Reminder after 15 minutes | Keep `WAITING_HUMAN`; do not price or reserve that line. | Original phrase, candidate SKU, standard name/unit/price, score, stock, and a warning if conversion is missing. |
| APR-003 | Send a clarification question | A required field is missing. | Owner | Reminder after 15 minutes | Keep `WAITING_HUMAN`; do not send or reserve. | Missing field, original content, Agent draft, recipient/channel, and cost if available. |
| APR-004 | Overdue debt | At least one Receivable is overdue. | Owner | Reminder after 15 minutes | Keep `WAITING_HUMAN`; do not confirm. Handle Reservation expiry separately. | Total debt, overdue amount, debt age, due dates, payment history, exposure after the Order, and Order amount. |
| APR-005 | Discount request outside settings | The customer request does not match an active price list, contract price, or program, or is above the Owner's limit for a specific program. | Owner | Reminder after 15 minutes | Keep `WAITING_HUMAN`; do not reduce the price automatically. Handle Reservation expiry separately. | Standard price/source, customer request, current programs and conditions, margin/cost if available, Customer/Order history, and Owner-entered value/scope/validity/reason. |
| APR-006 | Shortage alternative | Requested quantity > ATP. | Owner | Reminder after 15 minutes | Keep `WAITING_HUMAN`; do not reserve above ATP. If partial delivery is selected, the remaining quantity becomes a new Order Draft without a Reservation. | On-hand, active Reservations, ATP, requested quantity, partial/substitute/later options, price, and delivery impact. |
| APR-007 | Extend Reservation | It is close to expiry and is not confirmed/handed over. | Owner | Before expiry | Reservation becomes `EXPIRED` and is released. | Reservation ID, quantity, created/expiry time, Customer/Order, waiting reason, and extension count. |
| APR-008 | Send Order confirmation | Every Order in the prototype. | Owner | Reminder after 15 minutes | Do not send automatically. If the Reservation expires, release it and check again. | All lines/quantities/units/prices, discount, tax-input summary, delivery, payment terms, Invoice need, debt exception, and Reservation expiry. |
| APR-009 | Select carrier | There is no deterministic winner, or the Owner wants another option. | Owner | Reminder after 15 minutes | Shipment is not booked, and the task keeps waiting. | Carrier options, source, fee, service area, pickup time, cold-goods flag, and simulator label. |
| APR-010 | Confirm handover | Goods were physically given to the carrier. | Owner | Based on pickup | No stock issue; Shipment does not become `HANDED_OVER`. | Order/Shipment, actual lines/quantities, Reservation, carrier/tracking, handover time, and evidence. |
| APR-011 | Delivery failure | Shipment is `FAILED`, or a timeout needs action. | Owner | **PROPOSED:** reminder after 30 minutes | Mark overdue and remind. Do not auto-return stock or auto-select an option. | Failure reason/event, last location/status, goods/quantity, stock-issue ID, redelivery/return options, and cost. |
| APR-012 | Correct/resubmit Invoice | Adapter returns `REJECTED`. | Owner | Overdue after 4 working hours | Mark overdue and remind. Order stays `INVOICE_BLOCKED`. | Invoice/Order snapshot, rejected version, reason code/text, fields to correct, proposed correction, and simulator label. |
| APR-013 | Invoice adjustment | Any adjustment after the Invoice is recorded. | Owner | Overdue after 4 working hours | Mark overdue and remind. Keep the current Invoice and do not adjust it. | Original Invoice, adjustment type/reason, amount/field before and after, and Order/delivery/Payment impact. |
| APR-014 | Payment mismatch | Partial, combined, excess, missing-reference, conflicting, or multiple-candidate case. | Owner | Overdue after 4 working hours | Mark overdue and remind. Payment/Receivable does not change. | Raw Payment, provider transaction ID, payer, amount/time/reference, candidate Receivable, outstanding amount/due date, and match reason. |
| APR-015 | Refund | Every refund. | Owner | Overdue after 4 working hours | Mark overdue and remind. Do not refund. | Original Payment, allocation, payee evidence, amount, reason, linked Order/Invoice, and fraud/duplicate warning. |
| APR-016 | Payment reversal | A posted allocation is found to be wrong. | Owner | Overdue after 4 working hours | Mark overdue and remind. Keep the allocation and block close/correction. | Old allocation, Receivable before/after, reason, proposed negative allocation, and Order impact. |

## 4. Required approval rules

1. The Agent cannot approve, reject, or simulate a human decision.
2. An Approval is linked to the correct `tenant_id`, entity ID, entity version, rule version, and snapshot hash.
3. An expired Approval or changed entity is stale. The Owner must review a new task.
4. Approval does not bypass a deterministic rule. For example, the Owner cannot approve negative stock or a cross-tenant match.
5. The Owner must enter a reason when approving/rejecting an exception.
6. An Approval is valid only for its scope and version. It cannot be reused for another Order.
7. A decision is append-only. A correction creates a new decision event.
8. A reminder/overdue result only creates an alert or overdue flag. It does not automatically approve/reject or change a business state. Reservation expiry is a separate rule.

## 5. Policies and operating parameters

| Policy | Value | Status / reason | PO/BA decision needed |
|---|---|---|---|
| Price/discount control | There is no system-wide 3% threshold. The Owner creates price lists, contract prices, programs, or specific discounts. ERP applies them when valid. | **CONFIRMED for the workflow.** The Agent must not propose or negotiate a discount. | No; align PRD-163 after this task. |
| Customer/SKU auto-match | Score `>= 0,90`, one candidate, and no conflict in a main field | **CONFIRMED for the workflow.** It still needs calibration with a test set before production. | No; align PRD-165. |
| Confidence review band | `< 0,90`, several candidates, or conflict in a main field → review | **CONFIRMED for the workflow.** AI must not select when the result is uncertain. | No. |
| Reservation TTL | 60 minutes | **CONFIRMED for the workflow.** Stock is not held without a limit. | No; align PRD-166. |
| Reservation extension | Once, for 30 more minutes, selected by the Owner before expiry | **CONFIRMED for the workflow.** No automatic extension. | No. |
| Order-blocking task reminder | After 15 minutes; no automatic block/approval/rejection | **CONFIRMED for the workflow.** Reservation expiry is handled separately. | No; align the PRD. |
| Delivery exception SLA | 30 minutes | Reduces the time that goods stay in an unclear state. | Yes. |
| Financial task overdue | After 4 working hours; only mark and remind | **CONFIRMED for the workflow.** No automatic money/Invoice action. | No; align the PRD. |
| Connector retry | After 1, 5, and 15 minutes; at most 3 retries | Shows controlled retry behavior. | May be approved in SRS. |

## 6. Retry, timeout, and idempotency matrix

| Operation | Idempotency key | Retry | Timeout **PROPOSED** | After retry/timeout limit | Compensation |
|---|---|---|---|---|---|
| Ingest Zalo event | tenant + connector + source event ID | Connector retries with the same key | 30 seconds/request | Dead-letter/`BLOCKED`; alert | No business change except the single Message. |
| AI extraction | Run + Message version + model/prompt version | At most 2 times with the same input; new version if model/prompt changes | 60 seconds | `FAILED`/human review | No transaction change. |
| Create Order + Reservation | tenant + Order intent + command ID | Retry the same command after conflict recheck | 10-second transaction | `BLOCKED`/shortage review | Atomic transaction; do not create only one part. |
| Extend Reservation | Reservation + current version | Do not blindly retry a stale version | Before expiry | Reservation expires/releases | Create a new Reservation after a new check if work continues. |
| Send Order confirmation | tenant + outbound Message ID | After 1, 5, and 15 minutes | 30 seconds/attempt | Keep unsent; alert Owner | Do not automatically send another Message version. |
| Book Shipment | tenant + Order + Shipment attempt | After 1, 5, and 15 minutes | 30 seconds/attempt | `BLOCKED`; not handed over | Cancel booking if the connector confirms creation but the local action fails. |
| Handover + stock issue | tenant + Shipment + handover ID | Retry with the same key | 10-second transaction | Keep `READY_FOR_HANDOVER`; alert | Atomic: do not create a partial stock issue. |
| Delivery event | tenant + carrier + provider event ID | Event replay is safe | Based on delivery policy | Alert; do not invent delivered/failed | Do not change stock; Owner decides. |
| Invoice submission | tenant + Order + Invoice version | After 1, 5, and 15 minutes with the same key | 30 seconds/attempt; result timeout **PROPOSED 4 hours** | `INVOICE_BLOCKED`/reconcile connector | Do not delete the Invoice; resubmit the version/key in a controlled way. |
| Create Receivable | tenant + Invoice + type | Retry with the same key | 10 seconds | `BLOCKED` | A duplicate returns the earlier record. |
| Payment ingest | tenant + provider + transaction ID | Event replay is safe | 30 seconds | `NEEDS_REVIEW`/alert | A duplicate does not post money. |
| Payment allocation | tenant + Payment + allocation version | Retry with the same key after revalidation | 10-second transaction | `NEEDS_REVIEW` | Atomic cash + Receivable; reversal is a new transaction. |
| Refund/adjustment | tenant + original entity + approved request ID | Retry the connector only after approval | Based on connector; **PROPOSED 4 hours** | `BLOCKED`; no automatic success | Linked compensation record; do not edit the original. |

## 7. Prevent double reservation and manage stock

| Rule | Enforcement |
|---|---|
| One Order line/purpose has only one active Reservation | Unique deterministic key in the tenant. |
| ATP must be checked again inside the Reservation transaction | Do not commit with an AI value or old snapshot. |
| Reservation retry returns the earlier record | Command idempotency. |
| Cancel before handover | Reservation `RELEASED`; on-hand stays unchanged. |
| TTL ends | Reservation `EXPIRED`; on-hand stays unchanged. |
| Do not reduce stock before handover | Only a valid handover command creates a stock issue. |
| Handover retry does not reduce stock twice | Unique handover ID + stock-movement key. |
| Delivery failure after handover | Do not add stock; receive stock only when the goods physically return. |
| Do not edit a movement | Every correction is a new linked compensation movement with reason/approval. |

## 8. Common data required before every Approval

In addition to the specific data in the APR table, the Approval screen must always show:

- Clear tenant/company.
- Entity type, ID, version, and current state.
- Customer and Order summary.
- Related original trigger/Message or source event.
- Agent proposal, confidence, and evidence, clearly marked as an AI proposal.
- Deterministic rule result, rule/policy version, and source data.
- The action that will happen after approval.
- Impact on stock, money, Invoice, delivery, and customer Message.
- Compensation action if an error happens.
- Remaining SLA and Reservation expiry, when relevant.
- Clear `Approve` / `Reject` buttons with a required reason.
- A warning when the task is stale or data has changed.

## 9. Audit log that cannot be changed

### 9.1 Required events

- Inbound connector event and deduplication result.
- AI request/result metadata, evidence, confidence, and version.
- Rule evaluation input/result/version.
- Every business command, idempotency key, and retry attempt.
- Every state before/after transition.
- Approval created/viewed/approved/rejected/expired.
- Reservation create/extend/release/expire/consume.
- Stock issue/receipt/adjustment.
- Shipment/Invoice/Payment connector event.
- Payment match/allocation/refund/reversal.
- Timeout, blocked result, compensation, and manual recovery.

### 9.2 Minimum audit fields

`audit_event_id`, `tenant_id`, `correlation_id`, `workflow_run_id`, `entity_type`, `entity_id`, `entity_version`, `event_type`, `actor_type`, `actor_id`, `occurred_at`, `source_event_id`, `command_id`, `idempotency_key`, `before_hash`, `after_hash`, `reason`, `policy_version`, `result`.

### 9.3 Invariant rules

- There is no API/UI action to edit or delete an audit event.
- A correction does not overwrite data. It appends a new event that points to the wrong event.
- The system must detect a missing sequence, duplicate sequence, or hash mismatch.
- Audit retention and view permissions are GAP PRD-177. No legal retention period is set here.

## 10. Remaining gaps and PRD alignment

| Gap / alignment | Impact | Status |
|---|---|---|
| Discount control | The PRD must be aligned before SRS/UAT. | **CONFIRMED for the workflow:** no 3% threshold. The Owner configures the value, ERP applies it, and the Agent does not propose a discount. PRD-163 was not changed. |
| Customer/SKU confidence | The PRD must be aligned and an evaluation set prepared. | **CONFIRMED for the workflow:** `>= 0,90`, unique, and no conflict. PRD-165 was not changed. |
| Reservation TTL/extension | The PRD must be aligned, and timeout/oversell tested. | **CONFIRMED for the workflow:** 60 minutes + one 30-minute extension. PRD-166 was not changed. |
| Approval reminder/overdue | The PRD and Acceptance Criteria must be aligned. | **CONFIRMED for the workflow:** 15-minute reminder for an order-blocking task; financial task overdue after 4 working hours; no automatic decision. The 30-minute delivery reminder stays PROPOSED. |
| Partial delivery/backorder | The PRD must be aligned and the linked Order tested. | **CONFIRMED for the workflow:** the remaining quantity creates a new Order Draft with no auto-reservation or automatic backorder/split. |
| Invoice provider fields/states | Blocks real connector mapping. | PRD-176 OPEN; the current states are for the internal prototype. |
| Write-off scope | The PRD close gate must be aligned. | **CONFIRMED for the workflow:** outside the MVP. Outstanding debt stays open, and the Order does not close. |
| Audit retention/access | Affects privacy, storage, and roles. | PRD-177 OPEN. |
| Named Product Owner | Blocks authority to close these gaps. | PRD-180 OPEN. |
