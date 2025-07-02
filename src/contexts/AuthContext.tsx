import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  subscription: 'free' | 'premium' | 'pro';
  avatar_url?: string;
  preferences: {
    language: 'en' | 'ta' | 'si';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  total_xp: number;
  level: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(!isSupabaseConfigured);

  // Demo user profile when Supabase is not configured
  const demoProfile: UserProfile = {
    id: 'demo-user',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'student',
    subscription: 'premium',
    avatar_url: null,
    preferences: {
      language: 'en',
      theme: 'light',
      notifications: true
    },
    total_xp: 2847,
    level: 12,
    streak_days: 7,
    last_activity: new Date().toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  useEffect(() => {
    // If Supabase is not configured, load demo profile
    if (!isSupabaseConfigured) {
      console.log('Loading demo profile since Supabase is not configured');
      setUser({
        id: demoProfile.id,
        email: demoProfile.email,
      } as User);
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      if (!isSupabaseConfigured) {
        // Use demo profile if Supabase is not configured
        setProfile(demoProfile);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to demo profile on error
        setProfile(demoProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to demo profile on error
      setProfile(demoProfile);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        // Demo sign up when Supabase is not configured
        setUser({
          id: demoProfile.id,
          email: email,
        } as User);
        setProfile({ ...demoProfile, email, name });
        return true;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
          id: data.user.id,
          email,
          name,
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
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        // Demo sign in for when Supabase is not configured
        setUser({
          id: demoProfile.id,
          email: demoProfile.email,
        } as User);
        setProfile(demoProfile);
        return true;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      if (!isSupabaseConfigured) {
        // Demo update for when Supabase is not configured
        setProfile(prev => {
          if (!prev) return null;
          return { ...prev, ...updates };
        });
        return true;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};