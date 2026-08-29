/**
 * SprintPulse - Jira CSV Importer
 * Reads a Jira-exported (or SprintPulse template) CSV file and converts
 * it into a full squad + sprint dataset injected into SPRINT_PULSE_DATA.
 *
 * Supported CSV column names (case-insensitive, auto-detected):
 *   Issue Key / ID / Task ID        -> task id
 *   Summary / Title / Task Name     -> title
 *   Status                          -> status (mapped to: To Do, In Progress, In Review, Done)
 *   Assignee / Owner                -> assignee
 *   Story Points / SP / Points / Estimate -> sp
 *   Sprint / Sprint Name            -> (used for sprint name detection)
 *   Priority                        -> (optional, stored but not rendered)
 *
 * Provides:
 *   - Drag-and-drop + click-to-upload file zone
 *   - Auto column detection with manual override dropdowns
 *   - Live preview table of parsed rows (max 10 shown)
 *   - Sprint metadata form (squad name, sprint name, committed SP, dates)
 *   - One-click import that activates the new squad on all tabs
 *   - Download Sample CSV button
 */

const CSVImporter = {
  // Raw parsed data
  rawHeaders: [],
  rawRows:    [],

  // Column mapping (header index -> field)
  mapping: {
    id:       -1,
    title:    -1,
    status:   -1,
    assignee: -1,
    sp:       -1
  },

  // Status value normalisation map
  STATUS_MAP: {
    'to do':         'To Do',
    'todo':          'To Do',
    'open':          'To Do',
    'backlog':       'To Do',
    'new':           'To Do',
    'in progress':   'In Progress',
    'inprogress':    'In Progress',
    'in development':'In Progress',
    'dev in progress':'In Progress',
    'in review':     'In Review',
    'inreview':      'In Review',
    'code review':   'In Review',
    'pr open':       'In Review',
    'in testing':    'In Review',
    'testing':       'In Review',
    'done':          'Done',
    'closed':        'Done',
    'resolved':      'Done',
    'complete':      'Done',
    'completed':     'Done',
    'released':      'Done',
  },

  // ─────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────
  init() {
    this._bindDropZone();
  },

  _bindDropZone() {
    const zone = document.getElementById('csv-drop-zone');
    const input = document.getElementById('csv-file-input');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', e => {
      if (e.target.files[0]) this._readFile(e.target.files[0]);
    });
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('csv-drop-zone--over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('csv-drop-zone--over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('csv-drop-zone--over');
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        this._readFile(file);
      } else {
        App.showToast('Please drop a valid .csv file.', 'warning');
      }
    });
  },

  // ─────────────────────────────────────────────────────────────
  // File Reading
  // ─────────────────────────────────────────────────────────────
  _readFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        this._parseCSV(e.target.result);
        App.showToast('CSV loaded: ' + file.name, 'success');
      } catch (err) {
        App.showToast('Failed to parse CSV: ' + err.message, 'error');
      }
    };
    reader.onerror = () => App.showToast('Could not read file.', 'error');
    reader.readAsText(file, 'UTF-8');
  },

  // ─────────────────────────────────────────────────────────────
  // CSV Parsing
  // ─────────────────────────────────────────────────────────────
  _parseCSV(text) {
    // Normalise line endings
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row.');

    this.rawHeaders = this._splitCSVRow(lines[0]);
    this.rawRows    = lines.slice(1).filter(l => l.trim()).map(l => this._splitCSVRow(l));

    // Auto-detect column mapping
    this._autoDetectMapping();

    // Show column mapper + preview
    this._renderColumnMapper();
    this._renderPreview();

    // Show the config & import panel
    document.getElementById('csv-config-panel').style.display = 'block';
    document.getElementById('csv-drop-zone').style.display    = 'none';
    document.getElementById('csv-reset-btn').style.display    = 'inline-flex';
  },

  _splitCSVRow(row) {
    // Handle quoted fields with commas inside
    const result = [];
    let current  = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  },

  // ─────────────────────────────────────────────────────────────
  // Auto Column Detection
  // ─────────────────────────────────────────────────────────────
  _autoDetectMapping() {
    const FIELD_PATTERNS = {
      id:       /^(issue\s*key|id|task\s*id|key|ticket)$/i,
      title:    /^(summary|title|task\s*name|name|description|subject)$/i,
      status:   /^(status|state)$/i,
      assignee: /^(assignee|owner|assigned\s*to|developer|member)$/i,
      sp:       /^(story\s*points?|sp|points?|estimate|size|effort|storypoints?)$/i
    };

    Object.keys(FIELD_PATTERNS).forEach(field => {
      this.mapping[field] = -1; // reset
      this.rawHeaders.forEach((h, idx) => {
        if (FIELD_PATTERNS[field].test(h.trim())) {
          if (this.mapping[field] === -1) this.mapping[field] = idx;
        }
      });
    });
  },

  // ─────────────────────────────────────────────────────────────
  // Column Mapper UI
  // ─────────────────────────────────────────────────────────────
  _renderColumnMapper() {
    const container = document.getElementById('csv-column-mapper');
    if (!container) return;

    const fields = [
      { key: 'id',       label: 'Issue ID / Key',   required: false },
      { key: 'title',    label: 'Task Title',        required: true  },
      { key: 'status',   label: 'Status',            required: false },
      { key: 'assignee', label: 'Assignee',          required: false },
      { key: 'sp',       label: 'Story Points (SP)', required: false }
    ];

    const options = ['(None)', ...this.rawHeaders]
      .map((h, i) => `<option value="${i - 1}">${h}</option>`)
      .join('');

    container.innerHTML = fields.map(f => `
      <div class="csv-mapper-row">
        <label class="csv-mapper-label">${f.label}${f.required ? ' <span class="sb-required">*</span>' : ''}</label>
        <select class="sb-input csv-mapper-select" data-field="${f.key}" onchange="CSVImporter.updateMapping('${f.key}', this.value)">
          ${options}
        </select>
        <div class="csv-mapper-detected" id="csv-detected-${f.key}"></div>
      </div>`).join('');

    // Set dropdown values to auto-detected
    fields.forEach(f => {
      const sel = container.querySelector(`[data-field="${f.key}"]`);
      if (sel) sel.value = this.mapping[f.key];
      this._updateDetectedBadge(f.key);
    });
  },

  updateMapping(field, value) {
    this.mapping[field] = parseInt(value);
    this._updateDetectedBadge(field);
    this._renderPreview();
  },

  _updateDetectedBadge(field) {
    const badge = document.getElementById('csv-detected-' + field);
    if (!badge) return;
    const idx = this.mapping[field];
    if (idx >= 0 && this.rawHeaders[idx]) {
      badge.innerHTML = '<span class="csv-badge csv-badge--match">Mapped: ' + this.rawHeaders[idx] + '</span>';
    } else {
      badge.innerHTML = '<span class="csv-badge csv-badge--none">Not mapped</span>';
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Preview Table
  // ─────────────────────────────────────────────────────────────
  _renderPreview() {
    const container = document.getElementById('csv-preview-table');
    if (!container) return;

    const MAX_PREVIEW = 8;
    const tasks = this._parseTasks();
    const shown = tasks.slice(0, MAX_PREVIEW);

    const statusColor = { 'To Do': 'var(--text-muted)', 'In Progress': 'var(--accent-blue)', 'In Review': 'var(--accent-amber)', 'Done': 'var(--accent-green)' };

    container.innerHTML = `
      <div class="csv-preview-header">
        <span>Preview — ${tasks.length} tasks found${tasks.length > MAX_PREVIEW ? ' (showing first ' + MAX_PREVIEW + ')' : ''}</span>
        <span class="csv-badge csv-badge--count">${tasks.length} rows</span>
      </div>
      <div class="csv-preview-scroll">
        <table class="csv-preview-tbl">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>SP</th><th>Status</th><th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            ${shown.map(t => `
              <tr>
                <td class="mono csv-id-cell">${t.id}</td>
                <td class="csv-title-cell" title="${t.title}">${t.title}</td>
                <td class="mono" style="text-align:center;color:var(--accent-amber);font-weight:700;">${t.sp}</td>
                <td style="color:${statusColor[t.status]||'inherit'};font-size:0.78rem;font-weight:600;">${t.status}</td>
                <td style="font-size:0.78rem;color:var(--text-secondary);">${t.assignee}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Update summary stats
    const totalSP    = tasks.reduce((s, t) => s + t.sp, 0);
    const doneSP     = tasks.filter(t => t.status === 'Done').reduce((s, t) => s + t.sp, 0);
    const assignees  = [...new Set(tasks.map(t => t.assignee).filter(a => a && a !== 'Unassigned'))];

    const statsEl = document.getElementById('csv-import-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="csv-stat"><div class="csv-stat-val">${tasks.length}</div><div class="csv-stat-label">Total Tasks</div></div>
        <div class="csv-stat"><div class="csv-stat-val">${totalSP}</div><div class="csv-stat-label">Total SP</div></div>
        <div class="csv-stat"><div class="csv-stat-val">${doneSP}</div><div class="csv-stat-label">Completed SP</div></div>
        <div class="csv-stat"><div class="csv-stat-val">${assignees.length}</div><div class="csv-stat-label">Assignees</div></div>`;

      // Auto-fill committed SP field
      const cpEl = document.getElementById('csv-sprint-committed');
      if (cpEl && !cpEl.value) cpEl.value = totalSP;

      // Auto-populate assignee list as team members preview
      const membersEl = document.getElementById('csv-detected-members');
      if (membersEl) {
        membersEl.textContent = assignees.length > 0 ? assignees.join(', ') : 'No assignees detected';
      }
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Task Parsing from raw rows
  // ─────────────────────────────────────────────────────────────
  _parseTasks() {
    const { id, title, status, assignee, sp } = this.mapping;
    let counter = 101;

    return this.rawRows.map(row => {
      const rawStatus   = status   >= 0 ? (row[status]   || '').trim() : '';
      const rawAssignee = assignee >= 0 ? (row[assignee] || '').trim() : '';
      const rawSP       = sp       >= 0 ? (row[sp]       || '').trim() : '';
      const rawId       = id       >= 0 ? (row[id]       || '').trim() : '';
      const rawTitle    = title    >= 0 ? (row[title]    || '').trim() : row.join(' ').trim();

      if (!rawTitle) return null;

      const normStatus = this.STATUS_MAP[rawStatus.toLowerCase()] || 'To Do';
      const parsedSP   = parseInt(rawSP) || Math.floor(Math.random() * 5) + 1;
      const taskId     = rawId || ('IMP-' + counter++);

      return {
        id:          taskId,
        title:       rawTitle,
        status:      normStatus,
        assignee:    rawAssignee || 'Unassigned',
        sp:          parsedSP,
        reviewHours: 0
      };
    }).filter(Boolean);
  },

  // ─────────────────────────────────────────────────────────────
  // Import
  // ─────────────────────────────────────────────────────────────
  importData() {
    const squadName  = (document.getElementById('csv-squad-name').value  || '').trim();
    const sprintName = (document.getElementById('csv-sprint-name').value || '').trim();
    const startDate  = document.getElementById('csv-sprint-start').value;
    const endDate    = document.getElementById('csv-sprint-end').value;
    const committed  = parseInt(document.getElementById('csv-sprint-committed').value) || 0;
    const currentDay = parseInt(document.getElementById('csv-sprint-currentday').value) || 1;
    const totalDays  = parseInt(document.getElementById('csv-sprint-totaldays').value)  || 10;

    if (!squadName)  { App.showToast('Please enter a squad name.', 'warning');  return; }
    if (!sprintName) { App.showToast('Please enter a sprint name.', 'warning'); return; }
    if (!startDate)  { App.showToast('Please select a start date.', 'warning'); return; }
    if (!endDate)    { App.showToast('Please select an end date.', 'warning');   return; }
    if (committed < 1) { App.showToast('Please enter committed story points.', 'warning'); return; }

    const tasks = this._parseTasks();
    if (tasks.length === 0) { App.showToast('No valid tasks found in CSV.', 'warning'); return; }

    // Build unique members from assignees
    const assigneeNames = [...new Set(tasks.map(t => t.assignee).filter(a => a && a !== 'Unassigned'))];
    const members = assigneeNames.map((name, i) => ({
      id:         'm' + (i + 1),
      name,
      role:       'Team Member',
      capacitySP: 8,
      avatar:     name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
    }));
    if (members.length === 0) members.push({ id: 'm1', name: 'Team', role: 'Team Member', capacitySP: committed, avatar: 'TM' });

    // Workload
    const workload = members.map(m => ({
      memberId:   m.id,
      name:       m.name,
      assignedSP: tasks.filter(t => t.assignee === m.name).reduce((s, t) => s + t.sp, 0),
      capacitySP: m.capacitySP,
      role:       m.role
    }));

    // Burndown
    const doneSP   = tasks.filter(t => t.status === 'Done').reduce((s, t) => s + t.sp, 0);
    const spPerDay = committed / totalDays;
    const dailyBurndown = [];
    for (let d = 1; d <= totalDays; d++) {
      const ideal = parseFloat(Math.max(0, committed - spPerDay * (d - 1)).toFixed(1));
      let actual = null, remaining = null;
      if (d <= currentDay) {
        const ratio = d / currentDay;
        actual    = Math.max(0, Math.round(committed - doneSP * ratio));
        remaining = actual;
      }
      dailyBurndown.push({ day: d, ideal, actual, remaining, note: '' });
    }
    if (currentDay >= 1) {
      dailyBurndown[currentDay - 1].actual    = committed - doneSP;
      dailyBurndown[currentDay - 1].remaining = committed - doneSP;
    }

    // CFD
    const totalT = tasks.length || 1;
    const doneT  = tasks.filter(t => t.status === 'Done').length;
    const revT   = tasks.filter(t => t.status === 'In Review').length;
    const proT   = tasks.filter(t => t.status === 'In Progress').length;
    const dailyCFD = [];
    for (let d = 1; d <= currentDay; d++) {
      const r = d / currentDay;
      dailyCFD.push({
        day: d,
        done:       Math.round(doneT * r),
        inReview:   Math.round(revT  * r),
        inProgress: Math.round(proT  * r),
        toDo:       Math.max(0, totalT - Math.round((doneT + revT + proT) * r))
      });
    }

    const squad = {
      id:      'csv_' + squadName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') + '_' + Date.now(),
      name:    squadName,
      domain:  'Imported from CSV',
      color:   '#06b6d4',
      members,
      sprints: {
        sprint_1: {
          id: 'sprint_1', name: sprintName,
          goal:              'Imported from CSV — ' + tasks.length + ' tasks, ' + committed + ' SP committed.',
          startDate, endDate, totalDays, currentDay,
          committedPoints:   committed,
          completedPoints:   doneSP,
          addedPointsMidSprint: 0,
          tasks, workload, dailyBurndown, dailyCFD,
          historicalVelocity: [{
            sprint: sprintName + ' (Imported)',
            committed,
            completed:       doneSP,
            predictability:  committed ? Math.round((doneSP / committed) * 100) : 0
          }]
        }
      }
    };

    // Inject + persist
    SPRINT_PULSE_DATA.squads[squad.id]   = squad;
    SPRINT_PULSE_DATA.activeSquadId      = squad.id;
    SPRINT_PULSE_DATA.activeSprintId     = 'sprint_1';

    SquadBuilder.saveSquadToStorage(squad.id, squad);
    SquadBuilder._addSquadToSelector(squad.id, squad.name);
    SquadBuilder.renderSavedSquadsList();

    const sel = document.getElementById('squad-select');
    if (sel) sel.value = squad.id;
    const sprintSel = document.getElementById('sprint-select');
    if (sprintSel) sprintSel.innerHTML = '<option value="sprint_1">' + sprintName + '</option>';

    App.updateDashboard();
    SprintBoard.render();
    MonteCarloSimulator.runSimulation();
    KanbanAnalytics.render();
    StandupFacilitator.init();

    App.showToast('Imported "' + squadName + '" — ' + tasks.length + ' tasks activated!', 'success');
    App.switchTab('dashboard');
    this.reset();
  },

  // ─────────────────────────────────────────────────────────────
  // Sample CSV Download
  // ─────────────────────────────────────────────────────────────
  downloadSample() {
    const csv = [
      'Issue Key,Summary,Status,Assignee,Story Points,Priority,Sprint',
      'PROJ-101,Implement user authentication with JWT,Done,Ashan Perera,5,High,Sprint 01',
      'PROJ-102,Design responsive dashboard layout,Done,Nimasha Silva,8,High,Sprint 01',
      'PROJ-103,Integrate REST API endpoints for user profile,In Progress,Kasun Fernando,5,Medium,Sprint 01',
      'PROJ-104,Write unit tests for authentication module,In Review,Ashan Perera,3,Medium,Sprint 01',
      'PROJ-105,Set up CI/CD pipeline with GitHub Actions,To Do,Hasitha Wickrama,5,Low,Sprint 01',
      'PROJ-106,Build notification service for email alerts,To Do,Nimasha Silva,3,Medium,Sprint 01',
      'PROJ-107,Implement role-based access control (RBAC),In Progress,Kasun Fernando,8,High,Sprint 01',
      'PROJ-108,Create API documentation using Swagger,To Do,Hasitha Wickrama,2,Low,Sprint 01',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'SprintPulse_Sample_Import.csv';
    a.click();
    URL.revokeObjectURL(url);
    App.showToast('Sample CSV downloaded.', 'success');
  },

  // ─────────────────────────────────────────────────────────────
  // Reset
  // ─────────────────────────────────────────────────────────────
  reset() {
    this.rawHeaders = [];
    this.rawRows    = [];
    this.mapping    = { id: -1, title: -1, status: -1, assignee: -1, sp: -1 };

    const configPanel = document.getElementById('csv-config-panel');
    const dropZone    = document.getElementById('csv-drop-zone');
    const resetBtn    = document.getElementById('csv-reset-btn');
    const fileInput   = document.getElementById('csv-file-input');

    if (configPanel) configPanel.style.display = 'none';
    if (dropZone)    dropZone.style.display     = 'flex';
    if (resetBtn)    resetBtn.style.display     = 'none';
    if (fileInput)   fileInput.value            = '';

    const previewEl = document.getElementById('csv-preview-table');
    if (previewEl)   previewEl.innerHTML = '';
    const statsEl   = document.getElementById('csv-import-stats');
    if (statsEl)     statsEl.innerHTML   = '';
    const mapperEl  = document.getElementById('csv-column-mapper');
    if (mapperEl)    mapperEl.innerHTML  = '';
  }
};
