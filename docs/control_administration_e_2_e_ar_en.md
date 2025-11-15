# Control Administration — End‑to‑End (AR/EN)

> Enterprise‑grade lifecycle for **Controls** in Shahin GRC Master. Bilingual (AR/EN), multi‑tenant, RBAC, audit‑ready, AI‑assisted (RAG + Scheduler + CCM). This spec describes **who does what, when, and how** — including data model, workflows, APIs, automations, SLAs, and KPIs.

---

## 0) Executive Summary | الملخص التنفيذي
- هدف العملية: إدارة دورة حياة الضوابط من **التعريف → الاعتماد → التنفيذ → التشغيل → الاختبار → المراقبة المستمرة (CCM) → المعالجة/الاستثناءات → إعادة الاعتماد/النسخ → الإيقاف**.
- النتائج: امتثال قابل للقياس، أدلة قابلة للتدقيق، خفض المخاطر والتكلفة، جاهزية دائمة للتدقيق.
- الذكاء: توصيات ذكية (خرائط الضوابط للإطارات، نوع الدليل المناسب، مواعيد التشغيل) + مراقبة مستمرة عبر موصلات تقنية.

---

## 1) Actors & RACI | الأدوار والمسؤوليات
| Role | مسؤوليات رئيسية | R/A/C/I |
|---|---|---|---|
| Control Owner (مالك الضبط) | تعريف/تنفيذ الضبط، تقديم الأدلة، التصديق | R |
| Process Owner | مواءمة إجراءات العمل، دعم التنفيذ | C/I |
| Compliance Officer | حوكمة، قبول الضبط، إدارة الفجوات | A |
| Risk Manager | الربط بالمخاطر وتتبّع المعالجة | C |
| Tester (1st/2nd Line) | اختبار التصميم/التشغيل وجمع العينات | R |
| Internal Audit | ضمان مستقل، اختبارات انتقائية | I |
| System Admin | موصلات CCM، صلاحيات، نسخ احتياطي | R |
| Tenant Admin | RBAC، الإعدادات، دمج SSO/Email | A |

> SoD: لا يُسمح لمالك الضبط باعتماد اختباره النهائي؛ يلزم موافقة Compliance/IA.

---

## 2) Master Data | البيانات الأساسية
**Core Entities:** `controls`, `framework_control_map`, `control_implementations`, `control_tests`, `control_evidence`, `documents`, `risks`, `risk_assessments`, `exceptions`, `change_requests`.

**Control Record — Key Fields | سجل الضبط — الحقول الأساسية**
- Code/Title/Objective (EN/AR)
- Domain/Process Area (ITGC, App, Cyber, Privacy …)
- Type & Nature: Preventive/Detective; Manual/Automated; Frequency (Daily/Weekly/Quarterly/On‑event)
- Maturity & Criticality (Critical/High/Med/Low)
- Risk Link(s) + Assertions (SOX/Privacy/NCA …)
- Evidence Requirements (what, where, who, retention)
- Owner, Back‑up Owner, Delegation rules

---

## 3) Lifecycle Stages | مراحل دورة الحياة

### 3.1 Define & Map | التعريف والمواءمة
**Inputs:** متطلبات إطار تنظيمي/مخاطر/عقد.
**Steps:**
1) Create Control (metadata + objective + assertions)
2) Map to Framework(s)/Section(s) (NCA/SAMA/PDPL/ISO …)
3) Draft Evidence Criteria + Test Strategy (Design vs Operating)
4) Assign Owner(s) & Frequency; generate **Baseline Procedure**
5) Submit for **Design Review**
**Gates:** Compliance Officer Approves/Rejects (comments captured)
**AI Assist:** اقتراح المابّينج والأدلة ونص السرد (narrative) من مستندات سابقة (RAG)

### 3.2 Implement | التنفيذ
**Steps:**
1) Create Implementation Plan (tasks, SOP links, configs)
2) Schedule Activities (AI Scheduler based on frequency)
3) Connect CCM signals (optional) / define data sources
4) Owner attests to "Ready"
**Gate:** Compliance approves readiness

### 3.3 Operate | التشغيل
- Owner executes activity per schedule
- Capture Evidence (files/exports/screens, API logs)
- Attestation: checkbox + comment + timestamp
- Auto‑validation (hash, virus scan, metadata completeness)

