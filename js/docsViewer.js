/**
 * SprintPulse - In-App PM Documentation & Artifacts Explorer
 * Renders repository documentation directly inside the dashboard UI
 */

const SprintDocsViewer = {
  docs: {
    charter: {
      title: '01. Project Charter',
      icon: 'file-text',
      content: `
# Project Charter: SprintPulse Agile Analytics Platform

| **Document Identifier** | PC-SP-2026-V1.0 | **Status** | Approved |
| :--- | :--- | :--- | :--- |
| **Project Sponsor** | PMO Director / Academic Supervisor | **Project Manager** | Associate IT Project Manager (APM) |
| **Project Lead** | Lead Software Engineer | **Target Completion** | Q4 2026 / 12 Weeks |

## 1. Executive Summary & Business Case
Modern software engineering teams frequently experience sprint unpredictability, silent scope creep, and team burnout due to fragmented tooling. Traditional project tracking tools store raw activity data but lack automated heuristics to detect early delivery risks, team bottlenecks, and sprint health anomalies in real time.

**SprintPulse** synthesizes sprint metrics (planned vs. actual velocity, burndown trajectory, code review cycle times, and capacity allocation) into a single **Sprint Health Index (0–100)** with automated risk alerts and integrated agile ceremony tools.

## 2. Project Objectives & Success Criteria (SMART)
- **Sprint Predictability:** (Completed SP / Committed SP) * 100 >= 85% across 3 consecutive sprints.
- **Risk Detection Latency:** Time from blocker emergence to alert trigger < 4 business hours.
- **Automated Reporting:** Time spent generating PM stakeholder reports reduced from 2 hours to < 1 minute.

## 3. RACI Framework
- **Project Sponsor:** Accountable (A)
- **Associate IT PM:** Responsible (R)
- **Tech Lead:** Consulted (C)
- **Scrum Team:** Responsible (R)
- **Business Stakeholder:** Informed (I)
      `
    },
    prd: {
      title: '02. Product Requirements (PRD)',
      icon: 'layers',
      content: `
# Product Requirements Document (PRD)

## Target User Personas
1. **Sarah Perera (Associate IT Project Manager):** Wants to track velocity, identify blockers early, and generate stakeholder reports in minutes.
2. **Kasun Jayasinghe (Agile Scrum Master):** Wants objective data during Daily Standups and Retrospectives to facilitate constructive discussions.
3. **Ruwan Silva (VP of Engineering):** Needs high-level delivery health score across project squads.

## Functional Requirements (MoSCoW)
- **FR-01 (Sprint Health Score):** Compute composite 0-100 index based on burndown adherence, predictability, scope creep, and review bottlenecks.
- **FR-02 (Burndown & Burnup):** Real-time daily tracking with ideal linear guideline vs. actual story points.
- **FR-03 (Velocity Trend):** Multi-sprint comparison of committed vs completed velocity.
- **FR-04 (Risk Radar):** Automated heuristic alert detector for resource overload and stagnant PRs.
- **FR-05 (Ceremony Tools):** Interactive Sprint Retrospectives, Fibonacci Planning Poker, and RAID Register.
      `
    },
    architecture: {
      title: '03. System Architecture & C4',
      icon: 'cpu',
      content: `
# System Architecture & Technical Specifications

## Architecture Principles
- **Zero Build / Zero Backend Overhead:** Direct client-side single-page architecture deployable instantly to GitHub Pages.
- **Modular Business Logic:** Decoupled calculation modules (\`metrics.js\`, \`riskEngine.js\`, \`charts.js\`).
- **Responsive Visualizations:** Powered by Chart.js 4.x with custom gradients and dark-mode glassmorphism.
- **Local Persistence:** Retrospective cards, custom sprint edits, and RAID log items persist via Web Storage API (\`localStorage\`).

## Metrics Formulation
$$\\text{Velocity} = \\sum \\text{Completed Story Points}$$
$$\\text{Predictability} = \\min\\left(100, \\frac{\\text{Completed SP}}{\\text{Committed SP}} \\times 100\\right)$$
$$\\text{Scope Creep \\%} = \\left(\\frac{\\text{Points Added Mid-Sprint}}{\\text{Committed SP}}\\right) \\times 100$$
      `
    },
    raid: {
      title: '04. Risk Register (RAID Log)',
      icon: 'shield-alert',
      content: `
# Risk Register & RAID Governance Framework

## Qualitative Scoring Matrix (5x5)
- **Critical (15–25):** Immediate escalation to PMO & contingency execution.
- **High (10–14):** Active mitigation strategy with bi-weekly check-ins.
- **Medium (5–9):** Monitored during weekly sprint reviews.
- **Low (1–4):** Logged in watch list.

## Active Risks
1. **RSK-01 (Technical):** CDN asset degradation -> *Mitigated via local fallbacks.*
2. **RSK-02 (Scope):** Unapproved mid-sprint feature requests -> *Controlled via MoSCoW change request triage.*
3. **RSK-03 (Schedule):** Team exams during Sprint 2 -> *Mitigated by lowering sprint commitment by 30%.*
      `
    },
    wbs: {
      title: '05. WBS & Release Roadmap',
      icon: 'calendar',
      content: `
# Work Breakdown Structure (WBS) & 12-Week Roadmap

## 1.0 SprintPulse Platform WBS
- **1.1 Initiation:** Charter, RACI Matrix, PRD, Stakeholder Map
- **1.2 Architecture:** C4 models, Design Tokens, Mathematical engine
- **1.3 Core Engineering:** Burndown canvas, Risk Radar, Ceremony tools, Executive exporter
- **1.4 QA & Delivery:** Usability audit, CI/CD GitHub Pages deployment
- **1.5 Portfolio Packaging:** Executive briefing, GitHub Readme, LinkedIn showcase

## Critical Path
Initiation (2w) -> Architecture (2w) -> Core Metrics Engine (2w) -> Ceremony Suite (2w) -> QA & Launch (1w) = **9 Weeks** (with 3-week buffer).
      `
    },
    sprintReports: {
      title: '06. Sprint 1 & 2 Retrospective Reports',
      icon: 'check-circle',
      content: `
# Sprint Delivery Reports Summary

## Sprint 01: Core Architecture & Metrics
- **Committed:** 42 SP | **Completed:** 38 SP | **Predictability:** 90.4%
- **Key Outcome:** Foundational mathematical calculation engine and canvas burndown completed. 4 SP carried over due to high-DPI canvas fix.

## Sprint 02: Ceremony Suite & Risk Radar
- **Committed:** 45 SP | **Completed:** 43 SP | **Predictability:** 95.5%
- **Key Outcome:** Planning Poker and Retrospective interactive boards delivered. Instituted daily 15-min PR triage block to resolve review stagnation.
      `
    }
  },

  activeDocKey: 'charter',

  init() {
    this.renderSidebar();
    this.renderDoc(this.activeDocKey);
  },

  renderSidebar() {
    const sidebar = document.getElementById('docs-sidebar-nav');
    if (!sidebar) return;

    sidebar.innerHTML = Object.entries(this.docs).map(([key, doc]) => `
      <button class="docs-nav-btn ${this.activeDocKey === key ? 'active' : ''}" onclick="SprintDocsViewer.renderDoc('${key}')">
        <span>${doc.title}</span>
      </button>
    `).join('');
  },

  renderDoc(key) {
    this.activeDocKey = key;
    this.renderSidebar();
    const body = document.getElementById('docs-markdown-content');
    if (!body) return;

    const doc = this.docs[key];
    if (!doc) return;

    // Simple markdown-to-HTML parser for documentation viewing
    body.innerHTML = this.parseSimpleMarkdown(doc.content);
  },

  parseSimpleMarkdown(md) {
    if (!md) return '';

    // 1. Process Tables first
    const lines = md.trim().split('\n');
    let inTable = false;
    let tableHtml = '';
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table><thead>';
          const headers = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableHtml += '<tr>' + headers.map(h => `<th>${h.trim()}</th>`).join('') + '</tr></thead><tbody>';
          // Skip the divider line (| :--- | :--- |) if present next
          if (i + 1 < lines.length && lines[i + 1].includes('---')) {
            i++;
          }
        } else {
          const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableHtml += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table>';
          processedLines.push(tableHtml);
          inTable = false;
          tableHtml = '';
        }
        processedLines.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</tbody></table>';
      processedLines.push(tableHtml);
    }

    let text = processedLines.join('\n');

    // 2. Headings and basic syntax
    text = text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--primary); padding-left: 1rem; color: var(--text-secondary); margin: 1rem 0;">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^- (.*$)/gim, '<li>$1</li>');

    // Wrap list items in ul
    text = text.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

    return `<p>${text}</p>`;
  }
};
