# SCREEN FUNCTIONAL SPEC

**Product:** OPC Sales Operations Agent  
**Channel:** Responsive Web/PWA  
**Specification level:** UX/UI functions; not visual design or an API contract  
**Sources:** `01_PRD/PRD_OPC_SALES_AGENT.md` and all documents in `02_Workflow`  
**Date:** 20 August 2026

## 1. Common rules

### 1.1 Actors and data

- `Owner`: views and handles data in their tenant and is the prototype approver.
- `Demo Admin`: switches/resets demo tenants and views data in the selected tenant. This role cannot approve/reject a business task.
- Every query and command must have tenant context. The UI does not let users type the tenant ID of a business record.
- Command names below are expected business commands, not endpoints or technical commitments.
- Every mutation sends `entity_id`, `entity_version`, actor, reason when needed, and an idempotency/business key.
- If data changed, the UI does not overwrite it. It shows a stale warning, loads the new version, and asks for a new decision.

### 1.2 Required action-source labels

| Functional label | Meaning |
|---|---|
| `Agent proposal — not applied` | AI is understanding, ranking, or drafting. No business mutation exists. |
| `ERP checked` | A deterministic rule calculated/validated but may not have committed. |
| `ERP completed` | A transaction/state change committed. |
| `Owner decided` | A human decision has actor, time, and reason. |
| `Connector confirmed` | An adapter/simulator returned a valid event. The MVP must also show `Simulated`. |

### 1.3 Common screen states

Every screen below must handle these states. `Not applicable` means the screen does not own that business state, but it must still support loading, error, offline, permission, and stale behavior.

- `Loading`: use available data only when safe. Do not show an old value as new.
- `Empty`: explain whether there is no record or no filter result. Show a CTA only when it is in scope.
- `Agent processing`: show the step, start time, and “not applied” label.
- `Waiting for user information`: show missing data and the next action.
- `Waiting for Approval`: show the approver, waiting time, reminder/overdue, and Reservation expiry when relevant.
- `Success`: show action/result ID and new state, not only a temporary message.
- `Warning`: data can still be used, but there is a risk, expiry, simulator, or stale dependency.
- `Error`: show a short error, committed data, and allowed recovery action.
- `Offline`: show only timestamped cache. Block mutations and do not queue offline transactions.
- `No permission`: do not show sensitive data. Explain the invalid role/tenant.
- `Data changed`: block submission with the old version, reload, and ask for another review.

## 2. SCR-001 — Operations Control Tower

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-001 |
| Goal | Prioritize exceptions and next actions for one Owner without becoming a BI dashboard. |
| Actor | Owner; Demo Admin views the selected tenant only |
| Requirement ID | PRD-019, PRD-020, PRD-022, PRD-045, PRD-055, PRD-079, PRD-089, PRD-137, PRD-145 |
| Related Workflow | WF-001–WF-020; active/error Run states; Approval reminder/overdue |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Context bar | Identifies tenant and demo/simulator context | Top | Summary + status |
| Work needing action | Puts Approval, error, expiry, and overdue work first | Top of main content | Priority card/list |
| Active cases | Tracks business state and Run state separately | Main content | Desktop table / mobile list |
| Recent Agent activity | Shows what the Agent proposed and what ERP completed | Main content | Timeline/list |
| Connector health | Warns about simulated sources or Adapter errors | Bottom or desktop sidebar | Status card |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-001-01 | Context bar | Current tenant | Company name/code; text/status | ERP tenant context | Yes | Read-only | Always | Tenant must be valid | Owner, Demo Admin | Demo Admin opens SCR-012 to switch tenant |
| ITM-001-02 | Context bar | Demo label | `Demo prototype`, simulated Connectors | App configuration | Yes | Read-only | Always | Must not be hidden | All actors | No navigation |
| ITM-001-03 | Context bar | Data time | Last refresh time; text | Query metadata | Yes | Read-only | Always | ISO time/tenant | All actors | Refresh query |
| ITM-001-04 | Work needing action | Pending Approval | Type, case, approver, waiting time, expiry; card/list | Approval Service | When task exists | Read-only in Tower | Task open/stale/overdue | Do not combine tasks from different versions | Owner; Admin views | Open the correct task in SCR-005 |
| ITM-001-05 | Work needing action | Workflow error/blocked | Run, separate Order state, step, reason, retry status | Workflow Run | When error exists | Read-only | Run `BLOCKED`/`FAILED`/`RETRY_SCHEDULED` | Do not call a Workflow error an Order failure | Owner | Open SCR-010 |
| ITM-001-06 | Work needing action | Reservation near expiry | Order, SKU, quantity, “held, not reduced”, expiry/countdown | ERP Reservation | When active and near expiry | Read-only | `ACTIVE`/`EXTENDED` under alert policy | Countdown uses server time | Owner | Open SCR-004 or APR-007 in SCR-005 |
| ITM-001-07 | Work needing action | Delivery needs action | Shipment state, reason, waiting time | Shipment | When exception exists | Read-only | `FAILED`/`RETURNING` or overdue flag | UI does not add stock | Owner | Open SCR-008 |
| ITM-001-08 | Work needing action | Overdue finance work | Invoice/Payment task or overdue Receivable | Invoice/Receivable/Payment | When overdue | Read-only | Debt `OVERDUE` or financial task > 4 hours | Amount comes from ERP | Owner | Open SCR-009/SCR-005 |
| ITM-001-09 | Active cases | Case row | Order/Customer/current step/next action/update time | Order + Run projection | Yes | Read-only | Active cases | Separate `order_state` and `run_state` | Owner; Admin views | Open SCR-004 |
| ITM-001-10 | Active cases | Order state | Separate Order status | ERP Order | Yes | Read-only | Order exists | State-machine mapping | All actors | Filter/open Order |
| ITM-001-11 | Active cases | Workflow state | Separate Run status | Workflow Run | Yes | Read-only | Run exists | Do not infer from Order state | All actors | Open SCR-010 |
| ITM-001-12 | Recent Agent activity | Action timeline | Proposal, rule check, commit, decision, Connector event | Audit projection | Yes | Read-only | Event exists | Source label/actor/time required | Owner; Admin views | Open SCR-010/SCR-011 |
| ITM-001-13 | Connector health | Adapter status | Zalo/delivery/Invoice/Payment status and simulator label | Connector registry | Yes | Read-only | Always in demo | Do not use production wording | Owner, Admin | Open Integration tab in SCR-012 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-001-01 | Open priority work | Owner | Item still exists in the same tenant | No | No | Query/deep link | Opens correct entity/version | Stale item: load new List | SCR-004/005/008/009/010 |
| ACT-001-02 | Refresh Control Tower | Owner, Admin | Online | No | No | `REFRESH_CONTROL_TOWER` | Updates timestamp/count | Keeps old data with error label | SCR-001 |
| ACT-001-03 | Open case | Owner | Order ID exists | No | No | Query | Opens case | No permission/not found | SCR-004 |
| ACT-001-04 | Open Workflow Run | Owner | Run ID exists | No | No | Query | Opens step timeline | No permission/not found | SCR-010 |
| ACT-001-05 | Open Connector settings | Owner, Admin | Permission for the tab | No | No | Query | Opens correct Adapter configuration | No permission | SCR-012 |

### E. Screen states

| UX state | Display on SCR-001 |
|---|---|
| Loading | Keep queue frames. Each area has its own loading state. |
| Empty | “No work needs action.” Active cases have a separate Empty state. Do not treat this as healthy Connectors. |
| Agent processing | Case row shows `RUNNING` step and Agent not-applied label. |
| Waiting for information | Message/Order card shows missing fields and a link to SCR-002. |
| Waiting for Approval | Priority card shows approver, waiting time, reminder, and expiry. |
| Success | A newly completed/closed case stays in recent activity with result ID. |
| Warning | Reservation near expiry, simulator, overdue Receivable, or degraded Connector. |
| Error | Each area fails separately, without hiding areas that can load. |
| Offline | Show snapshot time and disable every mutation shortcut. |
| No permission | Do not load tenant data. Show only an access message. |
| Data changed | Refresh card/count and explain that another Workflow handled the item. |

