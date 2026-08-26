/**
 * SprintPulse - 15-Minute Daily Standup Facilitator & Blocker Logger
 * Manages Scrum Daily Standup ceremony timeboxes, speaker rotation, and blocker escalation
 */

const StandupFacilitator = {
  totalSeconds: 900, // 15 minutes = 900s
  totalRemaining: 900,
  speakerSeconds: 120, // 2 minutes per speaker
  speakerRemaining: 120,
  currentSpeakerIndex: 0,
  isRunning: false,
  timerInterval: null,

  parkingLotTopics: [
    { id: 'pl-1', topic: 'Discuss Redis cluster failover strategy with DevOps', raisedBy: 'Chamara B.' },
    { id: 'pl-2', topic: 'Review EMVCo QR schema breaking changes from Central Bank', raisedBy: 'Dilshan S.' }
  ],

  init() {
    this.resetMeeting();
    this.render();
  },

  getSpeakers() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    return squad ? squad.members : [];
  },

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timerInterval = setInterval(() => {
      if (this.totalRemaining > 0) {
        this.totalRemaining--;
      } else {
        this.pauseTimer();
        App.showToast('15-Minute Standup Timebox Concluded.', 'info');
      }

      if (this.speakerRemaining > 0) {
        this.speakerRemaining--;
      }

      this.updateClockUI();
    }, 1000);

    this.updateClockUI();
  },

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.updateClockUI();
  },

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  nextSpeaker() {
    const speakers = this.getSpeakers();
    if (this.currentSpeakerIndex < speakers.length - 1) {
      this.currentSpeakerIndex++;
      this.speakerRemaining = this.speakerSeconds;
      this.render();
      this.updateClockUI();
      App.showToast(`Now speaking: ${speakers[this.currentSpeakerIndex].name}`, 'info');
    } else {
      this.pauseTimer();
      App.showToast('All speakers have completed their standup updates!', 'success');
    }
  },

  previousSpeaker() {
    if (this.currentSpeakerIndex > 0) {
      this.currentSpeakerIndex--;
      this.speakerRemaining = this.speakerSeconds;
      this.render();
      this.updateClockUI();
    }
  },

  selectSpeaker(idx) {
    this.currentSpeakerIndex = idx;
    this.speakerRemaining = this.speakerSeconds;
    this.render();
    this.updateClockUI();
  },

  resetMeeting() {
    this.pauseTimer();
    this.totalRemaining = this.totalSeconds;
    this.speakerRemaining = this.speakerSeconds;
    this.currentSpeakerIndex = 0;
    this.updateClockUI();
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  updateClockUI() {
    const elTotalTime = document.getElementById('standup-total-time');
    const elSpeakerTime = document.getElementById('standup-speaker-time');
    const elToggleBtn = document.getElementById('btn-standup-toggle');
    const elSpeakerBar = document.getElementById('standup-speaker-progress');

    if (elTotalTime) elTotalTime.textContent = this.formatTime(this.totalRemaining);
    if (elSpeakerTime) {
      elSpeakerTime.textContent = this.formatTime(this.speakerRemaining);
      if (this.speakerRemaining <= 15) {
        elSpeakerTime.style.color = 'var(--status-critical)';
      } else if (this.speakerRemaining <= 30) {
        elSpeakerTime.style.color = 'var(--status-warning)';
      } else {
        elSpeakerTime.style.color = 'var(--text-primary)';
      }
    }

    if (elToggleBtn) {
      elToggleBtn.textContent = this.isRunning ? 'Pause Meeting' : 'Start Standup';
      elToggleBtn.className = this.isRunning ? 'btn btn-outline' : 'btn btn-primary';
    }

    if (elSpeakerBar) {
      const pct = Math.max(0, (this.speakerRemaining / this.speakerSeconds) * 100);
      elSpeakerBar.style.width = `${pct}%`;
      elSpeakerBar.style.background = this.speakerRemaining <= 15 ? 'var(--status-critical)' : this.speakerRemaining <= 30 ? 'var(--status-warning)' : 'var(--primary)';
    }
  },

  render() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    const speakers = this.getSpeakers();
    if (!speakers || speakers.length === 0) return;

    const currentSpeaker = speakers[this.currentSpeakerIndex] || speakers[0];

    // 1. Render Active Speaker Card Info
    const elSpeakerName = document.getElementById('current-speaker-name');
    const elSpeakerRole = document.getElementById('current-speaker-role');
    const elSpeakerAvatar = document.getElementById('current-speaker-avatar');

    if (elSpeakerName) elSpeakerName.textContent = currentSpeaker.name;
    if (elSpeakerRole) elSpeakerRole.textContent = currentSpeaker.role;
    if (elSpeakerAvatar) elSpeakerAvatar.textContent = currentSpeaker.avatar;

    // 2. Render Active Speaker's Assigned Tasks
    const assignedTasks = (sprint.tasks || []).filter(t => t.assignee.includes(currentSpeaker.name.split(' ')[0]));
    const elSpeakerTasks = document.getElementById('current-speaker-tasks');
    if (elSpeakerTasks) {
      if (assignedTasks.length === 0) {
        elSpeakerTasks.innerHTML = `<span style="color: var(--text-muted); font-size: 0.75rem;">No direct active tasks assigned in sprint backlog.</span>`;
      } else {
        elSpeakerTasks.innerHTML = assignedTasks.map(t => `
          <div class="sprint-task-card" style="padding: 0.5rem 0.75rem; margin-bottom: 0.35rem; cursor: default;">
            <div class="task-card-header">
              <span class="task-card-id mono">${t.id}</span>
              <span class="kpi-badge ${t.status === 'Done' ? 'badge-positive' : t.status === 'In Review' ? 'badge-warning' : 'badge-neutral'}">${t.status}</span>
            </div>
            <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-primary); margin-top: 0.2rem;">${this.escapeHTML(t.title)}</div>
          </div>
        `).join('');
      }
    }

    // 3. Render Speaker Queue Cards
    const elQueue = document.getElementById('standup-speaker-queue');
    if (elQueue) {
      elQueue.innerHTML = speakers.map((spk, idx) => {
        const isCurrent = idx === this.currentSpeakerIndex;
        const isDone = idx < this.currentSpeakerIndex;

        return `
          <div class="speaker-queue-item ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}" onclick="StandupFacilitator.selectSpeaker(${idx})">
            <div class="dev-avatar" style="width: 28px; height: 28px; font-size: 0.7rem;">${spk.avatar}</div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">${spk.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${spk.role}</div>
            </div>
            <span class="kpi-badge ${isCurrent ? 'badge-positive' : isDone ? 'badge-neutral' : 'badge-neutral'}" style="font-size: 0.68rem;">
              ${isCurrent ? 'Speaking' : isDone ? 'Done' : 'Waiting'}
            </span>
          </div>
        `;
      }).join('');
    }

    // 4. Render Parking Lot Topics
    this.renderParkingLot();
  },

  renderParkingLot() {
    const elParkingLot = document.getElementById('standup-parking-lot-items');
    if (!elParkingLot) return;

    if (this.parkingLotTopics.length === 0) {
      elParkingLot.innerHTML = `<div style="color: var(--text-muted); font-size: 0.78rem;">No 16th-minute parking lot topics recorded.</div>`;
      return;
    }

    elParkingLot.innerHTML = this.parkingLotTopics.map(item => `
      <div class="parking-lot-item">
        <div>
          <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-primary);">${this.escapeHTML(item.topic)}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">Raised by: ${this.escapeHTML(item.raisedBy)}</div>
        </div>
        <button class="btn-icon" style="width: 22px; height: 22px; font-size: 0.75rem;" onclick="StandupFacilitator.deleteParkingLot('${item.id}')">&times;</button>
      </div>
    `).join('');
  },

  addParkingLotTopic() {
    const input = document.getElementById('input-parking-topic');
    if (!input || !input.value.trim()) return;

    const speakers = this.getSpeakers();
    const currentSpeaker = speakers[this.currentSpeakerIndex] || { name: 'Team Member' };

    this.parkingLotTopics.push({
      id: 'pl-' + Date.now(),
      topic: input.value.trim(),
      raisedBy: currentSpeaker.name
    });

    input.value = '';
    this.renderParkingLot();
    App.showToast('Topic added to 16th-minute parking lot.', 'info');
  },

  deleteParkingLot(id) {
    this.parkingLotTopics = this.parkingLotTopics.filter(t => t.id !== id);
    this.renderParkingLot();
  },

  escalateBlockerToRAID() {
    const blockerText = document.getElementById('standup-input-blocker').value.trim();
    if (!blockerText) {
      App.showToast('Please type a blocker description before escalating.', 'info');
      return;
    }

    const speakers = this.getSpeakers();
    const currentSpeaker = speakers[this.currentSpeakerIndex] || { name: 'Dev Team' };

    SprintRAIDManager.addItem({
      type: 'Issue',
      title: `[Daily Standup Blocker] ${blockerText}`,
      likelihood: 4,
      impact: 4,
      owner: currentSpeaker.name,
      mitigation: 'Escalated during Daily Scrum. Scrum Master facilitating resolution.'
    });

    document.getElementById('standup-input-blocker').value = '';
    App.showToast(`Blocker escalated to RAID Log register under ${currentSpeaker.name}.`, 'success');
  },

  escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};
