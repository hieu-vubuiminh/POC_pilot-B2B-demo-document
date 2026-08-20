# NAVIGATION AND USER FLOWS

**Product:** OPC Sales Operations Agent  
**Channel:** Responsive Web/PWA  
**Screen ID source:** `SCREEN_INVENTORY.md`  
**Date:** 20 August 2026

## 1. Navigation rules

- Control Tower is the default entry screen and gives priority to exceptions, Approvals, Reservation expiry, and Workflow errors.
- Order Detail SCR-004 is the center of a case. Every downstream entity must link back to the Order.
- Business state and Workflow Run state are always shown separately. Navigation must not use one state in place of the other.
- Important Approvals always have a direct link/button. Do not hide Approve/Reject under `More`.
- Desktop uses list + detail/drawer when useful. Mobile uses the same Screen ID but shows Detail as a full-screen state.
- Every deep link carries tenant context and entity ID. If the tenant does not match or the actor has no permission, do not open a record with the same ID from another tenant.
- A Connector in a deep link/Detail always has a simulator label.

## 2. Main navigation structure

### 2.1 Desktop main navigation

| First-level menu | Second-level menu | Screen ID | Note |
|---|---|---|---|
| Control Tower | — | SCR-001 | Default screen. |
| Sales | Request Inbox | SCR-002 | Badge for Messages that need review. |
| Sales | B2B Sales Orders | SCR-003 | Order List. |
| Work | Decisions & Approvals | SCR-005 | Open/overdue badge; always visible. |
| Work | Picking & Delivery | SCR-008 | Fulfilment queue. |
| Finance | Invoices, Receivables, Reconciliation | SCR-009 | One screen with three tabs. |
| Data | Customers | SCR-006 | Read-only MVP. |
| Data | Products & Inventory | SCR-007 | Read-only inventory view. |
| Monitoring | Audit Log | SCR-011 | Workflow Run Detail has no separate list and opens through a deep link. |
| Settings | Demo & Policy | SCR-012 | Tabs depend on Owner/Demo Admin permissions. |

SCR-004 and SCR-010 are context Detail screens and do not need their own first-level menu.

### 2.2 Mobile navigation

Bottom navigation has four items:

1. `Tower` → SCR-001.
2. `Inbox` → SCR-002.
3. `Approvals` → SCR-005, always with an open/overdue badge.
4. `More` → Orders, Fulfilment, Finance, Customers, Products & Inventory, Audit, Settings.

Mobile rules:

- A notification/deep link opens the correct task/entity Detail directly and shows a clear Back button.
- A desktop drawer becomes full-screen Detail on mobile.
- A sticky action shows only the current valid action. Approve/Reject and Handover are not in a hidden menu.
- A dense table becomes a card list but keeps state, amount, waiting time, expiry, and next action.

## 3. Screen tabs

| Screen ID | Tab | Content |
|---|---|---|
| SCR-004 | Overview & Order | Message, Customer, Order line, price, debt, and Reservation. |
| SCR-004 | Fulfilment | Picking, Shipment, handover, and delivery. |
| SCR-004 | Finance | Invoice, Receivable, and Payment summary. |
| SCR-004 | Timeline | Actor/source events from Message to Payment. |
| SCR-006 | Profile | Identity, sender mapping, Invoice profile, and terms. |
| SCR-006 | Orders & Debt | Related Orders and Receivables. |
| SCR-007 | Current Stock | SKU/unit/on-hand/reserved/ATP. |
| SCR-007 | Reservations | Active Reservations and history. |
| SCR-007 | Movements | Read-only stock issue/receipt/compensation. |
| SCR-009 | Invoices | Invoice List/Detail. |
| SCR-009 | Receivables | Receivable List/Detail. |
| SCR-009 | Payments & Reconciliation | Payment, deduplication, match, and allocation. |
| SCR-012 | Tenant & Scenario | Switch/reset seeded demo. |
| SCR-012 | Business Policy | Confidence, Reservation, price/discount, and reminder. |
| SCR-012 | Agent Guardrail | Allowed/prohibited actions. |
| SCR-012 | Connector Simulator | Adapter status and scripted events. |

