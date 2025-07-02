export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string | null
          xp_reward: number
          rarity: string
          criteria: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon?: string | null
          xp_reward?: number
          rarity?: string
          criteria: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string | null
          xp_reward?: number
          rarity?: string
          criteria?: Json
          created_at?: string
        }
      }
      ai_gradings: {
        Row: {
          id: string
          response_id: string
          total_marks: number
          max_marks: number
          percentage: number
          grade: string | null
          feedback: string | null
          strengths: string[] | null
          improvements: string[] | null
          detailed_breakdown: Json | null
          suggested_resources: string[] | null
          ai_model: string
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          response_id: string
          total_marks: number
          max_marks: number
          percentage: number
          grade?: string | null
          feedback?: string | null
          strengths?: string[] | null
          improvements?: string[] | null
          detailed_breakdown?: Json | null
          suggested_resources?: string[] | null
          ai_model?: string
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          response_id?: string
          total_marks?: number
          max_marks?: number
          percentage?: number
          grade?: string | null
          feedback?: string | null
          strengths?: string[] | null
          improvements?: string[] | null
          detailed_breakdown?: Json | null
          suggested_resources?: string[] | null
          ai_model?: string
          confidence_score?: number | null
          created_at?: string
        }
      }
      annotations: {
        Row: {
          id: string
          paper_id: string
          user_id: string
          content: string
          position: Json | null
          is_public: boolean
          votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          user_id: string
          content: string
          position?: Json | null
          is_public?: boolean
          votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          user_id?: string
          content?: string
          position?: Json | null
          is_public?: boolean
          votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      collaboration_participants: {
        Row: {
          id: string
          session_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
        }
      }
      collaboration_sessions: {
        Row: {
          id: string
          paper_id: string
          host_id: string
          title: string
          description: string | null
          max_participants: number
          is_active: boolean
          session_data: Json
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          paper_id: string
          host_id: string
          title: string
          description?: string | null
          max_participants?: number
          is_active?: boolean
          session_data?: Json
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          paper_id?: string
          host_id?: string
          title?: string
          description?: string | null
          max_participants?: number
          is_active?: boolean
          session_data?: Json
          created_at?: string
          ended_at?: string | null
        }
      }
      exam_settings: {
        Row: {
          id: string
          paper_id: string
          time_limit: number
          allow_pause: boolean
          show_timer: boolean
          auto_submit: boolean
          shuffle_questions: boolean
          show_results: boolean
          passing_score: number
          max_attempts: number
          available_from: string | null
          available_to: string | null
          instructions: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          time_limit: number
          allow_pause?: boolean
          show_timer?: boolean
          auto_submit?: boolean
          shuffle_questions?: boolean
          show_results?: boolean
          passing_score?: number
          max_attempts?: number
          available_from?: string | null
          available_to?: string | null
          instructions?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          time_limit?: number
          allow_pause?: boolean
          show_timer?: boolean
          auto_submit?: boolean
          shuffle_questions?: boolean
          show_results?: boolean
          passing_score?: number
          max_attempts?: number
          available_from?: string | null
          available_to?: string | null
          instructions?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      papers: {
        Row: {
          id: string
          title: string
          subject_id: string
          year: number
          paper_type: Database['public']['Enums']['paper_type']
          difficulty: Database['public']['Enums']['difficulty_level']
          language: Database['public']['Enums']['language_code']
          file_url: string | null
          file_size: string | null
          content_text: string | null
          tags: string[]
          has_answers: boolean
          has_answer_scheme: boolean
          has_ai_tutor: boolean
          download_count: number
          status: Database['public']['Enums']['content_status']
          uploaded_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subject_id: string
          year: number
          paper_type: Database['public']['Enums']['paper_type']
          difficulty: Database['public']['Enums']['difficulty_level']
          language?: Database['public']['Enums']['language_code']
          file_url?: string | null
          file_size?: string | null
          content_text?: string | null
          tags?: string[]
          has_answers?: boolean
          has_answer_scheme?: boolean
          has_ai_tutor?: boolean
          download_count?: number
          status?: Database['public']['Enums']['content_status']
          uploaded_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subject_id?: string
          year?: number
          paper_type?: Database['public']['Enums']['paper_type']
          difficulty?: Database['public']['Enums']['difficulty_level']
          language?: Database['public']['Enums']['language_code']
          file_url?: string | null
          file_size?: string | null
          content_text?: string | null
          tags?: string[]
          has_answers?: boolean
          has_answer_scheme?: boolean
          has_ai_tutor?: boolean
          download_count?: number
          status?: Database['public']['Enums']['content_status']
          uploaded_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: Database['public']['Enums']['user_role']
          subscription: Database['public']['Enums']['subscription_plan']
          avatar_url: string | null
          preferences: Json
          total_xp: number
          level: number
          streak_days: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: Database['public']['Enums']['user_role']
          subscription?: Database['public']['Enums']['subscription_plan']
          avatar_url?: string | null
          preferences?: Json
          total_xp?: number
          level?: number
          streak_days?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: Database['public']['Enums']['user_role']
          subscription?: Database['public']['Enums']['subscription_plan']
          avatar_url?: string | null
          preferences?: Json
          total_xp?: number
          level?: number
          streak_days?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          paper_id: string
          question_number: number
          question_text: string
          question_type: Database['public']['Enums']['question_type']
          marks: number
          topic: string | null
          difficulty: Database['public']['Enums']['difficulty_level']
          correct_answer: Json | null
          explanation: string | null
          common_mistakes: string[] | null
          hints: string[] | null
          related_concepts: string[] | null
          marking_scheme: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          question_number: number
          question_text: string
          question_type: Database['public']['Enums']['question_type']
          marks: number
          topic?: string | null
          difficulty: Database['public']['Enums']['difficulty_level']
          correct_answer?: Json | null
          explanation?: string | null
          common_mistakes?: string[] | null
          hints?: string[] | null
          related_concepts?: string[] | null
          marking_scheme?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          question_number?: number
          question_text?: string
          question_type?: Database['public']['Enums']['question_type']
          marks?: number
          topic?: string | null
          difficulty?: Database['public']['Enums']['difficulty_level']
          correct_answer?: Json | null
          explanation?: string | null
          common_mistakes?: string[] | null
          hints?: string[] | null
          related_concepts?: string[] | null
          marking_scheme?: Json | null
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          display_name: Json
          color: string
          icon: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: Json
          color: string
          icon: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: Json
          color?: string
          icon?: string
          description?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: Database['public']['Enums']['subscription_plan']
          status: string
          current_period_start: string
          current_period_end: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: Database['public']['Enums']['subscription_plan']
          status?: string
          current_period_start: string
          current_period_end: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: Database['public']['Enums']['subscription_plan']
          status?: string
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          questions_attempted: number
          questions_correct: number
          total_time_spent: number
          best_score: number | null
          attempts: number
          completed: boolean
          xp_earned: number
          last_attempt: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          questions_attempted?: number
          questions_correct?: number
          total_time_spent?: number
          best_score?: number | null
          attempts?: number
          completed?: boolean
          xp_earned?: number
          last_attempt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          questions_attempted?: number
          questions_correct?: number
          total_time_spent?: number
          best_score?: number | null
          attempts?: number
          completed?: boolean
          xp_earned?: number
          last_attempt?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_responses: {
        Row: {
          id: string
          question_id: string
          user_id: string
          response_text: string
          time_spent: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          response_text: string
          time_spent?: number | null
          submitted_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          response_text?: string
          time_spent?: number | null
          submitted_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_status: 'pending' | 'approved' | 'rejected'
      difficulty_level: 'easy' | 'medium' | 'hard'
      language_code: 'en' | 'ta' | 'si'
      paper_type: '1st-year-1st-term' | '1st-year-2nd-term' | '1st-year-3rd-term' | '2nd-year-1st-term' | '2nd-year-2nd-term' | '2nd-year-3rd-term' | 'practical' | 'past-paper' | 'model-paper'
      question_type: 'multiple-choice' | 'short-answer' | 'essay' | 'calculation' | 'diagram' | 'practical'
      subscription_plan: 'free' | 'premium' | 'pro'
      user_role: 'student' | 'teacher' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}