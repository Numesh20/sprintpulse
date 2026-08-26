/**
 * SprintPulse - Interactive RAID Log Manager
 * Manages Risks, Assumptions, Issues, and Dependencies with 5x5 scoring matrix
 */

const SprintRAIDManager = {
  storageKey: 'sprint_pulse_raid_log',
  filterType: 'ALL',

  defaultItems: [
    { id: 'RSK-101', type: 'Risk', title: 'Third-party Payment Switch API rate limiting during peak load', likelihood: 3, impact: 4, score: 12, severity: 'High', owner: 'Tech Lead', status: 'Mitigating', mitigation: 'Implement Redis token bucket rate limiter with graceful backoff.' },
    { id: 'ISS-102', type: 'Issue', title: 'Stagnant PR reviews exceeding 48 hours SLA', likelihood: 4, impact: 3, score: 12, severity: 'High', owner: 'Associate IT PM', status: 'Active', mitigation: 'Instituted daily 15-minute standup PR review swarm.' },
    { id: 'DEP-103', type: 'Dependency', title: 'Security PCI-DSS compliance sign-off from Central Bank audit team', likelihood: 2, impact: 5, score: 10, severity: 'High', owner: 'Project Sponsor', status: 'In Progress', mitigation: 'Pre-audit audit checklist submitted 2 weeks ahead.' },
    { id: 'ASM-104', type: 'Assumption', title: 'Development squads estimate exclusively in Fibonacci story points', likelihood: 2, impact: 2, score: 4, severity: 'Low', owner: 'Scrum Master', status: 'Validated', mitigation: 'Standardized agile story template across teams.' },
    { id: 'RSK-105', type: 'Risk', title: 'Developer overallocation on critical path QR engine stories', likelihood: 3, impact: 3, score: 9, severity: 'Medium', owner: 'Associate IT PM', status: 'Controlled', mitigation: 'Rebalanced 5 SP to secondary frontend engineer.' }
  ],

  getItems() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.defaultItems;
    } catch (e) {
      return this.defaultItems;
    }
  },

  saveItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save RAID log', e);
    }
  },

  addItem({ type, title, likelihood, impact, owner, mitigation }) {
    const items = this.getItems();
    const l = parseInt(likelihood, 10) || 1;
    const i = parseInt(impact, 10) || 1;
    const score = l * i;

    let severity = 'Low';
    if (score >= 15) severity = 'Critical';
    else if (score >= 10) severity = 'High';
    else if (score >= 5) severity = 'Medium';

    const prefix = type === 'Risk' ? 'RSK' : type === 'Issue' ? 'ISS' : type === 'Dependency' ? 'DEP' : 'ASM';
    const newItem = {
      id: `${prefix}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      title: title.trim(),
      likelihood: l,
      impact: i,
      score,
      severity,
      owner: owner.trim() || 'Unassigned',
      status: 'Active',
      mitigation: mitigation.trim() || 'Mitigation plan under formulation.'
    };

    items.unshift(newItem);
    this.saveItems(items);
    this.render();
    return newItem;
  },

  deleteItem(itemId) {
    let items = this.getItems();
    items = items.filter(i => i.id !== itemId);
    this.saveItems(items);
    this.render();
  },

  setFilter(type) {
    this.filterType = type;
    
    // Update active class on filter tab buttons
    const filterButtons = document.querySelectorAll('#raid-filter-tabs .nav-tab');
    filterButtons.forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter') || btn.textContent.trim();
      const match = (type === 'ALL' && btnFilter.toUpperCase().includes('ALL')) ||
                    (btnFilter.toUpperCase().startsWith(type.toUpperCase()));
      btn.classList.toggle('active', match);
    });

    this.render();
  },

  render() {
    const items = this.getItems();
    const tableBody = document.getElementById('raid-table-body');
    if (!tableBody) return;

    const filtered = this.filterType === 'ALL' 
      ? items 
      : items.filter(i => i.type.toUpperCase() === this.filterType.toUpperCase());

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No RAID items found matching filter "${this.filterType}".
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(item => {
      let severityClass = 'severity-low';
      if (item.severity === 'Critical') severityClass = 'severity-critical';
      else if (item.severity === 'High') severityClass = 'severity-high';
      else if (item.severity === 'Medium') severityClass = 'severity-medium';

      return `
        <tr>
          <td class="mono" style="font-weight: 700; color: var(--primary);">${item.id}</td>
          <td><strong>${item.type}</strong></td>
          <td style="max-width: 260px;">
            <div style="font-weight: 600;">${this.escapeHTML(item.title)}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">🛠️ ${this.escapeHTML(item.mitigation)}</div>
          </td>
          <td>
            <span class="severity-pill ${severityClass}">${item.severity} (${item.score})</span>
          </td>
          <td>👤 ${this.escapeHTML(item.owner)}</td>
          <td><span class="kpi-badge badge-neutral">${item.status}</span></td>
          <td>
            <button class="btn-icon" style="width: 26px; height: 26px; font-size: 0.75rem;" onclick="SprintRAIDManager.deleteItem('${item.id}')" title="Delete item">
              ✕
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};