## 4. Drawers, modals, and deep links

### 4.1 Drawer/Detail state

| Item | Desktop | Mobile | Close/Back behavior |
|---|---|---|---|
| Message Detail SCR-002 | Split view | Full-screen Detail with the same Screen ID | Return to Message List and keep filter/scroll. |
| Approval Detail SCR-005 | Drawer or right Detail pane | Full-screen task | Return to queue and keep sort/filter. |
| Customer Detail SCR-006 | Drawer | Full-screen Detail | Return to Customer List. |
| SKU Detail SCR-007 | Drawer | Full-screen Detail | Return to Product List. |
| Finance entity Detail SCR-009 | Drawer | Full-screen Detail in the tab | Return to the same tab/filter. |

### 4.2 Modal/confirmation

Use a modal only for an action that requires the user to stop and confirm:

- Send a confirmation Message.
- Extend a Reservation.
- Approve/Reject with impact and reason.
- Cancel an Order/Workflow.
- Confirm handover and stock issue.
- Confirm return receipt.
- Submit/resubmit an Invoice.
- Refund/reversal/adjustment request.
- Save a policy/guardrail or reset the demo.

Do not use a modal for a long timeline or master-record Detail.

### 4.3 Minimum deep-link context

| Target screen | Required context |
|---|---|
| SCR-002 | `tenant_id`, `message_id`; optional `review_task_id` |
| SCR-004 | `tenant_id`, `order_id`; optional `tab`, `highlight_entity_id` |
| SCR-005 | `tenant_id`, `task_id`, `entity_id`, `entity_version` |
| SCR-006 | `tenant_id`, `customer_id`; optional `return_to_task_id` |
| SCR-007 | `tenant_id`, `sku_id`; optional `return_to_task_id`, `order_id` |
| SCR-008 | `tenant_id`, `order_id` or `shipment_id` |
| SCR-009 | `tenant_id`, `tab`, and the related entity ID |
| SCR-010 | `tenant_id`, `workflow_run_id` |
| SCR-011 | `tenant_id` and at least one entity/correlation filter when opened from context |
| SCR-012 | `tenant_id`, `tab`; Demo Admin may also have `scenario_id` |

If a deep link has only an ID without valid tenant context, the system must reject it instead of searching all tenants.

## 5. Breadcrumb, Back, and refresh

### 5.1 Desktop breadcrumb

- `Sales Orders > {Order ID}` for SCR-004.
- `Control Tower > Workflow Run {Run ID}` when SCR-010 opens from Tower. From an Order: `Sales Orders > {Order ID} > Workflow Run`.
- `Finance > {Tab} > {Entity ID}` for Detail in SCR-009.
- Drawer Detail does not add a breadcrumb. The drawer header shows the entity and a Close button.

### 5.2 Back button

- When opened from an in-app List, Back returns to that List with the earlier filter, sort, tab, and scroll.
- When opened from an external notification/deep link, Back returns to the logical parent: Approval → SCR-005 queue; Order → SCR-003; Workflow Run → SCR-001; Finance entity → the correct SCR-009 tab.
- Back does not automatically cancel a Draft form. If the form has unsaved changes, ask `Leave and discard changes?`.
- After a successful mutation, Back must not show the old version. The List must refresh that record.

### 5.3 Refresh

- URL/deep-link context restores Screen ID, entity, tab, and filter.
- After refresh, the app queries the source of truth again and does not continue an old submission automatically.
- An open confirmation modal closes after refresh. The user must review the current version again.
- Offline refresh uses only timestamped cache. All mutations are disabled.
- If the entity changed tenant context, was removed by demo reset, or is no longer permitted, show the correct state and link to the logical parent.

## 6. Navigation Matrix

