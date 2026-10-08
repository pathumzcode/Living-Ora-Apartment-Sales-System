import{a as z,b as X,s as Y,h as L,o as _,g as D,i as J}from"./ui-DiodjEBl.js";import{s as m}from"./store-DiafltS_.js";document.addEventListener("DOMContentLoaded",()=>{z("apartments"),X(),Y();let C=new URLSearchParams(window.location.search).get("tab")==="units"?"units":"complexes";const r=document.getElementById("tab-complexes-btn"),s=document.getElementById("tab-units-btn"),p=document.getElementById("complexes-section"),y=document.getElementById("units-section"),g=document.getElementById("apartments-search-input"),v=document.getElementById("beds-filter"),b=document.getElementById("price-filter"),x=document.getElementById("complexes-grid"),P=document.getElementById("units-grid");function A(t){C=t,t==="units"?(s==null||s.classList.add("active"),r==null||r.classList.remove("active"),y==null||y.removeAttribute("hidden"),p==null||p.setAttribute("hidden","true")):(r==null||r.classList.add("active"),s==null||s.classList.remove("active"),p==null||p.removeAttribute("hidden"),y==null||y.setAttribute("hidden","true"))}r==null||r.addEventListener("click",()=>A("complexes")),s==null||s.addEventListener("click",()=>A("units")),A(C);let k=m.getApartments(),h=m.getUnits();function T(){k=m.getApartments(),h=m.getUnits(),f()}m.subscribe(T),m.ready&&m.ready.then(T);function M(t){if(x){if(t.length===0){x.innerHTML='<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No apartment complexes found.</p>';return}x.innerHTML=t.map(e=>`
      <article class="property-card">
        <div class="property-card-img-wrap">
          <img src="${e.images||"images/luxury-complex-marina.jpg"}" alt="${e.name}" class="property-card-img" />
          <span class="property-card-badge">${e.unitStatus||"Available"}</span>
          <a href="apartment-detail.html?id=${e.id||e.apartmentId}" class="property-card-action-btn" title="View Residences">
            &nearr;
          </a>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${e.name}</h3>
          <p class="property-card-location">📍 ${e.location}</p>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 0.75rem; line-height: 1.4;">${e.about||""}</p>
          <div class="property-card-specs">
            <span>🏢 ${e.numOfFloors} Floors</span>
            <span>🏊 ${e.numOfSwimmingPool} Pools</span>
            <span>🏋️ ${e.numOfGYM} Gym</span>
            <span>🚪 ${e.numOfUnitsAvilable||10} Units Left</span>
          </div>
          <div class="property-card-footer">
            <div>
              <div class="property-card-price-label">Price Range</div>
              <div class="property-card-price">${e.priceRange||"$200k+"}</div>
            </div>
            <a href="apartment-detail.html?id=${e.id||e.apartmentId}" class="btn btn-sm btn-primary">View Residences &rarr;</a>
          </div>
        </div>
      </article>
    `).join("")}}function O(t){if(P){if(t.length===0){P.innerHTML='<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No units match your selected filter.</p>';return}P.innerHTML=t.map(e=>{const i=(e.availability||e.avilability||"Available")==="Available",c=i?"badge-available":(e.availability||e.avilability)==="Reserved"?"badge-warning":"badge-danger";return`
        <article class="property-card">
          <div class="property-card-img-wrap">
            <img src="${e.images||"images/luxury-interior-lounge.jpg"}" alt="${e.location}" class="property-card-img" />
            <span class="property-card-badge ${c}">${e.availability||e.avilability||"Available"}</span>
            ${i?`
              <button class="property-card-action-btn reserve-unit-btn" data-unit-id="${e.unitId}" title="Reserve Suite">
                &nearr;
              </button>
            `:""}
          </div>
          <div class="property-card-body">
            <h3 class="property-card-title">${e.location}</h3>
            <p class="property-card-location">Unit ID: <strong style="color: var(--primary);">${e.unitId}</strong> &bull; Floor ${e.floor}</p>
            <div class="property-card-specs">
              <span>🛏️ ${e.numOfBeds} Beds</span>
              <span>🚿 ${e.numOfBathRooms} Baths</span>
              <span>❄️ ${e.acOrNonAC||"AC"}</span>
              <span>🛋️ ${e.furnitures||"Furnished"}</span>
            </div>
            <div class="property-card-footer">
              <div>
                <div class="property-card-price-label">Full Purchase Price</div>
                <div class="property-card-price">${L(e.unitPrice)}</div>
              </div>
              ${i?`
                <button class="btn btn-sm btn-gold reserve-unit-btn" data-unit-id="${e.unitId}">Reserve Suite</button>
              `:`
                <button class="btn btn-sm btn-secondary" disabled>Unavailable</button>
              `}
            </div>
          </div>
        </article>
      `}).join(""),document.querySelectorAll(".reserve-unit-btn").forEach(e=>{e.addEventListener("click",()=>{const i=e.getAttribute("data-unit-id");j(i)})})}}function f(){const t=((g==null?void 0:g.value)||"").toLowerCase().trim(),e=parseInt((v==null?void 0:v.value)||"0",10),i=parseInt((b==null?void 0:b.value)||"0",10),c=k.filter(a=>{const $=`${a.name} ${a.location}`.toLowerCase();return!t||$.includes(t)}),E=h.filter(a=>{const $=`${a.unitId} ${a.location} ${a.furnitures}`.toLowerCase(),U=!t||$.includes(t),l=!e||a.numOfBeds>=e,B=!i||a.unitPrice<=i;return U&&l&&B});M(c),O(E)}g==null||g.addEventListener("input",f),v==null||v.addEventListener("change",f),b==null||b.addEventListener("change",f),M(k),O(h);let n=null;document.getElementById("booking-modal");const N=document.getElementById("modal-unit-title"),R=document.getElementById("modal-unit-price"),o=document.getElementById("modal-downpayment-ratio"),d=document.getElementById("modal-months"),G=document.getElementById("modal-downpayment-amount"),S=document.getElementById("modal-monthly-amount"),u=document.getElementById("booking-reservation-form"),I=document.getElementById("booking-success-box");function j(t){n=h.find(e=>e.unitId===t),n&&(N&&(N.textContent=`${n.location} (Unit ${n.unitId})`),R&&(R.textContent=L(n.unitPrice)),w(),I&&(I.style.display="none"),u&&(u.style.display="block"),_("booking-modal"))}function w(){if(!n)return;const t=parseInt((o==null?void 0:o.value)||"20",10),e=parseInt((d==null?void 0:d.value)||"36",10),i=n.unitPrice,c=i*t/100,a=(i-c)/e;G&&(G.textContent=L(c)),S&&(S.textContent=L(Math.round(a)))}o==null||o.addEventListener("change",w),d==null||d.addEventListener("change",w),u==null||u.addEventListener("submit",async t=>{var B,F,H,q;if(t.preventDefault(),!n)return;const e=D(),i=parseInt((o==null?void 0:o.value)||"20",10),c=parseInt((d==null?void 0:d.value)||"36",10),E=n.unitPrice*i/100,a=((B=document.getElementById("modal-payment-method"))==null?void 0:B.value)||"Bank Transfer",$=((F=document.getElementById("modal-additions"))==null?void 0:F.value)||"Standard Executive Finish",U=((q=(H=document.getElementById("modal-payment-proof"))==null?void 0:H.files[0])==null?void 0:q.name)||`proof_${n.unitId}.pdf`,l=document.getElementById("submit-booking-btn");l&&(l.disabled=!0,l.textContent="Processing reservation...");try{await m.createBooking({uid:(e==null?void 0:e.uid)||"USR-EXT-5001",userName:e?`${e.firstName} ${e.lastName}`:"Guest Buyer",userEmail:(e==null?void 0:e.email)||"buyer@livingora.lk",unitId:n.unitId,unitLocation:n.location,paymentAmount:n.unitPrice,downPayment:E,paymentMethod:a,paymentProof:U,additions:$,months:c,unitPrice:n.unitPrice}),u&&(u.style.display="none"),I&&(I.style.display="block"),setTimeout(()=>{J("booking-modal"),f()},2e3)}catch(V){alert(V.message||"Unable to submit reservation.")}finally{l&&(l.disabled=!1,l.textContent="Submit Unit Reservation")}}),window.openBookingModalForUnit=j});
