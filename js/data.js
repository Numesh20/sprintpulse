/**
 * SprintPulse - Data Store & Sample Datasets
 * Contains pre-configured real-world agile sprint data for 3 distinct engineering squads:
 * 1. Fintech Core Banking Squad (Strict compliance, high predictability)
 * 2. E-Commerce Mobile Squad (Rapid release, high scope volatility)
 * 3. Enterprise SaaS AI Platform Squad (Research spikes, review bottlenecks)
 */

const SPRINT_PULSE_DATA = {
  activeSquadId: 'fintech',
  activeSprintId: 'sprint_4',

  squads: {
    fintech: {
      id: 'fintech',
      name: 'Fintech Core Banking Squad',
      domain: 'Payments & Settlement Services',
      members: [
        { id: 'm1', name: 'Dilshan Silva', role: 'Tech Lead / Backend', capacitySP: 12, avatar: 'DS' },
        { id: 'm2', name: 'Nadeesha Fernando', role: 'Senior Frontend Engineer', capacitySP: 10, avatar: 'NF' },
        { id: 'm3', name: 'Tharindu Perera', role: 'Full-Stack Developer', capacitySP: 10, avatar: 'TP' },
        { id: 'm4', name: 'Kavindi Wickramasinghe', role: 'QA Automation Lead', capacitySP: 8, avatar: 'KW' },
        { id: 'm5', name: 'Chamara Bandara', role: 'DevOps / Cloud Specialist', capacitySP: 6, avatar: 'CB' }
      ],
      sprints: {
        sprint_4: {
          id: 'sprint_4',
          name: 'Sprint 04: Real-time QR Settlement',
          goal: 'Deliver ISO-20022 compliant QR payment processing gateway with <200ms latency.',
          startDate: '2026-08-10',
          endDate: '2026-08-24',
          totalDays: 10,
          currentDay: 8,
          committedPoints: 44,
          completedPoints: 36,
          addedPointsMidSprint: 3,
          dailyBurndown: [
            { day: 1, ideal: 44.0, actual: 44, remaining: 44, note: 'Sprint kickoff & backlog grooming' },
            { day: 2, ideal: 39.6, actual: 44, remaining: 44, note: 'Architectural scaffolding' },
            { day: 3, ideal: 35.2, actual: 41, remaining: 41, note: 'Payment schema validation passed' },
            { day: 4, ideal: 30.8, actual: 35, remaining: 38, note: '+3 SP Scope: Added extra audit log' },
            { day: 5, ideal: 26.4, actual: 30, remaining: 30, note: 'Kafka event stream integrated' },
            { day: 6, ideal: 22.0, actual: 24, remaining: 24, note: 'Frontend checkout modal complete' },
            { day: 7, ideal: 17.6, actual: 18, remaining: 18, note: 'E2E sandbox test suites passed' },
            { day: 8, ideal: 13.2, actual: 11, remaining: 11, note: 'Load testing & security scan' },
            { day: 9, ideal: 8.8, actual: null, remaining: null, note: 'Planned CAB deployment prep' },
            { day: 10, ideal: 0.0, actual: null, remaining: null, note: 'Sprint Demo & Retrospective' }
          ],
          workload: [
            { memberId: 'm1', name: 'Dilshan Silva', assignedSP: 13, capacitySP: 12, role: 'Tech Lead / Backend' },
            { memberId: 'm2', name: 'Nadeesha Fernando', assignedSP: 10, capacitySP: 10, role: 'Senior Frontend' },
            { memberId: 'm3', name: 'Tharindu Perera', assignedSP: 9, capacitySP: 10, role: 'Full-Stack Dev' },
            { memberId: 'm4', name: 'Kavindi Wickramasinghe', assignedSP: 9, capacitySP: 8, role: 'QA Lead' },
            { memberId: 'm5', name: 'Chamara Bandara', assignedSP: 6, capacitySP: 6, role: 'DevOps' }
          ],
          historicalVelocity: [
            { sprint: 'Sprint 01', committed: 40, completed: 35, predictability: 87.5 },
            { sprint: 'Sprint 02', committed: 42, completed: 38, predictability: 90.4 },
            { sprint: 'Sprint 03', committed: 45, completed: 43, predictability: 95.5 },
            { sprint: 'Sprint 04 (Current)', committed: 44, completed: 36, predictability: 81.8 }
          ],
          dailyCFD: [
            { day: 1, done: 0, inReview: 0, inProgress: 2, toDo: 7 },
            { day: 2, done: 0, inReview: 1, inProgress: 3, toDo: 5 },
            { day: 3, done: 1, inReview: 1, inProgress: 3, toDo: 4 },
            { day: 4, done: 2, inReview: 2, inProgress: 3, toDo: 3 },
            { day: 5, done: 3, inReview: 1, inProgress: 3, toDo: 3 },
            { day: 6, done: 4, inReview: 2, inProgress: 2, toDo: 2 },
            { day: 7, done: 5, inReview: 2, inProgress: 2, toDo: 1 },
            { day: 8, done: 5, inReview: 1, inProgress: 2, toDo: 1 }
          ],
          tasks: [
            { id: 'FIN-101', title: 'Implement EMVCo QR code parsing algorithm', sp: 5, status: 'Done', assignee: 'Dilshan Silva', reviewHours: 12 },
            { id: 'FIN-102', title: 'Design responsive mobile checkout QR scanner component', sp: 8, status: 'Done', assignee: 'Nadeesha Fernando', reviewHours: 18 },
            { id: 'FIN-103', title: 'Integrate central switch HMAC SHA-256 signature validation', sp: 5, status: 'Done', assignee: 'Dilshan Silva', reviewHours: 16 },
            { id: 'FIN-104', title: 'Build automated transaction settlement retry queue in Redis', sp: 5, status: 'Done', assignee: 'Tharindu Perera', reviewHours: 22 },
            { id: 'FIN-105', title: 'Execute regression test suite for cross-bank settlements', sp: 5, status: 'Done', assignee: 'Kavindi Wickramasinghe', reviewHours: 8 },
            { id: 'FIN-106', title: 'Security compliance: PCI-DSS tokenization audit logging (Mid-sprint)', sp: 3, status: 'In Progress', assignee: 'Tharindu Perera', reviewHours: 4 },
            { id: 'FIN-107', title: 'Multi-region AWS ECS failover orchestration scripts', sp: 5, status: 'In Review', assignee: 'Chamara Bandara', reviewHours: 52 },
            { id: 'FIN-108', title: 'Merchant portal settlement reconciliation export CSV', sp: 5, status: 'In Progress', assignee: 'Nadeesha Fernando', reviewHours: 0 },
            { id: 'FIN-109', title: 'End-to-end chaos monkey latency injection testing', sp: 3, status: 'To Do', assignee: 'Kavindi Wickramasinghe', reviewHours: 0 }
          ]
        },
        sprint_3: {
          id: 'sprint_3',
          name: 'Sprint 03: Biometric Auth & Security Hardening',
          goal: 'Implement WebAuthn FaceID/Fingerprint integration and audit token generation.',
          startDate: '2026-07-27',
          endDate: '2026-08-10',
          totalDays: 10,
          currentDay: 10,
          committedPoints: 45,
          completedPoints: 43,
          addedPointsMidSprint: 2,
          dailyBurndown: [
            { day: 1, ideal: 45.0, actual: 45, remaining: 45 },
            { day: 2, ideal: 40.5, actual: 45, remaining: 45 },
            { day: 3, ideal: 36.0, actual: 40, remaining: 40 },
            { day: 4, ideal: 31.5, actual: 34, remaining: 34 },
            { day: 5, ideal: 27.0, actual: 28, remaining: 28 },
            { day: 6, ideal: 22.5, actual: 21, remaining: 21 },
            { day: 7, ideal: 18.0, actual: 15, remaining: 15 },
            { day: 8, ideal: 13.5, actual: 9, remaining: 9 },
            { day: 9, ideal: 9.0, actual: 4, remaining: 4 },
            { day: 10, ideal: 0.0, actual: 2, remaining: 2 }
          ],
          workload: [
            { memberId: 'm1', name: 'Dilshan Silva', assignedSP: 12, capacitySP: 12, role: 'Tech Lead / Backend' },
            { memberId: 'm2', name: 'Nadeesha Fernando', assignedSP: 10, capacitySP: 10, role: 'Senior Frontend' },
            { memberId: 'm3', name: 'Tharindu Perera', assignedSP: 10, capacitySP: 10, role: 'Full-Stack Dev' },
            { memberId: 'm4', name: 'Kavindi Wickramasinghe', assignedSP: 8, capacitySP: 8, role: 'QA Lead' },
            { memberId: 'm5', name: 'Chamara Bandara', assignedSP: 5, capacitySP: 6, role: 'DevOps' }
          ],
          historicalVelocity: [
            { sprint: 'Sprint 01', committed: 40, completed: 35, predictability: 87.5 },
            { sprint: 'Sprint 02', committed: 42, completed: 38, predictability: 90.4 },
            { sprint: 'Sprint 03', committed: 45, completed: 43, predictability: 95.5 }
          ],
          tasks: []
        }
      }
    },

    ecommerce: {
      id: 'ecommerce',
      name: 'E-Commerce Mobile Squad',
      domain: 'Consumer iOS / Android Shopping App',
      members: [
        { id: 'ec1', name: 'Shenal Jayawardena', role: 'Lead Mobile Architect', capacitySP: 12, avatar: 'SJ' },
        { id: 'ec2', name: 'Anuki Senaratne', role: 'React Native / UI Specialist', capacitySP: 10, avatar: 'AS' },
        { id: 'ec3', name: 'Malik Deen', role: 'Microservices Backend Dev', capacitySP: 10, avatar: 'MD' },
        { id: 'ec4', name: 'Hiruni Fonseka', role: 'QA Engineer', capacitySP: 8, avatar: 'HF' }
      ],
      sprints: {
        sprint_4: {
          id: 'sprint_4',
          name: 'Sprint 04: Flash Sale Engine & Cart Optimization',
          goal: 'Scale checkout service to handle 15,000 req/sec during midnight flash sale campaign.',
          startDate: '2026-08-10',
          endDate: '2026-08-24',
          totalDays: 10,
          currentDay: 8,
          committedPoints: 38,
          completedPoints: 26,
          addedPointsMidSprint: 9, // Heavy scope creep
          dailyBurndown: [
            { day: 1, ideal: 38.0, actual: 38, remaining: 38, note: 'Kickoff' },
            { day: 2, ideal: 34.2, actual: 38, remaining: 38, note: 'In design review' },
            { day: 3, ideal: 30.4, actual: 35, remaining: 35, note: 'Cart refactor started' },
            { day: 4, ideal: 26.6, actual: 33, remaining: 42, note: '+9 SP Unplanned marketing voucher request' },
            { day: 5, ideal: 22.8, actual: 30, remaining: 38, note: 'Voucher engine backend completed' },
            { day: 6, ideal: 19.0, actual: 26, remaining: 32, note: 'Cart UI animations lag on Android' },
            { day: 7, ideal: 15.2, actual: 22, remaining: 26, note: 'QA caught edge-case double discount bug' },
            { day: 8, ideal: 11.4, actual: 18, remaining: 21, note: 'Patching concurrency lock' },
            { day: 9, ideal: 7.6, actual: null, remaining: null, note: 'Load simulation testing' },
            { day: 10, ideal: 0.0, actual: null, remaining: null, note: 'Store release build' }
          ],
          workload: [
            { memberId: 'ec1', name: 'Shenal Jayawardena', assignedSP: 15, capacitySP: 12, role: 'Lead Architect' },
            { memberId: 'ec2', name: 'Anuki Senaratne', assignedSP: 12, capacitySP: 10, role: 'UI Specialist' },
            { memberId: 'ec3', name: 'Malik Deen', assignedSP: 11, capacitySP: 10, role: 'Backend Dev' },
            { memberId: 'ec4', name: 'Hiruni Fonseka', assignedSP: 9, capacitySP: 8, role: 'QA Engineer' }
          ],
          historicalVelocity: [
            { sprint: 'Sprint 01', committed: 35, completed: 32, predictability: 91.4 },
            { sprint: 'Sprint 02', committed: 36, completed: 30, predictability: 83.3 },
            { sprint: 'Sprint 03', committed: 36, completed: 34, predictability: 94.4 },
            { sprint: 'Sprint 04 (Current)', committed: 38, completed: 26, predictability: 68.4 }
          ],
          dailyCFD: [
            { day: 1, done: 0, inReview: 0, inProgress: 2, toDo: 5 },
            { day: 2, done: 0, inReview: 1, inProgress: 2, toDo: 4 },
            { day: 3, done: 1, inReview: 1, inProgress: 2, toDo: 3 },
            { day: 4, done: 2, inReview: 1, inProgress: 3, toDo: 3 },
            { day: 5, done: 3, inReview: 2, inProgress: 2, toDo: 2 },
            { day: 6, done: 3, inReview: 2, inProgress: 2, toDo: 1 },
            { day: 7, done: 4, inReview: 2, inProgress: 1, toDo: 1 },
            { day: 8, done: 4, inReview: 1, inProgress: 1, toDo: 1 }
          ],
          tasks: [
            { id: 'ECM-201', title: 'High-throughput inventory decrement using Redis locks', sp: 8, status: 'Done', assignee: 'Malik Deen', reviewHours: 14 },
            { id: 'ECM-202', title: 'Flash sale countdown timer animation with sticky header', sp: 5, status: 'Done', assignee: 'Anuki Senaratne', reviewHours: 10 },
            { id: 'ECM-203', title: 'Apple Pay & Google Pay direct checkout bottom sheet', sp: 8, status: 'Done', assignee: 'Shenal Jayawardena', reviewHours: 24 },
            { id: 'ECM-204', title: 'Dynamic Promo code stacked discount calculation (Mid-sprint)', sp: 5, status: 'Done', assignee: 'Malik Deen', reviewHours: 18 },
            { id: 'ECM-205', title: 'Banner notification for price drops during flash sale (Mid-sprint)', sp: 4, status: 'In Review', assignee: 'Anuki Senaratne', reviewHours: 58 },
            { id: 'ECM-206', title: 'Fix Android 14 frame drop on heavy cart item swipe', sp: 5, status: 'In Progress', assignee: 'Shenal Jayawardena', reviewHours: 6 },
            { id: 'ECM-207', title: 'Automated Artillery load testing for checkout endpoints', sp: 3, status: 'To Do', assignee: 'Hiruni Fonseka', reviewHours: 0 }
          ]
        }
      }
    },

    saas: {
      id: 'saas',
      name: 'Enterprise SaaS AI Platform Squad',
      domain: 'Document Intelligence & Workflow Automation',
      members: [
        { id: 'sa1', name: 'Dr. Praveen Mendis', role: 'Principal AI Engineer', capacitySP: 10, avatar: 'PM' },
        { id: 'sa2', name: 'Sachini Rodrigo', role: 'Full-Stack React/FastAPI', capacitySP: 10, avatar: 'SR' },
        { id: 'sa3', name: 'Dinesh Alwis', role: 'Data Pipeline Specialist', capacitySP: 10, avatar: 'DA' },
        { id: 'sa4', name: 'Ashan Gamage', role: 'MLOps & Infrastructure', capacitySP: 8, avatar: 'AG' }
      ],
      sprints: {
        sprint_4: {
          id: 'sprint_4',
          name: 'Sprint 04: Vector Search & Multi-Tenant RAG',
          goal: 'Implement pgvector embedding store and sub-second semantic retrieval pipeline.',
          startDate: '2026-08-10',
          endDate: '2026-08-24',
          totalDays: 10,
          currentDay: 8,
          committedPoints: 36,
          completedPoints: 32,
          addedPointsMidSprint: 1,
          dailyBurndown: [
            { day: 1, ideal: 36.0, actual: 36, remaining: 36 },
            { day: 2, ideal: 32.4, actual: 36, remaining: 36 },
            { day: 3, ideal: 28.8, actual: 33, remaining: 33 },
            { day: 4, ideal: 25.2, actual: 28, remaining: 28 },
            { day: 5, ideal: 21.6, actual: 24, remaining: 25 },
            { day: 6, ideal: 18.0, actual: 18, remaining: 18 },
            { day: 7, ideal: 14.4, actual: 12, remaining: 12 },
            { day: 8, ideal: 10.8, actual: 5, remaining: 5 },
            { day: 9, ideal: 7.2, actual: null, remaining: null },
            { day: 10, ideal: 0.0, actual: null, remaining: null }
          ],
          workload: [
            { memberId: 'sa1', name: 'Dr. Praveen Mendis', assignedSP: 10, capacitySP: 10, role: 'AI Engineer' },
            { memberId: 'sa2', name: 'Sachini Rodrigo', assignedSP: 10, capacitySP: 10, role: 'Full-Stack Dev' },
            { memberId: 'sa3', name: 'Dinesh Alwis', assignedSP: 9, capacitySP: 10, role: 'Data Engineer' },
            { memberId: 'sa4', name: 'Ashan Gamage', assignedSP: 8, capacitySP: 8, role: 'MLOps' }
          ],
          historicalVelocity: [
            { sprint: 'Sprint 01', committed: 32, completed: 30, predictability: 93.7 },
            { sprint: 'Sprint 02', committed: 34, completed: 33, predictability: 97.0 },
            { sprint: 'Sprint 03', committed: 35, completed: 35, predictability: 100.0 },
            { sprint: 'Sprint 04 (Current)', committed: 36, completed: 32, predictability: 88.9 }
          ],
          dailyCFD: [
            { day: 1, done: 0, inReview: 0, inProgress: 2, toDo: 4 },
            { day: 2, done: 0, inReview: 1, inProgress: 2, toDo: 3 },
            { day: 3, done: 1, inReview: 1, inProgress: 2, toDo: 2 },
            { day: 4, done: 2, inReview: 1, inProgress: 2, toDo: 1 },
            { day: 5, done: 3, inReview: 1, inProgress: 1, toDo: 1 },
            { day: 6, done: 4, inReview: 1, inProgress: 1, toDo: 0 },
            { day: 7, done: 4, inReview: 1, inProgress: 1, toDo: 0 },
            { day: 8, done: 4, inReview: 1, inProgress: 1, toDo: 0 }
          ],
          tasks: [
            { id: 'SAS-301', title: 'Setup pgvector extension on AWS Aurora PostgreSQL', sp: 5, status: 'Done', assignee: 'Ashan Gamage', reviewHours: 8 },
            { id: 'SAS-302', title: 'Batch chunking & embedding generation with OpenAI API', sp: 8, status: 'Done', assignee: 'Dr. Praveen Mendis', reviewHours: 12 },
            { id: 'SAS-303', title: 'Multi-tenant row-level security isolation for vector query', sp: 8, status: 'Done', assignee: 'Dinesh Alwis', reviewHours: 16 },
            { id: 'SAS-304', title: 'Semantic document citation highlight viewer in React', sp: 8, status: 'Done', assignee: 'Sachini Rodrigo', reviewHours: 14 },
            { id: 'SAS-305', title: 'Rate limiting & token usage telemetry dashboard', sp: 5, status: 'In Review', assignee: 'Sachini Rodrigo', reviewHours: 32 },
            { id: 'SAS-306', title: 'Benchmarking cosine similarity retrieval under load', sp: 3, status: 'In Progress', assignee: 'Dr. Praveen Mendis', reviewHours: 6 }
          ]
        }
      }
    }
  }
};
