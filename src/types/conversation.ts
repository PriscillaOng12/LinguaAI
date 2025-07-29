// Core conversation types
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type ConversationMode = 'practice' | 'assessment' | 'free-form';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

// Conversation context and state
export interface ConversationContext {
  userId: string;
  targetLanguage: LanguageCode;
  nativeLanguage: LanguageCode;
  currentLevel: LearningLevel;
  sessionGoals: string[];
  conversationHistory: ConversationMessage[];
  focusAreas: string[];
  sessionStartTime: Date;
  totalMessagesInSession: number;
}

// Individual message in conversation
export interface ConversationMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    audioUrl?: string;
    pronunciationScore?: number;
    responseTime?: number;
    corrections?: string[];
    suggestions?: string[];
  };
}

// Performance metrics and assessment
export interface PerformanceMetrics {
  accuracy: number;        // 0-100
  fluency: number;         // 0-100
  vocabulary: number;      // 0-100
  grammar: number;         // 0-100
  pronunciation: number;   // 0-100
  overallScore: number;    // 0-100 (calculated average)
}

// Detailed conversation assessment
export interface ConversationAssessment {
  sessionId: string;
  duration: number; // in minutes
  messageCount: number;
  performance: PerformanceMetrics;
  improvements: string[];
  challenges: string[];
  nextSteps: string[];
  levelRecommendation?: LearningLevel;
}

// Real-time feedback during conversation
export interface RealTimeFeedback {
  type: 'correction' | 'suggestion' | 'encouragement' | 'pronunciation';
  message: string;
  severity: 'low' | 'medium' | 'high';
  targetWord?: string;
  suggestion?: string;
  explanation?: string;
}

// Conversation settings and preferences
export interface ConversationSettings {
  enableVoice: boolean;
  enableRealTimeFeedback: boolean;
  feedbackIntensity: 'minimal' | 'moderate' | 'comprehensive';
  preferredTopics: string[];
  difficultyPreference: 'adaptive' | 'fixed';
  sessionDuration: number; // in minutes
  breakFrequency: number; // minutes between breaks
}

// AI conversation response
export interface AIConversationResponse {
  response: string;
  feedback?: RealTimeFeedback[];
  performance?: Partial<PerformanceMetrics>;
  suggestions?: string[];
  corrections?: string[];
  nextTopic?: string;
  sessionComplete?: boolean;
}

// Conversation analytics and insights
export interface ConversationAnalytics {
  totalSessions: number;
  totalMinutes: number;
  averageSessionDuration: number;
  levelProgress: {
    current: LearningLevel;
    progressToNext: number; // 0-100
    timeInCurrentLevel: number; // days
  };
  strongAreas: string[];
  improvementAreas: string[];
  streakDays: number;
  weeklyGoalProgress: number; // 0-100
}

// Voice conversation specific types
export interface VoiceConversationData {
  audioBlob: Blob;
  transcription: string;
  confidence: number;
  pronunciation: {
    overallScore: number;
    wordScores: { word: string; score: number }[];
    issues: string[];
  };
}

// Conversation topics and scenarios
export interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  level: LearningLevel;
  category: string;
  estimatedDuration: number; // minutes
  keyVocabulary: string[];
  objectives: string[];
}

// Multi-user conversation (for group practice)
export interface GroupConversation {
  id: string;
  participants: string[];
  moderator?: string; // AI or human moderator
  topic: ConversationTopic;
  settings: {
    maxParticipants: number;
    turnDuration: number; // seconds
    feedbackEnabled: boolean;
  };
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
}
