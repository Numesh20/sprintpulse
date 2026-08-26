# Risk Register & RAID Log

**Project:** SprintPulse Agile Analytics Platform  
**Document Version:** 1.0.0  
**Manager:** Associate IT Project Manager  
**Last Updated:** 2026-08-26  

---

## 1. Risk Management Framework

Risks are assessed using a standard $5 \times 5$ Qualitative Likelihood vs. Impact Matrix:
- **Risk Score = Likelihood (1–5) $\times$ Impact (1–5)**
- **Critical (15–25):** Immediate escalation to PMO & contingency execution.
- **High (10–14):** Active mitigation strategy with bi-weekly check-ins.
- **Medium (5–9):** Monitored during weekly sprint reviews.
- **Low (1–4):** Logged in watch list.

```
       IMPACT ->
   L   1: Insignificant | 2: Minor | 3: Moderate | 4: Major | 5: Severe
   I   ----------------------------------------------------------------
   K 5 | 5 (Med)        | 10 (High)| 15 (Crit)   | 20 (Crit)| 25 (Crit)
   E 4 | 4 (Low)        | 8 (Med)  | 12 (High)   | 16 (Crit)| 20 (Crit)
   L 3 | 3 (Low)        | 6 (Med)  | 9 (Med)     | 12 (High)| 15 (Crit)
   I 2 | 2 (Low)        | 4 (Low)  | 6 (Med)     | 8 (Med)  | 10 (High)
   H 1 | 1 (Low)        | 2 (Low)  | 3 (Low)     | 4 (Low)  | 5 (Med)
```

---

## 2. Active Risk Register (R)

| Risk ID | Category | Risk Description | Likelihood (1-5) | Impact (1-5) | Score | Mitigation Strategy | Contingency Plan | Owner | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **RSK-01** | Technical | Third-party CDN outage (Chart.js / Icons) causes UI rendering failure | 2 | 4 | **8 (Med)** | Implement fallback CSS styles and bundle core assets locally | Serve cached local scripts | Tech Lead | **Mitigated** |
| **RSK-02** | Scope | Feature creep in ceremony tools (e.g. video conferencing in poker) | 4 | 3 | **12 (High)**| Enforce strict MoSCoW prioritization; defer to Phase 2 backlog | PM rejects non-essential change requests | IT PM | **Controlled** |
| **RSK-03** | Schedule | Team members absent during Sprint 2 due to university exams | 3 | 4 | **12 (High)**| Adjust velocity commitment down by 30% in Sprint 2 planning | Re-prioritize critical path stories only | IT PM | **Mitigated** |
| **RSK-04** | Usability | Complex mathematical metric terms confuse non-technical stakeholders | 3 | 3 | **9 (Med)** | Add contextual tooltips, glossaries, and plain-English summary cards | Include a "How to Read this Report" appendix | Lead UX | **Active** |
| **RSK-05** | Data | LocalStorage clearing wipes user retro and custom sprint logs | 2 | 3 | **6 (Med)** | Provide JSON Export / Import backup functionality in UI | Prompt user before clearing browser cache | Full Stack | **Active** |

---

## 3. Assumptions Log (A)

| Assumption ID | Description | Validation Method | Impact if False |
| :--- | :--- | :--- | :--- |
| **ASM-01** | Development squads follow standard 2-week sprint cadences. | User surveys & default UI settings. | High - Would require arbitrary day length configuration. |
| **ASM-02** | User stories are estimated in Fibonacci story points rather than hours. | Agile industry benchmark alignment. | Medium - May require an hours-based calculation toggle. |
| **ASM-03** | End-users access the dashboard primarily via modern evergreen web browsers. | Browser matrix testing (Chrome, Edge, Firefox, Safari). | Low - Polyfills included. |

---

## 4. Issues Log (I)

| Issue ID | Description | Severity | Date Identified | Remediation Action | Owner | Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **ISS-01** | Chart.js canvas blurry on high-DPI Retina screens. | Medium | 2026-08-20 | Set `devicePixelRatio: 2` in canvas rendering configuration. | Lead UI | **Resolved** |
| **ISS-02** | Retrospective upvoting allowed multiple votes from the same user session. | Low | 2026-08-22 | Implement session-based vote limiter in `retrospective.js`. | Full Stack | **Resolved** |

---

## 5. Dependencies Log (D)

| Dep ID | Dependency Description | Dependent On | Critical Path? | Status |
| :--- | :--- | :--- | :---: | :--- |
| **DEP-01** | Design System CSS completion before implementing Ceremony modules | UI/UX Lead | **Yes** | Completed |
| **DEP-02** | Metrics calculation formula validation by Project Sponsor | PMO / Academic Board | **Yes** | Approved |
| **DEP-03** | GitHub Actions workflow configuration for automated Pages deployment | DevOps Engineer | No | In Progress |
