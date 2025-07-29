import { z } from 'zod';

// Learning progress tracking types
export interface LearningProgress {
  user_id: string;
  language: string;
  current_level: 'beginner' | 'intermediate' | 'advanced';
  xp_points: number;
  streak_days: number;
  last_activity: Date;
  topics_mastered: string[];
  topics_in_progress: string[];
  weekly_goals: {
    target_minutes: number;
    achieved_minutes: number;
    target_conversations: number;
    completed_conversations: number;
  };
  skill_scores: {
    grammar: number;
    vocabulary: number;
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  learning_preferences: {
    difficulty_preference: 'adaptive' | 'challenging' | 'comfortable';
    session_length: 'short' | 'medium' | 'long'; // 5-10, 15-20, 30+ minutes
    focus_areas: string[];
    preferred_times: string[];
  };
}

export interface LearningSession {
  id: string;
  user_id: string;
  start_time: Date;
  end_time?: Date;
  duration_minutes: number;
  session_type: 'conversation' | 'vocabulary' | 'grammar' | 'pronunciation' | 'listening';
  topic: string;
  difficulty_level: number; // 1-10
  performance_metrics: {
    accuracy_rate: number;
    completion_rate: number;
    engagement_score: number;
    mistakes_count: number;
    improvements_noted: string[];
  };
  xp_earned: number;
  achievements_unlocked: string[];
}

export interface LearningGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: Date;
  goal_type: 'skill_level' | 'conversation_count' | 'vocabulary_size' | 'streak' | 'custom';
  target_value: number;
  current_value: number;
  is_completed: boolean;
  reward_xp: number;
}

export interface PersonalizedContent {
  recommended_topics: Array<{
    topic: string;
    reason: string;
    difficulty: number;
    estimated_time: number;
  }>;
  skill_focus_areas: Array<{
    skill: string;
    current_level: number;
    target_level: number;
    recommended_exercises: string[];
  }>;
  conversation_scenarios: Array<{
    scenario: string;
    difficulty: number;
    skills_practiced: string[];
    description: string;
  }>;
}

export class AdaptiveLearningSystem {
  private userId: string;
  private currentProgress: LearningProgress;

  constructor(userId: string, initialProgress: LearningProgress) {
    this.userId = userId;
    this.currentProgress = initialProgress;
  }

  /**
   * Analyze user performance and adapt difficulty
   */
  analyzeAndAdapt(sessions: LearningSession[]): {
    difficulty_adjustment: number;
    recommended_focus: string[];
    next_topics: string[];
    motivation_message: string;
  } {
    const recentSessions = sessions
      .filter(s => s.user_id === this.userId)
      .sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
      .slice(0, 10);

    if (recentSessions.length === 0) {
      return this.getDefaultRecommendations();
    }

    // Calculate performance trends
    const avgAccuracy = this.calculateAverageAccuracy(recentSessions);
    const avgEngagement = this.calculateAverageEngagement(recentSessions);
    const learningVelocity = this.calculateLearningVelocity(recentSessions);
    
    // Determine difficulty adjustment
    const difficultyAdjustment = this.calculateDifficultyAdjustment(
      avgAccuracy, 
      avgEngagement, 
      learningVelocity
    );

    // Identify weak areas for focused practice
    const weakAreas = this.identifyWeakAreas(recentSessions);
    
    // Generate personalized topic recommendations
    const nextTopics = this.generateTopicRecommendations(recentSessions, weakAreas);
    
    // Create motivational message
    const motivationMessage = this.generateMotivationMessage(
      avgAccuracy, 
      this.currentProgress.streak_days,
      this.currentProgress.xp_points
    );

    return {
      difficulty_adjustment: difficultyAdjustment,
      recommended_focus: weakAreas,
      next_topics: nextTopics,
      motivation_message: motivationMessage
    };
  }

  /**
   * Generate personalized learning content
   */
  generatePersonalizedContent(): PersonalizedContent {
    const skillLevels = this.currentProgress.skill_scores;
    const preferences = this.currentProgress.learning_preferences;
    const masteredTopics = this.currentProgress.topics_mastered;
    const currentLevel = this.currentProgress.current_level;

    // Recommend topics based on current progress and preferences
    const recommendedTopics = this.getRecommendedTopics(
      currentLevel, 
      masteredTopics, 
      preferences.focus_areas
    );

    // Identify skills that need improvement
    const skillFocusAreas = this.getSkillFocusAreas(skillLevels, currentLevel);

    // Generate conversation scenarios appropriate for level
    const conversationScenarios = this.getConversationScenarios(
      currentLevel, 
      preferences.focus_areas
    );

    return {
      recommended_topics: recommendedTopics,
      skill_focus_areas: skillFocusAreas,
      conversation_scenarios: conversationScenarios
    };
  }