## 3. SCR-002 — Sales Request Inbox

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-002 |
| Goal | Keep the original Message beside extraction/evidence and resolve unclear data before creating an Order. |
| Actor | Owner |
| Requirement ID | PRD-028–PRD-031, PRD-056, PRD-080, PRD-095–PRD-098, PRD-117 |
| Related Workflow | WF-001–WF-005; MSG-01–MSG-11; APR-001–APR-003 |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Message List and filter | Selects a conversation/Message by state | Desktop sidebar / mobile List screen | List + filter |
| Original content | Keeps input evidence | Top of main content | Conversation/timeline |
| Agent extraction | Shows candidates, confidence, evidence, and missing data | Main content | Read-only form + status |
| Review/clarification | Lets Owner select a match or send a question | Bottom / drawer | Form + action bar |
| Linked records | Opens linked Order/Run/Customer/SKU | Sidebar or bottom | Link List |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-002-01 | Message List | State filter | Message states and unread/needs-action filter | Message query | No | Editable filter | Always | Valid states only | Owner | Update List/URL |
| ITM-002-02 | Message List | Message summary | Sender, first text, received time, status | Message | Yes | Read-only | Record exists | Same tenant | Owner | Open Detail in SCR-002 |
| ITM-002-03 | Original content | Raw Message | Content cannot be edited; source/event/time | Connector envelope | Yes | Read-only | Message Detail | Hash/source event must exist | Owner | No mutation |
| ITM-002-04 | Original content | Channel label | `Zalo simulator`, send/receive status | Adapter metadata | Yes | Read-only | Always in Detail | Do not claim OA/group | Owner | Open Audit if needed |
| ITM-002-05 | Agent extraction | Extraction status | `PARSING`, `PARSED`, failed; status | Message/Run | Yes | Read-only | Always in Detail | Separate Message and Run status | Owner | Open SCR-010 when failed |
| ITM-002-06 | Agent extraction | Customer candidate | Candidate, score, evidence, conflict | Agent result + ERP candidate | When parsed | Selectable during review | `NEEDS_REVIEW` or parsed | Auto only when >=0,90, unique, no conflict | Owner | Select through ACT-002-01 |
| ITM-002-07 | Agent extraction | Product/unit candidates | Raw phrase, SKU/unit, score/evidence | Agent + ERP Product | For each line | Selectable during review | Parsed | Active SKU, configured unit, same tenant | Owner | Select through ACT-002-01 |
| ITM-002-08 | Agent extraction | Order data | Quantity, requested date, Invoice need, terms | Agent extraction | By schema | Read-only; correction through a new version | Parsed | Schema/version | Owner | Review; do not write directly to ERP |
| ITM-002-09 | Agent extraction | Source badge | `Agent proposal — not applied` | Actor/source metadata | Yes | Read-only | Every AI result | Must not say “Order created” | Owner | No navigation |
| ITM-002-10 | Review/clarification | Missing fields | List of missing fields | ERP schema validation | When `NEEDS_INFO` | Read-only | `NEEDS_INFO` | AI does not fill automatically | Owner | Draft/send clarification |
| ITM-002-11 | Review/clarification | Clarification Draft | Agent-drafted content; text area | Agent Draft | When question is needed | Editable | `NEEDS_INFO` | Recipient/channel/required question | Owner | ACT-002-02 |
| ITM-002-12 | Review/clarification | Review reason | Reason for candidate selection/cancel; field | Human input | For controlled change | Editable | Before review/cancel submit | Not empty when rule requires | Owner | Send with command |
| ITM-002-13 | Linked records | Linked Order | Order ID/state | ERP Order link | When linked | Read-only | `LINKED_TO_ORDER`/`RESPONDED` | Same tenant | Owner | SCR-004 |
| ITM-002-14 | Linked records | Workflow Run | Run ID/state/current step | Workflow Run | Yes | Read-only | Run exists | Same tenant | Owner | SCR-010 |
| ITM-002-15 | Linked records | Customer/SKU links | Selected master records | ERP master | When matched | Read-only | Match has result | Same tenant/version | Owner | SCR-006/SCR-007 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-002-01 | Select Customer/SKU/unit | Owner | Message `NEEDS_REVIEW`; valid candidate; current version | Yes, summary before submit | Human review, not financial Approval | `MATCH_SELECTED` | Stores selection/reason and revalidates | Stale/invalid/cross-tenant: do not save | SCR-002 `PARSED` or `NEEDS_INFO` |
| ACT-002-02 | Review and send question | Owner | Missing fields; valid Draft/recipient | Yes | Owner review required | `SEND_CLARIFICATION` | Message waits for reply; stores outbound ID | Send failure keeps Draft/version | SCR-002 `NEEDS_INFO` |
| ACT-002-03 | Retry extraction | Owner | Message `FAILED`; retry/manual retry is allowed | Yes, show new version | No | `PARSE_REQUESTED` | Message `PARSING`; Run continues | No retries left: keep `FAILED` | SCR-002 or SCR-010 |
| ACT-002-04 | Cancel case before Order creation/delivery | Owner | MSG-11 condition; no irreversible step | Yes, reason required | No | `CASE_CANCELLED` | Message `CANCELLED`; release resource if any | Compensation failure opens Run error | SCR-002/SCR-010 |
| ACT-002-05 | Open linked Order | Owner | Order ID exists | No | No | Query | Opens Order | No permission/not found | SCR-004 |
| ACT-002-06 | Open master record | Owner | Candidate/link in same tenant | No | No | Query | Opens record drawer | No permission/not found | SCR-006/SCR-007 |

### E. Screen states

| UX state | Display on SCR-002 |
|---|---|
| Loading | List and Detail load separately. Raw Message is not replaced by an extraction skeleton. |
| Empty | No Message or no filter result. There is no CTA to create a Message manually. |
| Agent processing | Show `PARSING`, elapsed time, and “not applied.” |
| Waiting for information | Show missing fields, question Draft, and reply status. |
| Waiting for Approval | Show review task, Owner, and waiting time when a candidate/clarification needs review. |
| Success | Show selection/send result and the Order link if created. |
| Warning | Confidence near gate, simulator source, or linked Reservation near expiry. |
| Error | Keep raw Message and show parse/send error and valid retry. |
| Offline | Show timestamped cached raw/extraction. Disable select/send/retry/cancel. |
| No permission | Do not show Message content. Report invalid tenant/role. |
| Data changed | Block old selection/Draft and load the new extraction/task version. |

## 4. SCR-003 — B2B Sales Order List

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-003 |
| Goal | Find an Order by business state and next action. Do not support bulk mutations. |
| Actor | Owner |
| Requirement ID | PRD-019, PRD-045, PRD-059, PRD-084 |
| Related Workflow | Full Order state machine; linked Run/Reservation/Shipment/Finance |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Filter bar | Filters by state, Customer, date, exception, and next action | Top | Filter/search |
| Order List | Shows business state and Run state separately | Main content | Table/List |
| Saved context | Keeps filter/sort after return | URL/session state | Navigation data |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-003-01 | Filter | Search | Order ID, Customer, Payment reference | Query index | No | Editable | Always | Tenant-scoped; limited search fields | Owner | Update List/URL |
| ITM-003-02 | Filter | Business state | All Order states | Order | No | Editable filter | Always | Valid state enum | Owner | Update List |
| ITM-003-03 | Filter | Exception/next action | Needs review, Approval, expiry, delivery, Finance | Projection | No | Editable filter | Always | Do not infer incorrectly from Run state | Owner | Update List |
| ITM-003-04 | Order List | Order/Customer | ID, Customer, created/requested date | Order + Customer | Yes | Read-only | Result exists | Same tenant | Owner | Open SCR-004 |
| ITM-003-05 | Order List | Order state | Status label | Order | Yes | Read-only | Result exists | State-machine mapping | Owner | Filter/open |
| ITM-003-06 | Order List | Workflow state | Run state and current step | Workflow Run | When Run exists | Read-only | Run exists | Show separately from Order state | Owner | Open SCR-010 |
| ITM-003-07 | Order List | Total/price source | Deterministic total and source/version | ERP calculation | Yes | Read-only | Commercial calculation exists | Do not calculate in client/AI | Owner | SCR-004 |
| ITM-003-08 | Order List | Reservation | State, quantity, expiry; held/not-reduced label | Reservation | When available | Read-only | Active/history | Server time | Owner | SCR-004/SCR-007 |
| ITM-003-09 | Order List | Delivery/Invoice/Payment summary | Three separate statuses | Linked entities | When available | Read-only | By progress | Do not call delivered paid | Owner | SCR-004/SCR-008/SCR-009 |
| ITM-003-10 | Order List | Next action | Clear action and required actor | Workflow projection | For active case | Read-only/link | Non-terminal | Uses current versions | Owner | Open correct SCR-004/005/008/009/010 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-003-01 | Filter/search Orders | Owner | Has tenant permission | No | No | Query | Updates List; URL keeps filter | Shows query error | SCR-003 |
| ACT-003-02 | Open Order Detail | Owner | Order exists in same tenant | No | No | Query | Opens Order on default tab | Not found/no permission | SCR-004 |
| ACT-003-03 | Open next action | Owner | Projection is current | No | Based on target task | Query/deep link | Opens correct task/entity | Stale: refresh row | SCR-004/005/008/009/010 |

### E. Screen states

| UX state | Display on SCR-003 |
|---|---|
| Loading | Keep filter; List loads separately. |
| Empty | Separate “no Orders yet” from “no filter results.” |
| Agent processing | Row shows Run `RUNNING`; do not create a false Order state. |
| Waiting for information | Row has next action to Inbox/Order review. |
| Waiting for Approval | Row shows approver, waiting time, and expiry if available. |
| Success | Closed/Cancelled Orders remain searchable by filter. |
| Warning | Expiry, overdue debt, delivery/Finance exception. |
| Error | Query error; old data has timestamp if still safe. |
| Offline | Cached List only; no inline mutation. |
| No permission | Do not show the List. |
| Data changed | Refresh row before opening the next action. |

