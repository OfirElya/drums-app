import { db } from './firebase.js';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, getDoc, updateDoc } from 'firebase/firestore';

export const store = {
  uid: null, // Set by main.js auth state listener

  setUserId(uid) {
    this.uid = uid;
  },

  async getItems(type) {
    if (!this.uid) return [];
    const q = query(collection(db, 'users', this.uid, type), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getSongs() { return this.getItems('songs'); },
  async getSkills() { return this.getItems('skills'); },

  async getItem(type, id) {
    if (!this.uid) return null;
    const docRef = doc(db, 'users', this.uid, type, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getSong(id) { return this.getItem('songs', id); },
  async getSkill(id) { return this.getItem('skills', id); },

  async addItem(type, itemData) {
    if (!this.uid) return;
    const newId = crypto.randomUUID();
    const item = {
      ...itemData,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', this.uid, type, newId), item);
  },

  async addSong(song) { return this.addItem('songs', song); },
  async addSkill(skill) { return this.addItem('skills', skill); },

  async updateItem(type, id, updates) {
    if (!this.uid) return;
    const docRef = doc(db, 'users', this.uid, type, id);
    await updateDoc(docRef, updates);
  },

  async updateSong(id, updates) { return this.updateItem('songs', id, updates); },
  async updateSkill(id, updates) { return this.updateItem('skills', id, updates); },

  async deleteItem(type, id) {
    if (!this.uid) return;
    await deleteDoc(doc(db, 'users', this.uid, type, id));
  },

  async deleteSong(id) { return this.deleteItem('songs', id); },
  async deleteSkill(id) { return this.deleteItem('skills', id); }
};