| Navigation ID | Source screen | Item/action | Condition | Target screen | Passed data | Return behavior | Stop navigation when |
|---|---|---|---|---|---|---|---|
| NAV-001 | App entry | Enter app | Valid tenant context | SCR-001 | tenant | N/A | No permission/invalid tenant |
| NAV-002 | SCR-001 | Approval card | Task is current | SCR-005 | tenant, task, entity/version | Keep Tower filters | Task is cross-tenant/not found |
| NAV-003 | SCR-001 | Case row | Order exists | SCR-004 | tenant, Order | Keep queue/scroll | No permission/not found |
| NAV-004 | SCR-001 | Workflow error | Run exists | SCR-010 | tenant, Run | Keep Tower state | Run is not in tenant |
| NAV-005 | SCR-001 | Delivery alert | Shipment/Order exists | SCR-008 | tenant, Shipment/Order | Keep Tower state | Link is stale; refresh first |
| NAV-006 | SCR-001 | Financial alert | Finance entity exists | SCR-009 | tenant, tab, entity | Keep Tower state | No permission |
| NAV-007 | SCR-001 | Connector status | User can access Settings tab | SCR-012 | tenant, Connector tab | Return to Tower | Owner/Admin lacks tab permission |
| NAV-008 | SCR-002 | Message row | Message is in tenant | SCR-002 Detail | tenant, Message | Keep filter/scroll | Not found/no permission |
| NAV-009 | SCR-002 | Linked Order | Message is linked to Order | SCR-004 | tenant, Order | Return to Message Detail | No Order exists |
| NAV-010 | SCR-002 | Customer candidate | Candidate/Detail is valid | SCR-006 | tenant, Customer, return task | Return to review task | Cross-tenant/inactive selection |
| NAV-011 | SCR-002 | SKU candidate | Candidate/Detail is valid | SCR-007 | tenant, SKU, return task | Return to review task | Cross-tenant/inactive/invalid unit |
| NAV-012 | SCR-002 | Workflow link/error | Run exists | SCR-010 | tenant, Run | Return to Message Detail | No Run exists |
| NAV-013 | SCR-003 | Order row | Order is in tenant | SCR-004 | tenant, Order | Keep List filter/scroll | Not found/no permission |
| NAV-014 | SCR-003 | Next action | Projection is current | Correct screen | tenant, Order, task/entity | Keep List context | Projection is stale |
| NAV-015 | SCR-004 | Source Message | Message exists | SCR-002 | tenant, Message | Return to the same Order/tab | No Message link |
| NAV-016 | SCR-004 | Customer | Customer exists | SCR-006 | tenant, Customer | Return to the same Order/tab | No permission |
| NAV-017 | SCR-004 | SKU/Reservation | SKU/Reservation exists | SCR-007 | tenant, SKU, Order | Return to the same Order/tab | No permission |
| NAV-018 | SCR-004 | Approval banner | Task is current | SCR-005 | tenant, task, entity/version | Return to Order and refresh version | Task is stale/closed |
| NAV-019 | SCR-004 | Fulfilment action | State allows it | SCR-008 | tenant, Order/Shipment | Return to Fulfilment tab | No valid action |
| NAV-020 | SCR-004 | Finance entity | Entity exists | SCR-009 | tenant, tab, entity | Return to Finance tab | Entity is not created |
| NAV-021 | SCR-004 | Workflow Run | Run exists | SCR-010 | tenant, Run | Return to Order | No Run exists |
| NAV-022 | SCR-004 | Audit timeline link | Correlation exists | SCR-011 | tenant, Order/correlation | Return to Timeline tab | No permission/retention |
| NAV-023 | SCR-005 | Task row | Task is current or read-only history | SCR-005 Detail | tenant, task/entity/version | Keep queue | No permission/not found |
| NAV-024 | SCR-005 | Context link | Linked entity is in tenant | SCR-002/004/006/007/008/009/010 | entity context | Return to Task Detail | Cross-tenant/stale link |
| NAV-025 | SCR-006 | Related Order | Order exists | SCR-004 | tenant, Order | Return to Customer drawer/tab | No permission |
| NAV-026 | SCR-006 | Debt record | Receivable exists | SCR-009 | tenant, Receivable tab/ID | Return to Customer | No permission |
| NAV-027 | SCR-007 | Reservation Order | Order exists | SCR-004 | tenant, Order | Return to SKU drawer | No permission |
| NAV-028 | SCR-007 | Movement evidence | Audit event exists | SCR-011 | tenant, movement/correlation | Return to SKU drawer | Retention/no permission |
| NAV-029 | SCR-008 | Order context | Order exists | SCR-004 | tenant, Order, Fulfilment tab | Return to Fulfilment queue | No permission |
| NAV-030 | SCR-008 | Delivery decision | Task is current | SCR-005 | tenant, task, Shipment | Return to Fulfilment Detail | Task is stale |
| NAV-031 | SCR-009 | Order/Customer | Link exists | SCR-004/SCR-006 | tenant, entity | Return to the same Finance tab/Detail | No permission |
| NAV-032 | SCR-009 | Review/Approval | Task is current | SCR-005 | tenant, task, Finance entity | Return to Finance Detail and refresh | Task is stale/closed |
| NAV-033 | SCR-009 | Run/Audit | Link exists | SCR-010/SCR-011 | tenant, Run/correlation | Return to Finance Detail | No permission |
| NAV-034 | SCR-010 | Linked Order/Message/task | Link exists | SCR-004/002/005 | tenant, entity | Return to Run | No permission/stale task |
| NAV-035 | SCR-010 | Audit | Correlation exists | SCR-011 | tenant, Run/correlation | Return to Run | Retention/no permission |
| NAV-036 | SCR-011 | Entity/Run link | Link and permission are valid | SCR-004/SCR-010 | tenant, entity/Run | Return to Audit filters | No permission/not found |
| NAV-037 | SCR-012 | Switch tenant | Demo Admin; seeded tenant | SCR-001 | new tenant | Do not keep old entity | Unsaved changes/no permission |
| NAV-038 | Mobile notification | Approval deep link | Notification/task is current | SCR-005 Detail | tenant, task, entity/version | Return to SCR-005 queue | Offline, expired/stale/no permission |

