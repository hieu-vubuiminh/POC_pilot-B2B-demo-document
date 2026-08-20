# Product Requirements Document: OPC Sales Operations Agent

**Version:** 1.0  
**Date:** 20 August 2026  
**Status:** Final PRD — product scope approved; not Dev-ready  
**Product type:** Domain MVP / demo prototype  
**Primary scenario:** B2B hotel order from Zalo to payment and order closure  
**Lifecycle stage:** Define / build and validate  
**Decision owner:** OPEN — Product Owner name required

## Status Legend

- **CONFIRMED:** Supported by the user brief or the business problem statement.
- **PROPOSED:** A product decision recommended in this PRD.
- **ASSUMPTION:** A working assumption that needs validation.
- **OPEN:** No decision has been made.

## 1. Executive Summary

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-001 | CONFIRMED | The product shall prove how an AI-assisted one-person company can run one sales operations domain. It is not a complete OPC product and not a full ERP. |
| PRD-002 | CONFIRMED | The main scenario shall start with a hotel order request from Zalo and end when delivery, invoice status, payment, and order status are reconciled and the order is closed. |
| PRD-003 | CONFIRMED | ERP data and deterministic rules shall be the source of truth for customers, products, prices, credit, inventory, tax inputs, money, and business status. |
| PRD-004 | CONFIRMED | AI shall understand unstructured messages, prepare a plan, coordinate steps, and explain exceptions. AI shall not guess inventory, money, tax, price, or final status. |
| PRD-005 | PROPOSED | The release shall be a demo prototype, not a live customer pilot. It shall clearly label simulated data and simulated connector events. |
| PRD-006 | PROPOSED | The demo shall support 2–3 logically separated companies to show the future SaaS direction. It shall not claim production-grade tenant isolation. |
| PRD-007 | PROPOSED | The MVP shall include only a minimal ERP slice for this workflow: customer, product, price, credit, stock, reservation, order, delivery, invoice status, receivable, payment, approval, and audit data. |
| PRD-008 | PROPOSED | External channels shall use stable adapter contracts and simulators. A real integration shall be enabled only after its API, access rights, sandbox, cost, and operating limits are verified. |

The value of this MVP is not “AI can chat.” The value is that one operator can supervise a complete sales workflow while the system performs safe routine work and asks for approval at clear risk points.

## 2. Evidence and Reference Boundary

The following sources were reviewed:

- The “Kế nghiệp số Gia Lai” business problem document: business context and three target business profiles.
- The Gia Lai private economy presentation: strategic context for “one-person companies using AI.”
- `Pain point analysis.docx`: working BA analysis and proposed scenarios.
- SoloMatrix v4 documents, HTML, and JavaScript: a solution reference and interactive mockup.
- A runtime smoke test of SoloMatrix v4: current visible behavior, not proof of production capability.

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-009 | CONFIRMED | The business profile for local specialty goods includes regular sales to restaurants and hotels, receivables, invoices, delivery needs, and shared inventory across channels. |
| PRD-010 | CONFIRMED | The OPC strategy describes a lean or one-person company using accessible AI tools. It does not define the detailed Sales Operations Agent requirements. |
| PRD-011 | CONFIRMED | SoloMatrix v4 shall be treated as a reference hypothesis only. Its screens, rules, numbers, and connectors are not approved requirements by default. |
| PRD-012 | PROPOSED | Legal statements, tax rules, invoice rules, and connector capability claims found in reference files shall require separate validation before they become build requirements. |

## 3. Product Lifecycle and Decision Rights

