'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationInterface from '@/components/conversation/ConversationInterface';
import Dashboard from '@/components/dashboard/Dashboard';
import { ConversationContext } from '@/lib/ai/conversation-engine';
import { GameProfile, Quest, GamificationEngine } from '@/lib/gamification/game-engine';
import { LearningProgress, AdaptiveLearningSystem } from '@/lib/learning/adaptive-system';
import toast from 'react-hot-toast';

type ViewType = 'dashboard' | 'conversation' | 'vocabulary' | 'grammar' | 'pronunciation';

export default function MainApp() {
  // State management
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // User data
  const [gameProfile, setGameProfile] = useState<GameProfile>({
    user_id: 'user_123',
    username: 'Language Learner',
    level: 5,
    total_xp: 1250,
    current_streak: 12,
    longest_streak: 18,
    badges: [],
    achievements: [],
    leaderboard_rank: 1247,
    league: 'silver',
    weekly_xp: 320,
    monthly_xp: 1250,
    friends: [],
    rivals: []
  });

  const [learningProgress, setLearningProgress] = useState<LearningProgress>({
    user_id: 'user_123',
    language: 'Spanish',
    current_level: 'intermediate',
    xp_points: 1250,
    streak_days: 12,
    last_activity: new Date(),
    topics_mastered: ['introductions', 'daily_routines', 'hobbies'],
    topics_in_progress: ['travel', 'food_dining'],
    weekly_goals: {
      target_minutes: 150,
      achieved_minutes: 98,
      target_conversations: 5,
      completed_conversations: 3
    },
    skill_scores: {
      grammar: 78,
      vocabulary: 82,
      listening: 75,
      speaking: 71,
      reading: 85,
      writing: 69
    },
    learning_preferences: {
      difficulty_preference: 'adaptive',
      session_length: 'medium',
      focus_areas: ['conversation', 'pronunciation'],
      preferred_times: ['morning', 'evening']
    }
  });

  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    learner_level: 'intermediate',
    target_language: 'Spanish',
    native_language: 'English',
    topics: ['travel', 'food_dining', 'work_career'],
    learning_goals: ['improve_speaking', 'expand_vocabulary'],
    conversation_history: []
  });

  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);

  // Initialize systems
  const [gamificationEngine, setGamificationEngine] = useState<GamificationEngine | null>(null);
  const [adaptiveLearningSystem, setAdaptiveLearningSystem] = useState<AdaptiveLearningSystem | null>(null);

  // Initialize the app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Initialize gamification engine
      const gameEngine = new GamificationEngine(gameProfile);
      setGamificationEngine(gameEngine);

      // Initialize adaptive learning system
      const learningSystem = new AdaptiveLearningSystem(gameProfile.user_id, learningProgress);
      setAdaptiveLearningSystem(learningSystem);

      // Generate daily quests
      const quests = gameEngine.generateDailyQuests();
      setDailyQuests(quests);

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      
      // Show welcome message
      toast.success(`Welcome back! You're on a ${gameProfile.current_streak}-day streak! 🔥`);
      
    } catch (error) {
      console.error('Error initializing app:', error);
      toast.error('Failed to initialize the app');
      setIsLoading(false);
    }
  };

  const handleStartConversation = () => {
    setCurrentView('conversation');
    toast.success('Starting conversation practice! 💬');
  };

  const handleStartLesson = (lessonType: string) => {
    setCurrentView(lessonType as ViewType);
    toast.success(`Starting ${lessonType} practice! 📚`);
  };

  const handleProgressUpdate = (progress: any) => {
    if (!gamificationEngine || !adaptiveLearningSystem) return;

    try {
      // Update game progress
      const gameUpdate = gamificationEngine.updateProgress(progress);
      
      // Update learning progress
      const learningUpdate = adaptiveLearningSystem.updateProgress(progress);
      
      // Update state
      setGameProfile(gameUpdate as any);
      setLearningProgress(learningUpdate);

      // Show notifications for achievements
      if (gameUpdate.new_achievements.length > 0) {
        gameUpdate.new_achievements.forEach(achievement => {
          toast.success(`🏆 Achievement unlocked: ${achievement.name}!`);
        });
      }

      if (gameUpdate.new_badges.length > 0) {
        gameUpdate.new_badges.forEach(badge => {
          toast.success(`🎖️ New badge earned: ${badge.name}!`);
        });
      }

      if (gameUpdate.level_up) {
        toast.success(`🎉 Level up! You're now level ${gameUpdate.new_level}!`);
      }

    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🌟
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Your Learning Journey...
          </h2>
          
          <p className="text-gray-600 mb-6">
            Preparing your personalized experience
          </p>
          
          <div className="flex justify-center">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-purple-500 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-purple-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">🌟</span>
                <span>LinguaAI</span>
              </motion.button>
              
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
                <span>Level {gameProfile.level}</span>
                <span className="mx-2">•</span>
                <span>{gameProfile.total_xp.toLocaleString()} XP</span>
                <span className="mx-2">•</span>
                <span className="flex items-center gap-1">
                  🔥 {gameProfile.current_streak} day streak
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {learningProgress.weekly_goals.achieved_minutes}/{learningProgress.weekly_goals.target_minutes}min this week
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {learningProgress.weekly_goals.completed_conversations}/{learningProgress.weekly_goals.target_conversations} conversations
                  </span>
                </div>
              </div>

              {/* View Indicators */}
              <div className="flex items-center gap-2">
                {currentView !== 'dashboard' && (
                  <motion.button
                    onClick={handleBackToDashboard}
                    className="px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Dashboard
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard
                gameProfile={gameProfile}
                learningProgress={learningProgress}
                quests={dailyQuests}
                onStartConversation={handleStartConversation}
                onStartLesson={handleStartLesson}
              />
            </motion.div>
          )}

          {currentView === 'conversation' && (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-80px)]"
            >
              <ConversationInterface
                initialContext={conversationContext}
                onProgressUpdate={handleProgressUpdate}
                onAchievement={(achievement) => toast.success(`🏆 ${achievement}`)}
              />
            </motion.div>
          )}

          {(currentView === 'vocabulary' || currentView === 'grammar' || currentView === 'pronunciation') && (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                  <div className="text-6xl mb-4">
                    {currentView === 'vocabulary' ? '📚' : 
                     currentView === 'grammar' ? '✍️' : '🎤'}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-800 mb-4 capitalize">
                    {currentView} Practice
                  </h2>
                  
                  <p className="text-gray-600 mb-8">
                    This feature is coming soon! For now, enjoy the conversation practice.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      onClick={handleBackToDashboard}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back to Dashboard
                    </motion.button>
                    
                    <motion.button
                      onClick={handleStartConversation}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Conversation Instead
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
