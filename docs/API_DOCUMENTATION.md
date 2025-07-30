# API Documentation

*Complete API reference for LinguaAI - built by a college student, documented like I wish APIs were when I was learning*

## Overview

The LinguaAI API lets you integrate AI-powered language conversation into your own applications. I built this API because I wanted other developers to be able to create language learning tools without having to figure out all the prompt engineering and conversation management I spent months on.

**Base URL:** `https://api.linguaai.com/v1`  
**Current Version:** v1.0 (my first real API, so feedback welcome!)  
**Authentication:** Bearer token (JWT-based)  
**Response Format:** JSON  
**Rate Limiting:** 1000 requests/hour (generous for now, might need to adjust based on usage)

**Note:** This is a student project, so the API is free to use but comes with no SLA guarantees. I do my best to keep it running, but servers sometimes go down during finals week. 🤷‍♂️

## Authentication

### JWT Token Authentication

I went with JWT tokens because they're stateless and I don't have to worry about session storage. Plus, it's what I learned in my web dev class.

**Getting a token:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "your.email@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def50200a54b5c2d4e6f8g9h0i1j2k3l...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_123456",
    "email": "your.email@example.com",
    "name": "Your Name"
  }
}
```

**Using the token:**
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### API Key Alternative (Easier for Testing)

If you just want to try things out, you can get an API key from your dashboard instead of dealing with OAuth flows.

```http
Authorization: Bearer YOUR_API_KEY
```

**Pro tip:** I built a demo mode that works without any authentication - just omit the Authorization header and you'll get mock responses that are realistic enough for testing your integration.

## Core Endpoints

### Starting Conversations

#### Create New Conversation
This is the main endpoint that gets everything started. The AI will generate an opening message based on the parameters you provide.

```http
POST /conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "ordering_food",
  "difficulty": "beginner",
  "language": "spanish",
  "scenario": "You're at a tapas bar in Barcelona and want to order dinner",
  "user_interests": ["food", "travel"],
  "custom_context": {
    "restaurant_type": "tapas_bar",
    "dietary_restrictions": ["vegetarian"],
    "time_of_day": "evening"
  }
}
```

**Response:**
```json
{
  "id": "conv_789012",
  "status": "active",
  "created_at": "2024-03-15T15:00:00Z",
  "topic": "ordering_food",
  "difficulty": "beginner",
  "language": "spanish",
  "ai_persona": {
    "name": "Carlos",
    "role": "waiter",
    "personality": "friendly, patient, helpful",
    "background": "Works at a family-owned tapas bar in Barcelona"
  },
  "opening_message": {
    "text": "¡Hola! Bienvenido a nuestro restaurante. Soy Carlos. ¿Qué le gustaría beber?",
    "translation": "Hello! Welcome to our restaurant. I'm Carlos. What would you like to drink?",
    "pronunciation_guide": "OH-lah bee-en-veh-NEE-doh",
    "audio_url": "https://cdn.linguaai.com/audio/conv_789012_msg_001.mp3"
  },
  "conversation_tips": [
    "Start with greetings - 'Hola' is always safe",
    "Don't worry about perfect grammar, focus on communication",
    "Feel free to ask for help if you get stuck"
  ]
}
```

**What I learned building this:** The hardest part wasn't the technical implementation - it was figuring out how to make the AI persona feel consistent. I went through like 20 iterations of the prompt engineering before conversations started feeling natural.

#### Send Message
This is where the magic happens - the conversation flow.

```http
POST /conversations/{conversation_id}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "text",
  "content": "Hola Carlos! Quiero una cerveza, por favor.",
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
    "text": "Hola Carlos! Quiero una cerveza, por favor.",
    "translation": "Hello Carlos! I want a beer, please.",
    "analysis": {
      "grammar_score": 90,
      "pronunciation_score": 75,
      "vocabulary_level": "beginner",
      "mistakes": [
        {
          "type": "pronunciation",
          "word": "cerveza",
          "issue": "The 'z' should sound like 'th' in Spain",
          "suggestion": "Try 'ther-VEH-tha' instead of 'ser-VEH-za'",
          "audio_example": "https://cdn.linguaai.com/pronunciation/cerveza_spain.mp3"
        }
      ],
      "good_usage": [
        "Perfect use of 'por favor' for politeness!",
        "Good subject-verb structure"
      ]
    }
  },
  "ai_response": {
    "text": "¡Perfecto! Tenemos Estrella Galicia, que es muy popular aquí. ¿Le gustaría también algo de comer? Nuestras patatas bravas están muy buenas.",
    "translation": "Perfect! We have Estrella Galicia, which is very popular here. Would you also like something to eat? Our patatas bravas are very good.",
    "audio_url": "https://cdn.linguaai.com/audio/conv_789012_msg_002.mp3",
    "vocabulary_help": {
      "new_words": ["popular", "patatas bravas"],
      "grammar_pattern": "¿Le gustaría...? (Would you like...? - formal)"
    }
  },
  "conversation_metadata": {
    "turns_completed": 2,
    "estimated_level": "beginner",
    "confidence_trend": "increasing",
    "next_suggested_topics": ["describing food preferences", "asking about prices"]
  }
}
```

**A note on the pronunciation scoring:** I spent weeks trying to get this right. It's not perfect - pronunciation is really hard to assess objectively. But it's way better than nothing, and users seem to find it helpful. If you find bugs in the scoring, please let me know!

#### Get Conversation History
```http
GET /conversations/{conversation_id}/messages
Authorization: Bearer {token}
?limit=50&offset=0
```

**Response:**
```json
{
  "conversation_id": "conv_789012",
  "total_messages": 24,
  "messages": [
    {
      "id": "msg_001",
      "timestamp": "2024-03-15T15:00:00Z",
      "sender": "ai",
      "content": "¡Hola! Bienvenido a nuestro restaurante...",
      "translation": "Hello! Welcome to our restaurant..."
    }
  ],
  "conversation_summary": {
    "duration_minutes": 18,
    "topics_covered": ["greetings", "ordering_drinks", "food_preferences"],
    "average_grammar_score": 82,
    "average_pronunciation_score": 76,
    "vocabulary_introduced": 12,
    "confidence_progression": "steady_improvement"
  }
}
```

### User Progress & Analytics

#### Get Learning Progress
This endpoint returns detailed analytics about how the user is improving. I'm pretty proud of this - it took me forever to figure out how to measure "conversation confidence" in a meaningful way.

```http
GET /users/me/progress
Authorization: Bearer {token}
?period=week&language=spanish&skill_focus=conversation
```

**Response:**
```json
{
  "user_id": "user_123456",
  "language": "spanish",
  "period": "week",
  "date_range": {
    "start": "2024-03-08T00:00:00Z",
    "end": "2024-03-15T23:59:59Z"
  },
  "overall_stats": {
    "conversations_completed": 6,
    "total_time_minutes": 178,
    "average_session_length": 29.7,
    "streak_days": 5,
    "confidence_improvement": "+23%"
  },
  "skill_breakdown": {
    "grammar": {
      "current_score": 78,
      "week_improvement": "+8",
      "strong_areas": ["present_tense", "basic_questions"],
      "improvement_areas": ["past_tense", "gender_agreement"],
      "recent_mistakes": [
        "la problema → el problema (gender agreement)",
        "yo fui → yo fue (irregular past tense)"
      ]
    },
    "pronunciation": {
      "current_score": 72,
      "week_improvement": "+5",
      "strong_sounds": ["vowels", "simple_consonants"],
      "challenging_sounds": ["rr_roll", "spanish_r"],
      "pronunciation_tips": [
        "Keep practicing the rolled R - it's getting better!",
        "Your vowel sounds are excellent"
      ]
    },
    "vocabulary": {
      "words_learned": 34,
      "words_retained": 29,
      "retention_rate": 85,
      "categories_practiced": {
        "food_dining": 12,
        "greetings_social": 8,
        "shopping": 4
      }
    },
    "conversation_skills": {
      "confidence_score": 68,
      "longest_conversation": "12 minutes",
      "topics_comfortable_with": ["ordering_food", "basic_introductions"],
      "next_challenges": ["phone_conversations", "giving_directions"]
    }
  },
  "weekly_progression": [
    {
      "date": "2024-03-08",
      "minutes_practiced": 25,
      "conversations": 1,
      "grammar_score": 70,
      "pronunciation_score": 67,
      "new_vocabulary": 6
    }
  ]
}
```

### Voice Features

#### Analyze Pronunciation
This is the endpoint I'm most excited about. Upload audio and get detailed pronunciation feedback.

```http
POST /voice/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data