This section applies the general POA and product-lifecycle guidance from the Product Owner skill. DocNexus-specific RAG and knowledge-base rules are not used.

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-179 | PROPOSED | The current lifecycle stage shall be `Define / build and validate`: the problem and prototype scope are clear enough for workflow definition, but important business rules remain open. |
| PRD-180 | OPEN | A named Product Owner shall own scope, priority, policy decisions, and the final Dev-ready decision. |
| PRD-181 | PROPOSED | The OPC business representative shall validate the current manual journey, exception rules, language, and useful outcomes. |
| PRD-182 | PROPOSED | The BA shall own process traceability, business rules, state definitions, open questions, and acceptance examples. |
| PRD-183 | PROPOSED | UX shall validate whether one operator can understand status, evidence, approvals, and recovery actions on mobile and desktop. |
| PRD-184 | PROPOSED | Engineering shall validate feasibility, deterministic transaction boundaries, idempotency, tenant separation, recovery, and observability. |
| PRD-185 | PROPOSED | Finance, invoice, payment, and integration specialists shall validate claims and rules in their area before any simulator behavior is presented as real capability. |

## 4. Problem and Pain Points

| ID | Status | Problem or pain point |
|---|---|---|
| PRD-013 | CONFIRMED | Orders can come from several channels, while stock must remain consistent so the business does not accept more goods than it can supply. |
| PRD-014 | CONFIRMED | B2B hotel and restaurant sales require connected order, receivable, and invoice handling. |
| PRD-015 | ASSUMPTION | A Zalo order is often read and entered again into a notebook, spreadsheet, or sales tool, which creates delay and input errors. |
| PRD-016 | ASSUMPTION | Price agreements, overdue debt, stock, delivery, invoices, and bank receipts are checked in different places, so the operator sees problems late. |
| PRD-017 | ASSUMPTION | One operator cannot safely remember every order state, exception, follow-up, and payment without a control view and active alerts. |
| PRD-018 | PROPOSED | The MVP shall focus on reducing hand-offs, repeated data entry, late exception detection, overselling, missed debt follow-up, and incorrect payment matching in one B2B sales flow. |

## 5. Product Vision

**Vision:** Give one business operator a trusted control tower where AI coordinates routine sales work, ERP rules protect business data, and the human remains in control of risk.

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-019 | PROPOSED | The product shall present one continuous case from customer message to closed order, rather than separate tools that the operator must join mentally. |
| PRD-020 | PROPOSED | The default experience shall be “review by exception”: safe cases move automatically, while risky or unclear cases enter a clear approval queue. |
| PRD-021 | CONFIRMED | The main client shall be one responsive Web/PWA codebase. Separate native mobile and desktop codebases are not part of this MVP. |
| PRD-022 | PROPOSED | Every automated action shall show what happened, why it happened, which data was used, and what the operator can do next. |

## 6. Personas and Jobs To Be Done

### Primary Persona: OPC Owner-Operator

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-023 | PROPOSED | The primary user shall be the owner-operator who supervises sales, stock, delivery, invoices, debt, and incoming money. |
| PRD-024 | PROPOSED | Job to be done: “When a hotel sends an order, help me complete it without entering the same data many times, while showing me every risk that needs my decision.” |

### External Actor: Hotel Buyer

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-025 | PROPOSED | The hotel buyer shall send a natural-language request and receive a clear order confirmation, delivery update, and payment reference through the simulated channel. |

### Approval Actor

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-026 | CONFIRMED | In the prototype, the owner-operator shall also act as the business approver. The system shall still require an explicit approval action and reason for controlled exceptions. |

### Demo Platform Administrator

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-027 | PROPOSED | A demo administrator shall be able to switch between 2–3 seeded companies and reset demo scenarios. This role shall not approve a tenant's business transactions. |

## 7. End-to-End Scenario

**Example message:** “Please deliver 20 bottles of fish sauce and 10 kg of dried fish this afternoon. Issue an invoice to our company. We will pay at the end of the month.”

