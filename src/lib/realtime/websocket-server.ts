import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ConversationMessage, ConversationContext } from '../ai/conversation-engine';
import { LearningSession, LearningProgress } from '../learning/adaptive-system';

// Real-time communication types
export interface RealTimeUser {
  id: string;
  socket_id: string;
  username: string;
  learning_language: string;
  current_level: string;
  is_active: boolean;
  last_seen: Date;
}

export interface LiveConversationRoom {
  id: string;
  participants: RealTimeUser[];
  language: string;
  topic: string;
  difficulty_level: number;
  created_at: Date;
  is_active: boolean;
  max_participants: number;
}

export interface RealTimeFeedback {
  type: 'grammar' | 'pronunciation' | 'vocabulary' | 'fluency' | 'encouragement';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  suggestions?: string[];
  timestamp: Date;
}

export interface PresenceUpdate {
  user_id: string;
  status: 'online' | 'learning' | 'conversation' | 'away' | 'offline';
  current_activity?: string;
  last_activity: Date;
}

export class RealTimeServer {
  private io: SocketIOServer;
  private activeUsers: Map<string, RealTimeUser> = new Map();
  private conversationRooms: Map<string, LiveConversationRoom> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user authentication and setup
      socket.on('authenticate', async (data: { userId: string; userInfo: any }) => {
        await this.handleUserAuthentication(socket, data);
      });

      // Handle joining conversation rooms
      socket.on('join_conversation_room', async (data: { roomId?: string; preferences: any }) => {
        await this.handleJoinConversationRoom(socket, data);
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation_room', async (data: { roomId: string }) => {
        await this.handleLeaveConversationRoom(socket, data);
      });

      // Handle real-time conversation messages
      socket.on('conversation_message', async (data: ConversationMessage & { roomId?: string }) => {
        await this.handleConversationMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { roomId?: string }) => {
        this.handleTypingIndicator(socket, data, true);
      });

      socket.on('typing_stop', (data: { roomId?: string }) => {
        this.handleTypingIndicator(socket, data, false);
      });

      // Handle presence updates
      socket.on('presence_update', (data: PresenceUpdate) => {
        this.handlePresenceUpdate(socket, data);
      });

      // Handle learning session updates
      socket.on('session_update', async (data: { session: LearningSession; progress: LearningProgress }) => {
        await this.handleSessionUpdate(socket, data);
      });

      // Handle real-time feedback requests
      socket.on('request_feedback', async (data: { text: string; context: ConversationContext }) => {
        await this.handleFeedbackRequest(socket, data);
      });

      // Handle voice activity indicators
      socket.on('voice_activity', (data: { isActive: boolean; confidence?: number }) => {
        this.handleVoiceActivity(socket, data);
      });

