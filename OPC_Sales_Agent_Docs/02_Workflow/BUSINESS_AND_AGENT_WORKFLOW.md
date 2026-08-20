# BUSINESS AND AGENT WORKFLOW

**Scenario:** B2B order from Zalo until payment is received  
**Source of truth:** `../01_PRD/PRD_OPC_SALES_AGENT.md` version 1.0  
**Document status:** Proposed for PO/BA review  
**Scope:** Demo prototype, minimal ERP slice, connector adapter + simulator  
**Workflow decision update:** 2026-08-20

## 1. Terms and labels

- **AI reasoning:** understands messages, creates candidates, proposes options, and explains them. AI results do not directly change money, stock, or business states.
- **Deterministic business rule:** the ERP/rule engine calculates and checks data by using standard data, clear conditions, and repeatable results.
- **Human decision:** the owner-operator confirms unclear data or approves an exception.
- **CONFIRMED:** approved in the PRD or the current brief.
- **PROPOSED:** suggested for workflow design but not yet approved by the PO.
- **GAP:** a decision is missing or the PRD does not give enough detail.

## 2. Scope and important points

1. The workflow starts when a valid Zalo message event is received in the correct tenant.
2. The workflow ends when the order is delivered, the invoice has the required status, the receivable is fully paid or handled by an approved decision, and the order moves to `CLOSED`.
3. “Approve a stock shortage” does not mean allowing negative stock. A person may approve only an alternative: partial delivery, another SKU, or another date.
4. Stock is reduced only when goods are handed to the carrier. Before this event, there is only a reservation.
5. The invoice is created after successful delivery, as stated in PRD-168.
6. The Owner must review and approve the order confirmation message before it is sent, as stated in PRD-169.
7. MVP connectors are adapters/simulators. This document does not claim that Zalo, banks, carriers, or invoice providers have a real API.
8. The Owner creates price lists, contract prices, discount programs, or an order-specific discount. ERP applies only valid settings. The Agent must not propose, negotiate, or enter a discount value.
9. A Customer/SKU is auto-matched only when the score is `>= 0,90`, there is exactly one candidate, and there is no conflict in a main field. Other cases need Owner review.
10. A reservation is valid for 60 minutes. The Owner may extend it once by 30 minutes before it expires.
11. If the customer accepts partial delivery, the current order contains only the quantity for immediate delivery. The remaining quantity creates a linked Order Draft. The MVP does not auto-reserve it or use automatic backorder/split behavior.
12. Write-off/debt removal is outside the MVP. An Order closes only when its Receivable is fully paid.
13. The 15-minute limit for an order-blocking task only creates a reminder. A reservation expires by its own 60 + 30 minute rule. A financial task is marked overdue only after 4 working hours. No time limit causes automatic approval or rejection.

## 3. Actors

| Actor | Type | Responsibility |
|---|---|---|
| Hotel / buyer | External human | Sends the request, adds information, confirms an option, receives goods, and pays. |
| Owner-operator | Human decision | Checks unclear data, approves exceptions, approves customer messages, confirms handover, and handles mismatches. |
| Channel Adapter | Deterministic integration | Receives simulated Zalo events, standardizes the envelope, and performs the first idempotency check. |
| Sales Operations Agent | AI reasoning + orchestration | Understands content, plans work, calls ERP actions, creates proposals, tracks waiting work, and routes exceptions. |
| ERP / Rule Engine | Deterministic business rule | Manages standard data, prices, debt, available stock, reservations, orders, stock issues, receivables, payments, and states. |
| Approval Service | Deterministic workflow | Creates approval tasks and checks permissions, SLA, decisions, and reasons. |
| Delivery Adapter | Deterministic integration | Returns delivery options and sends handover, in-transit, delivered, or failed events. |
| Invoice Adapter | Deterministic integration | Receives simulated invoice requests and returns accepted/rejected results. |
| Payment Adapter | Deterministic integration | Receives simulated payment events and provides the provider transaction ID and reconciliation data. |
| Audit Service | Deterministic control | Writes an append-only log for all events, decisions, retries, timeouts, and state changes. |
| Demo Administrator | Demo support | Selects or resets a demo tenant. This role cannot approve the tenant's business transactions. |