| Step | ID | Status | Expected behavior |
|---:|---|---|---|
| 1 | PRD-028 | PROPOSED | A Zalo adapter simulator shall create an inbound event with a unique event ID, original message, sender identity, tenant ID, and received time. |
| 2 | PRD-029 | PROPOSED | AI shall extract candidate customer, products, quantities, requested delivery time, invoice request, and payment terms. The original message shall remain visible. |
| 3 | PRD-030 | PROPOSED | The system shall match the sender to an ERP customer record. Low-confidence or multiple matches shall stop at human review. |
| 4 | PRD-031 | PROPOSED | The system shall match requested items to ERP SKUs. AI may suggest matches, but the operator shall confirm any ambiguous item or unit. |
| 5 | PRD-032 | CONFIRMED | The system shall read the applicable price list, discount policy, customer debt, credit policy, and available inventory from deterministic ERP data. |
| 6 | PRD-033 | PROPOSED | The system shall calculate line totals, discount, tax inputs, receivable exposure, and available-to-promise quantity with deterministic rules. |
| 7 | PRD-034 | PROPOSED | If the request is eligible, the system shall create an inventory reservation with an expiry time and then create a draft sales order linked to the message. |
| 8 | PRD-035 | CONFIRMED | A large discount, stock shortage, overdue receivable, refund, or invoice adjustment shall require human approval. |
| 9 | PRD-036 | PROPOSED | For a shortage, AI shall propose options such as partial delivery, substitute SKU, or a later date. No option shall change stock or the order until approved. |
| 10 | PRD-037 | CONFIRMED | After validation or approval, the system shall confirm the order and create a customer confirmation message. The owner shall review it before sending in the prototype. |
| 11 | PRD-038 | PROPOSED | The Agent shall compare eligible delivery options using configured service area, goods type, cost, and requested time. Carrier facts shall come from the adapter, not from AI memory. |
| 12 | PRD-039 | CONFIRMED | When goods are handed to delivery, the ERP shall post the stock issue and release the matching reservation in one deterministic transaction. |
| 13 | PRD-040 | CONFIRMED | The demo flow shall create an invoice draft after delivery confirmation, then record the simulated invoice result. |
| 14 | PRD-041 | PROPOSED | If payment is due later, the ERP shall create a receivable linked to the order, invoice record, customer, due date, and tenant. |
| 15 | PRD-042 | PROPOSED | A payment adapter simulator shall receive bank events. The system shall reject duplicate events by provider transaction ID before changing money or receivable status. |
| 16 | PRD-043 | CONFIRMED | A payment with the exact supported reference and exact amount shall be matched automatically. Missing, partial, excess, combined, or conflicting payments shall enter review. |
| 17 | PRD-044 | PROPOSED | The order shall close only when deterministic rules confirm delivery, required invoice status, and full payment or an approved write-off. |
| 18 | PRD-045 | PROPOSED | The Control Tower shall show the current step, next action, blocked reason, approval status, timestamps, and audit history for the case. |

### Proposed State Flow

`RECEIVED → VALIDATED → RESERVED → ORDER_CONFIRMED → PICKING → DISPATCHED → DELIVERED → INVOICE_RECORDED → PAYMENT_PENDING → PAID → CLOSED`

Side states: `NEEDS_REVIEW`, `PENDING_APPROVAL`, `BLOCKED`, `PARTIALLY_PAID`, and `CANCELLED`.

## 8. Goals and Success Metrics

| ID | Status | Goal or metric |
|---|---|---|
| PRD-046 | PROPOSED | The demo shall complete the full happy path from a simulated Zalo message to a closed order without manual re-entry of the same business data. |
| PRD-047 | PROPOSED | All inventory, money, tax input, price, and status changes in demo tests shall be produced by deterministic services, with a target of 100%. |
| PRD-048 | PROPOSED | Every business state change shall have actor, time, source event, before/after value, and reason, with a target of 100% audit coverage. |
| PRD-049 | PROPOSED | Replayed payment events shall create zero duplicate cash or receivable postings in the defined test set. |
| PRD-050 | PROPOSED | Every controlled exception in the release test set shall stop before the risky mutation and create a visible approval request. |
| PRD-051 | PROPOSED | The same scripted flow shall run for at least two demo tenants without visible cross-tenant data leakage. |
| PRD-052 | PROPOSED | The main operator flow shall work at agreed mobile and desktop responsive breakpoints using one Web/PWA codebase. |
| PRD-053 | OPEN | A target for time saved per order shall be set only after a baseline observation of the current manual process. |
| PRD-054 | OPEN | A target for AI extraction accuracy shall be set after a labeled Vietnamese Zalo message test set is available. |

## 9. MVP Scope

### Included

