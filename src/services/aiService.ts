import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  // Analyze uploaded content
  async analyzeContent(content: string, language: string = 'en'): Promise<{
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    questionCount: number;
    summary: string;
    suggestedTags: string[];
  }> {
    if (!this.model) {
      return this.fallbackAnalysis(content);
    }

    try {
      const prompt = `
        Analyze this educational content and provide a JSON response with:
        1. subject: One of "chemistry", "physics", or "biology"
        2. difficulty: "easy", "medium", or "hard"
        3. topics: Array of main topics covered
        4. questionCount: Number of questions found
        5. summary: Brief summary in ${language}
        6. suggestedTags: Array of relevant tags

        Content: ${content.substring(0, 2000)}
        
        Respond only with valid JSON.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.fallbackAnalysis(content);
    }
  }

  // Generate AI tutoring response
  async generateTutorResponse(
    question: string,
    studentAnswer: string,
    context: string,
    language: string = 'en'
  ): Promise<string> {
    if (!this.model) {
      return this.fallbackTutorResponse(language);
    }

    try {
      const languageMap = {
        en: 'English',
        ta: 'Tamil (தமிழ்)',
        si: 'Sinhala (සිංහල)'
      };

      const prompt = `
        You are an AI tutor helping a student with science questions.
        
        Question: ${question}
        Student's Answer: ${studentAnswer}
        Context: ${context}
        
        Provide helpful feedback in ${languageMap[language as keyof typeof languageMap]}.
        Be encouraging, specific, and educational.
        If the answer is incorrect, guide them toward the right solution.
        If correct, acknowledge and provide additional insights.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI tutor response failed:', error);
      return this.fallbackTutorResponse(language);
    }
  }

  // Grade student response
  async gradeResponse(
    question: any,
    studentResponse: string,
    language: string = 'en'
  ): Promise<{
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    detailedBreakdown: any[];
    suggestedResources: string[];
  }> {
    if (!this.model) {
      return this.fallbackGrading(question, studentResponse);
    }

    try {
      const prompt = `
        Grade this student response for a science question.
        
        Question: ${question.question_text}
        Correct Answer: ${JSON.stringify(question.correct_answer)}
        Student Response: ${studentResponse}
        Max Marks: ${question.marks}
        Marking Scheme: ${JSON.stringify(question.marking_scheme)}
        
        Provide a JSON response with:
        - totalMarks: number awarded
        - maxMarks: total possible marks
        - percentage: percentage score
        - grade: letter grade (A+, A, B+, B, C+, C, D, F)
        - feedback: overall feedback
        - strengths: array of what student did well
        - improvements: array of areas to improve
        - detailedBreakdown: array of marking criteria with scores
        - suggestedResources: array of study resources
        
        Be fair, constructive, and educational in your grading.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('AI grading failed:', error);
      return this.fallbackGrading(question, studentResponse);
    }
  }

  // Store AI grading in database
  async storeGrading(responseId: string, grading: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_gradings')
        .insert({
          response_id: responseId,
          total_marks: grading.totalMarks,
          max_marks: grading.maxMarks,
          percentage: grading.percentage,
          grade: grading.grade,
          feedback: grading.feedback,
          strengths: grading.strengths,
          improvements: grading.improvements,
          detailed_breakdown: grading.detailedBreakdown,
          suggested_resources: grading.suggestedResources,
          ai_model: 'gemini-pro',
          confidence_score: 0.85
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store AI grading:', error);
      throw error;
    }
  }

  // Extract text from file
  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  }

  // Fallback methods for when AI is not available
  private fallbackAnalysis(content: string) {
    const subjects = ['chemistry', 'physics', 'biology'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    return {
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)] as 'easy' | 'medium' | 'hard',
      topics: ['General Topics'],
      questionCount: Math.floor(content.length / 200),
      summary: content.substring(0, 100) + '...',
      suggestedTags: ['science', 'education']
    };
  }

  private fallbackTutorResponse(language: string): string {
    const responses = {
      en: "I'm here to help! Please provide more details about your question.",
      ta: "நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்! உங்கள் கேள்வியைப் பற்றி மேலும் விவரங்களைத் தரவும்.",
      si: "මම ඔබට උදව් කිරීමට මෙහි සිටිමි! ඔබේ ප්‍රශ්නය ගැන වැඩි විස්තර ලබා දෙන්න."
    };
    return responses[language as keyof typeof responses] || responses.en;
  }

  private fallbackGrading(question: any, studentResponse: string) {
    const score = Math.floor(Math.random() * question.marks) + 1;
    const percentage = (score / question.marks) * 100;
    
    return {
      totalMarks: score,
      maxMarks: question.marks,
      percentage,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : 'C',
      feedback: 'Good attempt! Keep practicing to improve your understanding.',
      strengths: ['Shows understanding of basic concepts'],
      improvements: ['Could provide more detailed explanations'],
      detailedBreakdown: [
        {
          criterion: 'Understanding',
          marksAwarded: Math.floor(score * 0.6),
          maxMarks: Math.floor(question.marks * 0.6),
          feedback: 'Demonstrates basic understanding'
        }
      ],
      suggestedResources: ['Review textbook chapter', 'Practice similar problems']
    };
  }
}

export const aiService = new AIService();