## 4. Trigger, input, and output

### 4.1 Start trigger

`ZALO_MESSAGE_RECEIVED` with at least:

- `tenant_id`;
- `source_event_id`;
- the configured Zalo source type;
- sender identity provided by the adapter;
- original content;
- received time;
- authentication/connector metadata, if available.

If `tenant_id` or `source_event_id` is missing, the event is rejected and no Workflow Run is created.

### 4.2 Business input

- Customer master and sender-to-customer mapping.
- SKU, unit of measure, and product aliases.
- B2B price list, discount policy, and payment terms.
- Debt, due dates, and credit policy.
- On-hand stock, active reservations, and available-to-promise.
- Delivery policy and data from the Delivery Adapter.
- Customer invoice profile.
- Receivable and payment-reference rules.
- Approval policy, timeout, and Owner permissions.

### 4.3 Final output

- A processed Message linked to a case/order.
- A completed Workflow Run or a stopped run with a reason.
- The Order and its full state history.
- The Reservation and stock movement.
- The Shipment and delivery result.
- The Invoice record and adapter result.
- The Receivable and payment allocation.
- Approval records.
- An audit trail that cannot be changed.

## 5. Current manual process — AS-IS

The AS-IS process is a BA assumption based on `Pain point analysis.docx` and PRD-015 to PRD-017. Real users must be observed before it is treated as a confirmed baseline.

| Step | Actor | Assumed current method | Pain point |
|---:|---|---|---|
| AS-01 | Owner | Reads the Zalo message and copies the content into a notebook, Excel, or another system. | Re-entry can cause errors in quantity, unit, or delivery time. |
| AS-02 | Owner | Remembers the customer or searches by phone number or Zalo name. | The wrong legal entity, price list, or tax code may be selected. |
| AS-03 | Owner | Compares the product name in the message with the product catalog. | Customers use short names, so the wrong SKU or unit may be selected. |
| AS-04 | Owner | Opens a price list or contract to find the price. | The price list may be old, or a discount may not be controlled. |
| AS-05 | Owner | Checks debt in another file or channel. | Overdue debt is found late, and exposure after the new order is not clear. |
| AS-06 | Owner | Checks a stock book, calls the warehouse, or checks several channels. | Reservations are not visible, so the accepted quantity may be too high. |
| AS-07 | Owner + customer | Calls or messages the customer to discuss shortage or discount options. | The option, reason, and person who agreed may not be recorded clearly. |
| AS-08 | Owner | Types the order confirmation message again. | The message may be different from the Order data. |
| AS-09 | Owner | Makes a note to hold and prepare stock. | Stock may be held twice, not released, or held without a clear customer link. |
| AS-10 | Owner | Selects a carrier and creates the shipment manually. | Price, time, cold-goods support, and service area are not shown together. |
| AS-11 | Owner | Reduces stock before or after delivery, or forgets to reduce it. | On-hand stock becomes wrong, and the ownership-change time is unclear. |
| AS-12 | Owner/accountant | Re-enters data after delivery to create the invoice and receivable. | Data is entered twice, and the invoice may not match the actual delivered order. |
| AS-13 | Owner | Opens the bank account, reads the transfer message, and marks payment manually. | A payment may be matched incorrectly, posted twice, or missed. |
| AS-14 | Owner | Updates several places to close the order. | Order, delivery, invoice, debt, and payment states do not match. |

## 6. Agent Workflow — TO-BE

### 6.1 Stage A — Receive and understand the request

