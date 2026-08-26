/**
 * SprintPulse - Interactive Planning Poker Story Point Estimator
 * Facilitates Fibonacci estimation ceremonies with simulated team consensus
 */

const SprintPlanningPoker = {
  fibonacciCards: [1, 2, 3, 5, 8, 13, 21, '?', '☕'],
  selectedCard: null,
  isRevealed: false,

  currentStory: {
    id: 'STORY-205',
    title: 'Implement Multi-Factor Biometric Passkey Flow',
    description: 'Allow end-users to register WebAuthn hardware tokens or biometric FaceID for zero-trust transaction authorization.',
    acceptanceCriteria: 'Given user is on security settings, When they register passkey, Then cryptographic keypair is generated and stored in secure enclave.'
  },

  teamMembers: [
    { name: 'Dilshan (Tech Lead)', role: 'Backend', vote: 5, avatar: 'DS' },
    { name: 'Nadeesha (Senior Dev)', role: 'Frontend', vote: 5, avatar: 'NF' },
    { name: 'Tharindu (Full-Stack)', role: 'Full-Stack', vote: 8, avatar: 'TP' },
    { name: 'Kavindi (QA Lead)', role: 'QA Automation', vote: 5, avatar: 'KW' }
  ],

  init() {
    this.renderDeck();
    this.renderParticipants();
  },

  selectCard(val) {
    // If it's a numeric string, convert to Number for mathematical operations
    this.selectedCard = (val !== '?' && val !== '☕' && !isNaN(val)) ? Number(val) : val;
    this.renderDeck();
    this.renderParticipants();
  },

  revealVotes() {
    this.isRevealed = true;
    this.renderParticipants();
    this.computeConsensus();
  },

  resetRound() {
    this.selectedCard = null;
    this.isRevealed = false;
    // Generate slight variation in simulated votes for realistic interaction
    this.teamMembers.forEach(m => {
      const options = [3, 5, 5, 8];
      m.vote = options[Math.floor(Math.random() * options.length)];
    });
    this.renderDeck();
    this.renderParticipants();
    const consensusBox = document.getElementById('poker-consensus-results');
    if (consensusBox) consensusBox.style.display = 'none';
  },

  computeConsensus() {
    const numericVotes = this.teamMembers.map(m => m.vote).filter(v => typeof v === 'number');
    if (typeof this.selectedCard === 'number') {
      numericVotes.push(this.selectedCard);
    }

    if (numericVotes.length === 0) return;

    const avg = (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1);
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    const isAgreed = (min === max);

    const consensusBox = document.getElementById('poker-consensus-results');
    if (consensusBox) {
      consensusBox.style.display = 'block';
      consensusBox.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1)); border-color: var(--primary);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Consensus Result</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">
                Average: <span style="color: var(--accent-cyan);">${avg} SP</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="kpi-badge ${isAgreed ? 'badge-positive' : 'badge-warning'}">
                ${isAgreed ? '🎯 100% Team Consensus' : '⚠️ Minor Estimation Variance'}
              </span>
              <button class="btn btn-primary" onclick="SprintPlanningPoker.resetRound()">
                🔄 Next Story
              </button>
            </div>
          </div>
        </div>
      `;
    }
  },

  renderDeck() {
    const deckContainer = document.getElementById('poker-deck-container');
    if (!deckContainer) return;

    deckContainer.innerHTML = this.fibonacciCards.map(val => `
      <div class="poker-card ${this.selectedCard === val ? 'selected' : ''}" onclick="SprintPlanningPoker.selectCard('${val}')">
        <span class="poker-card-corner">${val}</span>
        <span>${val}</span>
        <span class="poker-card-corner bottom">${val}</span>
      </div>
    `).join('');
  },

  renderParticipants() {
    const container = document.getElementById('poker-participants-container');
    if (!container) return;

    let html = `
      <div class="participant-row" style="border-left: 3px solid var(--primary);">
        <div class="participant-info">
          <div class="dev-avatar" style="background: var(--primary); color: #fff;">YOU</div>
          <div>
            <div class="participant-name">You (Associate IT PM)</div>
            <div class="participant-role">Facilitator / Estimator</div>
          </div>
        </div>
        <div class="participant-vote-badge ${!this.isRevealed ? (this.selectedCard ? 'hidden' : '') : ''}">
          ${this.selectedCard !== null ? (this.isRevealed ? this.selectedCard : '✓') : '⏳'}
        </div>
      </div>
    `;

    this.teamMembers.forEach(m => {
      html += `
        <div class="participant-row">
          <div class="participant-info">
            <div class="dev-avatar">${m.avatar}</div>
            <div>
              <div class="participant-name">${m.name}</div>
              <div class="participant-role">${m.role}</div>
            </div>
          </div>
          <div class="participant-vote-badge ${!this.isRevealed ? 'hidden' : ''}">
            ${this.isRevealed ? m.vote : '✓'}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};
