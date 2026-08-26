/**
 * SprintPulse - Interactive Sprint Retrospective Module
 * Manages 3-column retro board with upvoting, categorization, and persistence
 */

const SprintRetrospective = {
  storageKey: 'sprint_pulse_retros',

  defaultCards: [
    { id: 'rc-1', category: 'went-well', text: 'Clean modular vanilla JS architecture made metric development fast.', author: 'Dilshan S.', votes: 5 },
    { id: 'rc-2', category: 'went-well', text: 'Daily 15-min PR swarm cleared 8 overdue review bottlenecks!', author: 'Nadeesha F.', votes: 7 },
    { id: 'rc-3', category: 'to-improve', text: 'High-DPI canvas blurry rendering cost us 1.5 engineering days.', author: 'Tharindu P.', votes: 4 },
    { id: 'rc-4', category: 'to-improve', text: 'Mid-sprint scope additions (+3 SP) without prior PM sign-off.', author: 'Kasun J. (Scrum Master)', votes: 6 },
    { id: 'rc-5', category: 'action-items', text: 'Setup Retina canvas DPR scaling utility in design tokens.', author: 'Dilshan S.', votes: 3, assignee: 'Tech Lead' },
    { id: 'rc-6', category: 'action-items', text: 'Enforce strict MoSCoW change request template for any mid-sprint tasks.', author: 'IT PM', votes: 8, assignee: 'Associate PM' }
  ],

  getCards() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.defaultCards;
    } catch (e) {
      return this.defaultCards;
    }
  },

  saveCards(cards) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cards));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  },

  addCard(category, text, author, assignee = '') {
    const cards = this.getCards();
    const newCard = {
      id: 'rc-' + Date.now(),
      category,
      text: text.trim(),
      author: author.trim() || 'Anonymous Dev',
      votes: 1,
      assignee: assignee.trim()
    };
    cards.push(newCard);
    this.saveCards(cards);
    this.render();
    return newCard;
  },

  voteCard(cardId) {
    const cards = this.getCards();
    const card = cards.find(c => c.id === cardId);
    if (card) {
      card.votes += 1;
      this.saveCards(cards);
      this.render();
    }
  },

  deleteCard(cardId) {
    let cards = this.getCards();
    cards = cards.filter(c => c.id !== cardId);
    this.saveCards(cards);
    this.render();
  },

  render() {
    const cards = this.getCards();

    const categories = ['went-well', 'to-improve', 'action-items'];
    categories.forEach(cat => {
      const container = document.getElementById(`retro-list-${cat}`);
      const countBadge = document.getElementById(`retro-count-${cat}`);
      if (!container) return;

      const catCards = cards.filter(c => c.category === cat).sort((a, b) => b.votes - a.votes);
      if (countBadge) countBadge.textContent = catCards.length;

      container.innerHTML = catCards.map(c => `
        <div class="retro-card" id="${c.id}">
          <div class="retro-card-text">${this.escapeHTML(c.text)}</div>
          <div class="retro-card-footer">
            <div class="retro-card-author">
              <span>👤 ${this.escapeHTML(c.author)}</span>
              ${c.assignee ? `<span class="kpi-badge badge-neutral">🎯 ${this.escapeHTML(c.assignee)}</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn-vote" onclick="SprintRetrospective.voteCard('${c.id}')" title="Upvote feedback">
                👍 <span>${c.votes}</span>
              </button>
              <button class="btn-icon" style="width: 24px; height: 24px; font-size: 0.7rem;" onclick="SprintRetrospective.deleteCard('${c.id}')" title="Delete card">
                ✕
              </button>
            </div>
          </div>
        </div>
      `).join('');
    });
  },

  escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};
