import { store } from './store.js';

// DOM Elements
const itemsGrid = document.getElementById('items-grid');
const addBtn = document.getElementById('add-btn');
const itemModal = document.getElementById('item-modal');
const modalTitle = document.getElementById('modal-title');
const itemForm = document.getElementById('item-form');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');

// Form Inputs
const idInput = document.getElementById('item-id');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const difficultyInput = document.getElementById('difficulty');
const progressInput = document.getElementById('progress');

// iTunes Search
const itunesSearchContainer = document.querySelector('.search-container');
const itunesSearchInput = document.getElementById('itunes-search');
const itunesResults = document.getElementById('itunes-results');
let searchTimeout;

// Current State
let activeTab = 'songs'; // 'songs' or 'skills'
let currentItems = [];

// Initialize Application
function init() {
  loadItemsFromStore();
  renderItems();
  setupEventListeners();
}

function loadItemsFromStore() {
  currentItems = activeTab === 'songs' ? store.getSongs() : store.getSkills();
}

function setupEventListeners() {
  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTab = e.target.dataset.tab;

      // Update Add Button & Placeholders
      addBtn.textContent = activeTab === 'songs' ? '+ Add Song' : '+ Add Skill';
      searchInput.placeholder = activeTab === 'songs' ? 'Search songs...' : 'Search skills...';

      closeModal();
      loadItemsFromStore();
      updateView();
    });
  });

  // Modal toggle
  addBtn.addEventListener('click', () => openModal());
  cancelBtn.addEventListener('click', closeModal);

  // Close modal on outside click
  itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) closeModal();
  });

  // Form submit
  itemForm.addEventListener('submit', handleFormSubmit);

  // Search & Sort
  searchInput.addEventListener('input', updateView);
  sortSelect.addEventListener('change', updateView);

  // iTunes Search
  itunesSearchInput.addEventListener('input', handleItunesSearch);
  document.addEventListener('click', (e) => {
    if (!itunesSearchInput.contains(e.target) && !itunesResults.contains(e.target)) {
      itunesResults.classList.add('hidden');
    }
  });
}

async function handleItunesSearch(e) {
  const query = e.target.value.trim();
  if (query.length < 2) {
    itunesResults.classList.add('hidden');
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?entity=song&term=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      renderItunesResults(data.results);
    } catch (err) {
      console.error('iTunes API error:', err);
    }
  }, 300);
}

function renderItunesResults(results) {
  if (results.length === 0) {
    itunesResults.innerHTML = '<li class="empty-note">No results found</li>';
  } else {
    itunesResults.innerHTML = results.map(song => `
      <li data-title="${escapeHtml(song.trackName)}" data-artist="${escapeHtml(song.artistName)}">
        <strong>${escapeHtml(song.trackName)}</strong> <br/>
        <span style="font-size: 0.75rem; color: var(--text-secondary)">${escapeHtml(song.artistName)}</span>
      </li>
    `).join('');

    itunesResults.querySelectorAll('li[data-title]').forEach(li => {
      li.addEventListener('click', (e) => {
        titleInput.value = e.currentTarget.dataset.title;
        artistInput.value = e.currentTarget.dataset.artist;
        itunesSearchInput.value = `${e.currentTarget.dataset.title} - ${e.currentTarget.dataset.artist}`;
        itunesResults.classList.add('hidden');
      });
    });
  }
  itunesResults.classList.remove('hidden');
}

