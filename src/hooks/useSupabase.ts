import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, auth, db } from '../lib/supabase';

// Auth hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut
  };
};

// Profile hook
export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await db.getProfile(userId);
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: any) => {
    if (!userId) return;
    
    try {
      const { error } = await db.updateProfile(userId, updates);
      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, ...updates }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
};

// Papers hook
export const usePapers = (filters?: any) => {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const { data, error } = await db.getPapers(filters);
        if (error) throw error;
        setPapers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [JSON.stringify(filters)]);

  return { papers, loading, error, refetch: () => setLoading(true) };
};

// Single paper hook
export const usePaper = (paperId: string) => {
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) return;

    const fetchPaper = async () => {
      try {
        const { data, error } = await db.getPaper(paperId);
        if (error) throw error;
        setPaper(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  return { paper, loading, error };
};

// User progress hook
export const useUserProgress = (userId?: string) => {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await db.getUserProgress(userId);
        if (error) throw error;
        setProgress(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  const updateProgress = async (paperId: string, progressData: any) => {
    if (!userId) return;

    try {
      const { error } = await db.updateProgress(userId, paperId, progressData);
      if (error) throw error;
      
      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.paper_id === paperId);
        if (existing) {
          return prev.map(p => 
            p.paper_id === paperId 
              ? { ...p, ...progressData }
              : p
          );
        } else {
          return [...prev, { user_id: userId, paper_id: paperId, ...progressData }];
        }
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { progress, loading, error, updateProgress };
};

// Achievements hook
export const useAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const [achievementsResult, userAchievementsResult] = await Promise.all([
          db.getAchievements(),
          userId ? db.getUserAchievements(userId) : { data: [], error: null }
        ]);

        if (achievementsResult.error) throw achievementsResult.error;
        if (userAchievementsResult.error) throw userAchievementsResult.error;

        setAchievements(achievementsResult.data || []);
        setUserAchievements(userAchievementsResult.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  const unlockAchievement = async (achievementId: string) => {
    if (!userId) return;

    try {
      const { error } = await db.unlockAchievement(userId, achievementId);
      if (error) throw error;
      
      // Update local state
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        setUserAchievements(prev => [...prev, {
          user_id: userId,
          achievement_id: achievementId,
          achievements: achievement,
          unlocked_at: new Date().toISOString()
        }]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { achievements, userAchievements, loading, error, unlockAchievement };
};

// Real-time subscription hook
export const useRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const subscription = db.subscribeToTable(table, callback);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [table, callback]);
};

// File upload hook
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (bucket: string, path: string, file: File) => {
    setUploading(true);
    setError(null);

    try {
      const { data, error } = await db.uploadFile(bucket, path, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = db.getFileUrl(bucket, path);
      return { data, publicUrl };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, error };
};