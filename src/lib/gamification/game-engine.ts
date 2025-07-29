import { z } from 'zod';

// Gamification and Achievement System
export interface GameProfile {
  user_id: string;
  username: string;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  badges: Badge[];
  achievements: Achievement[];
  leaderboard_rank: number;
  league: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  weekly_xp: number;
  monthly_xp: number;
  friends: string[];
  rivals: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'conversation' | 'achievement' | 'skill' | 'social' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned_date: Date;
  xp_reward: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  is_completed: boolean;
  completion_date?: Date;
  reward_xp: number;
  reward_badge?: string;
  tier: 1 | 2 | 3 | 4 | 5; // Progressive tiers
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  objectives: QuestObjective[];
  reward_xp: number;
  reward_items?: string[];
  expires_at?: Date;
  is_completed: boolean;
  progress: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  target_value: number;
  current_value: number;
  is_completed: boolean;
  objective_type: 'conversation_minutes' | 'messages_sent' | 'accuracy_rate' | 'vocabulary_learned' | 'streak_maintained';
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  xp: number;
  rank: number;
  league: string;
  streak: number;
  avatar?: string;
  country?: string;
}

export interface GameReward {
  type: 'xp' | 'badge' | 'achievement' | 'item' | 'boost';
  value: number | string;
  description: string;
  rarity?: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  effect: 'double_xp' | 'streak_freeze' | 'mistake_protection' | 'hint_boost' | 'time_extension';
  duration_minutes?: number;
  uses_remaining: number;
  expires_at?: Date;
}

export class GamificationEngine {
  private userProfile: GameProfile;

  constructor(userProfile: GameProfile) {
    this.userProfile = userProfile;
  }

  /**
   * Calculate XP rewards for learning activities
   */
  calculateXPReward(activity: {
    type: 'conversation' | 'vocabulary' | 'grammar' | 'pronunciation' | 'achievement';
    duration_minutes?: number;
    accuracy_rate?: number;
    difficulty_level?: number;
    streak_multiplier?: boolean;
  }): number {
    let baseXP = 0;

    // Base XP by activity type
    switch (activity.type) {
      case 'conversation':
        baseXP = Math.floor((activity.duration_minutes || 5) * 2);
        break;
      case 'vocabulary':
        baseXP = 10;
        break;
      case 'grammar':
        baseXP = 15;
        break;
      case 'pronunciation':
        baseXP = 12;
        break;
      case 'achievement':
        baseXP = 50;
        break;
    }

    // Accuracy multiplier
    if (activity.accuracy_rate) {
      const accuracyMultiplier = Math.max(0.5, activity.accuracy_rate / 100);
      baseXP = Math.floor(baseXP * accuracyMultiplier);
    }

    // Difficulty multiplier
    if (activity.difficulty_level) {
      const difficultyMultiplier = 1 + (activity.difficulty_level - 5) * 0.1;
      baseXP = Math.floor(baseXP * difficultyMultiplier);
    }

    // Streak multiplier
    if (activity.streak_multiplier && this.userProfile.current_streak >= 7) {
      const streakBonus = Math.min(0.5, this.userProfile.current_streak * 0.02);
      baseXP = Math.floor(baseXP * (1 + streakBonus));
    }

    return Math.max(1, baseXP);
  }

