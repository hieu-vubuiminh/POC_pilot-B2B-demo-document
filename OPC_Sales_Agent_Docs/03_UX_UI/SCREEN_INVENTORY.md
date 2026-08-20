# SCREEN INVENTORY

**Product:** OPC Sales Operations Agent  
**Channel:** Responsive Web/PWA  
**Scope:** Domain MVP / demo prototype  
**Source:** PRD version 1.0 and the three documents in `02_Workflow`  
**Status:** Functional UX baseline for PO/BA review  
**Date:** 20 August 2026

## 1. Rules and boundaries

- This document defines only screens and functions. It is not a wireframe, mockup, or visual design.
- ERP is the source of truth. The Agent shows understanding, proposals, and orchestration only. It does not write money, stock, or final states.
- `Owner` is the tenant's owner-operator. `Demo Admin` only switches/resets demo data and cannot approve tenant transactions.
- All MVP screens use one responsive Web/PWA. On mobile, long tables become summary lists. There is no separate app.
- Order Detail is the main place for the full journey from Message to Payment.
- Connectors must show `Simulated` or `Unverified`. The UI must not present them as production integrations.
- When the PRD and Workflow are not aligned, this document uses the latest Owner-confirmed Workflow decision for UX and marks an `UX OPEN QUESTION` or alignment gap. It does not change the PRD.

## 2. MVP screen list

| Screen ID | Screen name | Purpose | User | Supported work | Related Workflow state | Entry point | Next screen | Device | Scope |
|---|---|---|---|---|---|---|---|---|---|
| SCR-001 | Operations Control Tower | Shows the Owner what needs action first: Approvals, Workflow errors, Reservations close to expiry, delivery, and overdue finance work. | Owner; Demo Admin can only view the selected tenant | Monitor cases, prioritize exceptions, and open the next action | Run `RUNNING`, `WAITING_HUMAN`, `WAITING_EXTERNAL`, `RETRY_SCHEDULED`, `BLOCKED`, `FAILED`; active Order states | Default screen after entry; main navigation | SCR-002, SCR-004, SCR-005, SCR-008, SCR-009, SCR-010 | Both | MVP |
| SCR-002 | Sales Request Inbox | Shows original Message, Agent extraction, confidence, missing data, and linked Order. | Owner | Receive Message, review Customer/SKU, ask for more data, and create/link Order | Message `RECEIVED` to `RESPONDED`, `FAILED`, `CANCELLED`; early Run states | Main navigation; deep link from Control Tower/notification | SCR-004, SCR-005, SCR-006, SCR-007, SCR-010 | Both | MVP |
| SCR-003 | B2B Sales Order List | Finds and filters Orders by business state, Customer, time, exception, and amount. | Owner | Track Orders from Draft to Closed/Cancelled | All Order states | Main navigation; links from Customer/Product/Finance | SCR-004, SCR-005, SCR-008, SCR-009 | Both | MVP |
| SCR-004 | Order 360 Detail and Actions | Main work area with one continuous timeline from Message, Order, Reservation, Shipment, and Invoice to Payment. | Owner | Review Order, confirm customer Message, cancel before handover, follow fulfilment/finance, and open evidence | All Order states; related Message, Reservation, Shipment, Invoice, Receivable, and Payment entities | Inbox, Order List, Control Tower, Approval, Fulfilment, Finance, or deep link | SCR-002, SCR-005, SCR-006, SCR-007, SCR-008, SCR-009, SCR-010, SCR-011 | Both | MVP |
| SCR-005 | Decision and Approval Center | Brings reviews/Approvals together and shows evidence, impact, approver, waiting time, and decision reason. | Owner; Demo Admin is view-only | Customer/SKU review, overdue debt, price outside settings, shortage, carrier, handover, and Invoice/Payment/refund/adjustment exceptions | Run `WAITING_HUMAN`; Order `NEEDS_REVIEW`/`PENDING_APPROVAL`; exception entities | Main navigation; badge/notification; case link | SCR-004, SCR-006, SCR-007, SCR-008, SCR-009, SCR-010 | Both | MVP |
| SCR-006 | Customer Directory and Profile | Searches Customer master, sender mapping, Invoice profile, payment terms, and related debt. Details open in a drawer on the same screen. | Owner | Verify Customer and view commercial data and Order/debt history | Does not own a transaction state; shows related Message review, Order, and Receivable | Main navigation; Customer link from Inbox/Order/Approval | SCR-003, SCR-004, SCR-005, SCR-009 | Both | MVP |
| SCR-007 | Products and Available Stock | Searches SKU/unit/alias, on-hand, Reservation, and ATP. SKU details open in a drawer. | Owner | Match SKU, check ATP, view Reservation, and prove that stock was not reduced before handover | Reservation `ACTIVE`, `EXTENDED`, `CONSUMED`, `RELEASED`, `EXPIRED`, `FAILED`; related Order | Main navigation; SKU link from Inbox/Order/Approval | SCR-003, SCR-004, SCR-005, SCR-008 | Both | MVP |
| SCR-008 | Picking and Delivery | Manages goods to pick, simulated carrier selection, handover confirmation, and delivery failure. | Owner | Picking, booking, handover, tracking, redelivery/return | Order `CONFIRMED`, `PICKING`, `DISPATCHED`, `DELIVERED`, `DELIVERY_EXCEPTION`; all Shipment states | Main navigation; Control Tower; Order Detail | SCR-004, SCR-005, SCR-007, SCR-010 | Both | MVP |
| SCR-009 | Order Finance | Combines three tabs: `Invoice`, `Receivables`, and `Payments & Reconciliation`, to avoid three separate screens. | Owner | Invoice Draft/result, Receivable, exact match, mismatch review, refund/reversal | All Invoice, Receivable, and Payment states; Order `INVOICE_BLOCKED`, `AWAITING_PAYMENT`, `PAID`, `CLOSED` | Main navigation; Control Tower; Order/Customer Detail | SCR-004, SCR-005, SCR-006, SCR-010, SCR-011 | Both | MVP |
| SCR-010 | Workflow Run Detail | Separates Agent reasoning, ERP commit, Connector confirmation, and orchestration errors. Allows retry/cancel only when valid. | Owner | Track steps, retry safely, cancel/compensate, and recover manually | All Agent Workflow Run states | Control Tower; Inbox; Order Detail; Audit deep link | SCR-004, SCR-005, SCR-011 | Both | MVP |
| SCR-011 | Audit Log That Cannot Be Changed | Searches append-only events by case/entity/actor/time and shows before/after hash, reason, and correlation. | Owner; Demo Admin for the selected tenant | Audit and trace Agent/ERP/Human/Connector actions | Every state transition; Audit has no edit state | Order Detail, Workflow Run, Finance, or main navigation under Monitoring | SCR-004, SCR-010 | Both | MVP |
| SCR-012 | Demo and Policy Settings | Combines policy, Agent guardrails, Connector simulator, and tenant switch/reset to avoid many admin screens. | Owner for tenant policy; Demo Admin for tenant switch/reset/Connector seed | Confidence, Reservation, Owner-set price/discount, allowed automatic actions, simulator status, and demo reset | Policy version; Connector health; does not directly change transaction state | Main navigation under Settings; Connector warning from Control Tower | SCR-001, SCR-011 | Both | MVP |

