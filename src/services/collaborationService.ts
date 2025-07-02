import { supabase } from '../lib/supabaseClient';

export interface CollaborationSession {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  paper_id: string;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  ended_at?: string;
  host?: {
    name: string;
    avatar_url?: string;
  };
  paper?: {
    title: string;
  };
  participants?: {
    user_id: string;
    name: string;
    avatar_url?: string;
  }[];
}

export interface Participant {
  user_id: string;
  name: string;
  avatar_url?: string;
  joined_at: string;
  is_active: boolean;
  is_host: boolean;
}

export const collaborationService = {
  /**
   * Get all active collaboration sessions
   */
  getActiveSessions: async (): Promise<CollaborationSession[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-collaboration', {
        body: JSON.stringify({
          action: 'get_active_sessions'
        })
      });

      if (error) throw error;
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching collaboration sessions:', error);
      throw error;
    }
  },

  /**
   * Create a new collaboration session
   */
  createSession: async (userId: string, paperId: string, title: string, description?: string, maxParticipants?: number): Promise<CollaborationSession> => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-collaboration', {
        body: JSON.stringify({
          action: 'create_session',
          userId,
          data: {
            paperId,
            title,
            description,
            maxParticipants: maxParticipants || 10
          }
        })
      });

      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      throw error;
    }
  },

  /**
   * Join an existing collaboration session
   */
  joinSession: async (sessionId: string, userId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-collaboration', {
        body: JSON.stringify({
          action: 'join_session',
          sessionId,
          userId
        })
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error('Error joining collaboration session:', error);
      throw error;
    }
  },

  /**
   * Leave a collaboration session
   */
  leaveSession: async (sessionId: string, userId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-collaboration', {
        body: JSON.stringify({
          action: 'leave_session',
          sessionId,
          userId
        })
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error('Error leaving collaboration session:', error);
      throw error;
    }
  },

  /**
   * End a collaboration session (host only)
   */
  endSession: async (sessionId: string, hostId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-collaboration', {
        body: JSON.stringify({
          action: 'end_session',
          sessionId,
          userId: hostId
        })
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error('Error ending collaboration session:', error);
      throw error;
    }
  },

  /**
   * Get participants of a session
   */
  getParticipants: async (sessionId: string): Promise<Participant[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-collaboration', {
        body: JSON.stringify({
          action: 'get_participants',
          sessionId
        })
      });

      if (error) throw error;
      return data.participants || [];
    } catch (error) {
      console.error('Error fetching session participants:', error);
      throw error;
    }
  },

  /**
   * Initialize Socket.IO connection for real-time collaboration
   * Note: In a real implementation, this would connect to the Socket.IO server
   */
  initializeConnection: (sessionId: string, userId: string): any => {
    // In a real implementation, this would initialize a Socket.IO connection
    // For now, we'll return a mock object
    console.log(`Initializing real-time connection for session ${sessionId} and user ${userId}`);
    
    return {
      subscribeToChanges: (callback: (data: any) => void) => {
        console.log('Subscribed to changes');
        // Mock subscription
      },
      sendCursorPosition: (x: number, y: number) => {
        console.log(`Sending cursor position: ${x}, ${y}`);
        // Mock sending cursor position
      },
      sendTextChanges: (content: string, selection: any) => {
        console.log('Sending text changes');
        // Mock sending text changes
      },
      disconnect: () => {
        console.log('Disconnecting from real-time collaboration');
        // Mock disconnection
      }
    };
  }
};

export default collaborationService;