/**
 * SprintPulse - Monte Carlo Agile Velocity Simulator
 * Runs probabilistic simulations (1,000+ iterations) using historical team velocity
 * Computes P95, P85, P50, and P15 confidence intervals for sprint commitment forecasting
 */

const MonteCarloSimulator = {
  chartInstance: null,
  simulationRuns: 2000,
  targetSP: 40,

  init() {
    this.runSimulation();
  },

  /**
   * Generates a Gaussian random variable using Box-Muller transform
   */
  randomGaussian(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * stdDev;
  },

  /**
   * Executes the Monte Carlo simulation
   */
  runSimulation() {
    const squad = SPRINT_PULSE_DATA.squads[SPRINT_PULSE_DATA.activeSquadId];
    const sprint = squad.sprints[SPRINT_PULSE_DATA.activeSprintId];
    if (!sprint || !sprint.historicalVelocity) return;

    // 1. Extract historical completed velocities
    const historicalPoints = sprint.historicalVelocity.map(h => h.completed);
    const n = historicalPoints.length;
    if (n === 0) return;

    // Calculate sample mean (mu) and sample standard deviation (sigma)
    const mean = historicalPoints.reduce((sum, val) => sum + val, 0) / n;
    const variance = historicalPoints.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.max(1.5, Math.sqrt(variance)); // Minimum variance guard

    // 2. Run N Monte Carlo simulated sprint iterations
    const simulatedOutcomes = [];
    for (let i = 0; i < this.simulationRuns; i++) {
      // Sample randomly from the historical distribution with slight stochastic variation
      const sampledVal = Math.round(this.randomGaussian(mean, stdDev));
      simulatedOutcomes.push(Math.max(10, sampledVal)); // Floor at minimum 10 SP
    }

    // Sort outcomes ascending
    simulatedOutcomes.sort((a, b) => a - b);

    // 3. Compute Percentiles (P95, P85, P50, P15)
    // Note: In Agile forecasting, P85 means 85% of outcomes were >= that value
    const p95 = simulatedOutcomes[Math.floor(this.simulationRuns * 0.05)];
    const p85 = simulatedOutcomes[Math.floor(this.simulationRuns * 0.15)];
    const p50 = simulatedOutcomes[Math.floor(this.simulationRuns * 0.50)];
    const p15 = simulatedOutcomes[Math.floor(this.simulationRuns * 0.85)];

    // 4. Calculate probability of hitting specific Target SP
    const successfulRuns = simulatedOutcomes.filter(sp => sp >= this.targetSP).length;
    const targetProbability = Number(((successfulRuns / this.simulationRuns) * 100).toFixed(1));

    // 5. Update UI Widgets
    this.updateUI({
      mean: Number(mean.toFixed(1)),
      stdDev: Number(stdDev.toFixed(1)),
      p95,
      p85,
      p50,
      p15,
      targetProbability
    });

    // 6. Render Chart
    this.renderChart(simulatedOutcomes, { p85, p50 });
  },

  updateUI({ mean, stdDev, p95, p85, p50, p15, targetProbability }) {
    const elMean = document.getElementById('mc-stat-mean');
    const elStdDev = document.getElementById('mc-stat-stddev');
    const elP95 = document.getElementById('mc-p95-val');
    const elP85 = document.getElementById('mc-p85-val');
    const elP50 = document.getElementById('mc-p50-val');
    const elP15 = document.getElementById('mc-p15-val');
    const elTargetProb = document.getElementById('mc-target-prob-val');
    const elTargetInput = document.getElementById('mc-target-input');

    if (elMean) elMean.textContent = `${mean} SP`;
    if (elStdDev) elStdDev.textContent = `±${stdDev} SP`;
    if (elP95) elP95.textContent = `≥ ${p95} SP`;
    if (elP85) elP85.textContent = `≥ ${p85} SP`;
    if (elP50) elP50.textContent = `≥ ${p50} SP`;
    if (elP15) elP15.textContent = `≥ ${p15} SP`;

    if (elTargetProb) {
      elTargetProb.textContent = `${targetProbability}%`;
      const badge = document.getElementById('mc-target-prob-badge');
      if (badge) {
        if (targetProbability >= 80) {
          badge.className = 'kpi-badge badge-positive';
          badge.textContent = 'High Confidence Delivery';
        } else if (targetProbability >= 50) {
          badge.className = 'kpi-badge badge-warning';
          badge.textContent = 'Moderate Risk Commitment';
        } else {
          badge.className = 'kpi-badge badge-negative';
          badge.textContent = 'High Risk / Unrealistic Commitment';
        }
      }
    }

    if (elTargetInput && elTargetInput.value !== String(this.targetSP)) {
      elTargetInput.value = this.targetSP;
    }
  },

  setTargetSP(val) {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      this.targetSP = num;
      this.runSimulation();
    }
  },

  setRuns(runs) {
    this.simulationRuns = parseInt(runs, 10) || 2000;
    this.runSimulation();
  },

  renderChart(outcomes, { p85, p50 }) {
    const canvas = document.getElementById('chart-monte-carlo-canvas');
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Build frequency histogram of outcomes
    const minSP = outcomes[0];
    const maxSP = outcomes[outcomes.length - 1];
    const labels = [];
    const frequencyData = [];

    for (let sp = minSP; sp <= maxSP; sp++) {
      labels.push(`${sp} SP`);
      const count = outcomes.filter(v => v === sp).length;
      frequencyData.push(count);
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: `Frequency (${this.simulationRuns.toLocaleString()} Iterations)`,
            data: frequencyData,
            backgroundColor: gradient,
            borderColor: '#6366f1',
            borderWidth: 1.5,
            borderRadius: 4
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
            cornerRadius: 8,
            callbacks: {
              afterBody: function(tooltipItems) {
                const spVal = parseInt(labels[tooltipItems[0].dataIndex], 10);
                const probOrHigher = Number(((outcomes.filter(v => v >= spVal).length / outcomes.length) * 100).toFixed(1));
                return `\nProbability of delivering ≥ ${spVal} SP: ${probOrHigher}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          y: {
            title: {
              display: true,
              text: 'Simulated Frequency (Count)',
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
  }
};