audio: [audio_file.wav]
text: "Hola, ¿cómo está usted?"
language: "spanish"
difficulty_level: "beginner"
```

**Response:**
```json
{
  "analysis_id": "voice_456789",
  "text": "Hola, ¿cómo está usted?",
  "language": "spanish",
  "overall_score": 74,
  "detailed_feedback": {
    "pronunciation": {
      "score": 74,
      "word_by_word": [
        {
          "word": "hola",
          "score": 95,
          "phonemes": [
            { "sound": "o", "accuracy": 98, "feedback": "Perfect!" },
            { "sound": "l", "accuracy": 92, "feedback": "Good clear L sound" }
          ]
        },
        {
          "word": "cómo",
          "score": 65,
          "phonemes": [
            { "sound": "o", "accuracy": 88, "feedback": "Good" },
            { "sound": "m", "accuracy": 42, "feedback": "Try making this more nasal" }
          ]
        }
      ]
    },
    "fluency": {
      "score": 78,
      "pace": "good",
      "pauses": {
        "count": 2,
        "average_length": "0.8s",
        "feedback": "Natural pause timing"
      },
      "rhythm": "slightly_choppy",
      "suggestions": [
        "Try to connect words more smoothly",
        "The pace is good - don't rush"
      ]
    },
    "intonation": {
      "score": 70,
      "pattern": "question_rising",
      "accuracy": "mostly_correct",
      "feedback": "Good question intonation, but could rise more at the end"
    }
  },
  "next_steps": [
    "Practice the 'ó' sound in 'cómo' - it should be more open",
    "Work on connecting words smoothly",
    "Great job with the question intonation!"
  ],
  "similar_words_to_practice": ["como", "dónde", "cuándo"],
  "audio_examples": {
    "target_pronunciation": "https://cdn.linguaai.com/pronunciation/como_esta_usted.mp3",
    "user_pronunciation": "https://cdn.linguaai.com/user_audio/voice_456789.mp3"
  }
}
```

**Technical note:** The pronunciation analysis uses a combination of the Web Speech API and some custom algorithms I built. It's not as accurate as professional speech therapy software, but it's good enough to help learners improve. I'm constantly tweaking the scoring algorithm based on user feedback.

## Error Handling

I tried to make error messages actually helpful instead of just returning generic HTTP codes.

### Error Response Format
```json
{
  "error": {
    "code": "CONVERSATION_EXPIRED",
    "message": "This conversation has been inactive for more than 24 hours",
    "details": {
      "conversation_id": "conv_789012",
      "expired_at": "2024-03-14T15:00:00Z",
      "suggestion": "Start a new conversation to continue practicing"
    },
    "request_id": "req_abc123def456"
  }
}
```

### Common Error Codes

| Code | HTTP Status | What It Means | What To Do |
|------|-------------|---------------|------------|
| `INVALID_LANGUAGE` | 400 | You specified a language I don't support yet | Check the supported languages list |
| `AI_SERVICE_BUSY` | 503 | OpenAI is having issues (happens more than I'd like) | Try again in a few seconds |
| `AUDIO_TOO_LONG` | 400 | Audio clip is longer than 60 seconds | Break it into smaller chunks |
| `RATE_LIMITED` | 429 | You're making requests too fast | Wait a bit, then try again |
| `CONVERSATION_EXPIRED` | 410 | Conversation is too old to continue | Start a new conversation |

### Retry Logic Example

OpenAI's API can be flaky, so here's the retry logic I use in my own client:

```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      if (error.status >= 500 && i < maxRetries - 1) {
        console.log(`Server error, retrying in ${1000 * (i + 1)}ms`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

## SDK Examples

### JavaScript/Node.js

I built a simple JavaScript wrapper that handles authentication and retries:

```bash
npm install linguaai-sdk
```

```javascript
const LinguaAI = require('linguaai-sdk');

const client = new LinguaAI({
  apiKey: 'your_api_key_here',
  // baseUrl: 'http://localhost:3000/api' // for local development
});

// Start a conversation
async function startPracticeSession() {
  try {
    const conversation = await client.conversations.create({
      topic: 'coffee_shop',
      language: 'spanish',
      difficulty: 'beginner'
    });
    
    console.log(`Started conversation: ${conversation.id}`);
    console.log(`AI says: ${conversation.opening_message.text}`);
    
    // Send a message
    const response = await client.conversations.sendMessage(conversation.id, {
      content: 'Hola, quiero un café con leche, por favor'
    });
    
    console.log(`AI replied: ${response.ai_response.text}`);
    console.log(`Grammar score: ${response.user_message.analysis.grammar_score}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

startPracticeSession();
```

### React Hook Example

For React apps, I made a custom hook that handles the conversation state:

```jsx
import { useConversation } from 'linguaai-sdk/react';

function ConversationApp() {
  const { 
    conversation, 
    messages, 
    sendMessage, 
    isLoading, 
    error 
  } = useConversation({
    topic: 'restaurant',
    language: 'spanish',
    difficulty: 'intermediate'
  });

  const handleSendMessage = async (text) => {
    try {
      await sendMessage(text);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <p>{msg.content}</p>
            {msg.analysis && (
              <small>Grammar: {msg.analysis.grammar_score}%</small>
            )}
          </div>
        ))}
      </div>
      
      <MessageInput 
        onSend={handleSendMessage} 
        disabled={isLoading}
      />
    </div>
  );
}
```

## Webhooks (Beta)

I added webhooks so you can get notified when users make progress. This is still pretty experimental.

### Setting Up Webhooks

1. Go to your dashboard at `/dashboard/webhooks`
2. Add your endpoint URL (must be HTTPS)
3. Select which events you want to receive
4. Save your webhook secret for verification

### Available Events

```javascript
// User completed a conversation
{
  "event": "conversation.completed",
  "timestamp": "2024-03-15T15:25:00Z",
  "data": {
    "user_id": "user_123456",
    "conversation_id": "conv_789012",
    "duration_minutes": 15,
    "messages_exchanged": 12,
    "final_scores": {
      "grammar": 84,
      "pronunciation": 78,
      "confidence": 72
    },
    "achievements_unlocked": ["first_restaurant_conversation"]
  }
}

