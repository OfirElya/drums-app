const STORAGE_KEY = 'drum_tracker_songs';

export const store = {
  // Load songs from localStorage
  getSongs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load songs from localStorage:', e);
      return [];
    }
  },

  // Save songs array to localStorage
  saveSongs(songs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
      return true;
    } catch (e) {
      console.error('Failed to save songs to localStorage:', e);
      return false;
    }
  },

  // Add a new song
  addSong(songData) {
    const songs = this.getSongs();
    const newSong = {
      ...songData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    songs.push(newSong);
    this.saveSongs(songs);
    return newSong;
  },

  // Update an existing song
  updateSong(id, updateData) {
    const songs = this.getSongs();
    const index = songs.findIndex(s => s.id === id);
    if (index !== -1) {
      songs[index] = { ...songs[index], ...updateData, updatedAt: new Date().toISOString() };
      this.saveSongs(songs);
      return songs[index];
    }
    return null;
  },

  // Delete a song
  deleteSong(id) {
    const songs = this.getSongs();
    const filteredSongs = songs.filter(s => s.id !== id);
    if (filteredSongs.length !== songs.length) {
      this.saveSongs(filteredSongs);
      return true;
    }
    return false;
  },

  // Get single song
  getSong(id) {
    return this.getSongs().find(s => s.id === id) || null;
  }
};
