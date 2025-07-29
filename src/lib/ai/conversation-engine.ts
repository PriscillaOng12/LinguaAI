import { OpenAI } from 'openai';
import { z } from 'zod';
import { MockAIService, mockAI } from './mock-ai-service';
import { 
  ConversationContext as ImportedConversationContext, 
  ConversationMessage as ImportedConversationMessage,
  PerformanceMetrics,
  LearningLevel 
} from '@/types/conversation';

// Legacy types for backward compatibility
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    corrections?: string[];
    grammar_feedback?: string;
    pronunciation_score?: number;
  };
}

export interface ConversationContext {
  learner_level: 'beginner' | 'intermediate' | 'advanced';
  target_language: string;
  native_language: string;
  topics: string[];
  learning_goals: string[];
  conversation_history: ConversationMessage[];
}

export interface AssessmentResult {
  grammar_score: number;
  vocabulary_score: number;
  fluency_score: number;
  pronunciation_score: number;
  overall_score: number;
  feedback: string;
  suggestions: string[];
  next_topics: string[];
}

// OpenAI API configuration - only initialize if API key exists
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export class ConversationEngine {
  private context: ConversationContext;
  private isUsingMockService: boolean;

  constructor(context: ConversationContext) {
    this.context = context;
    this.isUsingMockService = !process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  }

  /**
   * Generate AI response based on user input and conversation context
   */
  async generateResponse(userInput: string): Promise<ConversationMessage> {
    // Use mock service if no API key available
    if (this.isUsingMockService) {
      return this.generateMockResponse(userInput);
    }

    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = this.formatConversationHistory();

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 500,
        functions: [
          {
            name: "provide_language_feedback",
            description: "Provide detailed feedback on the user's language use",
            parameters: {
              type: "object",
              properties: {
                corrections: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of grammar or vocabulary corrections"
                },
                feedback: {
                  type: "string",
                  description: "Constructive feedback on language use"
                },
                confidence: {
                  type: "number",
                  description: "Confidence score for the user's response (0-100)"
                }
              }
            }
          }
        ]
      });

      const assistantMessage = response.choices[0].message;
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Extract function call data if present
      let metadata = {};
      if (assistantMessage.function_call) {
        try {
          const functionData = JSON.parse(assistantMessage.function_call.arguments || '{}');
          metadata = functionData;
        } catch (error) {
          console.error('Error parsing function call:', error);
        }
      }

      const message: ConversationMessage = {
        id: messageId,
        role: 'assistant',
        content: assistantMessage.content || '',
        timestamp: new Date(),
        metadata
      };

      // Update conversation history
      this.context.conversation_history.push({
        id: `user_${Date.now()}`,
        role: 'user',
        content: userInput,
        timestamp: new Date()
      });
      this.context.conversation_history.push(message);

      return message;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Assess user's language performance
   */
  async assessPerformance(conversation_segment: ConversationMessage[]): Promise<AssessmentResult> {
    // Use mock service if no API key available
    if (this.isUsingMockService) {
      const userMessages = conversation_segment.filter(msg => msg.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
      return this.generateMockAssessment(lastUserMessage);
    }

    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const userMessages = conversation_segment.filter(msg => msg.role === 'user');
    const assessmentPrompt = this.buildAssessmentPrompt(userMessages);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: assessmentPrompt },
          { role: "user", content: JSON.stringify(userMessages) }
        ],
        temperature: 0.3,
        max_tokens: 800,
        functions: [
          {
            name: "assess_language_performance",
            description: "Assess the user's language performance across multiple dimensions",
            parameters: {
              type: "object",
              properties: {
                grammar_score: { type: "number", minimum: 0, maximum: 100 },
                vocabulary_score: { type: "number", minimum: 0, maximum: 100 },
                fluency_score: { type: "number", minimum: 0, maximum: 100 },
                pronunciation_score: { type: "number", minimum: 0, maximum: 100 },
                overall_score: { type: "number", minimum: 0, maximum: 100 },
                feedback: { type: "string" },
                suggestions: {
                  type: "array",
                  items: { type: "string" }
                },
                next_topics: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["grammar_score", "vocabulary_score", "fluency_score", "pronunciation_score", "overall_score", "feedback", "suggestions", "next_topics"]
            }
          }
        ],
        function_call: { name: "assess_language_performance" }
      });

      const functionCall = response.choices[0].message.function_call;
      if (functionCall && functionCall.arguments) {
        const assessment = JSON.parse(functionCall.arguments);
        return assessment as AssessmentResult;
      }

      throw new Error('No assessment data received');
    } catch (error) {
      console.error('Error assessing performance:', error);
      throw new Error('Failed to assess language performance');
    }
  }

  /**
   * Adapt conversation difficulty based on user performance
   */
  adaptDifficulty(assessment: AssessmentResult): void {
    const overallScore = assessment.overall_score;

    if (overallScore >= 85 && this.context.learner_level !== 'advanced') {
      // Increase difficulty
      if (this.context.learner_level === 'beginner') {
        this.context.learner_level = 'intermediate';
      } else if (this.context.learner_level === 'intermediate') {
        this.context.learner_level = 'advanced';
      }
    } else if (overallScore <= 60 && this.context.learner_level !== 'beginner') {
      // Decrease difficulty
      if (this.context.learner_level === 'advanced') {
        this.context.learner_level = 'intermediate';
      } else if (this.context.learner_level === 'intermediate') {
        this.context.learner_level = 'beginner';
      }
    }

    // Update topics based on suggestions
    if (assessment.next_topics.length > 0) {
      this.context.topics = [...new Set([...this.context.topics, ...assessment.next_topics])];
    }
  }

  /**
   * Generate conversation starters based on user level and interests
   */
  async generateConversationStarters(): Promise<string[]> {
    // Use mock service if no API key available
    if (this.isUsingMockService) {
      const topics = await mockAI.generateConversationTopics(this.context.learner_level as LearningLevel);
      return topics.slice(0, 5);
    }

    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate 5 conversation starters appropriate for a ${this.context.learner_level} level ${this.context.target_language} learner. Topics of interest: ${this.context.topics.join(', ')}. Make them engaging and educational.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 300
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return [
        "Tell me about your favorite hobby.",
        "What did you do last weekend?",
        "Describe your ideal vacation.",
        "What's your favorite type of food?",
        "Tell me about your family."
      ];
    }
  }

  private buildSystemPrompt(): string {
    return `You are an AI language learning companion helping a ${this.context.learner_level} level learner practice ${this.context.target_language}. Their native language is ${this.context.native_language}.

Key guidelines:
1. Adapt your responses to the learner's level (${this.context.learner_level})
2. Focus on topics they're interested in: ${this.context.topics.join(', ')}
3. Provide gentle corrections when needed
4. Encourage natural conversation flow
5. Ask follow-up questions to keep the conversation engaging
6. Use vocabulary and grammar appropriate for their level
7. Be patient, supportive, and encouraging

For beginners: Use simple vocabulary, short sentences, provide translations when helpful
For intermediate: Use moderate complexity, introduce new concepts gradually
For advanced: Use natural, complex language, focus on nuanced expression

Always maintain a friendly, encouraging tone and celebrate their progress.`;
  }

  private buildAssessmentPrompt(userMessages: ConversationMessage[]): string {
    return `Assess the language performance of a ${this.context.learner_level} level ${this.context.target_language} learner based on their conversation messages. Their native language is ${this.context.native_language}.

Evaluate across these dimensions:
- Grammar: Correctness of sentence structure, verb tenses, etc.
- Vocabulary: Appropriateness and variety of word choice
- Fluency: Natural flow and coherence of expression
- Pronunciation: Based on written indicators like repeated attempts or corrections

Provide scores (0-100), constructive feedback, specific suggestions for improvement, and recommended next topics to practice.`;
  }

  private formatConversationHistory(): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
    return this.context.conversation_history
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }

  /**
   * Update conversation context
   */
  updateContext(updates: Partial<ConversationContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Get current conversation context
   */
  getContext(): ConversationContext {
    return { ...this.context };
  }

  /**
   * Clear conversation history while preserving settings
   */
  clearHistory(): void {
    this.context.conversation_history = [];
  }

  /**
   * Generate mock response when no API key is available
   */
  private async generateMockResponse(userInput: string): Promise<ConversationMessage> {
    // Convert legacy context to new format for mock service
    const mockContext: ImportedConversationContext = {
      userId: 'mock-user',
      targetLanguage: 'en',
      nativeLanguage: 'en',
      currentLevel: this.context.learner_level as LearningLevel,
      sessionGoals: this.context.learning_goals,
      conversationHistory: [],
      focusAreas: this.context.topics,
      sessionStartTime: new Date(),
      totalMessagesInSession: this.context.conversation_history.length
    };

    const mockResponse = await mockAI.generateResponse(userInput, mockContext, this.context.learner_level as LearningLevel);

    return {
      id: `mock-${Date.now()}`,
      role: 'assistant',
      content: mockResponse.response,
      timestamp: new Date(),
      metadata: {
        confidence: 85 + Math.random() * 15,
        corrections: mockResponse.corrections,
        grammar_feedback: mockResponse.feedback,
        pronunciation_score: 80 + Math.random() * 20
      }
    };
  }

  /**
   * Generate mock assessment when no API key is available
   */
  private async generateMockAssessment(userInput: string): Promise<AssessmentResult> {
    const mockContext: ImportedConversationContext = {
      userId: 'mock-user',
      targetLanguage: 'en',
      nativeLanguage: 'en',
      currentLevel: this.context.learner_level as LearningLevel,
      sessionGoals: this.context.learning_goals,
      conversationHistory: [],
      focusAreas: this.context.topics,
      sessionStartTime: new Date(),
      totalMessagesInSession: this.context.conversation_history.length
    };

    const performance = await mockAI.assessPerformance(userInput, mockContext);
    const topics = await mockAI.generateConversationTopics(this.context.learner_level as LearningLevel);

    return {
      grammar_score: performance.grammar,
      vocabulary_score: performance.vocabulary,
      fluency_score: performance.fluency,
      pronunciation_score: performance.pronunciation,
      overall_score: (performance.grammar + performance.vocabulary + performance.fluency + performance.pronunciation) / 4,
      feedback: "Great job! Keep practicing to improve your skills.",
      suggestions: [
        "Try using more complex sentence structures",
        "Practice with more advanced vocabulary",
        "Focus on pronunciation of difficult sounds"
      ],
      next_topics: topics.slice(0, 3)
    };
  }
}

// Utility functions for conversation analysis
export function analyzeConversationTrends(messages: ConversationMessage[]): {
  average_confidence: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
  common_topics: string[];
} {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const confidenceScores = userMessages
    .map(msg => msg.metadata?.confidence)
    .filter(score => score !== undefined) as number[];

  const average_confidence = confidenceScores.length > 0 
    ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
    : 0;

  // Simple trend analysis based on recent vs older scores
  const recent = confidenceScores.slice(-5);
  const older = confidenceScores.slice(0, -5);
  const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0;

  let improvement_trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentAvg > olderAvg + 5) improvement_trend = 'improving';
  else if (recentAvg < olderAvg - 5) improvement_trend = 'declining';

  return {
    average_confidence,
    improvement_trend,
    common_topics: [] // Would implement topic extraction here
  };
}
