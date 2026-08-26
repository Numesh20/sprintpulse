/**
 * SprintPulse - Cumulative Flow Diagram (CFD) & Little's Law Analyzer
 * Visualizes queue accumulation over time and implements Little's Law: Lead Time = WIP / Throughput
 */

const KanbanAnalytics = {
  cfdChartInstance: null,
  simulatedWIP: 4,
  simulatedThroughput: 0.8,

  init() {
    this.render();
  },

  render() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    if (!sprint || !sprint.dailyCFD) return;

    // 1. Calculate Core Flow Metrics
    const metrics = this.calculateFlowMetrics(squad, sprint);

    // 2. Update UI Widgets
    this.updateUI(metrics);

    // 3. Render CFD Stacked Area Chart
    this.renderCFDChart(sprint.dailyCFD);

    // 4. Update Little's Law Simulator Output
    this.updateSimulatorOutput();
  },

  /**
   * Computes Work In Progress (WIP), Throughput, and Little's Law Lead Time
   */
  calculateFlowMetrics(squad, sprint) {
    const currentDay = sprint.currentDay || 8;
    const tasks = sprint.tasks || [];
    const membersCount = squad.members ? squad.members.length : 4;

    const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
    const inReviewCount = tasks.filter(t => t.status === 'In Review').length;
    const doneCount = tasks.filter(t => t.status === 'Done').length;
    const totalWIP = inProgressCount + inReviewCount;

    // Throughput (items completed per working day)
    const throughput = currentDay > 0 ? Number((doneCount / currentDay).toFixed(2)) : 0.5;

    // Little's Law Estimated Lead Time = WIP / Throughput (in days)
    const littlesLawLeadTime = throughput > 0 ? Number((totalWIP / throughput).toFixed(1)) : 0;

    // Recommended WIP Limit (1.5 * Number of Active Developers)
    const recommendedWIPLimit = Math.round(membersCount * 1.5);
    const isWIPOverloaded = totalWIP > recommendedWIPLimit;

    // Flow Efficiency % (Active execution vs Queue/Wait time)
    const flowEfficiency = totalWIP > 0 
      ? Math.min(100, Math.round((inProgressCount / totalWIP) * 100))
      : 80;

    return {
      totalWIP,
      inProgressCount,
      inReviewCount,
      doneCount,
      throughput,
      littlesLawLeadTime,
      recommendedWIPLimit,
      isWIPOverloaded,
      flowEfficiency
    };
  },

  updateUI(m) {
    const elWIP = document.getElementById('cfd-wip-val');
    const elThroughput = document.getElementById('cfd-throughput-val');
    const elLeadTime = document.getElementById('cfd-leadtime-val');
    const elFlowEff = document.getElementById('cfd-flow-eff-val');
    const elWipLimitStatus = document.getElementById('cfd-wip-status-badge');

    if (elWIP) elWIP.textContent = `${m.totalWIP} Tasks`;
    if (elThroughput) elThroughput.textContent = `${m.throughput} / day`;
    if (elLeadTime) elLeadTime.textContent = `${m.littlesLawLeadTime} Days`;
    if (elFlowEff) elFlowEff.textContent = `${m.flowEfficiency}%`;

    if (elWipLimitStatus) {
      if (m.isWIPOverloaded) {
        elWipLimitStatus.className = 'kpi-badge badge-negative';
        elWipLimitStatus.textContent = `WIP Over Limit (Max ${m.recommendedWIPLimit})`;
      } else {
        elWipLimitStatus.className = 'kpi-badge badge-positive';
        elWipLimitStatus.textContent = `WIP Healthy (Limit: ${m.recommendedWIPLimit})`;
      }
    }
  },

  renderCFDChart(dailyCFD) {
    const canvas = document.getElementById('chart-cfd-canvas');
    if (!canvas) return;

    if (this.cfdChartInstance) {
      this.cfdChartInstance.destroy();
    }

    const labels = dailyCFD.map(d => `Day ${d.day}`);
    const doneData = dailyCFD.map(d => d.done);
    const inReviewData = dailyCFD.map(d => d.inReview);
    const inProgressData = dailyCFD.map(d => d.inProgress);
    const toDoData = dailyCFD.map(d => d.toDo);

    const ctx = canvas.getContext('2d');

    this.cfdChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Done (Completed)',
            data: doneData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.55)',
            fill: true,
            tension: 0.25,
            pointRadius: 3
          },
          {
            label: 'In Review (Code Review & QA)',
            data: inReviewData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.55)',
            fill: true,
            tension: 0.25,
            pointRadius: 3
          },
          {
            label: 'In Progress (Active Dev)',
            data: inProgressData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.55)',
            fill: true,
            tension: 0.25,
            pointRadius: 3
          },
          {
            label: 'To Do (Backlog Queue)',
            data: toDoData,
            borderColor: '#64748b',
            backgroundColor: 'rgba(100, 116, 139, 0.45)',
            fill: true,
            tension: 0.25,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Cumulative Task Count',
              color: '#64748b',
              font: { family: 'Plus Jakarta Sans', size: 11 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b' },
            beginAtZero: true
          }
        }
      }
    });
  },

  setSimulatedWIP(val) {
    this.simulatedWIP = parseInt(val, 10) || 1;
    this.updateSimulatorOutput();
  },

  setSimulatedThroughput(val) {
    this.simulatedThroughput = parseFloat(val) || 0.1;
    this.updateSimulatorOutput();
  },

  updateSimulatorOutput() {
    const calcLeadTime = Number((this.simulatedWIP / this.simulatedThroughput).toFixed(1));
    const elLeadTimeResult = document.getElementById('ll-calc-leadtime');
    const elWipDisplay = document.getElementById('ll-wip-display');
    const elThroughputDisplay = document.getElementById('ll-throughput-display');

    if (elLeadTimeResult) elLeadTimeResult.textContent = `${calcLeadTime} Days`;
    if (elWipDisplay) elWipDisplay.textContent = `${this.simulatedWIP} Tasks`;
    if (elThroughputDisplay) elThroughputDisplay.textContent = `${this.simulatedThroughput} Tasks/Day`;
  }
};
