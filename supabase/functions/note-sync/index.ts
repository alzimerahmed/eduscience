// Follow deno lint rules
// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, userId, noteId, data } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user exists
    const { data: userProfile, error: userError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new Error(`Invalid user: ${userError.message}`);
    }

    switch (action) {
      case "get_notes": {
        // Get all notes for a user, with optional filtering
        const { folder, searchTerm, tagId, favoritesOnly } = data || {};

        const { data: notes, error } = await supabaseClient.rpc(
          "search_notes",
          { 
            user_id: userId,
            search_term: searchTerm,
            folder: folder,
            tag_id: tagId,
            favorites_only: favoritesOnly || false
          }
        );
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, notes }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "create_note": {
        // Create a new note
        const { title, content, folder, tags } = data || {};
        
        if (!title) {
          throw new Error("Note title is required");
        }
        
        const { data: note, error } = await supabaseClient.rpc(
          "create_note",
          { 
            user_id: userId,
            title,
            content: content || "",
            folder: folder || null,
            tags: tags || null
          }
        );
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, note }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "update_note": {
        // Update an existing note
        if (!noteId) {
          throw new Error("Note ID is required");
        }
        
        const { title, content, folder, is_favorite } = data || {};
        
        const { data: note, error } = await supabaseClient.rpc(
          "update_note",
          {
            note_id: noteId,
            user_id: userId,
            title: title,
            content: content,
            folder: folder,
            is_favorite: is_favorite
          }
        );
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, note }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "delete_note": {
        // Delete a note
        if (!noteId) {
          throw new Error("Note ID is required");
        }
        
        const { data: result, error } = await supabaseClient.rpc(
          "delete_note",
          {
            note_id: noteId,
            user_id: userId
          }
        );
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, deleted: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "add_tag": {
        // Add a tag to a note
        if (!noteId) {
          throw new Error("Note ID is required");
        }
        
        const { tag_name } = data || {};
        if (!tag_name) {
          throw new Error("Tag name is required");
        }
        
        const { data: result, error } = await supabaseClient.rpc(
          "add_note_tag",
          {
            note_id: noteId,
            user_id: userId,
            tag_name: tag_name
          }
        );
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, tag: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "remove_tag": {
        // Remove a tag from a note
        if (!noteId) {
          throw new Error("Note ID is required");
        }
        
        const { tag_id } = data || {};
        if (!tag_id) {
          throw new Error("Tag ID is required");
        }
        
        const { data: result, error } = await supabaseClient.rpc(
          "remove_note_tag",
          {
            note_id: noteId,
            user_id: userId,
            tag_id: tag_id
          }
        );
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case "get_all_tags": {
        // Get all tags for a user
        const { data: tags, error } = await supabaseClient
          .from("tags")
          .select("id, name, color")
          .or(`created_by.eq.${userId},created_by.is.null`)
          .order("name");
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, tags }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Error processing note sync:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});