## 5. SCR-004 — Order 360 Detail and Actions

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-004 |
| Goal | Bring together the full Message-to-cash journey and important actions for one Order. |
| Actor | Owner |
| Requirement ID | PRD-019, PRD-022, PRD-034–PRD-045, PRD-059–PRD-064, PRD-084, PRD-116, PRD-167–PRD-171 |
| Related Workflow | WF-006–WF-020; all Order states and linked entity states |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Order header | Identifies Order/Customer, business state, Run state, and next action | Top | Summary + status + action bar |
| Risk/decision banner | Shows block, Approval, stale state, expiry, and impact | Under header | Warning/status |
| Overview & Order tab | Source Message, Customer, line, price, debt, and Reservation | Main content | Form/table/card |
| Fulfilment tab | Picking, Shipment, handover, and delivery | Main content | Timeline/card |
| Finance tab | Invoice, Receivable, and Payment summary | Main content | Card/List |
| Timeline tab | One actor/source timeline from Message to Payment | Main content | Timeline |
| Context drawer/modal | Edit version, confirmation preview, cancel reason | Drawer/modal | Form/confirmation |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-004-01 | Header | Order identity | Order ID/version, tenant, Customer, dates | Order | Yes | Read-only | Always | Same tenant/version | Owner | Copy/open Customer |
| ITM-004-02 | Header | Order state | Business status | ERP Order | Yes | Read-only | Always | State machine | Owner | No direct mutation |
| ITM-004-03 | Header | Workflow state | Run status/current step | Workflow Run | Yes | Read-only | Run exists | Separate from Order state | Owner | Open SCR-010 |
| ITM-004-04 | Header | Next action | Main action and actor | Workflow projection | For non-terminal | Button/link | Action is allowed | Entity version is current | Owner | Complete/open target screen |
| ITM-004-05 | Risk banner | Approval/review status | Type, approver, waiting time, reminder/overdue | Approval | When available | Read-only/link | Open task | Task version is current | Owner | SCR-005 |
| ITM-004-06 | Risk banner | Reservation expiry | State, countdown, one-time extension status | Reservation | When active/extended | Read-only + action | Before handover | Server time; at most one extension | Owner | ACT-004-02 |
| ITM-004-07 | Overview | Source Message | Raw text, sender, received time, simulator label | Message | Yes | Read-only | Always when source exists | Immutable source/hash | Owner | SCR-002 |
| ITM-004-08 | Overview | Customer summary | Name, sender mapping, Invoice profile, terms | Customer | Yes | Read-only | Always | Same tenant | Owner | SCR-006 |
| ITM-004-09 | Order | Order lines | SKU/unit/quantity/requested date/line state | Order version | Yes | Editable through correction action | `DRAFT`/`NEEDS_REVIEW` when rule allows | SKU/unit/quantity schema; new version | Owner | ACT-004-01 |
| ITM-004-10 | Order | Price calculation | Standard source, Owner program/discount, totals, tax inputs | ERP calculation | Yes | Read-only; Owner price decision through task/policy | After commercial check | Formula/policy version | Owner | SCR-005/SCR-012 for exception |
| ITM-004-11 | Order | Debt exposure | Open/overdue/new exposure and due dates | Receivable snapshot | Yes | Read-only | Commercial check | ERP deterministic | Owner | SCR-005/SCR-009 |
| ITM-004-12 | Order | Reservation summary | Quantity/state/expiry; `Stock held — not reduced` | Reservation | When available | Read-only | Active/history | No add/reduce in client | Owner | SCR-007 |
| ITM-004-13 | Order | Linked remainder Order | New Draft for remaining quantity | Order links | When partial accepted | Read-only/link | Linked Draft exists | Same tenant; no auto-reservation | Owner | New Order in SCR-004 |
| ITM-004-14 | Fulfilment | Picking/Shipment summary | Carrier, tracking, Shipment state, evidence | Shipment | From Confirmed state | Read-only/link | Shipment exists | Simulator source | Owner | SCR-008 |
| ITM-004-15 | Fulfilment | Stock effect | Before handover: not reduced; after handover: stock-issue ID/quantity | Reservation + stock movement | When Reservation/Shipment exists | Read-only | Always by phase | Unique handover ID | Owner | SCR-007/SCR-011 |
| ITM-004-16 | Finance | Invoice summary | State/version/result/rejection; simulated label | Invoice | After delivered | Read-only/link | Invoice exists | Prototype states only | Owner | Invoice tab in SCR-009 |
| ITM-004-17 | Finance | Receivable summary | Amount/due/outstanding/state | Receivable | When created | Read-only/link | Receivable exists | ERP amount | Owner | Receivable tab in SCR-009 |
| ITM-004-18 | Finance | Payment summary | Reference, received/match/allocation state | Payment | When event exists | Read-only/link | Payment exists | Deduplication/exact rule | Owner | Payment tab in SCR-009 |
| ITM-004-19 | Timeline | Event row | Time, actor/source label, action, before/after state, reason | Audit projection | Yes | Read-only | Event exists | Append-only | Owner | SCR-011 Detail |
| ITM-004-20 | Context | Confirmation preview | Customer Message from current Order version | Agent Draft + Order | When `RESERVED` and rules pass | Editable Message text | Before send | Revalidate Order/Reservation/version | Owner | ACT-004-03 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-004-01 | Correct Order data with a new version | Owner | `DRAFT`/`NEEDS_REVIEW`; no handover | Yes, impact preview | Repeat review/Approval if a rule requires it | `ORDER_DATA_CORRECTED` | New version; release/re-reserve if line changes; revalidate | Validation/conflict: keep old version | SCR-004 `DRAFT`/`NEEDS_REVIEW` |
| ACT-004-02 | Extend stock hold | Owner | Reservation `ACTIVE`, not expired, not extended | Yes, show new expiry | Human decision APR-007 | `EXTEND_APPROVED` | Reservation `EXTENDED` + 30 minutes | Stale/expired/already extended: reject | SCR-004 |
| ACT-004-03 | Review and send Order confirmation | Owner | Order `RESERVED`; active Reservation; Approval passes; current version | Yes, final preview | Owner review required by PRD-169 | `ORDER_CONFIRMATION_SENT` + outbound command | Order `CONFIRMED`, Message `RESPONDED` | Send failure: do not change state, or retry same key | SCR-004/SCR-008 |
| ACT-004-04 | Cancel Order before handover | Owner | `CONFIRMED`/`PICKING` or earlier; no stock issue | Yes, reason required, release impact | No | `ORDER_CANCELLED_BEFORE_HANDOVER` | Order `CANCELLED`, Reservation `RELEASED` | Compensation failure → Run error | SCR-004/SCR-010 |
| ACT-004-05 | Open Approval/review | Owner | Current task exists | No | By task | Query/deep link | Opens correct evidence/task | Stale: load new task | SCR-005 |
| ACT-004-06 | Open Fulfilment action | Owner | Order state has a Shipment action | No | By action | Query/deep link | Opens task for correct Order | State changed: refresh | SCR-008 |
| ACT-004-07 | Open Finance action | Owner | Invoice/Receivable/Payment exists | No | By action | Query/deep link | Opens correct tab/entity | Not found/no permission | SCR-009 |
| ACT-004-08 | Open Workflow Run | Owner | Run ID exists | No | No | Query | Opens Run | Not found/no permission | SCR-010 |
| ACT-004-09 | Open full Audit | Owner | Correlation/Order ID exists | No | No | Query | Opens Audit filter | Permission/retention is not enough | SCR-011 |

### E. Screen states

| UX state | Display on SCR-004 |
|---|---|
| Loading | Load header identity first. Tabs load separately. No action before version is confirmed. |
| Empty | Not applicable to an existing Order. A linked tab has a clear Empty state such as “No Invoice yet.” |
| Agent processing | Risk banner shows step/proposal as not applied. Order state stays unchanged. |
| Waiting for information | Show missing field and source-Message link. Block reserve/confirm. |
| Waiting for Approval | Show task, approver, waiting time, reminder, and Reservation expiry. |
| Success | Show committed result/state and Audit/event ID after action. |
| Warning | Simulator, Reservation near expiry, overdue debt, or delivery/Finance exception. |
| Error | Separate Workflow error from Order state. Show committed parts and recovery action. |
| Offline | Show cached snapshot. Disable edit/extend/send/cancel and every command. |
| No permission | Do not show Order data. Report tenant/role. |
| Data changed | Block submit, show the new version, and ask for a new preview/impact review. |

## 6. SCR-005 — Decision and Approval Center

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-005 |
| Goal | Help the Owner decide exceptions with enough evidence, impact, and audit details; bulk approval is not allowed. |
| Actor | Owner; Demo Admin has view-only access and does not see decision buttons |
| Requirement ID | PRD-026, PRD-035, PRD-063, PRD-088, PRD-099–PRD-102, PRD-109, PRD-113, PRD-116, PRD-164, PRD-170 |
| Related Workflow | APR-001–APR-016; DAM-003–DAM-024; Run `WAITING_HUMAN`; Order `NEEDS_REVIEW`/`PENDING_APPROVAL` |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Queue/filter | Sort tasks by urgency, type, wait time, and expiry | Desktop sidebar / mobile list | List + filter |
| Decision header | Identify tenant, task, entity version, approver, and state | Top of detail | Status/summary |
| Trigger and evidence | Show the source message/event, Agent proposal, and deterministic result | Main content | Card/timeline |
| Impact and compensation | Show what approve/reject will change | Main content | Warning/summary |
| Decision form | Enter a selection/reason and confirm | End of detail / sticky action bar | Form + button |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-005-01 | Queue | Task summary | Type, case, customer, priority, state | Approval/Review task | Yes | Read-only | A task exists | Same tenant/current version | Owner, Admin view | Open detail in SCR-005 |
| ITM-005-02 | Queue | Waiting time | Created time, elapsed time, reminder/overdue | Task + Timer | Yes | Read-only | Open task | Server time; overdue is a flag | Owner, Admin view | Sort/filter |
| ITM-005-03 | Queue | Reservation expiry | Expiry/countdown, held quantity | Reservation | When relevant | Read-only | Active/extended reservation | Server time | Owner | Open order/reservation |
| ITM-005-04 | Header | Approver | Owner who must decide; actor who decided if closed | Approval Service | Yes | Read-only | Always | Demo Admin is not an approver | Owner, Admin view | No mutation |
| ITM-005-05 | Header | Task/entity version | Task ID, entity ID/version, policy version, state | Task/ERP | Yes | Read-only | Always | Must be current before submission | Owner | Open entity |
| ITM-005-06 | Evidence | Original trigger | Original message or connector event | Message/Audit | Yes | Read-only | Source exists | Immutable hash/link | Owner | SCR-002/SCR-011 |
| ITM-005-07 | Evidence | Agent proposal | Candidate/option + confidence/evidence | Agent output | When available | Read-only | AI is involved | Label `not applied` | Owner | No commit |
| ITM-005-08 | Evidence | ERP rule result | Price/debt/ATP/payment/invoice validation + version | ERP/Rule Engine | Yes | Read-only | Always for approval | No calculation in the UI | Owner | No commit |
| ITM-005-09 | Evidence | Candidate/option selector | Customer, SKU, partial/substitute/later, carrier, or payment candidate | ERP candidates + Agent ranking | Based on task | Editable selection | Matching review task | Same tenant; current facts; no negative stock | Owner | Submit decision |
| ITM-005-10 | Evidence | Price decision input | Owner selects a program or enters level/scope/period/reason | Owner input + policy records | When price is outside configuration | Editable | APR-005 | No AI default; ERP recalculates | Owner | ACT-005-03 |
| ITM-005-11 | Impact | Impact if accepted | Stock, money, invoice, delivery, outbound message | Rule simulation | Yes | Read-only | Before decision | Based on current version | Owner | Confirm decision |
| ITM-005-12 | Impact | Compensation | Planned release/retry/return/reversal | Workflow definition | When available | Read-only | Mutation has compensation | Do not state it is automatic when a human is required | Owner | No mutation |
| ITM-005-13 | Decision | Reason | Reason for approval/rejection/selection | Human input | Yes for controlled decisions | Editable | Before submission | Not empty; length rule is in the SRS | Owner | Send with command |
| ITM-005-14 | Decision | Approve/Reject | Two clear actions, not inside a secondary menu | Task | Yes for approval | Button | Task is open/current; Owner | Revalidate tenant/version/rules | Owner | ACT-005-01/02 |
| ITM-005-15 | Decision | Stale/expired banner | Data changed, or task is stale/expired | Task + entity version | When it occurs | Read-only | Stale/expired | Disable decision buttons | Owner, Admin view | Refresh/open new task |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-005-01 | Approve exception | Owner | Task is open/current; reason is entered; deterministic rules still pass | Yes, show impact | This is approval | `APPROVE_TASK` + task command | Task approved; ERP revalidates and then transitions | Stale/invalid/expired: do not commit; create/show a new task | SCR-004/005/008/009 |
| ACT-005-02 | Reject exception | Owner | Task is open/current; reason is entered | Yes, show compensation | This is rejection | `REJECT_TASK` | Task rejected; cancel/release/keep standard price based on rule | Compensation error → Run blocked | SCR-004/SCR-010 |
| ACT-005-03 | Record the Owner's price level/program | Owner | APR-005; no valid configuration; enough input/reason | Yes, show new price | Human decision | `SET_OWNER_PRICE_DECISION` | New policy/order-price version; ERP recalculates | Validation/conflict: order does not change | SCR-005/SCR-004 |
| ACT-005-04 | Submit review selection | Owner | APR-001/002/006/009/014; valid candidate | Yes | Human review; not automatic approval | Task command, such as `MATCH_SELECTED` | Selection is stored append-only; revalidate | Stale/cross-tenant candidate: reject | SCR-002/004/008/009 |
| ACT-005-05 | Record customer response to a shortage option | Owner | Customer response has a source; shortage task is current | Yes | Owner confirms evidence | `PARTIAL_QUANTITY_ACCEPTED` or alternative command | New current order version; remainder draft if partial | Transaction failure does not create a partial result | SCR-004 |
| ACT-005-06 | Extend reservation | Owner | APR-007; active; not expired/not extended | Yes | Human decision | `EXTEND_APPROVED` | +30 minutes, new version | Stale/expired/already extended | SCR-005/SCR-004 |
| ACT-005-07 | Open context | Owner, Admin view | Entity is in the same tenant | No | No | Query/deep link | Open order/run/master/finance | Not found/no permission | SCR-002/004/006/007/008/009/010 |

