// Follow deno lint rules
// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory store for active sessions
// In production, you would use a more persistent solution like Redis
const activeSessions: Map<string, Set<string>> = new Map();
const userSessions: Map<string, string> = new Map();
const cursorPositions: Map<string, { userId: string; x: number; y: number }[]> = new Map();

// Initialize Socket.IO server
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  const sessionId = socket.handshake.query.sessionId as string;
  
  if (!userId || !sessionId) {
    socket.disconnect();
    return;
  }

  console.log(`User ${userId} connected to session ${sessionId}`);
  
  // Add user to session
  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, new Set());
    cursorPositions.set(sessionId, []);
  }
  
  activeSessions.get(sessionId)?.add(userId);
  userSessions.set(socket.id, sessionId);
  
  // Join socket room
  socket.join(sessionId);
  
  // Emit current participants to the new joiner
  socket.emit("session_participants", {
    participants: Array.from(activeSessions.get(sessionId) || []),
    cursorPositions: cursorPositions.get(sessionId) || []
  });
  
  // Notify others that a new user joined
  socket.to(sessionId).emit("user_joined", { userId });
  
  // Handle cursor movement
  socket.on("cursor_move", (data: { x: number; y: number }) => {
    const positions = cursorPositions.get(sessionId) || [];
    const existingIndex = positions.findIndex(pos => pos.userId === userId);
    
    if (existingIndex >= 0) {
      positions[existingIndex] = { userId, ...data };
    } else {
      positions.push({ userId, ...data });
    }
    
    cursorPositions.set(sessionId, positions);
    socket.to(sessionId).emit("cursor_update", { userId, ...data });
  });
  
  // Handle text changes
  socket.on("text_change", (data: { content: string; selection?: any }) => {
    socket.to(sessionId).emit("text_update", { userId, ...data });
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    const session = userSessions.get(socket.id);
    if (session) {
      const sessionParticipants = activeSessions.get(session);
      if (sessionParticipants) {
        sessionParticipants.delete(userId);
        
        // Update cursor positions
        const positions = cursorPositions.get(session) || [];
        const updatedPositions = positions.filter(pos => pos.userId !== userId);
        cursorPositions.set(session, updatedPositions);
        
        // Notify others that the user left
        socket.to(session).emit("user_left", { userId });
        
        // Clean up empty sessions
        if (sessionParticipants.size === 0) {
          activeSessions.delete(session);
          cursorPositions.delete(session);
        }
      }
      
      userSessions.delete(socket.id);
    }
  });
});

// Start the Socket.IO server
io.listen(8080);

// HTTP handler for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, sessionId, userId, data } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    switch (action) {
      case "create_session":
        // Create a new collaboration session
        const { data: session, error: createError } = await supabaseClient.rpc(
          "create_collaboration_session",
          {
            host_id: userId,
            paper_id: data.paperId,
            title: data.title,
            description: data.description,
            max_participants: data.maxParticipants
          }
        );
        
        if (createError) throw createError;
        return new Response(
          JSON.stringify({ success: true, session }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      case "join_session":
        // Join an existing session
        const { data: joinResult, error: joinError } = await supabaseClient.rpc(
          "join_collaboration_session",
          { session_id: sessionId, user_id: userId }
        );
        
        if (joinError) throw joinError;
        return new Response(
          JSON.stringify({ success: true, result: joinResult }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      case "leave_session":
        // Leave a session
        const { data: leaveResult, error: leaveError } = await supabaseClient.rpc(
          "leave_collaboration_session",
          { session_id: sessionId, user_id: userId }
        );
        
        if (leaveError) throw leaveError;
        return new Response(
          JSON.stringify({ success: true, result: leaveResult }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      case "end_session":
        // End a session (host only)
        const { data: endResult, error: endError } = await supabaseClient.rpc(
          "end_collaboration_session",
          { session_id: sessionId, host_id: userId }
        );
        
        if (endError) throw endError;
        return new Response(
          JSON.stringify({ success: true, result: endResult }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      case "get_participants":
        // Get session participants
        const { data: participants, error: participantsError } = await supabaseClient.rpc(
          "get_session_participants",
          { session_id: sessionId }
        );
        
        if (participantsError) throw participantsError;
        return new Response(
          JSON.stringify({ success: true, participants }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      case "get_active_sessions":
        // Get all active sessions
        const { data: sessions, error: sessionsError } = await supabaseClient
          .from("collaboration_sessions")
          .select(`
            *,
            profiles!collaboration_sessions_host_id_fkey (name, avatar_url),
            papers (title),
            collaboration_participants (
              user_id,
              profiles (name, avatar_url)
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
          
        if (sessionsError) throw sessionsError;
        return new Response(
          JSON.stringify({ success: true, sessions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Unknown action" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          }
        );
    }
  } catch (error) {
    console.error("Error in real-time collaboration:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});