| ID | Status | In-scope requirement |
|---|---|---|
| PRD-055 | PROPOSED | Provide a responsive Control Tower with active cases, exceptions, approvals, connector status, and recent Agent actions. |
| PRD-056 | PROPOSED | Provide a unified inbound event and conversation view with the original payload, parsed fields, confidence, and created business records. |
| PRD-057 | PROPOSED | Provide tenant-scoped customer, product, unit, price list, discount policy, credit rule, and warehouse data needed by the scenario. |
| PRD-058 | PROPOSED | Provide deterministic available-to-promise checks, reservation, reservation expiry, stock issue, and reservation release. |
| PRD-059 | PROPOSED | Provide sales order creation, line review, status history, cancellation before dispatch, and links to all source and downstream records. |
| PRD-060 | PROPOSED | Provide delivery option comparison, dispatch recording, tracking reference, and delivery confirmation through an adapter simulator. |
| PRD-061 | PROPOSED | Provide invoice draft and invoice result records through an adapter simulator. No live legal issuance is required for the prototype release. |
| PRD-062 | PROPOSED | Provide receivable creation, due-date tracking, payment event intake, exact matching, partial/unmatched review, and deterministic order closure. |
| PRD-063 | PROPOSED | Provide an Approval Center for discount, shortage, overdue debt, refund, and invoice adjustment cases. |
| PRD-064 | PROPOSED | Provide an immutable-style audit timeline for Agent, ERP, human, and connector actions in the prototype. |
| PRD-065 | PROPOSED | Provide policy configuration for approval thresholds, reservation expiry, confidence thresholds, and allowed automatic actions. |
| PRD-066 | PROPOSED | Provide 2–3 seeded demo companies, a demo-only tenant switcher, and logical tenant filtering on all records. |
| PRD-067 | PROPOSED | Provide an installable responsive PWA shell and a single shared UI codebase. |
| PRD-068 | PROPOSED | Provide scenario reset and repeatable demo data so the main flow and exception flows can be shown many times. |

## 10. Out of Scope

| ID | Status | Out-of-scope item |
|---|---|---|
| PRD-069 | CONFIRMED | A complete ERP suite is out of scope. |
| PRD-070 | PROPOSED | General ledger, full accounting, tax filing, payroll, HR, procurement, manufacturing, CRM campaigns, and business intelligence are out of scope. |
| PRD-071 | CONFIRMED | Separate native Android and iOS applications are out of scope. |
| PRD-072 | PROPOSED | Production-grade multi-tenant isolation, tenant billing, self-service tenant onboarding, subscription management, and platform operations are out of scope. |
| PRD-073 | PROPOSED | Live commitments for Zalo, e-invoice, bank, payment intermediary, and carrier integrations are out of scope until verified. |
| PRD-074 | PROPOSED | Legal certification, tax advice, legal invoice compliance approval, and claims that the solution satisfies current law are out of scope. |
| PRD-075 | PROPOSED | Automatic negotiation with customers, automatic substitute acceptance, dynamic AI pricing, and AI-created credit limits are out of scope. |
| PRD-076 | PROPOSED | Complex warehouse functions such as multiple picking waves, route optimization, serial numbers, quality control, and advanced returns are out of scope. |
| PRD-077 | PROPOSED | Full offline transaction processing and production conflict resolution are out of scope. The prototype may cache the PWA shell and demo data. |
| PRD-078 | PROPOSED | Other OPC domains, including tour booking and agricultural procurement, are out of scope for this release. |

## 11. High-Level Capabilities and Modules