### E. Screen states

| UX state | Display on SCR-005 |
|---|---|
| Loading | Queue and detail load separately; decision buttons stay disabled until version/rule data is ready. |
| Empty | Show “No work waiting for a decision”; explain when a filter has no result. |
| Agent processing | Show that a new proposal is being created; do not allow approval before validation. |
| Waiting for information | Show missing fields/evidence; do not allow a decision while required data is missing. |
| Waiting for Approval | Main state: approver, elapsed time, reminder/overdue, and expiry are always visible. |
| Success | Show decision, actor, reason, time, and new state/result. |
| Warning | Show possible stale data, reservation close to expiry, simulator status, and financial impact. |
| Error | Keep task/evidence; show whether the command was committed and provide a recovery link. |
| Offline | Allow cached task view; disable approve/reject/select/extend. |
| No permission | Admin has view-only access; users from another tenant cannot see details. |
| Data changed | Disable actions and load the new entity/task version; do not reuse the old reason/approval automatically. |

## 7. SCR-006 — Customer Directory and Profile

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-006 |
| Goal | Look up the customer source of truth to verify a match, price, invoice profile, terms, and debt. |
| Actor | Owner |
| Requirement ID | PRD-030, PRD-057, PRD-082, PRD-091, PRD-100, PRD-118 |
| Related Workflow | WF-003, WF-006–WF-007; APR-001, APR-004 |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Customer list/filter | Find customers by name, sender mapping, or debt status | Main content/list | Table/list + filter |
| Customer detail | View master and commercial facts | Desktop drawer / mobile detail state | Tabs/card |
| Related records | Open orders, receivables, and messages | Inside drawer | List/link |
| Context selection | Select a customer when opened from a review task | Sticky action in drawer | Button/status |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-006-01 | List | Search/filter | Name, legal name, phone/sender alias, debt status | Customer query | No | Editable filter | Always | Tenant scoped | Owner | Update URL/list |
| ITM-006-02 | List | Customer row | ID, display/legal name, contact, active state | Customer master | Yes | Read-only | Results exist | Same tenant | Owner | Open drawer |
| ITM-006-03 | Detail | Identity | Legal/display name, tax/invoice identity if seed data contains it | Customer master | Yes | Read-only | Drawer is open | Field availability follows the demo schema | Owner | No mutation |
| ITM-006-04 | Detail | Sender mapping | Zalo simulator sender/alias/link evidence | Mapping master | When available | Read-only | Mapping exists | Same tenant; source is labeled | Owner | Open related SCR-002 |
| ITM-006-05 | Detail | Invoice profile | Demo invoice fields/profile completeness | Customer master | When available | Read-only | Invoice profile exists | Do not call this legal validation | Owner | SCR-009 |
| ITM-006-06 | Detail | Price/terms | Price source, payment terms, policy version | Commercial policy | Yes for the scenario | Read-only | Customer is active | Effective date/version | Owner | SCR-012 policy |
| ITM-006-07 | Detail | Debt summary | Open, overdue, due dates, exposure | Receivable projection | Yes | Read-only | Always | ERP deterministic | Owner | SCR-009 receivable tab |
| ITM-006-08 | Related | Order history | Order ID/state/date/amount | Orders | When available | Read-only | Related records | Same tenant/customer | Owner | SCR-004 |
| ITM-006-09 | Related | Message history | Message source/status/time | Messages | When available | Read-only | Related records | Same tenant/customer mapping | Owner | SCR-002 |
| ITM-006-10 | Context | Candidate evidence | Match score/evidence from the task that opened this screen | Agent result | When opened from review | Read-only | A `return_to` task exists | Task is current | Owner | Compare before selection |
| ITM-006-11 | Context | Select customer | CTA to use this customer for review | Review context | Based on context | Button | APR-001 is current | Same tenant; customer is active | Owner | ACT-006-02 |
| ITM-006-12 | Detail | Master-data limitation | Read-only/seeded demo label | App scope | Yes | Read-only | Always | Do not show create/edit | Owner | No navigation |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-006-01 | Open customer detail | Owner | Customer is in the same tenant | No | No | Query | Drawer/detail opens | Not found/no permission | SCR-006 |
| ACT-006-02 | Select customer for review | Owner | Opened from APR-001; task is current; customer is active | Yes, summary | Human review | `MATCH_SELECTED` | Selection + reason are stored; return and revalidate | Stale/cross-tenant: do not select | SCR-002/SCR-005 |
| ACT-006-03 | Open related records | Owner | Record belongs to the same tenant/customer | No | No | Query/deep link | Open order/message/finance | Not found/no permission | SCR-002/004/009 |

### E. Screen states

| UX state | Display on SCR-006 |
|---|---|
| Loading | List and drawer load separately. |
| Empty | No seeded customer or no filter match; do not show a create CTA. |
| Agent processing | Show only candidate context; the Agent does not edit master data. |
| Waiting for information | If the profile is incomplete, show missing fields and a case link; there is no master-data edit action. |
| Waiting for Approval | If opened from a task, show the task/waiting context. |
| Success | After selection, show the result and return to the task/case. |
| Warning | Overdue debt, incomplete invoice profile, simulator mapping. |
| Error | Query error; do not infer customer data. |
| Offline | Cached read-only view; disable customer selection. |
| No permission | Do not show the customer list/detail. |
| Data changed | Refresh customer/task before selection. |

