# Project Charter: SprintPulse Agile Analytics Platform

| **Document Identifier** | PC-SP-2026-V1.0 | **Status** | Approved |
| :--- | :--- | :--- | :--- |
| **Project Sponsor** | PMO Director / Academic Supervisor | **Project Manager** | Associate IT Project Manager (APM) |
| **Project Lead** | Lead Software Engineer | **Target Completion** | Q4 2026 / 12 Weeks |

---

## 1. Executive Summary & Business Case

### 1.1 Problem Statement
Modern software engineering teams frequently experience sprint unpredictability, silent scope creep, and team burnout due to fragmented tooling. Traditional project tracking tools (e.g., Jira, Azure DevOps, ClickUp) store vast amounts of raw activity data but lack automated, actionable heuristics to detect early delivery risks, team bottlenecks, and sprint health anomalies in real time.

### 1.2 Proposed Solution
**SprintPulse** is an agile delivery & velocity analytics platform designed for Project Managers, Scrum Masters, and Engineering Leads. It synthesizes sprint metrics (planned vs. actual velocity, burndown trajectory, code review cycle times, and capacity allocation) into a single **Sprint Health Index (0–100)** with automated risk alerts and integrated agile ceremony tools (Planning Poker, Retrospectives, and RAID logs).

### 1.3 Strategic Alignment
- **Agile Maturity:** Elevates team maturity from reactive firefighting to predictive delivery.
- **Cost Reduction:** Reduces delivery slippage by an estimated 25% through early blocker detection.
- **Transparency:** Provides automated executive reporting for non-technical stakeholders.

---

## 2. Project Objectives & Success Criteria (SMART)

| Objective | Metric / KPI | Target |
| :--- | :--- | :--- |
| **1. Sprint Predictability** | $\frac{\text{Completed Story Points}}{\text{Committed Story Points}} \times 100$ | $\ge 85\%$ across 3 consecutive sprints |
| **2. Risk Detection Latency** | Time from blocker emergence to alert trigger | $< 4$ business hours |
| **3. Automated Reporting** | Time spent generating PM stakeholder reports | Reduced from 2 hours to $< 1$ minute |
| **4. User Engagement** | Weekly Active PMs / Scrum Masters utilizing tool | $100\%$ active participation in retros & poker |

---

## 3. Scope Definition

### 3.1 In-Scope (Deliverables)
- **Phase 1: Metrics Engine & Core Dashboard**
  - Interactive Burndown/Burnup visualization with ideal trajectory line.
  - Multi-sprint historical velocity tracking (Moving Average & Predictability ratio).
  - Scope Creep & Volatility Index (% unplanned story points introduced mid-sprint).
  - Team workload distribution heatmap by discipline (Frontend, Backend, QA, DevOps).
- **Phase 2: Automated Risk & Bottleneck Radar**
  - Developer overallocation detection (>100% committed capacity).
  - Code review stagnation alerts (PRs in review > 48 hours).
  - Unestimated blocker and dependency delay indicators.
- **Phase 3: Interactive Agile Ceremony Toolkit**
  - Real-time Sprint Retrospective Board with upvoting & category filtering.
  - Planning Poker estimation module with Fibonacci scale and consensus metrics.
  - Interactive RAID Log (Risks, Assumptions, Issues, Dependencies) with 5x5 Matrix.
- **Phase 4: Executive Stakeholder Export**
  - One-click formatted Markdown/PDF Executive Summary report generation.

### 3.2 Out-of-Scope
- Direct real-time bidirectional Jira database sync (Phase 2 Roadmap).
- Automated timesheet payroll integration.

---

## 4. Stakeholder Matrix & RACI Framework

| Stakeholder Role | Name / Group | Responsibilities | RACI Level |
| :--- | :--- | :--- | :--- |
| **Project Sponsor** | PMO / IT Faculty | Project budget, strategic vision, final sign-off | **A** (Accountable) |
| **Project Manager** | Associate IT PM (Portfolio Author) | Requirements engineering, sprint facilitation, risk tracking | **R** (Responsible) |
| **Tech Lead** | Senior Full-Stack Engineer | Architecture design, code reviews, technical standards | **C** (Consulted) |
| **Scrum Team** | Devs, QA, UI/UX Designer | User story implementation, ceremony participation | **R** (Responsible) |
| **Business Stakeholder**| Product Owners / Clients | Acceptance criteria review, release feedback | **I** (Informed) |

*RACI Legend: **R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed.*

---

## 5. Budget & Resource Allocation (Simulated)

| Expense Category | Planned Allocation (LKR / USD) | Actual (Est.) | Variance |
| :--- | :--- | :--- | :--- |
| **Personnel (PM, Dev, QA - 3 Sprints)** | \$14,500 | \$13,800 | +\$700 |
| **Cloud Hosting & CI/CD Infrastructure** | \$350 | \$280 | +\$70 |
| **Domain, SSL & Security Audits** | \$150 | \$120 | +\$30 |
| **Contingency Reserve (10%)** | \$1,500 | \$500 | +\$1,000 |
| **Total** | **\$16,500** | **\$14,700** | **+\$1,800 (Favorable)** |

---

## 6. Project Constraints & Assumptions

### 6.1 Constraints
- **Timeframe:** 12-week strict academic / internship showcase deadline.
- **Technology:** Must operate as a zero-dependency client application deployable to GitHub Pages for instant recruiter inspection.

### 6.2 Assumptions
- Development teams estimate user stories using Fibonacci sequence (1, 2, 3, 5, 8, 13).
- Standard sprint duration is 2 weeks (10 working days).

---

## 7. Approval & Sign-Off

| Role | Name | Signature / Status | Date |
| :--- | :--- | :--- | :--- |
| **Associate IT Project Manager** | IT PM Candidate | *Digitally Signed* | 2026-08-26 |
| **Project Sponsor / PMO** | Academic PMO Board | *Approved* | 2026-08-26 |