## 7. User flows

### FLOW-001 — Zalo Message creates a successful Order

- **Start:** Zalo simulator sends a new Message. SCR-001 or SCR-002 shows the new event.
- **Screens:** SCR-002 → SCR-004 → SCR-008 → SCR-009 → SCR-004.
- **Actions:** Owner views the Message/extraction. Customer and SKU auto-match because score is `>=0,90`, unique, with no conflict. ERP checks price, debt, and ATP, then creates Order + Reservation. Owner reviews and sends confirmation in SCR-004. Owner selects carrier, picks goods, and confirms handover in SCR-008. After delivery, Invoice/Receivable/Payment continue in SCR-009.
- **Decision/branch:** If any gate fails, open the related exception flow. The happy path does not need Owner correction of extraction.
- **End:** Payment with exact reference + exact amount is allocated. Receivable is `PAID`, Order is `CLOSED`, and Run is `COMPLETED`.
- **Final data:** Message `RESPONDED`; Reservation `CONSUMED`; Shipment `DELIVERED`; Invoice `RECORDED`; Payment `ALLOCATED`; complete Audit.

### FLOW-002 — Message is missing information

- **Start:** SCR-002, Message `NEEDS_INFO`.
- **Screens:** SCR-002; SCR-010 may open after a parse/send error.
- **Actions:** Owner views missing fields, edits the Draft question, and sends it. When a simulator reply arrives, the Message creates a new input version and parses again.
- **Decision/branch:** Complete reply → continue validation; still incomplete → repeat with a new version. Owner may cancel the case if no irreversible step exists.
- **End:** Message returns to `PARSED` and continues to Order, or becomes `CANCELLED`.
- **Final data:** Keep every raw Message/version and outbound response. No Reservation exists while quantity data is incomplete.

### FLOW-003 — Agent cannot identify the Product

