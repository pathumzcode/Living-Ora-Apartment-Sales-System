import{r as m,a as c,b as p,g,h as v}from"./ui-Cc2Hp2Ce.js";import{s as u}from"./store-NPwDcqf5.js";document.addEventListener("DOMContentLoaded",()=>{if(!m())return;c(),p();const t=g(),a=document.getElementById("client-name"),i=document.getElementById("client-email"),o=document.getElementById("client-uid"),s=document.getElementById("client-status");a&&(a.textContent=t.name||`${t.firstName} ${t.lastName}`),i&&(i.textContent=t.email),o&&(o.textContent=t.uid||t.empId||"USR-EXT-5001"),s&&(s.textContent=t.status||"Verified Client");const n=document.getElementById("reservations-list"),d=u.getBookings().filter(e=>e.userEmail===t.email||e.uid===t.uid);function l(){if(n){if(d.length===0){n.innerHTML=`
        <div class="card" style="padding: 3rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">You have no active unit reservations yet.</p>
          <a href="apartments.html" class="btn btn-primary">Browse Available Residences</a>
        </div>
      `;return}n.innerHTML=d.map(e=>{let r="badge-warning";return e.status==="Approved"&&(r="badge-success"),e.status==="Rejected"&&(r="badge-danger"),`
        <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
            <div>
              <span class="badge ${r}" style="margin-bottom: 0.5rem;">${e.status}</span>
              <h3 style="font-size: 1.35rem; color: var(--text-main);">${e.unitLocation||`Unit ${e.unitId}`}</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem;">
                Booking Code: <strong style="color: var(--primary);">${e.bookingId}</strong> &bull; Reserved: ${e.bookingDate}
              </p>
            </div>
            <div style="text-align: right;">
              <span style="display: block; font-size: 0.8rem; color: var(--text-dim);">Down Payment</span>
              <strong style="font-size: 1.4rem; color: var(--primary);">${v(e.downPayment)}</strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; background-color: var(--bg-dark); padding: 1rem; border-radius: var(--radius-md); font-size: 0.88rem;">
            <div>
              <span style="display: block; color: var(--text-dim);">Payment Method</span>
              <strong>${e.paymentMethod||"Bank Transfer"}</strong>
            </div>
            <div>
              <span style="display: block; color: var(--text-dim);">Payment Receipt</span>
              <span style="color: var(--info);">📄 ${e.paymentProof||"receipt.pdf"}</span>
            </div>
            <div>
              <span style="display: block; color: var(--text-dim);">Requested Customizations</span>
              <strong>${e.additions||"Standard Luxury Finish"}</strong>
            </div>
            <div>
              <span style="display: block; color: var(--text-dim);">Reservation Expiry</span>
              <strong style="color: var(--danger);">${e.expireDate}</strong>
            </div>
          </div>
        </div>
      `}).join("")}}l()});
