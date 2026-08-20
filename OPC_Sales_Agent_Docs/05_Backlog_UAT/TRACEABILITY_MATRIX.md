# TRACEABILITY MATRIX

**Product:** OPC Sales Operations Agent  
**Status:** Incomplete by design — `04_SRS` is empty  
**Date:** 20 August 2026

## 1. Purpose

This matrix traces each backlog outcome from a business pain point to UAT. It does not invent FR/NFR IDs. Every row must be updated after an approved SRS exists.

## 2. Pain point register

| ID | Pain point |
|---|---|
| PP-01 | Unstructured Zalo orders require manual reading, entry, clarification, and follow-up. |
| PP-02 | Customer, SKU, unit, and quantity can be ambiguous and may be matched incorrectly. |
| PP-03 | Price, discount policy, and debt checks are fragmented or depend on one person's memory. |
| PP-04 | Stock checks and holds can be late, duplicated, expired, or cause overselling. |
| PP-05 | Exceptions wait for decisions without complete facts, clear authority, SLA, or version safety. |
| PP-06 | Picking, handover, delivery failure, and returns can update stock at the wrong time. |
| PP-07 | Invoice preparation and correction are disconnected from delivery and order facts. |
| PP-08 | Payment matching is manual and risky for partial, excess, combined, or unclear transfers. |
| PP-09 | One operator lacks a single view of status, next action, timeout, failure, and recovery. |
| PP-10 | Evidence, permissions, tenant boundaries, mobile safety, and demo repeatability are weak. |

## 3. End-to-end matrix