## 3. Tab/drawer structure to avoid extra screens

| Original planned item | MVP decision | Reason |
|---|---|---|
| Customer Detail | Drawer in SCR-006 with a deep link that keeps `customer_id` | A separate screen is not needed because data is mainly read-only and supports case verification. |
| SKU/lot detail | SKU drawer in SCR-007; no lot screen | The PRD does not include full lot management, and advanced warehouse work is outside scope. The lot field at handover appears only when ERP has data. |
| Invoice | Tab in SCR-009 | An Invoice is always linked to the Receivable and Payment of the same Order. |
| Receivables | Tab in SCR-009 | Keeps the same financial context and reduces screen changes. |
| Payments and reconciliation | Tab in SCR-009 | A mismatch requires Payment and Receivable data at the same time. |
| Agent/business-policy settings | Tab in SCR-012 | Guardrails must stay with related deterministic policies. |
| Integration settings | Tab in SCR-012 | MVP uses only adapters/simulators, not production Integration Management. |
| Approval Detail | Drawer, or full-screen modal on mobile, in SCR-005 | Approval needs fast action while keeping queue context. |
| Message Detail | Split view on desktop; detail state on the same route on mobile in SCR-002 | Avoid separate List and Detail screens. |

## 4. Screens/functions outside the MVP

