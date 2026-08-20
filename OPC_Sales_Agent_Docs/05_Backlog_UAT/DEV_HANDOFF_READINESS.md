# DEV HANDOFF READINESS

**Product:** OPC Sales Operations Agent  
**Assessment date:** 20 August 2026  
**Decision:** **NOT READY for DEV sprint commitment or UAT execution**  
**Allowed next activity:** Backlog refinement, SRS authoring, contract definition, and test-data preparation

## 1. Scope summary

The release is one domain MVP and demo prototype. It covers a B2B hotel order from a simulated Zalo message through customer/SKU matching, price/debt/stock checks, reservation, approval, fulfilment, simulated invoice, receivable, payment reconciliation, closure, Control Tower, and audit.

It is a responsive Web/PWA with a minimal ERP slice. It is not a complete OPC MVP, full ERP, production SaaS platform, legal compliance product, or confirmed live connector implementation.

## 2. Source documents reviewed

| Folder | Files found | Source status | Readiness note |
|---|---:|---|---|
| `01_PRD` | 1 | Final PRD; scope approved; explicitly not Dev-ready | Scope baseline exists, but named PO and high-impact alignment items remain open. |
| `02_Workflow` | 3 | Proposed for PO/BA review with later workflow confirmations | Detailed business flow, state machines, approval rules, retry, idempotency, and compensation exist. Some statements conflict or remain proposed. |
| `03_UX_UI` | 4 | Functional UX baseline for PO/BA review | 12 screens, user flows, functional actions, and state presentation exist. Approval Request states are provisional. |
| `04_SRS` | 0 | Missing | No FR/NFR, data, interface, security, or detailed service specification can be traced. |

The source folders were read without modification. The four files in `05_Backlog_UAT` are derived handoff drafts, not changes to approved requirements.

## 3. Decisions used as the current baseline

| Area | Current baseline |
|---|---|
| Product level | Domain MVP / demo prototype, not full OPC or full ERP. |
| Channel and platform | Simulated/unverified connectors; one responsive Web/PWA; no separate mobile codebase. |
| Source of truth | ERP owns deterministic facts, validation, money, stock, tax, and business state. |
| Agent boundary | Agent reads unstructured input, creates candidates/plans, explains, routes, and waits. It cannot directly commit business facts. |
| Human boundary | Owner decides exceptions with visible evidence, impact, current version, and reason. Demo Admin cannot approve. |
| Auto-match | Customer/SKU auto-match only at score `>= 0.90`, one candidate, and no main-field conflict. |
| Price | Owner defines price/discount programs or order-specific values. Agent never chooses a discount value. No global 3% rule is used. |
| Stock | ATP and reservation are deterministic and atomic. Reservation is 60 minutes; Owner may extend once by 30 minutes before expiry. |
| Shortage | No negative stock. Accepted immediate quantity stays on the current order; remainder becomes a linked Order Draft without automatic hold. |
| Stock issue | On-hand reduces atomically at carrier handover, not at picking or reservation. |
| Delivery failure | Failed delivery does not restore stock. Only a verified physical return receipt creates linked stock compensation. |
| Invoice | Draft begins after delivery. Provider behavior is a labelled simulator and makes no legal compliance claim. |
| Payment | Only one exact reference, one candidate, and exact amount can auto-match. Other cases require review. |
| Closure | The order closes only after required delivery/invoice facts and full payment. Write-off is outside this MVP. |
| Waiting tasks | 15 minutes creates an order-blocking reminder; 4 working hours marks a financial task overdue. Neither makes a decision. Delivery 30-minute reminder remains proposed. |
| Recovery and evidence | Retry must be idempotent; unsafe unknown results require reconciliation; audit events are append-only. |

These rules are used because the Workflow and UX documents describe them as the current operational baseline. The PRD alignment defects below must still be closed formally.

## 4. Document defects

A **document defect** is a conflict, stale statement, missing state, or unclear rule inside the requirement set. It must be fixed in the source documents by Product/BA. It is not an implementation defect because no built result was assessed.

