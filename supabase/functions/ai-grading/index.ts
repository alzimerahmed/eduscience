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
    const { questionId, studentResponse, userId, responseId } = await req.json();

    if (!questionId || !studentResponse || !userId) {
      throw new Error("Missing required parameters");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get question details
    const { data: question, error: questionError } = await supabaseClient
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (questionError) {
      throw new Error(`Error fetching question: ${questionError.message}`);
    }

    // Create a response entry if not provided
    let gradeResponseId = responseId;
    
    if (!gradeResponseId) {
      const { data: response, error: responseError } = await supabaseClient
        .from("user_responses")
        .insert({
          question_id: questionId,
          user_id: userId,
          response_text: studentResponse,
          time_spent: null, // This could be provided by the client
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (responseError) {
        throw new Error(`Error creating response: ${responseError.message}`);
      }
      
      gradeResponseId = response.id;
    }

    // Generate AI grading
    // In production, this would use a proper AI model like OpenAI or a custom model
    const grading = generateGrading(question, studentResponse);

    // Store the grading result
    const { error: gradingError } = await supabaseClient
      .from("ai_gradings")
      .insert({
        response_id: gradeResponseId,
        total_marks: grading.totalMarks,
        max_marks: grading.maxMarks,
        percentage: grading.percentage,
        grade: grading.grade,
        feedback: grading.feedback,
        strengths: grading.strengths,
        improvements: grading.improvements,
        detailed_breakdown: grading.detailedBreakdown,
        suggested_resources: grading.suggestedResources,
        ai_model: "gemini-pro-simulation",
        confidence_score: 0.85,
        created_at: new Date().toISOString()
      });

    if (gradingError) {
      throw new Error(`Error storing grading: ${gradingError.message}`);
    }

    // Update user progress (add XP)
    await supabaseClient.rpc("add_user_xp", {
      user_id: userId,
      xp_amount: Math.ceil(grading.percentage / 10) // 1 XP for every 10% score
    });

    // Update user progress for this paper
    const { data: paperData } = await supabaseClient
      .from("questions")
      .select("paper_id")
      .eq("id", questionId)
      .single();

    if (paperData?.paper_id) {
      const { error: progressError } = await supabaseClient.rpc("update_user_paper_progress", {
        user_id: userId,
        paper_id: paperData.paper_id,
        questions_attempted: 1,
        questions_correct: grading.percentage >= 60 ? 1 : 0,
        xp_earned: Math.ceil(grading.percentage / 10)
      });

      if (progressError) {
        console.error("Error updating progress:", progressError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        grading,
        responseId: gradeResponseId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in AI grading:", error);
    
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

// Simplified AI grading function for demonstration
function generateGrading(question: any, studentResponse: string): any {
  const maxMarks = question.marks || 10;
  
  // Simple algorithm to assess response quality
  const responseLength = studentResponse.length;
  const keywordMatch = countKeywordMatches(studentResponse, question);
  
  // Calculate marks based on response length and keyword matches
  const lengthScore = Math.min(1, responseLength / 500); // Up to 1 point for length
  const keywordScore = keywordMatch.score;
  
  // Calculate total marks, ensuring we don't exceed max marks
  let totalMarks = Math.min(
    maxMarks, 
    Math.round((lengthScore * 0.3 + keywordScore * 0.7) * maxMarks)
  );
  
  // Ensure minimum score of 1 if there's any response
  if (responseLength > 10 && totalMarks < 1) {
    totalMarks = 1;
  }
  
  const percentage = Math.round((totalMarks / maxMarks) * 100);
  
  // Determine grade based on percentage
  let grade = '';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 75) grade = 'B+';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 65) grade = 'C+';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else grade = 'F';
  
  // Generate feedback
  const feedback = generateFeedback(percentage, keywordMatch.matchedKeywords);
  
  // Generate strengths and improvements
  const strengths = generateStrengths(studentResponse, percentage, keywordMatch);
  const improvements = generateImprovements(studentResponse, percentage, keywordMatch);
  
  // Generate detailed breakdown
  const detailedBreakdown = generateDetailedBreakdown(question, studentResponse, totalMarks, maxMarks);
  
  // Generate suggested resources
  const suggestedResources = generateSuggestedResources(question, keywordMatch.missingKeywords);
  
  return {
    totalMarks,
    maxMarks,
    percentage,
    grade,
    feedback,
    strengths,
    improvements,
    detailedBreakdown,
    suggestedResources
  };
}

function countKeywordMatches(response: string, question: any): any {
  // If we have correct answers or marking scheme, use those
  let allKeywords: string[] = [];
  let expectedKeywords: string[] = [];
  
  // First source: correct answer
  if (question.correct_answer) {
    if (typeof question.correct_answer === 'string') {
      const keywords = extractKeywords(question.correct_answer);
      allKeywords = [...allKeywords, ...keywords];
      expectedKeywords = [...expectedKeywords, ...keywords.slice(0, 5)];
    } else if (typeof question.correct_answer === 'object') {
      // Handle JSON correct answers
      const answerText = JSON.stringify(question.correct_answer);
      const keywords = extractKeywords(answerText);
      allKeywords = [...allKeywords, ...keywords];
      expectedKeywords = [...expectedKeywords, ...keywords.slice(0, 5)];
    }
  }
  
  // Second source: marking scheme
  if (question.marking_scheme) {
    try {
      const scheme = typeof question.marking_scheme === 'string' 
        ? JSON.parse(question.marking_scheme) 
        : question.marking_scheme;
      
      // Extract keywords from criteria descriptions
      if (Array.isArray(scheme)) {
        for (const criterion of scheme) {
          if (criterion.description) {
            const keywords = extractKeywords(criterion.description);
            allKeywords = [...allKeywords, ...keywords];
            expectedKeywords = [...expectedKeywords, ...keywords.slice(0, 3)];
          }
        }
      }
    } catch (e) {
      console.error("Error parsing marking scheme:", e);
    }
  }
  
  // Third source: question text itself
  const questionKeywords = extractKeywords(question.question_text);
  allKeywords = [...allKeywords, ...questionKeywords];
  
  // If we still don't have expected keywords, use some from question text
  if (expectedKeywords.length === 0) {
    expectedKeywords = questionKeywords.slice(0, 5);
  }
  
  // Remove duplicates
  expectedKeywords = [...new Set(expectedKeywords)];
  
  // Count matches
  const responseKeywords = extractKeywords(response);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  for (const keyword of expectedKeywords) {
    if (responseKeywords.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }
  
  // Calculate score (0-1)
  const score = expectedKeywords.length > 0 
    ? matchedKeywords.length / expectedKeywords.length
    : 0;
  
  return {
    score,
    matchedKeywords,
    missingKeywords,
    expectedKeywords
  };
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words
  const words = cleanText.split(/\s+/);
  
  // Filter out common words and short words
  const stopWords = ["the", "and", "a", "an", "in", "to", "for", "of", "is", "are", "that", "this"];
  const keywords = words.filter(word => 
    word.length > 3 && !stopWords.includes(word)
  );
  
  // Return unique keywords
  return [...new Set(keywords)];
}

function generateFeedback(percentage: number, matchedKeywords: string[]): string {
  let feedback = '';
  
  if (percentage >= 90) {
    feedback = "Excellent work! Your answer demonstrates comprehensive understanding of the concept. ";
  } else if (percentage >= 80) {
    feedback = "Great job! Your answer covers most key points and shows strong understanding. ";
  } else if (percentage >= 70) {
    feedback = "Good effort! Your answer includes many important concepts but has some room for improvement. ";
  } else if (percentage >= 60) {
    feedback = "Satisfactory response. You've covered several important points, but more depth would improve your answer. ";
  } else if (percentage >= 50) {
    feedback = "Your answer addresses some key aspects, but lacks completeness and deeper understanding. ";
  } else {
    feedback = "This response needs significant improvement. It's missing many key concepts and details. ";
  }
  
  if (matchedKeywords.length > 0) {
    feedback += `You've correctly addressed concepts related to ${matchedKeywords.slice(0, 3).join(", ")}.`;
  }
  
  return feedback;
}

function generateStrengths(response: string, percentage: number, keywordMatch: any): string[] {
  const strengths: string[] = [];
  
  // Based on keywords matched
  if (keywordMatch.matchedKeywords.length > 0) {
    strengths.push(`Correctly addressed key concepts: ${keywordMatch.matchedKeywords.slice(0, 3).join(", ")}`);
  }
  
  // Based on response length
  if (response.length > 300) {
    strengths.push("Provided a detailed and comprehensive response");
  }
  
  // Based on structure
  if (response.includes("\n\n")) {
    strengths.push("Good use of paragraph structure for clarity");
  }
  
  // Based on examples
  if (response.toLowerCase().includes("example") || response.toLowerCase().includes("instance") || response.toLowerCase().includes("such as")) {
    strengths.push("Effective use of examples to illustrate concepts");
  }
  
  // Based on score
  if (percentage >= 80) {
    strengths.push("Demonstrates strong understanding of the subject matter");
  } else if (percentage >= 60) {
    strengths.push("Shows basic understanding of core concepts");
  }
  
  // If no strengths identified yet
  if (strengths.length === 0) {
    strengths.push("Attempted to address the question");
  }
  
  return strengths;
}

function generateImprovements(response: string, percentage: number, keywordMatch: any): string[] {
  const improvements: string[] = [];
  
  // Based on missing keywords
  if (keywordMatch.missingKeywords.length > 0) {
    improvements.push(`Include these important concepts: ${keywordMatch.missingKeywords.slice(0, 3).join(", ")}`);
  }
  
  // Based on response length
  if (response.length < 200) {
    improvements.push("Provide more detailed explanations and examples");
  }
  
  // Based on score
  if (percentage < 60) {
    improvements.push("Review the core concepts of this topic in your study materials");
  }
  
  // Based on structure
  if (!response.includes("\n")) {
    improvements.push("Improve readability by using paragraphs to organize your answer");
  }
  
  // If perfect score, still provide some feedback
  if (percentage >= 90 && improvements.length === 0) {
    improvements.push("Continue practicing with more complex scenarios to further deepen your understanding");
  }
  
  // If no improvements identified yet
  if (improvements.length === 0) {
    improvements.push("Be more specific when explaining key concepts");
  }
  
  return improvements;
}

function generateDetailedBreakdown(question: any, response: string, totalMarks: number, maxMarks: number): any[] {
  const breakdown: any[] = [];
  
  // If we have a marking scheme, use it
  if (question.marking_scheme) {
    try {
      const scheme = typeof question.marking_scheme === 'string'
        ? JSON.parse(question.marking_scheme)
        : question.marking_scheme;
      
      if (Array.isArray(scheme)) {
        // Distribute the total marks across criteria roughly proportionally
        let remainingMarks = totalMarks;
        const lastIndex = scheme.length - 1;
        
        for (let i = 0; i < scheme.length; i++) {
          const criterion = scheme[i];
          const criterionMax = criterion.maxMarks || Math.round(maxMarks / scheme.length);
          
          // For the last item, assign all remaining marks to avoid rounding errors
          const criterionMarks = i === lastIndex 
            ? remainingMarks 
            : Math.min(
                Math.round((criterionMax / maxMarks) * totalMarks),
                remainingMarks
              );
          
          remainingMarks -= criterionMarks;
          
          breakdown.push({
            criterion: criterion.criterion,
            marksAwarded: criterionMarks,
            maxMarks: criterionMax,
            feedback: generateCriterionFeedback(criterion, criterionMarks, criterionMax)
          });
        }
        
        return breakdown;
      }
    } catch (e) {
      console.error("Error parsing marking scheme:", e);
    }
  }
  
  // Default breakdown if no marking scheme or error occurs
  breakdown.push({
    criterion: "Content Understanding",
    marksAwarded: Math.ceil(totalMarks * 0.6),
    maxMarks: Math.ceil(maxMarks * 0.6),
    feedback: "Shows understanding of the key concepts"
  });
  
  breakdown.push({
    criterion: "Application & Examples",
    marksAwarded: Math.floor(totalMarks * 0.4),
    maxMarks: Math.floor(maxMarks * 0.4),
    feedback: "Application of concepts could be improved with more specific examples"
  });
  
  return breakdown;
}

function generateCriterionFeedback(criterion: any, marksAwarded: number, maxMarks: number): string {
  const percentage = (marksAwarded / maxMarks) * 100;
  
  if (percentage >= 90) {
    return `Excellent. ${criterion.description || 'Met all expectations for this criterion.'}`;
  } else if (percentage >= 75) {
    return `Good. ${criterion.description || 'Met most expectations for this criterion.'}`;
  } else if (percentage >= 60) {
    return `Satisfactory. ${criterion.description || 'Partially met expectations for this criterion.'}`;
  } else if (percentage >= 40) {
    return `Needs improvement. ${criterion.description || 'Only minimally addressed this criterion.'}`;
  } else {
    return `Insufficient. ${criterion.description || 'Failed to adequately address this criterion.'}`;
  }
}

function generateSuggestedResources(question: any, missingKeywords: string[]): string[] {
  const resources: string[] = [];
  
  // Add resources based on the question's subject and topic
  if (question.topic) {
    resources.push(`Review the "${question.topic}" section in your textbook`);
  }
  
  // Add resources based on missing keywords
  if (missingKeywords.length > 0) {
    resources.push(`Study materials covering: ${missingKeywords.slice(0, 3).join(", ")}`);
  }
  
  // Add general resources based on question type
  switch (question.question_type) {
    case "multiple-choice":
      resources.push("Practice with similar multiple-choice questions to improve recognition");
      break;
    case "short-answer":
      resources.push("Review note-taking techniques to organize key points concisely");
      break;
    case "essay":
      resources.push("Practice essay structuring with introduction, body, and conclusion");
      break;
    case "calculation":
      resources.push("Work through step-by-step problem-solving examples");
      break;
    case "diagram":
      resources.push("Study visual representations and practice drawing key diagrams");
      break;
    case "practical":
      resources.push("Review laboratory procedures and safety guidelines");
      break;
    default:
      resources.push("Review core concepts and practice with similar questions");
  }
  
  // Ensure we have at least 3 resources
  if (resources.length < 3) {
    resources.push("Use the AI tutor feature for personalized guidance");
    resources.push("Join a study group for collaborative learning");
  }
  
  return resources;
}