| ID | Status | Capability | Main responsibility |
|---|---|---|---|
| PRD-079 | PROPOSED | Control Tower | Show active workflows, risk, waiting time, next action, and business status. |
| PRD-080 | PROPOSED | Channel Inbox | Receive simulated Zalo events, keep raw content, show extraction, and link to a case. |
| PRD-081 | PROPOSED | Agent Orchestrator | Build the action plan, call deterministic services, wait for events, retry safe steps, and escalate exceptions. |
| PRD-082 | PROPOSED | Customer and Commercial Policy | Hold customer identity, price lists, payment terms, discount rules, debt, and credit policy. |
| PRD-083 | PROPOSED | Inventory and Reservation | Calculate available quantity, reserve goods, expire reservations, issue stock, and prevent overselling. |
| PRD-084 | PROPOSED | Sales Order Workspace | Review extracted data, confirm lines, show status, and connect message, order, delivery, invoice, and payment. |
| PRD-085 | PROPOSED | Fulfilment | Compare configured delivery choices and track dispatch and delivery events. |
| PRD-086 | PROPOSED | Invoice and Receivables | Create invoice drafts or simulated results and track amounts due. |
| PRD-087 | PROPOSED | Payment Reconciliation | Receive idempotent payment events, match exact cases, and queue exceptions. |
| PRD-088 | PROPOSED | Approval Center | Show risk, proposed action, data evidence, impact, approver decision, and reason. |
| PRD-089 | PROPOSED | Audit and Observability | Record business events, Agent steps, retries, failures, approvals, and connector health. |
| PRD-090 | PROPOSED | Demo Tenant Console | Switch and reset seeded companies without adding production SaaS administration. |

## 12. Boundary Between ERP, Agent, and Human

### ERP / Deterministic Core

| ID | Status | Boundary rule |
|---|---|---|
| PRD-091 | CONFIRMED | ERP shall be the source of truth for master data and transaction state. |
| PRD-092 | CONFIRMED | Inventory, price, discount calculation, tax inputs, money, credit exposure, and state transitions shall use deterministic logic. |
| PRD-093 | PROPOSED | ERP services shall validate every requested mutation even when the request comes from the Agent. |
| PRD-094 | PROPOSED | The ERP shall reject invalid transitions, duplicate events, negative available stock, and cross-tenant record access. |

### Agent

| ID | Status | Boundary rule |
|---|---|---|
| PRD-095 | CONFIRMED | AI may understand unstructured input, prepare a plan, propose options, and help process exceptions. |
| PRD-096 | PROPOSED | The Agent may call only approved business actions through typed tools or services. It shall not write directly to transaction storage. |
| PRD-097 | PROPOSED | The Agent shall show confidence and evidence for customer and SKU matching. It shall not hide uncertainty. |
| PRD-098 | PROPOSED | The Agent shall pause when required data is missing, a policy gate is reached, or a service returns a conflict. |

### Human

| ID | Status | Boundary rule |
|---|---|---|
| PRD-099 | CONFIRMED | A human shall approve large discounts, stock shortages, overdue debt cases, refunds, and invoice adjustments. |
| PRD-100 | PROPOSED | A human shall resolve ambiguous customer, product, unit, delivery, invoice, and payment matches. |
| PRD-101 | PROPOSED | A human shall be able to stop, approve, reject, retry, or cancel a workflow, with a required reason for controlled changes. |
| PRD-102 | PROPOSED | The prototype shall never present the demo administrator as the business approver for another tenant. |

## 13. High-Level Automation Rules

| ID | Status | Rule |
|---|---|---|
| PRD-103 | PROPOSED | Auto-process only when customer, SKU, unit, quantity, price policy, credit policy, stock, delivery rule, and required invoice data pass validation. |
| PRD-104 | PROPOSED | A confidence threshold shall control whether customer and SKU matches continue or enter review. The threshold shall be configurable. |
| PRD-105 | PROPOSED | A reservation shall be created before order confirmation and shall have a deterministic expiry time. |
| PRD-106 | PROPOSED | Expired or cancelled reservations before dispatch shall release reserved quantity without increasing on-hand stock. |
| PRD-107 | CONFIRMED | Stock on hand shall decrease at carrier hand-off in the prototype. |
| PRD-108 | PROPOSED | Discount approval shall use a configurable threshold. This PRD does not approve the 3% value found in the working pain-point document. |
| PRD-109 | CONFIRMED | Any overdue receivable case shall require human approval before order confirmation. |
| PRD-110 | PROPOSED | Any request above available stock shall be blocked. AI may prepare alternatives but shall not create negative stock. |
| PRD-111 | PROPOSED | Payment events shall be idempotent by tenant, provider, and provider transaction ID. |
| PRD-112 | CONFIRMED | Automatic payment matching shall require the exact supported reference and exact amount. Partial, combined, excess, missing-reference, or conflicting cases shall enter review. |
| PRD-113 | CONFIRMED | Refunds and invoice adjustments shall always require explicit approval in this MVP, regardless of amount. |
| PRD-114 | PROPOSED | Each workflow step shall have a timeout, retry policy, and escalation result. Retrying shall not create duplicate business records. |
| PRD-115 | PROPOSED | A failed connector shall not silently mark a business step as complete. The case shall show `BLOCKED` or `NEEDS_REVIEW`. |
| PRD-116 | PROPOSED | The system shall separate “Agent proposed,” “ERP committed,” “human approved,” and “connector confirmed” states. |

