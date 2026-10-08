import{a,b as r}from"./ui-Cc2Hp2Ce.js";import{s as n}from"./store-NPwDcqf5.js";document.addEventListener("DOMContentLoaded",()=>{a("promotions"),r();const e=document.getElementById("promotions-grid"),o=n.getPromotions();e&&(o.length===0?e.innerHTML='<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No active promotions at this time.</p>':(e.innerHTML=o.map(t=>`
        <article class="card">
          <div class="card-img-wrap">
            <img src="${t.bannerImage||"images/luxury-complex-marina.jpg"}" alt="${t.promotionTitle}" class="card-img" />
            <div class="card-badge-pos">
              <span class="badge badge-gold">${t.promotionType||"Special Offer"}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${t.promotionTitle}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.5;">${t.about}</p>
            
            <div class="card-meta">
              <span>🎯 <strong>Criteria:</strong> ${t.eligibilityCriteria||"All residences"}</span>
              <span>📅 <strong>Valid Till:</strong> ${t.endDate||"Limited Time"}</span>
            </div>

            <div class="card-footer">
              <div>
                <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Promo Code</small>
                <strong style="color: var(--primary); font-size: 1.1rem; letter-spacing: 1px;">${t.promotionCode||"LIVINGORA"}</strong>
              </div>
              <button class="btn btn-sm btn-outline copy-code-btn" data-code="${t.promotionCode||"LIVINGORA"}">Copy Code</button>
            </div>
          </div>
        </article>
      `).join(""),document.querySelectorAll(".copy-code-btn").forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-code");navigator.clipboard.writeText(i).then(()=>{const s=t.textContent;t.textContent="Copied!",t.classList.replace("btn-outline","btn-success"),setTimeout(()=>{t.textContent=s,t.classList.replace("btn-success","btn-outline")},2e3)})})})))});
