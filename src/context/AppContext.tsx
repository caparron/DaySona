import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppData, Mission, LongTermGoal, Achievement } from '@/types';
import { emptyData } from '@/types';
import { hasLocalData, loadData, saveData } from '@/utils/storage';
import { supabase } from '@/utils/supabase';
import { todayKey } from '@/utils/date';
import { checkAndBreakStreak, recordCompletion, removeCompletion } from '@/utils/streak';

interface AppContextValue {
  data: AppData;
  session: Session | null;
  authLoading: boolean;
  dataReady: boolean;
  dataUserId: string | null;
  syncStatus: 'idle' | 'loading' | 'saving' | 'synced' | 'error';
  syncError: string | null;
  retryCloudSync: () => void;
  signOut: () => Promise<void>;
  // Profile
  setProfile: (name: string, location: string) => void;
  // Missions
  addMission: (title: string, date?: string, category?: string) => void;
  setMissionCategory: (id: string, category?: string) => void;
  toggleMission: (id: string) => void;
  editMission: (id: string, title: string) => void;
  setMissionImportance: (id: string, importance: number) => void;
  deleteMission: (id: string) => void;
  setSuccessThreshold: (threshold: number) => void;
  getMissionsForDate: (date: string) => Mission[];
  // Thoughts
  addThought: (content: string) => void;
  editThought: (id: string, content: string) => void;
  deleteThought: (id: string) => void;
  // Questions
  addQuestion: (content: string) => void;
  toggleQuestionStatus: (id: string) => void;
  editQuestion: (id: string, content: string) => void;
  deleteQuestion: (id: string) => void;
  // Long term
  addLongTerm: (title: string, description: string, targetDate?: string, category?: string) => void;
  updateLongTerm: (id: string, updates: Partial<LongTermGoal>) => void;
  deleteLongTerm: (id: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt'>) => void;
  updateAchievementPhoto: (id: string, photo: string) => void;
  deleteAchievement: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (name: string) => void;
  // Streak helpers
  firstCompletionToday: boolean;
  clearFirstCompletion: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function normalizeAppData(value: unknown): AppData {
  const saved = value && typeof value === 'object' ? value as Partial<AppData> : {};
  return {
    ...emptyData,
    ...saved,
    profile: saved.profile || null,
    missions: Array.isArray(saved.missions) ? saved.missions.map(m => ({ ...m, importance: m.importance ?? -1 })) : [],
    thoughts: Array.isArray(saved.thoughts) ? saved.thoughts : [],
    questions: Array.isArray(saved.questions) ? saved.questions : [],
    longTerm: Array.isArray(saved.longTerm) ? saved.longTerm : [],
    achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
    categories: Array.isArray(saved.categories) ? saved.categories.filter((category): category is string => typeof category === 'string') : [],
    categoryColors: saved.categoryColors && typeof saved.categoryColors === 'object'
      ? Object.fromEntries(Object.entries(saved.categoryColors).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && /^#[0-9a-fA-F]{6}$/.test(entry[1])))
      : {},
    streak: { ...emptyData.streak, ...(saved.streak || {}) },
    successThreshold: saved.successThreshold ?? emptyData.successThreshold,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [dataUserId, setDataUserId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<AppContextValue['syncStatus']>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncRetry, setSyncRetry] = useState(0);
  const [firstCompletionToday, setFirstCompletionToday] = useState(false);
  const authEventSeen = useRef(false);
  const activeUserId = useRef<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    const applySession = (nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null;
      if (activeUserId.current !== nextUserId) {
        setData(emptyData);
        setDataReady(false);
        setDataUserId(null);
        setFirstCompletionToday(false);
      }
      activeUserId.current = nextUserId;
      setSession(nextSession);
      setAuthLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      authEventSeen.current = true;
      applySession(nextSession);
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return;
      // The auth listener can observe a newer sign-in/out while getSession is still pending.
      if (!authEventSeen.current) applySession(sessionData.session);
    }).catch(() => {
      if (!active) return;
      if (!authEventSeen.current) applySession(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const userId = session?.user.id;
    if (!userId) {
      setData(emptyData);
      setDataUserId(null);
      setDataReady(false);
      setSyncStatus('idle');
      setSyncError(null);
      setFirstCompletionToday(false);
      return;
    }

    setData(emptyData);
    setDataReady(false);
    setDataUserId(null);
    setSyncStatus('loading');
    setSyncError(null);
    let cancelled = false;

    const loadAccountData = async () => {
      try {
        const { data: row, error } = await supabase
          .from('user_app_data')
          .select('data')
          .eq('user_id', userId)
          .maybeSingle();
        if (error) throw error;

        let loaded: AppData;
        if (row) {
          loaded = normalizeAppData(row.data);
        } else if (hasLocalData(userId)) {
          // One-time migration: seed a new cloud account row from this account's existing local progress.
          loaded = loadData(userId);
          const { error: migrationError } = await supabase.from('user_app_data').insert({
            user_id: userId,
            data: loaded,
            updated_at: new Date().toISOString(),
          });
          if (migrationError?.code === '23505') {
            // Another device won the first-write race: its cloud row is authoritative.
            const { data: winningRow, error: rereadError } = await supabase
              .from('user_app_data')
              .select('data')
              .eq('user_id', userId)
              .maybeSingle();
            if (rereadError) throw rereadError;
            if (!winningRow) throw migrationError;
            loaded = normalizeAppData(winningRow.data);
          } else if (migrationError) {
            throw migrationError;
          }
        } else {
          loaded = emptyData;
        }

        if (cancelled) return;
        setData({ ...loaded, streak: checkAndBreakStreak(loaded.streak) });
        setDataUserId(userId);
        setDataReady(true);
        setSyncStatus('synced');
      } catch (error) {
        if (cancelled) return;
        const cached = loadData(userId);
        setData({ ...cached, streak: checkAndBreakStreak(cached.streak) });
        setDataUserId(userId);
        setDataReady(true);
        setSyncStatus('error');
        setSyncError(error instanceof Error ? error.message : 'Could not reach Supabase.');
      }
    };

    void loadAccountData();
    return () => { cancelled = true; };
  }, [authLoading, session?.user.id, syncRetry]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId || !dataReady || dataUserId !== userId) return;

    // Keep a local recovery copy, while Supabase remains the source loaded on every device.
    saveData(data, userId);
    setSyncStatus('saving');
    const snapshot = data;
    const timeout = setTimeout(() => {
      saveQueue.current = saveQueue.current.catch(() => undefined).then(async () => {
        if (activeUserId.current !== userId) return;
        try {
          const { error } = await supabase.from('user_app_data').upsert({
            user_id: userId,
            data: snapshot,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
          if (activeUserId.current !== userId) return;
          if (error) throw error;
          setSyncStatus('synced');
          setSyncError(null);
        } catch (error) {
          if (activeUserId.current !== userId) return;
          setSyncStatus('error');
          setSyncError(error instanceof Error ? error.message : 'Could not save your account data.');
        }
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [data, dataReady, dataUserId, session?.user.id]);

  const retryCloudSync = useCallback(() => setSyncRetry(value => value + 1), []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    activeUserId.current = null;
    setSession(null);
    setData(emptyData);
    setDataReady(false);
    setDataUserId(null);
    setSyncStatus('idle');
    setSyncError(null);
    setFirstCompletionToday(false);
  }, []);

  const setProfile = useCallback((name: string, location: string) => {
    setData(d => ({ ...d, profile: { name, location } }));
  }, []);

  const addMission = useCallback((title: string, date?: string, category?: string) => {
    const dKey = date || todayKey();
    setData(d => ({
      ...d,
      missions: [
        ...d.missions,
        { id: uid(), title: title.trim(), done: false, date: dKey, createdAt: Date.now(), importance: -1, ...(category ? { category } : {}) },
      ],
    }));
  }, []);

  const setMissionCategory = useCallback((id: string, category?: string) => {
    setData(d => ({
      ...d,
      missions: d.missions.map(mission => {
        if (mission.id !== id) return mission;
        const updated = { ...mission };
        if (category) updated.category = category;
        else delete updated.category;
        return updated;
      }),
    }));
  }, []);

  const toggleMission = useCallback((id: string) => {
    setData(d => {
      const mission = d.missions.find(m => m.id === id);
      if (!mission) return d;
      const newDone = !mission.done;
      const missions = d.missions.map(m => m.id === id ? { ...m, done: newDone } : m);
      const mDate = mission.date;
      let streak = d.streak;

      if (newDone) {
        const wasCompletedToday = d.streak.completedDates.includes(mDate);
        streak = recordCompletion(d.streak, mDate);
        if (!wasCompletedToday) {
          setFirstCompletionToday(true);
        }
      } else {
        const hasOther = missions.some(m => m.date === mDate && m.done && m.id !== id);
        streak = removeCompletion(d.streak, mDate, hasOther);
      }

      return { ...d, missions, streak };
    });
  }, []);

  const editMission = useCallback((id: string, title: string) => {
    setData(d => ({
      ...d,
      missions: d.missions.map(m => m.id === id ? { ...m, title: title.trim() } : m),
    }));
  }, []);

  const setMissionImportance = useCallback((id: string, importance: number) => {
    setData(d => ({
      ...d,
      missions: d.missions.map(m => m.id === id ? { ...m, importance: Math.max(0, Math.min(100, Math.round(importance))) } : m),
    }));
  }, []);

  const setSuccessThreshold = useCallback((threshold: number) => {
    setData(d => ({ ...d, successThreshold: Math.max(0, Math.min(100, Math.round(threshold))) }));
  }, []);

  const deleteMission = useCallback((id: string) => {
    setData(d => {
      const mission = d.missions.find(m => m.id === id);
      if (!mission) return d;
      const missions = d.missions.filter(m => m.id !== id);
      let streak = d.streak;
      if (mission.done) {
        const hasOther = missions.some(m => m.date === mission.date && m.done);
        streak = removeCompletion(d.streak, mission.date, hasOther);
      }
      return { ...d, missions, streak };
    });
  }, []);

  const getMissionsForDate = useCallback((date: string) => {
    return data.missions.filter(m => m.date === date);
  }, [data.missions]);

  const addThought = useCallback((content: string) => {
    setData(d => ({
      ...d,
      thoughts: [
        { id: uid(), content: content.trim(), date: todayKey(), createdAt: Date.now() },
        ...d.thoughts,
      ],
    }));
  }, []);

  const editThought = useCallback((id: string, content: string) => {
    setData(d => ({
      ...d,
      thoughts: d.thoughts.map(t => t.id === id ? { ...t, content: content.trim() } : t),
    }));
  }, []);

  const deleteThought = useCallback((id: string) => {
    setData(d => ({ ...d, thoughts: d.thoughts.filter(t => t.id !== id) }));
  }, []);

  const addQuestion = useCallback((content: string) => {
    setData(d => ({
      ...d,
      questions: [
        { id: uid(), content: content.trim(), status: 'open' as const, date: todayKey(), createdAt: Date.now() },
        ...d.questions,
      ],
    }));
  }, []);

  const toggleQuestionStatus = useCallback((id: string) => {
    setData(d => ({
      ...d,
      questions: d.questions.map(q => q.id === id
        ? { ...q, status: q.status === 'open' ? 'solved' as const : 'open' as const, solvedAt: q.status === 'open' ? Date.now() : undefined }
        : q
      ),
    }));
  }, []);

  const editQuestion = useCallback((id: string, content: string) => {
    setData(d => ({
      ...d,
      questions: d.questions.map(q => q.id === id ? { ...q, content: content.trim() } : q),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setData(d => ({ ...d, questions: d.questions.filter(q => q.id !== id) }));
  }, []);

  const addLongTerm = useCallback((title: string, description: string, targetDate?: string, category?: string) => {
    setData(d => ({
      ...d,
      longTerm: [
        { id: uid(), title: title.trim(), description: description.trim(), progress: 0, targetDate: targetDate || undefined, milestones: [], createdAt: Date.now(), ...(category ? { category } : {}) },
        ...d.longTerm,
      ],
    }));
  }, []);

  const updateLongTerm = useCallback((id: string, updates: Partial<LongTermGoal>) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
  }, []);

  const deleteLongTerm = useCallback((id: string) => {
    setData(d => ({ ...d, longTerm: d.longTerm.filter(g => g.id !== id) }));
  }, []);

  const addMilestone = useCallback((goalId: string, title: string) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => g.id === goalId
        ? { ...g, milestones: [...g.milestones, { id: uid(), title: title.trim(), done: false }] }
        : g
      ),
    }));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map(ms => ms.id === milestoneId ? { ...ms, done: !ms.done } : ms);
        const doneCount = milestones.filter(ms => ms.done).length;
        const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : g.progress;
        return { ...g, milestones, progress };
      }),
    }));
  }, []);