## 14. Assumptions

| ID | Status | Assumption |
|---|---|---|
| PRD-117 | ASSUMPTION | Vietnamese Zalo order messages contain enough customer, product, quantity, delivery, invoice, and payment information to create a useful draft. |
| PRD-118 | ASSUMPTION | Each demo tenant has clean customer, SKU, unit, price list, stock, and receivable data. |
| PRD-119 | ASSUMPTION | The minimal ERP slice is acceptable for the prototype and can later be replaced or synchronized through an ERP adapter. |
| PRD-120 | ASSUMPTION | Two or three seeded companies are enough to demonstrate tenant-aware behavior without building a SaaS platform. |
| PRD-121 | ASSUMPTION | The owner-operator can act as the approver for the demo, even if a future product may require another approver. |
| PRD-122 | ASSUMPTION | A simulated invoice result is enough to prove workflow orchestration without claiming legal issuance. |
| PRD-123 | ASSUMPTION | A simulated bank or payment event is enough to prove matching, idempotency, and receivable closure. |
| PRD-124 | ASSUMPTION | The demo can use one warehouse per tenant and does not need advanced warehouse allocation. |
| PRD-125 | ASSUMPTION | The main happy path uses full delivery and full payment. Partial cases will be shown as exceptions. |

## 15. Dependencies

| ID | Status | Dependency |
|---|---|---|
| PRD-126 | PROPOSED | A tenant-aware domain model and deterministic transaction services are required before Agent orchestration can be trusted. |
| PRD-127 | PROPOSED | A seeded data pack is required for 2–3 companies, including customers, products, prices, debt, stock, delivery rules, invoices, and bank events. |
| PRD-128 | PROPOSED | A labeled Vietnamese message set is required to evaluate extraction and ambiguity handling. |
| PRD-129 | PROPOSED | Product owners must define discount, credit, reservation, dispatch, invoice, payment, and closure policies before SRS and UAT are locked. |
| PRD-130 | PROPOSED | Connector contracts are required for Zalo inbound events, carrier events, invoice results, and payment events, even when simulators are used. |
| PRD-131 | OPEN | Zalo API access, supported message types, authorization model, cost, rate limits, and sandbox availability require verification. |
| PRD-132 | OPEN | E-invoice provider API, sandbox, required data, legal responsibility, and result states require verification. |
| PRD-133 | OPEN | Bank or payment intermediary webhook fields, idempotency key, reconciliation limits, and sandbox require verification. |
| PRD-134 | OPEN | Carrier API, service availability, cold-goods support, cost fields, and delivery status contract require verification. |
| PRD-135 | PROPOSED | Identity, tenant context, operator role, approval role, and demo administrator role are required. |
| PRD-136 | PROPOSED | A repeatable test harness is required for duplicate, delayed, failed, and out-of-order connector events. |

## 16. Risks

