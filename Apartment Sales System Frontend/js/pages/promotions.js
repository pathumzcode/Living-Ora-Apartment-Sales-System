/**
 * Promotions Page — Customer/Public View
 * Loads only currently ACTIVE promotions from the real backend API.
 * Shows status badges, discount percentage, validity dates and copy-code button.
 */
import { promotionsApi } from '../api.js';
import { renderNavbar, renderFooter } from '../ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('promotions');
  renderFooter();

  const promotionsGrid = document.getElementById('promotions-grid');
  if (!promotionsGrid) return;

  // Show loading state
  promotionsGrid.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
      <div style="font-size:2rem; margin-bottom:1rem;">⏳</div>
      <p>Loading exclusive offers&hellip;</p>
    </div>`;

  try {
    // Use /active endpoint to show only currently valid promotions to customers
    const promotions = await promotionsApi.getActive();

    if (!promotions || promotions.length === 0) {
      promotionsGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--text-muted);">
          <div style="font-size:3rem; margin-bottom:1rem;">🎁</div>
          <h3 style="margin-bottom:0.5rem; color:var(--text-main);">No Active Promotions</h3>
          <p>Check back soon for exclusive deals and seasonal offers.</p>
        </div>`;
      return;
    }

    promotionsGrid.innerHTML = promotions.map(promo => `
      <article class="card" style="overflow:hidden;">
        <div class="card-img-wrap">
          <img src="${promo.bannerImage || 'images/luxury-complex-marina.jpg'}"
               alt="${escapeHtml(promo.promotionTitle)}"
               class="card-img"
               onerror="this.src='images/luxury-complex-marina.jpg'" />
          <div class="card-badge-pos">
            <span class="badge badge-gold">${escapeHtml(promo.promotionType || 'Special Offer')}</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(promo.promotionTitle)}</h3>
          ${promo.discountPrecentage != null ? `
            <div style="background:var(--primary-light);border-radius:8px;padding:0.6rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
              <span style="font-size:1.5rem;font-weight:800;color:var(--primary);">${promo.discountPrecentage}% OFF</span>
              <span style="color:var(--text-muted);font-size:0.85rem;">discount on qualifying purchases</span>
            </div>` : ''}
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;line-height:1.5;">
            ${escapeHtml(promo.about || '')}
          </p>
          <div class="card-meta">
            ${promo.eligibilityCriteria ? `<span>🎯 <strong>Criteria:</strong> ${escapeHtml(promo.eligibilityCriteria)}</span>` : ''}
            <span>📅 <strong>Valid until:</strong> ${formatDate(promo.endDate)}</span>
            ${promo.validityPeriod ? `<span>⏱️ ${escapeHtml(promo.validityPeriod)}</span>` : ''}
          </div>
          <div class="card-footer">
            <div>
              <small style="display:block;color:var(--text-dim);font-size:0.75rem;">Promo Code</small>
              <strong style="color:var(--primary);font-size:1.1rem;letter-spacing:1px;">
                ${escapeHtml(promo.promotionCode || 'LIVINGORA')}
              </strong>
            </div>
            <button class="btn btn-sm btn-outline copy-code-btn"
                    data-code="${escapeHtml(promo.promotionCode || 'LIVINGORA')}">
              Copy Code
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Wire up copy-code buttons
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        navigator.clipboard.writeText(code).then(() => {
          const original = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.classList.replace('btn-outline', 'btn-success');
          setTimeout(() => {
            btn.textContent = original;
            btn.classList.replace('btn-success', 'btn-outline');
          }, 2000);
        }).catch(() => {
          // Fallback for browsers without clipboard API
          btn.textContent = '✓ ' + code;
          setTimeout(() => { btn.textContent = 'Copy Code'; }, 2000);
        });
      });
    });

  } catch (err) {
    console.error('[Promotions] Failed to load:', err);
    promotionsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem;">
        <div style="font-size:2rem; margin-bottom:1rem;">⚠️</div>
        <p style="color:var(--danger);">Unable to load promotions. Please ensure the backend server is running.</p>
        <button class="btn btn-outline btn-sm" onclick="location.reload()" style="margin-top:1rem;">
          Retry
        </button>
      </div>`;
  }
});

function formatDate(dateStr) {
  if (!dateStr) return 'Limited Time';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