| ID / Step | Agent action | ERP / rule engine action | Human action | Business rule | Output | Next state | Required audit data |
|---|---|---|---|---|---|---|---|
| WF-001 Receive event | Watches for new events and does not guess the tenant. | Checks the tenant, source event ID, and idempotency key. Creates one Message and one Workflow Run. | No action. | The same `tenant + source + event_id` creates only one Message. | Valid Message and Run ID. | Message `RECEIVED`; Run `CREATED`. | Payload hash, connector, tenant, event ID, received time, and deduplication result. |
| WF-002 Parse message | Extracts candidate customer, SKU phrase, quantity, unit, delivery request, invoice request, and payment terms. Stores confidence and evidence. | Stores only a versioned extraction. It does not change a transaction. | No action if data is complete. | AI output is a proposal, not ERP data. | Extraction result. | Run `RUNNING`. | Model/prompt version, input hash, candidates, confidence, and latency. Do not store secrets. |
| WF-003 Identify customer | Ranks candidates and explains the reasons. | Finds the Customer by sender mapping, alias, phone, and tenant. Applies the deterministic confidence gate. | Selects the Customer or asks for more information when the result is unclear. | Auto-match only when the score is `>= 0,90`, there is exactly one candidate, and there is no conflict in a main field. | `customer_id` or review task. | `CUSTOMER_MATCHED` or Message `NEEDS_INFO`. | Candidate list, score, rule result, human selection, and reason. |
| WF-004 Identify SKU | Proposes an SKU/unit from natural language and customer history. | Checks that the SKU is active, the unit conversion is configured, the tenant is correct, and the same confidence gate passes. | Confirms the SKU/unit when it is unclear. | AI must not create a new SKU or conversion. Auto-match only when the score is `>= 0,90`, there is exactly one candidate, and there is no conflict in a main field. | Standard Order intent lines. | `ITEMS_MATCHED` or `NEEDS_REVIEW`. | Raw phrase, candidate SKU, unit, confidence, selected value, and actor. |
| WF-005 Check required data | Lists missing data and drafts a short question for the customer. | Checks Customer, line, quantity, unit, requested date, invoice need, and payment term against the schema. | Approves the question before it is sent, when a customer message is needed. | Do not create a Reservation when required quantity data is missing. | Clarification request or validated intent. | Message `NEEDS_INFO` or Run continues. | Missing fields, drafted question, reviewer changes, and send result. |

### 6.2 Stage B — Check commercial rules and reserve stock