| ID | Status | Risk | Response |
|---|---|---|---|
| PRD-137 | PROPOSED | Stakeholders may mistake the prototype for a production product. | Place a visible “Demo / simulated connector” label and document production gaps. |
| PRD-138 | PROPOSED | AI may match the wrong customer, SKU, quantity, or unit. | Use confidence gates, evidence, human review, and no direct database write. |
| PRD-139 | PROPOSED | Reservation and stock issue may be counted twice or released incorrectly. | Use one state machine and atomic deterministic inventory actions. |
| PRD-140 | PROPOSED | Duplicate or out-of-order webhooks may create duplicate payment, invoice, or delivery results. | Use idempotency keys, event ordering rules, and replay tests. |
| PRD-141 | PROPOSED | Concurrent orders may oversell stock. | Recheck available stock and lock or atomically reserve before confirmation. |
| PRD-142 | PROPOSED | Unverified connector assumptions may make the demo look more integrated than a real product can be. | Label simulators and keep live integration behind a verification gate. |
| PRD-143 | PROPOSED | Legal or tax text from reference documents may be outdated or incorrect. | Do not encode or claim it without specialist validation and dated sources. |
| PRD-144 | PROPOSED | The demo tenant switcher may expose data between companies. | Apply tenant filters in every service and test visible isolation; do not claim production isolation. |
| PRD-145 | PROPOSED | Too much automation may reduce operator trust. | Show reasons, evidence, pending actions, and a clear stop or reject control. |
| PRD-146 | PROPOSED | Seeded data may hide real language and process variation. | Add messy, ambiguous, duplicate, incomplete, and conflicting test cases. |
| PRD-147 | PROPOSED | The project may expand into a full ERP or full SaaS platform. | Use the out-of-scope list as a release gate and route new domains to a later roadmap. |

## 17. Release Criteria

The prototype is ready for stakeholder demo only when all criteria below are met.

| ID | Status | Release criterion |
|---|---|---|
| PRD-148 | PROPOSED | A simulated Zalo hotel order can complete the full happy path to `CLOSED` with linked records and no repeated manual entry. |
| PRD-149 | PROPOSED | The demo proves that AI extraction is separate from deterministic calculation and transaction posting. |
| PRD-150 | PROPOSED | The five mandatory approval classes—large discount, shortage, overdue debt, refund, and invoice adjustment—are demonstrated and cannot bypass approval. |
| PRD-151 | PROPOSED | An ambiguous customer or SKU case stops for review and preserves the original message. |
| PRD-152 | PROPOSED | A shortage case creates proposed options but does not reserve or issue unavailable stock. |
| PRD-153 | PROPOSED | Reservation, expiry, cancellation before dispatch, and stock issue at dispatch pass deterministic tests. |
| PRD-154 | PROPOSED | A duplicate payment event is replayed and creates no second cash or receivable posting. |
| PRD-155 | PROPOSED | Partial, excess, missing-reference, and wrong-tenant payment events enter review and do not close the order. |
| PRD-156 | PROPOSED | All case actions show actor, source, time, reason, and before/after state. |
| PRD-157 | PROPOSED | At least two demo tenants can run the scenario and show no visible cross-tenant records. |
| PRD-158 | PROPOSED | All connector screens clearly identify simulated or unverified behavior. |
| PRD-159 | PROPOSED | The main screens pass responsive review on agreed mobile and desktop sizes, and the PWA can be installed from the browser. |
| PRD-160 | PROPOSED | The demo has no unresolved critical defect in inventory, money, tenant context, approval, state transition, or audit behavior. |
| PRD-161 | PROPOSED | The demo can reset to a known state and repeat the scripted scenario without manual data cleanup. |
| PRD-162 | PROPOSED | The release notes state that the result is a domain demo prototype, not a production ERP, legal compliance product, or complete OPC MVP. |

## 18. Confirmed Prototype Policy Decisions

| ID | Status | Decision |
|---|---|---|
| PRD-164 | CONFIRMED | Every overdue receivable case in this MVP shall require owner approval. Grace days and automatic credit exceptions are deferred. |
| PRD-167 | CONFIRMED | Stock shall be issued when goods are handed to the carrier. The matching reservation shall be released in the same deterministic transaction. |
| PRD-168 | CONFIRMED | The invoice draft or simulated invoice request shall be created after delivery confirmation. |
| PRD-169 | CONFIRMED | The owner shall review the order confirmation before it is sent in the prototype. |
| PRD-170 | CONFIRMED | The owner-operator shall self-approve controlled exceptions in the prototype and shall provide a reason. An independent approver is deferred to a future live product. |
| PRD-171 | CONFIRMED | Exact reference and exact amount may be matched automatically. Partial, combined, excess, missing-reference, and conflicting payments shall require review. |