## 8. SCR-007 — Products and Available Stock

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-007 |
| Goal | Show SKU/unit/alias and distinguish on-hand, reserved, ATP, and stock issued. |
| Actor | Owner |
| Requirement ID | PRD-031, PRD-057, PRD-058, PRD-083, PRD-105–PRD-107, PRD-110, PRD-124, PRD-167 |
| Related Workflow | WF-004, WF-009–WF-010, WF-014; Reservation state machine; INV-A–INV-E |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| SKU list/filter | Find an SKU and quickly view ATP | Main content | Table/list + filter |
| SKU detail | View unit, alias, on-hand/reserved/ATP, and source time | Drawer/mobile detail | Card/table |
| Reservation history | Show hold/release/consume events | Inside drawer/tab | Timeline/table |
| Context selection | Select SKU/unit during review | Sticky action | Button/status |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-007-01 | List | Search/filter | SKU, name, alias, unit, availability | Product/Inventory query | No | Editable filter | Always | Tenant scoped | Owner | Update list |
| ITM-007-02 | List | SKU row | SKU, name, base/sales unit, active state | Product master | Yes | Read-only | Results exist | Active/configured unit | Owner | Open detail |
| ITM-007-03 | List | On-hand | Physical on-hand quantity | ERP Inventory | Yes | Read-only | Stock record exists | Server value | Owner | Open detail |
| ITM-007-04 | List | Reserved | Total active/extended reservation | ERP Reservation | Yes | Read-only | Stock record exists | Does not include consumed/released/expired | Owner | Open detail |
| ITM-007-05 | List | ATP | `on_hand - active reservations` | ERP deterministic | Yes | Read-only | Stock record exists | Not calculated by client/AI | Owner | Open detail |
| ITM-007-06 | Detail | Unit/alias | Configured unit conversions and customer aliases | Product master | Yes | Read-only | Drawer is open | AI must not create a conversion | Owner | No mutation |
| ITM-007-07 | Detail | Inventory timestamp | Warehouse, version, calculated time | Inventory snapshot | Yes | Read-only | Drawer is open | One warehouse/tenant in the demo | Owner | Recheck query |
| ITM-007-08 | Detail | Active reservation row | Order, qty, state, expiry, `held — stock not issued` | Reservation | When available | Read-only | Active/extended | Same tenant/SKU | Owner | SCR-004 |
| ITM-007-09 | Detail | Reservation history | Created/extended/released/expired/consumed + actor/time | Audit/Reservation | When available | Read-only | History exists | Append-only | Owner | SCR-011 |
| ITM-007-10 | Detail | Stock movement | Issue/receipt/compensation ID, qty, handover link | Inventory ledger | When available | Read-only | Movement exists | No edit; issue only at handover | Owner | SCR-008/SCR-011 |
| ITM-007-11 | Detail | Lot information | Lot text if ERP seed data provides it; no lot management | ERP optional field | No | Read-only | Field has data | Do not create a lot workflow | Owner | No separate lot screen |
| ITM-007-12 | Context | Match evidence | Raw phrase, candidate score/evidence | Agent output | When opened from APR-002 | Read-only | Review context | Task is current | Owner | Compare |
| ITM-007-13 | Context | Select SKU/unit | CTA to use this SKU/unit | Review context | Based on context | Button | Candidate/task is current | SKU is active, unit is configured, same tenant | Owner | ACT-007-02 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-007-01 | Open SKU detail | Owner | SKU is in the same tenant | No | No | Query | Drawer opens | Not found/no permission | SCR-007 |
| ACT-007-02 | Select SKU/unit for review | Owner | APR-002 is current; SKU is active; unit is configured | Yes, summary | Human review | `MATCH_SELECTED` | Selection is stored; order is revalidated | Stale/invalid: do not select | SCR-002/SCR-005 |
| ACT-007-03 | Recheck ATP | Owner | Online; valid SKU/order context | No | No | `RECHECK_ATP` query/rule | New snapshot/version | Conflict/query error | SCR-007/SCR-004 |
| ACT-007-04 | Open related order/audit | Owner | Link is in the same tenant | No | No | Query/deep link | Open record | Not found/no permission | SCR-004/SCR-011 |

### E. Screen states

| UX state | Display on SCR-007 |
|---|---|
| Loading | Keep the SKU name; stock/ATP numbers load separately, and cached numbers are not used for commit. |
| Empty | No seeded SKU or no filter match; do not show a create SKU CTA. |
| Agent processing | Show only candidate context; stock numbers always come from ERP. |
| Waiting for information | Unit/alias is not clear; link back to the review task. |
| Waiting for Approval | Show a link to the shortage/reservation extension task; no inline mutation. |
| Success | Recheck/selection shows a new snapshot/version. |
| Warning | Low ATP, reservation close to expiry, old snapshot, simulator/demo data. |
| Error | Do not show estimated ATP; reserve/handover actions are not on this screen. |
| Offline | Cached read-only view with timestamp; disable recheck/selection. |
| No permission | Do not show inventory/customer-specific reservations. |
| Data changed | Refresh snapshot/task before selection or open action. |

## 9. SCR-008 — Picking and Delivery

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-008 |
| Goal | Manage the flow from confirmed/picking to delivered/return, with handover as the only stock issue point. |
| Actor | Owner |
| Requirement ID | PRD-038–PRD-040, PRD-058, PRD-060, PRD-076, PRD-085, PRD-107, PRD-134, PRD-167 |
| Related Workflow | WF-013–WF-015; SHP-01–SHP-10; ORD-09–ORD-14; RSV-03–RSV-04 |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Fulfilment queue | Find orders that need picking/handover/exception handling | Sidebar/list | Table/list + filter |
| Order and goods for delivery | Show reserved/actual qty and requested time | Top of detail | Table/card |
| Delivery options | Compare facts from adapter/config | Main content | Comparison table/card |
| Picking & handover | Record the physical event and stock impact | Main content/sticky action | Checklist/form/action |
| Tracking & exception | Track events, failure, redelivery/return | Main content | Timeline/warning |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-008-01 | Queue | Fulfilment row | Order/customer/requested time/order+shipment state | Order/Shipment | Yes | Read-only | Relevant state | Separate Order and Shipment states | Owner | Open detail |
| ITM-008-02 | Detail | Reserved lines | SKU/unit/reserved qty/expiry | Order/Reservation | Yes before handover | Read-only | Reservation is active/extended | Same current order version | Owner | SCR-004/SCR-007 |
| ITM-008-03 | Detail | Actual handover qty | Actual quantity handed over; field | Human input | Yes at handover | Editable | `READY_FOR_HANDOVER` | Must equal reserved qty in the MVP | Owner | ACT-008-04 |
| ITM-008-04 | Delivery options | Carrier option | Provider, fee, service area, goods facts, pickup time | Adapter/config seed | When quoted | Selectable | `QUOTED` | Option is current; source is present | Owner | ACT-008-01 |
| ITM-008-05 | Delivery options | Simulator/source label | `Simulator`, snapshot time/version | Connector metadata | Yes | Read-only | Every option | No AI-memory claim | Owner | SCR-012 |
| ITM-008-06 | Picking | Picking checklist | Lines/qty/preparation status | Order/Owner input | Yes during picking | Editable checklist | Order `PICKING` | Does not change order qty | Owner | ACT-008-02 |
| ITM-008-07 | Handover | Stock impact preview | “Confirmation will issue X and consume the reservation” | ERP rule preview | Yes before handover | Read-only | Ready for handover | Current stock/reservation/version | Owner | Confirm dialog |
| ITM-008-08 | Handover | Carrier/tracking reference | Selected carrier, booking/tracking | Shipment | Yes when booked | Read-only | Booking exists | Correlation is current | Owner | Track event |
| ITM-008-09 | Handover | Evidence/time | Handover time/evidence; field | Owner input | Yes based on demo schema | Editable | Ready for handover | Required fields are in the SRS | Owner | ACT-008-04 |
| ITM-008-10 | Tracking | Shipment timeline | Quoted/booked/handover/in-transit/delivered/failed | Shipment/Audit | Yes | Read-only | Shipment exists | Event ordering/dedupe | Owner | SCR-010/SCR-011 |
| ITM-008-11 | Exception | Failure reason | Provider event/reason/last status | Connector | When failed | Read-only | Shipment `FAILED` | Event correlation | Owner | Open decision |
| ITM-008-12 | Exception | Redelivery/return options | Agent proposal + verified facts | Agent + ERP/adapter | When failed | Selectable through approval | Decision task is current | Label as proposal; no automatic stock receipt | Owner | ACT-008-06 |
| ITM-008-13 | Return | Return receipt fields | Qty/condition/time/evidence | Owner input | When returning/received | Editable | Shipment `RETURNING` | Physical receipt is required | Owner | ACT-008-07 |
| ITM-008-14 | Status | Inventory meaning | Before handover `held`; after handover `stock issued`; return only after receipt | ERP projection | Yes | Read-only | Always | INV-B–INV-E | Owner | SCR-007 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-008-01 | Select carrier | Owner | Shipment is `QUOTED`; option is current | Yes, option summary | Human if there is no deterministic winner | `CARRIER_SELECTED` | Shipment `BOOKED` | Booking failure keeps `QUOTED` | SCR-008 |
| ACT-008-02 | Start picking | Owner | Order is `CONFIRMED`; reservation is active | No | No | `PICKING_STARTED` | Order `PICKING` | Stale/expired reservation: block | SCR-008/SCR-004 |
| ACT-008-03 | Complete picking | Owner | Picking checklist passes; reservation is active | Yes, summary | No | `PICKING_COMPLETED` | Shipment `READY_FOR_HANDOVER` | Validation failure keeps picking state | SCR-008 |
| ACT-008-04 | Confirm handover | Owner | Ready; actual=reserved; unique handover ID; online | Yes, warn about stock issue | Human confirms the physical event | `HANDOVER_CONFIRMED` | Stock issue + reservation `CONSUMED` + order `DISPATCHED` atomically | Failure keeps ready state; no partial stock issue | SCR-008/SCR-004 |
| ACT-008-05 | Cancel before handover | Owner | No handover/stock issue yet | Yes, reason/impact | No | `SHIPMENT_CANCELLED` + order cancellation/release command | Shipment `CANCELLED`; reservation release follows order flow | Compensation failure → Run blocked | SCR-004/SCR-010 |
| ACT-008-06 | Select redelivery or return | Owner | Shipment is `FAILED`; decision task is current | Yes | Human decision APR-011 | `REDELIVERY_APPROVED` or `RETURN_STARTED` | New attempt or `RETURNING` | Do not add stock automatically; error keeps exception | SCR-008/SCR-005 |
| ACT-008-07 | Confirm physical return receipt | Owner | Shipment is `RETURNING`; valid qty/condition/evidence | Yes, stock receipt impact | Human confirms the physical event | `RETURN_RECEIVED` | Shipment `RETURNED`, new stock receipt compensation | Validation failure: do not add stock | SCR-008/SCR-007 |

### E. Screen states

| UX state | Display on SCR-008 |
|---|---|
| Loading | Disable handover until the order/reservation/shipment versions are all current. |
| Empty | No fulfilment task/filter result; do not create a shipment manually outside an order. |
| Agent processing | Show that options are being compared or recovery is being proposed; no booking/return yet. |
| Waiting for information | Carrier facts/evidence/actual qty are missing; show the missing fields. |
| Waiting for Approval | Show carrier/failed-delivery decision, approver, and elapsed time. |
| Success | Handover shows the stock issue ID; delivery shows connector confirmation. |
| Warning | Simulator, reservation close to expiry, failure/return, event out of order. |
| Error | State what was committed; do not call connector timeout delivered/failed. |
| Offline | Allow cached task view; disable picking complete/handover/cancel/return. |
| No permission | Do not show fulfilment data/actions. |
| Data changed | Refresh order, reservation, and shipment; require confirmation again. |

