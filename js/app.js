/**
 * SprintPulse - Application Controller & Bootstrap
 * Orchestrates navigation, state synchronization, modals, and reactive rendering
 */

const App = {
  currentTab: 'dashboard',
  theme: 'dark',

  init() {
    this.bindEvents();
    this.loadTheme();
    this.updateDashboard();
    SprintBoard.init();
    MonteCarloSimulator.init();
    KanbanAnalytics.init();
    SprintPlanningPoker.init();
    SprintRetrospective.render();
    SprintRAIDManager.render();
    SprintDocsViewer.init();
  },

  bindEvents() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = tab.dataset.tab;
        this.switchTab(target);
      });
    });

    // Dataset / Squad Selector
    const squadSelect = document.getElementById('squad-select');
    if (squadSelect) {
      squadSelect.addEventListener('change', (e) => {
        SPRINT_PULSE_DATA.activeSquadId = e.target.value;
        SPRINT_PULSE_DATA.activeSprintId = 'sprint_4'; // Reset to sprint 4 default
        this.updateSprintOptions();
        this.updateDashboard();
        SprintBoard.render();
        MonteCarloSimulator.runSimulation();
        KanbanAnalytics.render();
        this.showToast(`Switched squad to ${SPRINT_PULSE_DATA.squads[e.target.value].name}`, 'info');
      });
    }

    // Sprint Selector
    const sprintSelect = document.getElementById('sprint-select');
    if (sprintSelect) {
      sprintSelect.addEventListener('change', (e) => {
        SPRINT_PULSE_DATA.activeSprintId = e.target.value;
        this.updateDashboard();
        SprintBoard.render();
        MonteCarloSimulator.runSimulation();
        KanbanAnalytics.render();
        this.showToast(`Active sprint updated: ${e.target.value}`, 'info');
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active tab buttons
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    // Update tab content panes
    document.querySelectorAll('.tab-content').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Lazy triggers for active views
    if (tabId === 'dashboard') {
      this.updateDashboard();
    } else if (tabId === 'board') {
      SprintBoard.render();
    } else if (tabId === 'forecasting') {
      MonteCarloSimulator.runSimulation();
    } else if (tabId === 'kanban') {
      KanbanAnalytics.render();
    } else if (tabId === 'retrospective') {
      SprintRetrospective.render();
    } else if (tabId === 'poker') {
      SprintPlanningPoker.init();
    } else if (tabId === 'raid') {
      SprintRAIDManager.render();
    } else if (tabId === 'report') {
      SprintExportReport.renderReportView();
    } else if (tabId === 'docs') {
      SprintDocsViewer.init();
    }
  },

  updateSprintOptions() {
    const sprintSelect = document.getElementById('sprint-select');
    if (!sprintSelect) return;

    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    sprintSelect.innerHTML = Object.entries(squad.sprints).map(([id, s]) => `
      <option value="${id}" ${SPRINT_PULSE_DATA.activeSprintId === id ? 'selected' : ''}>${s.name}</option>
    `).join('');
  },

  updateDashboard() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    if (!sprint) return;

    const kpis = SprintMetrics.calculateSprintKPIs(sprint);
    const risks = SprintRiskEngine.evaluateSprintRisks(sprint);

    // 1. Update Sprint Banner Info
    const bannerTitle = document.getElementById('banner-sprint-title');
    const bannerGoal = document.getElementById('banner-sprint-goal');
    const bannerDates = document.getElementById('banner-sprint-dates');
    if (bannerTitle) bannerTitle.textContent = sprint.name;
    if (bannerGoal) bannerGoal.textContent = `"${sprint.goal}"`;
    if (bannerDates) bannerDates.textContent = `${sprint.startDate} to ${sprint.endDate} (Day ${sprint.currentDay} of ${sprint.totalDays})`;

    // 2. Update KPI Widgets
    this.updateKPIElement('kpi-health-score', kpis.healthScore.value);
    this.updateKPIElement('kpi-health-status', kpis.healthScore.status);
    this.updateHealthRadial(kpis.healthScore.value, kpis.healthScore.statusClass);

    this.updateKPIElement('kpi-velocity-val', `${kpis.completed} / ${kpis.committed}`);
    this.updateKPIElement('kpi-predictability-val', `${kpis.predictability}%`);
    this.updateKPIElement('kpi-scope-creep-val', `+${kpis.scopeCreepIndex}%`);
    this.updateKPIElement('kpi-cycle-time-val', `${kpis.avgReviewHours}h`);

    // 3. Render Risk Radar Banner
    this.renderRiskRadar(risks);

    // 4. Render Team Workload Heatmap List
    this.renderWorkloadList(sprint.workload);

    // 5. Render Charts
    setTimeout(() => {
      SprintCharts.renderBurndown('chart-burndown-canvas', sprint);
      SprintCharts.renderVelocityTrend('chart-velocity-canvas', sprint.historicalVelocity);
      SprintCharts.renderCycleTime('chart-cycle-canvas', sprint.tasks);
    }, 50);
  },

  updateKPIElement(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  updateHealthRadial(score, statusClass) {
    const circle = document.getElementById('health-radial-circle');
    if (!circle) return;

    // Circumference = 2 * PI * 40 = 251.2
    const offset = 251.2 - (score / 100) * 251.2;
    circle.style.strokeDashoffset = offset;

    if (statusClass === 'danger') circle.style.stroke = '#f43f5e';
    else if (statusClass === 'warning') circle.style.stroke = '#f59e0b';
    else circle.style.stroke = '#10b981';
  },

  renderRiskRadar(risks) {
    const container = document.getElementById('risk-radar-items');
    if (!container) return;

    container.innerHTML = risks.map(r => `
      <div class="risk-alert-card">
        <div class="risk-alert-icon ${r.type}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            ${r.type === 'critical' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'}
          </svg>
        </div>
        <div class="risk-alert-content">
          <div class="risk-alert-title">${r.title}</div>
          <div class="risk-alert-desc">${r.desc}</div>
          <div style="font-size: 0.72rem; color: var(--primary); margin-top: 0.25rem; font-weight: 600;">
            Action: ${r.recommendation}
          </div>
        </div>
      </div>
    `).join('');
  },

  renderWorkloadList(workload) {
    const container = document.getElementById('workload-list-container');
    if (!container || !workload) return;

    container.innerHTML = workload.map(dev => {
      const pct = Math.min(130, Math.round((dev.assignedSP / dev.capacitySP) * 100));
      const isOverloaded = dev.assignedSP > dev.capacitySP;
      const fillColor = isOverloaded ? 'var(--status-critical)' : pct >= 90 ? 'var(--status-warning)' : 'var(--primary)';

      return `
        <div class="workload-item">
          <div class="workload-top">
            <div class="workload-dev">
              <div class="dev-avatar">${dev.name.split(' ').map(n => n[0]).join('')}</div>
              <span>${dev.name}</span>
            </div>
            <div class="workload-stats">
              <strong>${dev.assignedSP}</strong> / ${dev.capacitySP} SP (${pct}%)
            </div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${Math.min(100, pct)}%; background: ${fillColor};"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('sprint_pulse_theme', this.theme);
    this.updateDashboard();
  },

  loadTheme() {
    const saved = localStorage.getItem('sprint_pulse_theme') || 'dark';
    this.theme = saved;
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="kpi-badge badge-neutral" style="font-size: 0.65rem;">${type.toUpperCase()}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Auto bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => App.init());
