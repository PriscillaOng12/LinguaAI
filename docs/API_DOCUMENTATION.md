# API Documentation

*Complete API reference for LinguaAI - endpoints, authentication, examples, and integration guides*

## Overview

The LinguaAI API provides programmatic access to our AI-powered language learning conversation engine. This RESTful API allows developers to integrate conversational language learning into their applications, access user progress data, and customize learning experiences.

**Base URL:** `https://api.linguaai.com/v1`  
**Current Version:** v1.0  
**Authentication:** Bearer token (OAuth 2.0)  
**Response Format:** JSON  
**Rate Limiting:** 1000 requests/hour per API key

## Authentication

### OAuth 2.0 Flow

LinguaAI uses OAuth 2.0 with PKCE for secure authentication. This ensures user data protection while enabling seamless third-party integrations.

**Step 1: Authorization Request**
```http
GET https://api.linguaai.com/oauth/authorize
  ?client_id=your_client_id
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=read_profile,manage_conversations,read_progress
  &state=random_state_string
  &code_challenge=generated_challenge
  &code_challenge_method=S256
```

**Step 2: Token Exchange**
```http
POST https://api.linguaai.com/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "your_client_id",
  "code": "authorization_code_from_step_1",
  "redirect_uri": "https://yourapp.com/callback",
  "code_verifier": "original_code_verifier"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def50200a54b5c2d4e6f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read_profile manage_conversations read_progress"
}
```

### API Key Authentication (Alternative)

For server-to-server integrations, you can use API keys:

```http
Authorization: Bearer YOUR_API_KEY
```

**Getting an API key:**
1. Log in to your LinguaAI dashboard
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Copy and securely store your key

## Endpoints

### User Management

#### Get User Profile
```http
GET /users/me
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "user_123456",
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "avatar_url": "https://cdn.linguaai.com/avatars/user_123456.jpg",
  "created_at": "2024-01-15T10:30:00Z",
  "last_active": "2024-03-15T14:22:00Z",
  "subscription": {
    "plan": "premium",
    "status": "active",
    "expires_at": "2024-04-15T10:30:00Z"
  },
  "preferences": {
    "target_language": "spanish",
    "native_language": "english",
    "proficiency_level": "intermediate",
    "daily_goal": 30,
    "preferred_topics": ["business", "travel", "culture"]
  },
  "stats": {
    "total_conversations": 47,
    "total_time_minutes": 1240,
    "current_streak": 12,
    "xp_total": 2847
  }
}
```

#### Update User Preferences
```http
PATCH /users/me/preferences
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "target_language": "french",
  "proficiency_level": "beginner",
  "daily_goal": 20,
  "preferred_topics": ["cooking", "family", "hobbies"]
}
```

**Response:**
```json
{
  "id": "user_123456",
  "preferences": {
    "target_language": "french",
    "native_language": "english",
    "proficiency_level": "beginner",
    "daily_goal": 20,
    "preferred_topics": ["cooking", "family", "hobbies"]
  },
  "updated_at": "2024-03-15T14:30:00Z"
}
```

### Conversations

#### Start New Conversation
```http
POST /conversations
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "topic": "ordering_food_restaurant",
  "difficulty": "intermediate",
  "scenario": "You're at a French restaurant in Paris and want to order dinner",
  "language": "french",
  "custom_context": {
    "restaurant_type": "bistro",
    "dietary_restrictions": ["vegetarian"],
    "budget": "moderate"
  }
}
```

**Response:**
```json
{
  "id": "conv_789012",
  "status": "active",
  "created_at": "2024-03-15T15:00:00Z",
  "topic": "ordering_food_restaurant",
  "difficulty": "intermediate",
  "language": "french",
  "ai_persona": {
    "name": "Marie",
    "role": "restaurant_server",
    "personality": "friendly, helpful, patient"
  },
  "initial_message": {
    "text": "Bonsoir ! Bienvenue dans notre bistro. Je suis Marie, votre serveuse ce soir. Avez-vous déjà regardé notre menu ?",
    "translation": "Good evening! Welcome to our bistro. I'm Marie, your server tonight. Have you already looked at our menu?",
    "audio_url": "https://cdn.linguaai.com/audio/conv_789012_msg_001.mp3"
  },
  "context": {
    "restaurant_type": "bistro",
    "dietary_restrictions": ["vegetarian"],
    "budget": "moderate",
    "menu_items": ["salade niçoise", "ratatouille", "quiche lorraine"]
  }
}
```

