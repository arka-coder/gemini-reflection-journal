import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { MirrorPage } from './components/MirrorPage';
import { DecisionWorkspace } from './components/DecisionWorkspace';
import {
  getUserEntries,
  getUserMemories,
  saveUserMemories,
  getUserDecisions,
  saveUserDecision,
  deleteUserDecision,
  saveUserEntry,
} from './lib/firestoreService';
import { DEMO_ENTRIES, DEMO_MEMORIES, DEMO_DECISION } from './data/demoMindspace';
import { JournalEntry, MemoryItem, DecisionItem } from './types';
import { RefreshCw } from 'lucide-react';

const AuthenticatedWorkspace: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || '';

  const [activeTab, setActiveTab] = useState<NavTab>('mirror');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [decisionContext, setDecisionContext] = useState<{ title?: string; context?: string; category?: any } | undefined>(undefined);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load user data on startup
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    async function loadData() {
      try {
        const [loadedEntries, loadedMemories, loadedDecisions] = await Promise.all([
          getUserEntries(userId),
          getUserMemories(userId),
          getUserDecisions(userId),
        ]);

        if (isMounted) {
          // If the user has zero entries, pre-seed the rich mindspace so they can instantly see the AI Mirror in action
          if (loadedEntries.length === 0 && loadedMemories.length === 0) {
            const seededEntries = DEMO_ENTRIES.map((e) => ({ ...e, userId }));
            const seededMemories = DEMO_MEMORIES.map((m) => ({ ...m, userId }));
            const seededDecision: DecisionItem = { ...DEMO_DECISION, userId };

            // Save to local cache & firestore in background
            saveUserMemories(userId, seededMemories);
            saveUserDecision(seededDecision);
            for (const ent of seededEntries) {
              saveUserEntry(ent);
            }

            setEntries(seededEntries);
            setMemories(seededMemories);
            setDecisions([seededDecision]);
          } else {
            setEntries(loadedEntries);
            setMemories(loadedMemories);
            setDecisions(loadedDecisions);
          }
          setDataLoaded(true);
        }
      } catch (err) {
        console.warn('Initial data load notice:', err);
        if (isMounted) setDataLoaded(true);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSeedDemoData = async () => {
    if (!userId) return;
    const seededEntries = DEMO_ENTRIES.map((e) => ({ ...e, userId }));
    const seededMemories = DEMO_MEMORIES.map((m) => ({ ...m, userId }));
    const seededDecision: DecisionItem = { ...DEMO_DECISION, userId };

    setEntries(seededEntries);
    setMemories(seededMemories);
    setDecisions((prev) => [seededDecision, ...prev.filter((d) => d.id !== seededDecision.id)]);

    await saveUserMemories(userId, seededMemories);
    await saveUserDecision(seededDecision);
    for (const ent of seededEntries) {
      await saveUserEntry(ent);
    }
  };

  const handleSaveDecision = async (decision: DecisionItem) => {
    await saveUserDecision(decision);
    setDecisions((prev) => {
      const idx = prev.findIndex((d) => d.id === decision.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = decision;
        return copy;
      }
      return [decision, ...prev];
    });
  };

  const handleDeleteDecision = async (decisionId: string) => {
    await deleteUserDecision(userId, decisionId);
    setDecisions((prev) => prev.filter((d) => d.id !== decisionId));
  };

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col">
        {activeTab === 'journal' && (
          <Dashboard
            entries={entries}
            onEntriesUpdated={(updated) => setEntries(updated)}
            onNavigateToMirror={() => setActiveTab('mirror')}
            onNavigateToDecide={(ctx) => {
              setDecisionContext(ctx);
              setActiveTab('decide');
            }}
          />
        )}

        {activeTab === 'mirror' && (
          <MirrorPage
            userId={userId}
            entries={entries}
            memories={memories}
            decisions={decisions}
            onNavigateToDecide={(ctx) => {
              setDecisionContext(ctx);
              setActiveTab('decide');
            }}
            onNavigateToReflect={() => setActiveTab('journal')}
            onSeedDemoData={handleSeedDemoData}
          />
        )}

        {activeTab === 'decide' && (
          <DecisionWorkspace
            userId={userId}
            decisions={decisions}
            entries={entries}
            memories={memories}
            onSaveDecision={handleSaveDecision}
            onDeleteDecision={handleDeleteDecision}
            initialContext={decisionContext}
          />
        )}
      </main>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative z-10 text-slate-300">
        <div className="p-8 rounded-2xl glass-card flex flex-col items-center shadow-2xl border border-white/10 backdrop-blur-xl">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-3" />
          <p className="text-xs font-medium text-slate-300">Checking secure authentication status...</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedWorkspace /> : (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />
      <LandingPage />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#090b10] flex flex-col text-slate-100 relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Ambient atmospheric lighting & subtle canvas texture */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle noise-like geometric dot grid */}
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Soft Aurora glows */}
          <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute top-1/4 -right-40 w-[42rem] h-[42rem] bg-indigo-500/[0.06] rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 left-1/4 w-[38rem] h-[38rem] bg-teal-500/[0.06] rounded-full blur-[130px]" />
        </div>

        <MainContent />
      </div>
    </AuthProvider>
  );
}