  /**
   * Update user progress and check for achievements
   */
  updateProgress(activity: {
    type: string;
    xp_earned: number;
    duration_minutes?: number;
    accuracy_rate?: number;
    new_words_learned?: number;
    mistakes_count?: number;
  }): {
    new_achievements: Achievement[];
    new_badges: Badge[];
    level_up: boolean;
    new_level?: number;
    rewards: GameReward[];
  } {
    const result = {
      new_achievements: [] as Achievement[],
      new_badges: [] as Badge[],
      level_up: false,
      new_level: undefined as number | undefined,
      rewards: [] as GameReward[]
    };

    // Update XP
    this.userProfile.total_xp += activity.xp_earned;
    this.userProfile.weekly_xp += activity.xp_earned;
    this.userProfile.monthly_xp += activity.xp_earned;

    // Check for level up
    const newLevel = this.calculateLevel(this.userProfile.total_xp);
    if (newLevel > this.userProfile.level) {
      result.level_up = true;
      result.new_level = newLevel;
      this.userProfile.level = newLevel;
      
      // Add level up rewards
      result.rewards.push({
        type: 'xp',
        value: newLevel * 10,
        description: `Level ${newLevel} bonus!`
      });
    }

    // Check for new achievements
    const newAchievements = this.checkAchievements(activity);
    result.new_achievements = newAchievements;

    // Check for new badges
    const newBadges = this.checkBadges(activity, newAchievements);
    result.new_badges = newBadges;

    // Add badge rewards
    newBadges.forEach(badge => {
      result.rewards.push({
        type: 'badge',
        value: badge.id,
        description: `Earned ${badge.name} badge!`,
        rarity: badge.rarity
      });
    });

    return result;
  }

  /**
   * Generate daily quests for the user
   */
  generateDailyQuests(): Quest[] {
    const quests: Quest[] = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Quest 1: Conversation practice
    quests.push({
      id: `daily_conversation_${today.toISOString().split('T')[0]}`,
      name: 'Conversation Master',
      description: 'Have meaningful conversations for 15 minutes',
      type: 'daily',
      objectives: [{
        id: 'conv_minutes',
        description: 'Practice conversation for 15 minutes',
        target_value: 15,
        current_value: 0,
        is_completed: false,
        objective_type: 'conversation_minutes'
      }],
      reward_xp: 100,
      expires_at: tomorrow,
      is_completed: false,
      progress: 0
    });

    // Quest 2: Accuracy challenge
    quests.push({
      id: `daily_accuracy_${today.toISOString().split('T')[0]}`,
      name: 'Accuracy Expert',
      description: 'Achieve 85% accuracy in conversations',
      type: 'daily',
      objectives: [{
        id: 'accuracy_rate',
        description: 'Maintain 85% accuracy',
        target_value: 85,
        current_value: 0,
        is_completed: false,
        objective_type: 'accuracy_rate'
      }],
      reward_xp: 150,
      expires_at: tomorrow,
      is_completed: false,
      progress: 0
    });

    // Quest 3: Vocabulary builder
    quests.push({
      id: `daily_vocabulary_${today.toISOString().split('T')[0]}`,
      name: 'Word Collector',
      description: 'Learn 10 new words today',
      type: 'daily',
      objectives: [{
        id: 'vocab_learned',
        description: 'Learn 10 new words',
        target_value: 10,
        current_value: 0,
        is_completed: false,
        objective_type: 'vocabulary_learned'
      }],
      reward_xp: 80,
      expires_at: tomorrow,
      is_completed: false,
      progress: 0
    });

    return quests;
  }

  /**
   * Generate weekly challenges
   */
  generateWeeklyChallenge(): Quest {
    const monday = this.getStartOfWeek(new Date());
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    return {
      id: `weekly_challenge_${monday.toISOString().split('T')[0]}`,
      name: 'Weekly Warrior',
      description: 'Complete your learning goals this week',
      type: 'weekly',
      objectives: [
        {
          id: 'weekly_xp',
          description: 'Earn 1000 XP this week',
          target_value: 1000,
          current_value: this.userProfile.weekly_xp,
          is_completed: false,
          objective_type: 'conversation_minutes'
        },
        {
          id: 'weekly_streak',
          description: 'Maintain your streak for 7 days',
          target_value: 7,
          current_value: Math.min(this.userProfile.current_streak, 7),
          is_completed: false,
          objective_type: 'streak_maintained'
        }
      ],
      reward_xp: 500,
      reward_items: ['streak_freeze'],
      expires_at: nextMonday,
      is_completed: false,
      progress: 0
    };
  }

