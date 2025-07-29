# Development Guide

*Complete guide for developers to set up, contribute to, and extend LinguaAI*

## Quick Start

### Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - comes with Node.js
- **Git** - [Installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/linguaai.git
cd linguaai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Database (for production)
DATABASE_URL=postgresql://username:password@localhost:5432/linguaai

# Authentication (for production)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Voice Recognition (optional)
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_region

# Development flags
NODE_ENV=development
MOCK_AI_SERVICE=true  # Set to false to use real OpenAI
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Visit [http://localhost:3000](http://localhost:3000) to see the application running.

### First Steps

1. **Try the demo**: Navigate to `/demo-working.html` for a fully functional standalone demo
2. **Explore the codebase**: Start with `src/app/page.tsx` to understand the main application structure
3. **Test voice features**: Make sure your microphone is working and try the voice conversation feature
4. **Check the console**: Open browser dev tools to see debug information and API calls

## Project Structure

```
linguaai/
├── public/                 # Static assets
│   ├── icons/             # PWA icons and favicons
│   └── audio/             # Audio files for UI feedback
├── src/
│   ├── app/               # Next.js 15 App Router
│   │   ├── globals.css    # Global styles (Tailwind)
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── MainApp.tsx    # Main application component
│   │   ├── conversation/  # Conversation-related components
│   │   └── dashboard/     # Dashboard and analytics
│   ├── lib/               # Utility libraries and services
│   │   ├── ai/            # AI service integration
│   │   ├── voice/         # Voice recognition handling
│   │   ├── gamification/  # XP, achievements, leaderboards
│   │   ├── learning/      # Adaptive learning algorithms
│   │   └── realtime/      # WebSocket and real-time features
│   └── types/             # TypeScript type definitions
├── docs/                  # Project documentation
├── demo-working.html      # Standalone functional demo
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

### Key Files Overview

**Core Application:**
- `src/app/page.tsx` - Main landing page and app entry point
- `src/components/MainApp.tsx` - Primary React component with all features
- `demo-working.html` - Complete standalone demo (great for testing)

**AI & Learning:**
- `src/lib/ai/conversation-engine.ts` - AI conversation logic and prompt management
- `src/lib/ai/mock-ai-service.ts` - Mock AI service for development without API costs
- `src/lib/learning/adaptive-system.ts` - Personalized learning algorithm

**Voice Features:**
- `src/lib/voice/voice-handler.ts` - Web Speech API integration and audio processing
- Voice recognition configuration and pronunciation analysis

**Gamification:**
- `src/lib/gamification/game-engine.ts` - XP system, achievements, and progress tracking
- `src/lib/gamification/mock-game-data.ts` - Sample data for development

## Development Environment

### VS Code Setup

Install these recommended extensions for the best development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

**Workspace settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Create production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler check

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage report

# Utilities
npm run clean           # Clean build artifacts
npm run analyze         # Analyze bundle size
```

### Development Workflow

1. **Feature Development**:
   ```bash
   git checkout -b feature/conversation-scenarios
   # Make your changes
   npm run dev  # Test locally
   npm run test # Run tests
   npm run lint # Check code style
   ```

2. **Testing Changes**:
   - Use `demo-working.html` for quick functional testing
   - Main app at `localhost:3000` for integration testing
   - Check browser console for errors or warnings

3. **Before Committing**:
   ```bash
   npm run type-check  # Ensure TypeScript compiles
   npm run lint        # Fix any linting issues
   npm run test        # All tests should pass
   ```

## Testing Strategy

### Test Structure

```
src/
├── __tests__/          # Unit tests
├── components/
│   └── __tests__/      # Component tests
└── lib/
    └── __tests__/      # Library/utility tests
```

### Running Tests

**Unit Tests** (Jest + React Testing Library):
```bash
npm run test                    # Run all tests
npm run test -- --watch        # Watch mode
npm run test -- --coverage     # Coverage report
npm run test conversation      # Run specific test files
```

**Component Testing Example**:
```typescript
// src/components/__tests__/MainApp.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MainApp } from '../MainApp';

describe('MainApp', () => {
  test('starts new conversation when button clicked', async () => {
    render(<MainApp />);
    
    const startButton = screen.getByText('Start Conversation');
    fireEvent.click(startButton);
    
    expect(await screen.findByText('AI')).toBeInTheDocument();
  });

  test('handles voice input correctly', async () => {
    // Mock Web Speech API
    const mockSpeechRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn()
    };
    global.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);
    
    render(<MainApp />);
    
    const voiceButton = screen.getByLabelText('Start voice recording');
    fireEvent.click(voiceButton);
    
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });
});
```

**AI Service Testing**:
```typescript
// src/lib/ai/__tests__/conversation-engine.test.ts
import { ConversationEngine } from '../conversation-engine';
import { MockAIService } from '../mock-ai-service';

describe('ConversationEngine', () => {
  let engine: ConversationEngine;
  
  beforeEach(() => {
    engine = new ConversationEngine(new MockAIService());
  });

  test('generates contextual responses', async () => {
    const response = await engine.generateResponse(
      'Bonjour',
      { language: 'french', context: 'restaurant' }
    );
    
    expect(response.text).toContain('restaurant');
    expect(response.language).toBe('french');
    expect(response.analysis.grammarScore).toBeGreaterThan(0);
  });
});
```

### E2E Testing with Playwright

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed
```

**E2E Test Example**:
```typescript
// tests/conversation-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete conversation flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Start conversation
  await page.click('[data-testid="start-conversation"]');
  
  // Send message
  await page.fill('[data-testid="message-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');
  
  // Check AI response
  await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  
  // Check grammar analysis
  await expect(page.locator('[data-testid="grammar-score"]')).toContainText('%');
});
```

## Architecture Deep Dive

### State Management

**Local State Strategy**: Using React's built-in state management with Context API for global state.

```typescript
// src/lib/context/AppContext.tsx
interface AppState {
  user: User | null;
  conversation: Conversation | null;
  progress: LearningProgress;
  settings: UserSettings;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>();

// Usage in components
const { state, dispatch } = useContext(AppContext);
```

**State Updates**:
```typescript
// Update conversation state
dispatch({
  type: 'ADD_MESSAGE',
  payload: {
    message: newMessage,
    analysis: grammarAnalysis
  }
});

// Update user progress
dispatch({
  type: 'UPDATE_PROGRESS',
  payload: {
    xp: state.progress.xp + earnedXP,
    streak: newStreak
  }
});
```

### AI Integration Architecture

**Service Layer Pattern**:
```typescript
interface AIService {
  generateResponse(message: string, context: ConversationContext): Promise<AIResponse>;
  analyzeGrammar(text: string, language: string): Promise<GrammarAnalysis>;
  analyzePronunciation(audio: Blob, text: string): Promise<PronunciationAnalysis>;
}

class OpenAIService implements AIService {
  async generateResponse(message: string, context: ConversationContext) {
    const prompt = this.buildPrompt(message, context);
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    return this.parseResponse(response);
  }
}

class MockAIService implements AIService {
  // Implementation for development without API costs
}
```

**Conversation Engine**:
```typescript
class ConversationEngine {
  constructor(private aiService: AIService) {}
  