| ID | Defect | Evidence | Effect | Owner action |
|---|---|---|---|---|
| DD-001 | Discount wording is inconsistent. PRD uses “large discount” and a configurable approval threshold, while Workflow uses Owner-defined programs/values and no global threshold. | PRD-035, PRD-099, PRD-108, PRD-150, PRD-163 versus Workflow discount decision. | Approval AC and release evidence can be interpreted differently. | PO/BA align PRD language with the approved price-policy model. |
| DD-002 | PRD allows closure after an approved write-off, while Workflow says write-off is outside MVP and requires full payment. | PRD-044 versus WF-020/close gate and DAM-026. | Order closure and payment UAT have two possible results. | PO decides one rule and updates PRD/Workflow consistently. Current backlog follows full payment only. |
| DD-003 | PRD open questions remain stale after Workflow records decisions for auto-match, reservation, and partial quantity. | PRD-165, PRD-166, PRD-172 versus Workflow confirmed values. | PRD status and downstream requirement authority are unclear. | PO/BA close or restate the PRD items without changing their confirmed values. |
| DD-004 | Workflow scope sentence still allows Receivable to be “handled by an approved decision,” but its later rule requires paid in full. | `BUSINESS_AND_AGENT_WORKFLOW.md`, section 2 item 2 versus item 12 and WF-020. | A reader may infer a write-off closure path. | BA change the sentence to the approved full-payment rule. |
| DD-005 | Reservation extension is both confirmed and proposed inside Workflow documents. | `BUSINESS_AND_AGENT_WORKFLOW.md` confirms 60 + 30; STATE_MACHINE RSV-02 says one extension is proposed. | State transition AC is not fully authoritative. | BA mark RSV-02 consistently after PO confirmation. |
| DD-006 | Approval Request has UX statuses but no formal state machine. | `SCREEN_STATE_MATRIX.md` section 10–11: OPEN, APPROVED, REJECTED, STALE, EXPIRED; OVERDUE is a flag. | DEV cannot safely implement stale/expired/version transitions from UX mapping alone. | BA add an approved Approval Request state machine and link task expiry to reservation expiry. |
| DD-007 | PRD release criterion still requires a “large discount” approval class although the current price rule is policy-based. | PRD-150 versus Workflow price decision. | Demo pass/fail wording is ambiguous even if the behavior is correct. | PO define the release example as an out-of-policy price request or another exact approved class. |

## 5. Missing prerequisites and open decisions

A **missing prerequisite** is an absent document, owner, contract, environment, data set, or decision needed to build or test. It is not a defect in an implementation.

| ID | Missing prerequisite / open decision | Impact | Required owner | Blocking? |
|---|---|---|---|---|
| MP-001 | Approved SRS in `04_SRS`, with FR/NFR IDs and traceability. | All stories lack detailed functional/non-functional authority. | BA + PO + Technical Lead | **Yes** |
| MP-002 | Named Product Owner and decision authority. | Scope, priority, exceptions, and final acceptance cannot be signed. | Sponsor | **Yes** |
| MP-003 | Zalo simulator contract: source type, message types, envelope, IDs, ordering, and outbound behavior. | Message intake, clarification, retry, and duplicate tests are not buildable. | Product + Integration + BA | **Yes for EP-01** |
| MP-004 | Invoice fields, validation, states, result codes, adjustments, retention, and approved wording. | Invoice stories and UAT expected results are incomplete. | Finance SME + BA + Integration | **Yes for EP-06** |
| MP-005 | Carrier facts, selection inputs, status events, timeout, and delivery reminder decision. | Delivery choice and failure behavior are incomplete. | Operations SME + BA + Integration | **Yes for EP-05** |
| MP-006 | Payment event fields, provider/source ID, sandbox/simulator, ordering, and refund/reversal process. | Idempotency and mismatch handling cannot be fully specified. | Finance SME + BA + Integration | **Yes for EP-07** |
| MP-007 | Audit retention, access, masking, export, and correction policy. | NFR, privacy, storage, and audit UAT are incomplete. | Product + Security/Privacy + BA | **Yes for release** |
| MP-008 | Versioned seed pack for 2–3 demo tenants and all business variants. | UAT results will not be repeatable. | Product + BA + QA | **Yes for UAT** |
| MP-009 | Labeled Vietnamese message evaluation set and acceptance target. | The 0.90 threshold cannot be calibrated or validated. | BA + AI/QA | **Yes for AI acceptance** |
| MP-010 | Identity, role, tenant, session, and service-side authorization specification. | Permission and tenant isolation cannot be safely implemented. | Product + Security + Technical Lead | **Yes** |
| MP-011 | Validation ranges and conflict rules for policy settings and Owner price programs. | Invalid or overlapping price decisions may be accepted. | PO + Finance/Sales SME + BA | **Yes for EP-02/04** |
| MP-012 | UAT build, environment, event harness, accounts, browser/device matrix, and evidence repository. | The UAT plan cannot be executed. | DEV/Platform + QA | **Yes for UAT** |
| MP-013 | Decision on PWA notification method and exact supported responsive sizes. | Timer notification and UX coverage remain conditional. | PO + UX + Technical Lead | No for early build; yes for release |
| MP-014 | Decision on read-only customer/product master views versus any MVP CRUD. | Screen actions and permission scope may expand. | PO + BA + UX | Yes if CRUD is requested; current baseline is read-only |
| MP-015 | Manual-process baseline and formal validation success threshold/participant count. | Outcome validation cannot prove improvement. | PO + Business SME | No for build; yes for outcome decision |

## 6. Integration dependencies

| Dependency | MVP position | Minimum handoff artifact |
|---|---|---|
| Zalo/channel | Simulator or verified adapter only | Versioned inbound/outbound schema, idempotency rule, event examples, failure modes. |
| Carrier | Simulator or configured facts only | Option fields, status event list, event order, failure and return evidence. |
| Invoice | Labelled simulator only | Required fields, validation, accepted/rejected results, version and duplicate behavior. |
| Payment/bank | Simulator only until verified | Payment schema, provider/source ID, ordering, exact-match examples, mismatch and reversal events. |
| Agent/model | Unstructured extraction and proposals only | Versioned input/output schema, confidence/evidence format, retries, evaluation set, sensitive-data policy. |
| Identity/tenant | Required internal service | Role matrix, tenant-context source, server-side checks, session and audit identity. |

