import { supabase } from '../lib/supabaseClient';
import type { PastPaper, Question } from '../types';

export const databaseService = {
  /**
   * Subject-related functions
   */
  subjects: {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
      }
    }
  },

  /**
   * Papers-related functions
   */
  papers: {
    getAll: async (filters?: {
      subject?: string;
      difficulty?: string;
      paperType?: string;
      year?: number;
      search?: string;
    }) => {
      try {
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

        const { data, error } = await query;
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching papers:', error);
        throw error;
      }
    },

    getOne: async (paperId: string) => {
      try {
        const { data, error } = await supabase
          .from('papers')
          .select(`
            *,
            subjects (name, display_name, color, icon),
            questions (*),
            exam_settings (*)
          `)
          .eq('id', paperId)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error fetching paper ${paperId}:`, error);
        throw error;
      }
    },

    upload: async (paperData: Partial<PastPaper>, file?: File) => {
      try {
        // First upload the file if provided
        let fileUrl = null;
        if (file) {
          const fileName = `papers/${Date.now()}-${file.name}`;
          const { error: uploadError, data: fileData } = await supabase.storage
            .from('paper-files')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('paper-files')
            .getPublicUrl(fileName);
          
          fileUrl = publicUrl;
        }
        
        // Then create the paper record
        const { data, error } = await supabase
          .from('papers')
          .insert({
            ...paperData,
            file_url: fileUrl,
            file_size: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : undefined,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error uploading paper:', error);
        throw error;
      }
    },

    incrementDownloads: async (paperId: string) => {
      try {
        const { error } = await supabase.rpc('increment_download_count', {
          paper_id: paperId
        });
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error(`Error incrementing download count for paper ${paperId}:`, error);
        return false;
      }
    },
  },

  /**
   * Questions-related functions
   */
  questions: {
    getAll: async (paperId: string) => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('paper_id', paperId)
          .order('question_number');
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error fetching questions for paper ${paperId}:`, error);
        throw error;
      }
    },

    createQuestion: async (question: Partial<Question>) => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .insert(question)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating question:', error);
        throw error;
      }
    },

    submitResponse: async (questionId: string, userId: string, responseText: string, timeSpent?: number) => {
      try {
        const { data, error } = await supabase
          .from('user_responses')
          .insert({
            question_id: questionId,
            user_id: userId,
            response_text: responseText,
            time_spent: timeSpent || null,
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error submitting response:', error);
        throw error;
      }
    }
  },

  /**
   * AI Grading related functions
   */
  aiGrading: {
    getGradingForResponse: async (responseId: string) => {
      try {
        const { data, error } = await supabase
          .from('ai_gradings')
          .select('*')
          .eq('response_id', responseId)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error fetching grading for response ${responseId}:`, error);
        throw error;
      }
    },

    requestGrading: async (responseId: string, questionId: string, userId: string, responseText: string) => {
      try {
        // Call the Supabase Edge Function for grading
        const { data, error } = await supabase.functions.invoke('ai-grading', {
          body: JSON.stringify({
            responseId,
            questionId,
            userId,
            studentResponse: responseText
          })
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error requesting AI grading:', error);
        throw error;
      }
    }
  },

  /**
   * User progress related functions
   */
  userProgress: {
    get: async (userId: string, paperId?: string) => {
      try {
        let query = supabase
          .from('user_progress')
          .select(`
            *,
            papers (title, subject_id, subjects (name, display_name))
          `)
          .eq('user_id', userId);

        if (paperId) {
          query = query.eq('paper_id', paperId);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching user progress:', error);
        throw error;
      }
    },

    update: async (userId: string, paperId: string, progressData: any) => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            paper_id: paperId,
            ...progressData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating user progress:', error);
        throw error;
      }
    }
  },

  /**
   * Achievements related functions
   */
  achievements: {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('xp_reward');
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching achievements:', error);
        throw error;
      }
    },

    getUserAchievements: async (userId: string) => {
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
        return data;
      } catch (error) {
        console.error(`Error fetching achievements for user ${userId}:`, error);
        throw error;
      }
    },

    unlockAchievement: async (userId: string, achievementId: string) => {
      try {
        // Check if already unlocked
        const { data: existing } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
        
        if (existing) return { alreadyUnlocked: true };
        
        // Unlock the achievement
        const { data, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievementId,
            unlocked_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Get achievement details to award XP
        const { data: achievement, error: achievementError } = await supabase
          .from('achievements')
          .select('xp_reward')
          .eq('id', achievementId)
          .single();
        
        if (achievementError) throw achievementError;
        
        if (achievement && achievement.xp_reward > 0) {
          // Add XP to user profile
          const { error: xpError } = await supabase.rpc('add_user_xp', {
            user_id: userId,
            xp_amount: achievement.xp_reward
          });
          
          if (xpError) throw xpError;
        }
        
        return { success: true, data };
      } catch (error) {
        console.error('Error unlocking achievement:', error);
        throw error;
      }
    },

    checkEligibility: async (userId: string) => {
      try {
        // Call RPC function to check achievement eligibility
        const { data, error } = await supabase.rpc('check_achievements_eligibility', {
          user_id: userId
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error checking achievement eligibility:', error);
        throw error;
      }
    }
  },

  /**
   * Collaboration related functions
   */
  collaboration: {
    getSessions: async () => {
      try {
        const { data, error } = await supabase
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
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching collaboration sessions:', error);
        throw error;
      }
    },

    createSession: async (hostId: string, paperId: string, title: string, description?: string) => {
      try {
        const { data, error } = await supabase
          .from('collaboration_sessions')
          .insert({
            host_id: hostId,
            paper_id: paperId,
            title,
            description,
            is_active: true,
            session_data: {},
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating collaboration session:', error);
        throw error;
      }
    },

    joinSession: async (sessionId: string, userId: string) => {
      try {
        const { data, error } = await supabase
          .from('collaboration_participants')
          .insert({
            session_id: sessionId,
            user_id: userId,
            joined_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error joining collaboration session:', error);
        throw error;
      }
    },

    leaveSession: async (sessionId: string, userId: string) => {
      try {
        const { error } = await supabase
          .from('collaboration_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('session_id', sessionId)
          .eq('user_id', userId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error leaving collaboration session:', error);
        return false;
      }
    },

    endSession: async (sessionId: string, hostId: string) => {
      try {
        const { error } = await supabase
          .from('collaboration_sessions')
          .update({ 
            is_active: false,
            ended_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .eq('host_id', hostId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error ending collaboration session:', error);
        return false;
      }
    }
  },

  /**
   * Annotations related functions
   */
  annotations: {
    getForPaper: async (paperId: string, userId?: string) => {
      try {
        let query = supabase
          .from('annotations')
          .select(`
            *,
            profiles (name, avatar_url)
          `)
          .eq('paper_id', paperId);

        if (userId) {
          // Get public annotations and user's own annotations
          query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
        } else {
          // Just get public annotations
          query = query.eq('is_public', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching annotations:', error);
        throw error;
      }
    },

    create: async (userId: string, paperId: string, content: string, position?: any, isPublic: boolean = false) => {
      try {
        const { data, error } = await supabase
          .from('annotations')
          .insert({
            user_id: userId,
            paper_id: paperId,
            content,
            position,
            is_public: isPublic,
            votes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating annotation:', error);
        throw error;
      }
    },

    update: async (annotationId: string, userId: string, updates: any) => {
      try {
        const { data, error } = await supabase
          .from('annotations')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', annotationId)
          .eq('user_id', userId) // Ensure the user owns this annotation
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating annotation:', error);
        throw error;
      }
    },

    vote: async (annotationId: string, increment: boolean = true) => {
      try {
        const { error } = await supabase.rpc(
          increment ? 'increment_annotation_vote' : 'decrement_annotation_vote',
          { annotation_id: annotationId }
        );
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error voting on annotation:', error);
        return false;
      }
    }
  },

  /**
   * Exam settings related functions
   */
  examSettings: {
    get: async (paperId: string) => {
      try {
        const { data, error } = await supabase
          .from('exam_settings')
          .select('*')
          .eq('paper_id', paperId)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (error) {
        console.error(`Error fetching exam settings for paper ${paperId}:`, error);
        return null;
      }
    },

    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('exam_settings')
          .select(`
            *,
            papers (title),
            profiles!exam_settings_created_by_fkey (name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching all exam settings:', error);
        throw error;
      }
    },

    create: async (settingsData: any) => {
      try {
        const { data, error } = await supabase
          .from('exam_settings')
          .insert(settingsData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating exam settings:', error);
        throw error;
      }
    },

    update: async (settingsId: string, updates: any) => {
      try {
        const { data, error } = await supabase
          .from('exam_settings')
          .update(updates)
          .eq('id', settingsId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error updating exam settings ${settingsId}:`, error);
        throw error;
      }
    },

    delete: async (settingsId: string) => {
      try {
        const { error } = await supabase
          .from('exam_settings')
          .delete()
          .eq('id', settingsId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error(`Error deleting exam settings ${settingsId}:`, error);
        return false;
      }
    }
  },

  /**
   * Payment related functions
   */
  payments: {
    getSubscriptionPlans: async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_lkr', { ascending: true });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
      }
    },

    getPaymentMethods: async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
      }
    },

    getUserTransactions: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching user transactions:', error);
        throw error;
      }
    },

    createTransaction: async (transactionData: any) => {
      try {
        const { data, error } = await supabase
          .from('payment_transactions')
          .insert(transactionData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating payment transaction:', error);
        throw error;
      }
    },

    uploadPaymentProof: async (transactionId: string, file: File) => {
      try {
        // 1. Upload file
        const fileExt = file.name.split('.').pop();
        const fileName = `payment-proofs/${transactionId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        // 2. Get file URL
        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
        
        // 3. Update transaction with file URL
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({ 
            payment_proof_url: publicUrl,
            status: 'paid'
          })
          .eq('id', transactionId);
        
        if (updateError) throw updateError;
        
        return { success: true, url: publicUrl };
      } catch (error) {
        console.error('Error uploading payment proof:', error);
        throw error;
      }
    },

    submitAccessRequest: async (requestData: any) => {
      try {
        const { data, error } = await supabase
          .from('access_requests')
          .insert(requestData)
          .select()
          .single();
        
        if (error) throw error;
        
        // Trigger notification via edge function
        await supabase.functions.invoke('payment-notification', {
          body: { 
            transactionId: requestData.payment_transaction_id,
            notificationType: 'payment_received'
          }
        });
        
        return data;
      } catch (error) {
        console.error('Error submitting access request:', error);
        throw error;
      }
    },

    getUserAccessRequests: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('access_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching user access requests:', error);
        throw error;
      }
    }
  },

  /**
   * Two-factor authentication related functions
   */
  twoFactorAuth: {
    getStatus: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('two_factor_auth')
          .select('is_enabled')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) throw error;
        return data?.is_enabled || false;
      } catch (error) {
        console.error('Error checking 2FA status:', error);
        return false;
      }
    },

    setup: async (userId: string, secretKey: string, backupCodes: string[]) => {
      try {
        // Check if entry already exists
        const { data: existingData } = await supabase
          .from('two_factor_auth')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (existingData) {
          // Update existing record
          const { error } = await supabase
            .from('two_factor_auth')
            .update({
              secret_key: secretKey,
              backup_codes: backupCodes,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (error) throw error;
        } else {
          // Create new record
          const { error } = await supabase
            .from('two_factor_auth')
            .insert({
              user_id: userId,
              secret_key: secretKey,
              backup_codes: backupCodes,
              is_enabled: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) throw error;
        }
        
        return true;
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        throw error;
      }
    },

    enable: async (userId: string) => {
      try {
        const { error } = await supabase
          .from('two_factor_auth')
          .update({
            is_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        throw error;
      }
    },

    disable: async (userId: string) => {
      try {
        const { error } = await supabase
          .from('two_factor_auth')
          .update({
            is_enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        throw error;
      }
    }
  }
};

export default databaseService;