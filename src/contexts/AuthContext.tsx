// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'student' | 'admin' | 'teacher';
  subscription?: string;
}

interface AuthContextProps {
  user: User | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch profile after login or signup
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) setUserProfile(data as UserProfile);
    else {
      console.error('Failed to fetch user profile:', error?.message);
      setUserProfile(null);
    }
  };

  // Initialize user on mount & listen to auth changes
  useEffect(() => {
    // Get current session user on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    // Listen to auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in user with email & password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login failed:', error.message);
      return false;
    }
    if (data.user) {
      setUser(data.user);
      await fetchUserProfile(data.user.id);
      return true;
    }
    return false;
  };

  // Sign up new user and create profile record
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        console.error('Signup failed:', error.message);
        return false;
      }

      // If email confirmation enabled, user may be null initially
      if (!data.user) {
        console.log('Check your email to confirm registration.');
        return true;
      }

      // Insert profile only if user exists immediately after signup
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        name,
        role: 'student',
      });

      if (insertError) {
        console.error('Profile insert failed:', insertError.message);
        return false;
      }

      setUser(data.user);
      await fetchUserProfile(data.user.id);

      return true;
    } catch (err: any) {
      console.error('Signup error:', err.message || err);
      return false;
    }
  };

  // Sign out current user
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