| Item | Decision | Source/reason |
|---|---|---|
| Login, self-service onboarding, subscription, and tenant billing | No separate screen specification | Production SaaS administration is outside PRD-072. Identity is dependency PRD-135. |
| Native mobile app | Not included | PRD-021 and PRD-071 use one responsive Web/PWA. |
| Full Customer/SKU/warehouse CRUD | Not in the functional UX baseline | The PRD needs only minimal seeded ERP data. Detailed master-data authoring is not approved. |
| Dynamic AI pricing/negotiation | Not included | PRD-075 and Workflow: Owner creates the value/program; Agent does not propose a discount. |
| Backorder engine and automatic Order split | Not included | Workflow creates a new Order Draft for the remaining quantity without auto-reservation. |
| Write-off/debt removal | No action | Workflow places it outside the MVP. Order does not close when outstanding > 0. |
| Full accounting, tax filing, GL, procurement, manufacturing, CRM campaigns, and BI | Not included | PRD-070. |
| Advanced warehouse/returns/route optimization | Not included | PRD-076. Demo return supports only compensation after delivery failure. |
| Legal e-invoice administration | Not included | Invoice is only a Draft/result from a simulator and has no legal claim. |
| Offline transaction queue | Not included | PRD-077. Offline mode shows only cached/read state and does not commit a mutation. |

## 5. UX OPEN QUESTIONS and alignment gaps

| ID | Question/gap | UX impact | Handling in this document |
|---|---|---|---|
| UX-OQ-001 | Approval Request has no separate state machine. | Status labels, filters, and stale/expired behavior in SCR-005. | Use derived display states `OPEN`, `APPROVED`, `REJECTED`, `STALE`, `EXPIRED`. `OVERDUE` is a flag, not a business state. BA must approve before SRS. |
| UX-OQ-002 | PRD-163/108 uses a discount threshold. Workflow says the Owner sets values/programs and there is no system-wide 3% threshold. | Policy form and price Approval. | Follow the latest Workflow, record the alignment gap, and do not change the PRD. |
| UX-OQ-003 | PRD-044 allows an approved write-off. Workflow places write-off outside the MVP. | Close gate and Finance actions. | Do not show write-off. Allow close only when the Receivable is `PAID`. |
| UX-OQ-004 | Zalo source type and real send/receive ability are not verified. | Channel name, metadata, and send status. | Use `Zalo simulator`. Do not claim OA/personal/group as a capability. |
| UX-OQ-005 | Invoice provider fields and legal states are not approved. | Invoice form fields, error mapping, and status wording. | Use only minimum demo fields and the label `Simulated status`. A specialist must confirm before SRS. |
| UX-OQ-006 | Carrier criteria and delivery timeout are not fully approved. | Option comparison, reminders, and overdue filters. | Show seeded data with its source. Keep the 30-minute value as `PROPOSED`. |
| UX-OQ-007 | Audit retention and permission to view sensitive details are not approved. | Time filters, export, and masking. | No delete/edit/export in the MVP specification. BA/security must approve detailed access. |
| UX-OQ-008 | It is not decided whether Customer and Product masters can be edited or use only seeded data. | `Create/Edit` CTA in SCR-006/007. | MVP baseline is read-only. Do not add CRUD CTA until PO approval. |
| UX-OQ-009 | PWA push notification has no dependency/permission contract. | Mobile flow for Approval alerts. | Use simulated or in-app notification/deep link. Do not claim production push. |
| UX-OQ-010 | The Product Owner is not named. | Ownership of UX open questions and sign-off. | Do not assign a name. Update it before Dev-ready/UAT. |
| UX-OQ-011 | Value ranges and edit permissions are missing for confidence, Reservation, reminder, and Agent guardrails. | Validation and permissions in SCR-012. | Show the Workflow baseline. Every change creates a version/reason and applies only to new Runs. Define ranges in SRS. |
| UX-OQ-012 | A complete schema/conflict rule is missing for Owner-created price/discount programs. | Price-program form and price-exception task. | Define only minimum functional fields. Do not invent overlap/priority rules. |
| UX-OQ-013 | Deep-link behavior for a record removed by demo reset is not approved. | Back/refresh from a notification or bookmark. | Proposed state: `record is no longer in the scenario`, with a link to Control Tower. PO/UX must approve. |
| UX-OQ-014 | No usability test confirms the number/order of mobile bottom-navigation items. | Ability to find Inbox, Orders, and Approval. | Baseline uses 4 items. Approval stays direct and is not under `More`. |