| Pain | PRD | Workflow | FR / NFR | Screen | User Story | UAT case |
|---|---|---|---|---|---|---|
| PP-01 | PRD-028, 049, 080, 094, 136 | WF-001; MSG-01; RUN-01 | **MISSING — 04_SRS is empty** | SCR-002, 010, 011 | US-101 | UAT-001, UAT-016 |
| PP-01, PP-02 | PRD-029, 097, 098, 117, 128 | WF-002; MSG-02–04 | **MISSING — 04_SRS is empty** | SCR-002, 010 | US-102 | UAT-001, UAT-003 |
| PP-01 | PRD-029, 098, 100, 117, 151 | WF-005; MSG-05, 07, 11 | **MISSING — 04_SRS is empty** | SCR-002, 005, 010 | US-103 | UAT-002 |
| PP-02 | PRD-030, 073, 098, 165 | WF-006; APR-002 | **MISSING — 04_SRS is empty** | SCR-002, 004, 006 | US-201 | UAT-001, UAT-006 |
| PP-02 | PRD-031, 098, 117, 166 | WF-007; APR-004 | **MISSING — 04_SRS is empty** | SCR-002, 004, 005, 007 | US-202 | UAT-003 |
| PP-03 | PRD-032, 035, 075, 099, 108 | WF-008; APR-005 | **MISSING — 04_SRS is empty** | SCR-004, 005, 012 | US-203 | UAT-001, UAT-007 |
| PP-03 | PRD-034, 043, 074, 108 | WF-008; APR-005 | **MISSING — 04_SRS is empty** | SCR-004, 005, 006 | US-204 | UAT-006 |
| PP-04 | PRD-036, 057, 110, 133 | WF-009–010; RSV-01 | **MISSING — 04_SRS is empty** | SCR-004, 007 | US-301 | UAT-004, UAT-005 |
| PP-04 | PRD-037, 049, 057, 133, 153 | WF-010–011; RSV-01 | **MISSING — 04_SRS is empty** | SCR-003, 004, 007, 010 | US-302 | UAT-001, UAT-005 |
| PP-04, PP-05 | PRD-037, 133, 153, 166 | WF-010–012; RSV-01–04 | **MISSING — 04_SRS is empty** | SCR-004, 005, 007 | US-303 | UAT-021 |
| PP-04 | PRD-037, 057, 107, 139 | WF-012; ORD-07–08; RSV-04 | **MISSING — 04_SRS is empty** | SCR-004, 007, 010 | US-304 | UAT-017 |
| PP-05 | PRD-043, 062, 075, 112, 137 | DAM-006–012 | **MISSING — 04_SRS is empty** | SCR-004, 005, 011 | US-401 | UAT-004, UAT-006, UAT-007, UAT-008 |
| PP-05 | PRD-043, 077, 109, 137, 160 | APR decision rules; DAM-006–012 | **MISSING — 04_SRS is empty** | SCR-005, 011 | US-402 | UAT-006, UAT-007, UAT-008, UAT-018 |
| PP-04, PP-05 | PRD-036, 110, 152 | WF-009; ORD-05P; APR-006 | **MISSING — 04_SRS is empty** | SCR-004, 005, 007 | US-403 | UAT-004 |
| PP-03, PP-05 | PRD-035, 075, 099, 108, 150 | WF-008; APR-005 | **MISSING — 04_SRS is empty** | SCR-004, 005, 012 | US-404 | UAT-007 |
| PP-06 | PRD-038, 060, 085, 134, 175 | WF-013; SHP-01–02; APR-009 | **MISSING — 04_SRS is empty** | SCR-004, 008, 012 | US-501 | UAT-001 |
| PP-04, PP-06 | PRD-039, 058, 107, 153, 167 | WF-014; RSV-03; SHP-03–04 | **MISSING — 04_SRS is empty** | SCR-004, 007, 008, 011 | US-502 | UAT-001, UAT-005, UAT-010 |
| PP-06 | PRD-060, 107, 140, 167 | WF-015; SHP-05–10 | **MISSING — 04_SRS is empty** | SCR-001, 004, 005, 008, 011 | US-503 | UAT-010, UAT-011 |
| PP-07 | PRD-040, 061, 103, 132, 159 | WF-016; INV-01–02 | **MISSING — 04_SRS is empty** | SCR-004, 009, 012 | US-601 | UAT-001, UAT-012 |
| PP-07 | PRD-040, 049, 061, 106, 132 | WF-017; INV-03–07 | **MISSING — 04_SRS is empty** | SCR-004, 009, 010, 011 | US-602 | UAT-001, UAT-012 |
| PP-05, PP-07 | PRD-043, 062, 113, 137 | WF-018; INV-08–10; APR-011 | **MISSING — 04_SRS is empty** | SCR-004, 005, 009, 011 | US-603 | UAT-012 |
| PP-08 | PRD-041, 078, 104, 141 | WF-019; RCV-01–02 | **MISSING — 04_SRS is empty** | SCR-004, 009 | US-701 | UAT-001, UAT-013 |
| PP-08 | PRD-042, 049, 063, 078, 104 | WF-019; PAY-01–05; RCV-03 | **MISSING — 04_SRS is empty** | SCR-004, 009, 010, 011 | US-702 | UAT-001, UAT-016 |
| PP-05, PP-08 | PRD-043, 063, 112, 137, 156 | WF-020; PAY-06–12; APR-012 | **MISSING — 04_SRS is empty** | SCR-004, 005, 009, 011 | US-703 | UAT-013, UAT-014, UAT-015 |
| PP-08 | PRD-044, 064, 142 | WF-021; ORD-14–15; RCV-04 | **MISSING — 04_SRS is empty** | SCR-001, 004, 009, 011 | US-704 | UAT-001, UAT-013, UAT-014 |
| PP-05, PP-09 | PRD-045, 065, 086, 114, 144 | WF-022; DAM-003–005 | **MISSING — 04_SRS is empty** | SCR-001, 005 | US-801 | UAT-001, UAT-006, UAT-009, UAT-010 |
| PP-09 | PRD-045, 066, 115, 145 | WF-022; linked entity states | **MISSING — 04_SRS is empty** | SCR-004 | US-802 | UAT-001, UAT-008 |
| PP-04, PP-09 | PRD-047, 049, 105, 136, 139 | RUN-02–09; DAM-004–011 | **MISSING — 04_SRS is empty** | SCR-004, 010, 011 | US-803 | UAT-009, UAT-016, UAT-017, UAT-021 |
| PP-10 | PRD-047, 067, 109, 147, 158 | WF-022; DAM audit fields | **MISSING — 04_SRS is empty** | SCR-004, 010, 011 | US-804 | UAT-018, UAT-019 |
| PP-09, PP-10 | PRD-025, 068, 070, 091, 116, 135 | Cross-cutting permissions and safety | **MISSING — 04_SRS is empty** | SCR-001–012 | US-805 | UAT-018, UAT-020 |
| PP-10 | PRD-025, 070, 092, 168 | Demo setup and policy controls | **MISSING — 04_SRS is empty** | SCR-012 | US-806 | UAT-001, UAT-018, UAT-020 |

## 4. Coverage status

| Check | Result |
|---|---|
| Backlog stories mapped to a pain point, PRD, workflow, screen, and UAT | 31 of 31 |
| UAT cases mapped to backlog and source requirements | 21 of 21 |
| Stories mapped to approved FR/NFR | 0 of 31 — blocked by empty `04_SRS` |
| Approved live integration requirements | None claimed; simulator contracts are still prerequisites |
| Traceability ready for sprint commitment | No |

## 5. Update rule

After SRS approval, replace each `MISSING` cell with exact FR/NFR IDs and run an orphan check in both directions:

1. Every in-scope FR/NFR must map to a screen or justified non-UI behavior, at least one story, and at least one UAT case.
2. Every story and UAT expected result must map back to an approved requirement.
3. Any unmatched row is a release-readiness gap, not an implied requirement.
