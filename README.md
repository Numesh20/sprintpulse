# SprintPulse: Agile Velocity & Team Health Analytics Platform

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)
![Agile Framework](https://img.shields.io/badge/Agile-Scrum%20%26%20Kanban-cyan.svg)
![Documentation](https://img.shields.io/badge/PM%20Docs-100%25%20Complete-emerald.svg)
![Deployment](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%2F%20Vercel-blue.svg)
![Academic Affiliation](https://img.shields.io/badge/Faculty%20of%20Applied%20Sciences-SUSL-orange.svg)

**An enterprise-grade Agile Project Management & Sprint Analytics Dashboard engineered for Associate IT Project Managers, Scrum Masters, and Engineering Leads.**

[View Live Interactive Demo](https://Numesh20.github.io/sprintpulse) &bull; [Read PM Documentation Suite](#it-project-management-documentation-suite) &bull; [Explore Features](#key-features--capabilities)

</div>

---

## Executive Summary & Project Overview

Modern software engineering teams frequently experience sprint unpredictability, silent scope creep, and team burnout due to fragmented tracking tools. **SprintPulse** bridges the gap between raw development activity and actionable project management governance.

Built by an IT undergraduate at the **Sabaragamuwa University of Sri Lanka (SUSL)** pursuing an **Associate IT Project Manager (APM) / Scrum Master** internship, this repository serves as a dual showcase of:
1. **A fully functional, interactive client-side web application** providing real-time burndown tracking, velocity analysis, automated risk detection, planning poker, and retrospective boards.
2. **A complete, enterprise-grade IT Project Management Documentation Suite** modeled after PMI/PMBOK and Agile standards.

---

## IT Project Management Documentation Suite

The complete project lifecycle documentation is maintained under the [`/docs`](docs/) directory:

| Document | Description | Key PM Artifacts Included |
| :--- | :--- | :--- |
| **[01. Project Charter](docs/01_PROJECT_CHARTER.md)** | Strategic business case & initiation | SMART Objectives, RACI Matrix, Budget & Resource Simulation |
| **[02. Product Requirements (PRD)](docs/02_PRODUCT_REQUIREMENTS_PRD.md)** | Detailed functional & non-functional specs | User Personas, MoSCoW Prioritization, Gherkin Acceptance Criteria |
| **[03. System Architecture](docs/03_SYSTEM_ARCHITECTURE.md)** | Technical design & data flows | Mermaid.js C4 Container Diagrams, Mathematical Metric Models |
| **[04. Risk Register (RAID Log)](docs/04_RISK_REGISTER_RAID.md)** | Enterprise risk governance | 5 x 5 Likelihood vs. Impact Matrix, Mitigation & Contingency Plans |
| **[05. WBS & Release Roadmap](docs/05_WBS_AND_ROADMAP.md)** | Delivery schedule & decomposition | 4-Level Work Breakdown Structure, Critical Path, Mermaid Gantt Chart |
| **[06. Sprint 01 Delivery Report](docs/sprints/sprint_01_report.md)** | Sprint 1 review & retro | Velocity Predictability (90.4%), Burndown analysis, Action items |
| **[07. Sprint 02 Delivery Report](docs/sprints/sprint_02_report.md)** | Sprint 2 review & retro | Velocity Predictability (95.5%), PR review swarm intervention |

---

## Key Features & Capabilities

### 1. Real-Time Agile Metrics & Analytics Engine
- **Composite Sprint Health Index (0–100):** Weighted algorithm evaluating burndown adherence, predictability, scope volatility, and review bottlenecks.
- **Interactive Daily Burndown & Burnup Canvas:** Visualizes Ideal Guideline vs. Actual Remaining Story Points with day-by-day milestone tooltips.
- **Multi-Sprint Historical Velocity Trend:** Tracks team velocity and predictability ratios across consecutive sprints.
- **Scope Creep / Volatility Index:** Automatically flags unapproved mid-sprint backlog additions.

### 2. Automated Delivery Risk & Bottleneck Radar
- **Resource Overallocation Detection:** Flags developers assigned >100% of their sprint capacity threshold.
- **Code Review Bottleneck Alerts:** Identifies Pull Requests stagnating in review for >48 consecutive hours.
- **Actionable PM Recommendations:** Provides instant, context-aware remediation steps for the project manager.

### 3. Integrated Agile Ceremony Toolkit
- **Interactive Retrospective Board:** 3-column board (*What Went Well*, *What Needs Improvement*, *Action Items*) with real-time upvoting and local persistence.
- **Planning Poker Story Point Estimator:** Interactive Fibonacci deck (1, 2, 3, 5, 8, 13, 21, ?, Pass) with simulated squad voting and consensus calculation.
- **Interactive RAID Log Manager:** Filterable register with 5 x 5 Likelihood x Impact scoring and modal entry forms.

### 4. Executive Stakeholder Report Generator
- **One-Click Markdown Briefing:** Instant copyable executive summary formatted for Slack, MS Teams, or Email.
- **Print-to-PDF Ready:** Clean, executive-ready printable layout for client and steering committee meetings.

### 5. Multi-Squad Preloaded Datasets
- **Fintech Core Banking Squad:** Strict compliance, high predictability.
- **E-Commerce Mobile Squad:** Fast release cadence, high scope volatility.
- **Enterprise SaaS AI Platform Squad:** Research spikes, review bottlenecks.

---

## Technology Stack & Architecture

- **Frontend Core:** Semantic HTML5, Vanilla JavaScript (ES6+ Modules), CSS3 (Modern Glassmorphism & Custom Design Tokens).
- **Data Visualization:** [Chart.js 4.x](https://www.chartjs.org/) with responsive high-DPI canvas scaling.
- **Iconography & Styling:** [Google Fonts](https://fonts.google.com/) (Plus Jakarta Sans & JetBrains Mono), Pure CSS Variables.
- **Zero-Build Architecture:** Runs natively in any modern evergreen browser without requiring Node.js or compiler toolchains.
- **Deployment:** GitHub Pages and Vercel ready with automated GitHub Actions CI/CD pipeline.

---

## Repository Directory Layout

```text
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── user_story.md             # Agile story template with Gherkin scenarios
│   │   ├── bug_report.md             # QA defect submission template
│   │   └── risk_escalation.md        # RAID item escalation template
│   └── workflows/
│       └── deploy.yml                # Automated GitHub Pages CI/CD workflow
├── docs/
│   ├── 01_PROJECT_CHARTER.md         # Business case, RACI matrix, objectives
│   ├── 02_PRODUCT_REQUIREMENTS_PRD.md# User stories, personas, functional specs
│   ├── 03_SYSTEM_ARCHITECTURE.md     # C4 models, data flow, mathematical formulas
│   ├── 04_RISK_REGISTER_RAID.md      # 5x5 Likelihood x Impact scoring register
│   ├── 05_WBS_AND_ROADMAP.md         # 4-Level WBS & Gantt timeline
│   └── sprints/
│       ├── sprint_01_report.md       # Sprint 1 delivery & retro report
│       └── sprint_02_report.md       # Sprint 2 delivery & retro report
├── css/
│   ├── style.css                     # Core design tokens, dark/light theme, typography
│   └── components.css                # Glassmorphic cards, charts, modals, badges
├── js/
│   ├── data.js                       # Multi-squad sprint datasets
│   ├── metrics.js                    # Velocity, burndown, and health score calculations
│   ├── charts.js                     # Chart.js canvas rendering
│   ├── riskEngine.js                 # Heuristic risk detector
│   ├── retrospective.js              # Retrospective board logic & persistence
│   ├── planningPoker.js              # Planning poker estimation logic
│   ├── raidManager.js                # RAID log manager logic
│   ├── exportReport.js               # Executive briefing generator
│   ├── docsViewer.js                 # In-app PM documentation reader
│   └── app.js                        # App bootstrap & event coordination
├── index.html                        # Single Page Application
├── vercel.json                       # Vercel deployment configuration
├── LICENSE                           # MIT License
└── README.md                         # Portfolio README
```

---

## How to Run Locally

Because this project uses a clean client-side architecture with zero build dependencies, running it is effortless:

### Method 1: Direct Browser Launch
1. Clone the repository:
   ```bash
   git clone https://github.com/Numesh20/sprintpulse.git
   ```
2. Double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local Static Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js npx
npx serve .
```
Navigate to `http://localhost:8000`.

---

## Deploying to Your GitHub Pages (1-Click)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SprintPulse PM portfolio project"
   git branch -M main
   git remote add origin https://github.com/Numesh20/sprintpulse.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch** (`main` / root).

---

## Author & Acknowledgments

**Undergraduate Student (3rd Year)**  
*BSc (Hons) in Information Technology*  
**Sabaragamuwa University of Sri Lanka (SUSL)**  

*Aspiring Associate IT Project Manager / Scrum Master / Agile Delivery Specialist.*  
*Passionate about bridging technology, agile execution, and data-driven project governance.*

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
