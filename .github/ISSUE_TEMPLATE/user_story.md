---
name: "Agile User Story"
about: "Propose a new feature with business value and acceptance criteria"
title: "[STORY]: "
labels: ["user-story", "needs-refinement"]
assignees: ""
---

## 📖 User Story Definition
**As a** [type of user / persona],  
**I want to** [perform an action or need a capability],  
**So that** [achieve a specific business benefit or outcome].

---

## 🎯 Business Value & Priority
- **Epic / Theme:** (e.g., Metrics Engine, Risk Radar, Ceremonies)
- **MoSCoW Priority:** [ ] Must Have | [ ] Should Have | [ ] Could Have | [ ] Won't Have
- **Story Points (Fibonacci):** [1, 2, 3, 5, 8, 13]
- **Target Sprint:** Sprint XX

---

## 📋 Acceptance Criteria (Gherkin Format)

### Scenario 1: Happy Path
```gherkin
Given [initial context or system state]
When [user performs action or event triggers]
Then [expected system outcome]
And [additional validation check]
```

### Scenario 2: Edge Case / Error Handling
```gherkin
Given [system is in edge condition]
When [user executes invalid action]
Then [system displays appropriate graceful error]
```

---

## 🔒 Definition of Done (DoD) Checklist
- [ ] Requirements match Acceptance Criteria
- [ ] Unit & Integration tests passing (>80% coverage)
- [ ] Code reviewed by at least one peer
- [ ] Responsive UI verified on mobile & desktop
- [ ] Documentation / PM PRD updated