// Render Logic
function renderItems() {
  if (currentItems.length === 0) {
    const itemName = activeTab === 'songs' ? 'songs' : 'skills';
    itemsGrid.innerHTML = `
      <div class="empty-state">
        <p>No ${itemName} added yet. Hit the "+ Add" button to start tracking your grooves!</p>
      </div>
    `;
    return;
  }

  itemsGrid.innerHTML = currentItems.map(item => createItemCard(item)).join('');

  // Attach event listeners to newly created card buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const item = activeTab === 'songs' ? store.getSong(id) : store.getSkill(id);
      if (item) openModal(item);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (confirm(`Are you sure you want to delete this ${activeTab === 'songs' ? 'song' : 'skill'}?`)) {
        const id = e.currentTarget.dataset.id;
        if (activeTab === 'songs') store.deleteSong(id);
        else store.deleteSkill(id);

        loadItemsFromStore();
        updateView();
      }
    });
  });

  // Slider events
  document.querySelectorAll('.mastery-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const id = e.target.dataset.id;
      const val = e.target.value;
      // Visual update while dragging
      document.getElementById(`mastery-val-${id}`).textContent = `${val}%`;
      e.target.style.setProperty('--progress', `${val}%`);
    });

    slider.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const val = parseInt(e.target.value);
      // Persist on release
      if (activeTab === 'songs') store.updateSong(id, { progress: val });
      else store.updateSkill(id, { progress: val });

      loadItemsFromStore();
      updateView();
    });
  });

  // Note/Struggle Checkbox events
  document.querySelectorAll('.struggle-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const li = e.currentTarget;
      const itemId = li.dataset.itemId;
      const type = li.dataset.type; // 'notes' or 'struggles'
      const index = parseInt(li.dataset.index);

      const itemData = activeTab === 'songs' ? store.getSong(itemId) : store.getSkill(itemId);
      const completionKey = type === 'notes' ? 'completedNotes' : 'completedStruggles';
      let completed = itemData[completionKey] || [];

      if (completed.includes(index)) {
        completed = completed.filter(i => i !== index);
        li.classList.remove('completed');
      } else {
        completed.push(index);
        li.classList.add('completed');
      }

      if (activeTab === 'songs') store.updateSong(itemId, { [completionKey]: completed });
      else store.updateSkill(itemId, { [completionKey]: completed });
    });
  });

  // Inline Add events
  document.querySelectorAll('.inline-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const type = e.currentTarget.dataset.type;
      handleInlineAdd(id, type);
    });
  });

  document.querySelectorAll('.inline-struggle-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const idStr = e.currentTarget.id; // inline-notes-123 or inline-struggles-123
        const isNotes = idStr.includes('inline-notes-');
        const id = idStr.replace(isNotes ? 'inline-notes-' : 'inline-struggles-', '');
        handleInlineAdd(id, isNotes ? 'notes' : 'struggles');
      }
    });
  });
}

function handleInlineAdd(itemId, type) {
  const inputId = type === 'notes' ? `inline-notes-${itemId}` : `inline-struggles-${itemId}`;
  const inputEl = document.getElementById(inputId);
  const newItem = inputEl.value.trim();
  if (!newItem) return;

  const itemData = activeTab === 'songs' ? store.getSong(itemId) : store.getSkill(itemId);
  const existingList = itemData[type] ? itemData[type].split('\n').filter(s => s.trim() !== '') : [];
  existingList.push(newItem);

  if (activeTab === 'songs') store.updateSong(itemId, { [type]: existingList.join('\n') });
  else store.updateSkill(itemId, { [type]: existingList.join('\n') });

  loadItemsFromStore();
  renderItems();
}