  const deleteMilestone = useCallback((goalId: string, milestoneId: string) => {
    setData(d => ({
      ...d,
      longTerm: d.longTerm.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.filter(ms => ms.id !== milestoneId);
        const doneCount = milestones.filter(ms => ms.done).length;
        const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : g.progress;
        return { ...g, milestones, progress };
      }),
    }));
  }, []);

  const clearFirstCompletion = useCallback(() => setFirstCompletionToday(false), []);

  const addAchievement = useCallback((achievement: Omit<Achievement, 'id' | 'createdAt'>) => {
    setData(d => ({
      ...d,
      achievements: [{ ...achievement, id: uid(), createdAt: Date.now() }, ...d.achievements],
    }));
  }, []);

  const updateAchievementPhoto = useCallback((id: string, photo: string) => {
    setData(d => ({
      ...d,
      achievements: d.achievements.map(achievement => achievement.id === id ? { ...achievement, photo } : achievement),
    }));
  }, []);

  const deleteAchievement = useCallback((id: string) => {
    setData(d => ({ ...d, achievements: d.achievements.filter(achievement => achievement.id !== id) }));
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    const category = name.trim();
    if (!category || category.length > 20 || !/^#[0-9a-fA-F]{6}$/.test(color)) return;
    setData(d => {
      if (d.categories.some(existing => existing.toLocaleLowerCase() === category.toLocaleLowerCase())) return d;
      return { ...d, categories: [...d.categories, category], categoryColors: { ...d.categoryColors, [category]: color } };
    });
  }, []);

  const deleteCategory = useCallback((name: string) => {
    setData(d => ({
      ...d,
      categories: d.categories.filter(category => category !== name),
      categoryColors: Object.fromEntries(Object.entries(d.categoryColors).filter(([category]) => category !== name)),
      missions: d.missions.map(mission => mission.category === name ? { ...mission, category: undefined } : mission),
      longTerm: d.longTerm.map(goal => goal.category === name ? { ...goal, category: undefined } : goal),
      achievements: d.achievements.map(achievement => achievement.category === name ? { ...achievement, category: undefined, categoryColor: undefined } : achievement),
    }));
  }, []);

  const value: AppContextValue = {
    data,
    session,
    authLoading,
    dataReady,
    dataUserId,
    syncStatus,
    syncError,
    retryCloudSync,
    signOut,
    setProfile,
    addMission,
    setMissionCategory,
    toggleMission,
    editMission,
    setMissionImportance,
    deleteMission,
    setSuccessThreshold,
    getMissionsForDate,
    addThought,
    editThought,
    deleteThought,
    addQuestion,
    toggleQuestionStatus,
    editQuestion,
    deleteQuestion,
    addLongTerm,
    updateLongTerm,
    deleteLongTerm,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    addAchievement,
    updateAchievementPhoto,
    deleteAchievement,
    addCategory,
    deleteCategory,
    firstCompletionToday,
    clearFirstCompletion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