#### Send Message in Conversation
```http
POST /conversations/{conversation_id}/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "text",
  "content": "Bonjour Marie ! Oui, j'ai regardé le menu. Est-ce que vous avez des plats végétariens ?",
  "audio_data": "base64_encoded_audio_optional"
}
```

**Response:**
```json
{
  "id": "msg_345678",
  "conversation_id": "conv_789012",
  "created_at": "2024-03-15T15:02:00Z",
  "user_message": {
    "text": "Bonjour Marie ! Oui, j'ai regardé le menu. Est-ce que vous avez des plats végétariens ?",
    "translation": "Hello Marie! Yes, I looked at the menu. Do you have vegetarian dishes?",
    "analysis": {
      "grammar_score": 85,
      "pronunciation_score": 78,
      "vocabulary_level": "intermediate",
      "errors": [
        {
          "type": "pronunciation",
          "word": "végétariens",
          "suggestion": "Focus on the 'é' sound - it should be more closed",
          "audio_example": "https://cdn.linguaai.com/pronunciation/vegetariens.mp3"
        }
      ],
      "improvements": [
        "Great use of polite greeting!",
        "Correct question formation with 'est-ce que'"
      ]
    }
  },
  "ai_response": {
    "text": "Absolument ! Nous avons plusieurs options végétariennes délicieuses. Je recommande particulièrement notre ratatouille maison et notre salade de chèvre chaud. Aimeriez-vous que je vous explique ces plats ?",
    "translation": "Absolutely! We have several delicious vegetarian options. I particularly recommend our homemade ratatouille and our warm goat cheese salad. Would you like me to explain these dishes?",
    "audio_url": "https://cdn.linguaai.com/audio/conv_789012_msg_002.mp3"
  },
  "learning_insights": {
    "new_vocabulary": ["absolument", "ratatouille", "chèvre"],
    "grammar_patterns": ["conditional mood: aimeriez-vous"],
    "cultural_notes": ["French servers often make personal recommendations"]
  }
}
```

#### Get Conversation History
```http
GET /conversations/{conversation_id}/messages
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "conversation_id": "conv_789012",
  "messages": [
    {
      "id": "msg_001",
      "timestamp": "2024-03-15T15:00:00Z",
      "sender": "ai",
      "content": "Bonsoir ! Bienvenue dans notre bistro...",
      "translation": "Good evening! Welcome to our bistro..."
    },
    {
      "id": "msg_002", 
      "timestamp": "2024-03-15T15:02:00Z",
      "sender": "user",
      "content": "Bonjour Marie ! Oui, j'ai regardé le menu...",
      "analysis": {
        "grammar_score": 85,
        "pronunciation_score": 78
      }
    }
  ],
  "summary": {
    "total_messages": 12,
    "duration_minutes": 18,
    "avg_grammar_score": 82,
    "avg_pronunciation_score": 79,
    "topics_covered": ["greetings", "food_ordering", "dietary_preferences"]
  }
}
```

#### End Conversation
```http
POST /conversations/{conversation_id}/end
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "feedback": {
    "difficulty_rating": 4,
    "enjoyment_rating": 5,
    "comments": "Great conversation! The server was very patient and helpful."
  }
}
```

**Response:**
```json
{
  "id": "conv_789012",
  "status": "completed",
  "ended_at": "2024-03-15T15:25:00Z",
  "summary": {
    "duration_minutes": 25,
    "total_messages": 16,
    "xp_earned": 180,
    "performance": {
      "grammar_score": 82,
      "pronunciation_score": 79,
      "vocabulary_growth": 8,
      "confidence_improvement": 12
    },
    "achievements": [
      "first_restaurant_conversation",
      "perfect_pronunciation_streak_5"
    ]
  },
  "next_recommendations": [
    "Try a more complex restaurant scenario",
    "Practice food vocabulary in a grocery store setting",
    "Work on pronunciation of nasal vowels"
  ]
}
```

### Progress & Analytics

#### Get Learning Progress
```http
GET /users/me/progress
Authorization: Bearer {access_token}
?period=week&language=french
```

