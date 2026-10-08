import{a as I,b as A,h as T}from"./ui-Cc2Hp2Ce.js";import{s as a}from"./store-NPwDcqf5.js";document.addEventListener("DOMContentLoaded",()=>{I("home"),A();const l=document.getElementById("featured-apartments-grid"),m=document.getElementById("top-picks-units-grid"),n=document.getElementById("home-search-input"),i=document.getElementById("home-location-select"),o=document.getElementById("home-beds-select"),c=document.getElementById("home-price-select"),g=document.getElementById("home-search-btn"),b=document.querySelectorAll(".search-tab-pill");b.forEach(r=>{r.addEventListener("click",()=>{b.forEach(e=>e.classList.remove("active")),r.classList.add("active")})});function $(r){if(l){if(r.length===0){l.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-muted);">
          No luxury developments match your search criteria. Try adjusting the filters.
        </div>`;return}l.innerHTML=r.slice(0,3).map(e=>`
      <article class="property-card">
        <div class="property-card-img-wrap">
          <img src="${e.images||"images/luxury-villa-hero.jpg"}" alt="${e.name}" class="property-card-img" />
          <span class="property-card-badge">${e.unitStatus||"Exclusive Portfolio"}</span>
          <a href="apartment-detail.html?id=${e.id||e.apartmentId}" class="property-card-action-btn" title="View Details">
            &nearr;
          </a>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${e.name}</h3>
          <p class="property-card-location">📍 ${e.location}</p>
          <div class="property-card-specs">
            <span>🏢 ${e.numOfFloors||15} Floors</span>
            <span>🏊 ${e.numOfSwimmingPool||1} Pool</span>
            <span>🏋️ ${e.numOfGYM||1} Gym</span>
          </div>
          <div class="property-card-footer">
            <div>
              <div class="property-card-price-label">Price Range</div>
              <div class="property-card-price">${e.priceRange||"$350k - $950k"}</div>
            </div>
            <a href="apartment-detail.html?id=${e.id||e.apartmentId}" class="btn btn-sm btn-primary">
              View Complex &rarr;
            </a>
          </div>
        </div>
      </article>
    `).join("")}}function E(r){if(m){if(r.length===0){m.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-muted);">
          All suite units are currently reserved. Check back soon or contact concierge.
        </div>`;return}m.innerHTML=r.slice(0,3).map(e=>`
      <article class="property-card">
        <div class="property-card-img-wrap">
          <img src="${e.images||"images/luxury-condo-exterior.jpg"}" alt="${e.title}" class="property-card-img" />
          <span class="property-card-badge badge-success">Immediate Booking</span>
          <a href="apartments.html?tab=units" class="property-card-action-btn" title="Reserve Unit">
            &nearr;
          </a>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${e.title||"Suite #"+e.unitNumber}</h3>
          <p class="property-card-location">📍 ${e.complexName||"Marina Tower"}, Floor ${e.floorNumber||4}</p>
          <div class="property-card-specs">
            <span>🛏️ ${e.numberOfBedrooms||3} Beds</span>
            <span>🚿 ${e.numberOfWashrooms||2} Baths</span>
            <span>📐 ${e.squareFeet||1650} sqft</span>
          </div>
          <div class="property-card-footer">
            <div>
              <div class="property-card-price-label">Suite Price</div>
              <div class="property-card-price">${T(e.price||42e4)}</div>
            </div>
            <a href="apartments.html?tab=units" class="btn btn-sm btn-gold">
              Reserve Suite
            </a>
          </div>
        </div>
      </article>
    `).join("")}}let p=a.getApartments(),u=a.getUnits().filter(r=>r.status==="AVAILABLE"||!r.status);$(p),E(u);function L(){p=a.getApartments(),u=a.getUnits().filter(r=>r.status==="AVAILABLE"||!r.status),s()}a.subscribe(L),a.ready&&a.ready.then(L);function s(){const r=((n==null?void 0:n.value)||"").toLowerCase().trim(),e=((i==null?void 0:i.value)||"").toLowerCase().trim(),d=Number((o==null?void 0:o.value)||0),B=Number((c==null?void 0:c.value)||0),x=p.filter(t=>{const y=`${t.name} ${t.location} ${t.about}`.toLowerCase(),f=!r||y.includes(r),h=!e||t.location.toLowerCase().includes(e);return f&&h}),k=u.filter(t=>{const y=`${t.title||""} ${t.complexName||""} ${t.unitNumber||""}`.toLowerCase(),f=!r||y.includes(r),h=!d||t.numberOfBedrooms>=d,w=!B||t.price<=B;return f&&h&&w});$(x),E(k)}g&&g.addEventListener("click",s),n&&n.addEventListener("keyup",r=>{r.key==="Enter"&&s()}),i&&i.addEventListener("change",s),o&&o.addEventListener("change",s),c&&c.addEventListener("change",s);const v=document.getElementById("home-inquiry-form");v&&v.addEventListener("submit",r=>{var d;r.preventDefault();const e=(d=document.getElementById("inquiry-fullname"))==null?void 0:d.value;alert(`Thank you, ${e}! Your inquiry has been dispatched to our senior real estate advisors. We will contact you within 24 hours.`),v.reset()})});
