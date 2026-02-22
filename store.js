// Data Management Layer
const STORAGE_KEY_SONGS = 'drumofir_songs';
const STORAGE_KEY_SKILLS = 'drumofir_skills';

export const store = {
  // --- SONGS ---
  getSongs: () => {
    const data = localStorage.getItem(STORAGE_KEY_SONGS);
    return data ? JSON.parse(data) : [];
  },

  saveSongs: (songs) => {
    localStorage.setItem(STORAGE_KEY_SONGS, JSON.stringify(songs));
  },

  getSong: (id) => {
    const songs = store.getSongs();
    return songs.find(s => s.id === id);
  },

  addSong: (song) => {
    const songs = store.getSongs();
    const newSong = {
      ...song,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    songs.push(newSong);
    store.saveSongs(songs);
    return newSong;
  },

  updateSong: (id, updates) => {
    const songs = store.getSongs();
    const index = songs.findIndex(s => s.id === id);
    if (index !== -1) {
      songs[index] = { ...songs[index], ...updates };
      store.saveSongs(songs);
      return songs[index];
    }
  },

  deleteSong: (id) => {
    const songs = store.getSongs();
    const filtered = songs.filter(s => s.id !== id);
    store.saveSongs(filtered);
  },

  // --- SKILLS ---
  getSkills: () => {
    const data = localStorage.getItem(STORAGE_KEY_SKILLS);
    return data ? JSON.parse(data) : [];
  },

  saveSkills: (skills) => {
    localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(skills));
  },

  getSkill: (id) => {
    const skills = store.getSkills();
    return skills.find(s => s.id === id);
  },

  addSkill: (skill) => {
    const skills = store.getSkills();
    const newSkill = {
      ...skill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    skills.push(newSkill);
    store.saveSkills(skills);
    return newSkill;
  },

  updateSkill: (id, updates) => {
    const skills = store.getSkills();
    const index = skills.findIndex(s => s.id === id);
    if (index !== -1) {
      skills[index] = { ...skills[index], ...updates };
      store.saveSkills(skills);
      return skills[index];
    }
  },

  deleteSkill: (id) => {
    const skills = store.getSkills();
    const filtered = skills.filter(s => s.id !== id);
    store.saveSkills(filtered);
  }
};