## 10. SCR-009 — Order Finance

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-009 |
| Goal | Place invoice, receivable, and payment data together for reconciliation; do not expand into full accounting. |
| Actor | Owner |
| Requirement ID | PRD-040–PRD-044, PRD-061–PRD-062, PRD-073–PRD-074, PRD-086–PRD-087, PRD-111–PRD-113, PRD-132–PRD-133, PRD-168, PRD-171 |
| Related Workflow | WF-016–WF-020; Invoice, Receivable, Payment state machines; APR-012–APR-016 |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Finance filter/header | Filter by customer/order/state/overdue and show the demo scope | Top of screen | Filter + status |
| Invoice tab | View draft, submission, result, rejection, and adjustment | Main content | Table/list + detail drawer |
| Receivable tab | View amount, due date, outstanding amount, and payment link | Main content | Table/list + detail drawer |
| Payment & reconciliation tab | View raw payment, dedupe, match, allocation, and exception | Main content | Table/list + detail drawer |
| Financial decision link | Open approval with full evidence | Detail action area | Warning + button |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-009-01 | Header | Tab and state filter | Invoice/AR/Payment state, overdue, needs review | Finance query | No | Editable filter | Always | Valid enum; tenant scoped | Owner | Update URL/list |
| ITM-009-02 | Header | Demo/legal boundary | `Simulated invoice/payment connector`; not legal issuance | App/connector config | Yes | Read-only | Always | Must not be hidden | Owner | SCR-012 |
| ITM-009-03 | Invoice | Invoice row | ID/order/customer/version/state/amount/time | Invoice | Yes | Read-only | Invoice tab | Same tenant | Owner | Open detail drawer |
| ITM-009-04 | Invoice | Invoice state | Prototype state + simulator label | Invoice | Yes | Read-only | Invoice exists | State machine; no legal wording | Owner | Filter/detail |
| ITM-009-05 | Invoice | Delivered snapshot | Order lines/amount used to create draft | Order snapshot | Yes for a draft | Read-only | From `DRAFT` onward | Order must be `DELIVERED` | Owner | SCR-004 |
| ITM-009-06 | Invoice | Submission/result | Correlation, submitted time, immutable response | Connector/Audit | On submission | Read-only | `SUBMITTED`/`RECORDED`/`REJECTED` | Same invoice version/key | Owner | SCR-010/SCR-011 |
| ITM-009-07 | Invoice | Rejection/correction fields | Reason, missing field, proposed correction | Connector + Agent | When `REJECTED` | Editable correction field based on demo schema | Rejected | New version; no overwrite | Owner | ACT-009-02 |
| ITM-009-08 | Invoice | Adjustment summary | Original/version/impact/task | Invoice/Approval | When requested | Read-only/link | `ADJUSTMENT_PENDING`/`ADJUSTED` | Original is immutable | Owner | SCR-005 |
| ITM-009-09 | Receivable | Receivable row | ID/order/invoice/customer/amount/due/outstanding/state | Receivable | Yes | Read-only | Receivable tab | ERP amount/due | Owner | Open detail |
| ITM-009-10 | Receivable | Debt status | Open/overdue/partial/paid/cancelled | Receivable | Yes | Read-only | Receivable exists | State machine | Owner | Filter/open order |
| ITM-009-11 | Receivable | Payment reference | Supported reference used for exact match | ERP reference rule | Yes | Read-only | `OPEN`/`OVERDUE`/`PARTIALLY_PAID` | Unique/format based on rule | Owner | Copy/show in customer context |
| ITM-009-12 | Receivable | Close-gate notice | Outstanding >0: “Order cannot be closed”; write-off is outside the MVP | ERP close rule | When outstanding >0 | Read-only | Not paid | No write-off action | Owner | SCR-004 |
| ITM-009-13 | Payment | Payment row | Provider transaction ID, payer, amount/time/reference/state | Payment raw event | Yes | Read-only | Payment tab | Immutable/idempotency key | Owner | Open detail |
| ITM-009-14 | Payment | Duplicate result | Link to original payment, no allocation | Dedupe audit | When duplicate | Read-only | `DUPLICATE` | Do not create a second cash record | Owner | Open original payment/SCR-011 |
| ITM-009-15 | Payment | Match result | Exact match rule or exception reason/candidates | ERP + Agent explanation | Yes after validation | Read-only | `MATCHED`/`NEEDS_REVIEW` | Exact reference+amount+one candidate | Owner | SCR-005 if review is needed |
| ITM-009-16 | Payment | Allocation | Payment-to-receivable lines, before/after outstanding | ERP allocation | When allocated/reversed | Read-only | `ALLOCATED`/`REVERSED` | Atomic, append-only correction | Owner | SCR-011 |
| ITM-009-17 | Payment | Refund/reversal task | Status, approver, reason, impact | Approval/Payment | When requested | Read-only/link | Pending/complete | Approval required | Owner | SCR-005 |
| ITM-009-18 | All tabs | Financial overdue | Elapsed >4 hours, Owner must act; state does not change | Task/Timer | When overdue | Read-only | Open financial task | Flag is not a business state | Owner | SCR-005 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-009-01 | Submit/retry invoice draft | Owner or orchestration through ERP | Order delivered; draft is current; required demo fields pass | Yes if triggered by Owner | No if data passes | `SUBMIT_REQUESTED` | `SUBMISSION_PENDING`/`SUBMITTED`; same idempotency key | Keep `DRAFT` or `INVOICE_BLOCKED` | SCR-009/SCR-010 |
| ACT-009-02 | Save correction and resubmit | Owner | Invoice is `REJECTED`; correction is valid | Yes, version difference | Human correction | `CORRECTION_SAVED`, then submit command | New version `DRAFT`, then submit | Do not edit the old rejection/version | SCR-009 |
| ACT-009-03 | Request invoice adjustment | Owner | Invoice is `RECORDED`; reason/impact provided | Yes | Always requires approval | `ADJUSTMENT_REQUESTED` | `ADJUSTMENT_PENDING`, task created | Original invoice does not change | SCR-005/SCR-009 |
| ACT-009-04 | Open payment mismatch review | Owner | Payment is `NEEDS_REVIEW`; task is current | No | Human decision in SCR-005 | Query/deep link | Open candidates/evidence | Stale: refresh payment/task | SCR-005 |
| ACT-009-05 | Confirm no match | Owner | Payment review is current; data is not enough | Yes, reason | Human decision | `NO_MATCH_CONFIRMED` | Payment `UNMATCHED`; receivable does not change | Stale/invalid: keep review state | SCR-009 |
| ACT-009-06 | Select and approve match | Owner | Candidate is valid; amount/outstanding are revalidated | Yes, impact | Human decision | `MATCH_SELECTED_AND_APPROVED` | `MATCHED`, then atomic allocation | Stale candidate: keep `NEEDS_REVIEW` | SCR-005/SCR-009 |
| ACT-009-07 | Request refund | Owner | Payment is `NEEDS_REVIEW`/`UNMATCHED`; reason/payee evidence provided | Yes | Always requires approval | `REFUND_REQUESTED` | `REFUND_PENDING`, task created | No refund is created | SCR-005 |
| ACT-009-08 | Request reversal | Owner | Payment is `ALLOCATED`; an error is found; reason provided | Yes | Always requires approval under the correction workflow | `REVERSAL_REQUESTED` | `REVERSAL_PENDING`, block close/correction | Old allocation stays unchanged | SCR-005 |
| ACT-009-09 | Open order/audit/run | Owner | Link is in the same tenant | No | No | Query/deep link | Open context | Not found/no permission | SCR-004/010/011 |

### E. Screen states

| UX state | Display on SCR-009 |
|---|---|
| Loading | Each tab loads separately; old amounts have a timestamp and are not used for submission. |
| Empty | Distinguish no invoice/AR/payment from an empty filter; do not create financial records manually without a defined flow. |
| Agent processing | Show that candidates are being found or a correction is being drafted, with a not-applied label. |
| Waiting for information | Invoice field or payment evidence is missing; show the specific field. |
| Waiting for Approval | Refund/adjustment/mismatch/reversal shows approver and elapsed/overdue time. |
| Success | Show connector/ERP result ID, new state, and allocation/remaining amount. |
| Warning | Simulator, rejected invoice, overdue receivable, payment mismatch, outstanding >0. |
| Error | Separate connector timeout, validation error, and transaction error; do not show false success. |
| Offline | Cached read-only view; disable submit/correction/match/refund/reversal. |
| No permission | Do not show amounts/payment details. |
| Data changed | Refresh invoice/payment/outstanding amount; require impact review again. |

