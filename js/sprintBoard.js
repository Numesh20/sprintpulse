/**
 * SprintPulse - Interactive Drag-and-Drop Sprint Task Board
 * Connects task movement across To Do -> In Progress -> In Review -> Done
 * Dynamically synchronizes Burndown, Completed Velocity, and Risk Radar in real-time
 */

const SprintBoard = {
  draggedTaskId: null,

  init() {
    this.render();
  },

  render() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    if (!sprint || !sprint.tasks) return;

    const columns = [
      { id: 'To Do', label: 'To Do', color: 'var(--text-muted)' },
      { id: 'In Progress', label: 'In Progress', color: 'var(--primary)' },
      { id: 'In Review', label: 'In Review', color: 'var(--status-warning)' },
      { id: 'Done', label: 'Done', color: 'var(--status-on-track)' }
    ];

    const container = document.getElementById('sprint-board-columns');
    if (!container) return;

    container.innerHTML = columns.map(col => {
      const colTasks = sprint.tasks.filter(t => t.status === col.id);
      const totalSP = colTasks.reduce((sum, t) => sum + (t.sp || 0), 0);

      return `
        <div class="sprint-col" data-status="${col.id}" ondragover="SprintBoard.handleDragOver(event)" ondragleave="SprintBoard.handleDragLeave(event)" ondrop="SprintBoard.handleDrop(event, '${col.id}')">
          <div class="sprint-col-header">
            <div class="sprint-col-title-wrap">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${col.color};"></span>
              <span class="sprint-col-title">${col.label}</span>
              <span class="sprint-col-count">${colTasks.length}</span>
            </div>
            <span class="sprint-col-sp mono">${totalSP} SP</span>
          </div>

          <div class="sprint-cards-dropzone" id="dropzone-${col.id.replace(/\s+/g, '-')}">
            ${colTasks.map(t => this.renderTaskCard(t)).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  renderTaskCard(task) {
    const isOverdueReview = task.status === 'In Review' && task.reviewHours >= 48;
    const reviewBadge = task.reviewHours > 0 
      ? `<span class="kpi-badge ${isOverdueReview ? 'badge-negative' : 'badge-neutral'}" style="font-size: 0.68rem;">
          ${task.reviewHours}h Review
        </span>`
      : '';

    const avatarInitials = (task.assignee || 'Unassigned').split(' ').map(n => n[0]).join('').substring(0, 2);

    return `
      <div class="sprint-task-card" draggable="true" ondragstart="SprintBoard.handleDragStart(event, '${task.id}')" id="task-${task.id}">
        <div class="task-card-header">
          <span class="task-card-id mono">${task.id}</span>
          <span class="task-card-sp">${task.sp} SP</span>
        </div>
        <div class="task-card-title">${this.escapeHTML(task.title)}</div>
        <div class="task-card-footer">
          <div class="task-card-assignee">
            <div class="dev-avatar" style="width: 20px; height: 20px; font-size: 0.6rem;">${avatarInitials}</div>
            <span style="font-size: 0.72rem; color: var(--text-secondary);">${this.escapeHTML(task.assignee)}</span>
          </div>
          <div>${reviewBadge}</div>
        </div>
      </div>
    `;
  },

  handleDragStart(event, taskId) {
    this.draggedTaskId = taskId;
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
    const cardEl = document.getElementById(`task-${taskId}`);
    if (cardEl) cardEl.classList.add('dragging');
  },

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const col = event.currentTarget;
    col.classList.add('drag-over');
  },

  handleDragLeave(event) {
    const col = event.currentTarget;
    col.classList.remove('drag-over');
  },

  handleDrop(event, targetStatus) {
    event.preventDefault();
    const col = event.currentTarget;
    col.classList.remove('drag-over');

    const taskId = event.dataTransfer.getData('text/plain') || this.draggedTaskId;
    if (!taskId) return;

    this.moveTask(taskId, targetStatus);
  },

  moveTask(taskId, targetStatus) {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    if (!sprint || !sprint.tasks) return;

    const task = sprint.tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) {
      this.render();
      return;
    }

    const previousStatus = task.status;
    task.status = targetStatus;

    // Recalculate completed story points across all done tasks
    const doneTasks = sprint.tasks.filter(t => t.status === 'Done');
    const newCompletedSP = doneTasks.reduce((sum, t) => sum + (t.sp || 0), 0);
    sprint.completedPoints = newCompletedSP;

    // Update current day remaining burndown dynamically
    if (sprint.dailyBurndown) {
      const currentDayData = sprint.dailyBurndown.find(d => d.day === sprint.currentDay);
      if (currentDayData) {
        currentDayData.remaining = Math.max(0, (sprint.committedPoints + (sprint.addedPointsMidSprint || 0)) - newCompletedSP);
      }
    }

    // Re-render board and synchronize dashboard
    this.render();
    App.updateDashboard();

    App.showToast(`Moved ${taskId} to "${targetStatus}". Completed Velocity: ${sprint.completedPoints}/${sprint.committedPoints} SP`, 'success');
  },

  addNewTask({ title, sp, assignee, status = 'To Do' }) {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    if (!sprint) return;

    const prefix = SPRINT_PULSE_DATA.activeSquadId === 'fintech' ? 'FIN' : SPRINT_PULSE_DATA.activeSquadId === 'ecommerce' ? 'ECM' : 'SAS';
    const newId = `${prefix}-${Math.floor(150 + Math.random() * 850)}`;
    const storyPoints = parseInt(sp, 10) || 3;

    const newTask = {
      id: newId,
      title: title.trim(),
      sp: storyPoints,
      status,
      assignee: assignee.trim() || 'Unassigned',
      reviewHours: status === 'In Review' ? 4 : 0
    };

    sprint.tasks.push(newTask);
    sprint.addedPointsMidSprint = (sprint.addedPointsMidSprint || 0) + storyPoints;

    this.render();
    App.updateDashboard();
    App.showToast(`Created task ${newId} (+${storyPoints} SP mid-sprint).`, 'info');
  },

  escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};
