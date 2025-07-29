'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar, 
  Users, 
  Star,
  BookOpen,
  Mic,
  MessageCircle,
  Award,
  Zap
} from 'lucide-react';
import { GameProfile, Quest, Achievement, Badge } from '@/lib/gamification/game-engine';
import { LearningProgress } from '@/lib/learning/adaptive-system';

interface DashboardProps {
  gameProfile: GameProfile;
  learningProgress: LearningProgress;
  quests: Quest[];
  onStartConversation: () => void;
  onStartLesson: (type: string) => void;
}

export default function Dashboard({ 
  gameProfile, 
  learningProgress, 
  quests,
  onStartConversation,
  onStartLesson 
}: DashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showAchievements, setShowAchievements] = useState(false);

  // Calculate progress to next level
  const getXPToNextLevel = () => {
    const currentLevel = gameProfile.level;
    const baseXP = 100;
    const nextLevelXP = Array.from({ length: currentLevel }, (_, i) => baseXP + i * 50)
      .reduce((sum, xp) => sum + xp, 0);
    const currentLevelXP = Array.from({ length: currentLevel - 1 }, (_, i) => baseXP + i * 50)
      .reduce((sum, xp) => sum + xp, 0);
    
    return {
      current: gameProfile.total_xp - currentLevelXP,
      total: nextLevelXP - currentLevelXP,
      percentage: ((gameProfile.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    };
  };

  const levelProgress = getXPToNextLevel();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {gameProfile.username}! 👋
              </h1>
              <p className="text-gray-600">
                Continue your {learningProgress.language} learning journey
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  Level {gameProfile.level}
                </div>
                <div className="text-sm text-gray-500">
                  {gameProfile.total_xp.toLocaleString()} XP
                </div>
              </div>
              
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {gameProfile.level}
              </div>
            </div>
          </div>
          
          {/* Level Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress to Level {gameProfile.level + 1}</span>
              <span>{levelProgress.current}/{levelProgress.total} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" as const }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Streak Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {gameProfile.current_streak}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">Day Streak</h3>
            <p className="text-sm text-gray-600">
              Best: {gameProfile.longest_streak} days
            </p>
          </div>

          {/* XP Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {gameProfile.weekly_xp}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">Weekly XP</h3>
            <p className="text-sm text-gray-600">
              {((gameProfile.weekly_xp / learningProgress.weekly_goals.target_minutes) * 100).toFixed(0)}% of goal
            </p>
          </div>

          {/* League Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600 capitalize">
                {gameProfile.league}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">League</h3>
            <p className="text-sm text-gray-600">
              Rank #{gameProfile.leaderboard_rank}
            </p>
          </div>

          {/* Skills Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {Object.values(learningProgress.skill_scores).reduce((a, b) => a + b, 0) / Object.keys(learningProgress.skill_scores).length}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">Avg. Skill</h3>
            <p className="text-sm text-gray-600">
              All skills combined
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Continue Learning</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={onStartConversation}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Start Conversation</div>
                    <div className="text-sm opacity-90">Practice speaking</div>
                  </div>
                </button>

                <button
                  onClick={() => onStartLesson('vocabulary')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Learn Vocabulary</div>
                    <div className="text-sm opacity-90">Expand your words</div>
                  </div>
                </button>

                <button
                  onClick={() => onStartLesson('pronunciation')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Mic className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Pronunciation</div>
                    <div className="text-sm opacity-90">Perfect your accent</div>
                  </div>
                </button>

                <button
                  onClick={() => onStartLesson('grammar')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Target className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Grammar Practice</div>
                    <div className="text-sm opacity-90">Master structure</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Skill Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Skill Progress</h3>
              
              <div className="space-y-4">
                {Object.entries(learningProgress.skill_scores).map(([skill, score]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      <span className="font-medium text-gray-700 capitalize">{skill}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-10">
                        {Math.round(score)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Daily Quests */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Daily Quests</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {quests.filter(q => q.type === 'daily').map((quest) => (
                  <div key={quest.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700 text-sm">
                        {quest.name}
                      </span>
                      <span className="text-xs text-purple-600 font-semibold">
                        +{quest.reward_xp} XP
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      {quest.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Badges</h3>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {gameProfile.badges.slice(-3).map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 text-sm">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {badge.earned_date.toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                      badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {badge.rarity}
                    </div>
                  </div>
                ))}
                
                {gameProfile.badges.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-sm">
                      Complete activities to earn badges!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Community</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Friends</span>
                  <span className="font-semibold text-gray-800">
                    {gameProfile.friends.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Global Rank</span>
                  <span className="font-semibold text-gray-800">
                    #{gameProfile.leaderboard_rank.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold text-green-600">
                    +{gameProfile.weekly_xp} XP
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
