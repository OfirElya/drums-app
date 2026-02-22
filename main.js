import { store } from './store.js';

// DOM Elements
const songsGrid = document.getElementById('songs-grid');
const addSongBtn = document.getElementById('add-song-btn');
const songModal = document.getElementById('song-modal');
const modalTitle = document.getElementById('modal-title');
const songForm = document.getElementById('song-form');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// Form Inputs
const idInput = document.getElementById('song-id');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const difficultyInput = document.getElementById('difficulty');
const progressInput = document.getElementById('progress');
const strugglesInput = document.getElementById('struggles');

// Current State
let currentSongs = [];

// Initialize Application
function init() {
  currentSongs = store.getSongs();
  renderSongs();
  setupEventListeners();
}

function setupEventListeners() {
  // Modal toggle
  addSongBtn.addEventListener('click', () => openModal());
  cancelBtn.addEventListener('click', closeModal);

  // Close modal on outside click
  songModal.addEventListener('click', (e) => {
    if (e.target === songModal) closeModal();
  });

  // Form submit
  songForm.addEventListener('submit', handleFormSubmit);

  // Search & Sort
  searchInput.addEventListener('input', updateView);
  sortSelect.addEventListener('change', updateView);
}

// Render Logic
function renderSongs() {
  if (currentSongs.length === 0) {
    songsGrid.innerHTML = `
      <div class="empty-state">
        <p>No songs added yet. Hit the "+ Add Song" button to start tracking your grooves!</p>
      </div>
    `;
    return;
  }

  songsGrid.innerHTML = currentSongs.map(song => createSongCard(song)).join('');

  // Attach event listeners to newly created card buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const song = store.getSong(id);
      if (song) openModal(song);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (confirm('Are you sure you want to delete this song?')) {
        const id = e.currentTarget.dataset.id;
        store.deleteSong(id);
        currentSongs = store.getSongs();
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
      store.updateSong(id, { progress: val });
      currentSongs = store.getSongs(); // Refresh state without total re-render
      // Also update View just to make sure sorting triggers if needed
      updateView();
    });
  });

  // Struggle Checkbox events
  document.querySelectorAll('.struggle-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const li = e.currentTarget;
      const songId = li.dataset.songId;
      const struggleIndex = parseInt(li.dataset.index);

      const song = store.getSong(songId);
      let completed = song.completedStruggles || [];

      if (completed.includes(struggleIndex)) {
        // Uncheck
        completed = completed.filter(i => i !== struggleIndex);
        li.classList.remove('completed');
      } else {
        // Check
        completed.push(struggleIndex);
        li.classList.add('completed');
      }

      store.updateSong(songId, { completedStruggles: completed });
    });
  });

  // Inline Add Struggle events
  document.querySelectorAll('.inline-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      handleInlineAdd(id);
    });
  });

  document.querySelectorAll('.inline-struggle-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const id = e.currentTarget.id.replace('inline-input-', '');
        handleInlineAdd(id);
      }
    });
  });
}

function handleInlineAdd(songId) {
  const inputEl = document.getElementById(`inline-input-${songId}`);
  const newStruggle = inputEl.value.trim();
  if (!newStruggle) return;

  const song = store.getSong(songId);
  const existingStruggles = song.struggles ? song.struggles.split('\\n').filter(s => s.trim() !== '') : [];
  existingStruggles.push(newStruggle);

  store.updateSong(songId, { struggles: existingStruggles.join('\\n') });

  // Refresh state and DOM
  currentSongs = store.getSongs();
  renderSongs();
}

function createSongCard(song) {
  // Map difficulty to color/emoji
  const difficultyMap = {
    1: '🟢 Beginner',
    2: '🟡 Easy',
    3: '🟠 Medium',
    4: '🔴 Hard',
    5: '🔥 Extreme'
  };

  // Parse struggles into checkable list
  let strugglesHtml = '';
  // Support legacy "string" or new object-based struggles
  const strugglesList = song.struggles ? song.struggles.split('\\n').filter(s => s.trim() !== '') : [];
  const completed = song.completedStruggles || [];

  strugglesHtml = `
    <div class="struggles-preview">
      <strong>Notes/Struggles:</strong>
      <ul class="struggles-list" id="list-${song.id}">
        ${strugglesList.map((struggle, index) => `
          <li class="struggle-item ${completed.includes(index) ? 'completed' : ''}" 
              data-song-id="${song.id}" 
              data-index="${index}">
            <span class="checkbox"></span>
            <span class="text">${escapeHtml(struggle)}</span>
          </li>
        `).join('')}
        ${strugglesList.length === 0 ? '<li class="empty-note">No notes yet. Add one below!</li>' : ''}
      </ul>
      <div class="inline-add-struggle">
        <input type="text" placeholder="Add a new note..." class="inline-struggle-input" id="inline-input-${song.id}" />
        <button class="btn secondary-btn inline-add-btn" data-id="${song.id}">Add</button>
      </div>
    </div>
  `;

  return `
    <div class="song-card" data-id="${song.id}">
      <div class="song-header">
        <div>
          <h3>${escapeHtml(song.title)}</h3>
          <p class="artist">${escapeHtml(song.artist)}</p>
        </div>
        <div class="difficulty-badge">
          ${difficultyMap[song.difficulty] || song.difficulty}
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-header">
          <span>Mastery (<span id="mastery-val-${song.id}">${song.progress}%</span>)</span>
        </div>
        <div class="slider-wrapper">
          <input type="range" min="0" max="100" value="${song.progress}" 
                 class="mastery-slider" 
                 data-id="${song.id}" 
                 style="--progress: ${song.progress}%" />
        </div>
      </div>

      ${strugglesHtml}

      <div class="card-actions">
        <button class="icon-btn edit-btn" data-id="${song.id}" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" data-id="${song.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

// Modal Logic
function openModal(song = null) {
  if (song) {
    modalTitle.textContent = 'Edit Song';
    idInput.value = song.id;
    titleInput.value = song.title;
    artistInput.value = song.artist;
    difficultyInput.value = song.difficulty;
    progressInput.value = song.progress;
    strugglesInput.value = song.struggles || '';
  } else {
    modalTitle.textContent = 'Add New Song';
    songForm.reset();
    idInput.value = '';
    difficultyInput.value = 3; // default
    progressInput.value = 0; // default
  }
  songModal.classList.remove('hidden');
}

function closeModal() {
  songModal.classList.add('hidden');
  songForm.reset();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    title: titleInput.value.trim(),
    artist: artistInput.value.trim(),
    difficulty: parseInt(difficultyInput.value),
    progress: parseInt(progressInput.value),
    struggles: strugglesInput.value.trim()
  };

  const id = idInput.value;

  if (id) {
    store.updateSong(id, formData);
  } else {
    store.addSong(formData);
  }

  currentSongs = store.getSongs();
  updateView();
  closeModal();
}

// Search & Sort Logic
function updateView() {
  const searchTerm = searchInput.value.toLowerCase();
  const sortMethod = sortSelect.value;

  // 1. Filter
  let filtered = store.getSongs().filter(song =>
    song.title.toLowerCase().includes(searchTerm) ||
    song.artist.toLowerCase().includes(searchTerm)
  );

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

  currentSongs = filtered;
  renderSongs();
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
