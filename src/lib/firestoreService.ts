import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, sanitizePayload } from './firebase';
import { JournalEntry, Interaction } from '../types';

/**
 * Ensures strict User Data Isolation:
 * All entries and interactions are stored under `/users/{userId}/...`
 */

export async function getUserEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) throw new Error('User ID is required to fetch entries.');
  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  const entries: JournalEntry[] = [];
  snapshot.forEach((docSnap) => {
    entries.push(docSnap.data() as JournalEntry);
  });
  return entries;
}

export async function saveUserEntry(entry: JournalEntry): Promise<void> {
  if (!entry.userId) throw new Error('User ID missing on entry payload.');
  if (!entry.id) throw new Error('Entry ID is required.');
  const entryDocRef = doc(db, 'users', entry.userId, 'entries', entry.id);
  const cleanPayload = sanitizePayload(entry);
  await setDoc(entryDocRef, cleanPayload, { merge: true });
}

export async function deleteUserEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) throw new Error('User ID and Entry ID required.');
  const entryDocRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryDocRef);

  // Also clean up sub-interactions for this entry
  try {
    const interactionsRef = collection(db, 'users', userId, 'interactions');
    const q = query(interactionsRef, where('entryId', '==', entryId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('Failed to clean up associated interactions:', error);
  }
}

export async function getEntryInteractions(userId: string, entryId: string): Promise<Interaction[]> {
  if (!userId || !entryId) return [];
  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, where('entryId', '==', entryId), orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  const interactions: Interaction[] = [];
  snapshot.forEach((docSnap) => {
    interactions.push(docSnap.data() as Interaction);
  });
  return interactions;
}

export async function saveInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.userId || !interaction.id) {
    throw new Error('User ID and Interaction ID are required.');
  }
  const interactionDocRef = doc(db, 'users', interaction.userId, 'interactions', interaction.id);
  const cleanPayload = sanitizePayload(interaction);
  await setDoc(interactionDocRef, cleanPayload);
}
