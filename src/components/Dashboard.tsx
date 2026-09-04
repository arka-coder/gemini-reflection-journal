import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { JournalEntry, Interaction, MoodType, ReflectionMode } from '../types';
import {
  getUserEntries,
  saveUserEntry,
  deleteUserEntry,
  getEntryInteractions,
  saveInteraction,
  saveUserMemories,
} from '../lib/firestoreService';
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Send,
  Trash2,
  Calendar,
  Save,
  Check,
  RefreshCw,
  Copy,
  Lightbulb,
  FileText,
  MessageSquare,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Compass,
  Heart,
  Zap,
  Feather,
  Clock,
  Quote,
  Wand2,
  Brain,
} from 'lucide-react';

const MOODS: { type: MoodType; label: string; icon: any; color: string }[] = [
  { type: 'reflective', label: 'Reflective', icon: Compass, color: 'text-indigo-300 bg-indigo-500/20 border-indigo-400/40' },
  { type: 'peaceful', label: 'Peaceful', icon: Smile, color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40' },
  { type: 'grateful', label: 'Grateful', icon: Heart, color: 'text-rose-300 bg-rose-500/20 border-rose-400/40' },
  { type: 'energized', label: 'Energized', icon: Zap, color: 'text-amber-300 bg-amber-500/20 border-amber-400/40' },
  { type: 'anxious', label: 'Anxious', icon: Frown, color: 'text-purple-300 bg-purple-500/20 border-purple-400/40' },
  { type: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-300 bg-white/10 border-white/20' },
];

export interface DashboardProps {
  entries?: JournalEntry[];
  onEntriesUpdated?: (entries: JournalEntry[]) => void;
  onNavigateToMirror?: () => void;
  onNavigateToDecide?: (context?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  entries: propEntries,
  onEntriesUpdated,
  onNavigateToMirror,
  onNavigateToDecide,
}) => {
  const { user } = useAuth();
  const userId = user?.uid || '';

  // Entries State
  const [entries, setEntries] = useState<JournalEntry[]>(propEntries || []);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLoading, setEntriesLoading] = useState(true);

  // Active Editor State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<MoodType>('reflective');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Active Interactions State
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneratingMode, setActiveGeneratingMode] = useState<ReflectionMode | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const wordCount = body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load of Entries for authenticated user
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    async function loadEntries() {
      try {
        setEntriesLoading(true);
        const userEntries = await getUserEntries(userId);
        if (isMounted) {
          setEntries(userEntries);
          if (onEntriesUpdated) onEntriesUpdated(userEntries);
          if (userEntries.length > 0) {
            selectEntry(userEntries[0]);
          } else {
            initNewEntry();
          }
        }
      } catch (err: any) {
        console.error('Failed to load user entries:', err);
        if (isMounted) {
          setSaveErrorMessage('Could not load past entries from Firestore.');
        }
      } finally {
        if (isMounted) setEntriesLoading(false);
      }
    }

    loadEntries();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // 2. Load interactions when selected entry changes
  useEffect(() => {
    if (!userId || !selectedEntryId) {
      setInteractions([]);
      return;
    }

    let isMounted = true;
    async function loadInteractions() {
      try {
        setInteractionsLoading(true);
        const inters = await getEntryInteractions(userId, selectedEntryId!);
        if (isMounted) {
          setInteractions(inters);
        }
      } catch (err) {
        console.error('Failed to load interactions:', err);
      } finally {
        if (isMounted) setInteractionsLoading(false);
      }
    }

    loadInteractions();
    return () => {
      isMounted = false;
    };
  }, [userId, selectedEntryId]);

  // Scroll to bottom of chat when new interactions arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactions, isGenerating]);

  // Select an existing entry
  const selectEntry = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setTitle(entry.title || '');
    setBody(entry.body || '');
    setMood(entry.mood || 'reflective');
    setSaveStatus('saved');
    setSaveErrorMessage(null);
    setGenerationError(null);
    setSidebarOpen(false);
  };

  // Create a new blank entry
  const initNewEntry = () => {
    const newId = 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newEntry: JournalEntry = {
      id: newId,
      userId,
      title: 'Evening Reflection - ' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      body: '',
      mood: 'reflective',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSelectedEntryId(newId);
    setTitle(newEntry.title);
    setBody('');
    setMood('reflective');
    setInteractions([]);
    setSaveStatus('unsaved');
    setSaveErrorMessage(null);
    setGenerationError(null);
    setSidebarOpen(false);
  };

  // Manual or Triggered Save to Firestore
  const handleSaveEntry = async (customBody?: string, customTitle?: string, customMood?: MoodType) => {
    if (!userId || !selectedEntryId) return;

    setSaveStatus('saving');
    setSaveErrorMessage(null);

    const currentTitle = customTitle !== undefined ? customTitle : title;
    const currentBody = customBody !== undefined ? customBody : body;
    const currentMood = customMood !== undefined ? customMood : mood;

    const entryToSave: JournalEntry = {
      id: selectedEntryId,
      userId,
      title: currentTitle.trim() || 'Untitled Reflection',
      body: currentBody,
      mood: currentMood,
      tags: [],
      createdAt: entries.find((e) => e.id === selectedEntryId)?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await saveUserEntry(entryToSave);
      setSaveStatus('saved');

      // Update in-memory entries list
      setEntries((prev) => {
        const index = prev.findIndex((e) => e.id === selectedEntryId);
        let updatedList: JournalEntry[];
        if (index >= 0) {
          updatedList = [...prev];
          updatedList[index] = entryToSave;
          updatedList.sort((a, b) => b.updatedAt - a.updatedAt);
        } else {
          updatedList = [entryToSave, ...prev];
        }
        if (onEntriesUpdated) onEntriesUpdated(updatedList);
        return updatedList;
      });

      // Background Personal Memory Engine extraction
      if (entryToSave.body && entryToSave.body.trim().length > 25) {
        fetch('/api/gemini/extract-memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entry: entryToSave, existingMemories: [] }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.memories && Array.isArray(data.memories) && data.memories.length > 0) {
              saveUserMemories(userId, data.memories.map((m: any) => ({ ...m, userId })));
            }
          })
          .catch((err) => console.warn('Background memory extraction notice:', err));
      }

      return entryToSave;
    } catch (error: any) {
      console.error('Firestore save failed:', error);
      setSaveStatus('error');
      setSaveErrorMessage('Failed to save to Firestore. Please check your network and click "Retry Save".');
      return null;
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this reflection and its conversation history? This cannot be undone.')) {
      return;
    }

    try {
      await deleteUserEntry(userId, entryId);
      const remaining = entries.filter((item) => item.id !== entryId);
      setEntries(remaining);
      if (selectedEntryId === entryId) {
        if (remaining.length > 0) {
          selectEntry(remaining[0]);
        } else {
          initNewEntry();
        }
      }
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      alert('Could not delete entry: ' + (err?.message || 'Permission denied'));
    }
  };

  // Helper to execute Gemini generation with multi-turn persistence
  const triggerGeminiInteraction = async (mode: ReflectionMode, customPrompt?: string) => {
    const promptToSend = customPrompt !== undefined ? customPrompt.trim() : chatPrompt.trim();

    if (!body.trim() && !promptToSend) {
      setGenerationError('Please write some reflection content or type a question before asking Gemini.');
      return;
    }

    // Save current entry state first so user edits are safe
    const savedEntry = await handleSaveEntry();
    if (!savedEntry && saveStatus === 'error') {
      return; // Do not proceed if save failed to maintain input-to-save completeness
    }

    setIsGenerating(true);
    setActiveGeneratingMode(mode);
    setGenerationError(null);

    // If chatPrompt was used from the bottom bar, clear input
    if (!customPrompt && chatPrompt) {
      setChatPrompt('');
    }

    // 1. Prepare user interaction object
    const userInteractionId = 'int_' + Date.now() + '_u';
    const userInteraction: Interaction = {
      id: userInteractionId,
      entryId: selectedEntryId!,
      userId,
      role: 'user',
      text: promptToSend || (
        mode === 'summary'
          ? 'Please summarize this journal entry and extract the core realizations.'
          : mode === 'brainstorm'
          ? 'Please brainstorm new perspectives and creative growth opportunities based on this entry.'
          : 'Please provide a deep, empathetic reflection on my entry.'
      ),
      mode,
      timestamp: Date.now(),
    };

    // Optimistically show user interaction in state
    setInteractions((prev) => [...prev, userInteraction]);

    try {
      // 2. Persist user turn to Firestore
      await saveInteraction(userInteraction);

      // 3. Build history for multi-turn Gemini context
      const conversationHistory = interactions.map((item) => ({
        role: item.role,
        text: item.text,
      }));

      // 4. Call server-side API proxy with model fallback ladder
      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userInteraction.text,
          history: conversationHistory,
          mode,
          entryTitle: title,
          entryBody: body,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const modelReplyText = data.text || 'No response returned from Gemini.';
      const modelUsed = data.modelUsed || 'gemini-3.8-flash';

      // 5. Build model interaction object
      const modelInteractionId = 'int_' + Date.now() + '_m';
      const modelInteraction: Interaction = {
        id: modelInteractionId,
        entryId: selectedEntryId!,
        userId,
        role: 'model',
        text: modelReplyText,
        mode,
        modelUsed,
        timestamp: Date.now(),
      };

      // 6. Persist model turn to Firestore (strictly isolated to /users/${userId}/interactions)
      await saveInteraction(modelInteraction);

      // 7. Update UI interactions list
      setInteractions((prev) => [...prev, modelInteraction]);

      // If mode was summary, update entry snippet
      if (mode === 'summary') {
        const updatedEntry = {
          ...savedEntry!,
          lastSummary: modelReplyText.slice(0, 200) + '...',
          updatedAt: Date.now(),
        };
        await saveUserEntry(updatedEntry);
      }
    } catch (err: any) {
      console.error('Gemini interaction error:', err);
      setGenerationError(err?.message || 'Failed to generate reflection. Please try again.');
    } finally {
      setIsGenerating(false);
      setActiveGeneratingMode(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEntries = entries.filter((e) =>
    (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.body || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile Toggle Bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-[#0c0e14]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Past Reflections ({entries.length})</span>
        </button>

        <button
          onClick={initNewEntry}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-white/15 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* LEFT SIDEBAR: History & Entries List */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-80 shrink-0 bg-[#0c0e14]/50 backdrop-blur-xl border-r border-white/10 flex flex-col h-full overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Vault Entries</h2>
              <span className="text-[11px] text-slate-400 font-mono">({entries.length} reflections)</span>
            </div>
          </div>

          <button
            id="new-entry-btn"
            onClick={initNewEntry}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 rounded-xl text-xs font-medium transition cursor-pointer border border-emerald-500/30 backdrop-blur-md shadow-xs"
            title="Create new journal reflection"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="p-3 border-b border-white/10 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search past thoughts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 text-slate-100 placeholder-slate-500 backdrop-blur-sm transition"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {entriesLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading your entries from Firestore...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <p className="font-medium text-slate-300">{searchQuery ? 'No reflections matched.' : 'Your vault is clear.'}</p>
              <p className="text-[11px] text-slate-500">{searchQuery ? 'Try another keyword.' : 'Write your first thought to begin.'}</p>
            </div>
          ) : (
            filteredEntries.map((item) => {
              const isSelected = item.id === selectedEntryId;
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => selectEntry(item)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/[0.08] border-l-2 border-l-emerald-400 border-white/15 shadow-lg shadow-emerald-500/5 text-white backdrop-blur-md'
                      : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className={`text-xs font-semibold truncate flex-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {item.title || 'Untitled Reflection'}
                    </h3>

                    <button
                      onClick={(e) => handleDeleteEntry(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-400 p-0.5 rounded transition cursor-pointer"
                      title="Delete reflection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {item.body.trim() || '(Empty reflection)'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{dateStr}</span>
                    </span>

                    {item.mood && (
                      <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                        {item.mood}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT WORKSPACE: Journal Editor & Gemini Multi-Turn Dialogue */}
      <main className="flex-1 min-w-0 flex flex-col h-full bg-transparent overflow-hidden">
        {/* Top Control & Status Bar */}
        <div className="h-14 shrink-0 px-4 sm:px-8 border-b border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between z-10">
          {/* Save Status Indicator */}
          <div className="flex items-center space-x-3 text-xs">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center space-x-1.5 text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Saving to Firestore...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Vault Secured</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="inline-flex items-center space-x-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Unsaved changes</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center space-x-1.5 text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Save failed</span>
              </span>
            )}
          </div>

          {/* Reading Stats Pill in Center */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-white/[0.03] border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span className="text-slate-600">•</span>
            <span>~{readTimeMinutes} min read</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="manual-save-btn"
              onClick={() => handleSaveEntry()}
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-medium transition cursor-pointer border border-white/15 backdrop-blur-md shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-slate-300" />
              <span>Save</span>
            </button>

            {saveStatus === 'error' && (
              <button
                onClick={() => handleSaveEntry()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 rounded-xl text-xs font-medium border border-rose-500/30 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Save error banner if active */}
        {saveErrorMessage && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-200 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{saveErrorMessage}</span>
            </div>
            <button
              onClick={() => handleSaveEntry()}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
            {/* JOURNAL EDITOR CARD */}
            <section className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-5">
              {/* Title & Mood Selection - Stacked gracefully with zero horizontal clipping */}
              <div className="space-y-3">
                <input
                  id="entry-title-input"
                  type="text"
                  placeholder="Give your reflection a title..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="text-xl sm:text-2xl font-bold text-white bg-transparent border-b border-white/10 hover:border-white/20 focus:border-emerald-500/40 focus:outline-none w-full transition pb-2 placeholder-slate-500 tracking-tight"
                />

                {/* Mood Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-xs text-slate-400 font-medium mr-1.5 select-none">Mood:</span>
                  {MOODS.map((m) => {
                    const Icon = m.icon;
                    const isCurrent = mood === m.type;
                    return (
                      <button
                        key={m.type}
                        type="button"
                        onClick={() => {
                          setMood(m.type);
                          setSaveStatus('unsaved');
                          handleSaveEntry(undefined, undefined, m.type);
                        }}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer border whitespace-nowrap ${
                          isCurrent
                            ? m.color + ' shadow-md backdrop-blur-md ring-1 ring-white/20'
                            : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reflection Textarea */}
              <textarea
                id="entry-body-textarea"
                rows={8}
                placeholder="What is on your mind? Write down your thoughts, experiences, decisions, or feelings here. Gemini will use this context to reflect with you..."
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setSaveStatus('unsaved');
                }}
                className="w-full text-slate-100 text-sm leading-relaxed p-4 bg-white/[0.03] rounded-xl border border-white/10 focus:bg-white/[0.06] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 focus:outline-none transition resize-y font-normal placeholder-slate-500 min-h-[160px]"
              />

            {/* QUICK AI ACTION TRIGGERS */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Gemini to Reflect:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Deep Reflection */}
                <button
                  id="deep-reflection-btn"
                  onClick={() => triggerGeminiInteraction('reflection')}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30 backdrop-blur-md text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isGenerating && activeGeneratingMode === 'reflection' ? 'Reflecting...' : 'Deep Reflection'}</span>
                </button>

                {/* 2. Summarize & Realizations */}
                <button
                  id="summarize-btn"
                  onClick={() => triggerGeminiInteraction('summary')}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-200 border border-blue-500/30 backdrop-blur-md text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isGenerating && activeGeneratingMode === 'summary' ? 'Summarizing...' : 'Key Summary'}</span>
                </button>

                {/* 3. Brainstorm Perspectives */}
                <button
                  id="brainstorm-btn"
                  onClick={() => triggerGeminiInteraction('brainstorm')}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 backdrop-blur-md text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isGenerating && activeGeneratingMode === 'brainstorm' ? 'Brainstorming...' : 'Brainstorm Angles'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* AI Generation Error Banner if active */}
          {generationError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-200 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{generationError}</span>
              </div>
              <button
                onClick={() => triggerGeminiInteraction('reflection')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* MULTI-TURN CONVERSATION & REFLECTIONS STREAM */}
          <section className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-slate-300" />
                <h3 className="text-sm font-bold text-white">Conversation & Reflections</h3>
                <span className="text-xs text-slate-400 font-mono">({interactions.length} turns)</span>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">Isolated to /users/{userId.slice(0, 6)}...</span>
            </div>

            {/* Thread Container */}
            <div className="space-y-5 pt-1">
              {interactionsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-emerald-400" />
                  Loading conversation history...
                </div>
              ) : interactions.length === 0 ? (
                <div className="py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-2">
                      <Feather className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Start Your Dialogue with Gemini 3.8 Flash</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Select an AI reflection tool above, or tap any contemplation prompt below to explore your thoughts together:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {[
                      {
                        title: 'Reflect on Growth',
                        prompt: 'What is one quiet victory or subtle shift in mindset I experienced today?',
                        icon: Compass,
                        color: 'hover:border-emerald-500/40 hover:bg-emerald-500/[0.05]',
                      },
                      {
                        title: 'Examine Tension',
                        prompt: 'What hidden tension or unspoken concern is quietly weighing on my mind right now?',
                        icon: Lightbulb,
                        color: 'hover:border-amber-500/40 hover:bg-amber-500/[0.05]',
                      },
                      {
                        title: 'Future Compass',
                        prompt: 'If I acted with complete kindness and clarity, what step would I take next?',
                        icon: Heart,
                        color: 'hover:border-rose-500/40 hover:bg-rose-500/[0.05]',
                      },
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setChatPrompt(card.prompt);
                          }}
                          className={`p-3 text-left rounded-xl bg-white/[0.03] border border-white/10 ${card.color} transition cursor-pointer group space-y-1.5`}
                        >
                          <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-medium group-hover:text-white">
                            <Icon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{card.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 group-hover:text-slate-200 line-clamp-2 leading-relaxed">
                            "{card.prompt}"
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                interactions.map((msg) => {
                  const isModel = msg.role === 'model';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isModel ? 'items-start gap-3' : 'justify-end'}`}
                    >
                      {isModel && (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-1 shadow-sm">
                          <Feather className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`flex flex-col ${isModel ? 'items-start flex-1 min-w-0' : 'items-end max-w-2xl'}`}>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1 px-1">
                          <span className={`font-semibold ${isModel ? 'text-emerald-300' : 'text-slate-300'}`}>
                            {isModel ? 'Gemini 3.8 Flash' : 'You'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isModel && msg.modelUsed && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                              {msg.modelUsed}
                            </span>
                          )}
                        </div>

                        <div
                          className={`relative group rounded-2xl text-sm leading-relaxed ${
                            isModel
                              ? 'w-full bg-white/[0.03] text-slate-200 border border-white/10 backdrop-blur-md p-5 shadow-lg'
                              : 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/25 backdrop-blur-md px-4 py-3 shadow-sm'
                          }`}
                        >
                          {isModel ? (
                            <div className="markdown-body prose prose-invert max-w-none text-sm space-y-2 text-slate-200">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition text-[10px] backdrop-blur-sm cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied</span>
                              </span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Generating loading indicator */}
              {isGenerating && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1 shadow-sm">
                    <Feather className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start space-y-1 flex-1">
                    <div className="text-[11px] text-emerald-300 font-semibold px-1 flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Gemini 3.8 Flash is contemplating...</span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-300 flex items-center space-x-2 backdrop-blur-md shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Synthesizing emotional nuances and preparing thoughtful insights...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* INTERACTIVE FOLLOW-UP CHAT INPUT */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              {/* Prompt Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium mr-1 select-none">Quick follow-ups:</span>
                {[
                  'How can I reframe this constructively?',
                  'What hidden assumptions might I be making?',
                  'What would a supportive mentor say right now?',
                  'What small experiment could I try tomorrow?',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => triggerGeminiInteraction('chat', sug)}
                    disabled={isGenerating}
                    className="text-[11px] text-slate-300 bg-white/[0.04] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-200 px-3 py-1 rounded-full border border-white/10 transition cursor-pointer disabled:opacity-50 backdrop-blur-sm"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isGenerating && chatPrompt.trim()) {
                    triggerGeminiInteraction('chat');
                  }
                }}
                className="flex items-center space-x-2"
              >
                <input
                  id="chat-prompt-input"
                  type="text"
                  placeholder="Share a follow-up thought or question with Gemini..."
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:bg-white/[0.07] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 focus:outline-none transition disabled:opacity-50 text-white placeholder-slate-500 backdrop-blur-sm"
                />

                <button
                  id="send-chat-btn"
                  type="submit"
                  disabled={isGenerating || !chatPrompt.trim()}
                  className="px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 disabled:opacity-40 text-emerald-200 rounded-xl text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-lg backdrop-blur-md"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
    </div>
  );
};
