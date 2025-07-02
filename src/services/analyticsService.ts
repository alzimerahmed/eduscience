import { supabase } from '../lib/supabaseClient';

export interface UserStats {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalQuestions: number;
  averageScore: number;
  timeSpent: number;
  streak: number;
  completedPapers: number;
  aiSessions: number;
}

export interface SubjectProgress {
  subject: string;
  completed: number;
  total: number;
  level: number;
  xp: number;
}

export interface RecentActivity {
  id: number;
  type: 'paper' | 'tutor' | 'collaboration' | 'blockchain';
  title: string;
  score?: number;
  xpGained: number;
  date: string;
  subject: string;
}

export const analyticsService = {
  /**
   * Get user statistics
   */
  getUserStats: async (userId: string): Promise<UserStats> => {
    try {
      // Get user profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_xp, level, streak_days')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Get user progress information
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (progressError) throw progressError;
      
      // Get user responses (AI sessions)
      const { data: responses, error: responsesError } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', userId);
      
      if (responsesError) throw responsesError;
      
      // Calculate statistics
      const level = profile?.level || 1;
      const currentXP = profile?.total_xp || 0;
      const xpPerLevel = 250;
      const xpToNextLevel = xpPerLevel * (level + 1) - currentXP;
      
      const totalQuestions = progress?.reduce((sum, p) => sum + p.questions_attempted, 0) || 0;
      const totalCorrect = progress?.reduce((sum, p) => sum + p.questions_correct, 0) || 0;
      const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      
      const timeSpent = progress?.reduce((sum, p) => sum + (p.total_time_spent || 0), 0) || 0;
      const timeSpentHours = Math.round(timeSpent / 3600 * 10) / 10; // Convert seconds to hours with 1 decimal
      
      const completedPapers = progress?.filter(p => p.completed)?.length || 0;
      const aiSessions = responses?.length || 0;
      
      return {
        level,
        currentXP,
        xpToNextLevel,
        totalQuestions,
        averageScore,
        timeSpent: timeSpentHours,
        streak: profile?.streak_days || 0,
        completedPapers,
        aiSessions
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  /**
   * Get progress by subject
   */
  getSubjectProgress: async (userId: string): Promise<SubjectProgress[]> => {
    try {
      const { data, error } = await supabase.rpc('get_subject_progress', { user_id: userId });
      
      if (error) {
        // If RPC not available, fallback to client-side calculation
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select(`
            *,
            papers (
              subject_id,
              subjects (name)
            )
          `)
          .eq('user_id', userId);
        
        if (progressError) throw progressError;
        
        // Calculate subject progress
        const subjectData: Record<string, SubjectProgress> = {};
        
        progress?.forEach(p => {
          const subject = p.papers?.subjects?.name || 'Unknown';
          
          if (!subjectData[subject]) {
            subjectData[subject] = {
              subject,
              completed: 0,
              total: 0,
              level: 1,
              xp: 0
            };
          }
          
          subjectData[subject].xp += p.xp_earned || 0;
          subjectData[subject].total += 1;
          if (p.completed) {
            subjectData[subject].completed += 1;
          }
          
          // Calculate subject level (1 level per 100 XP)
          subjectData[subject].level = Math.max(1, Math.floor(subjectData[subject].xp / 100));
        });
        
        return Object.values(subjectData);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching subject progress:', error);
      throw error;
    }
  },

  /**
   * Get recent user activity
   */
  getRecentActivity: async (userId: string, limit: number = 5): Promise<RecentActivity[]> => {
    try {
      // Get recent progress updates
      const { data: recentProgress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          papers (
            title,
            subjects (name)
          )
        `)
        .eq('user_id', userId)
        .order('last_attempt', { ascending: false })
        .limit(limit);
      
      if (progressError) throw progressError;
      
      // Get recent AI tutoring sessions
      const { data: recentTutoring, error: tutoringError } = await supabase
        .from('user_responses')
        .select(`
          *,
          questions (
            *,
            papers (
              title,
              subjects (name)
            )
          ),
          ai_gradings (
            percentage
          )
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(limit);
      
      if (tutoringError) throw tutoringError;
      
      // Get recent collaboration sessions
      const { data: recentCollaboration, error: collaborationError } = await supabase
        .from('collaboration_participants')
        .select(`
          *,
          collaboration_sessions (
            title,
            created_at,
            papers (
              subjects (name)
            )
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(limit);
      
      if (collaborationError) throw collaborationError;
      
      // Combine and format all activities
      const allActivities: RecentActivity[] = [
        ...recentProgress.map(p => ({
          id: parseInt(`1${p.id.substring(0, 8)}`, 16),
          type: 'paper' as const,
          title: p.papers?.title || 'Paper Activity',
          score: p.best_score,
          xpGained: p.xp_earned,
          date: p.last_attempt || p.updated_at,
          subject: p.papers?.subjects?.name || 'General'
        })),
        ...recentTutoring.map(t => ({
          id: parseInt(`2${t.id.substring(0, 8)}`, 16),
          type: 'tutor' as const,
          title: `AI Tutoring: ${t.questions?.papers?.title || 'Question'}`,
          score: t.ai_gradings?.[0]?.percentage,
          xpGained: 15, // Default XP for AI tutoring
          date: t.submitted_at,
          subject: t.questions?.papers?.subjects?.name || 'General'
        })),
        ...recentCollaboration.map(c => ({
          id: parseInt(`3${c.id.substring(0, 8)}`, 16),
          type: 'collaboration' as const,
          title: `Study Group: ${c.collaboration_sessions?.title || 'Collaboration'}`,
          xpGained: 10, // Default XP for collaboration
          date: c.joined_at,
          subject: c.collaboration_sessions?.papers?.subjects?.name || 'General'
        }))
      ];
      
      // Sort by date (most recent first) and limit
      return allActivities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  /**
   * Get user achievements
   */
  getUserAchievements: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      
      // Format for easier consumption by frontend
      return (data || []).map(ua => ({
        id: ua.achievements.id,
        title: ua.achievements.name.replace(/_/g, ' '),
        description: ua.achievements.description,
        unlocked: true,
        unlocked_at: ua.unlocked_at,
        xp: ua.achievements.xp_reward,
        icon: ua.achievements.icon,
        rarity: ua.achievements.rarity
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  },

  /**
   * Get all achievements (including locked ones)
   */
  getAllAchievements: async (userId: string): Promise<any[]> => {
    try {
      // Get all possible achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true });
      
      if (achievementsError) throw achievementsError;
      
      // Get user's unlocked achievements
      const { data: unlockedAchievements, error: unlockedError } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          unlocked_at
        `)
        .eq('user_id', userId);
      
      if (unlockedError) throw unlockedError;
      
      // Create a map of unlocked achievement IDs for quick lookup
      const unlockedMap = new Map();
      unlockedAchievements?.forEach(ua => {
        unlockedMap.set(ua.achievement_id, ua.unlocked_at);
      });
      
      // Merge the data
      return (allAchievements || []).map(a => ({
        id: a.id,
        title: a.name.replace(/_/g, ' '),
        description: a.description,
        unlocked: unlockedMap.has(a.id),
        unlocked_at: unlockedMap.get(a.id),
        xp: a.xp_reward,
        icon: a.icon,
        rarity: a.rarity
      }));
    } catch (error) {
      console.error('Error fetching all achievements:', error);
      throw error;
    }
  },

  /**
   * Get streak data
   */
  getUserStreak: async (userId: string): Promise<{ current: number; best: number; history: any[] }> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak_days, last_activity')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // In a real implementation, we would have a streak_history table
      // For now, return mock data based on current streak
      const current = profile?.streak_days || 0;
      
      // Generate mock streak history
      const history = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Current streak days are active, plus some random days before
        const isActive = i < current || (Math.random() > 0.3 && i > current + 2);
        
        history.push({
          date: dateStr,
          active: isActive
        });
      }
      
      return {
        current,
        best: Math.max(current, 10), // Mock best streak
        history
      };
    } catch (error) {
      console.error('Error fetching user streak:', error);
      throw error;
    }
  }
};

export default analyticsService;