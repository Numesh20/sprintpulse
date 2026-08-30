/**
 * SprintPulse - Sprint Comparison View
 * Side-by-side comparison of any two sprints from any squad.
 *
 * Panels:
 *   A. Squad/Sprint Selectors  — pick Sprint A and Sprint B independently
 *   B. Sprint Header Cards     — name, goal, dates, team for each sprint
 *   C. Delta KPI Row           — Velocity, Predictability, Scope Creep, PR Hours, Health Score
 *   D. Overlay Burndown Chart  — Sprint A vs Sprint B on the same canvas
 *   E. Velocity Bar Chart      — committed vs completed grouped bars for both sprints
 *   F. Workload Comparison     — member-level SP assigned side by side
 */

const SprintComparison = {
  chartBurndown: null,
  chartVelocity: null,

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  init() {
    this._populateSelectors();
    this.render();
  },

  // ─────────────────────────────────────────────────────────────
  // Populate squad & sprint dropdowns for both sides
  // ─────────────────────────────────────────────────────────────
  _populateSelectors() {
    ['a', 'b'].forEach(side => {
      this._populateSquadSelector(side);
    });
  },

  _populateSquadSelector(side) {
    const squadSel = document.getElementById('cmp-squad-' + side);
    if (!squadSel) return;

    squadSel.innerHTML = Object.values(SPRINT_PULSE_DATA.squads)
      .map(sq => '<option value="' + sq.id + '">' + sq.name + '</option>')
      .join('');

    // Default: A = fintech sprint_4, B = fintech sprint_3
    if (side === 'a') squadSel.value = 'fintech';
    if (side === 'b') squadSel.value = 'fintech';

    this._populateSprintSelector(side);
  },

  _populateSprintSelector(side) {
    const squadSel  = document.getElementById('cmp-squad-' + side);
    const sprintSel = document.getElementById('cmp-sprint-' + side);
    if (!squadSel || !sprintSel) return;

    const squad = SPRINT_PULSE_DATA.squads[squadSel.value];
    if (!squad) return;

    sprintSel.innerHTML = Object.values(squad.sprints)
      .map(sp => '<option value="' + sp.id + '">' + sp.name + '</option>')
      .join('');

    // Default B to sprint_3 for meaningful diff
    if (side === 'b') {
      const ids = Object.keys(squad.sprints);
      if (ids.length > 1) sprintSel.value = ids[1];
    }
  },

  onSquadChange(side) {
    this._populateSprintSelector(side);
    this.render();
  },

  onSprintChange() {
    this.render();
  },

  // ─────────────────────────────────────────────────────────────
  // Get selected sprint data for a side
  // ─────────────────────────────────────────────────────────────
  _getSprint(side) {
    const squadSel  = document.getElementById('cmp-squad-'  + side);
    const sprintSel = document.getElementById('cmp-sprint-' + side);
    if (!squadSel || !sprintSel) return null;

    const squad  = SPRINT_PULSE_DATA.squads[squadSel.value];
    if (!squad) return null;
    const sprint = squad.sprints[sprintSel.value];
    if (!sprint) return null;

    return { squad, sprint };
  },

  // ─────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────
  render() {
    const A = this._getSprint('a');
    const B = this._getSprint('b');
    if (!A || !B) return;

    this._renderHeaders(A, B);
    this._renderKPIDelta(A, B);
    this._renderBurndownChart(A, B);
    this._renderVelocityChart(A, B);
    this._renderWorkloadTable(A, B);
  },

  // ─────────────────────────────────────────────────────────────
  // A. Sprint Header Cards
  // ─────────────────────────────────────────────────────────────
  _renderHeaders(A, B) {
    ['a', 'b'].forEach((side, i) => {
      const data = i === 0 ? A : B;
      const el   = document.getElementById('cmp-header-' + side);
      if (!el) return;

      const sp = data.sprint;
      const sq = data.squad;
      const pct = sp.committedPoints
        ? Math.round((sp.completedPoints / sp.committedPoints) * 100)
        : 0;

      el.innerHTML = `
        <div class="cmp-header-badge ${side === 'a' ? 'cmp-badge-a' : 'cmp-badge-b'}">
          Sprint ${side.toUpperCase()}
        </div>
        <div class="cmp-header-squad">${sq.name}</div>
        <div class="cmp-header-sprint">${sp.name}</div>
        <div class="cmp-header-goal">"${sp.goal || 'No goal defined'}"</div>
        <div class="cmp-header-meta">
          <span>${sp.startDate || '—'} to ${sp.endDate || '—'}</span>
          <span>Day ${sp.currentDay} of ${sp.totalDays}</span>
          <span>${pct}% complete</span>
        </div>`;
    });
  },

  // ─────────────────────────────────────────────────────────────
  // B. Delta KPI Row
  // ─────────────────────────────────────────────────────────────
  _renderKPIDelta(A, B) {
    const sa = A.sprint, sb = B.sprint;

    const velA = sa.completedPoints;
    const velB = sb.completedPoints;

    const predA = sa.committedPoints ? Math.round((sa.completedPoints / sa.committedPoints) * 100) : 0;
    const predB = sb.committedPoints ? Math.round((sb.completedPoints / sb.committedPoints) * 100) : 0;

    const scopeA = sa.addedPointsMidSprint || 0;
    const scopeB = sb.addedPointsMidSprint || 0;

    const prA = sa.workload
      ? (sa.workload.reduce((s, m) => s + (m.assignedSP || 0), 0) / (sa.workload.length || 1)).toFixed(1)
      : 'N/A';
    const prB = sb.workload
      ? (sb.workload.reduce((s, m) => s + (m.assignedSP || 0), 0) / (sb.workload.length || 1)).toFixed(1)
      : 'N/A';

    // Sprint Health (simplified)
    const healthA = Math.min(100, Math.round(predA * 0.5 + (scopeA === 0 ? 20 : 5) + (velA > 30 ? 30 : velA)));
    const healthB = Math.min(100, Math.round(predB * 0.5 + (scopeB === 0 ? 20 : 5) + (velB > 30 ? 30 : velB)));

    const kpis = [
      { label: 'Velocity (SP)', a: velA,    b: velB,    unit: 'SP',  higherBetter: true  },
      { label: 'Predictability', a: predA,  b: predB,   unit: '%',   higherBetter: true  },
      { label: 'Scope Creep',    a: scopeA, b: scopeB,  unit: 'SP',  higherBetter: false },
      { label: 'Avg Load / Dev', a: prA,    b: prB,     unit: 'SP',  higherBetter: false },
      { label: 'Health Index',   a: healthA,b: healthB, unit: '/100',higherBetter: true  },
    ];

    const container = document.getElementById('cmp-kpi-row');
    if (!container) return;

    container.innerHTML = kpis.map(k => {
      const numA   = parseFloat(k.a);
      const numB   = parseFloat(k.b);
      const delta  = numA - numB;
      const absDelta = Math.abs(delta).toFixed(delta % 1 === 0 ? 0 : 1);
      const improved = k.higherBetter ? delta > 0 : delta < 0;
      const same     = delta === 0;
      const deltaClass = same ? 'cmp-delta--same' : improved ? 'cmp-delta--better' : 'cmp-delta--worse';
      const arrow    = same ? '' : (improved ? '▲' : '▼');

      return `
        <div class="cmp-kpi-card">
          <div class="cmp-kpi-label">${k.label}</div>
          <div class="cmp-kpi-values">
            <div class="cmp-kpi-val cmp-val-a">${k.a}${k.unit}</div>
            <div class="cmp-kpi-sep">vs</div>
            <div class="cmp-kpi-val cmp-val-b">${k.b}${k.unit}</div>
          </div>
          <div class="cmp-delta ${deltaClass}">
            ${arrow} ${same ? 'No change' : (improved ? 'Sprint A better by ' : 'Sprint A worse by ') + absDelta + k.unit}
          </div>
        </div>`;
    }).join('');
  },

  // ─────────────────────────────────────────────────────────────
  // C. Overlay Burndown Chart
  // ─────────────────────────────────────────────────────────────
  _renderBurndownChart(A, B) {
    const canvas = document.getElementById('cmp-burndown-chart');
    if (!canvas) return;

    if (this.chartBurndown) { this.chartBurndown.destroy(); this.chartBurndown = null; }

    const bdA = A.sprint.dailyBurndown || [];
    const bdB = B.sprint.dailyBurndown || [];
    const maxDays = Math.max(bdA.length, bdB.length);

    const labels   = Array.from({ length: maxDays }, (_, i) => 'Day ' + (i + 1));
    const actualA  = bdA.map(d => d.actual);
    const actualB  = bdB.map(d => d.actual);
    const idealA   = bdA.map(d => d.ideal);

    this.chartBurndown = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sprint A — ' + A.sprint.name.split(':')[0],
            data: actualA,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
            tension: 0.3,
            fill: false,
            spanGaps: false
          },
          {
            label: 'Sprint B — ' + B.sprint.name.split(':')[0],
            data: actualB,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6,182,212,0.1)',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#06b6d4',
            tension: 0.3,
            fill: false,
            spanGaps: false
          },
          {
            label: 'Ideal Burndown (A)',
            data: idealA,
            borderColor: 'rgba(255,255,255,0.2)',
            borderDash: [5, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            spanGaps: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.75)',
            borderColor: 'rgba(99,102,241,0.4)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Remaining SP', color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
          }
        }
      }
    });
  },

  // ─────────────────────────────────────────────────────────────
  // D. Velocity Bar Chart
  // ─────────────────────────────────────────────────────────────
  _renderVelocityChart(A, B) {
    const canvas = document.getElementById('cmp-velocity-chart');
    if (!canvas) return;

    if (this.chartVelocity) { this.chartVelocity.destroy(); this.chartVelocity = null; }

    const labels   = ['Committed SP', 'Completed SP', 'Predictability %', 'Scope Added'];
    const sa = A.sprint, sb = B.sprint;

    const predA = sa.committedPoints ? Math.round((sa.completedPoints / sa.committedPoints) * 100) : 0;
    const predB = sb.committedPoints ? Math.round((sb.completedPoints / sb.committedPoints) * 100) : 0;

    this.chartVelocity = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Sprint A — ' + sa.name.split(':')[0],
            data: [sa.committedPoints, sa.completedPoints, predA, sa.addedPointsMidSprint || 0],
            backgroundColor: 'rgba(99,102,241,0.75)',
            borderColor:     '#6366f1',
            borderWidth:     1.5,
            borderRadius:    6
          },
          {
            label: 'Sprint B — ' + sb.name.split(':')[0],
            data: [sb.committedPoints, sb.completedPoints, predB, sb.addedPointsMidSprint || 0],
            backgroundColor: 'rgba(6,182,212,0.75)',
            borderColor:     '#06b6d4',
            borderWidth:     1.5,
            borderRadius:    6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#fff',
            bodyColor:  'rgba(255,255,255,0.75)',
            borderColor:'rgba(99,102,241,0.4)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.55)', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            ticks: { color: 'rgba(255,255,255,0.55)', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.05)' },
            beginAtZero: true
          }
        }
      }
    });
  },

  // ─────────────────────────────────────────────────────────────
  // E. Workload Table
  // ─────────────────────────────────────────────────────────────
  _renderWorkloadTable(A, B) {
    const container = document.getElementById('cmp-workload-table');
    if (!container) return;

    const wlA = A.sprint.workload || [];
    const wlB = B.sprint.workload || [];
    const maxRows = Math.max(wlA.length, wlB.length);

    if (maxRows === 0) {
      container.innerHTML = '<div class="sb-empty-state">No workload data available for selected sprints.</div>';
      return;
    }

    const barWidth = (sp, cap) => {
      if (!cap || cap === 0) return 0;
      return Math.min(100, Math.round((sp / cap) * 100));
    };
    const barColor = (sp, cap) => {
      const r = cap > 0 ? sp / cap : 0;
      if (r > 1.1)  return 'var(--accent-red, #f87171)';
      if (r > 0.9)  return 'var(--accent-amber)';
      return 'var(--accent-green)';
    };

    let rows = '';
    for (let i = 0; i < maxRows; i++) {
      const mA = wlA[i];
      const mB = wlB[i];

      const cellA = mA
        ? `<div class="cmp-wl-name">${mA.name}</div>
           <div class="cmp-wl-bar-wrap">
             <div class="cmp-wl-bar" style="width:${barWidth(mA.assignedSP, mA.capacitySP)}%;background:${barColor(mA.assignedSP, mA.capacitySP)};"></div>
           </div>
           <div class="cmp-wl-sp">${mA.assignedSP}/${mA.capacitySP} SP</div>`
        : '<div class="cmp-wl-empty">—</div>';

      const cellB = mB
        ? `<div class="cmp-wl-name">${mB.name}</div>
           <div class="cmp-wl-bar-wrap">
             <div class="cmp-wl-bar" style="width:${barWidth(mB.assignedSP, mB.capacitySP)}%;background:${barColor(mB.assignedSP, mB.capacitySP)};"></div>
           </div>
           <div class="cmp-wl-sp">${mB.assignedSP}/${mB.capacitySP} SP</div>`
        : '<div class="cmp-wl-empty">—</div>';

      rows += `
        <div class="cmp-wl-row">
          <div class="cmp-wl-cell cmp-wl-cell-a">${cellA}</div>
          <div class="cmp-wl-divider"></div>
          <div class="cmp-wl-cell cmp-wl-cell-b">${cellB}</div>
        </div>`;
    }

    container.innerHTML = `
      <div class="cmp-wl-header">
        <div class="cmp-wl-header-a">Sprint A Workload</div>
        <div class="cmp-wl-header-b">Sprint B Workload</div>
      </div>
      ${rows}`;
  },

  // ─────────────────────────────────────────────────────────────
  // Refresh selectors after new custom squads are added
  // ─────────────────────────────────────────────────────────────
  refreshSelectors() {
    ['a', 'b'].forEach(side => this._populateSquadSelector(side));
  }
};
