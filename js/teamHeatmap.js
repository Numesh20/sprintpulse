/**
 * SprintPulse - Team Performance Heatmap
 * Visualises story-point utilisation per developer across every sprint
 * for the selected squad.
 *
 * Panels:
 *   A. Squad Selector
 *   B. Summary KPI Row  — Avg Utilisation, Most Overloaded, Most Consistent, Top Contributor
 *   C. Heatmap Grid     — Members (rows) × Sprints (cols), cell = utilisation %
 *                         Green ≤ 90% | Amber 90-110% | Red > 110%
 *   D. Member Detail Cards — click a row to expand sprint-by-sprint SP breakdown
 *   E. Team Load Trend Chart — avg team utilisation per sprint (bar chart)
 */

const TeamHeatmap = {
  chartLoad: null,
  selectedMember: null,

  // ─────────────────────────────────────────────────────────────
  // Utilisation colour thresholds
  // ─────────────────────────────────────────────────────────────
  _colour(pct) {
    if (pct === null || pct === undefined) return { bg: 'var(--bg-input)', text: 'var(--text-muted)', label: '—' };
    if (pct > 115) return { bg: 'rgba(248,113,113,0.25)',  text: '#f87171',          label: 'Overloaded'   };
    if (pct > 100) return { bg: 'rgba(248,113,113,0.12)',  text: '#fca5a5',          label: 'Over Capacity' };
    if (pct >  90) return { bg: 'rgba(251,191,36,0.20)',   text: 'var(--accent-amber)', label: 'High Load'  };
    if (pct >  70) return { bg: 'rgba(52,211,153,0.18)',   text: 'var(--accent-green)', label: 'On Target'  };
    if (pct >  40) return { bg: 'rgba(6,182,212,0.15)',    text: 'var(--accent-cyan)',  label: 'Under Load'  };
    return           { bg: 'rgba(99,102,241,0.12)',   text: 'var(--accent-indigo)', label: 'Low Load'    };
  },

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  init() {
    this._populateSquadSelector();
    this.render();
  },

  _populateSquadSelector() {
    const sel = document.getElementById('hm-squad-select');
    if (!sel) return;
    sel.innerHTML = Object.values(SPRINT_PULSE_DATA.squads)
      .map(sq => '<option value="' + sq.id + '">' + sq.name + '</option>')
      .join('');
    sel.value = SPRINT_PULSE_DATA.activeSquadId;
  },

  onSquadChange() {
    const sel = document.getElementById('hm-squad-select');
    if (sel) SPRINT_PULSE_DATA.activeSquadId = sel.value;
    this.selectedMember = null;
    this.render();
  },

  // ─────────────────────────────────────────────────────────────
  // Data builder — synthesise per-member per-sprint utilisation
  // ─────────────────────────────────────────────────────────────
  _buildMatrix(squad) {
    const sprintList = Object.values(squad.sprints);
    const members    = squad.members;

    // Build a matrix: matrix[memberIdx][sprintIdx] = { assignedSP, capacitySP, utilPct }
    const matrix = members.map(member => {
      return sprintList.map(sprint => {
        const wl = (sprint.workload || []).find(w => w.memberId === member.id || w.name === member.name);
        if (wl) {
          const pct = wl.capacitySP > 0 ? Math.round((wl.assignedSP / wl.capacitySP) * 100) : null;
          return { assignedSP: wl.assignedSP, capacitySP: wl.capacitySP, pct };
        }

        // Synthesise: distribute squad velocity proportional to member capacity
        const totalCap  = members.reduce((s, m) => s + m.capacitySP, 0);
        const memberRatio = totalCap > 0 ? member.capacitySP / totalCap : 0;
        const synthSP   = Math.round(sprint.committedPoints * memberRatio);
        const pct       = member.capacitySP > 0 ? Math.round((synthSP / member.capacitySP) * 100) : null;
        return { assignedSP: synthSP, capacitySP: member.capacitySP, pct, synthesised: true };
      });
    });

    // Also synthesise historical sprints from historicalVelocity if only 1 sprint exists
    // (project backward using the same member ratios)
    const latestSprint = sprintList[0];
    const histVel = (latestSprint.historicalVelocity || []).slice(0, -1); // exclude current
    let extraSprints = [];
    if (histVel.length > 0 && sprintList.length === 1) {
      extraSprints = histVel.reverse().map(hv => ({ name: hv.sprint, committedPoints: hv.committed, completedPoints: hv.completed }));
    }

    const allSprints = [...extraSprints.map(e => ({ ...e, id: '_hist_' + e.name })), ...sprintList];

    // Rebuild matrix with historical columns prepended
    const fullMatrix = members.map((member, mIdx) => {
      const totalCap    = members.reduce((s, m) => s + m.capacitySP, 0);
      const memberRatio = totalCap > 0 ? member.capacitySP / totalCap : 0;

      return allSprints.map((sprint, sIdx) => {
        if (sprint.id && sprint.id.startsWith('_hist_')) {
          // Synthesised historical
          const synthSP = Math.round(sprint.committedPoints * memberRatio);
          const pct     = member.capacitySP > 0 ? Math.round((synthSP / member.capacitySP) * 100) : null;
          return { assignedSP: synthSP, capacitySP: member.capacitySP, pct, synthesised: true, sprintName: sprint.name };
        }
        // Real data
        return { ...matrix[mIdx][sIdx - extraSprints.length] || {}, sprintName: sprint.name };
      });
    });

    return { members, sprints: allSprints, matrix: fullMatrix };
  },

  // ─────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────
  render() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    if (!squad) return;

    const { members, sprints, matrix } = this._buildMatrix(squad);

    this._renderKPIs(members, sprints, matrix);
    this._renderHeatmap(members, sprints, matrix);
    this._renderLoadChart(members, sprints, matrix);
    this._renderMemberDetail(members, sprints, matrix);
  },

  // ─────────────────────────────────────────────────────────────
  // A. Summary KPIs
  // ─────────────────────────────────────────────────────────────
  _renderKPIs(members, sprints, matrix) {
    const container = document.getElementById('hm-kpi-row');
    if (!container) return;

    // Avg utilisation across all members & sprints
    let totalPct = 0, count = 0;
    matrix.forEach(row => row.forEach(cell => { if (cell.pct !== null && cell.pct !== undefined) { totalPct += cell.pct; count++; } }));
    const avgUtil = count > 0 ? Math.round(totalPct / count) : 0;

    // Most overloaded member (highest avg pct)
    const memberAvgs = members.map((m, i) => {
      const cells  = matrix[i].filter(c => c.pct !== null && c.pct !== undefined);
      const avg    = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.pct, 0) / cells.length) : 0;
      const maxPct = cells.reduce((mx, c) => Math.max(mx, c.pct), 0);
      const variance = cells.length > 1
        ? Math.round(Math.sqrt(cells.reduce((s, c) => s + Math.pow(c.pct - avg, 2), 0) / cells.length))
        : 0;
      return { member: m, avg, maxPct, variance };
    });

    const overloaded  = [...memberAvgs].sort((a, b) => b.maxPct - a.maxPct)[0];
    const mostConsistent = [...memberAvgs].sort((a, b) => a.variance - b.variance)[0];
    const topContrib  = [...memberAvgs].sort((a, b) => b.avg - a.avg)[0];

    const colour = this._colour;
    const self   = this;

    container.innerHTML = `
      <div class="hm-kpi-card">
        <div class="hm-kpi-icon" style="background:rgba(99,102,241,0.15);color:#6366f1;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <div class="hm-kpi-val" style="color:#6366f1;">${avgUtil}%</div>
        <div class="hm-kpi-label">Avg Team Utilisation</div>
        <div class="hm-kpi-sub">${sprints.length} sprint${sprints.length > 1 ? 's' : ''} analysed</div>
      </div>
      <div class="hm-kpi-card">
        <div class="hm-kpi-icon" style="background:rgba(248,113,113,0.15);color:#f87171;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="hm-kpi-val" style="color:#f87171;">${overloaded.maxPct}%</div>
        <div class="hm-kpi-label">Peak Overload</div>
        <div class="hm-kpi-sub">${overloaded.member.name.split(' ')[0]}</div>
      </div>
      <div class="hm-kpi-card">
        <div class="hm-kpi-icon" style="background:rgba(52,211,153,0.15);color:var(--accent-green);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="hm-kpi-val" style="color:var(--accent-green);">±${mostConsistent.variance}%</div>
        <div class="hm-kpi-label">Most Consistent</div>
        <div class="hm-kpi-sub">${mostConsistent.member.name.split(' ')[0]}</div>
      </div>
      <div class="hm-kpi-card">
        <div class="hm-kpi-icon" style="background:rgba(6,182,212,0.15);color:var(--accent-cyan);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
        </div>
        <div class="hm-kpi-val" style="color:var(--accent-cyan);">${topContrib.avg}%</div>
        <div class="hm-kpi-label">Top Contributor</div>
        <div class="hm-kpi-sub">${topContrib.member.name.split(' ')[0]}</div>
      </div>`;
  },

  // ─────────────────────────────────────────────────────────────
  // B. Heatmap Grid
  // ─────────────────────────────────────────────────────────────
  _renderHeatmap(members, sprints, matrix) {
    const container = document.getElementById('hm-grid');
    if (!container) return;

    const sprintLabels = sprints.map(s => {
      const name = s.name || s.id;
      return name.includes(':') ? name.split(':')[0].trim() : name.substring(0, 12);
    });

    // Header row
    let html = `
      <div class="hm-grid-wrap">
        <table class="hm-table">
          <thead>
            <tr>
              <th class="hm-th-member">Team Member</th>
              <th class="hm-th-role">Role</th>
              ${sprintLabels.map(l => `<th class="hm-th-sprint">${l}</th>`).join('')}
              <th class="hm-th-avg">Avg</th>
              <th class="hm-th-trend">Trend</th>
            </tr>
          </thead>
          <tbody>`;

    members.forEach((member, mIdx) => {
      const row    = matrix[mIdx];
      const cells  = row.filter(c => c.pct !== null && c.pct !== undefined);
      const avg    = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.pct, 0) / cells.length) : 0;
      const avgCol = this._colour(avg);
      const isSelected = this.selectedMember === mIdx;

      // Trend indicator
      const last2 = cells.slice(-2);
      const trendUp   = last2.length === 2 && last2[1].pct > last2[0].pct;
      const trendDown = last2.length === 2 && last2[1].pct < last2[0].pct;
      const trendIcon = trendUp
        ? '<span style="color:#f87171;">▲</span>'
        : trendDown
          ? '<span style="color:var(--accent-green);">▼</span>'
          : '<span style="color:var(--text-muted);">—</span>';

      html += `
        <tr class="hm-row ${isSelected ? 'hm-row--selected' : ''}" onclick="TeamHeatmap.selectMember(${mIdx})" style="cursor:pointer;">
          <td class="hm-td-member">
            <div class="hm-member-chip">
              <div class="hm-avatar">${member.avatar}</div>
              <span>${member.name}</span>
            </div>
          </td>
          <td class="hm-td-role">${member.role}</td>
          ${row.map(cell => {
            const col = this._colour(cell.pct);
            return `<td class="hm-cell" style="background:${col.bg};color:${col.text};" title="${col.label}: ${cell.pct !== null ? cell.pct + '%' : '—'} | ${cell.assignedSP || '?'}/${cell.capacitySP} SP${cell.synthesised ? ' (est.)' : ''}">
              <span class="hm-cell-pct">${cell.pct !== null && cell.pct !== undefined ? cell.pct + '%' : '—'}</span>
              <span class="hm-cell-sp">${cell.assignedSP !== undefined ? cell.assignedSP : '?'}SP</span>
            </td>`;
          }).join('')}
          <td class="hm-td-avg" style="color:${avgCol.text};font-weight:700;">${avg}%</td>
          <td class="hm-td-trend">${trendIcon}</td>
        </tr>`;
    });

    html += `</tbody></table></div>`;

    // Legend
    html += `
      <div class="hm-legend">
        <span class="hm-legend-label">Load Key:</span>
        <span class="hm-legend-item" style="background:rgba(99,102,241,0.12);color:var(--accent-indigo);">Low &lt;40%</span>
        <span class="hm-legend-item" style="background:rgba(6,182,212,0.15);color:var(--accent-cyan);">Under 40–70%</span>
        <span class="hm-legend-item" style="background:rgba(52,211,153,0.18);color:var(--accent-green);">On Target 70–90%</span>
        <span class="hm-legend-item" style="background:rgba(251,191,36,0.20);color:var(--accent-amber);">High Load 90–110%</span>
        <span class="hm-legend-item" style="background:rgba(248,113,113,0.25);color:#f87171;">Overloaded &gt;110%</span>
        <span class="hm-legend-item" style="background:var(--bg-input);color:var(--text-muted);font-style:italic;">Est. = inferred from squad velocity ratio</span>
      </div>`;

    container.innerHTML = html;
  },

  // ─────────────────────────────────────────────────────────────
  // C. Member Detail (expanded on row click)
  // ─────────────────────────────────────────────────────────────
  selectMember(idx) {
    this.selectedMember = this.selectedMember === idx ? null : idx;
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const { members, sprints, matrix } = this._buildMatrix(squad);
    this._renderHeatmap(members, sprints, matrix);
    this._renderMemberDetail(members, sprints, matrix);
  },

  _renderMemberDetail(members, sprints, matrix) {
    const container = document.getElementById('hm-member-detail');
    if (!container) return;

    if (this.selectedMember === null) {
      container.innerHTML = '<div class="sb-empty-state">Click on any row in the heatmap to see a detailed sprint-by-sprint breakdown for that team member.</div>';
      return;
    }

    const idx    = this.selectedMember;
    const member = members[idx];
    const row    = matrix[idx];
    const cells  = row.filter(c => c.pct !== null && c.pct !== undefined);
    const avg    = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.pct, 0) / cells.length) : 0;
    const maxPct = Math.max(...cells.map(c => c.pct));
    const minPct = Math.min(...cells.map(c => c.pct));

    const variance = cells.length > 1
      ? Math.round(Math.sqrt(cells.reduce((s, c) => s + Math.pow(c.pct - avg, 2), 0) / cells.length))
      : 0;

    const riskLevel = maxPct > 115 ? 'High Overallocation Risk'
      : maxPct > 100 ? 'Moderate Overallocation Risk'
      : variance > 20 ? 'Inconsistent Workload Distribution'
      : 'Healthy Workload Pattern';

    const riskColor = maxPct > 115 ? '#f87171' : maxPct > 100 ? 'var(--accent-amber)' : 'var(--accent-green)';

    container.innerHTML = `
      <div class="hm-detail-header">
        <div class="hm-avatar hm-avatar--lg">${member.avatar}</div>
        <div>
          <div style="font-size:1rem;font-weight:700;color:var(--text-primary);">${member.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${member.role} &bull; ${member.capacitySP} SP capacity/sprint</div>
          <div style="font-size:0.75rem;font-weight:700;margin-top:0.3rem;color:${riskColor};">${riskLevel}</div>
        </div>
      </div>
      <div class="hm-detail-stats">
        <div class="hm-detail-stat"><span class="hm-detail-stat-val" style="color:#6366f1;">${avg}%</span><span class="hm-detail-stat-label">Avg Utilisation</span></div>
        <div class="hm-detail-stat"><span class="hm-detail-stat-val" style="color:#f87171;">${maxPct}%</span><span class="hm-detail-stat-label">Peak Load</span></div>
        <div class="hm-detail-stat"><span class="hm-detail-stat-val" style="color:var(--accent-cyan);">${minPct}%</span><span class="hm-detail-stat-label">Min Load</span></div>
        <div class="hm-detail-stat"><span class="hm-detail-stat-val" style="color:var(--accent-amber);">±${variance}%</span><span class="hm-detail-stat-label">Variance</span></div>
      </div>
      <div class="hm-detail-sprints">
        ${row.map((cell, i) => {
          const col   = this._colour(cell.pct);
          const sName = sprints[i] ? (sprints[i].name || sprints[i].id) : 'Sprint ' + (i + 1);
          const label = sName.includes(':') ? sName.split(':')[0].trim() : sName.substring(0, 14);
          const barW  = Math.min(100, cell.pct || 0);
          return `
            <div class="hm-detail-sprint-row">
              <div class="hm-detail-sprint-name">${label}${cell.synthesised ? ' *' : ''}</div>
              <div class="hm-detail-sprint-bar-wrap">
                <div class="hm-detail-sprint-bar" style="width:${barW}%;background:${col.bg};border:1px solid ${col.text};"></div>
                <div class="hm-detail-sprint-cap-line" style="left:${member.capacitySP > 0 ? 100 : 0}%;"></div>
              </div>
              <div class="hm-detail-sprint-val" style="color:${col.text};">${cell.pct !== null ? cell.pct + '%' : '—'}</div>
              <div class="hm-detail-sprint-sp">${cell.assignedSP || '?'}/${cell.capacitySP} SP</div>
            </div>`;
        }).join('')}
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.75rem;font-style:italic;">* Estimated from squad velocity ratio — actual per-member data not recorded for this sprint.</div>`;
  },

  // ─────────────────────────────────────────────────────────────
  // D. Team Load Trend Chart
  // ─────────────────────────────────────────────────────────────
  _renderLoadChart(members, sprints, matrix) {
    const canvas = document.getElementById('hm-load-chart');
    if (!canvas) return;

    if (this.chartLoad) { this.chartLoad.destroy(); this.chartLoad = null; }

    const labels = sprints.map(s => {
      const name = s.name || s.id;
      return name.includes(':') ? name.split(':')[0].trim() : name.substring(0, 10);
    });

    // Avg utilisation per sprint across all members
    const avgPerSprint = sprints.map((_, sIdx) => {
      const cells = matrix.map(row => row[sIdx]).filter(c => c.pct !== null && c.pct !== undefined);
      return cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.pct, 0) / cells.length) : 0;
    });

    // Per-member datasets
    const COLOURS = ['#6366f1','#06b6d4','#34d399','#fbbf24','#f87171','#a78bfa'];
    const memberDatasets = members.map((m, i) => ({
      label: m.name.split(' ')[0],
      data:  matrix[i].map(c => c.pct !== null && c.pct !== undefined ? c.pct : null),
      borderColor:      COLOURS[i % COLOURS.length],
      backgroundColor:  COLOURS[i % COLOURS.length] + '22',
      borderWidth: 1.5,
      pointRadius: 3,
      tension: 0.3,
      fill: false,
      spanGaps: false
    }));

    this.chartLoad = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          ...memberDatasets,
          {
            label: 'Team Average',
            data:  avgPerSprint,
            borderColor: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderWidth: 2.5,
            borderDash: [6, 3],
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: 'rgba(255,255,255,0.65)', font: { size: 10 }, boxWidth: 10, padding: 10 } },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.75)',
            borderColor: 'rgba(99,102,241,0.4)',
            borderWidth: 1,
            callbacks: { label: ctx => ' ' + ctx.dataset.label + ': ' + (ctx.raw !== null ? ctx.raw + '%' : '—') }
          },
          annotation: {}
        },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: {
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, callback: v => v + '%' },
            grid:  { color: 'rgba(255,255,255,0.05)' },
            min: 0, max: 140,
            title: { display: true, text: 'Utilisation %', color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
          }
        }
      }
    });
  },

  // ─────────────────────────────────────────────────────────────
  // Refresh when active squad changes externally
  // ─────────────────────────────────────────────────────────────
  refreshSquadSelector() {
    this._populateSquadSelector();
    this.selectedMember = null;
    this.render();
  }
};
