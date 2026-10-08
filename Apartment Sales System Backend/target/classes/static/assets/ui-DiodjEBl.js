(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const d of l.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function a(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(i){if(i.ep)return;i.ep=!0;const l=a(i);fetch(i.href,l)}})();const n="http://localhost:8080/api",s=()=>{const e={"Content-Type":"application/json"},t=localStorage.getItem("livingora_token");return t&&(e.Authorization=`Bearer ${t}`),e},r=async e=>{if(!e.ok){const t=await e.text();let a=`HTTP Error ${e.status}: ${e.statusText}`;try{a=JSON.parse(t).message||a}catch{t&&(a=t)}throw new Error(a)}return e.json()},h={login:async e=>{const t=await fetch(`${n}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e.email,password:e.password})});return r(t)},signup:async e=>{const t=await fetch(`${n}/auth/external/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});return r(t)}},y={getOverview:async()=>{const e=JSON.parse(localStorage.getItem("livingora_user")||"null"),t=await fetch(`${n}/admin/overview`,{headers:{...s(),"X-Admin-Emp-Id":(e==null?void 0:e.uid)||(e==null?void 0:e.empId)||""}});return r(t)},getInternalUsers:async()=>{const e=JSON.parse(localStorage.getItem("livingora_user")||"null"),t=await fetch(`${n}/admin/internal-users`,{headers:{...s(),"X-Admin-Emp-Id":(e==null?void 0:e.uid)||(e==null?void 0:e.empId)||""}});return r(t)},getExternalUsers:async()=>{const e=JSON.parse(localStorage.getItem("livingora_user")||"null"),t=await fetch(`${n}/admin/external-users`,{headers:{...s(),"X-Admin-Emp-Id":(e==null?void 0:e.uid)||(e==null?void 0:e.empId)||""}});return r(t)},getVerifications:async()=>{const e=JSON.parse(localStorage.getItem("livingora_user")||"null"),t=await fetch(`${n}/admin/verifications`,{headers:{...s(),"X-Admin-Emp-Id":(e==null?void 0:e.uid)||(e==null?void 0:e.empId)||""}});return r(t)},getAuditLogs:async()=>{const e=JSON.parse(localStorage.getItem("livingora_user")||"null"),t=await fetch(`${n}/admin/audit-logs`,{headers:{...s(),"X-Admin-Emp-Id":(e==null?void 0:e.uid)||(e==null?void 0:e.empId)||""}});return r(t)},updateInternalAccess:async(e,t)=>{const a=JSON.parse(localStorage.getItem("livingora_user")||"null"),o=await fetch(`${n}/admin/internal-users/${encodeURIComponent(e)}/access`,{method:"PATCH",headers:{...s(),"X-Admin-Emp-Id":(a==null?void 0:a.uid)||(a==null?void 0:a.empId)||""},body:JSON.stringify(t)});return r(o)},updateExternalAccess:async(e,t)=>{const a=JSON.parse(localStorage.getItem("livingora_user")||"null"),o=await fetch(`${n}/admin/external-users/${encodeURIComponent(e)}/access`,{method:"PATCH",headers:{...s(),"X-Admin-Emp-Id":(a==null?void 0:a.uid)||(a==null?void 0:a.empId)||""},body:JSON.stringify(t)});return r(o)},createInternalUser:async e=>{const t=JSON.parse(localStorage.getItem("livingora_user")||"null"),a=await fetch(`${n}/admin/internal-users`,{method:"POST",headers:{...s(),"X-Admin-Emp-Id":(t==null?void 0:t.uid)||(t==null?void 0:t.empId)||""},body:JSON.stringify(e)});return r(a)},updateInternalUser:async(e,t)=>{const a=JSON.parse(localStorage.getItem("livingora_user")||"null"),o=await fetch(`${n}/admin/internal-users/${encodeURIComponent(e)}`,{method:"PUT",headers:{...s(),"X-Admin-Emp-Id":(a==null?void 0:a.uid)||(a==null?void 0:a.empId)||""},body:JSON.stringify(t)});return r(o)}},A={getAll:async()=>{const e=await fetch(`${n}/apartments`,{headers:s()});return r(e)},getById:async e=>{const t=await fetch(`${n}/apartments/${e}`,{headers:s()});return r(t)},create:async e=>{const t=await fetch(`${n}/apartments`,{method:"POST",headers:s(),body:JSON.stringify(e)});return r(t)}},v={getAll:async()=>{const e=await fetch(`${n}/units`,{headers:s()});return r(e)},getByApartmentId:async e=>{const t=await fetch(`${n}/units/apartment/${e}`,{headers:s()});return r(t)},getById:async e=>{const t=await fetch(`${n}/units/${e}`,{headers:s()});return r(t)},create:async e=>{const t=await fetch(`${n}/units`,{method:"POST",headers:s(),body:JSON.stringify(e)});return r(t)},update:async(e,t)=>{const a=await fetch(`${n}/units/${encodeURIComponent(e)}`,{method:"PUT",headers:s(),body:JSON.stringify(t)});return r(a)},delete:async e=>{const t=await fetch(`${n}/units/${encodeURIComponent(e)}`,{method:"DELETE",headers:s()});return t.status===204?!0:r(t)},updateStatus:async(e,t)=>{const a=await fetch(`${n}/units/${e}/status?status=${encodeURIComponent(t)}`,{method:"PATCH",headers:s()});return r(a)},search:async(e={})=>{const t=new URLSearchParams;e.availability&&t.append("availability",e.availability),e.apartmentId&&t.append("apartmentId",e.apartmentId);const a=await fetch(`${n}/units?${t.toString()}`,{headers:s()});return r(a)}},S={getAll:async()=>{const e=await fetch(`${n}/bookings`,{headers:s()});return r(e)},create:async e=>{const t=await fetch(`${n}/bookings`,{method:"POST",headers:s(),body:JSON.stringify(e)});return r(t)},updateStatus:async(e,t)=>{const a=await fetch(`${n}/bookings/${e}/status?status=${encodeURIComponent(t)}`,{method:"PATCH",headers:s()});return r(a)}},I={getAll:async()=>{const e=await fetch(`${n}/payments`,{headers:s()});return r(e)},create:async e=>{const t=await fetch(`${n}/payments`,{method:"POST",headers:s(),body:JSON.stringify(e)});return r(t)},updateStatus:async(e,t)=>{const a=JSON.parse(localStorage.getItem("livingora_user")||"null"),o=await fetch(`${n}/payments/${e}/status`,{method:"PATCH",headers:{...s(),"X-Staff-Emp-Id":(a==null?void 0:a.uid)||(a==null?void 0:a.empId)||""},body:JSON.stringify({status:t})});return r(o)}},N={getAll:async()=>{const e=await fetch(`${n}/promotions`,{headers:s()});return r(e)},create:async e=>{const t=await fetch(`${n}/promotions`,{method:"POST",headers:s(),body:JSON.stringify(e)});return r(t)}},O={getAll:async()=>{const e=await fetch(`${n}/external-apartments`,{headers:s()});return r(e)},getByAgent:async e=>{const t=await fetch(`${n}/external-apartments/agent/${encodeURIComponent(e)}`,{headers:s()});return r(t)},create:async e=>{const t=await fetch(`${n}/external-apartments`,{method:"POST",headers:s(),body:JSON.stringify(e)});return r(t)},update:async(e,t)=>{const a=await fetch(`${n}/external-apartments/${encodeURIComponent(e)}`,{method:"PUT",headers:s(),body:JSON.stringify(t)});return r(a)},delete:async e=>{const t=await fetch(`${n}/external-apartments/${encodeURIComponent(e)}`,{method:"DELETE",headers:s()});return t.status===204?!0:r(t)}},u="livingora_v2";localStorage.getItem("livingora_store_version")!==u&&(["livingora_verifications","livingora_bookings","livingora_payments"].forEach(e=>localStorage.removeItem(e)),localStorage.setItem("livingora_store_version",u));const c={ADMIN:"ADMIN",SALES_MANAGER:"SALES_MANAGER",MARKETING_MANAGER:"MARKETING_MANAGER",CUSTOMER_RELATIONS_OFFICER:"CUSTOMER_RELATIONS_OFFICER",FINANCE_PAYMENTS_OFFICER:"FINANCE_PAYMENTS_OFFICER",PROPERTY_DEVELOPMENT_MANAGER:"PROPERTY_DEVELOPMENT_MANAGER",OPERATIONS_DIRECTOR:"OPERATIONS_DIRECTOR",SALES_AGENT:"SALES_AGENT"},R={ADMIN:"System Administrator",SALES_MANAGER:"Sales Manager",MARKETING_MANAGER:"Marketing Manager",CUSTOMER_RELATIONS_OFFICER:"Customer Relations Officer",FINANCE_PAYMENTS_OFFICER:"Finance & Payments Officer",PROPERTY_DEVELOPMENT_MANAGER:"Property Development Manager",OPERATIONS_DIRECTOR:"Operations Director",SALES_AGENT:"External Sales Agent",CUSTOMER:"Registered Customer"};function b(){try{const e=localStorage.getItem("livingora_verifications");if(e)return JSON.parse(e)}catch{}return[]}function T(e){try{localStorage.setItem("livingora_verifications",JSON.stringify(e))}catch(t){console.error("Failed to save verifications table:",t)}}function f(){try{const e=localStorage.getItem("livingora_user");return e?JSON.parse(e):null}catch{return null}}function m(e){if(!(e!=null&&e.token))throw new Error("The server did not return a valid login token");const t={uid:e.uid||e.empId,empId:e.uid||e.empId,email:e.email,firstName:e.firstName,lastName:e.lastName,role:e.role,externalUser:e.externalUser,isCustomer:e.customer,isSalesAgent:e.salesAgent,status:e.status||"Verified",profilePicture:e.profilePicture||"images/luxury-interior-lounge.jpg",name:`${e.firstName||""} ${e.lastName||""}`.trim()};return localStorage.setItem("livingora_token",e.token),localStorage.setItem("livingora_user",JSON.stringify(t)),t}async function _(e,t){const a=e.trim().toLowerCase();try{const o=await h.login({email:a,password:t});return m(o)}catch(o){if(o.message&&!o.message.includes("Failed to fetch")&&!o.message.includes("NetworkError")&&!o.message.includes("ERR_CONNECTION_REFUSED"))throw o;if(console.warn("Backend server is unreachable. Checking demo credentials..."),a==="admin@livingora.lk"&&t==="12345678")return m({token:"demo-admin-jwt-token",uid:"EMP-INT-1001",empId:"EMP-INT-1001",email:"admin@livingora.lk",firstName:"Living-Ora",lastName:"Administrator",role:"ADMIN",externalUser:!1,customer:!1,salesAgent:!1,status:"Verified"});if(a==="operations.director@livingora.lk"&&t==="12345678")return m({token:"demo-ops-jwt-token",uid:"EMP-OPS-1001",empId:"EMP-OPS-1001",email:"operations.director@livingora.lk",firstName:"Operations",lastName:"Director",role:"OPERATIONS_DIRECTOR",externalUser:!1,customer:!1,salesAgent:!1,status:"Verified"});throw new Error("Unable to reach the server. Please ensure the backend is running and try again. Authentication requires a live connection to verify your account in the database.")}}async function w(e){try{const t=await h.signup(e);return m(t)}catch(t){throw t.message&&!t.message.includes("Failed to fetch")&&!t.message.includes("NetworkError")&&!t.message.includes("ERR_CONNECTION_REFUSED")?t:(console.warn("Backend server is unreachable. Registration requires a live database connection."),new Error("Unable to reach the server. Please ensure the backend is running and try again. Registration requires a live connection to create your account in the database."))}}function E(){localStorage.removeItem("livingora_user"),localStorage.removeItem("livingora_token"),window.location.href="index.html"}function g(e){return e===c.ADMIN?"admin-dashboard.html":[c.SALES_MANAGER,c.MARKETING_MANAGER,c.CUSTOMER_RELATIONS_OFFICER,c.FINANCE_PAYMENTS_OFFICER,c.PROPERTY_DEVELOPMENT_MANAGER,c.OPERATIONS_DIRECTOR].includes(e)?"staff-dashboard.html":e===c.SALES_AGENT?"sales-agent-dashboard.html":"customer-dashboard.html"}function P(e=[]){const t=f();return t?e.length>0&&!e.includes(t.role)?(alert("Access restricted for your current account role."),window.location.href=g(t.role),!1):!0:(window.location.href="auth.html?mode=login",!1)}function $(e){return typeof e=="string"&&e.includes("$")?e:`$${(Number(e)||0).toLocaleString()}`}function C(e=""){const t=document.getElementById("navbar-placeholder");if(!t)return;const a=f(),o=a&&["ADMIN","SALES_MANAGER","MARKETING_MANAGER","CUSTOMER_RELATIONS_OFFICER","FINANCE_PAYMENTS_OFFICER","PROPERTY_DEVELOPMENT_MANAGER","OPERATIONS_DIRECTOR"].includes(a.role);let i="";if(a){const d=g(a.role),p=a.role==="ADMIN"?"Admin Control":a.role==="SALES_AGENT"?"Agent Workspace":o?"Staff Workspace":"Client Portal";i=`
      <a href="${d}" class="btn btn-sm btn-outline">${p}</a>
      <button id="nav-logout-btn" class="btn btn-sm btn-primary">Logout</button>
    `}else i=`
      <a href="auth.html?mode=login" class="btn btn-sm btn-outline">Sign In</a>
      <a href="auth.html?mode=signup" class="btn btn-sm btn-primary">Sign Up</a>
    `;t.innerHTML=`
    <header class="navbar">
      <div class="container nav-container">
        <a href="index.html" class="nav-logo">
          <span>Living</span>Ora
        </a>
        <ul class="nav-links">
          <li><a href="index.html" class="nav-link ${e==="home"?"active":""}">Home</a></li>
          <li><a href="apartments.html" class="nav-link ${e==="apartments"?"active":""}">Residences</a></li>
          <li><a href="apartments.html?tab=units" class="nav-link ${e==="units"?"active":""}">Available Units</a></li>
          <li><a href="promotions.html" class="nav-link ${e==="promotions"?"active":""}">Promotions</a></li>
          <li><a href="external-apartments.html" class="nav-link ${e==="external"?"active":""}">Resale Listings</a></li>
        </ul>
        <div class="nav-actions">
          ${i}
        </div>
      </div>
    </header>
  `;const l=document.getElementById("nav-logout-btn");l&&l.addEventListener("click",d=>{d.preventDefault(),E()})}function M(){const e=document.getElementById("footer-placeholder");e&&(e.innerHTML=`
    <footer class="footer-reference">
      <div class="container">
        <!-- Big Watermark Architecture Branding -->
        <div class="footer-top-brand">
          <div>
            <div class="footer-watermark-title">LIVING ORA</div>
            <p style="color: var(--text-muted); max-width: 480px; font-size: 0.95rem;">
              Premium architectural suites, waterfront penthouses, and condominium developments crafted for sophisticated urban lifestyles.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <a href="apartments.html" class="btn btn-primary">Explore Portfolio &rarr;</a>
            <a href="#inquiry-section" class="btn btn-secondary">Inquire Now</a>
          </div>
        </div>

        <!-- 4 Column Grid Links -->
        <div class="footer-columns-grid">
          <div class="footer-col">
            <h4>Living-Ora Group</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
              Transforming Sri Lanka's coastal skyline with prime oceanfront addresses, verified deed compliance, and comprehensive installment schedules.
            </p>
            <div style="display: flex; gap: 0.5rem;">
              <span class="badge badge-gold">Verified Condos</span>
              <span class="badge badge-dark">Luxury Tier</span>
            </div>
          </div>

          <div class="footer-col">
            <h4>Developments</h4>
            <ul>
              <li><a href="apartments.html">All Developments</a></li>
              <li><a href="apartments.html?tab=units">Available Suite Units</a></li>
              <li><a href="apartments.html">Colombo 03 Waterfront</a></li>
              <li><a href="apartments.html">Colombo 07 Marina Heights</a></li>
              <li><a href="external-apartments.html">Secondary & Resale Market</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Client Services</h4>
            <ul>
              <li><a href="customer-dashboard.html">Client Reservation Portal</a></li>
              <li><a href="promotions.html">Down Payment Schemes</a></li>
              <li><a href="auth.html?mode=login">Account Sign In</a></li>
              <li><a href="auth.html?mode=signup">Create Account</a></li>
              <li><a href="internal-login.html">Staff & Admin Access</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Concierge Desk</h4>
            <ul>
              <li><a href="tel:+94112345678">📞 +94 11 234 5678</a></li>
              <li><a href="mailto:concierge@livingora.lk">✉️ concierge@livingora.lk</a></li>
              <li><a href="#">📍 Marine Drive, Colombo 03, LK</a></li>
              <li><a href="#">⏰ Mon - Sat: 8:30 AM - 6:30 PM</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom-bar">
          <div>&copy; ${new Date().getFullYear()} Living-Ora Apartment Sales Management System. All rights reserved.</div>
          <div style="display: flex; gap: 1.5rem;">
            <a href="#">Privacy Policy</a>
            <a href="#">Deed Terms</a>
            <a href="#">Legal Verification</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  `)}function L(e){const t=document.getElementById(e);t&&(t.classList.add("open"),document.body.style.overflow="hidden")}function k(e){const t=document.getElementById(e);t&&(t.classList.remove("open"),document.body.style.overflow="")}function U(){document.querySelectorAll("[data-modal-close]").forEach(e=>{e.addEventListener("click",()=>{const t=e.closest(".modal-overlay");t&&(t.classList.remove("open"),document.body.style.overflow="")})}),document.querySelectorAll(".modal-overlay").forEach(e=>{e.addEventListener("click",t=>{t.target===e&&(e.classList.remove("open"),document.body.style.overflow="")})})}export{R,C as a,M as b,y as c,b as d,T as e,c as f,f as g,$ as h,k as i,g as j,w as k,_ as l,O as m,A as n,L as o,N as p,S as q,P as r,U as s,I as t,v as u};