## 11. SCR-010 — Workflow Run Detail

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-010 |
| Goal | Explain orchestration and recovery without mixing workflow errors with order states. |
| Actor | Owner |
| Requirement ID | PRD-022, PRD-045, PRD-081, PRD-089, PRD-096, PRD-098, PRD-101, PRD-114–PRD-116, PRD-140 |
| Related Workflow | RUN-01–RUN-13; retry/timeout/idempotency/compensation rules |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Run header | Show run identity/state/current step and the linked order state separately | Top of screen | Summary + status |
| Step timeline | View each Agent/rule/commit/connector/human step | Main content | Timeline/table |
| Error/retry panel | Show failure, attempts, next retry, and safe recovery | Sidebar/drawer | Warning/action |
| Linked entities | Open message/order/approval/audit | Main content/end | Link list |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-010-01 | Header | Run identity | Run ID, workflow definition/version, tenant, started time | Workflow Run | Yes | Read-only | Always | Same tenant | Owner | Copy/open audit |
| ITM-010-02 | Header | Run state | `CREATED`…`FAILED` | Workflow Run | Yes | Read-only | Always | Run state machine | Owner | Filter/context |
| ITM-010-03 | Header | Order state | Linked order business state | ERP Order | When an order exists | Read-only | Order link exists | Do not infer from run state | Owner | SCR-004 |
| ITM-010-04 | Header | Current/blocked step | Step ID/name, elapsed time, next action | Workflow Run | Yes for non-terminal | Read-only | Non-terminal | Definition/version | Owner | Action panel |
| ITM-010-05 | Timeline | Step source | Agent proposal/ERP check/commit/Human/Connector label | Audit/Run | Yes | Read-only | Step exists | Source label is required | Owner | SCR-011 |
| ITM-010-06 | Timeline | Step input/result summary | Sanitized input, result, state before/after | Audit/Run | Yes | Read-only | Event exists | Do not show secrets | Owner | Expand detail |
| ITM-010-07 | Timeline | Confidence/evidence | AI candidate/evidence/model/prompt version | Agent audit | For an AI step | Read-only | AI step | `not applied` if not committed | Owner | SCR-002/005 |
| ITM-010-08 | Timeline | Business command | Command ID/idempotency/result | Audit | For a command | Read-only | Command exists | Append-only | Owner | SCR-011 |
| ITM-010-09 | Retry | Failure detail | Error class/message, retryable flag, occurred time | Run/Audit | On failure | Read-only | Failure/retry | Do not expose secrets | Owner | Select safe retry if allowed |
| ITM-010-10 | Retry | Attempt history | Attempt count/time/result/next retry | Run/Audit | On retry | Read-only | Retry exists | Same business key | Owner | No mutation |
| ITM-010-11 | Retry | Recovery option | Retry safe step, cancel/compensate, or manual task | Workflow definition | When allowed | Button/link | Blocked/retry/active | Current entity versions | Owner | ACT-010-01/02 |
| ITM-010-12 | Compensation | Compensation status | Resource/action/result | Run/Audit | During compensation | Read-only | `COMPENSATING`/cancel/fail | Do not overwrite old commits | Owner | SCR-011 |
| ITM-010-13 | Linked | Related records | Message, order, approvals, connector events | Correlation links | Yes | Read-only | Link exists | Same tenant | Owner | SCR-002/004/005/011 |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-010-01 | Retry safe step | Owner | Run is `BLOCKED`/retryable; operation is safe; current version; budget/policy allows it | Yes, show step/key | No; do not retry a human decision | `RETRY_SAFE_STEP` or event `RETRY_DUE` | Run `RUNNING`/`WAITING_EXTERNAL` | No budget/conflict: keep `BLOCKED` | SCR-010 |
| ACT-010-02 | Cancel workflow | Owner | RUN-10 condition; no irreversible step that cannot be handled | Yes, reason and compensation preview | No | `CANCEL_REQUESTED` | `COMPENSATING`, then `CANCELLED` | Compensation failure → `FAILED`/manual task | SCR-010/SCR-004 |
| ACT-010-03 | Open human task | Owner | Run is `WAITING_HUMAN`; task is current | No | Based on task | Query/deep link | Open decision | Stale: refresh | SCR-005 |
| ACT-010-04 | Open linked entity | Owner | Link is in the same tenant | No | No | Query/deep link | Open context | Not found/no permission | SCR-002/004/009 |
| ACT-010-05 | Open audit | Owner | Correlation ID exists | No | No | Query | Audit is filtered to the correct run | Permission/retention error | SCR-011 |

### E. Screen states

| UX state | Display on SCR-010 |
|---|---|
| Loading | Header and step timeline load separately; disable retry/cancel until the current version is clear. |
| Empty | Run exists but has no step: show `CREATED`; do not call it an error. |
| Agent processing | Show `RUNNING` with the current AI/ERP step and source label. |
| Waiting for information | `WAITING_HUMAN` links to the missing-data task. |
| Waiting for Approval | `WAITING_HUMAN` shows task/approver/elapsed time/expiry. |
| Success | `COMPLETED` with close-gate summary; order state is still shown separately. |
| Warning | Retry scheduled, waiting external, reminder/overdue, simulator. |
| Error | `BLOCKED` has recovery; `FAILED` is a terminal run state but does not automatically change the order to failed. |
| Offline | Cached timeline; disable retry/cancel. |
| No permission | Do not show inputs/results. |
| Data changed | Refresh run/entity versions; cancel stale retry and write an audit event. |

## 12. SCR-011 — Immutable Audit Log

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-011 |
| Goal | Show which person/system did what, when, and on which version; editing and deletion are not allowed. |
| Actor | Owner; Demo Admin for the selected tenant |
| Requirement ID | PRD-022, PRD-048, PRD-064, PRD-089, PRD-116, PRD-156, PRD-177 |
| Related Workflow | All transitions; audit rules in section 9 of the workflow/matrix; INV-L |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Audit filter | Filter by entity, actor, event, correlation, and time | Top of screen | Filter/search |
| Event list | View sequence and source label | Main content | Table/list |
| Event detail | View IDs, version, before/after hash, and reason | Drawer/mobile detail | Read-only field group |
| Integrity warning | Report missing/duplicate/hash mismatch | Top of detail/list | Warning |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-011-01 | Filter | Entity/correlation filter | Entity type/ID, run/order/correlation ID | Audit query | No | Editable filter | Always | Tenant scoped | Owner, Admin | Update URL/list |
| ITM-011-02 | Filter | Actor/event/time filter | Agent/ERP/Human/Connector, event type, range | Audit query | No | Editable filter | Always | Retention rule is not decided | Owner, Admin | Update list |
| ITM-011-03 | List | Event sequence | Sequence/time/event/result | Audit record | Yes | Read-only | Results exist | Order/duplicate checks | Owner, Admin | Open detail |
| ITM-011-04 | List | Actor/source label | Actor type/ID and proposal/check/commit/decision/confirmation | Audit record | Yes | Read-only | Event exists | Source mapping is required | Owner, Admin | Filter |
| ITM-011-05 | Detail | Entity version/state | Entity ID/version, before/after state | Audit record | Yes | Read-only | Detail is open | Append-only | Owner, Admin | Open entity |
| ITM-011-06 | Detail | Command/event keys | Command ID, source event, idempotency key, correlation | Audit record | When available | Read-only | Detail is open | Mask secrets; no edit | Owner, Admin | Copy/open run |
| ITM-011-07 | Detail | Rule/decision context | Policy version, reason, result, confidence metadata | Audit record | When available | Read-only | Detail is open | Do not overwrite a human reason | Owner, Admin | Open task/run |
| ITM-011-08 | Detail | Before/after hash | Hash and linked correction event | Audit record | Based on event type | Read-only | Detail is open | Integrity check | Owner, Admin | Open correction link |
| ITM-011-09 | Warning | Integrity issue | Missing sequence, duplicate sequence, hash mismatch | Audit Service | When detected | Read-only | Integrity error | UI cannot “fix” it | Owner, Admin | Open Run/manual task |
| ITM-011-10 | Scope | Retention/export note | Retention/access/export are not decided | UX open question | Yes | Read-only | Always | No delete/edit/export CTA | Owner, Admin | No navigation |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-011-01 | Filter audit | Owner, Admin | Has tenant permission | No | No | Query | List follows filter | Query/retention error | SCR-011 |
| ACT-011-02 | Open event detail | Owner, Admin | Event is in the same tenant and within retention | No | No | Query | Read-only detail | No permission/not found | SCR-011 |
| ACT-011-03 | Open related entity/run | Owner, Admin | Link and permission are valid | No | No | Query/deep link | Open context | No permission/not found | SCR-004/SCR-010 |

There is no action to edit, delete, or overwrite audit records. Export is not included in the MVP because retention/access rules are not decided.

### E. Screen states

| UX state | Display on SCR-011 |
|---|---|
| Loading | Keep the filter; do not report an integrity pass before the sequence is complete. |
| Empty | No event in the filter/range; there is no create audit CTA. |
| Agent processing | The latest Agent event has a proposal label; do not show it as a commit. |
| Waiting for information | Not used as a page state; a related event can still record the waiting reason. |
| Waiting for Approval | A related event/task shows actor/waiting metadata and a link to SCR-005. |
| Success | Query/detail shows integrity/result metadata; there is no mutation success. |
| Warning | Missing/duplicate/hash mismatch or retention boundary. |
| Error | Query/integrity service error; do not report that the log is complete. |
| Offline | Cached audit has a timestamp; do not state that it is the latest sequence. |
| No permission | Do not show sensitive events/details. |
| Data changed | Append a new event to the list; old events do not change. |

## 13. SCR-012 — Demo and Policy Settings

### A. General information

| Attribute | Value |
|---|---|
| Screen ID | SCR-012 |
| Goal | Manage policy/version and the simulator in one screen, without turning it into platform administration or full ERP setup. |
| Actor | Owner for tenant policy; Demo Admin for tenant switch/reset and simulator seed |
| Requirement ID | PRD-005–PRD-008, PRD-057, PRD-065–PRD-068, PRD-090, PRD-104–PRD-105, PRD-120, PRD-127, PRD-129–PRD-136, PRD-161 |
| Related Workflow | Confidence >=0,90; reservation 60 + one 30; Owner pricing; allowed automatic actions; connector retry/simulator |

### B. Screen areas

| Area | Purpose | Relative position | Display type |
|---|---|---|---|
| Tenant & scenario tab | Select/reset seeded tenant/scenario | Main content | Form/card |
| Business policy tab | Manage confidence, reservation, price/discount, debt/match rules | Main content | Form/table |
| Agent guardrail tab | Show allowed and prohibited automatic actions | Main content | Form/status list |
| Connector simulator tab | View adapter status/config seed and trigger a demo event | Main content | Status/form |
| Change impact/version | Show which runs use the policy and store audit details | Sidebar/end of form | Warning/summary |

### C. Items

