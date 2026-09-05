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
import { JournalEntry, Interaction, MemoryItem, DecisionItem } from '../types';

/**
 * Ensures strict User Data Isolation:
 * All entries, interactions, memories, and decisions are stored under `/users/{userId}/...`
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

// ==========================================
// MEMORY ENGINE FIRESTORE METHODS
// ==========================================

export async function getUserMemories(userId: string): Promise<MemoryItem[]> {
  if (!userId) return [];
  try {
    const memoriesRef = collection(db, 'users', userId, 'memories');
    const q = query(memoriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const memories: MemoryItem[] = [];
    snapshot.forEach((docSnap) => {
      memories.push(docSnap.data() as MemoryItem);
    });
    return memories;
  } catch (err) {
    console.warn('Could not fetch memories from Firestore, falling back to local storage:', err);
    try {
      const local = localStorage.getItem(`reflection_journal_memories_${userId}`) || localStorage.getItem(`divergence_memories_${userId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }
}

export async function saveUserMemories(userId: string, memories: MemoryItem[]): Promise<void> {
  if (!userId || !memories.length) return;
  // Always update local cache first
  try {
    const existing = await getUserMemories(userId);
    const map = new Map<string, MemoryItem>();
    existing.forEach((m) => map.set(m.id || m.content, m));
    memories.forEach((m) => map.set(m.id || m.content, m));
    const merged = Array.from(map.values());
    localStorage.setItem(`reflection_journal_memories_${userId}`, JSON.stringify(merged));
  } catch {
    // ignore local storage error
  }

  try {
    const batch = writeBatch(db);
    for (const mem of memories) {
      if (mem.id) {
        const docRef = doc(db, 'users', userId, 'memories', mem.id);
        batch.set(docRef, sanitizePayload(mem), { merge: true });
      }
    }
    await batch.commit();
  } catch (err) {
    console.warn('Batch save to Firestore memories was skipped or failed:', err);
  }
}

// ==========================================
// DECISION INTELLIGENCE FIRESTORE METHODS
// ==========================================

export async function getUserDecisions(userId: string): Promise<DecisionItem[]> {
  if (!userId) return [];
  try {
    const decisionsRef = collection(db, 'users', userId, 'decisions');
    const q = query(decisionsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const decisions: DecisionItem[] = [];
    snapshot.forEach((docSnap) => {
      decisions.push(docSnap.data() as DecisionItem);
    });
    return decisions;
  } catch (err) {
    console.warn('Could not fetch decisions from Firestore, using local fallback:', err);
    try {
      const local = localStorage.getItem(`reflection_journal_decisions_${userId}`) || localStorage.getItem(`divergence_decisions_${userId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }
}

export async function saveUserDecision(decision: DecisionItem): Promise<void> {
  if (!decision.userId || !decision.id) throw new Error('User ID and Decision ID are required.');
  
  // Update local cache
  try {
    const local = localStorage.getItem(`reflection_journal_decisions_${decision.userId}`) || localStorage.getItem(`divergence_decisions_${decision.userId}`);
    const existing: DecisionItem[] = local ? JSON.parse(local) : [];
    const idx = existing.findIndex((d) => d.id === decision.id);
    if (idx >= 0) {
      existing[idx] = decision;
    } else {
      existing.unshift(decision);
    }
    localStorage.setItem(`reflection_journal_decisions_${decision.userId}`, JSON.stringify(existing));
  } catch {
    // ignore
  }

  try {
    const decisionDocRef = doc(db, 'users', decision.userId, 'decisions', decision.id);
    const cleanPayload = sanitizePayload(decision);
    await setDoc(decisionDocRef, cleanPayload, { merge: true });
  } catch (err) {
    console.warn('Firestore save for decision failed:', err);
  }
}

export async function deleteUserDecision(userId: string, decisionId: string): Promise<void> {
  if (!userId || !decisionId) return;
  try {
    const local = localStorage.getItem(`reflection_journal_decisions_${userId}`) || localStorage.getItem(`divergence_decisions_${userId}`);
    if (local) {
      const existing: DecisionItem[] = JSON.parse(local);
      const filtered = existing.filter((d) => d.id !== decisionId);
      localStorage.setItem(`reflection_journal_decisions_${userId}`, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }

  try {
    const decisionDocRef = doc(db, 'users', userId, 'decisions', decisionId);
    await deleteDoc(decisionDocRef);
  } catch (err) {
    console.warn('Firestore delete for decision failed:', err);
  }
}

// ==========================================
// CACHED MIRROR SYNTHESIS
// ==========================================

export async function getCachedMirrorAnalysis(userId: string): Promise<any | null> {
  if (!userId) return null;
  try {
    const local = localStorage.getItem(`reflection_journal_mirror_cache_${userId}`) || localStorage.getItem(`divergence_mirror_cache_${userId}`);
    if (local) return JSON.parse(local);
  } catch {
    // ignore
  }
  return null;
}

export async function saveCachedMirrorAnalysis(userId: string, analysis: any): Promise<void> {
  if (!userId || !analysis) return;
  try {
    localStorage.setItem(`reflection_journal_mirror_cache_${userId}`, JSON.stringify(analysis));
  } catch {
    // ignore
  }
}
