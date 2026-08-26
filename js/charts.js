/**
 * SprintPulse - Responsive Chart.js Visualizer
 * Renders Burndown, Velocity Trends, and Workload Distribution charts
 */

const SprintCharts = {
  instances: {},

  /**
   * Helper to safely destroy and re-create a chart instance
   */
  getCanvasContext(canvasId) {
    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return canvas.getContext('2d');
  },

  /**
   * Renders Interactive Burndown Chart
   */
  renderBurndown(canvasId, sprint) {
    const ctx = this.getCanvasContext(canvasId);
    if (!ctx || !sprint || !sprint.dailyBurndown) return;

    const days = sprint.dailyBurndown.map(d => `Day ${d.day}`);
    const idealPoints = sprint.dailyBurndown.map(d => d.ideal);
    const actualPoints = sprint.dailyBurndown.map(d => d.remaining);

    // Gradient fill for actual burndown line
    const actualGradient = ctx.createLinearGradient(0, 0, 0, 300);
    actualGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    actualGradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Ideal Burndown Guideline',
            data: idealPoints,
            borderColor: '#94a3b8',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 3,
            pointBackgroundColor: '#94a3b8',
            tension: 0.1,
            fill: false
          },
          {
            label: 'Actual Remaining Story Points',
            data: actualPoints,
            borderColor: '#6366f1',
            borderWidth: 3,
            backgroundColor: actualGradient,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            tension: 0.3,
            fill: true
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
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              afterBody: function(tooltipItems) {
                const dayIndex = tooltipItems[0].dataIndex;
                const note = sprint.dailyBurndown[dayIndex]?.note;
                return note ? `\n📌 Note: ${note}` : '';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          y: {
            title: {
              display: true,
              text: 'Story Points (SP)',
              color: '#64748b',
              font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
            beginAtZero: true
          }
        }
      }
    });
  },

  /**
   * Renders Multi-Sprint Historical Velocity Chart
   */
  renderVelocityTrend(canvasId, history) {
    const ctx = this.getCanvasContext(canvasId);
    if (!ctx || !history) return;

    const labels = history.map(h => h.sprint);
    const committed = history.map(h => h.committed);
    const completed = history.map(h => h.completed);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Committed SP',
            data: committed,
            backgroundColor: 'rgba(148, 163, 184, 0.3)',
            borderColor: '#94a3b8',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Completed SP',
            data: completed,
            backgroundColor: 'rgba(6, 182, 212, 0.85)',
            borderColor: '#06b6d4',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
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
            grid: { display: false },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          y: {
            title: {
              display: true,
              text: 'Story Points (SP)',
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

  /**
   * Renders Code Review Cycle Time Distribution Doughnut Chart
   */
  renderCycleTime(canvasId, tasks) {
    const ctx = this.getCanvasContext(canvasId);
    if (!ctx || !tasks) return;

    let fast = 0;   // < 24h
    let medium = 0; // 24 - 48h
    let delayed = 0;// > 48h

    tasks.forEach(t => {
      if (t.reviewHours > 0) {
        if (t.reviewHours < 24) fast++;
        else if (t.reviewHours <= 48) medium++;
        else delayed++;
      }
    });

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fast (< 24h)', 'Normal (24–48h)', 'Delayed (> 48h Bottleneck)'],
        datasets: [
          {
            data: [fast, medium, delayed],
            backgroundColor: [
              '#10b981', // green
              '#f59e0b', // amber
              '#f43f5e'  // red
            ],
            borderColor: '#111827',
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              usePointStyle: true,
              boxWidth: 8
            }
          }
        }
      }
    });
  }
};
