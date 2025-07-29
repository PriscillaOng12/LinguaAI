import { ConversationContext, PerformanceMetrics, LearningLevel } from '@/types/conversation';

/**
 * Mock AI service for testing without OpenAI API key
 * Provides realistic responses and behavior for development/testing
 */
export class MockAIService {
  private responses: { [key: string]: string[] } = {
    greeting: [
      "Hello! I'm excited to help you practice your language skills today. What would you like to talk about?",
      "Welcome back! Ready for another conversation practice session?",
      "Hi there! Let's start with some conversation practice. How are you feeling today?",
    ],
    beginner: [
      "That's a great start! Let me help you with that. Try saying: 'I like to read books.'",
      "Good effort! Here's a simple way to say that: 'The weather is nice today.'",
      "You're doing well! Let's practice this phrase: 'How are you?'",
    ],
    intermediate: [
      "Excellent progress! You could also express that by saying: 'I find this topic quite fascinating.'",
      "Good use of vocabulary! Here's another way to phrase it: 'That's an interesting perspective.'",
      "Nice work! Try using more descriptive language: 'The sunset was absolutely breathtaking.'",
    ],
    advanced: [
      "Impressive! Your language skills are quite sophisticated. Let's discuss the nuances of that expression.",
      "Excellent articulation! You might also consider using subjunctive mood in that context.",
      "Outstanding! Your grasp of idiomatic expressions is really developing well.",
    ],
    correction: [
      "Small correction: Instead of saying that, try 'I am going to the store.'",
      "Good attempt! The correct form would be: 'She has been studying for hours.'",
      "Almost perfect! Just remember to use 'have' instead of 'has' in this case.",
    ],
    encouragement: [
      "You're making excellent progress! Keep up the great work!",
      "Don't worry about mistakes - they're part of learning! You're doing fantastic!",
      "I can see real improvement in your language skills. Well done!",
    ]
  };

  private conversationHistory: string[] = [];

  /**
   * Generate a mock AI response based on input and context
   */
  async generateResponse(
    message: string,
    context: ConversationContext,
    userLevel: LearningLevel = 'intermediate'
  ): Promise<{
    response: string;
    feedback: string;
    corrections: string[];
    suggestions: string[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    this.conversationHistory.push(message);

    // Determine response type based on message content and context
    let responseType = this.getResponseType(message, userLevel);
    let responses = this.responses[responseType] || this.responses.intermediate;
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Generate mock feedback
    const feedback = this.generateFeedback(message, userLevel);
    const corrections = this.generateCorrections(message);
    const suggestions = this.generateSuggestions(message, userLevel);

    return {
      response,
      feedback,
      corrections,
      suggestions
    };
  }

  /**
   * Generate mock performance assessment
   */
  async assessPerformance(message: string, context: ConversationContext): Promise<PerformanceMetrics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const wordCount = message.split(' ').length;
    const hasComplexWords = /\b\w{8,}\b/.test(message);
    const hasGoodGrammar = message.includes('.') || message.includes('?') || message.includes('!');

    return {
      accuracy: Math.min(95, 70 + Math.random() * 25 + (hasGoodGrammar ? 10 : 0)),
      fluency: Math.min(95, 60 + Math.random() * 30 + (wordCount > 5 ? 10 : 0)),
      vocabulary: Math.min(95, 65 + Math.random() * 25 + (hasComplexWords ? 15 : 0)),
      grammar: Math.min(95, 70 + Math.random() * 20 + (hasGoodGrammar ? 15 : 0)),
      pronunciation: Math.min(95, 75 + Math.random() * 20),
      overallScore: 0 // Will be calculated
    };
  }

  /**
   * Generate mock conversation topics
   */
  async generateConversationTopics(level: LearningLevel): Promise<string[]> {
    const topics: Record<LearningLevel, string[]> = {
      beginner: [
        "Introduce yourself and talk about your hobbies",
        "Describe your daily routine",
        "Talk about your favorite food",
        "Discuss the weather",
        "Share about your family"
      ],
      intermediate: [
        "Discuss your travel experiences",
        "Talk about your career goals",
        "Share your opinion on technology",
        "Describe a memorable event",
        "Discuss cultural differences"
      ],
      advanced: [
        "Debate environmental policies",
        "Analyze current global events",
        "Discuss philosophical concepts",
        "Examine social media's impact on society",
        "Explore future technology trends"
      ]
    };

    return topics[level] || topics.intermediate;
  }

  private getResponseType(message: string, level: LearningLevel): string {
    const lowerMessage = message.toLowerCase();
    
    if (this.conversationHistory.length === 0 || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'greeting';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('difficult')) {
      return 'encouragement';
    }
    
    // Check for grammar errors to provide corrections
    if (this.hasGrammarIssues(message)) {
      return 'correction';
    }
    
    return level;
  }

  private generateFeedback(message: string, level: LearningLevel): string {
    const wordCount = message.split(' ').length;
    const feedbacks = [
      `Great job! Your message was ${wordCount} words long and shows good understanding.`,
      `Nice work! I can see you're applying the vocabulary well.`,
      `Excellent effort! Your sentence structure is improving.`,
      `Good progress! Keep practicing with longer sentences.`,
      `Well done! Your confidence in expression is growing.`
    ];
    
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }

  private generateCorrections(message: string): string[] {
    const corrections: string[] = [];
    
    // Mock grammar corrections
    if (message.includes(' i ') && !message.includes(' I ')) {
      corrections.push("Remember to capitalize 'I' when referring to yourself");
    }
    
    if (!message.trim().match(/[.!?]$/)) {
      corrections.push("Don't forget to end your sentence with punctuation");
    }
    
    if (message.includes('goed')) {
      corrections.push("Use 'went' instead of 'goed' for past tense of 'go'");
    }
    
    return corrections;
  }

  private generateSuggestions(message: string, level: LearningLevel): string[] {
    const suggestions: string[] = [];
    
    if (level === 'beginner') {
      suggestions.push("Try using more descriptive adjectives");
      suggestions.push("Practice using different sentence starters");
    } else if (level === 'intermediate') {
      suggestions.push("Consider using more complex sentence structures");
      suggestions.push("Try incorporating idiomatic expressions");
    } else {
      suggestions.push("Experiment with advanced grammatical constructions");
      suggestions.push("Use more sophisticated vocabulary choices");
    }
    
    return suggestions;
  }

  private hasGrammarIssues(message: string): boolean {
    // Simple checks for common errors
    return message.includes('goed') || 
           message.includes(' i ') || 
           !message.trim().match(/[.!?]$/);
  }

  /**
   * Check if running in mock mode
   */
  static isInMockMode(): boolean {
    return !process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  }
}

export const mockAI = new MockAIService();