- **Start:** SCR-002, Message `NEEDS_REVIEW`, APR-002.
- **Screens:** SCR-002 → SCR-007 or SCR-005 → SCR-002/SCR-004.
- **Actions:** Owner views raw phrase, candidates, confidence/evidence, and ATP. Owner selects a valid SKU/unit or sends a question to the customer.
- **Decision/branch:** Selection found → `MATCH_SELECTED`, then revalidate price/debt/ATP. No valid SKU → `NEEDS_INFO`; do not create an SKU automatically.
- **End:** The line is standardized, or the case waits for information/is cancelled.
- **Final data:** Human selection + reason is append-only. The Agent proposal does not become master data.

### FLOW-004 — Stock shortage and Approval

- **Start:** ERP finds requested quantity > ATP. SCR-001/004/005 shows a shortage task.
- **Screens:** SCR-004 → SCR-005 → SCR-004; SCR-007 may also open.
- **Actions:** Owner views on-hand/reserved/ATP and the Agent proposal for partial/substitute/later. Owner sends the option to the customer and records the response.
- **Decision/branch:** Customer accepts part → current Order changes to the immediate quantity, and a linked Order Draft is created for the remaining quantity without Reservation. SKU/date changes → create a new Order version and revalidate. Not accepted → cancel/release.
- **End:** The Order becomes ready to reserve/confirm or is cancelled.
- **Final data:** No negative stock, no automatic backorder/split. Old Reservations are released by rule when quantity changes.

### FLOW-005 — Customer has overdue debt

- **Start:** ERP debt check creates APR-004. Run is `WAITING_HUMAN`.
- **Screens:** SCR-001/004 → SCR-005; SCR-006/009 may also open.
- **Actions:** Owner views total debt, overdue amount, debt age, exposure after the Order, and enters a reason.
- **Decision/branch:** Approve → ERP revalidates and continues if the Reservation is valid. Reject → cancel/release or use a new option. After 15 minutes, only send a reminder. Do not decide automatically.
- **End:** Order continues or becomes Cancelled/Draft based on the decision.
- **Final data:** Approval does not remove the overdue state. Actor/reason/time is audited.

### FLOW-006 — Confirm and reserve stock

- **Start:** Message/Order intent passes validation.
- **Screens:** SCR-004; SCR-007/SCR-005 may also open.
- **Actions:** ERP atomically rechecks ATP and creates Draft + Reservation. SCR-004 shows `Stock held — not reduced`, with 60-minute expiry. Owner reviews the confirmation Message.
- **Decision/branch:** More time needed → Owner extends once by 30 minutes before expiry. Expired → release and recheck before continuing. Owner sends confirmation → Order `CONFIRMED`.
- **End:** Order is confirmed or returns to `DRAFT`/is cancelled after expiry.
- **Final data:** Only one active Reservation set exists for the current Order version. No stock issue exists.

### FLOW-007 — Pick and hand over goods

- **Start:** Order `CONFIRMED`, Reservation active.
- **Screens:** SCR-004 → SCR-008 → SCR-007/011 when evidence is needed.
- **Actions:** Owner selects a carrier from simulated facts, starts/completes picking, checks actual = reserved, and confirms handover.
- **Decision/branch:** Validation fails → keep `READY_FOR_HANDOVER` and do not reduce stock. Handover succeeds → atomically create stock issue + consume Reservation + hand over Shipment.
- **End:** Order `DISPATCHED`, Shipment `HANDED_OVER/IN_TRANSIT`.
- **Final data:** Stock reduces once at handover. Audit has handover ID and stock before/after.

### FLOW-008 — Issue a simulated Invoice

- **Start:** Order/Shipment `DELIVERED`.
- **Screens:** SCR-004 Finance tab → SCR-009 Invoices; an error may open SCR-010/005.
- **Actions:** ERP creates an Invoice Draft from the delivered snapshot and submits it through the simulator.
- **Decision/branch:** Accepted result → Invoice `RECORDED`, create Receivable. Rejected → Owner views reason, creates a new correction version, and resubmits. An adjustment after Recorded always opens an Approval.
- **End:** Invoice recorded + Receivable open, or Order `INVOICE_BLOCKED` waiting for correction.
- **Final data:** The rejected/old Invoice version is not deleted. The UI always says `Simulated status`.

### FLOW-009 — Payment received and automatically reconciled

