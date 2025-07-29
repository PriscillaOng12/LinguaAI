'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw, Star, Zap } from 'lucide-react';
import { ConversationEngine, ConversationMessage, ConversationContext } from '@/lib/ai/conversation-engine';
import { VoiceHandler, SpeechConfig } from '@/lib/voice/voice-handler';
import { RealTimeFeedback } from '@/lib/realtime/websocket-server';
import toast from 'react-hot-toast';

interface ConversationInterfaceProps {
  initialContext: ConversationContext;
  onProgressUpdate?: (progress: any) => void;
  onAchievement?: (achievement: string) => void;
}

export default function ConversationInterface({ 
  initialContext, 
  onProgressUpdate, 
  onAchievement 
}: ConversationInterfaceProps) {
  // State management
  const [context, setContext] = useState<ConversationContext>(initialContext);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [realTimeFeedback, setRealTimeFeedback] = useState<RealTimeFeedback[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    messagesCount: 0,
    accuracy: 0,
    wordsLearned: 0,
    sessionTime: 0
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationEngine = useRef<ConversationEngine | null>(null);
  const voiceHandler = useRef<VoiceHandler | null>(null);
  const sessionStartTime = useRef<Date>(new Date());

  // Initialize conversation engine and voice handler
  useEffect(() => {
    conversationEngine.current = new ConversationEngine(context);
    
    if (voiceEnabled) {
      const speechConfig: SpeechConfig = {
        language: context.target_language === 'spanish' ? 'es-ES' : 'en-US',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
      };
      
      voiceHandler.current = new VoiceHandler(speechConfig);
    }

    // Generate initial conversation starter
    generateConversationStarter();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update session time
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000 / 60);
      setSessionStats(prev => ({ ...prev, sessionTime: elapsed }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const generateConversationStarter = async () => {
    if (!conversationEngine.current) return;

    try {
      const starters = await conversationEngine.current.generateConversationStarters();
      if (starters.length > 0) {
        const starter = starters[Math.floor(Math.random() * starters.length)];
        const aiMessage: ConversationMessage = {
          id: `starter_${Date.now()}`,
          role: 'assistant',
          content: starter,
          timestamp: new Date()
        };
        setMessages([aiMessage]);
        
        // Speak the starter if voice is enabled
        if (voiceEnabled && voiceHandler.current) {
          await voiceHandler.current.speak(starter);
        }
      }
    } catch (error) {
      console.error('Error generating conversation starter:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationEngine.current || isLoading) return;

    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Generate AI response
      const aiResponse = await conversationEngine.current.generateResponse(inputText);
      setMessages(prev => [...prev, aiResponse]);

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        messagesCount: prev.messagesCount + 1,
        accuracy: aiResponse.metadata?.confidence || prev.accuracy
      }));

      // Speak AI response if voice is enabled
      if (voiceEnabled && voiceHandler.current && !isSpeaking) {
        setIsSpeaking(true);
        await voiceHandler.current.speak(aiResponse.content);
        setIsSpeaking(false);
      }

      // Show real-time feedback if available
      if (aiResponse.metadata?.corrections?.length) {
        setRealTimeFeedback([{
          type: 'grammar',
          message: aiResponse.metadata.grammar_feedback || 'Good job!',
          severity: 'info',
          suggestions: aiResponse.metadata.corrections,
          timestamp: new Date()
        }]);
        setShowFeedback(true);
      }

      // Update conversation context
      setContext(prev => ({
        ...prev,
        conversation_history: [...prev.conversation_history, userMessage, aiResponse]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceHandler.current) {
      toast.error('Voice input not available');
      return;
    }

    if (isListening) {
      voiceHandler.current.stopListening();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        await voiceHandler.current.startListening(
          (text, confidence) => {
            setInputText(text);
            setIsListening(false);
            
            // Auto-send if confidence is high
            if (confidence > 0.8) {
              setTimeout(() => handleSendMessage(), 500);
            }
          },
          (activity) => {
            // Handle voice activity updates
            console.log('Voice activity:', activity);
          }
        );
      } catch (error) {
        console.error('Voice input error:', error);
        toast.error('Voice input failed');
        setIsListening(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking && voiceHandler.current) {
      voiceHandler.current.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const restartConversation = () => {
    setMessages([]);
    setInputText('');
    setRealTimeFeedback([]);
    setShowFeedback(false);
    sessionStartTime.current = new Date();
    setSessionStats({
      messagesCount: 0,
      accuracy: 0,
      wordsLearned: 0,
      sessionTime: 0
    });
    
    if (conversationEngine.current) {
      conversationEngine.current.clearHistory();
      generateConversationStarter();
    }
  };

  const getMessageVariants = (role: 'user' | 'assistant') => ({
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    transition: { duration: 0.3, ease: "easeOut" as const }
  });

  const renderMessage = (message: ConversationMessage) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
      <motion.div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        {...getMessageVariants(message.role as 'user' | 'assistant')}
      >
        <div className={`
          max-w-[80%] rounded-2xl px-4 py-3 shadow-lg
          ${isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : isSystem
            ? 'bg-gray-100 text-gray-700 border-l-4 border-blue-400'
            : 'bg-white text-gray-800 border border-gray-200'
          }
        `}>
          <p className="text-sm md:text-base leading-relaxed">
            {message.content}
          </p>
          
          {message.metadata && (
            <div className="mt-2 pt-2 border-t border-opacity-20 border-white">
              {message.metadata.confidence && (
                <div className="flex items-center gap-2 text-xs opacity-75">
                  <Star className="w-3 h-3" />
                  <span>Confidence: {(message.metadata.confidence * 100).toFixed(0)}%</span>
                </div>
              )}
              
              {message.metadata.corrections && message.metadata.corrections.length > 0 && (
                <div className="mt-1 text-xs opacity-75">
                  <span>💡 {message.metadata.corrections.join(', ')}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-1 text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Conversation Practice
            </h2>
            <p className="text-sm text-gray-600">
              Level: {context.learner_level} • Language: {context.target_language}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Session Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mr-4">
              <span>💬 {sessionStats.messagesCount}</span>
              <span>⏱️ {sessionStats.sessionTime}m</span>
              <span>🎯 {sessionStats.accuracy.toFixed(0)}%</span>
            </div>
            
            {/* Controls */}
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}
              title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
              onClick={restartConversation}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Restart conversation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Real-time Feedback */}
      <AnimatePresence>
        {showFeedback && realTimeFeedback.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">Real-time Feedback</h4>
                {realTimeFeedback.map((feedback, index) => (
                  <div key={index} className="mt-1">
                    <p className="text-sm text-blue-700">{feedback.message}</p>
                    {feedback.suggestions && feedback.suggestions.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Try: {feedback.suggestions.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isLoading || isListening}
            />
            
            {voiceEnabled && (
              <button
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-center">
            <span className="text-sm text-red-600 animate-pulse">
              🎤 Listening... Speak now
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