function createItemCard(item) {
  const difficultyMap = {
    1: '🟢 Beginner',
    2: '🟡 Easy',
    3: '🟠 Medium',
    4: '🔴 Hard',
    5: '🔥 Extreme'
  };

  // Parse Notes
  let notesHtml = '';
  const notesList = item.notes ? item.notes.split('\n').filter(s => s.trim() !== '') : [];
  const completedNotes = item.completedNotes || [];

  notesHtml = `
    <div class="struggles-preview">
      <strong>Notes:</strong>
      <ul class="struggles-list" id="notes-list-${item.id}">
        ${notesList.map((note, index) => `
          <li class="struggle-item ${completedNotes.includes(index) ? 'completed' : ''}" 
              data-item-id="${item.id}" 
              data-type="notes"
              data-index="${index}">
            <span class="checkbox"></span>
            <span class="text">${escapeHtml(note)}</span>
          </li>
        `).join('')}
        ${notesList.length === 0 ? '<li class="empty-note">No notes yet. Add one!</li>' : ''}
      </ul>
      <div class="inline-add-struggle">
        <input type="text" placeholder="Add a new note..." class="inline-struggle-input" id="inline-notes-${item.id}" />
        <button class="btn secondary-btn inline-add-btn" data-id="${item.id}" data-type="notes">Add</button>
      </div>
    </div>
  `;

  // Parse Struggles
  let strugglesHtml = '';
  const strugglesList = item.struggles ? item.struggles.split('\n').filter(s => s.trim() !== '') : [];
  const completedStruggles = item.completedStruggles || [];

  strugglesHtml = `
    <div class="struggles-preview">
      <strong>Struggles:</strong>
      <ul class="struggles-list" id="struggles-list-${item.id}">
        ${strugglesList.map((struggle, index) => `
          <li class="struggle-item ${completedStruggles.includes(index) ? 'completed' : ''}" 
              data-item-id="${item.id}" 
              data-type="struggles"
              data-index="${index}">
            <span class="checkbox"></span>
            <span class="text">${escapeHtml(struggle)}</span>
          </li>
        `).join('')}
        ${strugglesList.length === 0 ? '<li class="empty-note">No struggles yet. Add one!</li>' : ''}
      </ul>
      <div class="inline-add-struggle">
        <input type="text" placeholder="Add a new struggle..." class="inline-struggle-input" id="inline-struggles-${item.id}" />
        <button class="btn secondary-btn inline-add-btn" data-id="${item.id}" data-type="struggles">Add</button>
      </div>
    </div>
  `;

  return `
    <div class="song-card" data-id="${item.id}">
      <div class="song-header">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          ${item.artist ? `<p class="artist">${escapeHtml(item.artist)}</p>` : ''}
        </div>
        <div class="difficulty-badge">
          ${difficultyMap[item.difficulty] || item.difficulty}
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-header">
          <span>Mastery (<span id="mastery-val-${item.id}">${item.progress}%</span>)</span>
        </div>
        <div class="slider-wrapper">
          <input type="range" min="0" max="100" value="${item.progress}" 
                 class="mastery-slider" 
                 data-id="${item.id}" 
                 style="--progress: ${item.progress}%" />
        </div>
      </div>

      <div class="lists-container" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
        ${notesHtml}
        ${strugglesHtml}
      </div>

      <div class="card-actions">
        <button class="icon-btn edit-btn" data-id="${item.id}" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" data-id="${item.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

// Modal Logic
function openModal(item = null) {
  const isSong = activeTab === 'songs';

  // Toggle Visibility of Song-specific fields
  if (isSong) {
    itunesSearchContainer.style.display = 'block';
    artistInput.parentElement.style.display = 'block';

    // Set custom placeholders
    titleInput.readOnly = true;
    artistInput.readOnly = true;
    titleInput.placeholder = 'Select from search above...';
    artistInput.placeholder = 'Select from search above...';
    saveBtn.textContent = item ? 'Save Song' : 'Save Song'; // Even updating it says save song, but I'll make it generic 
  } else {
    // Skills Mode
    itunesSearchContainer.style.display = 'none';
    artistInput.parentElement.style.display = 'none';

    // Allow typing directly
    titleInput.readOnly = false;
    artistInput.readOnly = false;
    titleInput.placeholder = 'e.g. Double Kick Paradiddle';
    saveBtn.textContent = 'Save Skill';
  }

  if (item) {
    modalTitle.textContent = isSong ? 'Edit Song' : 'Edit Skill';
    saveBtn.textContent = isSong ? 'Update Song' : 'Update Skill';
    idInput.value = item.id;
    titleInput.value = item.title;
    artistInput.value = item.artist || '';
    difficultyInput.value = item.difficulty;
    progressInput.value = item.progress;
    itunesSearchContainer.style.display = 'none'; // hide search on edit
    titleInput.readOnly = false; // Allow manual edit of title if they want during update
    artistInput.readOnly = false; 
  } else {
    modalTitle.textContent = isSong ? 'Add New Song' : 'Add New Skill';
    saveBtn.textContent = isSong ? 'Save Song' : 'Save Skill';
    itemForm.reset();
    idInput.value = '';
    titleInput.value = '';
    artistInput.value = '';
    difficultyInput.value = 3; // default
    progressInput.value = 0; // default
    itunesResults.classList.add('hidden');
  }
  itemModal.classList.remove('hidden');
}

function closeModal() {
  itemModal.classList.add('hidden');
  itemForm.reset();
  itunesResults.classList.add('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    title: titleInput.value.trim(),
    difficulty: parseInt(difficultyInput.value),
    progress: parseInt(progressInput.value)
  };

  if (activeTab === 'songs') {
    formData.artist = artistInput.value.trim();
  }

  const id = idInput.value;

  if (activeTab === 'songs') {
    if (id) store.updateSong(id, formData);
    else store.addSong(formData);
  } else {
    // Skills
    if (id) store.updateSkill(id, formData);
    else store.addSkill(formData);
  }

  loadItemsFromStore();
  updateView();
  closeModal();
}

// Search & Sort Logic
function updateView() {
  const searchTerm = searchInput.value.toLowerCase();
  const sortMethod = sortSelect.value;

  // 1. Filter
  let filtered = [];
  if (activeTab === 'songs') {
    filtered = store.getSongs().filter(song =>
      song.title.toLowerCase().includes(searchTerm) ||
      song.artist.toLowerCase().includes(searchTerm)
    );
  } else {
    filtered = store.getSkills().filter(skill =>
      skill.title.toLowerCase().includes(searchTerm)
    );
  }

  // 2. Sort
  filtered.sort((a, b) => {
    switch (sortMethod) {
      case 'recent':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'progress-desc':
        return b.progress - a.progress;
      case 'progress-asc':
        return a.progress - b.progress;
      case 'difficulty-desc':
        return b.difficulty - a.difficulty;
      case 'difficulty-asc':
        return a.difficulty - b.difficulty;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  currentItems = filtered;
  renderItems();
}

// Utility
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Boot application
init();