  async processMessage(message: string, context: ConversationContext) {
    // 1. Analyze user input
    const grammarAnalysis = await this.aiService.analyzeGrammar(
      message, 
      context.language
    );
    
    // 2. Generate contextual response
    const aiResponse = await this.aiService.generateResponse(message, {
      ...context,
      userLevel: grammarAnalysis.estimatedLevel,
      previousMessages: context.history
    });
    
    // 3. Update conversation state
    const conversationUpdate = {
      userMessage: { text: message, analysis: grammarAnalysis },
      aiResponse: aiResponse,
      timestamp: new Date()
    };
    
    return conversationUpdate;
  }
}
```

### Voice Processing Pipeline

```typescript
class VoiceHandler {
  private recognition: SpeechRecognition;
  private synthesis: SpeechSynthesis;
  
  async startRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      this.recognition.onerror = reject;
      this.recognition.start();
    });
  }
  
  async analyzePronunciation(audioBlob: Blob, expectedText: string) {
    // Send to pronunciation analysis service
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('text', expectedText);
    
    const response = await fetch('/api/voice/analyze', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
  
  speak(text: string, language: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    this.synthesis.speak(utterance);
  }
}
```

## API Integration

### OpenAI Integration

**Configuration**:
```typescript
// src/lib/ai/openai-config.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side demos
});

