import { store } from '../store.js';
import { renderNavbar, renderFooter } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('promotions');
  renderFooter();

  const promotionsGrid = document.getElementById('promotions-grid');
  const promotions = store.getPromotions();

  if (promotionsGrid) {
    if (promotions.length === 0) {
      promotionsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No active promotions at this time.</p>`;
    } else {
      promotionsGrid.innerHTML = promotions.map(promo => `
        <article class="card">
          <div class="card-img-wrap">
            <img src="${promo.bannerImage || 'images/luxury-complex-marina.jpg'}" alt="${promo.promotionTitle}" class="card-img" />
            <div class="card-badge-pos">
              <span class="badge badge-gold">${promo.promotionType || 'Special Offer'}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${promo.promotionTitle}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.5;">${promo.about}</p>
            
            <div class="card-meta">
              <span>🎯 <strong>Criteria:</strong> ${promo.eligibilityCriteria || 'All residences'}</span>
              <span>📅 <strong>Valid Till:</strong> ${promo.endDate || 'Limited Time'}</span>
            </div>

            <div class="card-footer">
              <div>
                <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Promo Code</small>
                <strong style="color: var(--primary); font-size: 1.1rem; letter-spacing: 1px;">${promo.promotionCode || 'LIVINGORA'}</strong>
              </div>
              <button class="btn btn-sm btn-outline copy-code-btn" data-code="${promo.promotionCode || 'LIVINGORA'}">Copy Code</button>
            </div>
          </div>
        </article>
      `).join('');

      document.querySelectorAll('.copy-code-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = btn.getAttribute('data-code');
          navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.replace('btn-outline', 'btn-success');
            setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.replace('btn-success', 'btn-outline');
            }, 2000);
          });
        });
      });
    }
  }
});