  /**
   * Get user's position in leaderboards
   */
  getLeaderboardPosition(leaderboard: LeaderboardEntry[], timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'): {
    position: number;
    total_users: number;
    nearby_users: LeaderboardEntry[];
    user_entry: LeaderboardEntry;
  } {
    const userIndex = leaderboard.findIndex(entry => entry.user_id === this.userProfile.user_id);
    
    if (userIndex === -1) {
      throw new Error('User not found in leaderboard');
    }

    const position = userIndex + 1;
    const total_users = leaderboard.length;
    
    // Get nearby users (2 above, 2 below)
    const start = Math.max(0, userIndex - 2);
    const end = Math.min(leaderboard.length, userIndex + 3);
    const nearby_users = leaderboard.slice(start, end);

    return {
      position,
      total_users,
      nearby_users,
      user_entry: leaderboard[userIndex]
    };
  }

  /**
   * Calculate league progression
   */
  calculateLeagueProgression(): {
    current_league: string;
    xp_in_league: number;
    xp_to_next_league: number;
    next_league?: string;
    can_promote: boolean;
    can_demote: boolean;
  } {
    const leagues = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const leagueThresholds = [0, 1000, 3000, 7000, 15000, 30000];
    
    const currentLeagueIndex = leagues.indexOf(this.userProfile.league);
    const currentThreshold = leagueThresholds[currentLeagueIndex];
    const nextThreshold = leagueThresholds[currentLeagueIndex + 1];
    
    const xp_in_league = this.userProfile.weekly_xp - currentThreshold;
    const xp_to_next_league = nextThreshold ? nextThreshold - this.userProfile.weekly_xp : 0;
    
    return {
      current_league: this.userProfile.league,
      xp_in_league,
      xp_to_next_league,
      next_league: currentLeagueIndex < leagues.length - 1 ? leagues[currentLeagueIndex + 1] : undefined,
      can_promote: this.userProfile.weekly_xp >= (nextThreshold || Infinity),
      can_demote: currentLeagueIndex > 0 && this.userProfile.weekly_xp < currentThreshold * 0.8
    };
  }

  /**
   * Use power-ups
   */
  usePowerUp(powerUpId: string): {
    success: boolean;
    effect: string;
    duration?: number;
    message: string;
  } {
    // This would integrate with a power-up inventory system
    const powerUp = this.getUserPowerUp(powerUpId);
    
    if (!powerUp || powerUp.uses_remaining <= 0) {
      return {
        success: false,
        effect: '',
        message: 'Power-up not available'
      };
    }

    // Apply power-up effect
    powerUp.uses_remaining--;
    
    let message = '';
    switch (powerUp.effect) {
      case 'double_xp':
        message = 'Double XP active for the next session!';
        break;
      case 'streak_freeze':
        message = 'Streak freeze applied - your streak is protected!';
        break;
      case 'mistake_protection':
        message = 'Mistake protection active - errors won\'t count against you!';
        break;
      case 'hint_boost':
        message = 'Hint boost active - get extra help when needed!';
        break;
      case 'time_extension':
        message = 'Time extension active - take your time!';
        break;
    }

    return {
      success: true,
      effect: powerUp.effect,
      duration: powerUp.duration_minutes,
      message
    };
  }

  /**
   * Get personalized motivational messages
   */
  getMotivationalMessage(): string {
    const messages = {
      streak_high: [
        `🔥 Amazing ${this.userProfile.current_streak}-day streak! You're on fire!`,
        `⚡ ${this.userProfile.current_streak} days strong! Keep the momentum going!`,
        `🌟 Your ${this.userProfile.current_streak}-day dedication is inspiring!`
      ],
      streak_low: [
        '🌱 Every expert was once a beginner. Start your streak today!',
        '💪 Consistency beats perfection. Begin your learning journey!',
        '🎯 Small daily efforts lead to big achievements!'
      ],
      level_milestone: [
        `🏆 Level ${this.userProfile.level} achieved! You're making incredible progress!`,
        `⭐ Welcome to Level ${this.userProfile.level}! Your hard work is paying off!`,
        `🎉 Level ${this.userProfile.level} unlocked! Keep pushing your limits!`
      ],
      encouragement: [
        '🚀 Every conversation makes you stronger!',
        '📈 Your improvement is remarkable! Keep going!',
        '💫 Practice makes progress, and you\'re proof of that!',
        '🌍 You\'re not just learning a language, you\'re opening doors!'
      ]
    };

    if (this.userProfile.current_streak >= 7) {
      return this.getRandomMessage(messages.streak_high);
    } else if (this.userProfile.current_streak === 0) {
      return this.getRandomMessage(messages.streak_low);
    } else if (this.userProfile.level % 5 === 0) {
      return this.getRandomMessage(messages.level_milestone);
    } else {
      return this.getRandomMessage(messages.encouragement);
    }
  }