### 3.4 Test | الاختبار
- **Design Effectiveness (DE):** مرة عند الإطلاق/التغيير الجوهري
- **Operating Effectiveness (OE):** دوري (ربع سنوي/نصف سنوي)
- Sampling methods: random/systematic/judgmental; sample size rules
- Results: pass/partial/fail + finding(s)

### 3.5 Monitor (CCM) | المراقبة المستمرة
- Live connectors (SIEM, IAM, Config mgmt, Ticketing)
- Rules/Thresholds → Alerts → Tasks
- Drift detection + anomaly scoring

### 3.6 Issues/Exceptions | القضايا/الاستثناءات
- Findings → Root cause → Remediation plan → Due dates/owners
- Exceptions: temporary acceptance with **compensating controls**
- Risk acceptance workflow (expires, renew, close)

### 3.7 Change & Recertify | التغيير وإعادة الاعتماد
- Change request (scope/fields/impact)
- Impact analysis (frameworks, assessments, reports)
- Approval chain → version bump
- Annual recertification window (bulk attestation)

### 3.8 Retire | الإيقاف
- De‑map from frameworks, final archive, retention timers

---

## 4) State Machines | حالات الضبط وأحداث الانتقال
```
Control: draft → design_review → ready → operating → changed → retired
Events: submit_for_review, approve_design, reject_design, start_ops, fail_test, raise_exception, approve_change, retire
```
```
Implementation: planned → ready → active → suspended → retired
Test: planned → in_progress → passed/partial/failed → closed
Exception: proposed → approved → active → expired/closed
```

---

## 5) UI Blueprint | مخطط الواجهة
- **Control Card:** header (code/title/status), tabs: Overview | Framework Map | Implementation | Evidence | Tests | CCM | Issues | Changes | History
- **Design Review Drawer:** diff viewer, required fields checklist, approver comments, SoD indicator
- **Evidence Panel:** drag‑drop, templated folders, auto‑checks (hash/size/type), evidence acceptance checklist
- **Testing Workspace:** sample builder, steps, attachments, sign‑offs
- **CCM Console:** connectors, rules, last signals, alerts feed

---

## 6) Dynamic Workflows | سير عمل ديناميكي
**WF‑C1 New Control**
1) Draft → (AI suggests mappings/evidence) → Submit
2) Design Review (Compliance) → Approve/Reject
3) Implementation Plan (tasks auto‑generated)
4) Scheduler seeds occurrences (next 12 months)
5) Notify Owners + Create calendar holds

**WF‑C2 Evidence & Attestation**
- On schedule event → task → owner uploads → attests → auto‑validation → reviewer accepts

**WF‑C3 Testing**
- Plan test (DE/OE) → sample selection → perform → record results → findings

**WF‑C4 Exception Management**
- Create exception → risk acceptance gate → compensating control → expiry/renewal → closure

**WF‑C5 Change Control**
- Change request → impact matrix → approvals → rollout → versioning

---

## 7) Scoring & KPIs | الدرجات والمؤشرات
**Control Effectiveness Score (CES)**
- Inputs: Implementation Status, Latest Test Result, Evidence Freshness, CCM Health
- Formula (example):
  - status_weight = {effective:1, in_progress:0.6, pending:0.2}
  - test_factor = {pass:1, partial:0.6, fail:0}
  - evidence_recency = clamp(1 - age_days/period_days, 0, 1)
  - ccm_factor = {healthy:1, warnings:0.8, critical:0.4, disconnected:0.6}
  - **CES = 100 × status_weight × (0.5*test_factor + 0.3*evidence_recency + 0.2*ccm_factor)**

**Dashboard KPIs**
- % Controls effective (by framework/domain)
- Test coverage (last quarter)
- Overdue attestations / exceptions
- Mean time to remediate (MTTR)

SLAs: Attestation ≤5d from schedule; Test close ≤10d; Exception expiry notifications T‑14/T‑3.

---