  /**
   * Update learning progress after a session
   */
  updateProgress(session: LearningSession): LearningProgress {
    const updatedProgress = { ...this.currentProgress };
    
    // Update XP points
    updatedProgress.xp_points += session.xp_earned;
    
    // Update skill scores based on session performance
    this.updateSkillScores(updatedProgress, session);
    
    // Update streak
    this.updateStreak(updatedProgress, session.start_time);
    
    // Update weekly goals
    this.updateWeeklyGoals(updatedProgress, session);
    
    // Check for level progression
    this.checkLevelProgression(updatedProgress);
    
    // Update topics progress
    this.updateTopicsProgress(updatedProgress, session);
    
    updatedProgress.last_activity = session.end_time || new Date();
    
    this.currentProgress = updatedProgress;
    return updatedProgress;
  }

  /**
   * Set and track learning goals
   */
  setLearningGoal(goal: Omit<LearningGoal, 'id' | 'user_id' | 'current_value' | 'is_completed'>): LearningGoal {
    const newGoal: LearningGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: this.userId,
      current_value: 0,
      is_completed: false
    };

    return newGoal;
  }

  /**
   * Check and update goal progress
   */
  updateGoalProgress(goals: LearningGoal[], sessions: LearningSession[]): LearningGoal[] {
    return goals.map(goal => {
      if (goal.is_completed) return goal;

      const updatedGoal = { ...goal };
      
      switch (goal.goal_type) {
        case 'conversation_count':
          updatedGoal.current_value = sessions.filter(
            s => s.user_id === this.userId && s.session_type === 'conversation'
          ).length;
          break;
          
        case 'streak':
          updatedGoal.current_value = this.currentProgress.streak_days;
          break;
          
        case 'vocabulary_size':
          // This would integrate with vocabulary tracking
          updatedGoal.current_value = this.estimateVocabularySize();
          break;
          
        default:
          // Custom goals would need specific logic
          break;
      }
      
      updatedGoal.is_completed = updatedGoal.current_value >= updatedGoal.target_value;
      
      return updatedGoal;
    });
  }

  /**
   * Generate achievements based on progress
   */
  checkAchievements(sessions: LearningSession[]): string[] {
    const achievements: string[] = [];
    const totalSessions = sessions.filter(s => s.user_id === this.userId).length;
    const streakDays = this.currentProgress.streak_days;
    const xpPoints = this.currentProgress.xp_points;

    // Session-based achievements
    if (totalSessions === 1) achievements.push('First Steps');
    if (totalSessions === 10) achievements.push('Getting Started');
    if (totalSessions === 50) achievements.push('Dedicated Learner');
    if (totalSessions === 100) achievements.push('Conversation Master');

    // Streak achievements
    if (streakDays === 7) achievements.push('Week Warrior');
    if (streakDays === 30) achievements.push('Monthly Commitment');
    if (streakDays === 100) achievements.push('Streak Legend');

    // XP achievements
    if (xpPoints >= 1000) achievements.push('Thousand Points');
    if (xpPoints >= 5000) achievements.push('Five Thousand Club');
    if (xpPoints >= 10000) achievements.push('Elite Learner');

    // Skill-based achievements
    const skillScores = this.currentProgress.skill_scores;
    Object.entries(skillScores).forEach(([skill, score]) => {
      if (score >= 80) achievements.push(`${skill} Expert`);
      if (score >= 95) achievements.push(`${skill} Master`);
    });

    return achievements;
  }

  private calculateAverageAccuracy(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    return sessions.reduce((sum, s) => sum + s.performance_metrics.accuracy_rate, 0) / sessions.length;
  }

  private calculateAverageEngagement(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    return sessions.reduce((sum, s) => sum + s.performance_metrics.engagement_score, 0) / sessions.length;
  }

  private calculateLearningVelocity(sessions: LearningSession[]): number {
    if (sessions.length < 2) return 0;
    
    const firstSession = sessions[sessions.length - 1];
    const lastSession = sessions[0];
    const timeDiff = lastSession.start_time.getTime() - firstSession.start_time.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    return sessions.length / Math.max(daysDiff, 1);
  }

  private calculateDifficultyAdjustment(accuracy: number, engagement: number, velocity: number): number {
    let adjustment = 0;
    
    // Increase difficulty if performing very well
    if (accuracy > 85 && engagement > 75) {
      adjustment = 1;
    }
    // Decrease difficulty if struggling
    else if (accuracy < 60 || engagement < 50) {
      adjustment = -1;
    }
    // Fine-tune based on learning velocity
    if (velocity > 2 && accuracy > 75) {
      adjustment += 0.5;
    }
    
    return Math.max(-2, Math.min(2, adjustment));
  }

  private identifyWeakAreas(sessions: LearningSession[]): string[] {
    const skillPerformance: Record<string, number[]> = {};
    
    sessions.forEach(session => {
      const sessionType = session.session_type;
      if (!skillPerformance[sessionType]) {
        skillPerformance[sessionType] = [];
      }
      skillPerformance[sessionType].push(session.performance_metrics.accuracy_rate);
    });
    
    const weakAreas = Object.entries(skillPerformance)
      .map(([skill, scores]) => ({
        skill,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .filter(({ avgScore }) => avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)
      .map(({ skill }) => skill);
    
    return weakAreas;
  }

  private generateTopicRecommendations(sessions: LearningSession[], weakAreas: string[]): string[] {
    const recentTopics = sessions.map(s => s.topic);
    const topicFrequency: Record<string, number> = {};
    
    recentTopics.forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });
    
    // Suggest new topics and topics that need more practice
    const allTopics = this.getAllAvailableTopics();
    const suggestions = allTopics
      .filter(topic => !this.currentProgress.topics_mastered.includes(topic))
      .filter(topic => (topicFrequency[topic] || 0) < 3)
      .slice(0, 5);
    
    return suggestions;
  }

  private generateMotivationMessage(accuracy: number, streak: number, xp: number): string {
    if (accuracy >= 85) {
      return `🌟 Outstanding performance! Your ${accuracy.toFixed(1)}% accuracy shows real mastery. Keep up the excellent work!`;
    } else if (accuracy >= 70) {
      return `👍 Good progress! You're doing well with ${accuracy.toFixed(1)}% accuracy. Push yourself a little more!`;
    } else if (streak >= 7) {
      return `🔥 Amazing ${streak}-day streak! Consistency is key to language learning. You're building great habits!`;
    } else if (xp >= 1000) {
      return `🏆 Impressive ${xp} XP earned! Your dedication is paying off. Every conversation makes you stronger!`;
    } else {
      return `💪 Every step counts! You're making progress. Remember, language learning is a journey, not a race.`;
    }
  }

  private getDefaultRecommendations() {
    return {
      difficulty_adjustment: 0,
      recommended_focus: ['conversation', 'vocabulary'],
      next_topics: ['introductions', 'daily_routines', 'hobbies'],
      motivation_message: '🌟 Welcome to your language learning journey! Start with basic conversations to build confidence.'
    };
  }

  private updateSkillScores(progress: LearningProgress, session: LearningSession): void {
    const sessionAccuracy = session.performance_metrics.accuracy_rate;
    const sessionType = session.session_type;
    
    // Map session types to skills
    const skillMapping: Record<string, keyof typeof progress.skill_scores> = {
      'conversation': 'speaking',
      'vocabulary': 'vocabulary',
      'grammar': 'grammar',
      'pronunciation': 'speaking',
      'listening': 'listening'
    };
    
    const targetSkill = skillMapping[sessionType];
    if (targetSkill) {
      // Weighted average: 80% existing score, 20% new session
      progress.skill_scores[targetSkill] = 
        progress.skill_scores[targetSkill] * 0.8 + sessionAccuracy * 0.2;
    }
  }

  private updateStreak(progress: LearningProgress, sessionDate: Date): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sessionDay = new Date(sessionDate);
    sessionDay.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (sessionDay.getTime() === today.getTime()) {
      // Continue or start streak
      if (progress.last_activity) {
        const lastActivityDay = new Date(progress.last_activity);
        lastActivityDay.setHours(0, 0, 0, 0);
        
        if (lastActivityDay.getTime() === yesterday.getTime()) {
          progress.streak_days += 1;
        } else if (lastActivityDay.getTime() !== today.getTime()) {
          progress.streak_days = 1;
        }
      } else {
        progress.streak_days = 1;
      }
    }
  }

  private updateWeeklyGoals(progress: LearningProgress, session: LearningSession): void {
    progress.weekly_goals.achieved_minutes += session.duration_minutes;
    
    if (session.session_type === 'conversation') {
      progress.weekly_goals.completed_conversations += 1;
    }
  }

  private checkLevelProgression(progress: LearningProgress): void {
    const avgSkillScore = Object.values(progress.skill_scores)
      .reduce((sum, score) => sum + score, 0) / Object.keys(progress.skill_scores).length;
    
    if (progress.current_level === 'beginner' && avgSkillScore >= 70) {
      progress.current_level = 'intermediate';
    } else if (progress.current_level === 'intermediate' && avgSkillScore >= 85) {
      progress.current_level = 'advanced';
    }
  }

  private updateTopicsProgress(progress: LearningProgress, session: LearningSession): void {
    const topic = session.topic;
    const accuracy = session.performance_metrics.accuracy_rate;
    
    if (accuracy >= 85 && !progress.topics_mastered.includes(topic)) {
      progress.topics_mastered.push(topic);
      // Remove from in-progress
      progress.topics_in_progress = progress.topics_in_progress.filter(t => t !== topic);
    } else if (!progress.topics_mastered.includes(topic) && !progress.topics_in_progress.includes(topic)) {
      progress.topics_in_progress.push(topic);
    }
  }

  private estimateVocabularySize(): number {
    // This would integrate with actual vocabulary tracking
    // For now, estimate based on XP and sessions
    return Math.floor(this.currentProgress.xp_points / 10);
  }

  private getRecommendedTopics(level: string, mastered: string[], interests: string[]) {
    const allTopics = this.getAllAvailableTopics();
    const levelTopics = this.getTopicsForLevel(level);
    
    return levelTopics
      .filter(topic => !mastered.includes(topic))
      .map(topic => ({
        topic,
        reason: interests.includes(topic) ? 'Matches your interests' : 'Recommended for your level',
        difficulty: this.getTopicDifficulty(topic, level),
        estimated_time: 15
      }))
      .slice(0, 5);
  }

  private getSkillFocusAreas(skillLevels: LearningProgress['skill_scores'], level: string) {
    const targetLevel = level === 'beginner' ? 70 : level === 'intermediate' ? 85 : 95;
    
    return Object.entries(skillLevels)
      .filter(([_, score]) => score < targetLevel)
      .map(([skill, score]) => ({
        skill,
        current_level: Math.round(score),
        target_level: targetLevel,
        recommended_exercises: this.getExercisesForSkill(skill)
      }));
  }

  private getConversationScenarios(level: string, interests: string[]) {
    const scenarios = this.getAllScenarios();
    return scenarios
      .filter(scenario => scenario.difficulty <= this.getLevelDifficulty(level))
      .slice(0, 5);
  }

  private getAllAvailableTopics(): string[] {
    return [
      'introductions', 'daily_routines', 'hobbies', 'food_dining', 'travel', 
      'shopping', 'work_career', 'health_fitness', 'entertainment', 'weather',
      'family_friends', 'education', 'technology', 'culture', 'current_events'
    ];
  }

  private getTopicsForLevel(level: string): string[] {
    const beginner = ['introductions', 'daily_routines', 'hobbies', 'food_dining', 'family_friends'];
    const intermediate = [...beginner, 'travel', 'shopping', 'work_career', 'health_fitness', 'weather'];
    const advanced = [...intermediate, 'entertainment', 'education', 'technology', 'culture', 'current_events'];
    
    switch (level) {
      case 'beginner': return beginner;
      case 'intermediate': return intermediate;
      case 'advanced': return advanced;
      default: return beginner;
    }
  }

  private getTopicDifficulty(topic: string, level: string): number {
    const baseDifficulty = {
      'introductions': 1,
      'daily_routines': 2,
      'hobbies': 3,
      'food_dining': 3,
      'family_friends': 2,
      'travel': 5,
      'shopping': 4,
      'work_career': 6,
      'health_fitness': 5,
      'weather': 3,
      'entertainment': 6,
      'education': 7,
      'technology': 8,
      'culture': 7,
      'current_events': 9
    }[topic] || 5;
    
    const levelMultiplier = level === 'beginner' ? 0.8 : level === 'intermediate' ? 1.0 : 1.2;
    return Math.min(10, Math.round(baseDifficulty * levelMultiplier));
  }

  private getExercisesForSkill(skill: string): string[] {
    const exercises: Record<string, string[]> = {
      grammar: ['Sentence construction', 'Verb conjugation', 'Tense practice'],
      vocabulary: ['Word association', 'Flashcards', 'Context usage'],
      listening: ['Audio comprehension', 'Dictation', 'Podcast practice'],
      speaking: ['Pronunciation drills', 'Conversation practice', 'Reading aloud'],
      reading: ['Text comprehension', 'Speed reading', 'Vocabulary in context'],
      writing: ['Essay practice', 'Grammar exercises', 'Creative writing']
    };
    
    return exercises[skill] || ['General practice'];
  }

  private getAllScenarios() {
    return [
      {
        scenario: 'Coffee shop conversation',
        difficulty: 3,
        skills_practiced: ['speaking', 'vocabulary'],
        description: 'Order coffee and have casual conversation'
      },
      {
        scenario: 'Job interview preparation',
        difficulty: 7,
        skills_practiced: ['speaking', 'grammar', 'vocabulary'],
        description: 'Practice professional communication'
      },
      {
        scenario: 'Travel planning discussion',
        difficulty: 5,
        skills_practiced: ['speaking', 'vocabulary'],
        description: 'Discuss travel destinations and plans'
      }
    ];
  }

  private getLevelDifficulty(level: string): number {
    return level === 'beginner' ? 4 : level === 'intermediate' ? 7 : 10;
  }
}
