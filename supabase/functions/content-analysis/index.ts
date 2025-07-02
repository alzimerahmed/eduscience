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
    const { content, language = "en" } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // TODO: In a production environment, this would call an AI service
    // For now, we'll use a simple content analysis function
    const analysis = analyzeContent(content, language);

    // Store analysis results for admin review
    const { error: logError } = await supabaseClient
      .from("content_analysis_logs")
      .insert({
        content_sample: content.substring(0, 1000),
        analysis_results: analysis,
        language: language,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error("Error logging analysis:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing content:", error);

    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Simple content analysis function
function analyzeContent(content: string, language: string): any {
  // Detect subject based on keywords
  const lowerContent = content.toLowerCase();
  
  let subject = "general";
  if (containsChemistryKeywords(lowerContent, language)) {
    subject = "chemistry";
  } else if (containsPhysicsKeywords(lowerContent, language)) {
    subject = "physics";
  } else if (containsBiologyKeywords(lowerContent, language)) {
    subject = "biology";
  }
  
  // Estimate difficulty based on content complexity
  const difficulty = estimateDifficulty(content);
  
  // Extract topics based on keyword frequency
  const topics = extractTopics(content, subject, language);
  
  // Count approximate number of questions
  const questionCount = countQuestions(content);
  
  // Generate a brief summary
  const summary = generateSummary(content, language);
  
  // Suggest tags based on content
  const suggestedTags = generateTags(content, subject, language);
  
  return {
    subject,
    difficulty,
    topics,
    questionCount,
    summary,
    suggestedTags,
    language,
    processingTime: new Date().toISOString()
  };
}

function containsChemistryKeywords(content: string, language: string): boolean {
  const keywords = {
    en: ["chemistry", "chemical", "reaction", "molecule", "atom", "element", "compound", "acid", "base", "bond"],
    ta: ["வேதியியல்", "அமிலம்", "காரம்", "அணு", "மூலக்கூறு", "தனிமம்", "சேர்மம்"],
    si: ["රසායන", "ඇසිඩ්", "බේස්", "අණු", "පරමාණු", "මූලද්රව්ය", "සංයෝග"]
  };
  
  const langs = language === "en" ? ["en"] : [language, "en"]; // Fallback to English keywords
  
  for (const lang of langs) {
    if (keywords[lang as keyof typeof keywords].some(keyword => content.includes(keyword))) {
      return true;
    }
  }
  return false;
}

function containsPhysicsKeywords(content: string, language: string): boolean {
  const keywords = {
    en: ["physics", "force", "motion", "energy", "velocity", "acceleration", "gravity", "quantum", "relativity"],
    ta: ["இயற்பியல்", "விசை", "இயக்கம்", "ஆற்றல்", "வேகம்", "முடுக்கம்", "ஈர்ப்பு"],
    si: ["භෞතික", "බලය", "චලනය", "ශක්තිය", "වේගය", "ත්වරණය", "ගුරුත්වාකර්ෂණය"]
  };
  
  const langs = language === "en" ? ["en"] : [language, "en"];
  
  for (const lang of langs) {
    if (keywords[lang as keyof typeof keywords].some(keyword => content.includes(keyword))) {
      return true;
    }
  }
  return false;
}

function containsBiologyKeywords(content: string, language: string): boolean {
  const keywords = {
    en: ["biology", "cell", "organism", "gene", "dna", "protein", "evolution", "ecosystem", "photosynthesis"],
    ta: ["உயிரியல்", "செல்", "உயிரினம்", "மரபணு", "டி.என்.ஏ", "புரதம்", "பரிணாமம்"],
    si: ["ජීව විද්‍යාව", "සෛලය", "ජීවියා", "ජාන", "ඩීඑන්ඒ", "ප්‍රෝටීන", "පරිණාමය"]
  };
  
  const langs = language === "en" ? ["en"] : [language, "en"];
  
  for (const lang of langs) {
    if (keywords[lang as keyof typeof keywords].some(keyword => content.includes(keyword))) {
      return true;
    }
  }
  return false;
}

function estimateDifficulty(content: string): "easy" | "medium" | "hard" {
  const contentLength = content.length;
  const sentenceCount = content.split(/[.!?]+/).length;
  const wordCount = content.split(/\s+/).length;
  const avgSentenceLength = wordCount / (sentenceCount || 1);
  
  // Complex sentences and terms indicate higher difficulty
  const complexTerms = [
    "quantum", "molecular", "algorithm", "derivative", "integral", 
    "enzyme", "spectroscopy", "equilibrium", "optimization"
  ];
  
  let complexTermCount = 0;
  for (const term of complexTerms) {
    const regex = new RegExp(term, "gi");
    const matches = content.match(regex);
    if (matches) complexTermCount += matches.length;
  }
  
  const complexityScore = (avgSentenceLength * 0.3) + (complexTermCount * 0.7);
  
  if (complexityScore > 15 || contentLength > 10000) return "hard";
  if (complexityScore > 10 || contentLength > 3000) return "medium";
  return "easy";
}

function extractTopics(content: string, subject: string, language: string): string[] {
  const topics: Set<string> = new Set();
  
  // Common topics by subject
  const subjectTopics: Record<string, string[]> = {
    chemistry: [
      "organic", "inorganic", "physical", "analytical", "biochemistry",
      "thermodynamics", "kinetics", "electrochemistry", "spectroscopy"
    ],
    physics: [
      "mechanics", "electricity", "magnetism", "optics", "thermodynamics",
      "quantum", "relativity", "nuclear", "waves", "acoustics"
    ],
    biology: [
      "cell", "genetics", "ecology", "evolution", "physiology",
      "anatomy", "botany", "zoology", "microbiology", "biochemistry"
    ],
    general: [
      "theory", "practice", "calculation", "experiment", "analysis"
    ]
  };
  
  // Add subject-specific topics
  const relevantTopics = subjectTopics[subject] || subjectTopics.general;
  for (const topic of relevantTopics) {
    if (content.toLowerCase().includes(topic)) {
      topics.add(topic);
    }
  }
  
  // Return at least some topics
  if (topics.size === 0) {
    return subject === "general" ? ["general concepts"] : [subject + " concepts"];
  }
  
  return Array.from(topics);
}

function countQuestions(content: string): number {
  // Count question marks
  const questionMarks = (content.match(/\?/g) || []).length;
  
  // Count numbered questions (e.g., "1.", "2.", etc.)
  const numberedQuestions = (content.match(/^\s*\d+\s*\./gm) || []).length;
  
  // Count "Question" keyword followed by number
  const questionKeyword = (content.match(/question\s+\d+/gi) || []).length;
  
  return Math.max(questionMarks, numberedQuestions, questionKeyword, 1);
}

function generateSummary(content: string, language: string): string {
  // Simple summary: first 150-200 characters
  let summary = content.trim().substring(0, 200);
  
  // Make sure we don't cut in the middle of a sentence
  const lastPeriod = summary.lastIndexOf(".");
  if (lastPeriod > summary.length * 0.7) {
    summary = summary.substring(0, lastPeriod + 1);
  }
  
  if (content.length > 200) {
    summary += "...";
  }
  
  return summary;
}

function generateTags(content: string, subject: string, language: string): string[] {
  const tags: Set<string> = new Set([subject]);
  
  // Add common educational tags
  const commonTags = ["education", "learning", "study", "exam", "science"];
  for (const tag of commonTags) {
    if (content.toLowerCase().includes(tag)) {
      tags.add(tag);
    }
  }
  
  // Add language-specific tag
  if (language === "ta") {
    tags.add("tamil");
  } else if (language === "si") {
    tags.add("sinhala");
  }
  
  // Add difficulty as a tag if we can determine it
  const difficulty = estimateDifficulty(content);
  tags.add(difficulty);
  
  // Add subject-specific tags from extracted topics
  const topics = extractTopics(content, subject, language);
  for (const topic of topics) {
    tags.add(topic);
  }
  
  return Array.from(tags);
}