**Response:**
```json
{
  "user_id": "user_123456",
  "language": "french",
  "period": "week",
  "start_date": "2024-03-08T00:00:00Z",
  "end_date": "2024-03-15T23:59:59Z",
  "overall_stats": {
    "conversations_completed": 7,
    "total_time_minutes": 210,
    "xp_earned": 840,
    "streak_days": 6,
    "proficiency_improvement": 8.5
  },
  "skill_breakdown": {
    "grammar": {
      "current_score": 82,
      "improvement": 6,
      "weak_areas": ["subjunctive_mood", "gender_agreement"],
      "strong_areas": ["present_tense", "question_formation"]
    },
    "pronunciation": {
      "current_score": 79,
      "improvement": 4,
      "weak_areas": ["nasal_vowels", "r_sound"],
      "strong_areas": ["basic_vowels", "consonants"]
    },
    "vocabulary": {
      "words_learned": 23,
      "words_reviewed": 45,
      "retention_rate": 87,
      "categories": {
        "food": 12,
        "business": 8,
        "travel": 3
      }
    },
    "fluency": {
      "conversation_confidence": 72,
      "response_time_improvement": 15,
      "complexity_level": "intermediate_low"
    }
  },
  "daily_breakdown": [
    {
      "date": "2024-03-08",
      "conversations": 1,
      "minutes": 32,
      "xp": 120,
      "grammar_score": 75,
      "pronunciation_score": 73
    },
    {
      "date": "2024-03-09",
      "conversations": 2,
      "minutes": 45,
      "xp": 180,
      "grammar_score": 78,
      "pronunciation_score": 76
    }
  ]
}
```

#### Get Achievement Data
```http
GET /users/me/achievements
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "user_id": "user_123456",
  "total_achievements": 23,
  "total_xp_from_achievements": 2300,
  "achievements": [
    {
      "id": "first_conversation",
      "name": "Breaking the Ice",
      "description": "Complete your first AI conversation",
      "icon": "🎉",
      "xp_reward": 50,
      "earned_at": "2024-01-15T10:45:00Z",
      "category": "milestone"
    },
    {
      "id": "week_streak_1",
      "name": "Week Warrior",
      "description": "Maintain a 7-day learning streak",
      "icon": "🔥",
      "xp_reward": 100,
      "earned_at": "2024-01-22T09:30:00Z",
      "category": "consistency"
    },
    {
      "id": "pronunciation_perfect_10",
      "name": "Pronunciation Pro",
      "description": "Get perfect pronunciation scores 10 times",
      "icon": "🎯",
      "xp_reward": 200,
      "earned_at": "2024-02-10T16:20:00Z",
      "category": "skill"
    }
  ],
  "available_achievements": [
    {
      "id": "restaurant_master",
      "name": "Restaurant Master",
      "description": "Complete 5 restaurant conversations",
      "icon": "🍽️",
      "xp_reward": 150,
      "progress": {
        "current": 3,
        "required": 5
      },
      "category": "topic"
    }
  ]
}
```

### Voice Features

#### Upload Audio for Analysis
```http
POST /voice/analyze
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

audio: [audio_file.wav]
text: "Bonjour, comment allez-vous?"
language: "french"
```

**Response:**
```json
{
  "analysis_id": "voice_456789",
  "text": "Bonjour, comment allez-vous?",
  "language": "french",
  "overall_score": 78,
  "detailed_analysis": {
    "pronunciation": {
      "score": 78,
      "phonemes": [
        {
          "phoneme": "b",
          "word": "bonjour",
          "score": 95,
          "feedback": "Excellent pronunciation"
        },
        {
          "phoneme": "ʒ",
          "word": "bonjour",
          "score": 65,
          "feedback": "Try to make the 'j' sound softer",
          "audio_example": "https://cdn.linguaai.com/pronunciation/j_sound_fr.mp3"
        }
      ]
    },
    "fluency": {
      "score": 82,
      "pace": "appropriate",
      "pauses": 2,
      "filler_words": 0,
      "feedback": "Good natural pace with appropriate pauses"
    },
    "intonation": {
      "score": 74,
      "pattern": "questioning",
      "accuracy": 74,
      "feedback": "Rising intonation appropriate for question, but could be more pronounced"
    }
  },
  "improvements": [
    "Focus on the 'j' sound in 'bonjour' - it should be softer",
    "Try to make your question intonation slightly more pronounced",
    "Overall excellent pronunciation! Keep practicing"
  ],
  "next_exercises": [
    "Practice words with the 'j' sound",
    "Work on question intonation patterns"
  ]
}
```