| ID / Step | Agent action | ERP / rule engine action | Human action | Business rule | Output | Next state | Required audit data |
|---|---|---|---|---|---|---|---|
| WF-006 Get price and terms | Summarizes the price and terms but does not calculate them. | Gets the correct price list, contract price, or discount program for the Customer/date/SKU. Calculates line total, discount, and tax input with deterministic rules. | Reviews the case if there is no valid price setting. | Do not use a price remembered by AI. ERP applies only settings created by the Owner. Missing price → `BLOCKED`. | Commercial calculation. | `COMMERCIAL_CHECKED` or `BLOCKED`. | Price source/version, eligibility inputs, formula version, and result. |
| WF-007 Check debt | Explains exposure and proposes an action. | Calculates open debt, overdue debt, new exposure, and credit result. | Owner approves every customer with overdue debt. | Overdue debt always needs approval in the MVP. Approval does not remove the overdue state. | Credit result / approval task. | `PENDING_APPROVAL` or continue. | Receivable snapshot ID, due dates, amounts, rule result, and approval. |
| WF-008 Apply discount | Detects a customer request for another price and presents the context. It does not propose a discount value. | Automatically applies an active and eligible price list, contract, or discount program. If the request is outside the settings, it creates an Owner task and does not change the price. | Owner enters a discount or creates/selects the program, scope, validity, and reason, or rejects the request. | There is no system-wide 3% threshold. Every discount must be configured by the Owner. An Owner-entered discount is a human decision. ERP recalculates it with deterministic rules. | Applied price or Owner decision task. | `PENDING_APPROVAL` or continue. | Standard price, customer request, price source/program, version, eligibility conditions, Owner-entered value, actor, reason, and recalculated result. |
| WF-009 Check available stock | Proposes options when stock is short. | Calculates `available = on_hand - active_reservations` in a consistent transaction. | Selects partial delivery, substitute, or later date when stock is short and confirms the option with the customer. | Negative stock cannot be approved. If the customer accepts part of the quantity, the current Order changes to that quantity. The remaining part creates a new Order Draft without a reservation. Every Order version must repeat price, credit, and stock checks. | ATP result or alternative plan. | `STOCK_ELIGIBLE`, `PENDING_APPROVAL`, or `NEEDS_CUSTOMER_CONFIRMATION`. | On-hand, reservations, ATP, version/time, shortage lines, customer decision, and linked remainder Order. |
| WF-010 Create draft + reservation | Calls the correct business action once with a command ID. | In one transaction, checks ATP again and creates an Order Draft and a Reservation that is unique by tenant/order/line, or returns the existing result on retry. | No action when successful. | Stock must not be held twice. A unique key and atomic check-and-reserve are required. | Draft Order + active Reservation + expiry. | Order `RESERVED`; Reservation `ACTIVE`. | Command ID, ATP before/after, Reservation ID, Order ID, expiry, and transaction result. |
| WF-011 Wait for approval/customer confirmation | Tracks the SLA, reminds the Owner, and drafts the option message. | Holds the Reservation for 60 minutes and allows one 30-minute extension command before expiry. | Approves/rejects, confirms the option with the customer, and selects extension when needed. | Do not extend automatically. After 60 minutes, or after the added 30 minutes, the Reservation must be released before work continues. | Approval + customer decision. | `APPROVED`/`REJECTED`/`EXPIRED`. | Reminder, SLA times, decision, reason, customer response, expiry version, extension actor, and release event. |
| WF-012 Confirm Order | Drafts the confirmation from the Order Draft. | Revalidates approval, active Reservation, price, and Customer. Changes the Order to `CONFIRMED`. | Owner reads, edits if needed, and sends it. | The message must use the current Order version. A line or price change returns to validation and reservation. | Confirmed Order + outbound message. | Order `CONFIRMED`; Message `RESPONDED`. | Order version, content before/after edits, approver, and send event ID. |

### 6.3 Stage C — Deliver goods, invoice, and collect payment

