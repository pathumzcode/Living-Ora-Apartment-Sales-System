import { store } from '../store.js';
import { renderNavbar, renderFooter } from '../ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('promotions');
  renderFooter();

  const promotionsGrid = document.getElementById('promotions-grid');

  function showLoading() {
    if (promotionsGrid) {
      promotionsGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;">Loading promotions...</p>`;
    }
  }

  function renderPromotions() {
    // Fetch directly from backend to always get fresh data
    fetch('http://localhost:8080/api/promotions')
      .then(r => r.json())
      .then(allPromos => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activePromos = allPromos.filter(p => {
          if (p.status === 'INACTIVE') return false;
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          return today >= start && today <= end;
        });

        if (!promotionsGrid) return;

        if (activePromos.length === 0) {
          promotionsGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;">No active promotions at this time.</p>`;
          return;
        }

        promotionsGrid.innerHTML = activePromos.map(promo => `
          <article class="card" style="display:flex;flex-direction:column;">
            <div class="card-img-wrap">
              <img src="${promo.bannerImage || 'images/luxury-complex-marina.jpg'}" alt="${promo.promotionTitle}" class="card-img" onerror="this.src='images/luxury-complex-marina.jpg'" />
              <div class="card-badge-pos">
                <span class="badge badge-gold">${promo.promotionType || 'Special Offer'}</span>
              </div>
            </div>
            <div class="card-body" style="flex:1;display:flex;flex-direction:column;">
              <h3 class="card-title">${promo.promotionTitle}</h3>
              <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;line-height:1.5;flex:1;">${promo.about || ''}</p>

              <div class="card-meta" style="margin-bottom:0.75rem;">
                <span>&#128203; <strong>Criteria:</strong> ${promo.eligibilityCriteria || 'All residences'}</span>
                <span>&#128197; <strong>Valid Till:</strong> ${promo.endDate ? new Date(promo.endDate).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : 'Limited Time'}</span>
              </div>

              ${promo.discountPrecentage ? `
                <div style="background:var(--primary-light,rgba(212,175,55,0.1));border:1px solid var(--border-gold,#d4af37);border-radius:8px;padding:0.6rem 1rem;margin-bottom:0.75rem;text-align:center;">
                  <strong style="color:var(--primary,#d4af37);font-size:1.3rem;">${promo.discountPrecentage}% OFF</strong>
                </div>
              ` : ''}

              <div class="card-footer" style="display:flex;justify-content:space-between;align-items:center;padding-top:0.75rem;border-top:1px solid var(--border-color);">
                <div>
                  <small style="display:block;color:var(--text-dim);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;">Promo Code</small>
                  <strong style="color:var(--primary);font-size:1.15rem;letter-spacing:2px;font-family:monospace;">${promo.promotionCode || 'LIVINGORA'}</strong>
                </div>
                <button class="btn btn-sm btn-outline copy-code-btn" data-code="${promo.promotionCode || 'LIVINGORA'}">
                  &#128203; Copy Code
                </button>
              </div>

              ${promo.buttonText ? `
                <a href="apartments.html" class="btn btn-primary btn-block" style="margin-top:0.75rem;text-align:center;">
                  ${promo.buttonText}
                </a>
              ` : ''}
            </div>
          </article>
        `).join('');

        // Copy button listeners
        document.querySelectorAll('.copy-code-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
              const orig = btn.innerHTML;
              btn.innerHTML = '&#10003; Copied!';
              btn.classList.replace('btn-outline', 'btn-success');
              setTimeout(() => {
                btn.innerHTML = orig;
                btn.classList.replace('btn-success', 'btn-outline');
              }, 2000);
            }).catch(() => {
              prompt('Copy this code:', code);
            });
          });
        });
      })
      .catch(err => {
        if (promotionsGrid) {
          promotionsGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--danger);padding:3rem;">Unable to load promotions. Please try again later.</p>`;
        }
        console.error('[Promotions] Error:', err);
      });
  }

  showLoading();
  renderPromotions();
});