#### Get Pronunciation Practice Exercises
```http
GET /voice/exercises
Authorization: Bearer {access_token}
?language=french&difficulty=intermediate&focus=pronunciation
```

**Response:**
```json
{
  "exercises": [
    {
      "id": "exercise_001",
      "type": "word_repetition",
      "title": "French R Sound Practice",
      "difficulty": "intermediate",
      "words": [
        {
          "text": "rouge",
          "phonetic": "/ʁuʒ/",
          "audio_url": "https://cdn.linguaai.com/exercises/rouge.mp3",
          "tips": "The French R is pronounced at the back of the throat"
        },
        {
          "text": "partir",
          "phonetic": "/paʁtiʁ/",
          "audio_url": "https://cdn.linguaai.com/exercises/partir.mp3",
          "tips": "Notice the R sound appears twice in this word"
        }
      ]
    },
    {
      "id": "exercise_002",
      "type": "sentence_practice",
      "title": "Question Intonation",
      "sentences": [
        {
          "text": "Comment vous appelez-vous ?",
          "audio_url": "https://cdn.linguaai.com/exercises/comment_vous_appelez.mp3",
          "intonation_pattern": "rising",
          "tips": "Voice should rise at the end for questions"
        }
      ]
    }
  ]
}
```

### Leaderboards & Social

#### Get Leaderboard
```http
GET /leaderboards
Authorization: Bearer {access_token}
?type=weekly&language=french&limit=50
```

**Response:**
```json
{
  "leaderboard_type": "weekly",
  "language": "french",
  "period": "2024-03-08 to 2024-03-15",
  "user_rank": 12,
  "total_participants": 156,
  "leaders": [
    {
      "rank": 1,
      "user": {
        "id": "user_999888",
        "name": "Alex M.",
        "avatar_url": "https://cdn.linguaai.com/avatars/user_999888.jpg",
        "level": 15
      },
      "xp": 2840,
      "conversations": 18,
      "streak": 12
    },
    {
      "rank": 2,
      "user": {
        "id": "user_777666",
        "name": "Sarah K.",
        "avatar_url": "https://cdn.linguaai.com/avatars/user_777666.jpg",
        "level": 13
      },
      "xp": 2650,
      "conversations": 15,
      "streak": 9
    }
  ],
  "user_stats": {
    "rank": 12,
    "xp": 1890,
    "conversations": 11,
    "streak": 6,
    "xp_to_next_rank": 150
  }
}
```

### Content & Scenarios

#### Get Available Conversation Topics
```http
GET /content/topics
Authorization: Bearer {access_token}
?language=french&level=intermediate
```

**Response:**
```json
{
  "language": "french",
  "level": "intermediate",
  "categories": [
    {
      "id": "travel",
      "name": "Travel & Tourism",
      "icon": "✈️",
      "topics": [
        {
          "id": "airport_checkin",
          "name": "Airport Check-in",
          "difficulty": "intermediate",
          "duration_minutes": 15,
          "description": "Practice checking in for a flight and handling travel documents"
        },
        {
          "id": "hotel_reservation",
          "name": "Hotel Reservation",
          "difficulty": "intermediate",
          "duration_minutes": 20,
          "description": "Make and modify hotel reservations, discuss amenities"
        }
      ]
    },
    {
      "id": "business",
      "name": "Professional Communication",
      "icon": "💼",
      "topics": [
        {
          "id": "job_interview",
          "name": "Job Interview",
          "difficulty": "advanced",
          "duration_minutes": 30,
          "description": "Practice answering common interview questions professionally"
        }
      ]
    }
  ]
}
```

## SDKs & Libraries

### JavaScript/TypeScript SDK

Install the official LinguaAI SDK:

```bash
npm install @linguaai/sdk
```

