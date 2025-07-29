import { GameProfile, Badge, Achievement, Quest, QuestObjective } from '@/lib/gamification/game-engine';

/**
 * Mock data service for testing gamification features
 */
export class MockGameDataService {
  private static instance: MockGameDataService;
  private mockProfile: GameProfile;

  private constructor() {
    this.mockProfile = this.createMockProfile();
  }

  static getInstance(): MockGameDataService {
    if (!MockGameDataService.instance) {
      MockGameDataService.instance = new MockGameDataService();
    }
    return MockGameDataService.instance;
  }

  private createMockProfile(): GameProfile {
    const badges: Badge[] = [
      {
        id: 'first_conversation',
        name: 'First Chat',
        description: 'Started your first conversation',
        icon: '🗣️',
        category: 'conversation',
        rarity: 'common',
        earned_date: new Date(Date.now() - 86400000), // Yesterday
        xp_reward: 50
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'uncommon',
        earned_date: new Date(Date.now() - 172800000), // 2 days ago
        xp_reward: 100
      }
    ];

    const achievements: Achievement[] = [
      {
        id: 'conversation_master',
        name: 'Conversation Master',
        description: 'Complete 100 conversations',
        category: 'conversation',
        progress: 23,
        target: 100,
        is_completed: false,
        reward_xp: 500,
        reward_badge: 'conversation_champion',
        tier: 3
      },
      {
        id: 'pronunciation_pro',
        name: 'Pronunciation Pro',
        description: 'Achieve 90%+ pronunciation score 10 times',
        category: 'skill',
        progress: 6,
        target: 10,
        is_completed: false,
        reward_xp: 300,
        reward_badge: 'speech_master',
        tier: 2
      },
      {
        id: 'daily_learner',
        name: 'Daily Learner',
        description: 'Practice for 30 consecutive days',
        category: 'streak',
        progress: 12,
        target: 30,
        is_completed: false,
        reward_xp: 1000,
        reward_badge: 'consistency_king',
        tier: 4
      }
    ];

    return {
      user_id: 'mock-user',
      username: 'Language Learner',
      level: 8,
      total_xp: 2450,
      current_streak: 12,
      longest_streak: 18,
      badges,
      achievements,
      leaderboard_rank: 47,
      league: 'silver',
      weekly_xp: 385,
      monthly_xp: 1240,
      friends: ['friend1', 'friend2', 'friend3'],
      rivals: ['rival1', 'rival2']
    };
  }

  getMockProfile(): GameProfile {
    return { ...this.mockProfile };
  }

  updateProfile(updates: Partial<GameProfile>): GameProfile {
    this.mockProfile = { ...this.mockProfile, ...updates };
    return this.getMockProfile();
  }

  addXP(amount: number): GameProfile {
    this.mockProfile.total_xp += amount;
    this.mockProfile.weekly_xp += amount;
    this.mockProfile.monthly_xp += amount;
    
    // Level up calculation (simple formula: level = floor(sqrt(total_xp / 100)))
    const newLevel = Math.floor(Math.sqrt(this.mockProfile.total_xp / 100));
    if (newLevel > this.mockProfile.level) {
      this.mockProfile.level = newLevel;
    }
    
    return this.getMockProfile();
  }

  getMockQuests(): Quest[] {
    return [
      {
        id: 'daily_chat',
        name: 'Daily Chat',
        description: 'Have a conversation today',
        type: 'daily',
        objectives: [
          {
            id: 'chat_obj_1',
            description: 'Complete one conversation',
            target_value: 1,
            current_value: 0,
            is_completed: false,
            objective_type: 'conversation_minutes'
          }
        ],
        reward_xp: 50,
        reward_items: undefined,
        expires_at: new Date(Date.now() + 86400000), // Tomorrow
        is_completed: false,
        progress: 0
      },
      {
        id: 'vocabulary_practice',
        name: 'Vocabulary Builder',
        description: 'Learn 5 new words today',
        type: 'daily',
        objectives: [
          {
            id: 'vocab_obj_1',
            description: 'Learn new vocabulary words',
            target_value: 5,
            current_value: 2,
            is_completed: false,
            objective_type: 'vocabulary_learned'
          }
        ],
        reward_xp: 75,
        reward_items: undefined,
        expires_at: new Date(Date.now() + 86400000),
        is_completed: false,
        progress: 40 // 2/5 = 40%
      },
      {
        id: 'perfect_pronunciation',
        name: 'Perfect Pronunciation',
        description: 'Achieve 95%+ accuracy in conversation',
        type: 'daily',
        objectives: [
          {
            id: 'pronunciation_obj_1',
            description: 'Maintain high accuracy',
            target_value: 95,
            current_value: 0,
            is_completed: false,
            objective_type: 'accuracy_rate'
          }
        ],
        reward_xp: 100,
        reward_items: undefined,
        expires_at: new Date(Date.now() + 86400000),
        is_completed: false,
        progress: 0
      }
    ];
  }

  getMockLeaderboard(): Array<{ username: string; xp: number; level: number; rank: number }> {
    return [
      { username: 'LanguageMaster99', xp: 5420, level: 15, rank: 1 },
      { username: 'ChatExpert', xp: 4890, level: 14, rank: 2 },
      { username: 'VocabularyVirtuoso', xp: 4350, level: 13, rank: 3 },
      { username: 'GrammarGuru', xp: 3980, level: 12, rank: 4 },
      { username: 'PronunciationPro', xp: 3720, level: 12, rank: 5 },
      // ... more entries
      { username: 'Language Learner', xp: 2450, level: 8, rank: 47 }, // Current user
    ];
  }

  completeQuest(questId: string): { quest: Quest; xpEarned: number; badgeEarned?: Badge } {
    const quests = this.getMockQuests();
    const quest = quests.find(q => q.id === questId);
    
    if (!quest) {
      throw new Error('Quest not found');
    }

    // Complete all objectives
    quest.objectives.forEach(obj => {
      obj.current_value = obj.target_value;
      obj.is_completed = true;
    });
    
    quest.progress = 100;
    quest.is_completed = true;

    const xpEarned = quest.reward_xp;
    this.addXP(xpEarned);

    // Award badge based on quest type
    let badgeEarned: Badge | undefined;
    if (questId === 'perfect_pronunciation') {
      badgeEarned = this.createMockBadge('speech_master');
    }

    return {
      quest,
      xpEarned,
      badgeEarned
    };
  }

  private createMockBadge(badgeId: string): Badge {
    const badgeTemplates: { [key: string]: Omit<Badge, 'id' | 'earned_date'> } = {
      'conversation_champion': {
        name: 'Conversation Champion',
        description: 'Master of conversations',
        icon: '🏆',
        category: 'conversation',
        rarity: 'epic',
        xp_reward: 200
      },
      'speech_master': {
        name: 'Speech Master',
        description: 'Perfect pronunciation expert',
        icon: '🎯',
        category: 'skill',
        rarity: 'rare',
        xp_reward: 150
      },
      'consistency_king': {
        name: 'Consistency King',
        description: 'Never missed a day',
        icon: '👑',
        category: 'streak',
        rarity: 'legendary',
        xp_reward: 300
      }
    };

    const template = badgeTemplates[badgeId];
    if (!template) {
      throw new Error('Badge template not found');
    }

    return {
      id: badgeId,
      earned_date: new Date(),
      ...template
    };
  }
}

export const mockGameData = MockGameDataService.getInstance();