export const MODELS = {
  conversation: 'gpt-4',
  grammar: 'gpt-3.5-turbo',
  translation: 'gpt-3.5-turbo'
} as const;
```

**Prompt Engineering**:
```typescript
export function buildConversationPrompt(
  userMessage: string,
  context: ConversationContext
): string {
  return `
You are ${context.aiPersona.name}, a ${context.aiPersona.role} in a ${context.scenario} scenario.

User's language level: ${context.userLevel}
Target language: ${context.language}
Learning focus: ${context.learningGoals.join(', ')}

Previous conversation:
${context.history.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

User just said: "${userMessage}"

Respond naturally as ${context.aiPersona.name} would, considering:
1. Keep language appropriate for ${context.userLevel} level
2. Gently correct major errors without being pedantic
3. Encourage continued conversation
4. Stay in character and scenario

Format your response as JSON:
{
  "text": "Your response in ${context.language}",
  "translation": "English translation",
  "pronunciation_tips": ["tip1", "tip2"],
  "grammar_explanation": "Brief explanation if correction needed",
  "cultural_note": "Optional cultural context"
}
`;
}
```

### Error Handling

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function makeAPICall<T>(
  apiCall: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        // Don't retry client errors
        throw error;
      }
      
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

## Contributing Guidelines

### Code Style

We use **Prettier** and **ESLint** to maintain consistent code style.

**Prettier Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

**ESLint Configuration** (`.eslintrc.json`):
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Git Workflow

1. **Fork the repository** and create a feature branch
2. **Make atomic commits** with clear messages
3. **Write tests** for new functionality
4. **Update documentation** for API changes
5. **Submit a pull request** with description

**Commit Message Format**:
```
type(scope): brief description

- Longer description if needed
- What changed and why
- Any breaking changes

Closes #issue-number
```

**Examples**:
```bash
feat(voice): add pronunciation feedback with visual indicators

- Implement real-time pronunciation scoring
- Add visual feedback for phoneme accuracy
- Include audio examples for corrections

Closes #156

fix(ai): handle OpenAI rate limit errors gracefully

- Add exponential backoff retry logic
- Show user-friendly error messages
- Fall back to mock service in development

Closes #203
```

### Pull Request Process

1. **Ensure CI passes**: All tests, linting, and type checking
2. **Update documentation**: README, API docs, or inline comments
3. **Add screenshots**: For UI changes
4. **Describe changes**: What, why, and how
5. **Link issues**: Reference related issues or discussions

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Code Review Guidelines

**As a Reviewer**:
- Focus on logic, readability, and maintainability
- Suggest improvements, don't just point out problems
- Be respectful and constructive
- Test the changes locally when possible

**As an Author**:
- Respond to all feedback
- Make requested changes or explain why not
- Keep discussions focused on the code
- Be open to suggestions and learning

## Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

### Environment Configuration

**Production Environment Variables**:
```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
OPENAI_API_KEY=your_production_key
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_production_secret
```

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**: Automatic on push to main branch

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "OPENAI_API_KEY": "@openai-api-key",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=linguaai
      - POSTGRES_USER=linguaai
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Audit for security vulnerabilities
npm audit
```

### Web Vitals Optimization

