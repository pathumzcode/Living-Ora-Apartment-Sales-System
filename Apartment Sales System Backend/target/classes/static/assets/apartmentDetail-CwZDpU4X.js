import{a as k,b as w,s as O,h as I,o as F,g as T,i as M}from"./ui-DiodjEBl.js";import{s as c}from"./store-DiafltS_.js";document.addEventListener("DOMContentLoaded",()=>{k("apartments"),w(),O();const E=new URLSearchParams(window.location.search).get("id")||"APT-LO-001";function B(){const i=c.getApartments(),e=c.getApartmentById(E)||i.find(f=>String(f.apartmentId).toLowerCase()===String(E).toLowerCase()||String(f.id).toLowerCase()===String(E).toLowerCase())||i[0];if(!e)return;const a=document.getElementById("apt-name"),l=document.getElementById("apt-location"),t=document.getElementById("apt-price"),o=document.getElementById("apt-about"),u=document.getElementById("apt-image"),v=document.getElementById("apt-floorplan-img"),d=document.getElementById("apt-floors"),p=document.getElementById("apt-pools"),g=document.getElementById("apt-gyms"),y=document.getElementById("apt-units-count");a&&(a.textContent=e.name),l&&(l.textContent=`📍 ${e.location}`),t&&(t.textContent=e.priceRange||"$220,000 – $850,000"),o&&(o.textContent=e.about||"A considered home for modern coastal living."),u&&(u.src=e.images||"images/luxury-complex-marina.jpg"),v&&(v.src=e.floorPlan||"images/luxury-interior-lounge.jpg"),d&&(d.textContent=`${e.numOfFloors??20} Floors`),p&&(p.textContent=`${e.numOfSwimmingPool??1} Swimming Pool`),g&&(g.textContent=`${e.numOfGYM??1} Fitness Center`),y&&(y.textContent=`${e.numOfUnitsAvailable??e.numOfUnitsAvilable??10} Units Available`),x(e)}const C=document.getElementById("complex-units-grid");function x(i){if(!C)return;const e=c.getUnits(),a=e.filter(t=>t.apartment_id===i.id||t.apartment_id===i.apartmentId||t.apartmentId===i.id),l=a.length>0?a:e.slice(0,3);C.innerHTML=l.map(t=>{const o=(t.availability||t.avilability||"Available")==="Available",u=o?"badge-available":(t.availability||t.avilability)==="Reserved"?"badge-warning":"badge-danger";return`
        <article class="property-card">
          <div class="property-card-img-wrap">
            <img src="${t.images||"images/luxury-interior-lounge.jpg"}" alt="${t.location}" class="property-card-img" />
            <span class="property-card-badge ${u}">${t.availability||t.avilability||"Available"}</span>
            ${o?`
              <button class="property-card-action-btn reserve-unit-btn" data-unit-id="${t.unitId}" title="Reserve Suite">
                &nearr;
              </button>
            `:""}
          </div>
          <div class="property-card-body">
            <h3 class="property-card-title">${t.location}</h3>
            <p class="property-card-location">Unit: <strong>${t.unitId}</strong> &bull; Floor ${t.floor||1}</p>
            <div class="property-card-specs">
              <span>🛏️ ${t.numOfBeds||2} Beds</span>
              <span>🚿 ${t.numOfBathRooms||2} Baths</span>
              <span>❄️ ${t.acOrNonAC||"AC"}</span>
              <span>🛋️ ${t.furnitures||"Furnished"}</span>
            </div>
            <div class="property-card-footer">
              <div>
                <div class="property-card-price-label">Price</div>
                <div class="property-card-price">${I(t.unitPrice)}</div>
              </div>
              ${o?`
                <button class="btn btn-sm btn-gold reserve-unit-btn" data-unit-id="${t.unitId}">Reserve Suite</button>
              `:`
                <button class="btn btn-sm btn-secondary" disabled>Unavailable</button>
              `}
            </div>
          </div>
        </article>
      `}).join(""),document.querySelectorAll(".reserve-unit-btn").forEach(t=>{t.addEventListener("click",()=>{const o=t.getAttribute("data-unit-id");L(o)})})}B(),c.subscribe(B),c.ready&&c.ready.then(B);let n=null;const h=document.getElementById("modal-unit-title"),A=document.getElementById("modal-unit-price"),s=document.getElementById("modal-downpayment-ratio"),r=document.getElementById("modal-months"),P=document.getElementById("modal-downpayment-amount"),U=document.getElementById("modal-monthly-amount"),m=document.getElementById("booking-reservation-form"),b=document.getElementById("booking-success-box");function L(i){n=c.getUnits().find(e=>e.unitId===i),n&&(h&&(h.textContent=`${n.location} (Unit ${n.unitId})`),A&&(A.textContent=I(n.unitPrice)),$(),b&&(b.style.display="none"),m&&(m.style.display="block"),F("booking-modal"))}function $(){if(!n)return;const i=parseInt((s==null?void 0:s.value)||"20",10),e=parseInt((r==null?void 0:r.value)||"36",10),a=n.unitPrice,l=a*i/100,o=(a-l)/e;P&&(P.textContent=I(l)),U&&(U.textContent=I(Math.round(o)))}s==null||s.addEventListener("change",$),r==null||r.addEventListener("change",$),m==null||m.addEventListener("submit",async i=>{var p,g,y,f;if(i.preventDefault(),!n)return;const e=T(),a=parseInt((s==null?void 0:s.value)||"20",10),l=parseInt((r==null?void 0:r.value)||"36",10),t=n.unitPrice*a/100,o=((p=document.getElementById("modal-payment-method"))==null?void 0:p.value)||"Bank Transfer",u=((g=document.getElementById("modal-additions"))==null?void 0:g.value)||"Standard Luxury Finish",v=((f=(y=document.getElementById("modal-payment-proof"))==null?void 0:y.files[0])==null?void 0:f.name)||`proof_${n.unitId}.pdf`,d=document.getElementById("submit-booking-btn");d&&(d.disabled=!0,d.textContent="Processing reservation...");try{await c.createBooking({uid:(e==null?void 0:e.uid)||"USR-EXT-5001",userName:e?`${e.firstName} ${e.lastName}`:"Guest Buyer",userEmail:(e==null?void 0:e.email)||"buyer@livingora.lk",unitId:n.unitId,unitLocation:n.location,paymentAmount:n.unitPrice,downPayment:t,paymentMethod:o,paymentProof:v,additions:u,months:l,unitPrice:n.unitPrice}),m&&(m.style.display="none"),b&&(b.style.display="block"),setTimeout(()=>{M("booking-modal"),x()},2e3)}catch(S){alert(S.message||"Failed to submit reservation.")}finally{d&&(d.disabled=!1,d.textContent="Submit Unit Reservation")}})});
