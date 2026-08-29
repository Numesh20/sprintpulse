/**
 * SprintPulse - Custom Squad & Sprint Builder
 * Multi-step wizard to create a fully custom squad and sprint configuration.
 * Saves to localStorage and injects the new squad into SPRINT_PULSE_DATA at runtime.
 *
 * Steps:
 *   Step 1 - Squad Info         (name, domain, accent colour)
 *   Step 2 - Team Members       (add/remove members with role and capacity)
 *   Step 3 - Sprint Setup       (sprint name, goal, dates, committed SP)
 *   Step 4 - Task Backlog       (add tasks with title, story points, assignee, status)
 *   Step 5 - Review & Launch    (summary before saving)
 */

const SquadBuilder = {
  currentStep: 1,
  totalSteps: 5,

  draft: {
    squad:  { id: '', name: '', domain: '', color: '#6366f1', members: [] },
    sprint: {
      id: 'sprint_1', name: '', goal: '', startDate: '', endDate: '',
      totalDays: 10, currentDay: 1, committedPoints: 0, completedPoints: 0,
      addedPointsMidSprint: 0, tasks: [], workload: [],
      historicalVelocity: [], dailyBurndown: [], dailyCFD: []
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  init() {
    this.loadSavedSquads();
    this.renderSavedSquadsList();
    this.goToStep(1);
  },

  // ─────────────────────────────────────────────────────────────
  // LocalStorage helpers
  // ─────────────────────────────────────────────────────────────
  getSavedSquads() {
    try { return JSON.parse(localStorage.getItem('sp_custom_squads') || '{}'); }
    catch { return {}; }
  },
  saveSquadToStorage(id, data)  {
    const e = this.getSavedSquads(); e[id] = data;
    localStorage.setItem('sp_custom_squads', JSON.stringify(e));
  },
  deleteSquadFromStorage(id)    {
    const e = this.getSavedSquads(); delete e[id];
    localStorage.setItem('sp_custom_squads', JSON.stringify(e));
  },

  loadSavedSquads() {
    const saved = this.getSavedSquads();
    Object.keys(saved).forEach(id => {
      if (!SPRINT_PULSE_DATA.squads[id]) {
        SPRINT_PULSE_DATA.squads[id] = saved[id];
        this._addSquadToSelector(id, saved[id].name);
      }
    });
  },

  _addSquadToSelector(id, name) {
    const sel = document.getElementById('squad-select');
    if (!sel || sel.querySelector(`option[value="${id}"]`)) return;
    const opt = document.createElement('option');
    opt.value = id; opt.textContent = name + ' (Custom)';
    sel.appendChild(opt);
  },

  // ─────────────────────────────────────────────────────────────
  // Step navigation
  // ─────────────────────────────────────────────────────────────
  goToStep(step) {
    this.currentStep = step;
    document.querySelectorAll('.sb-step').forEach(el => el.classList.remove('sb-step--active'));
    const target = document.getElementById('sb-step-' + step);
    if (target) target.classList.add('sb-step--active');
    this.updateProgress();
    if (step === 5) this.renderReviewSummary();
    const card = document.getElementById('squad-builder-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  updateProgress() {
    const fill  = document.getElementById('sb-progress-fill');
    const label = document.getElementById('sb-step-label');
    const pct   = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    if (fill)  fill.style.width = pct + '%';
    const labels = ['Squad Info','Team Members','Sprint Setup','Task Backlog','Review & Launch'];
    if (label) label.textContent = 'Step ' + this.currentStep + ' of ' + this.totalSteps + ': ' + labels[this.currentStep - 1];
    document.querySelectorAll('.sb-dot').forEach((dot, i) => {
      dot.classList.toggle('sb-dot--active', i < this.currentStep);
    });
  },

  // ─────────────────────────────────────────────────────────────
  // Step 1: Squad Info
  // ─────────────────────────────────────────────────────────────
  validateStep1() {
    const name   = document.getElementById('sb-squad-name').value.trim();
    const domain = document.getElementById('sb-squad-domain').value.trim();
    if (!name)   { App.showToast('Please enter a squad name.', 'warning'); return; }
    if (!domain) { App.showToast('Please enter the project domain.', 'warning'); return; }
    this.draft.squad.name   = name;
    this.draft.squad.domain = domain;
    this.draft.squad.id     = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '_' + Date.now();
    this.draft.squad.color  = document.getElementById('sb-squad-color').value || '#6366f1';
    this.goToStep(2);
  },

  // ─────────────────────────────────────────────────────────────
  // Step 2: Team Members
  // ─────────────────────────────────────────────────────────────
  addMember() {
    const name     = document.getElementById('sb-member-name').value.trim();
    const role     = document.getElementById('sb-member-role').value.trim();
    const capacity = parseInt(document.getElementById('sb-member-capacity').value) || 8;
    if (!name) { App.showToast('Please enter a member name.', 'warning'); return; }
    if (!role) { App.showToast('Please enter the member role.', 'warning'); return; }
    const id       = 'm' + (this.draft.squad.members.length + 1);
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    this.draft.squad.members.push({ id, name, role, capacitySP: capacity, avatar: initials });
    document.getElementById('sb-member-name').value     = '';
    document.getElementById('sb-member-role').value     = '';
    document.getElementById('sb-member-capacity').value = '8';
    this.renderMemberList();
    App.showToast(name + ' added to squad.', 'success');
  },

  removeMember(idx) {
    const removed = this.draft.squad.members.splice(idx, 1);
    this.renderMemberList();
    if (removed.length) App.showToast(removed[0].name + ' removed.', 'info');
  },

  renderMemberList() {
    const list = document.getElementById('sb-member-list');
    if (!list) return;
    if (this.draft.squad.members.length === 0) {
      list.innerHTML = '<div class="sb-empty-state">No members added yet. Add at least one team member to continue.</div>';
      return;
    }
    list.innerHTML = this.draft.squad.members.map((m, i) => `
      <div class="sb-member-chip">
        <div class="sb-member-avatar">${m.avatar}</div>
        <div class="sb-member-info"><strong>${m.name}</strong><span>${m.role}</span></div>
        <div class="sb-member-capacity">${m.capacitySP} SP</div>
        <button class="sb-remove-btn" onclick="SquadBuilder.removeMember(${i})" title="Remove">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>`).join('');
  },

  validateStep2() {
    if (this.draft.squad.members.length === 0) {
      App.showToast('Please add at least one team member.', 'warning'); return;
    }
    this.goToStep(3);
  },

  // ─────────────────────────────────────────────────────────────
  // Step 3: Sprint Setup
  // ─────────────────────────────────────────────────────────────
  validateStep3() {
    const sprintName = document.getElementById('sb-sprint-name').value.trim();
    const goal       = document.getElementById('sb-sprint-goal').value.trim();
    const startDate  = document.getElementById('sb-sprint-start').value;
    const endDate    = document.getElementById('sb-sprint-end').value;
    const committed  = parseInt(document.getElementById('sb-sprint-committed').value) || 0;
    const currentDay = parseInt(document.getElementById('sb-sprint-currentday').value) || 1;
    const totalDays  = parseInt(document.getElementById('sb-sprint-totaldays').value) || 10;
    if (!sprintName) { App.showToast('Please enter a sprint name.', 'warning'); return; }
    if (!goal)       { App.showToast('Please enter the sprint goal.', 'warning'); return; }
    if (!startDate)  { App.showToast('Please select a start date.', 'warning'); return; }
    if (!endDate)    { App.showToast('Please select an end date.', 'warning'); return; }
    if (committed < 1) { App.showToast('Please enter committed story points.', 'warning'); return; }
    if (currentDay < 1 || currentDay > totalDays) {
      App.showToast('Current day must be between 1 and ' + totalDays + '.', 'warning'); return;
    }
    this.draft.sprint.name            = sprintName;
    this.draft.sprint.goal            = goal;
    this.draft.sprint.startDate       = startDate;
    this.draft.sprint.endDate         = endDate;
    this.draft.sprint.committedPoints = committed;
    this.draft.sprint.totalDays       = totalDays;
    this.draft.sprint.currentDay      = currentDay;
    this.goToStep(4);
  },

  // ─────────────────────────────────────────────────────────────
  // Step 4: Task Backlog
  // ─────────────────────────────────────────────────────────────
  addTask() {
    const title    = document.getElementById('sb-task-title').value.trim();
    const sp       = parseInt(document.getElementById('sb-task-sp').value) || 3;
    const status   = document.getElementById('sb-task-status').value;
    const assignee = document.getElementById('sb-task-assignee').value;
    if (!title) { App.showToast('Please enter a task title.', 'warning'); return; }
    const prefix = this.draft.squad.name.toUpperCase().replace(/[^A-Z]/g,'').substring(0,3) || 'TSK';
    const taskId = prefix + '-' + (this.draft.sprint.tasks.length + 101);
    this.draft.sprint.tasks.push({
      id: taskId, title, sp, status,
      assignee: assignee || (this.draft.squad.members[0] ? this.draft.squad.members[0].name : 'Unassigned'),
      reviewHours: 0
    });
    document.getElementById('sb-task-title').value  = '';
    document.getElementById('sb-task-sp').value     = '3';
    document.getElementById('sb-task-status').value = 'To Do';
    this.renderTaskList();
    App.showToast('Task ' + taskId + ' added.', 'success');
  },

  removeTask(idx) {
    this.draft.sprint.tasks.splice(idx, 1);
    this.renderTaskList();
  },

  renderTaskList() {
    const list = document.getElementById('sb-task-list');
    if (!list) return;
    // Populate assignee dropdown from squad members
    const assigneeSel = document.getElementById('sb-task-assignee');
    if (assigneeSel) {
      assigneeSel.innerHTML = this.draft.squad.members.map(m =>
        '<option value="' + m.name + '">' + m.name + '</option>'
      ).join('');
    }
    if (this.draft.sprint.tasks.length === 0) {
      list.innerHTML = '<div class="sb-empty-state">No tasks added yet. You can add tasks from the Sprint Board after launching.</div>';
      return;
    }
    const statusColor = { 'To Do': 'var(--text-muted)', 'In Progress': 'var(--accent-blue)', 'In Review': 'var(--accent-amber)', 'Done': 'var(--accent-green)' };
    list.innerHTML = this.draft.sprint.tasks.map((t, i) => `
      <div class="sb-task-row">
        <div class="sb-task-id mono">${t.id}</div>
        <div class="sb-task-title-text" title="${t.title}">${t.title}</div>
        <div class="sb-task-sp-badge">${t.sp} SP</div>
        <div class="sb-task-status" style="color:${statusColor[t.status]||'inherit'}">${t.status}</div>
        <div class="sb-task-assignee">${t.assignee}</div>
        <button class="sb-remove-btn" onclick="SquadBuilder.removeTask(${i})" title="Remove">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>`).join('');
  },

  validateStep4() { this.goToStep(5); },

  // ─────────────────────────────────────────────────────────────
  // Step 5: Review & Launch
  // ─────────────────────────────────────────────────────────────
  renderReviewSummary() {
    const el = document.getElementById('sb-review-content');
    if (!el) return;
    const { squad, sprint } = this.draft;
    const totalCap = squad.members.reduce((s, m) => s + m.capacitySP, 0);
    const doneSP   = sprint.tasks.filter(t => t.status === 'Done').reduce((s, t) => s + t.sp, 0);
    el.innerHTML = `
      <div class="sb-review-grid">
        <div class="sb-review-section">
          <h4 class="sb-review-heading">Squad</h4>
          <div class="sb-review-row"><span>Name</span><strong>${squad.name}</strong></div>
          <div class="sb-review-row"><span>Domain</span><strong>${squad.domain}</strong></div>
          <div class="sb-review-row"><span>Team Size</span><strong>${squad.members.length} members</strong></div>
          <div class="sb-review-row"><span>Total Capacity</span><strong>${totalCap} SP</strong></div>
        </div>
        <div class="sb-review-section">
          <h4 class="sb-review-heading">Sprint</h4>
          <div class="sb-review-row"><span>Name</span><strong>${sprint.name}</strong></div>
          <div class="sb-review-row"><span>Dates</span><strong>${sprint.startDate} to ${sprint.endDate}</strong></div>
          <div class="sb-review-row"><span>Committed SP</span><strong>${sprint.committedPoints} SP</strong></div>
          <div class="sb-review-row"><span>Current Day</span><strong>Day ${sprint.currentDay} of ${sprint.totalDays}</strong></div>
          <div class="sb-review-row"><span>Tasks</span><strong>${sprint.tasks.length} tasks (${doneSP} SP done)</strong></div>
        </div>
      </div>
      <div class="sb-review-section" style="margin-top:1rem;">
        <h4 class="sb-review-heading">Team Members</h4>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;">
          ${squad.members.map(m => `
            <div class="sb-member-chip sb-member-chip--compact">
              <div class="sb-member-avatar sb-member-avatar--sm">${m.avatar}</div>
              <div class="sb-member-info"><strong>${m.name}</strong><span>${m.role} &bull; ${m.capacitySP} SP</span></div>
            </div>`).join('')}
        </div>
      </div>
      ${sprint.goal ? `<div class="sb-review-section" style="margin-top:1rem;"><h4 class="sb-review-heading">Sprint Goal</h4><p style="color:var(--text-secondary);font-style:italic;margin:0.4rem 0 0;">"${sprint.goal}"</p></div>` : ''}
    `;
  },

  // ─────────────────────────────────────────────────────────────
  // Final Launch
  // ─────────────────────────────────────────────────────────────
  launchSquad() {
    const { squad, sprint } = this.draft;

    // Build workload
    sprint.workload = squad.members.map(m => ({
      memberId: m.id, name: m.name,
      assignedSP: sprint.tasks.filter(t => t.assignee === m.name).reduce((s, t) => s + t.sp, 0),
      capacitySP: m.capacitySP, role: m.role
    }));

    // Generate daily burndown
    const spPerDay = sprint.committedPoints / sprint.totalDays;
    const doneSP   = sprint.tasks.filter(t => t.status === 'Done').reduce((s, t) => s + t.sp, 0);
    sprint.dailyBurndown = [];
    for (let d = 1; d <= sprint.totalDays; d++) {
      const ideal = parseFloat(Math.max(0, sprint.committedPoints - spPerDay * (d - 1)).toFixed(1));
      let actual = null, remaining = null;
      if (d <= sprint.currentDay) {
        const ratio = d / sprint.currentDay;
        actual    = Math.max(0, Math.round(sprint.committedPoints - doneSP * ratio));
        remaining = actual;
      }
      sprint.dailyBurndown.push({ day: d, ideal, actual, remaining, note: '' });
    }
    if (sprint.currentDay >= 1) {
      sprint.dailyBurndown[sprint.currentDay - 1].actual    = sprint.committedPoints - doneSP;
      sprint.dailyBurndown[sprint.currentDay - 1].remaining = sprint.committedPoints - doneSP;
    }

    // Generate CFD
    sprint.dailyCFD = [];
    const totalT = sprint.tasks.length || 1;
    const doneT  = sprint.tasks.filter(t => t.status === 'Done').length;
    const revT   = sprint.tasks.filter(t => t.status === 'In Review').length;
    const proT   = sprint.tasks.filter(t => t.status === 'In Progress').length;
    for (let d = 1; d <= sprint.currentDay; d++) {
      const r = d / sprint.currentDay;
      sprint.dailyCFD.push({
        day: d,
        done:       Math.round(doneT * r),
        inReview:   Math.round(revT  * r),
        inProgress: Math.round(proT  * r),
        toDo:       Math.max(0, totalT - Math.round((doneT + revT + proT) * r))
      });
    }

    // Historical velocity placeholder
    sprint.historicalVelocity = [{
      sprint: sprint.name + ' (Current)',
      committed: sprint.committedPoints,
      completed: doneSP,
      predictability: sprint.committedPoints ? Math.round((doneSP / sprint.committedPoints) * 100) : 0
    }];

    sprint.completedPoints = doneSP;

    // Build full squad object
    const squadObj = { id: squad.id, name: squad.name, domain: squad.domain, color: squad.color, members: squad.members, sprints: { sprint_1: sprint } };

    // Inject into live store
    SPRINT_PULSE_DATA.squads[squad.id]   = squadObj;
    SPRINT_PULSE_DATA.activeSquadId      = squad.id;
    SPRINT_PULSE_DATA.activeSprintId     = 'sprint_1';

    // Persist
    this.saveSquadToStorage(squad.id, squadObj);
    this._addSquadToSelector(squad.id, squad.name);

    // Update selectors
    const sel = document.getElementById('squad-select');
    if (sel) sel.value = squad.id;
    const sprintSel = document.getElementById('sprint-select');
    if (sprintSel) sprintSel.innerHTML = '<option value="sprint_1">' + sprint.name + '</option>';

    // Re-render all modules
    App.updateDashboard();
    SprintBoard.render();
    MonteCarloSimulator.runSimulation();
    KanbanAnalytics.render();
    StandupFacilitator.init();

    this.renderSavedSquadsList();
    App.showToast('Squad "' + squad.name + '" launched successfully!', 'success');
    App.switchTab('dashboard');
    this.resetWizard();
  },

  // ─────────────────────────────────────────────────────────────
  // Saved Squads Manager
  // ─────────────────────────────────────────────────────────────
  renderSavedSquadsList() {
    const container = document.getElementById('sb-saved-squads');
    if (!container) return;
    const saved = this.getSavedSquads();
    const keys  = Object.keys(saved);
    if (keys.length === 0) {
      container.innerHTML = '<div class="sb-empty-state">No custom squads saved yet. Create your first squad using the wizard above.</div>';
      return;
    }
    container.innerHTML = keys.map(id => {
      const sq     = saved[id];
      const sprint = sq.sprints && sq.sprints.sprint_1;
      return `
        <div class="sb-saved-squad-card">
          <div class="sb-saved-squad-info">
            <div class="sb-saved-squad-name">${sq.name}</div>
            <div class="sb-saved-squad-meta">${sq.domain} &bull; ${sq.members.length} members &bull; ${sprint ? sprint.committedPoints + ' SP committed' : ''}</div>
          </div>
          <div class="sb-saved-squad-actions">
            <button class="btn btn-sm btn-primary" onclick="SquadBuilder.activateSquad('${id}')">Activate</button>
            <button class="btn btn-sm btn-outline" onclick="SquadBuilder.deleteSquad('${id}')">Delete</button>
          </div>
        </div>`;
    }).join('');
  },

  activateSquad(id) {
    if (!SPRINT_PULSE_DATA.squads[id]) {
      const saved = this.getSavedSquads();
      if (!saved[id]) { App.showToast('Squad not found.', 'error'); return; }
      SPRINT_PULSE_DATA.squads[id] = saved[id];
    }
    SPRINT_PULSE_DATA.activeSquadId  = id;
    SPRINT_PULSE_DATA.activeSprintId = 'sprint_1';
    const sel = document.getElementById('squad-select');
    if (sel) sel.value = id;
    const sprintSel = document.getElementById('sprint-select');
    const sprint    = SPRINT_PULSE_DATA.squads[id].sprints.sprint_1;
    if (sprintSel && sprint) sprintSel.innerHTML = '<option value="sprint_1">' + sprint.name + '</option>';
    App.updateDashboard();
    SprintBoard.render();
    MonteCarloSimulator.runSimulation();
    KanbanAnalytics.render();
    StandupFacilitator.init();
    App.showToast('"' + SPRINT_PULSE_DATA.squads[id].name + '" is now active.', 'success');
    App.switchTab('dashboard');
  },

  deleteSquad(id) {
    const saved = this.getSavedSquads();
    const name  = saved[id] ? saved[id].name : id;
    this.deleteSquadFromStorage(id);
    delete SPRINT_PULSE_DATA.squads[id];
    const sel = document.getElementById('squad-select');
    const opt = sel ? sel.querySelector('option[value="' + id + '"]') : null;
    if (opt) opt.remove();
    if (SPRINT_PULSE_DATA.activeSquadId === id) {
      SPRINT_PULSE_DATA.activeSquadId  = 'fintech';
      SPRINT_PULSE_DATA.activeSprintId = 'sprint_4';
      if (sel) sel.value = 'fintech';
      App.updateDashboard();
    }
    this.renderSavedSquadsList();
    App.showToast('Squad "' + name + '" deleted.', 'info');
  },

  // ─────────────────────────────────────────────────────────────
  // Reset
  // ─────────────────────────────────────────────────────────────
  resetWizard() {
    this.draft = {
      squad:  { id: '', name: '', domain: '', color: '#6366f1', members: [] },
      sprint: {
        id: 'sprint_1', name: '', goal: '', startDate: '', endDate: '',
        totalDays: 10, currentDay: 1, committedPoints: 0, completedPoints: 0,
        addedPointsMidSprint: 0, tasks: [], workload: [],
        historicalVelocity: [], dailyBurndown: [], dailyCFD: []
      }
    };
    ['sb-squad-name','sb-squad-domain','sb-sprint-name','sb-sprint-goal',
     'sb-sprint-start','sb-sprint-end','sb-member-name','sb-member-role','sb-task-title']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const cp = document.getElementById('sb-sprint-committed');
    if (cp) cp.value = '';
    this.renderMemberList();
    this.renderTaskList();
    this.goToStep(1);
  }
};