No live API, sandbox, cost, rate limit, legal status, or production reliability is confirmed by these documents.

## 7. Main risks

| Risk | Severity | Control before build/release |
|---|---|---|
| DEV interprets PRD and Workflow conflicts differently. | High | Resolve DD-001–DD-007 and publish one source-of-truth decision log. |
| Missing SRS causes hidden data, state, API, and NFR assumptions. | Critical | Complete MP-001 before sprint commitment. |
| Concurrent reservation or repeated events create duplicate stock/money effects. | Critical | Specify atomicity, idempotency, ordering, and replay tests in SRS. |
| AI confidence appears precise but is not calibrated for Vietnamese messages. | High | Build MP-009 and report accuracy by ambiguity type. |
| Prototype is presented as a live integration or compliant invoice product. | High | Keep visible simulator labels and release limitations. |
| Demo tenant data leaks between companies. | Critical | Define server-side tenant rules and pass UAT-018; do not claim production-grade isolation. |
| Approval or retry uses a stale entity version. | Critical | Add formal Approval Request state machine and optimistic version check. |
| UAT passes on friendly seed data but fails on messy events. | High | Include missing, ambiguous, duplicate, delayed, out-of-order, and conflicting variants. |
| Scope grows into full ERP or full SaaS. | High | Keep the out-of-scope release gate and route new domains to later discovery. |

## 8. Current blockers

1. `04_SRS` is empty, so FR/NFR traceability is impossible.
2. There is no named Product Owner to approve source alignment and release decisions.
3. DD-001, DD-002, DD-005, and DD-006 change important expected behavior or state authority.
4. Identity/tenant and simulator contracts are not ready for implementation.
5. UAT environment, seed data, accounts, event harness, and evidence storage do not exist in the reviewed handoff.

## 9. Readiness checklist

### Product

| Check | Status |
|---|---|
| Domain MVP and non-goals are clear | Ready |
| Vertical order and Must/Should priority are drafted | Ready for refinement |
| Named decision owner exists | Blocked — MP-002 |
| PRD and later decisions are aligned | Blocked — DD-001–DD-003, DD-007 |
| Outcome baseline and validation gate are approved | Open — MP-015 |

### Business Analysis

| Check | Status |
|---|---|
| End-to-end, exception, retry, idempotency, and compensation flows exist | Ready for refinement |
| Core business entity state machines exist | Ready with gaps |
| Approval Request state machine exists | Blocked — DD-006 |
| Approved SRS with FR/NFR and detailed rules exists | Blocked — MP-001 |
| Traceability has no missing layer | Blocked — all FR/NFR cells are missing |

### UX

| Check | Status |
|---|---|
| Screen inventory, navigation, functions, and state presentation exist | Ready for refinement |
| ERP facts, Agent proposals, and human decisions are separated | Ready |
| Approval states and task-expiry relationship are approved | Blocked — DD-006 |
| Responsive sizes, browser support, notification, and accessibility acceptance are fixed | Open — MP-013 |
| Simulator and tenant context are visibly labelled | Specified; must be tested |

### Development

| Check | Status |
|---|---|
| Stories have value, AC, priority, dependency, estimate, data, and mappings | Draft complete |
| FR/NFR, data model, API/event schemas, and security design are approved | Blocked — MP-001, MP-003–MP-011 |
| Atomic stock/money and idempotency design can be reviewed | Business rule exists; technical design missing |
| Environment and integration simulators are ready | Not evidenced |
| Story Definition of Ready is met | 0 of 31 |

### QA

| Check | Status |
|---|---|
| UAT covers requested happy and exception cases | Draft complete — 21 cases |
| Every story maps to UAT | Complete — 31 of 31 |
| Every UAT maps to approved FR/NFR | Blocked — MP-001 |
| Seed data, role accounts, event harness, and evidence store exist | Blocked — MP-008, MP-012 |
| Entry criteria are met and tests can run | No |

## 10. Readiness decision

### Overall: NOT READY

The package is **ready for backlog refinement and SRS preparation**, but it is **not ready for DEV sprint commitment, implementation acceptance, or UAT execution**. Starting feature work now would force DEV and QA to invent FR/NFR, security, connector, data, and unresolved state behavior.

To reach **Ready with conditions**, complete these minimum actions:

1. Name the Product Owner.
2. Resolve DD-001–DD-007 in the approved source set.
3. Create and approve the SRS with FR/NFR, data/state, permissions, interface, error, idempotency, performance, privacy, and audit requirements.
4. Add the formal Approval Request state machine.
5. Freeze simulator contracts, test data, UAT environment, roles, and evidence method.
6. Replace all `SRS: MISSING` mappings and run the two-way orphan check.

This conclusion separates requirement quality from missing delivery inputs. It does not claim that a product defect exists because no implementation or UAT result was reviewed.