  private calculateLevel(totalXP: number): number {
    // Level calculation: Each level requires more XP
    // Level 1: 0-100 XP, Level 2: 100-250 XP, Level 3: 250-450 XP, etc.
    let level = 1;
    let xpRequired = 0;
    const baseXP = 100;

    while (totalXP >= xpRequired) {
      xpRequired += baseXP + (level - 1) * 50;
      if (totalXP >= xpRequired) {
        level++;
      }
    }

    return level;
  }

  private checkAchievements(activity: any): Achievement[] {
    const newAchievements: Achievement[] = [];

    // Example achievements - would be expanded significantly
    const achievementChecks = [
      {
        id: 'first_conversation',
        name: 'First Words',
        condition: () => activity.type === 'conversation',
        target: 1,
        reward_xp: 50
      },
      {
        id: 'streak_week',
        name: 'Week Warrior',
        condition: () => this.userProfile.current_streak >= 7,
        target: 7,
        reward_xp: 200
      },
      {
        id: 'accuracy_master',
        name: 'Accuracy Master',
        condition: () => (activity.accuracy_rate || 0) >= 95,
        target: 95,
        reward_xp: 150
      }
    ];

    achievementChecks.forEach(check => {
      const existing = this.userProfile.achievements.find(a => a.id === check.id);
      if (!existing && check.condition()) {
        newAchievements.push({
          id: check.id,
          name: check.name,
          description: `Achievement: ${check.name}`,
          category: 'general',
          progress: check.target,
          target: check.target,
          is_completed: true,
          completion_date: new Date(),
          reward_xp: check.reward_xp,
          tier: 1
        });
      }
    });

    // Add to user profile
    this.userProfile.achievements.push(...newAchievements);

    return newAchievements;
  }

  private checkBadges(activity: any, achievements: Achievement[]): Badge[] {
    const newBadges: Badge[] = [];

    // Award badges for achievements
    achievements.forEach(achievement => {
      const badge: Badge = {
        id: `badge_${achievement.id}`,
        name: achievement.name,
        description: `Earned for: ${achievement.description}`,
        icon: this.getBadgeIcon(achievement.category),
        category: 'achievement',
        rarity: 'common',
        earned_date: new Date(),
        xp_reward: achievement.reward_xp
      };
      newBadges.push(badge);
    });

    // Add to user profile
    this.userProfile.badges.push(...newBadges);

    return newBadges;
  }

  private getBadgeIcon(category: string): string {
    const icons: Record<string, string> = {
      general: '🏆',
      conversation: '💬',
      streak: '🔥',
      accuracy: '🎯',
      vocabulary: '📚',
      grammar: '✍️'
    };
    return icons[category] || '⭐';
  }

  private getUserPowerUp(powerUpId: string): PowerUp | null {
    // This would integrate with user's power-up inventory
    // For now, return a mock power-up
    return {
      id: powerUpId,
      name: 'Double XP',
      description: 'Double XP for the next session',
      effect: 'double_xp',
      duration_minutes: 60,
      uses_remaining: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Public getters
  public getProfile(): GameProfile {
    return { ...this.userProfile };
  }

  public getXP(): number {
    return this.userProfile.total_xp;
  }

  public getLevel(): number {
    return this.userProfile.level;
  }

  public getStreak(): number {
    return this.userProfile.current_streak;
  }

  public getBadges(): Badge[] {
    return [...this.userProfile.badges];
  }

  public getAchievements(): Achievement[] {
    return [...this.userProfile.achievements];
  }
}
