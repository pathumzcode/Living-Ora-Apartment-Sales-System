import{r as dt,f as p,a as it,b as lt,s as rt,g as st,R as H,i as P,u as ut,o as D,h as q}from"./ui-Cc2Hp2Ce.js";import{s as r}from"./store-NPwDcqf5.js";document.addEventListener("DOMContentLoaded",()=>{var J,Q,W;const tt=[p.ADMIN,p.SALES_MANAGER,p.MARKETING_MANAGER,p.CUSTOMER_RELATIONS_OFFICER,p.FINANCE_PAYMENTS_OFFICER,p.PROPERTY_DEVELOPMENT_MANAGER,p.OPERATIONS_DIRECTOR];if(!dt(tt))return;it(),lt(),rt();const u=st(),G=document.getElementById("staff-name"),Y=document.getElementById("staff-role-label"),z=document.getElementById("staff-id");G&&(G.textContent=u.name||`${u.firstName} ${u.lastName}`),Y&&(Y.textContent=H[u.role]||u.role),z&&(z.textContent=u.empId||u.uid||"EMP-001");function f(){const a=r.getBookings(),t=r.getUnits(),e=r.getApartments(),n=a.filter(l=>l.status==="Approved").reduce((l,g)=>l+(Number(g.paymentAmount)||0),0),o=a.filter(l=>l.status==="Pending Approval").length,d=t.filter(l=>(l.availability||l.avilability)==="Available").length,i=document.getElementById("kpi-revenue"),E=document.getElementById("kpi-pending"),c=document.getElementById("kpi-available"),m=document.getElementById("kpi-complexes");i&&(i.textContent=q(n)),E&&(E.textContent=`${o} Requests`),c&&(c.textContent=`${d} / ${t.length} Units`),m&&(m.textContent=`${e.length} Complexes`)}const K=u.role===p.OPERATIONS_DIRECTOR||u.role===p.ADMIN,et=u.role===p.SALES_MANAGER||K,A=document.getElementById("tab-bookings-btn"),B=document.getElementById("tab-inventory-btn"),y=document.getElementById("tab-operations-btn"),v=document.getElementById("tab-promotions-btn"),L=document.getElementById("bookings-panel"),O=document.getElementById("inventory-panel"),R=document.getElementById("operations-panel"),N=document.getElementById("promotions-panel");K&&y&&(y.style.display="inline-block"),et&&v&&(v.style.display="inline-block");function S(a){[A,B,y,v].forEach(t=>t==null?void 0:t.classList.remove("active")),[L,O,R,N].forEach(t=>t==null?void 0:t.setAttribute("hidden","true")),a==="inventory"?(B==null||B.classList.add("active"),O==null||O.removeAttribute("hidden")):a==="operations"?(y==null||y.classList.add("active"),R==null||R.removeAttribute("hidden"),nt()):a==="promotions"?(v==null||v.classList.add("active"),N==null||N.removeAttribute("hidden"),at()):(A==null||A.classList.add("active"),L==null||L.removeAttribute("hidden"))}A==null||A.addEventListener("click",()=>S("bookings")),B==null||B.addEventListener("click",()=>S("inventory")),y==null||y.addEventListener("click",()=>S("operations")),v==null||v.addEventListener("click",()=>S("promotions"));async function nt(){const a=document.getElementById("ops-staff-tbody"),t=document.getElementById("ops-staff-count");if(!a)return;try{const n=await fetch("http://localhost:8080/api/users/internal");if(n.ok){const o=await n.json();t&&(t.textContent=`${o.length} Active Staff`),a.innerHTML=o.map(d=>`
          <tr>
            <td><strong style="color: var(--primary); font-family: monospace;">${d.empId}</strong></td>
            <td><strong>${d.firstName} ${d.lastName}</strong></td>
            <td><span class="badge badge-gold">${H[d.role]||d.role}</span></td>
            <td>${d.companyEmail||d.email}</td>
            <td>${d.phoneNumber||"-"}</td>
            <td>${d.serviceYears??1} Years</td>
          </tr>
        `).join("");return}}catch(n){console.warn("Could not fetch live staff list for operations roster:",n)}const e=[{empId:"EMP-SALES-1001",name:"Sales Manager",role:"SALES_MANAGER",email:"sales.manager@livingora.lk",phone:"0711000001",years:5},{empId:"EMP-OPS-1001",name:"Operations Director",role:"OPERATIONS_DIRECTOR",email:"operations.director@livingora.lk",phone:"0711000006",years:8},{empId:"EMP-FIN-1001",name:"Finance Officer",role:"FINANCE_PAYMENTS_OFFICER",email:"finance.officer@livingora.lk",phone:"0711000004",years:4}];t&&(t.textContent=`${e.length} Staff`),a.innerHTML=e.map(n=>`
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">${n.empId}</strong></td>
        <td><strong>${n.name}</strong></td>
        <td><span class="badge badge-gold">${H[n.role]||n.role}</span></td>
        <td>${n.email}</td>
        <td>${n.phone}</td>
        <td>${n.years} Years</td>
      </tr>
    `).join("")}async function at(){const a=document.getElementById("ops-promotions-tbody");if(a){try{const t=await fetch("http://localhost:8080/api/promotions");if(t.ok){const e=await t.json();if(Array.isArray(e)&&e.length>0){a.innerHTML=e.map(n=>`
            <tr>
              <td><strong style="color: var(--primary); font-family: monospace;">${n.promotionCode||n.promotionId}</strong></td>
              <td>${n.promotionTitle}</td>
              <td><span class="badge badge-gold">${n.promotionType}</span></td>
              <td><strong style="color: var(--success);">${n.discountPrecentage||0}%</strong></td>
              <td>${n.startDate||""} &rarr; ${n.endDate||""}</td>
              <td>Sales Agents &amp; Marketing</td>
            </tr>
          `).join("");return}}}catch(t){console.warn("Could not fetch live promotions:",t)}a.innerHTML=`
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">PROMO-LORA2026</strong></td>
        <td>Luxury Penthouse Seasonal Launch</td>
        <td><span class="badge badge-gold">Seasonal Discount</span></td>
        <td><strong style="color: var(--success);">10.00%</strong></td>
        <td>2026-01-01 &rarr; 2026-12-31</td>
        <td>Sales Agents &amp; Operations Coordinated</td>
      </tr>
    `}}const _=document.getElementById("bookings-tbody");function C(){if(!_)return;const a=r.getBookings();if(a.length===0){_.innerHTML='<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No reservation requests found.</td></tr>';return}_.innerHTML=a.map(t=>{let e="badge-warning";return t.status==="Approved"&&(e="badge-success"),t.status==="Rejected"&&(e="badge-danger"),`
        <tr>
          <td><strong>${t.bookingId}</strong></td>
          <td>
            <div>${t.userName||"Client"}</div>
            <small style="color: var(--text-dim);">${t.userEmail||""}</small>
          </td>
          <td>${t.unitLocation||t.unitId}</td>
          <td><strong>${q(t.downPayment)}</strong></td>
          <td>${t.bookingDate}</td>
          <td><span class="badge ${e}">${t.status}</span></td>
          <td>
            ${t.status==="Pending Approval"?`
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-sm btn-success action-approve-btn" data-id="${t.bookingId}">Approve</button>
                <button class="btn btn-sm btn-danger action-reject-btn"  data-id="${t.bookingId}">Reject</button>
              </div>
            `:`
              <span style="color: var(--text-dim); font-size: 0.85rem;">Completed</span>
            `}
          </td>
        </tr>
      `}).join(""),document.querySelectorAll(".action-approve-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");await r.updateBookingStatus(e,"Approved"),C(),s(),f()})}),document.querySelectorAll(".action-reject-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");await r.updateBookingStatus(e,"Rejected"),C(),s(),f()})})}const j=document.getElementById("inventory-tbody");function s(a=null){if(!j)return;const t=a!==null?a:r.getUnits();if(t.length===0){j.innerHTML='<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No inventory units found.</td></tr>';return}j.innerHTML=t.map(e=>{const n=e.availability||e.avilability||"Available",o=n==="Available"?"badge-available":n==="Reserved"?"badge-warning":"badge-danger";return`
        <tr>
          <td><strong>${e.unitId}</strong></td>
          <td>${e.location||"-"}</td>
          <td>Floor ${e.floor??"-"}</td>
          <td>${e.numOfBeds??"-"} Beds, ${e.numOfBathRooms??"-"} Baths</td>
          <td><strong>${q(e.unitPrice)}</strong></td>
          <td><span class="badge ${o}">${n}</span></td>
          <td>
            <select class="form-select form-select-sm unit-status-select"
                    data-unit-id="${e.unitId}"
                    style="padding: 0.25rem 0.5rem; font-size: 0.85rem; width: auto;">
              <option value="Available" ${n==="Available"?"selected":""}>Available</option>
              <option value="Reserved"  ${n==="Reserved"?"selected":""}>Reserved</option>
              <option value="Sold"      ${n==="Sold"?"selected":""}>Sold</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-sm btn-secondary inv-edit-btn"   data-unit-id="${e.unitId}">Edit</button>
              <button class="btn btn-sm btn-danger    inv-delete-btn" data-unit-id="${e.unitId}">Delete</button>
            </div>
          </td>
        </tr>
      `}).join(""),document.querySelectorAll(".unit-status-select").forEach(e=>{e.addEventListener("change",async n=>{const o=e.getAttribute("data-unit-id"),d=n.target.value;try{await r.updateUnitStatus(o,d),s(),f()}catch(i){alert(`Error updating status: ${i.message}`)}})}),document.querySelectorAll(".inv-edit-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-unit-id"),o=r.getUnits().find(d=>d.unitId===n);o&&(document.getElementById("edit-unit-id").value=o.unitId,document.getElementById("edit-unit-apt").value=o.apartmentId||o.apartment_id||"",document.getElementById("edit-unit-location").value=o.location||"",document.getElementById("edit-unit-floor").value=o.floor??"",document.getElementById("edit-unit-price").value=o.unitPrice??"",document.getElementById("edit-unit-beds").value=o.numOfBeds??"",document.getElementById("edit-unit-baths").value=o.numOfBathRooms??"",document.getElementById("edit-unit-ac").value=o.acOrNonAC||"AC",document.getElementById("edit-unit-furnitures").value=o.furnitures||"Fully Furnished",document.getElementById("edit-unit-status").value=o.availability||o.avilability||"Available",document.getElementById("edit-unit-about").value=o.about||"",D("edit-unit-modal"))})}),document.querySelectorAll(".inv-delete-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-unit-id");M=n;const o=document.getElementById("delete-unit-code");o&&(o.textContent=n),D("delete-unit-modal")})})}const k=document.getElementById("edit-unit-form");k==null||k.addEventListener("submit",async a=>{var n,o,d,i,E,c,m,l,g,I,b;a.preventDefault();const t=(n=document.getElementById("edit-unit-id"))==null?void 0:n.value;if(!t)return;const e={apartmentId:((o=document.getElementById("edit-unit-apt"))==null?void 0:o.value.trim())||null,location:(d=document.getElementById("edit-unit-location"))==null?void 0:d.value.trim(),floor:parseInt((i=document.getElementById("edit-unit-floor"))==null?void 0:i.value,10)||null,unitPrice:parseFloat((E=document.getElementById("edit-unit-price"))==null?void 0:E.value)||null,numOfBeds:parseInt((c=document.getElementById("edit-unit-beds"))==null?void 0:c.value,10)||null,numOfBathRooms:parseInt((m=document.getElementById("edit-unit-baths"))==null?void 0:m.value,10)||null,acOrNonAC:((l=document.getElementById("edit-unit-ac"))==null?void 0:l.value)||null,furnitures:((g=document.getElementById("edit-unit-furnitures"))==null?void 0:g.value)||null,availability:((I=document.getElementById("edit-unit-status"))==null?void 0:I.value)||null,about:((b=document.getElementById("edit-unit-about"))==null?void 0:b.value.trim())||null};try{await r.updateUnit(t,e),P("edit-unit-modal"),k.reset(),s(),f(),alert(`Unit ${t} updated successfully!`)}catch(h){alert(`Error updating unit: ${h.message}`)}});let M=null;(J=document.getElementById("confirm-delete-unit-btn"))==null||J.addEventListener("click",async()=>{if(!M)return;const a=M;M=null,P("delete-unit-modal");try{await r.deleteUnit(a),s(),f(),alert(`Unit ${a} deleted successfully.`)}catch(t){alert(`Cannot delete unit: ${t.message}`)}}),(Q=document.getElementById("inv-search-btn"))==null||Q.addEventListener("click",async()=>{var e,n;const a=((e=document.getElementById("inv-filter-apt"))==null?void 0:e.value.trim())||"",t=((n=document.getElementById("inv-filter-status"))==null?void 0:n.value)||"";try{const o=await ut.search({apartmentId:a||void 0,availability:t||void 0});s(o)}catch(o){console.warn("Search failed, using local data:",o.message);let d=r.getUnits();a&&(d=d.filter(i=>(i.apartmentId||i.apartment_id||"")===a)),t&&(d=d.filter(i=>(i.availability||i.avilability)===t)),s(d)}}),(W=document.getElementById("inv-reset-btn"))==null||W.addEventListener("click",()=>{const a=document.getElementById("inv-filter-apt"),t=document.getElementById("inv-filter-status");a&&(a.value=""),t&&(t.value=""),s()}),f(),C(),s(),r.subscribe(()=>{f(),C(),s()});const F=document.getElementById("open-add-apt-modal-btn"),x=document.getElementById("add-apartment-form");F==null||F.addEventListener("click",()=>D("add-apt-modal")),x==null||x.addEventListener("submit",async a=>{var c,m,l,g,I,b,h;a.preventDefault();const t=(c=document.getElementById("apt-form-name"))==null?void 0:c.value,e=(m=document.getElementById("apt-form-location"))==null?void 0:m.value,n=Number((l=document.getElementById("apt-form-floors"))==null?void 0:l.value)||15,o=Number((g=document.getElementById("apt-form-pools"))==null?void 0:g.value)||1,d=Number((I=document.getElementById("apt-form-gyms"))==null?void 0:I.value)||1,i=((b=document.getElementById("apt-form-pricerange"))==null?void 0:b.value)||"$250,000 - $800,000",E=((h=document.getElementById("apt-form-about"))==null?void 0:h.value)||"";try{await r.addApartment({name:t,location:e,numOfFloors:n,numOfSwimmingPool:o,numOfGYM:d,priceRange:i,about:E,images:"images/luxury-complex-marina.jpg",floorPlan:"images/luxury-interior-lounge.jpg",numOfUnitsAvilable:10,unitStatus:"Available"}),P("add-apt-modal"),x.reset(),f(),V(),alert("New apartment complex added successfully!")}catch(w){alert(`Error adding complex: ${w.message}`)}});const U=document.getElementById("open-add-unit-modal-btn"),T=document.getElementById("add-unit-form"),$=document.getElementById("unit-form-apt");function V(){if(!$)return;const a=r.getApartments();$.innerHTML=a.map(t=>`<option value="${t.id||t.apartmentId}">${t.name||t.location||t.apartmentId}</option>`).join("")}V(),U==null||U.addEventListener("click",()=>D("add-unit-modal")),T==null||T.addEventListener("submit",async a=>{var l,g,I,b,h,w,X,Z;a.preventDefault();const t=($==null?void 0:$.value)||"",e=(l=document.getElementById("unit-form-location"))==null?void 0:l.value,n=Number((g=document.getElementById("unit-form-floor"))==null?void 0:g.value)||1,o=Number((I=document.getElementById("unit-form-price"))==null?void 0:I.value)||3e5,d=Number((b=document.getElementById("unit-form-beds"))==null?void 0:b.value)||2,i=Number((h=document.getElementById("unit-form-baths"))==null?void 0:h.value)||2,E=((w=document.getElementById("unit-form-ac"))==null?void 0:w.value)||"AC",c=((X=document.getElementById("unit-form-furnitures"))==null?void 0:X.value)||"Fully Furnished",m=((Z=document.getElementById("unit-form-about"))==null?void 0:Z.value)||"";try{await r.addUnit({apartmentId:t,location:e,floor:n,unitPrice:o,numOfBeds:d,numOfBathRooms:i,numOfRooms:d,acOrNonAC:E,furnitures:c,about:m,availability:"Available",images:"images/luxury-interior-lounge.jpg"}),P("add-unit-modal"),T.reset(),s(),f(),alert("New suite unit added to inventory!")}catch(ot){alert(`Error adding unit: ${ot.message}`)}})});