**Core Web Vitals targets**:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**Optimization strategies implemented**:
```typescript
// 1. Code splitting with dynamic imports
const VoiceRecorder = dynamic(() => import('./VoiceRecorder'), {
  loading: () => <div>Loading voice recorder...</div>,
  ssr: false // Client-side only for microphone access
});

// 2. Image optimization
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="AI Avatar"
  width={64}
  height={64}
  priority // For above-the-fold images
/>

// 3. Font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});
```

### Caching Strategy

```typescript
// Service Worker for offline functionality
// public/sw.js
const CACHE_NAME = 'linguaai-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// API response caching
const cache = new Map();

async function cachedAPICall(key: string, apiCall: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await apiCall();
  cache.set(key, result);
  
  // Expire after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return result;
}
```

## Troubleshooting

### Common Issues

**Issue: "Module not found" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript compilation errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Issue: OpenAI API errors**
- Check API key in `.env.local`
- Verify rate limits haven't been exceeded
- Set `MOCK_AI_SERVICE=true` for development

**Issue: Voice features not working**
- Ensure HTTPS (required for microphone access)
- Check browser permissions
- Test with different browsers

**Issue: Build fails in production**
```bash
# Check for environment-specific issues
npm run build
npm run start

# Debug build process
npm run build -- --debug
```

### Debugging Tools

**React Developer Tools**:
- Install browser extension
- Inspect component state and props
- Profile performance

**Next.js Debug Mode**:
```bash
NODE_OPTIONS='--inspect' npm run dev
```

**Console Debugging**:
```typescript
// Add debug logs (remove before production)
console.log('Conversation state:', conversationState);
console.log('API response:', response);

// Use debugger in development
if (process.env.NODE_ENV === 'development') {
  debugger;
}
```

### Performance Monitoring

```typescript
// Web Vitals measurement
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// Custom performance marks
performance.mark('conversation-start');
// ... conversation logic
performance.mark('conversation-end');
performance.measure('conversation-duration', 'conversation-start', 'conversation-end');
```

## Advanced Topics

### Custom AI Models

For advanced users who want to integrate custom language models:

```typescript
interface CustomAIProvider {
  modelName: string;
  apiEndpoint: string;
  authenticate(): Promise<string>;
  generateResponse(prompt: string): Promise<string>;
}

class HuggingFaceProvider implements CustomAIProvider {
  constructor(private apiKey: string, public modelName: string) {}
  
  async authenticate() {
    return `Bearer ${this.apiKey}`;
  }
  
  async generateResponse(prompt: string) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${this.modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': await this.authenticate(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });
    
    return response.json();
  }
}
```

### Internationalization (i18n)

```typescript
// lib/i18n.ts
export const messages = {
  en: {
    'conversation.start': 'Start Conversation',
    'conversation.end': 'End Conversation',
    'progress.xp': 'XP Earned: {xp}'
  },
  es: {
    'conversation.start': 'Iniciar Conversación',
    'conversation.end': 'Terminar Conversación',
    'progress.xp': 'XP Ganado: {xp}'
  }
};

export function t(key: string, params: Record<string, any> = {}) {
  const locale = getCurrentLocale();
  let message = messages[locale]?.[key] || messages.en[key] || key;
  
  // Replace parameters
  Object.entries(params).forEach(([param, value]) => {
    message = message.replace(`{${param}}`, value);
  });
  
  return message;
}
```

### Real-time Features with WebSockets

```typescript
// lib/realtime/websocket-client.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  
  connect(userId: string) {
    this.ws = new WebSocket(`wss://api.linguaai.com/ws?userId=${userId}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }
  
  sendMessage(message: ConversationMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'conversation_message',
        data: message
      }));
    }
  }
  
  private handleMessage(data: any) {
    switch (data.type) {
      case 'ai_response':
        this.onAIResponse(data.message);
        break;
      case 'friend_activity':
        this.onFriendActivity(data.activity);
        break;
    }
  }
}
```

---

*This development guide is maintained by the LinguaAI team. For questions or suggestions, please open an issue or start a discussion in our GitHub repository.*