**Basic Usage:**
```typescript
import { LinguaAI } from '@linguaai/sdk';

const client = new LinguaAI({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.linguaai.com/v1'
});

// Start a conversation
const conversation = await client.conversations.create({
  topic: 'restaurant_ordering',
  language: 'french',
  difficulty: 'intermediate'
});

// Send a message
const response = await client.conversations.sendMessage(conversation.id, {
  type: 'text',
  content: 'Bonjour, je voudrais une table pour deux.'
});

console.log(response.ai_response.text);
console.log(response.user_message.analysis);
```

**Real-time Conversation Example:**
```typescript
import { LinguaAI } from '@linguaai/sdk';

const client = new LinguaAI({ apiKey: 'your_api_key' });

// Create conversation with WebSocket support
const conversation = await client.conversations.createRealtime({
  topic: 'coffee_shop',
  language: 'spanish'
});

// Listen for AI responses
conversation.on('message', (message) => {
  console.log('AI:', message.text);
  playAudio(message.audio_url);
});

// Send voice message
const audioBlob = await recordAudio();
await conversation.sendVoiceMessage(audioBlob);
```

### Python SDK

Install the Python SDK:

```bash
pip install linguaai-python
```

**Basic Usage:**
```python
from linguaai import LinguaAI

client = LinguaAI(api_key='your_api_key')

# Start conversation
conversation = client.conversations.create(
    topic='business_meeting',
    language='german',
    difficulty='advanced'
)

# Send message and get analysis
response = client.conversations.send_message(
    conversation.id,
    content='Guten Tag, freut mich Sie kennenzulernen.'
)

print(f"AI Response: {response.ai_response.text}")
print(f"Grammar Score: {response.user_message.analysis.grammar_score}")
```

### React Hooks

For React applications, use our hooks library:

```bash
npm install @linguaai/react-hooks
```

```tsx
import { useConversation, useLearningProgress } from '@linguaai/react-hooks';

function ConversationComponent() {
  const { 
    conversation,
    sendMessage,
    isLoading,
    error 
  } = useConversation({
    topic: 'restaurant',
    language: 'french'
  });

  const { progress } = useLearningProgress();

  const handleSendMessage = async (text: string) => {
    const response = await sendMessage(text);
    // Handle response
  };

  return (
    <div>
      <div>Current XP: {progress?.xp_total}</div>
      {conversation?.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Webhooks

Configure webhooks to receive real-time notifications about user events and learning progress.

### Setting Up Webhooks

1. Go to your dashboard Settings > Webhooks
2. Add your endpoint URL
3. Select events you want to receive
4. Save your webhook secret for verification

### Webhook Events

#### User Progress Update
Triggered when a user completes a conversation or achieves a milestone.

```json
{
  "event": "user.progress.updated",
  "timestamp": "2024-03-15T15:30:00Z",
  "data": {
    "user_id": "user_123456",
    "conversation_id": "conv_789012",
    "progress_change": {
      "xp_gained": 180,
      "grammar_improvement": 3,
      "pronunciation_improvement": 2,
      "new_achievements": ["restaurant_novice"]
    }
  }
}
```

#### Conversation Completed
```json
{
  "event": "conversation.completed",
  "timestamp": "2024-03-15T15:25:00Z",
  "data": {
    "conversation_id": "conv_789012",
    "user_id": "user_123456",
    "topic": "restaurant_ordering",
    "language": "french",
    "duration_minutes": 25,
    "performance": {
      "grammar_score": 82,
      "pronunciation_score": 79,
      "xp_earned": 180
    }
  }
}
```

### Webhook Verification

Verify webhook authenticity using the signature header:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, f"sha256={expected}")
```

## Rate Limits & Error Handling

### Rate Limits

| Endpoint Category | Rate Limit | Burst Limit |
|------------------|------------|-------------|
| **Authentication** | 10/minute | 20/minute |
| **Conversations** | 60/hour | 10/minute |
| **Voice Analysis** | 30/hour | 5/minute |
| **Progress Data** | 100/hour | 20/minute |
| **General API** | 1000/hour | 50/minute |

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1647360000
```

### Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_LANGUAGE",
    "message": "The specified language 'klingon' is not supported",
    "details": {
      "supported_languages": ["english", "spanish", "french", "german", "italian"],
      "provided_language": "klingon"
    },
    "request_id": "req_abc123def456"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INVALID_LANGUAGE` | 400 | Unsupported language |
