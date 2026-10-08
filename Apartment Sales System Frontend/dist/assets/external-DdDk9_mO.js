import{a as w,b as $,s as A,i as m,h as i,g as C,o as L}from"./ui-Cc2Hp2Ce.js";import{s as u}from"./store-NPwDcqf5.js";document.addEventListener("DOMContentLoaded",()=>{w("external"),$(),A();const o=document.getElementById("external-apartments-grid"),r=document.getElementById("external-alert");document.getElementById("resale-purchase-modal");const s=document.getElementById("resale-purchase-form"),p=document.getElementById("purchase-apt-id"),y=document.getElementById("purchase-prop-location"),g=document.getElementById("purchase-prop-price"),f=document.getElementById("purchase-prop-downpayment"),b=document.getElementById("buyer-name"),v=document.getElementById("buyer-email"),h=document.getElementById("buyer-phone"),l=document.getElementById("purchase-success-box"),d=document.getElementById("close-purchase-modal-btn"),c=document.getElementById("cancel-purchase-btn");let a=null;function x(n,e=!1){r&&(r.textContent=n,r.className=`alert ${e?"alert-danger":"alert-success"}`,r.style.display="block",setTimeout(()=>{r.style.display="none"},4e3))}function E(){const n=u.getExternalApartments();if(o){if(n.length===0){o.innerHTML='<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No resale apartments available right now. Certified sales agents add new listings regularly.</p>';return}o.innerHTML=n.map(e=>`
      <article class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="card-img-wrap">
            <img src="${e.images||"images/luxury-condo-exterior.jpg"}" alt="${e.location}" class="card-img" />
            <div class="card-badge-pos">
              <span class="badge badge-gold">Verified Resale</span>
            </div>
          </div>
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
              <span style="font-size: 0.75rem; color: var(--primary); font-family: monospace; font-weight: 700;">${e.exApartmentId||"RESALE"}</span>
              <span class="badge badge-success" style="font-size: 0.7rem;">Available for Purchase</span>
            </div>
            <h3 class="card-title" style="margin-bottom: 0.4rem;">${e.location}</h3>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 0.75rem; line-height: 1.5;">${e.about||"Exceptional luxury secondary condominium with premium amenities."}</p>
            <div class="card-meta" style="margin-bottom: 1rem;">
              <span>🛏️ ${e.numOfRooms||2} Rooms</span>
              <span>❄️ ${e.acOrNonAC||"AC"}</span>
              <span>📝 ${e.additionalInfo?e.additionalInfo.length>25?e.additionalInfo.substring(0,25)+"...":e.additionalInfo:"Agent Verified"}</span>
            </div>
          </div>
        </div>

        <div class="card-body" style="padding-top: 0; border-top: 1px solid var(--border-color); margin-top: 0.5rem;">
          <div class="card-footer" style="padding: 0.75rem 0; margin-bottom: 0.75rem;">
            <div>
              <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Full Purchase Price</small>
              <strong class="card-price" style="font-size: 1.25rem;">${i(e.price)}</strong>
            </div>
            <div style="text-align: right;">
              <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Minimum Down Payment</small>
              <strong style="color: var(--success); font-size: 1.05rem;">${i(e.downPayment||e.price*.1)}</strong>
            </div>
          </div>
          <button class="btn btn-primary btn-block buy-resale-btn" data-id="${e.exApartmentId||e.id}">
            🛒 Buy / Reserve This Resale Unit &rarr;
          </button>
        </div>
      </article>
    `).join(""),o.querySelectorAll(".buy-resale-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-id");B(t)})})}}function B(n){if(a=u.getExternalApartments().find(I=>I.exApartmentId===n||I.id===n),!a)return;const t=C();t&&(b&&(b.value=t.name||`${t.firstName||""} ${t.lastName||""}`.trim()),v&&(v.value=t.email||""),h&&(h.value=t.phoneNumber||"")),p&&(p.value=a.exApartmentId||a.id),y&&(y.textContent=a.location),g&&(g.textContent=i(a.price)),f&&(f.textContent=i(a.downPayment||a.price*.1)),l&&(l.style.display="none"),s&&(s.style.display="block"),L("resale-purchase-modal")}d==null||d.addEventListener("click",()=>m("resale-purchase-modal")),c==null||c.addEventListener("click",()=>m("resale-purchase-modal")),s==null||s.addEventListener("submit",async n=>{n.preventDefault();const e=document.getElementById("confirm-purchase-btn");e&&(e.disabled=!0,e.textContent="Recording reservation...");try{await new Promise(t=>setTimeout(t,600)),l&&(l.style.display="block"),s&&s.reset(),setTimeout(()=>{m("resale-purchase-modal"),x(`Congratulations! Your reservation for ${(a==null?void 0:a.location)||"the apartment"} has been received.`,!1)},1500)}catch(t){x(t.message||"Failed to submit reservation.",!0)}finally{e&&(e.disabled=!1,e.textContent="Submit Purchase Reservation")}}),u.subscribe(E),E()});