## 19. Open Questions

The PRD is final without the values below. High-priority parameters must be decided in the Workflow/SRS before development and UAT are locked.

| ID | Status | Priority | Question |
|---|---|---:|---|
| PRD-163 | OPEN | High | What discount percentage or value requires approval, and can it differ by tenant, customer, or product? |
| PRD-165 | OPEN | High | What confidence level allows automatic customer and SKU matching? |
| PRD-166 | OPEN | High | How long does a reservation remain valid, and what event may extend it? |
| PRD-172 | OPEN | Medium | Are partial delivery and backorder part of the demo, or only proposed options that stop for approval? |
| PRD-173 | OPEN | Medium | Which 2–3 demo companies and data variations should be used to prove tenant-aware behavior? |
| PRD-174 | OPEN | Medium | Is the Zalo source a personal chat, group, Zalo OA, or another approved channel type? |
| PRD-175 | OPEN | Medium | What delivery facts are required for choice: price, service area, cold goods, pickup cut-off, SLA, or all of them? |
| PRD-176 | OPEN | Medium | What invoice fields, states, adjustment types, and retention rules are required after legal and provider validation? |
| PRD-177 | OPEN | Medium | What data retention, audit retention, and deletion rules apply to messages, customer data, and transaction logs? |
| PRD-178 | OPEN | Medium | What business baseline will be measured for manual time, error rate, overselling, and late payment follow-up? |

## 20. Hypothesis and Learning Plan

**Core hypothesis:** If one operator can supervise a safe message-to-cash workflow and only handle exceptions, then the OPC model can reduce coordination work without losing control of inventory and money.

| ID | Status | Requirement or decision |
|---|---|---|
| PRD-186 | PROPOSED | The smallest validation slice shall include one happy-path order, one shortage, one overdue-debt approval, one ambiguous message, and one duplicate payment event. |
| PRD-187 | PROPOSED | The first validation session shall use representative OPC users or business operators, not only the product team. |
| PRD-188 | PROPOSED | The session shall measure task completion, manual corrections, approval understanding, trust in Agent explanations, and the ability to recover from an exception. |
| PRD-189 | PROPOSED | The prototype shall continue only if users can explain which actions were performed by ERP rules, AI, and the human without help from the facilitator. |
| PRD-190 | PROPOSED | Failure to understand inventory, payment, approval, or tenant boundaries shall stop feature expansion and trigger workflow or UX revision. |
| PRD-191 | OPEN | The Product Owner shall set the participant count, success threshold, and stop/continue rule before formal usability validation. |

## 21. Readiness Assessment

| ID | Status | Gate | Assessment |
|---|---|---|---|
| PRD-192 | PROPOSED | Discovery-ready | Yes. Target scenario, users, pains, evidence sources, assumptions, and major unknowns are documented. |
| PRD-193 | PROPOSED | Decision-ready | Yes for prototype scope. Product level, integration posture, tenant depth, ERP boundary, and non-goals have been decided. |
| PRD-194 | OPEN | Dev-ready | No. Parameters PRD-163, PRD-165, and PRD-166, a named decision owner, workflow acceptance examples, and UX behavior must be resolved before development and UAT are locked. |
| PRD-195 | OPEN | Release-ready | No. Implementation, test evidence, security checks, recovery evidence, usability results, and release ownership do not exist yet. |
| PRD-196 | OPEN | Outcome-validated | No. There is no baseline or user validation result yet. |

## 22. Product Owner Recommendation

Keep the demo narrow: prove one complete order, one shortage, one overdue-debt approval, one duplicate payment, and one ambiguous message across at least two tenants. Do not add more ERP modules or real connectors until this vertical workflow is believable, traceable, and safe.

The next artifact should be a workflow specification that defines states, events, actions, approval gates, data ownership, and failure recovery for PRD-028 through PRD-045.