      // Handle peer learning requests
      socket.on('find_conversation_partner', async (data: { language: string; level: string; interests: string[] }) => {
        await this.handleFindConversationPartner(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleUserDisconnect(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
        socket.emit('error', { message: 'An error occurred', details: error.message });
      });
    });
  }

  private async handleUserAuthentication(socket: any, data: { userId: string; userInfo: any }): Promise<void> {
    try {
      const user: RealTimeUser = {
        id: data.userId,
        socket_id: socket.id,
        username: data.userInfo.username,
        learning_language: data.userInfo.learning_language,
        current_level: data.userInfo.current_level,
        is_active: true,
        last_seen: new Date()
      };

      this.activeUsers.set(data.userId, user);
      this.userSessions.set(data.userId, socket.id);

      // Join user to their personal channel
      socket.join(`user_${data.userId}`);

      // Emit successful authentication
      socket.emit('authenticated', { 
        success: true, 
        user: user,
        onlineUsers: this.getOnlineUsersByLanguage(user.learning_language)
      });

      // Broadcast user online status to relevant users
      this.broadcastPresenceUpdate({
        user_id: data.userId,
        status: 'online',
        last_activity: new Date()
      });

      console.log(`User authenticated: ${data.userId}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authentication_error', { message: 'Failed to authenticate' });
    }
  }

  private async handleJoinConversationRoom(socket: any, data: { roomId?: string; preferences: any }): Promise<void> {
    try {
      const userId = this.getUserIdBySocket(socket.id);
      if (!userId) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const user = this.activeUsers.get(userId);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      let room: LiveConversationRoom;

      if (data.roomId) {
        // Join existing room
        const existingRoom = this.conversationRooms.get(data.roomId);
        if (!existingRoom) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (existingRoom.participants.length >= existingRoom.max_participants) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        room = existingRoom;
      } else {
        // Create new room or find available room
        room = this.findOrCreateConversationRoom(user, data.preferences);
      }

      // Add user to room
      if (!room.participants.some(p => p.id === userId)) {
        room.participants.push(user);
      }

      // Join socket room
      socket.join(room.id);

      // Emit room joined event
      socket.emit('conversation_room_joined', {
        room: room,
        participants: room.participants
      });

      // Notify other participants
      socket.to(room.id).emit('participant_joined', {
        user: user,
        room_id: room.id
      });

      console.log(`User ${userId} joined conversation room ${room.id}`);
    } catch (error) {
      console.error('Error joining conversation room:', error);
      socket.emit('error', { message: 'Failed to join conversation room' });
    }
  }

  private async handleLeaveConversationRoom(socket: any, data: { roomId: string }): Promise<void> {
    try {
      const userId = this.getUserIdBySocket(socket.id);
      if (!userId) return;

      const room = this.conversationRooms.get(data.roomId);
      if (!room) return;

      // Remove user from room
      room.participants = room.participants.filter(p => p.id !== userId);

      // Leave socket room
      socket.leave(data.roomId);

      // Notify other participants
      socket.to(data.roomId).emit('participant_left', {
        user_id: userId,
        room_id: data.roomId
      });

      // Close room if empty
      if (room.participants.length === 0) {
        room.is_active = false;
        this.conversationRooms.delete(data.roomId);
      }

      socket.emit('conversation_room_left', { room_id: data.roomId });
      console.log(`User ${userId} left conversation room ${data.roomId}`);
    } catch (error) {
      console.error('Error leaving conversation room:', error);
    }
  }

  private async handleConversationMessage(socket: any, data: ConversationMessage & { roomId?: string }): Promise<void> {
    try {
      const userId = this.getUserIdBySocket(socket.id);
      if (!userId) return;

      const message: ConversationMessage = {
        id: data.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: data.role,
        content: data.content,
        timestamp: new Date(),
        metadata: data.metadata
      };

      if (data.roomId) {
        // Broadcast to conversation room
        socket.to(data.roomId).emit('conversation_message', {
          ...message,
          room_id: data.roomId,
          sender_id: userId
        });
      } else {
        // Send to personal AI conversation
        socket.emit('conversation_message', message);
      }

      // Here you would integrate with the ConversationEngine for AI responses
      // and possibly store the message in a database

      console.log(`Message sent by user ${userId}: ${data.content.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error handling conversation message:', error);
    }
  }

  private handleTypingIndicator(socket: any, data: { roomId?: string }, isTyping: boolean): void {
    const userId = this.getUserIdBySocket(socket.id);
    if (!userId) return;

    const event = isTyping ? 'user_typing_start' : 'user_typing_stop';
    const targetRoom = data.roomId || `user_${userId}`;

    socket.to(targetRoom).emit(event, {
      user_id: userId,
      room_id: data.roomId,
      timestamp: new Date()
    });
  }

  private handlePresenceUpdate(socket: any, data: PresenceUpdate): void {
    const userId = this.getUserIdBySocket(socket.id);
    if (!userId) return;

    const user = this.activeUsers.get(userId);
    if (!user) return;

    // Update user status
    user.last_seen = new Date();
    user.is_active = data.status !== 'offline';

    // Broadcast presence update
    this.broadcastPresenceUpdate(data);
  }

  private async handleSessionUpdate(socket: any, data: { session: LearningSession; progress: LearningProgress }): Promise<void> {
    try {
      const userId = this.getUserIdBySocket(socket.id);
      if (!userId) return;

      // Emit progress update to user
      socket.emit('learning_progress_updated', {
        session: data.session,
        progress: data.progress,
        timestamp: new Date()
      });

      // Optionally broadcast achievements to friends/followers
      if (data.session.achievements_unlocked.length > 0) {
        this.broadcastAchievements(userId, data.session.achievements_unlocked);
      }

      console.log(`Session updated for user ${userId}: ${data.session.xp_earned} XP earned`);
    } catch (error) {
      console.error('Error handling session update:', error);
    }
  }

  private async handleFeedbackRequest(socket: any, data: { text: string; context: ConversationContext }): Promise<void> {
    try {
      // This would integrate with your AI system to generate real-time feedback
      const feedback: RealTimeFeedback[] = await this.generateRealTimeFeedback(data.text, data.context);

      socket.emit('real_time_feedback', {
        feedback: feedback,
        original_text: data.text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      socket.emit('error', { message: 'Failed to generate feedback' });
    }
  }

  private handleVoiceActivity(socket: any, data: { isActive: boolean; confidence?: number }): void {
    const userId = this.getUserIdBySocket(socket.id);
    if (!userId) return;

    // Find user's conversation room
    const userRoom = Array.from(this.conversationRooms.values())
      .find(room => room.participants.some(p => p.id === userId));

    if (userRoom) {
      socket.to(userRoom.id).emit('voice_activity', {
        user_id: userId,
        is_active: data.isActive,
        confidence: data.confidence,
        timestamp: new Date()
      });
    }
  }

  private async handleFindConversationPartner(socket: any, data: { language: string; level: string; interests: string[] }): Promise<void> {
    try {
      const userId = this.getUserIdBySocket(socket.id);
      if (!userId) return;

      const compatibleUsers = this.findCompatibleUsers(userId, data);
      
      socket.emit('conversation_partners_found', {
        users: compatibleUsers,
        search_criteria: data
      });

      // Optionally notify compatible users about the match request
      compatibleUsers.forEach(user => {
        const userSocket = this.userSessions.get(user.id);
        if (userSocket) {
          this.io.to(userSocket).emit('conversation_request', {
            from_user_id: userId,
            message: `Someone wants to practice ${data.language} with you!`
          });
        }
      });
    } catch (error) {
      console.error('Error finding conversation partner:', error);
      socket.emit('error', { message: 'Failed to find conversation partners' });
    }
  }

  private handleUserDisconnect(socket: any): void {
    const userId = this.getUserIdBySocket(socket.id);
    if (!userId) return;

    // Update user status
    const user = this.activeUsers.get(userId);
    if (user) {
      user.is_active = false;
      user.last_seen = new Date();
    }

    // Remove from active sessions
    this.userSessions.delete(userId);

    // Remove from all conversation rooms
    this.conversationRooms.forEach((room, roomId) => {
      const participantIndex = room.participants.findIndex(p => p.id === userId);
      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);
        
        // Notify other participants
        socket.to(roomId).emit('participant_left', {
          user_id: userId,
          room_id: roomId
        });

        // Close room if empty
        if (room.participants.length === 0) {
          room.is_active = false;
          this.conversationRooms.delete(roomId);
        }
      }
    });

    // Broadcast offline status
    this.broadcastPresenceUpdate({
      user_id: userId,
      status: 'offline',
      last_activity: new Date()
    });

    console.log(`User disconnected: ${userId}`);
  }

  private getUserIdBySocket(socketId: string): string | null {
    for (const [userId, sessionId] of this.userSessions.entries()) {
      if (sessionId === socketId) {
        return userId;
      }
    }
    return null;
  }

  private getOnlineUsersByLanguage(language: string): RealTimeUser[] {
    return Array.from(this.activeUsers.values())
      .filter(user => user.learning_language === language && user.is_active);
  }

  private findOrCreateConversationRoom(user: RealTimeUser, preferences: any): LiveConversationRoom {
    // Try to find an existing room that matches criteria
    const availableRoom = Array.from(this.conversationRooms.values())
      .find(room => 
        room.language === user.learning_language &&
        room.is_active &&
        room.participants.length < room.max_participants &&
        Math.abs(room.difficulty_level - (preferences.difficulty || 5)) <= 2
      );

    if (availableRoom) {
      return availableRoom;
    }

    // Create new room
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRoom: LiveConversationRoom = {
      id: roomId,
      participants: [],
      language: user.learning_language,
      topic: preferences.topic || 'general',
      difficulty_level: preferences.difficulty || 5,
      created_at: new Date(),
      is_active: true,
      max_participants: preferences.max_participants || 4
    };

    this.conversationRooms.set(roomId, newRoom);
    return newRoom;
  }

  private findCompatibleUsers(userId: string, criteria: { language: string; level: string; interests: string[] }): RealTimeUser[] {
    return Array.from(this.activeUsers.values())
      .filter(user => 
        user.id !== userId &&
        user.learning_language === criteria.language &&
        user.current_level === criteria.level &&
        user.is_active
      )
      .slice(0, 10); // Limit results
  }

  private broadcastPresenceUpdate(update: PresenceUpdate): void {
    // Broadcast to users learning the same language
    const user = this.activeUsers.get(update.user_id);
    if (!user) return;

    const relevantUsers = this.getOnlineUsersByLanguage(user.learning_language);
    relevantUsers.forEach(relevantUser => {
      const socketId = this.userSessions.get(relevantUser.id);
      if (socketId) {
        this.io.to(socketId).emit('presence_update', update);
      }
    });
  }

  private broadcastAchievements(userId: string, achievements: string[]): void {
    const user = this.activeUsers.get(userId);
    if (!user) return;

    // Broadcast to friends/followers (would integrate with user relationships)
    this.io.emit('user_achievement', {
      user_id: userId,
      username: user.username,
      achievements: achievements,
      timestamp: new Date()
    });
  }

  private async generateRealTimeFeedback(text: string, context: ConversationContext): Promise<RealTimeFeedback[]> {
    // This is a simplified implementation - would integrate with your AI system
    const feedback: RealTimeFeedback[] = [];

    // Basic grammar check (simplified)
    if (text.toLowerCase().includes('i are')) {
      feedback.push({
        type: 'grammar',
        message: 'Should be "I am" not "I are"',
        severity: 'error',
        suggestions: ['I am'],
        timestamp: new Date()
      });
    }

    // Vocabulary suggestions
    if (text.length > 50) {
      feedback.push({
        type: 'vocabulary',
        message: 'Great use of complex sentences!',
        severity: 'success',
        timestamp: new Date()
      });
    }

    // Encouragement
    feedback.push({
      type: 'encouragement',
      message: 'Keep practicing! Your conversation skills are improving.',
      severity: 'info',
      timestamp: new Date()
    });

    return feedback;
  }

  // Public methods for external integration
  public sendNotificationToUser(userId: string, notification: any): void {
    const socketId = this.userSessions.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  public getActiveUsers(): RealTimeUser[] {
    return Array.from(this.activeUsers.values()).filter(user => user.is_active);
  }

  public getConversationRooms(): LiveConversationRoom[] {
    return Array.from(this.conversationRooms.values()).filter(room => room.is_active);
  }

  public broadcastSystemMessage(message: string, targetLanguage?: string): void {
    if (targetLanguage) {
      const targetUsers = this.getOnlineUsersByLanguage(targetLanguage);
      targetUsers.forEach(user => {
        const socketId = this.userSessions.get(user.id);
        if (socketId) {
          this.io.to(socketId).emit('system_message', { message, timestamp: new Date() });
        }
      });
    } else {
      this.io.emit('system_message', { message, timestamp: new Date() });
    }
  }
}
