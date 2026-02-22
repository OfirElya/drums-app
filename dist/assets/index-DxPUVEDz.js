(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function s(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=s(r);fetch(r.href,o)}})();const y="drum_tracker_songs",d={getSongs(){try{const e=localStorage.getItem(y);return e?JSON.parse(e):[]}catch(e){return console.error("Failed to load songs from localStorage:",e),[]}},saveSongs(e){try{return localStorage.setItem(y,JSON.stringify(e)),!0}catch(t){return console.error("Failed to save songs to localStorage:",t),!1}},addSong(e){const t=this.getSongs(),s={...e,id:crypto.randomUUID(),createdAt:new Date().toISOString()};return t.push(s),this.saveSongs(t),s},updateSong(e,t){const s=this.getSongs(),n=s.findIndex(r=>r.id===e);return n!==-1?(s[n]={...s[n],...t,updatedAt:new Date().toISOString()},this.saveSongs(s),s[n]):null},deleteSong(e){const t=this.getSongs(),s=t.filter(n=>n.id!==e);return s.length!==t.length?(this.saveSongs(s),!0):!1},getSong(e){return this.getSongs().find(t=>t.id===e)||null}},S=document.getElementById("songs-grid"),x=document.getElementById("add-song-btn"),c=document.getElementById("song-modal"),h=document.getElementById("modal-title"),v=document.getElementById("song-form"),O=document.getElementById("cancel-btn"),E=document.getElementById("search-input"),I=document.getElementById("sort-select"),g=document.getElementById("song-id"),L=document.getElementById("title"),$=document.getElementById("artist"),p=document.getElementById("difficulty"),f=document.getElementById("progress"),B=document.getElementById("struggles");let l=[];function M(){l=d.getSongs(),b(),C()}function C(){x.addEventListener("click",()=>w()),O.addEventListener("click",m),c.addEventListener("click",e=>{e.target===c&&m()}),v.addEventListener("submit",N),E.addEventListener("input",a),I.addEventListener("change",a)}function b(){if(l.length===0){S.innerHTML=`
      <div class="empty-state">
        <p>No songs added yet. Hit the "+ Add Song" button to start tracking your grooves!</p>
      </div>
    `;return}S.innerHTML=l.map(e=>D(e)).join(""),document.querySelectorAll(".edit-btn").forEach(e=>{e.addEventListener("click",t=>{const s=t.currentTarget.dataset.id,n=d.getSong(s);n&&w(n)})}),document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",t=>{if(confirm("Are you sure you want to delete this song?")){const s=t.currentTarget.dataset.id;d.deleteSong(s),l=d.getSongs(),a()}})}),document.querySelectorAll(".mastery-slider").forEach(e=>{e.addEventListener("input",t=>{const s=t.target.dataset.id,n=t.target.value;document.getElementById(`mastery-val-${s}`).textContent=`${n}%`,t.target.style.setProperty("--progress",`${n}%`)}),e.addEventListener("change",t=>{const s=t.target.dataset.id,n=parseInt(t.target.value);d.updateSong(s,{progress:n}),l=d.getSongs(),a()})}),document.querySelectorAll(".struggle-item").forEach(e=>{e.addEventListener("click",t=>{const s=t.currentTarget,n=s.dataset.songId,r=parseInt(s.dataset.index);let i=d.getSong(n).completedStruggles||[];i.includes(r)?(i=i.filter(A=>A!==r),s.classList.remove("completed")):(i.push(r),s.classList.add("completed")),d.updateSong(n,{completedStruggles:i})})})}function D(e){const t={1:"🟢 Beginner",2:"🟡 Easy",3:"🟠 Medium",4:"🔴 Hard",5:"🔥 Extreme"};let s="";if(e.struggles){const n=e.struggles.split("\\n").filter(o=>o.trim()!==""),r=e.completedStruggles||[];s=`
      <div class="struggles-preview">
        <strong>Notes/Struggles:</strong>
        <ul class="struggles-list">
          ${n.map((o,i)=>`
            <li class="struggle-item ${r.includes(i)?"completed":""}" 
                data-song-id="${e.id}" 
                data-index="${i}">
              <span class="checkbox"></span>
              <span class="text">${u(o)}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `}return`
    <div class="song-card" data-id="${e.id}">
      <div class="song-header">
        <div>
          <h3>${u(e.title)}</h3>
          <p class="artist">${u(e.artist)}</p>
        </div>
        <div class="difficulty-badge">
          ${t[e.difficulty]||e.difficulty}
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-header">
          <span>Mastery (<span id="mastery-val-${e.id}">${e.progress}%</span>)</span>
        </div>
        <div class="slider-wrapper">
          <input type="range" min="0" max="100" value="${e.progress}" 
                 class="mastery-slider" 
                 data-id="${e.id}" 
                 style="--progress: ${e.progress}%" />
        </div>
      </div>

      ${s}

      <div class="card-actions">
        <button class="icon-btn edit-btn" data-id="${e.id}" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" data-id="${e.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `}function w(e=null){e?(h.textContent="Edit Song",g.value=e.id,L.value=e.title,$.value=e.artist,p.value=e.difficulty,f.value=e.progress,B.value=e.struggles||""):(h.textContent="Add New Song",v.reset(),g.value="",p.value=3,f.value=0),c.classList.remove("hidden")}function m(){c.classList.add("hidden"),v.reset()}function N(e){e.preventDefault();const t={title:L.value.trim(),artist:$.value.trim(),difficulty:parseInt(p.value),progress:parseInt(f.value),struggles:B.value.trim()},s=g.value;s?d.updateSong(s,t):d.addSong(t),l=d.getSongs(),a(),m()}function a(){const e=E.value.toLowerCase(),t=I.value;let s=d.getSongs().filter(n=>n.title.toLowerCase().includes(e)||n.artist.toLowerCase().includes(e));s.sort((n,r)=>{switch(t){case"recent":return new Date(r.createdAt||0)-new Date(n.createdAt||0);case"progress-desc":return r.progress-n.progress;case"progress-asc":return n.progress-r.progress;case"difficulty-desc":return r.difficulty-n.difficulty;case"difficulty-asc":return n.difficulty-r.difficulty;case"title":return n.title.localeCompare(r.title);default:return 0}}),l=s,b()}function u(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}M();