| Item ID | Area | Item name | Content and type | Data source | Required | Edit | Display condition | Validation | Permission | Action / next screen |
|---|---|---|---|---|---|---|---|---|---|---|
| ITM-012-01 | Tenant | Current tenant | Seed company, tenant ID, demo label | Demo tenant registry | Yes | Selectable by Admin | Tenant tab | Seeded tenants only | Owner view; Admin select | ACT-012-01 |
| ITM-012-02 | Tenant | Scenario reset summary | Records/states to reset, last reset | Demo scenario registry | During reset | Read-only | Tenant tab | Does not affect another tenant | Demo Admin | ACT-012-02 |
| ITM-012-03 | Policy | Confidence gate | `>=0,90`, unique, no conflict | Policy version | Yes | Editable/versioned if Owner is allowed | Policy tab | Range/precision needs SRS; current rule is default | Owner | ACT-012-03 |
| ITM-012-04 | Policy | Reservation TTL | 60 minutes | Policy version | Yes | Editable/versioned | Policy tab | Positive duration; range is not decided | Owner | ACT-012-03 |
| ITM-012-05 | Policy | Reservation extension | Once, +30 minutes, Owner before expiry | Policy version | Yes | Editable/versioned | Policy tab | Count/duration; no automatic extension | Owner | ACT-012-03 |
| ITM-012-06 | Policy | Overdue debt rule | Every overdue debt needs Owner approval | Policy version | Yes | Read-only baseline or versioned control based on PO decision | Policy tab | Agent cannot bypass | Owner | Save policy if editing is approved |
| ITM-012-07 | Policy | Payment exact-match rule | Exact supported reference + exact amount + one candidate | Policy version | Yes | Read-only baseline | Policy tab | Do not lower the conditions in the MVP | Owner | No direct mutation |
| ITM-012-08 | Policy | Price/discount programs | Name, scope, eligible customer/SKU, value/type, valid time, reason, state/version | Commercial policy | When discount is used | Editable | Policy tab | Owner input; no Agent default; non-overlap rule needs SRS | Owner | ACT-012-04 |
| ITM-012-09 | Policy | Approval reminder | 15 minutes for order task; 4 hours for financial overdue; no automatic decision | Policy/workflow | Yes | Read-only baseline or versioned | Policy tab | Reservation expiry is separate | Owner | ACT-012-03 if editing is approved |
| ITM-012-10 | Guardrail | Allowed automatic actions | Ingest, extraction, deterministic checks, eligible reservation, exact match, close gate | Agent policy | Yes | Editable/versioned within the allowed set | Guardrail tab | Do not allow AI direct money/stock/state actions | Owner | ACT-012-05 |
| ITM-012-11 | Guardrail | Prohibited actions | AI pricing/negotiation, negative stock, automatic approval/refund/adjustment, direct DB write | Product/workflow rule | Yes | Read-only | Guardrail tab | No toggle to enable them | Owner, Admin view | No action |
| ITM-012-12 | Guardrail | Model/prompt version | Active demo version and effective time | Agent config | Yes | Read-only in the UX baseline | Guardrail tab | Detailed model configuration is outside BA scope | Owner, Admin view | SCR-011 |
| ITM-012-13 | Connector | Adapter list/status | Zalo/delivery/invoice/payment, simulator flag, health, last event | Connector registry | Yes | Limited demo config | Connector tab | No real API claim/secret | Owner view; Admin configures seed | ACT-012-06 |
| ITM-012-14 | Connector | Retry policy | 1/5/15 minutes, max 3, PROPOSED label | Connector policy | Yes | Read-only or versioned after PO decision | Connector tab | Must not be shown as confirmed | Owner, Admin | No action until decided |
| ITM-012-15 | Connector | Trigger demo event | Select a scripted inbound/delivery/invoice/payment event | Test harness | No | Editable action input | Demo mode/Admin | Seeded scenarios only; unique event ID | Demo Admin | ACT-012-06 |
| ITM-012-16 | Change impact | Policy version/effect | Current/new version, effective scope; existing runs keep their snapshot | Policy/Audit | During edit | Read-only preview | Form is dirty/submitted | No silent retroactive change | Owner | Confirm save |
| ITM-012-17 | Change impact | Change reason | Reason for policy/reset/config change | Human input | Yes for mutation | Editable | Before save/reset | Not empty | Owner/Admin based on permission | Send with command |
| ITM-012-18 | Scope | Integration boundary | `Simulated/Not verified`; do not enter production credentials | App config | Yes | Read-only | Connector tab | Must not be hidden | Owner, Admin | No action |

### D. Actions

| Action ID | Name | Actor | Condition | Confirmation | Approval | Expected business command | Success | Failure | Next screen/state |
|---|---|---|---|---|---|---|---|---|---|
| ACT-012-01 | Change demo tenant | Demo Admin | Valid seeded tenant; no unsaved form | Yes, context switch | No | `SWITCH_DEMO_TENANT` | Entire app reloads for the tenant; do not keep entity links from the old tenant | Invalid/no permission | SCR-001 |
| ACT-012-02 | Reset demo scenario | Demo Admin | Seeded scenario; impact summary; online | Yes, reason is required | Not business approval | `RESET_DEMO_SCENARIO` | Tenant returns to a known state; audit reset event | Partial reset must report an error and not claim success | SCR-001/SCR-011 |
| ACT-012-03 | Save business policy | Owner | Required fields/impact/reason; current policy version | Yes, version difference | Human policy decision | `UPDATE_BUSINESS_POLICY` | New version for new runs; audit event | Conflict/invalid: keep old version | SCR-012/SCR-011 |
| ACT-012-04 | Create/update price program | Owner | Valid scope/value/time/reason | Yes, price impact | Human price decision | `SAVE_PRICE_PROGRAM` | New program/version; ERP can then apply it | Conflict/invalid: do not use program | SCR-012/SCR-004 |
| ACT-012-05 | Save Agent guardrail | Owner | Only within the allowed set; reason/version | Yes, impact | Human policy decision | `UPDATE_AGENT_GUARDRAIL` | New version for new runs; audit | Prohibited action: reject | SCR-012/SCR-011 |
| ACT-012-06 | Trigger/configure simulator event | Demo Admin | Demo mode, seeded event, unique source ID | Yes, event summary | No | `TRIGGER_SIMULATOR_EVENT` | Event is ingested/deduplicated and linked to audit | Duplicate/error shows the correct result | SCR-001/002/008/009/011 |

### E. Screen states

| UX state | Display on SCR-012 |
|---|---|
| Loading | Each tab loads separately; disable the form until the current policy version is clear. |
| Empty | Missing seeded configuration shows a setup gap; do not create a hidden default. |
| Agent processing | Not used for policy decisions; simulator run has a link to SCR-010. |
| Waiting for information | Form shows missing fields; do not save a partial policy. |
| Waiting for Approval | The Owner decides policy in the prototype; there is no Demo Admin approval. Do not add a future approval flow unless it is defined. |
| Success | Show policy/event version, actor, reason, effective scope, and audit link. |
| Warning | Change affects new runs, simulator/unverified connector, proposed retry/timeout. |
| Error | Keep old version; reset/config does not claim partial success. |
| Offline | Cached read-only view; disable switch/reset/save/trigger. |
| No permission | Owner does not see Admin reset/tenant switch actions; Admin has no business approval action. |
| Data changed | Block save on the old version; show the new difference and require confirmation again. |

## 14. UX OPEN QUESTIONS for the functional specification

| ID | Question to decide before SRS/UI detail |
|---|---|
| UX-OQ-001 | Which official state machine should Approval Request use; BA must still confirm whether `OVERDUE` is a flag or a state. |
| UX-OQ-004 | What are the real Zalo source/message types and outbound send contract? |
| UX-OQ-005 | What are the required invoice fields, provider results, adjustment types, and wording after legal/provider validation? |
| UX-OQ-006 | What are the required carrier facts, deterministic winner rule, and delivery reminder/timeout? |
| UX-OQ-007 | What are the audit field masking, retention, access, and export rules? |
| UX-OQ-008 | Do customer/product master records have CRUD in the app, or are they seeded/read-only only? |
| UX-OQ-009 | Is the mobile notification a simulated in-app/deep link notification or real PWA push? |
| UX-OQ-011 | What are the value ranges and edit permissions for confidence, reservation, reminder, and guardrail policy in SCR-012? The workflow baseline is decided, but there is no validation range. |
| UX-OQ-012 | What are the minimum fields and conflict rule for the Owner's price/discount program? |

## 15. Traceability by item group

Each Item ID on a screen supports at least one requirement or workflow step in the table below. No item is only decorative.

| Item prefix | Main requirement | Main workflow/state |
|---|---|---|
| ITM-001-* | PRD-045, PRD-055, PRD-079, PRD-089 | WF-001–WF-020; Run active/error states |
| ITM-002-* | PRD-028–PRD-031, PRD-056, PRD-080, PRD-097–PRD-098 | WF-001–WF-005; MSG-01–MSG-11 |
| ITM-003-* | PRD-019, PRD-059, PRD-084 | Order state machine |
| ITM-004-* | PRD-034–PRD-045, PRD-059–PRD-064, PRD-116 | WF-006–WF-020; all linked entity states |
| ITM-005-* | PRD-035, PRD-063, PRD-088, PRD-099–PRD-101 | APR-001–APR-016; DAM-003–DAM-024 |
| ITM-006-* | PRD-030, PRD-057, PRD-082, PRD-091 | WF-003, WF-006–WF-007; APR-001/APR-004 |
| ITM-007-* | PRD-031, PRD-058, PRD-083, PRD-105–PRD-107 | WF-004, WF-009–WF-010, WF-014; Reservation states |
| ITM-008-* | PRD-038–PRD-040, PRD-060, PRD-085, PRD-167 | WF-013–WF-015; Shipment states |
| ITM-009-* | PRD-040–PRD-044, PRD-061–PRD-062, PRD-086–PRD-087 | WF-016–WF-020; Invoice/Receivable/Payment states |
| ITM-010-* | PRD-045, PRD-081, PRD-089, PRD-114–PRD-116 | RUN-01–RUN-13; retry/compensation |
| ITM-011-* | PRD-022, PRD-048, PRD-064, PRD-089 | Audit rules; INV-L |
| ITM-012-* | PRD-065–PRD-068, PRD-090, PRD-104–PRD-105 | Confirmed workflow policy; simulator rules |