| ID / Step | Agent action | ERP / rule engine action | Human action | Business rule | Output | Next state | Required audit data |
|---|---|---|---|---|---|---|---|
| WF-013 Prepare and select delivery | Compares adapter options and explains them with configured data. | Checks service area, goods type, and allowed carrier facts. | Selects a carrier when several options are equal and prepares the goods. | AI must not invent price, SLA, or cold-chain ability. | Shipment draft/booking. | Order `PICKING`; Shipment `BOOKED`. | Candidate carriers, facts, selected carrier, actor, and tracking reference. |
| WF-014 Handover | Reminds the user about the checklist and waits for an event/confirmation. | In one transaction, confirms the active Reservation, records a stock issue, changes the Reservation to `CONSUMED`, the Shipment to `HANDED_OVER`, and the Order to `DISPATCHED`. | Owner confirms that the goods were physically handed over. | Do not reduce stock before handover. A retry with the same handover command must not reduce it again. | Stock movement + handover record. | `DISPATCHED` / `IN_TRANSIT`. | Handover command ID, quantity, lot if available, stock before/after, time, and actor. |
| WF-015 Track delivery | Tracks events, reminds after a timeout, and proposes the next step. | Validates event order and updates the Shipment with deterministic rules. | Handles failed delivery or conflicting data. | A delivery failure after handover does not restore stock. Stock is received again only after a physical return is confirmed. | Delivery result. | `DELIVERED`, `FAILED`, or `RETURNING`. | Provider event ID, raw status, standard status, sequence, and retry/timeout. |
| WF-016 Create Invoice | Prepares a draft from the actual delivered Order and identifies missing data. | After `DELIVERED`, creates an Invoice Draft and an idempotent submission command. | Checks data that must be corrected after adapter rejection. An Invoice adjustment always needs approval. | Do not create an Invoice before successful delivery. Do not delete a rejected Invoice; create a version/resubmission. | Invoice draft/submission. | Invoice `SUBMITTED`, `RECORDED`, or `REJECTED`. | Order snapshot, Invoice version, request hash, adapter result, and rejection reason. |
| WF-017 Create Receivable | Reminds about the due date and payment reference. | When the Invoice reaches the configured state, creates one Receivable per Invoice and calculates the due date from terms. | No action when correct. | A retry must not create a second Receivable. | Open Receivable. | Receivable `OPEN`; Order `AWAITING_PAYMENT`. | Invoice ID, Receivable ID, amount, due date, and terms version. |
| WF-018 Receive payment | Does not make a final decision. It explains match candidates. | Deduplicates by tenant/provider/transaction ID, validates amount, currency/reference, and finds the Receivable. | No action for an exact match; reviews every mismatch. | Only an exact reference and exact amount can auto-match. A duplicate does not change money or debt. | Payment validation result. | Payment `MATCHED` or `NEEDS_REVIEW`. | Raw event hash, transaction ID, deduplication result, candidates, and rule output. |
| WF-019 Allocate and settle debt | Proposes an allocation for a case that needs review. | Exact match: posts the allocation atomically, sets Receivable to `PAID`, and Payment to `ALLOCATED`. Mismatch: does not post. | Approves allocation/refund/adjustment when the match is not exact. | Partial, combined, excess, missing-reference, or conflicting cases always need review. | Payment allocation / review task. | `PAID` or `PARTIALLY_PAID`/`NEEDS_REVIEW`. | Receivable before/after, allocation lines, decision, reason, and command ID. |
| WF-020 Close Order | Summarizes the full case and handled exceptions. | Closes only when delivery is complete, the Invoice has the required state, and the Receivable is fully paid. | No action when the close gate passes. | Write-off is outside the MVP. Close is a deterministic gate. The Agent cannot write `CLOSED`. | Closed case. | Order/Run `CLOSED`/`COMPLETED`. | Gate results, related IDs, final totals, actor, and completion time. |

## 7. Happy path

1. The Adapter receives one new message event and creates exactly one Message/Workflow Run.
2. AI identifies one Customer and the SKUs with confidence that passes the policy.
3. ERP gets and applies the correct Owner-configured price list, contract, or program. The Customer has no overdue debt.
4. ERP checks ATP and creates the Order Draft + Reservation in one transaction.
5. The Owner reviews and sends the Order confirmation.
6. The goods are picked, and the Owner confirms handover.
7. ERP reduces stock once at handover, and the Shipment reaches `DELIVERED`.
8. ERP creates an Invoice Draft after delivery, and the simulator returns `RECORDED`.
9. ERP creates the Receivable and payment reference.
10. A Payment event with the correct reference and amount is deduplicated, matched, and allocated automatically.
11. The Receivable changes to `PAID`, the deterministic close gate changes the Order to `CLOSED`, and the Workflow becomes `COMPLETED`.

## 8. Exception playbook

