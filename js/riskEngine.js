/**
 * SprintPulse - Heuristic Risk & Bottleneck Detection Engine
 * Evaluates active sprint data and flags actionable delivery risks
 */

const SprintRiskEngine = {
  /**
   * Scans sprint data and returns an array of detected risk alerts
   */
  evaluateSprintRisks(sprint) {
    if (!sprint) return [];

    const alerts = [];

    // 1. Check for Scope Creep (> 10% of committed points)
    const committed = sprint.committedPoints || 0;
    const addedMidSprint = sprint.addedPointsMidSprint || 0;
    if (committed > 0 && addedMidSprint > 0) {
      const scopeCreepPct = (addedMidSprint / committed) * 100;
      if (scopeCreepPct >= 15) {
        alerts.push({
          id: 'risk-scope-critical',
          type: 'critical',
          title: 'High Scope Volatility Detected',
          desc: `+${addedMidSprint} SP (${scopeCreepPct.toFixed(1)}%) injected mid-sprint. Threatens sprint commitment.`,
          recommendation: 'Freeze scope changes immediately and renegotiate sprint backlog priorities.'
        });
      } else if (scopeCreepPct >= 5) {
        alerts.push({
          id: 'risk-scope-warn',
          type: 'warning',
          title: 'Moderate Scope Creep',
          desc: `+${addedMidSprint} SP (${scopeCreepPct.toFixed(1)}%) added after sprint kickoff.`,
          recommendation: 'Ensure acceptance criteria are locked and verify QA capacity.'
        });
      }
    }

    // 2. Check for Overallocated Developers (> 100% capacity)
    if (sprint.workload) {
      sprint.workload.forEach(dev => {
        if (dev.assignedSP > dev.capacitySP) {
          const overage = dev.assignedSP - dev.capacitySP;
          alerts.push({
            id: `risk-overload-${dev.memberId}`,
            type: 'warning',
            title: `Capacity Overload: ${dev.name}`,
            desc: `Assigned ${dev.assignedSP} SP against ${dev.capacitySP} SP maximum capacity (+${overage} SP over).`,
            recommendation: `Reassign ${overage} SP to peer developers or move low-priority subtasks to next sprint.`
          });
        }
      });
    }

    // 3. Check for Stagnant Code Reviews (> 48 hours)
    if (sprint.tasks) {
      const overdueReviews = sprint.tasks.filter(t => t.status === 'In Review' && t.reviewHours >= 48);
      overdueReviews.forEach(t => {
        alerts.push({
          id: `risk-review-${t.id}`,
          type: 'critical',
          title: `Code Review Bottleneck: ${t.id}`,
          desc: `Task "${t.title.substring(0, 45)}..." in review for ${t.reviewHours} hours without merge.`,
          recommendation: 'Facilitate a 15-minute PR swarm session immediately after morning standup.'
        });
      });
    }

    // 4. Check for Burndown Trajectory Slippage
    const currentDayData = sprint.dailyBurndown?.find(d => d.day === sprint.currentDay);
    if (currentDayData && currentDayData.remaining !== null && currentDayData.ideal > 0) {
      const variance = currentDayData.remaining - currentDayData.ideal;
      if (variance > (sprint.committedPoints * 0.18)) {
        alerts.push({
          id: 'risk-burndown-slip',
          type: 'warning',
          title: 'Burndown Trajectory Lagging Schedule',
          desc: `Remaining points (${currentDayData.remaining} SP) exceed ideal baseline (${currentDayData.ideal.toFixed(1)} SP) by ${variance.toFixed(1)} SP.`,
          recommendation: 'Check for hidden technical blockers or QA test environment delays.'
        });
      }
    }

    // 5. If no critical/warning risks found, return positive status
    if (alerts.length === 0) {
      alerts.push({
        id: 'status-healthy',
        type: 'info',
        title: 'Sprint Trajectory Optimal',
        desc: 'Velocity adherence is on track with zero detected review bottlenecks or overallocation.',
        recommendation: 'Continue standard standup cadence and prepare release candidate.'
      });
    }

    return alerts;
  }
};
