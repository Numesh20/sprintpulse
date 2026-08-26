/**
 * SprintPulse - Agile Metrics & Mathematical Calculation Engine
 * Computes KPIs, Velocity, Burndown trajectories, Scope Volatility, and Sprint Health Score
 */

const SprintMetrics = {
  /**
   * Calculates all primary sprint KPIs
   */
  calculateSprintKPIs(sprint) {
    if (!sprint) return null;

    const committed = sprint.committedPoints || 0;
    const completed = sprint.completedPoints || 0;
    const addedMidSprint = sprint.addedPointsMidSprint || 0;
    const totalScope = committed + addedMidSprint;

    // 1. Predictability Ratio (%)
    const predictability = committed > 0 
      ? Math.min(100, Math.round((completed / committed) * 100)) 
      : 0;

    // 2. Scope Creep / Volatility Index (%)
    const scopeCreepIndex = committed > 0 
      ? Number(((addedMidSprint / committed) * 100).toFixed(1))
      : 0;

    // 3. Completion Progress (%)
    const progressPercent = totalScope > 0 
      ? Math.round((completed / totalScope) * 100) 
      : 0;

    // 4. Burndown Trajectory Variance
    const currentDayData = sprint.dailyBurndown?.find(d => d.day === sprint.currentDay);
    const idealRemaining = currentDayData ? currentDayData.ideal : 0;
    const actualRemaining = currentDayData && currentDayData.remaining !== null 
      ? currentDayData.remaining 
      : (totalScope - completed);

    const burndownVariance = idealRemaining > 0 
      ? Number(((actualRemaining - idealRemaining) / idealRemaining * 100).toFixed(1))
      : 0;

    // 5. Code Review Cycle Time Metrics
    const reviewTasks = sprint.tasks ? sprint.tasks.filter(t => t.reviewHours > 0) : [];
    const avgReviewHours = reviewTasks.length > 0 
      ? Math.round(reviewTasks.reduce((acc, t) => acc + t.reviewHours, 0) / reviewTasks.length)
      : 0;
    const overdueReviewCount = sprint.tasks ? sprint.tasks.filter(t => t.status === 'In Review' && t.reviewHours >= 48).length : 0;

    // 6. Overallocation Count
    const overallocatedDevs = sprint.workload 
      ? sprint.workload.filter(w => w.assignedSP > w.capacitySP)
      : [];

    // 7. Composite Sprint Health Score (0 - 100)
    const healthScore = this.computeHealthScore({
      predictability,
      burndownVariance,
      scopeCreepIndex,
      overdueReviewCount,
      overallocatedDevCount: overallocatedDevs.length,
      currentDay: sprint.currentDay,
      totalDays: sprint.totalDays
    });

    return {
      committed,
      completed,
      addedMidSprint,
      totalScope,
      predictability,
      scopeCreepIndex,
      progressPercent,
      idealRemaining,
      actualRemaining,
      burndownVariance,
      avgReviewHours,
      overdueReviewCount,
      overallocatedDevs,
      healthScore
    };
  },

  /**
   * Computes a weighted 0-100 Sprint Health Index
   */
  computeHealthScore({ predictability, burndownVariance, scopeCreepIndex, overdueReviewCount, overallocatedDevCount, currentDay, totalDays }) {
    let score = 100;

    // Penalty 1: Burndown delay (if actual remaining is higher than ideal)
    if (burndownVariance > 10) {
      score -= Math.min(25, (burndownVariance - 10) * 0.75);
    }

    // Penalty 2: Scope creep penalty
    if (scopeCreepIndex > 5) {
      score -= Math.min(20, (scopeCreepIndex - 5) * 1.2);
    }

    // Penalty 3: Overallocated team members
    score -= (overallocatedDevCount * 8);

    // Penalty 4: Stagnant code reviews (>48h)
    score -= (overdueReviewCount * 10);

    // Clamp score between 10 and 100
    score = Math.max(15, Math.min(100, Math.round(score)));

    let status = 'Optimal';
    let statusClass = 'success';

    if (score < 60) {
      status = 'Critical Risk';
      statusClass = 'danger';
    } else if (score < 75) {
      status = 'Needs Attention';
      statusClass = 'warning';
    } else if (score < 90) {
      status = 'Healthy';
      statusClass = 'primary';
    }

    return {
      value: score,
      status,
      statusClass
    };
  },

  /**
   * Computes historical velocity averages
   */
  calculateHistoricalStats(history) {
    if (!history || history.length === 0) return { avgVelocity: 0, avgPredictability: 0 };

    const totalCompleted = history.reduce((sum, h) => sum + h.completed, 0);
    const totalCommitted = history.reduce((sum, h) => sum + h.committed, 0);

    const avgVelocity = Number((totalCompleted / history.length).toFixed(1));
    const avgPredictability = totalCommitted > 0 
      ? Number(((totalCompleted / totalCommitted) * 100).toFixed(1))
      : 0;

    return {
      avgVelocity,
      avgPredictability
    };
  }
};