| Case | Detection | AI reasoning | Deterministic rule | Human decision | Compensation / next action |
|---|---|---|---|---|---|
| Missing customer information | There is no unique match, or required invoice/contact data is missing. | Lists the missing data and drafts a short question. | Does not create a Reservation or official Order. | Selects the correct Customer or approves the customer question. | Data received → run match again; timeout → `BLOCKED` with no stock hold. |
| SKU not identified | There is no single active SKU, or the unit cannot be converted. | Proposes candidates with evidence and does not create an SKU. | Blocks the unclear line. | Selects the SKU/unit or asks the customer. | Changed line → repeat price, credit, and ATP checks. |
| Stock shortage | Requested quantity > ATP. | Proposes partial delivery, substitute, or later date. | Does not allow a Reservation above ATP or negative stock. | Approves an option to send to the customer. The user cannot approve “selling negative stock.” | If the customer accepts part: update the current Order with the accepted quantity, create a linked Order Draft for the remaining quantity, and do not reserve the new Draft. Validate both separately. If not accepted → cancel/release. |
| Customer has overdue debt | An overdue Receivable exists. | Summarizes debt age, amount, and exposure. | Always creates an approval task before confirmation. | Owner approves/rejects and enters a reason. | Approve → continue if the Reservation is active; reject/timeout → cancel/release. |
| Discount above program limit / price outside settings | The customer request does not match an active price setting or is above the limit set by the Owner for a specific program. | Summarizes the request and impact. It does not propose or change a price. | Applies a valid setting. If none exists, blocks the price change and creates a task. There is no system-wide 3% threshold. | Owner enters the discount, creates/selects the program and reason, or rejects it. | New setting → ERP repeats price, debt, and ATP checks; rejection → use the standard price or ask the customer. |
| Delivery failed | Delivery event is `FAILED` or passes the delivery timeout. | Proposes redelivery, another carrier, or return. | Does not restore stock because it was issued at handover. | Owner selects redelivery or return. | Retry → new Shipment attempt; return → `RETURNING`, with stock receipt only after physical return is confirmed. |
| Invoice rejected | Invoice Adapter returns `REJECTED`. | Summarizes the field/reason and proposes data to correct. | Keeps the rejected Invoice and version. It does not delete/overwrite it or reverse stock/delivery. | Owner corrects data or escalates. | Creates an idempotent resubmission. Adjustment/refund needs approval. |
| Payment mismatch | Reference is wrong/missing, amount is different, several Receivables are candidates, or the tenant is different. | Ranks match candidates and explains them. | Does not post an allocation. Payment is `NEEDS_REVIEW`. | Owner selects an allocation, keeps it waiting, or creates a refund request. | Approved allocation → post once; refund always needs approval; no match → `UNMATCHED`. |

## 9. Common operating rules

### 9.1 Retry

- Retry only an action that is known to be safe and has an idempotency key.
- **PROPOSED:** exponential backoff after 1, 5, and 15 minutes, with at most 3 retries for a connector simulator.
- Do not automatically retry a human decision or an action after its data has changed.
- Before every retry, ERP revalidates the tenant, current state, and earlier command result.
- After all retries fail → Workflow `BLOCKED`, create an Owner task, and keep all committed data unchanged.

### 9.2 Timeout

- A Message clarification timeout must not cause a guessed answer.
- An approval timeout must not be treated as approval.
- An order-blocking task gets a reminder after 15 minutes but stays `WAITING_HUMAN`. A related Reservation follows its separate 60-minute expiry rule.
- A financial task is marked overdue after 4 working hours, but its state and financial data do not change.
- A Reservation timeout must release the Reservation with a deterministic command if handover has not happened.
- Delivery, Invoice, and Payment timeouts only move the Workflow to waiting/escalation. They do not create a false success.
- Unapproved connector timeouts and delivery reminder times must stay **PROPOSED** in `DECISION_AND_APPROVAL_MATRIX.md`.

### 9.3 Idempotency

- Inbound event: `tenant_id + connector + source_event_id`.
- Workflow command: `tenant_id + workflow_run_id + step_id + attempt_business_key`.
- Reservation: `tenant_id + order_id + order_line_id + reservation_purpose`.
- Handover/stock issue: `tenant_id + shipment_id + handover_id`.
- Invoice request: `tenant_id + order_id + invoice_version`.
- Receivable: `tenant_id + invoice_id + receivable_type`.
- Payment: `tenant_id + provider + provider_transaction_id`.
- A duplicate request must return the earlier result or a “duplicate ignored” state. It must not create a new business record.

### 9.4 Prevent double reservation

1. Check ATP again inside the Reservation transaction.
2. Use a unique constraint for tenant/Order line/purpose.
3. Reservation quantity must not be more than ATP at commit time.
4. A retry returns the existing Reservation.
5. A Reservation may move only once to `CONSUMED`, `RELEASED`, or `EXPIRED`.