- **Start:** Payment simulator sends a new transaction ID.
- **Screens:** SCR-001/009; SCR-004 to view close result.
- **Actions:** ERP deduplicates, validates, and finds one Receivable with an exact supported reference + exact outstanding amount. ERP matches and allocates atomically.
- **Decision/branch:** There is no human decision for an exact case. A duplicate only creates Audit and links to the original Payment.
- **End:** Payment `ALLOCATED`, Receivable `PAID`, Order `PAID` then `CLOSED`, Run `COMPLETED`.
- **Final data:** No duplicate cash/allocation. Close gate has delivery/Invoice/Payment/Audit links.

### FLOW-010 — Payment does not match

- **Start:** Payment `NEEDS_REVIEW` because it is partial/excess/combined/missing/conflicting/wrong-tenant.
- **Screens:** SCR-001/009 → SCR-005 → SCR-009/004.
- **Actions:** Owner views raw Payment, candidate Receivables, outstanding amount, and Agent explanation.
- **Decision/branch:** Select valid match → revalidate, then allocate. Not enough data → `UNMATCHED`. Refund needed → create Approval. Posted allocation is wrong → reversal Approval.
- **End:** Payment is allocated, unmatched, refund pending/refunded, or in a reversal flow.
- **Final data:** Without an approved allocation, Receivable does not change, and Order does not close.

### FLOW-011 — Workflow error and retry

- **Start:** SCR-001 shows Run `RETRY_SCHEDULED`, `BLOCKED`, or `FAILED`.
- **Screens:** SCR-001 → SCR-010 → SCR-004/005/011.
- **Actions:** Owner views step, source, commit result, attempts, and idempotency key. Retry is available only for actions marked safe.
- **Decision/branch:** Safe retry → Run continues. A human decision cannot retry automatically. No recovery → manual task or cancel/compensate if RUN-10 allows.
- **End:** Run returns to `RUNNING/WAITING_*`, becomes `CANCELLED`, or stays `FAILED`.
- **Final data:** Order state stays separate. Retry creates no duplicate business record.

### FLOW-012 — User cancels an Order

- **Start:** SCR-004, Order has no handover/stock issue.
- **Screens:** SCR-004 → confirmation modal → SCR-010 if compensation fails.
- **Actions:** Owner views impact, enters a reason, and confirms cancel.
- **Decision/branch:** Conditions pass → cancel Shipment before handover, release Reservation, and close tasks. Handover already happened → this cancel action is forbidden; use delivery/return/correction flow.
- **End:** Order/Run `CANCELLED` after compensation is complete.
- **Final data:** On-hand does not increase because it was never reduced. Audit keeps Message/Order/Reservation history.

### FLOW-013 — Mobile user receives a notification and approves an exception

- **Start:** Simulated or in-app notification/deep link shows an open task. Real PWA push is UX-OQ-009.
- **Screens:** Notification → SCR-005 mobile Detail → SCR-004/008/009 based on task.
- **Actions:** Owner opens the task and sees tenant, entity/version, original trigger, Agent proposal, ERP result, impact, approver, elapsed time, and Reservation expiry. Owner enters a reason, then Approves or Rejects.
- **Decision/branch:** Offline → view cache only, no decision. Stale/expired task → disable buttons and load a new task. Demo Admin → read-only.
- **End:** Decision Audit succeeds and the deep link opens the new state, or the task stays unchanged if commit fails.
- **Final data:** Notification never auto-approves. Decision links to the correct tenant/entity/version.

## 8. UX OPEN QUESTIONS for navigation

| ID | Question | Impact |
|---|---|---|
| UX-OQ-009 | Will PWA push notification be built, or will the MVP use only in-app/scripted deep links? | FLOW-013 and permission flow. |
| UX-OQ-013 | After demo reset, should an old URL/deep link show `not found` or open the scenario landing page with an explanation? | Back/refresh after reset. |
| UX-OQ-014 | What is the maximum number of mobile bottom-navigation items based on real usability testing? | Inbox/Orders order may change, but Approval must always stay direct. |
