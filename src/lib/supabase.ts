import { createClient } from '@supabase/supabase-js';
// Import Database type safely
import type { Database } from '../types/database'; 

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Flag to track if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(`
---------------------------------------
⚠️ Missing Supabase environment variables:
VITE_SUPABASE_URL: ${supabaseUrl ? 'Available ✅' : 'Missing ❌'}
VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Available ✅' : 'Missing ❌'}

The app will run with mock data for demonstration.
For full functionality, please configure the environment variables.
---------------------------------------
  `);
}

// Create Supabase client only if both URL and key are available
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  : // Stub client to prevent crashes when Supabase is not configured
    // This stub will be replaced with mock functionality
    ({
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            limit: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        }
        )
      }
    } as any);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const db = {
  // Profiles
  getProfile: async (userId: string) => {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  updateProfile: async (userId: string, updates: any) => {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },

  createProfile: async (profile: any) => {
    return await supabase
      .from('profiles')
      .insert(profile);
  },

  // Subjects
  getSubjects: async () => {
    return await supabase
      .from('subjects')
      .select('*')
      .order('name');
  },

  // Papers
  getPapers: async (filters?: {
    subject?: string;
    difficulty?: string;
    paperType?: string;
    year?: number;
    search?: string;
  }) => {
    let query = supabase
      .from('papers')
      .select(`
        *,
        subjects (name, display_name, color, icon),
        profiles!papers_uploaded_by_fkey (name)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (filters?.subject) {
      query = query.eq('subjects.name', filters.subject);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.paperType) {
      query = query.eq('paper_type', filters.paperType);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    return await query;
  },

  getPaper: async (paperId: string) => {
    return await supabase
      .from('papers')
      .select(`
        *,
        subjects (name, display_name, color, icon),
        questions (*),
        exam_settings (*)
      `)
      .eq('id', paperId)
      .single();
  },

  uploadPaper: async (paperData: any) => {
    return await supabase
      .from('papers')
      .insert(paperData);
  },

  // Questions
  getQuestions: async (paperId: string) => {
    return await supabase
      .from('questions')
      .select('*')
      .eq('paper_id', paperId)
      .order('question_number');
  },

  // User Responses
  submitResponse: async (responseData: any) => {
    return await supabase
      .from('user_responses')
      .insert(responseData);
  },

  getUserResponses: async (userId: string, questionId?: string) => {
    let query = supabase
      .from('user_responses')
      .select(`
        *,
        ai_gradings (*),
        questions (*)
      `)
      .eq('user_id', userId);

    if (questionId) {
      query = query.eq('question_id', questionId);
    }

    return await query.order('submitted_at', { ascending: false });
  },

  // User Progress
  getUserProgress: async (userId: string) => {
    return await supabase
      .from('user_progress')
      .select(`
        *,
        papers (title, subject_id, subjects (name, display_name))
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
  },

  updateProgress: async (userId: string, paperId: string, progressData: any) => {
    return await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        paper_id: paperId,
        ...progressData,
        updated_at: new Date().toISOString()
      });
  },

  // Achievements
  getAchievements: async () => {
    return await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward');
  },

  getUserAchievements: async (userId: string) => {
    return await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
  },

  unlockAchievement: async (userId: string, achievementId: string) => {
    return await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      });
  },

  // Exam Settings
  getExamSettings: async (paperId?: string) => {
    let query = supabase
      .from('exam_settings')
      .select(`
        *,
        papers (title),
        profiles!exam_settings_created_by_fkey (name)
      `);

    if (paperId) {
      query = query.eq('paper_id', paperId);
    }

    return await query.order('created_at', { ascending: false });
  },

  createExamSettings: async (settingsData: any) => {
    return await supabase
      .from('exam_settings')
      .insert(settingsData);
  },

  updateExamSettings: async (settingsId: string, updates: any) => {
    return await supabase
      .from('exam_settings')
      .update(updates)
      .eq('id', settingsId);
  },

  deleteExamSettings: async (settingsId: string) => {
    return await supabase
      .from('exam_settings')
      .delete()
      .eq('id', settingsId);
  },

  // Collaboration
  getActiveSessions: async () => {
    return await supabase
      .from('collaboration_sessions')
      .select(`
        *,
        profiles!collaboration_sessions_host_id_fkey (name, avatar_url),
        papers (title),
        collaboration_participants (
          user_id,
          profiles (name, avatar_url)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  },

  createSession: async (sessionData: any) => {
    return await supabase
      .from('collaboration_sessions')
      .insert(sessionData);
  },

  joinSession: async (sessionId: string, userId: string) => {
    return await supabase
      .from('collaboration_participants')
      .insert({
        session_id: sessionId,
        user_id: userId
      });
  },

  // Annotations
  getAnnotations: async (paperId: string, userId?: string) => {
    let query = supabase
      .from('annotations')
      .select(`
        *,
        profiles (name, avatar_url)
      `)
      .eq('paper_id', paperId);

    if (userId) {
      query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
    } else {
      query = query.eq('is_public', true);
    }

    return await query.order('created_at', { ascending: false });
  },

  createAnnotation: async (annotationData: any) => {
    return await supabase
      .from('annotations')
      .insert(annotationData);
  },

  // File Storage
  uploadFile: async (bucket: string, path: string, file: File) => {
    return await supabase.storage
      .from(bucket)
      .upload(path, file);
  },

  getFileUrl: (bucket: string, path: string) => {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path);
  },

  // Real-time subscriptions
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }
};

export default supabase;