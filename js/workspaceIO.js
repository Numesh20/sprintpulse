/**
 * SprintPulse - Workspace Export & Import (JSON)
 *
 * Export packs:
 *   - SPRINT_PULSE_DATA      (live in-memory: all squads, sprints, tasks)
 *   - sp_custom_squads       (localStorage — persisted custom squads)
 *   - sprint_pulse_raid_log  (localStorage — RAID items)
 *   - sprint_pulse_retros    (localStorage — retrospective cards)
 *   - sprint_pulse_theme     (localStorage — dark/light preference)
 *   - metadata: version, timestamp, squadCount, sprintCount
 *
 * Import:
 *   1. FileReader reads the .json file
 *   2. Validates shape (app tag + squads key)
 *   3. Shows confirmation dialog with file metadata
 *   4. On confirm: restores localStorage, replaces SPRINT_PULSE_DATA, re-inits all modules
 */

const WorkspaceIO = {
  VERSION: '1.0',
  _pendingImport: null,

  // ─────────────────────────────────────────────────────────────
  // Panel open / close
  // ─────────────────────────────────────────────────────────────
  openPanel() {
    const panel = document.getElementById('workspace-io-panel');
    if (!panel) return;
    panel.classList.add('wio-panel--open');
    setTimeout(() => {
      document.addEventListener('mousedown', WorkspaceIO._outsideClick, { once: true });
    }, 50);
  },

  closePanel() {
    const panel = document.getElementById('workspace-io-panel');
    if (panel) panel.classList.remove('wio-panel--open');
    this.cancelImport();
  },

  _outsideClick(e) {
    const panel = document.getElementById('workspace-io-panel');
    const btn   = document.getElementById('btn-workspace-io');
    if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
      WorkspaceIO.closePanel();
    } else if (panel && panel.classList.contains('wio-panel--open')) {
      document.addEventListener('mousedown', WorkspaceIO._outsideClick, { once: true });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────────────────────
  exportWorkspace() {
    try {
      const squads      = Object.values(SPRINT_PULSE_DATA.squads || {});
      const sprintCount = squads.reduce((s, sq) => s + Object.keys(sq.sprints || {}).length, 0);

      const workspace = {
        _meta: {
          app:         'SprintPulse',
          version:     this.VERSION,
          exportedAt:  new Date().toISOString(),
          squadCount:  squads.length,
          sprintCount,
          label:       'SprintPulse Workspace Backup'
        },
        activeSquadId:  SPRINT_PULSE_DATA.activeSquadId,
        activeSprintId: SPRINT_PULSE_DATA.activeSprintId,
        squads:         SPRINT_PULSE_DATA.squads,
        customSquads:   this._safeGet('sp_custom_squads',      {}),
        raidLog:        this._safeGet('sprint_pulse_raid_log', []),
        retros:         this._safeGet('sprint_pulse_retros',   []),
        theme:          localStorage.getItem('sprint_pulse_theme') || 'dark'
      };

      const json     = JSON.stringify(workspace, null, 2);
      const blob     = new Blob([json], { type: 'application/json' });
      const url      = URL.createObjectURL(blob);
      const filename = 'SprintPulse_Workspace_' + new Date().toISOString().slice(0, 10) + '.json';

      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      localStorage.setItem('sp_last_export_ts', new Date().toISOString());
      App.showToast('Workspace exported: ' + filename, 'success');
      this.closePanel();
      this._refreshStats();
    } catch (err) {
      App.showToast('Export failed: ' + err.message, 'error');
    }
  },

  _safeGet(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  },

  // ─────────────────────────────────────────────────────────────
  // IMPORT — trigger file picker
  // ─────────────────────────────────────────────────────────────
  triggerImport() {
    const input = document.getElementById('wio-file-input');
    if (input) { input.value = ''; input.click(); }
  },

  onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      App.showToast('Please select a SprintPulse .json workspace file.', 'warning');
      return;
    }

    const reader    = new FileReader();
    reader.onload   = ev => {
      try { WorkspaceIO._processImport(ev.target.result, file.name); }
      catch (err) { App.showToast('Import failed: ' + err.message, 'error'); }
    };
    reader.onerror  = () => App.showToast('Could not read the file.', 'error');
    reader.readAsText(file, 'UTF-8');
    e.target.value  = '';
  },

  // ─────────────────────────────────────────────────────────────
  // IMPORT — validate & show confirm dialog
  // ─────────────────────────────────────────────────────────────
  _processImport(text, filename) {
    let ws;
    try { ws = JSON.parse(text); }
    catch { throw new Error('File is not valid JSON.'); }

    if (!ws._meta || ws._meta.app !== 'SprintPulse') throw new Error('Not a SprintPulse workspace file.');
    if (!ws.squads || typeof ws.squads !== 'object')  throw new Error('Workspace data is missing squad data.');

    this._pendingImport = ws;
    const meta = ws._meta;

    const confirmEl = document.getElementById('wio-import-confirm');
    if (!confirmEl) { this._commitImport(); return; }

    confirmEl.innerHTML = `
      <div class="wio-confirm-box">
        <div class="wio-confirm-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          File Ready to Restore
        </div>
        <div class="wio-confirm-grid">
          <div class="wio-confirm-row"><span>File</span><strong>${filename}</strong></div>
          <div class="wio-confirm-row"><span>Exported</span><strong>${new Date(meta.exportedAt).toLocaleString()}</strong></div>
          <div class="wio-confirm-row"><span>Squads</span><strong>${meta.squadCount}</strong></div>
          <div class="wio-confirm-row"><span>Sprints</span><strong>${meta.sprintCount}</strong></div>
        </div>
        <div class="wio-confirm-warning">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          This will overwrite all current workspace data and cannot be undone.
        </div>
        <div class="wio-confirm-actions">
          <button class="btn btn-ghost btn-sm" onclick="WorkspaceIO.cancelImport()">Cancel</button>
          <button class="btn btn-sm" style="background:#f87171;border-color:#f87171;color:#fff;" onclick="WorkspaceIO._commitImport()">
            Confirm &amp; Restore
          </button>
        </div>
      </div>`;
    confirmEl.style.display = 'block';
  },

  cancelImport() {
    this._pendingImport = null;
    const confirmEl = document.getElementById('wio-import-confirm');
    if (confirmEl) { confirmEl.innerHTML = ''; confirmEl.style.display = 'none'; }
  },

  // ─────────────────────────────────────────────────────────────
  // IMPORT — commit (write localStorage, update live data, re-init)
  // ─────────────────────────────────────────────────────────────
  _commitImport() {
    const ws = this._pendingImport;
    if (!ws) return;

    // 1. Restore localStorage
    if (ws.customSquads) localStorage.setItem('sp_custom_squads',      JSON.stringify(ws.customSquads));
    if (ws.raidLog)      localStorage.setItem('sprint_pulse_raid_log', JSON.stringify(ws.raidLog));
    if (ws.retros)       localStorage.setItem('sprint_pulse_retros',   JSON.stringify(ws.retros));
    if (ws.theme)        localStorage.setItem('sprint_pulse_theme',    ws.theme);

    // 2. Replace live SPRINT_PULSE_DATA
    SPRINT_PULSE_DATA.squads        = ws.squads;
    SPRINT_PULSE_DATA.activeSquadId  = ws.activeSquadId  || Object.keys(ws.squads)[0];
    SPRINT_PULSE_DATA.activeSprintId = ws.activeSprintId || 'sprint_4';

    // 3. Merge custom squads that aren't already in squads
    const custom = ws.customSquads || {};
    Object.keys(custom).forEach(id => {
      if (!SPRINT_PULSE_DATA.squads[id]) SPRINT_PULSE_DATA.squads[id] = custom[id];
    });

    // 4. Theme
    App.theme = ws.theme || 'dark';
    App._applyThemeUI(false);

    // 5. Re-initialise every module that uses live data
    App.updateDashboard();
    if (typeof SprintBoard           !== 'undefined') SprintBoard.init();
    if (typeof MonteCarloSimulator   !== 'undefined') MonteCarloSimulator.init();
    if (typeof KanbanAnalytics       !== 'undefined') KanbanAnalytics.init();
    if (typeof StandupFacilitator    !== 'undefined') StandupFacilitator.init();
    if (typeof SprintRetrospective   !== 'undefined') SprintRetrospective.render();
    if (typeof SprintRAIDManager     !== 'undefined') SprintRAIDManager.render();
    if (typeof SprintComparison      !== 'undefined') { SprintComparison.refreshSelectors(); SprintComparison.render(); }
    if (typeof TeamHeatmap           !== 'undefined') TeamHeatmap.refreshSquadSelector();
    if (typeof SquadBuilder          !== 'undefined') SquadBuilder.renderSavedSquadsList();

    this._pendingImport = null;
    this.cancelImport();
    this.closePanel();
    this._refreshStats();

    const exportDate = ws._meta && ws._meta.exportedAt
      ? new Date(ws._meta.exportedAt).toLocaleDateString()
      : 'file';
    App.showToast('Workspace restored from ' + exportDate + '!', 'success');
    App.switchTab('dashboard');
  },

  // ─────────────────────────────────────────────────────────────
  // Stats — workspace summary shown in the panel
  // ─────────────────────────────────────────────────────────────
  _refreshStats() {
    const el = document.getElementById('wio-stats');
    if (!el) return;

    const squads     = Object.values(SPRINT_PULSE_DATA.squads || {});
    const sprintCt   = squads.reduce((s, sq) => s + Object.keys(sq.sprints || {}).length, 0);
    const taskCt     = squads.reduce((s, sq) =>
      s + Object.values(sq.sprints || {}).reduce((ss, sp) => ss + (sp.tasks || []).length, 0), 0);
    const raidCt     = (this._safeGet('sprint_pulse_raid_log', []) || []).length;

    el.innerHTML = `
      <div class="wio-stat"><span class="wio-stat-val">${squads.length}</span><span class="wio-stat-label">Squads</span></div>
      <div class="wio-stat"><span class="wio-stat-val">${sprintCt}</span><span class="wio-stat-label">Sprints</span></div>
      <div class="wio-stat"><span class="wio-stat-val">${taskCt}</span><span class="wio-stat-label">Tasks</span></div>
      <div class="wio-stat"><span class="wio-stat-val">${raidCt}</span><span class="wio-stat-label">RAID Items</span></div>`;
  },

  init() {
    this._refreshStats();
  }
};
