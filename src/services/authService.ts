import { supabase } from '../lib/supabaseClient';
import type { UserProfile } from '../contexts/AuthContext';

export const authService = {
  /**
   * Sign up a new user
   */
  signUp: async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            role: 'student',
            subscription: 'free',
            preferences: {
              language: 'en',
              theme: 'light',
              notifications: true
            },
            total_xp: 0,
            level: 1,
            streak_days: 0,
            last_activity: new Date().toISOString()
          });
        
        if (profileError) throw profileError;
      }
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  },

  /**
   * Sign in a user with email and password
   */
  signIn: async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return !!data.user;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  /**
   * Get the current user session
   */
  getCurrentSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  /**
   * Get the current user
   */
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  /**
   * Get a user's profile
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },

  /**
   * Update a user's profile
   */
  updateProfile: async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  }
};

export default authService;