| `INVALID_AUDIO` | 400 | Audio format not supported |
| `CONVERSATION_EXPIRED` | 410 | Conversation session expired |
| `INTERNAL_ERROR` | 500 | Server error |

### Retry Logic

Implement exponential backoff for rate-limited requests:

```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

## Integration Examples

### Learning Management System (LMS) Integration

```python
# Example: Integrating LinguaAI with a university LMS
from linguaai import LinguaAI
import lms_connector

class LanguageCourseIntegration:
    def __init__(self, api_key, course_id):
        self.client = LinguaAI(api_key=api_key)
        self.course_id = course_id
    
    def assign_conversation_homework(self, student_ids, topic, due_date):
        """Assign conversation practice to students"""
        for student_id in student_ids:
            # Create conversation assignment
            conversation = self.client.conversations.create(
                topic=topic,
                custom_context={
                    'assignment_id': f'hw_{course_id}_{topic}',
                    'due_date': due_date,
                    'student_id': student_id
                }
            )
            
            # Record assignment in LMS
            lms_connector.create_assignment(
                course_id=self.course_id,
                student_id=student_id,
                assignment_type='conversation_practice',
                conversation_id=conversation.id,
                due_date=due_date
            )
    
    def get_class_progress(self):
        """Get progress report for entire class"""
        students = lms_connector.get_course_students(self.course_id)
        progress_report = []
        
        for student in students:
            progress = self.client.users.get_progress(
                user_id=student.linguaai_id,
                period='week'
            )
            progress_report.append({
                'student_name': student.name,
                'conversations_completed': progress.conversations_completed,
                'average_score': progress.overall_stats.proficiency_improvement,
                'areas_for_improvement': progress.skill_breakdown.weak_areas
            })
        
        return progress_report
```

### Corporate Training Platform

```typescript
// Example: Corporate language training dashboard
import { LinguaAI } from '@linguaai/sdk';

class CorporateTrainingDashboard {
  private client: LinguaAI;
  
  constructor(apiKey: string) {
    this.client = new LinguaAI({ apiKey });
  }
  
  async createTeamChallenge(teamMembers: string[], scenario: string) {
    const challenge = {
      id: `challenge_${Date.now()}`,
      scenario,
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    };
    
    for (const memberId of teamMembers) {
      const conversation = await this.client.conversations.create({
        topic: scenario,
        language: 'spanish', // For global team
        difficulty: 'business_intermediate',
        custom_context: {
          challenge_id: challenge.id,
          team_member: memberId
        }
      });
      
      challenge.participants.push({
        memberId,
        conversationId: conversation.id,
        status: 'assigned'
      });
    }
    
    return challenge;
  }
  
  async getTeamLeaderboard(teamId: string) {
    const leaderboard = await this.client.leaderboards.get({
      type: 'team',
      team_id: teamId,
      period: 'month'
    });
    
    return leaderboard.leaders.map(leader => ({
      name: leader.user.name,
      conversationsCompleted: leader.conversations,
      averageScore: leader.avg_performance_score,
      businessScenariosMastered: leader.business_scenarios_completed
    }));
  }
}
```

## Best Practices

### Performance Optimization

1. **Conversation Caching**: Cache conversation context locally to reduce API calls
2. **Audio Compression**: Compress audio files before uploading for faster analysis
3. **Batch Requests**: Use batch endpoints for multiple user operations
4. **Connection Pooling**: Reuse HTTP connections for better performance

### Security Considerations

1. **API Key Management**: Store API keys securely, rotate regularly
2. **User Data Protection**: Never store sensitive user audio on your servers
3. **HTTPS Only**: All API calls must use HTTPS
4. **Token Expiration**: Handle token refresh gracefully

### User Experience Guidelines

1. **Progressive Loading**: Show conversation interface while loading AI response
2. **Offline Graceful Degradation**: Cache recent conversations for offline review
3. **Error User Feedback**: Provide clear, actionable error messages to users
4. **Performance Feedback**: Show audio analysis results immediately after recording

---

*This API documentation is updated regularly. For the latest changes and announcements, subscribe to our developer newsletter or follow our changelog at https://api.linguaai.com/changelog*