## 8) Data Model | نمذجة البيانات
**Tables (key columns)**
- `controls(id, tenant_id, code, title, domain, type, frequency, criticality, objective, assertions, owner_id, backup_owner_id, created_at, updated_at)`
- `framework_control_map(framework_id, section_id, control_id, tenant_id)`
- `control_implementations(id, tenant_id, control_id, owner_id, status, due_date, notes, created_at, updated_at)`
- `control_tests(id, tenant_id, control_id, executed_at, result, notes, sample_plan jsonb)`
- `documents(id, tenant_id, title, doc_type, retention_label, created_by, updated_by, created_at, updated_at)`
- `control_evidence(id, tenant_id, control_id, document_id, linked_at, checklist jsonb)`
- `exceptions(id, tenant_id, control_id, reason, start_date, end_date, status, approver_id)`
- `change_requests(id, tenant_id, control_id, change_json jsonb, reason, status, approvals jsonb)`
- `risks(id, tenant_id, code, title, category)`; `risk_assessments(id, tenant_id, risk_id, likelihood, impact, score, current)`

**Indices & Constraints**: unique(tenant_id, control code); FK with ON DELETE rules; partial indexes on status.

---

## 9) APIs | الواجهات
- `POST /api/controls` create
- `PUT /api/controls/{id}` update (SoD checks)
- `POST /api/controls/{id}/submit-review`
- `POST /api/controls/{id}/approve-design`
- `POST /api/controls/{id}/implementation` plan/update
- `POST /api/controls/{id}/attest` (with evidence links)
- `POST /api/controls/{id}/tests` (plan/execute)
- `POST /api/controls/{id}/exceptions`
- `POST /api/controls/{id}/change-requests`
- `GET /api/controls/{id}/history`

Pagination, filtering by framework/domain/status; all with `tenant_id` and RBAC scopes.

---

## 10) Automations | الأتمتة
**Triggers → Actions**
- `schedule.occurrence` → create task → notify owner → SLA timer
- `evidence.uploaded` → checksum + AV scan → completeness check → mark ready
- `test.failed` → open remediation task (link to risk) → escalate
- `exception.expiring` (T‑14/T‑3) → notify approver/owner
- `connector.down` → CCM status = critical → alert

**AI Scheduler**
- Generate schedule from frequency; avoid holidays; auto‑balance owner load.

**RAG Assist**
- Generate control narrative, test steps, evidence checklist from prior controls/regulatory text.

---

## 11) Security & Audit | الأمان والتدقيق
- Multi‑tenant isolation (RLS on tenant_id)
- RBAC (roles/permissions) + MFA
- Audit trail: every transition/action with diff snapshots
- Evidence WORM storage policy + retention timers

---

## 12) Multitenant Patterns | أنماط تعدد المستأجرين
- **Global Library** of standard controls → per‑tenant **Overrides** (diff tracked)
- Inheritance rules: if global updated, prompt tenants to review/apply

---

## 13) UI Checklists | قوائم تحقق الواجهة
**Create Control Form**
- Required: code, title, objective, domain, type, frequency, owner, criticality
- Optional: risk links, assertions, evidence templates, CCM connector

**Evidence Acceptance** (example)
| Rule | Description |
|---|---|
| Authenticity | checksum/hard‑timestamped export |
| Completeness | contains key fields/screens |
| Relevance | covers control period & population |
| Readability | Arabic/English where applicable |

**Test Template (OE)**
- Objective → Procedure → Population → Sample → Result → Attachments → Sign‑off

---

## 14) Views & Metrics | العروض والمؤشرات
- `v_control_status`: control + latest implementation status + CES
- `v_control_test_coverage`: last 90d tests per domain
- `v_compliance_score_by_framework`: % effective controls
- `v_exception_register`: active exceptions + time to expiry

---

## 15) Adoption Plan | خطة التبنّي
1) Import baseline library (CSV/JSON)
2) Map to frameworks (bulk)
3) Assign owners & frequencies
4) Generate schedules + evidence templates
5) Pilot test on 2 domains → iterate
6) Go‑live with CCM on top 10 critical controls

Go‑Live Readiness: RBAC tested, backup/retention configured, reporting validated, SOD checked.

---

## 16) Appendix | ملاحق
- Coding & Naming: `CTRL-NCA-AC-001`, domains short codes
- SoD Matrix per role
- SLA table per transition