### 9.5 Release and stock issue

- Cancel before handover: change the Reservation to `RELEASED`; on-hand stock does not change.
- Reservation expiry: change it to `EXPIRED`; on-hand stock does not change.
- Handover: create a stock issue and atomically change the Reservation to `CONSUMED`.
- Delivery failure after handover: do not release the Reservation or add on-hand stock.
- Create a new stock-receipt compensation only after the goods physically return and the return is confirmed.

### 9.6 Audit log that cannot be changed

- Audit is append-only. The UI has no action to edit or delete an audit record.
- Each record has tenant, entity, entity version, event/command ID, actor type, actor ID, time, before/after hash, reason, and correlation ID.
- Correct an error with a new compensation event/transaction. Do not change the old record.
- The system must detect a missing or out-of-order audit chain.
- The retention policy is GAP PRD-177 and is not confirmed here.

## 10. Remaining gaps and PRD alignment

| Gap / alignment | Source | Impact | Status / next action |
|---|---|---|---|
| Discount control | PRD-163 still asks for a discount threshold. | The PRD must be aligned before SRS/UAT. | **CONFIRMED for the workflow:** do not use a 3% threshold. The Owner configures the value/program, ERP applies it, and the Agent does not propose a discount. The PRD was not changed in this task. |
| Customer/SKU confidence | PRD-165 is still OPEN in the PRD. | The PRD must be aligned and a test set must be prepared. | **CONFIRMED for the workflow:** auto-match only with score `>= 0,90`, one candidate, and no conflict. |
| Reservation expiry | PRD-166 is still OPEN in the PRD. | The PRD must be aligned and the timeout tested. | **CONFIRMED for the workflow:** 60 minutes, with one 30-minute Owner extension before expiry. |
| Partial delivery/backorder | PRD-172 is still OPEN in the PRD. | The PRD must be aligned and the linked Order tested. | **CONFIRMED for the workflow:** the current Order keeps only the immediate quantity. The remaining quantity creates a new Order Draft without auto-reservation or automatic backorder/split. |
| Zalo source type | PRD-174 | Connector envelope and outbound rule. | Use `ZALO_SIMULATOR`. Do not claim that OA, personal chat, or group chat is a real capability. |
| Carrier selection criteria | PRD-175 | Recommendation and audit. | Use seed data for service area, goods type, fee, and pickup time. Label all data as simulated. |
| Invoice fields/states | PRD-176 | State machine and rejection/resubmission. | Use the minimum demo schema. A specialist must approve it before SRS. |
| Audit retention | PRD-177 | Storage, privacy, and deletion. | Do not set a period in the workflow. Keep it as a GAP. |
| Approval SLA | Not in the PRD. | The PRD must be aligned and reminder/overdue behavior tested. | **CONFIRMED for the workflow:** remind an order-blocking task after 15 minutes; Reservation expiry is separate; mark a financial task overdue after 4 working hours; do not make an automatic decision. |
| Receivable write-off | PRD-044 mentions it but gives no detailed rule. | The close gate must be aligned in the PRD. | **CONFIRMED for the workflow:** outside the MVP. A Receivable with debt stays open, and the Order does not close. |
| Product Owner name | PRD-180 | Decision ownership and Dev-ready gate. | Must be added before SRS/UAT is locked. |

## 11. Main traceability

- Message and extraction: PRD-028 to PRD-031 and PRD-095 to PRD-098.
- Price, debt, stock, and Reservation: PRD-032 to PRD-036 and PRD-103 to PRD-110.
- Confirmation and delivery: PRD-037 to PRD-039, PRD-167, and PRD-169.
- Invoice, Receivable, and Payment: PRD-040 to PRD-044, PRD-168, and PRD-171.
- Retry, timeout, and idempotency: PRD-111, PRD-114 to PRD-116, PRD-136, and PRD-140.
- Audit: PRD-022, PRD-048, PRD-064, PRD-089, and the current requirement for an audit log that cannot be changed.