// User made significant progress
{
  "event": "user.milestone_reached",
  "timestamp": "2024-03-15T16:00:00Z",
  "data": {
    "user_id": "user_123456",
    "milestone": "conversation_confidence_threshold",
    "details": {
      "confidence_score": 75,
      "improvement_this_week": 15,
      "conversations_completed": 10
    }
  }
}
```

### Webhook Verification

```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    """Verify that the webhook actually came from LinguaAI"""
    expected = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, f"sha256={expected}")

# Example Flask handler
@app.route('/webhooks/linguaai', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-LinguaAI-Signature')
    payload = request.data.decode('utf-8')
    
    if not verify_webhook_signature(payload, signature, WEBHOOK_SECRET):
        return 'Invalid signature', 403
    
    event_data = json.loads(payload)
    
    if event_data['event'] == 'conversation.completed':
        # Update your user's progress tracking
        update_user_progress(event_data['data'])
    
    return 'OK', 200
```

## Rate Limits & Fair Usage

Since this is a student project running on a limited budget, I have to be reasonable about rate limits:

| Endpoint Category | Free Tier | Premium | Notes |
|------------------|-----------|---------|-------|
| **Conversations** | 50/day | 500/day | Main bottleneck is OpenAI costs |
| **Voice Analysis** | 20/day | 200/day | Processing-intensive |
| **Progress API** | 1000/day | 10000/day | Lightweight queries |
| **Authentication** | 100/hour | 1000/hour | Prevent brute force |

**Fair usage policy:** I built this to help people learn languages, not to be abused by bots. If you're building something cool, just email me and we can figure out higher limits.

## Known Issues & Limitations

Being honest about what doesn't work perfectly yet:

1. **Voice recognition accuracy varies by accent** - Works best with American/British English speakers learning Spanish/French. I'm working on better accent handling.

2. **AI sometimes gets confused in very long conversations** - After about 50 exchanges, context management gets tricky. I'm planning to implement better conversation summarization.

3. **Limited language support** - Currently only Spanish and French are well-supported. German is coming next.

4. **Pronunciation scoring is subjective** - What I consider "good" pronunciation might differ from a native speaker's opinion. Take the scores as guidance, not gospel.

5. **No offline mode yet** - Everything requires internet connection. Working on caching for basic functionality.

## Feedback & Support

This is my first real API, so I'm sure there are rough edges. If you:
- Find bugs or confusing behavior
- Have ideas for improvements
- Want to integrate this into something cool
- Just want to chat about language learning tech

Please reach out! You can:
- Open an issue on GitHub
- [Email](priscilla.chuhui.ong@gmail.com) me
- Find me on Discord: @hiorhey

I'm especially interested in hearing from:
- Other students building language learning tools
- Teachers who might want to use this with their classes
- Native speakers who can help improve the pronunciation analysis

---

*Built with ❤️ and lots of ☕ by a college student who thinks language learning should be more fun. API documentation last updated: March 2024*
