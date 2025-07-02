import { GoogleGenerativeAI } from '@google/generative-ai';

// Tamil AI Service for understanding and responding in Tamil
class TamilAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // In production, use environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'demo-key';
    if (apiKey !== 'demo-key') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  // Detect language of the input text
  detectLanguage(text: string): 'ta' | 'si' | 'en' {
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const sinhalaPattern = /[\u0D80-\u0DFF]/;
    
    if (tamilPattern.test(text)) return 'ta';
    if (sinhalaPattern.test(text)) return 'si';
    return 'en';
  }

  // Extract text content from uploaded files
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

  // Analyze Tamil content and extract key information
  async analyzeTamilContent(content: string): Promise<{
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    questionCount: number;
    summary: string;
  }> {
    // Mock analysis for demo - in production, use AI
    const mockAnalysis = {
      subject: this.detectSubjectFromTamil(content),
      difficulty: this.detectDifficulty(content),
      topics: this.extractTopics(content),
      questionCount: this.countQuestions(content),
      summary: this.generateSummary(content)
    };

    if (this.model) {
      try {
        const prompt = `
        Analyze this Tamil educational content and provide:
        1. Subject (Chemistry/Physics/Biology in Tamil)
        2. Difficulty level (easy/medium/hard)
        3. Main topics covered
        4. Number of questions
        5. Brief summary in Tamil

        Content: ${content}
        
        Respond in JSON format with Tamil text where appropriate.
        `;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
      } catch (error) {
        console.error('AI analysis failed, using fallback:', error);
      }
    }

    return mockAnalysis;
  }

  // Generate AI response in user's preferred language
  async generateResponse(
    question: string, 
    context: string, 
    preferredLanguage: 'ta' | 'si' | 'en'
  ): Promise<string> {
    const languageNames = {
      ta: 'Tamil (தமிழ்)',
      si: 'Sinhala (සිංහල)',
      en: 'English'
    };

    if (this.model) {
      try {
        const prompt = `
        You are an AI tutor that understands Tamil, Sinhala, and English. 
        Answer the following question in ${languageNames[preferredLanguage]}.
        
        Context: ${context}
        Question: ${question}
        
        Provide a helpful, educational response in ${languageNames[preferredLanguage]}.
        If the question is about science concepts, explain clearly with examples.
        `;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('AI response generation failed:', error);
      }
    }

    // Fallback responses
    const fallbackResponses = {
      ta: 'மன்னிக்கவும், இந்த கேள்விக்கு பதிலளிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      si: 'සමාවන්න, මට මෙම ප්‍රශ්නයට පිළිතුරු දීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      en: 'Sorry, I cannot answer this question right now. Please try again.'
    };

    return fallbackResponses[preferredLanguage];
  }

  // Helper methods for content analysis
  private detectSubjectFromTamil(content: string): string {
    const chemistryKeywords = ['வேதியியல்', 'அமிலம்', 'காரம்', 'உப்பு', 'வினை'];
    const physicsKeywords = ['இயற்பியல்', 'விசை', 'ஆற்றல்', 'வேகம்', 'ஒளி'];
    const biologyKeywords = ['உயிரியல்', 'செல்', 'மரபணு', 'தாவரம்', 'விலங்கு'];

    if (chemistryKeywords.some(keyword => content.includes(keyword))) return 'Chemistry';
    if (physicsKeywords.some(keyword => content.includes(keyword))) return 'Physics';
    if (biologyKeywords.some(keyword => content.includes(keyword))) return 'Biology';
    
    return 'General';
  }

  private detectDifficulty(content: string): 'easy' | 'medium' | 'hard' {
    const length = content.length;
    if (length < 1000) return 'easy';
    if (length < 3000) return 'medium';
    return 'hard';
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction - in production, use NLP
    const topics = [];
    if (content.includes('வேதியியல்')) topics.push('Chemistry Basics');
    if (content.includes('இயற்பியல்')) topics.push('Physics Fundamentals');
    if (content.includes('உயிரியல்')) topics.push('Biology Concepts');
    return topics.length > 0 ? topics : ['General Topics'];
  }

  private countQuestions(content: string): number {
    const questionMarkers = ['?', '1.', '2.', '3.', '4.', '5.'];
    return questionMarkers.reduce((count, marker) => {
      return count + (content.split(marker).length - 1);
    }, 0);
  }

  private generateSummary(content: string): string {
    const words = content.split(' ').slice(0, 50);
    return words.join(' ') + (content.split(' ').length > 50 ? '...' : '');
  }
}

export const tamilAI = new TamilAIService();