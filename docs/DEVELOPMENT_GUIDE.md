# Development Guide

*How to set up, contribute to, and extend LinguaAI - written by someone who learned most of this while building it*

## Quick Start (The "I Just Want It Working" Version)

### Prerequisites

You'll need these installed. If you don't have them, don't worry - I'll explain where to get them:

- **Node.js** (v18.0.0+) - [Download here](https://nodejs.org/). I recommend getting the LTS version.
- **npm** (comes with Node.js) - Package manager for JavaScript
- **Git** - [Installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- **VS Code** (highly recommended) - [Download here](https://code.visualstudio.com/). You could use other editors, but the extensions I recommend are VS Code specific.

**Optional but helpful:**
- **Postman** or **Insomnia** for testing API endpoints
- **Chrome DevTools** knowledge (F12 in Chrome)

### The 5-Minute Setup

I optimized this for people who just want to see if it works before diving deep:

1. **Clone and install**
```bash
git clone https://github.com/PriscillaOng12/LinguaAI.git
cd linguaai
npm install
```

If `npm install` takes forever or fails, try:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

2. **Environment setup**
```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and add:
```env
# For development, you can leave this blank to use mock mode
OPENAI_API_KEY=

# Optional: Set to true to use mock AI responses (no API costs)
MOCK_AI_SERVICE=true

# Development mode
NODE_ENV=development

# Database (only needed if you want user accounts)
DATABASE_URL=

# If you want to test voice features
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Go to [http://localhost:3000](http://localhost:3000). You should see the app running!

### Quick Test Run

Before you start changing code, try these to make sure everything works:

1. **Try the standalone demo**: Open `public/demo.html` in your browser - this works without any setup
2. **Test the main app**: Click "Start Conversation" on the homepage
3. **Try voice features**: Click the microphone button (you'll need to allow microphone access)
4. **Check the console**: Open browser dev tools (F12) to see if there are any errors

**If something breaks:** Check the browser console first, then the terminal where you ran `npm run dev`. Most issues are missing environment variables or Node.js version problems.

## Project Structure (The Tourist Guide)

This is how I organized everything. It made sense to me, but I'm open to suggestions:

```
linguaai/
├── public/                 # Static files (images, icons, demo)
│   ├── icons/             # PWA icons (for mobile install)
│   ├── audio/             # Sound effects and samples
│   └── demo.html          # Standalone demo (great for testing)
├── src/
│   ├── app/               # Next.js 15 App Router (the new way)
│   │   ├── globals.css    # Global styles using Tailwind
│   │   ├── layout.tsx     # Root layout (nav, footer, etc.)
│   │   ├── page.tsx       # Homepage
│   │   └── api/           # API routes (backend endpoints)
│   ├── components/        # React components
│   │   ├── MainApp.tsx    # Main app component (most features)
│   │   ├── conversation/  # Chat interface components
│   │   ├── voice/         # Voice recording and playback
│   │   └── progress/      # Progress tracking and analytics
│   ├── lib/               # Utility libraries and services
│   │   ├── ai/            # AI service integration and prompts
│   │   ├── voice/         # Speech recognition and synthesis
│   │   ├── gamification/  # XP, achievements, progress tracking
│   │   ├── learning/      # Adaptive learning algorithms
│   │   └── utils/         # Helper functions and utilities
│   └── types/             # TypeScript type definitions
├── docs/                  # Project documentation (this file!)
├── tests/                 # Test files (I should write more...)
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS setup
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

### Key Files You'll Want to Know About

**If you're just getting started:**
- `src/app/page.tsx` - The homepage, good starting point
- `src/components/MainApp.tsx` - Where most of the app logic lives
- `public/demo.html` - Standalone demo, great for understanding the flow

**If you want to understand the AI:**
- `src/lib/ai/conversation-engine.ts` - Main AI conversation logic
- `src/lib/ai/mock-ai-service.ts` - Mock service for development (no API costs)
- `src/lib/ai/prompts.ts` - All the prompt engineering I spent months on

**If you want to work on voice features:**
- `src/lib/voice/voice-handler.ts` - Web Speech API integration
- `src/lib/voice/pronunciation-analyzer.ts` - Custom pronunciation scoring

**If you're interested in the learning system:**
- `src/lib/learning/adaptive-system.ts` - How the app adapts to user performance
- `src/lib/gamification/achievement-system.ts` - XP and achievements logic

## Development Environment Setup

### VS Code Configuration (Highly Recommended)

I spent way too much time configuring this, so here's what works:

**Extensions you should install:**
1. **ES7+ React/Redux/React-Native snippets** - For React code snippets
2. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
3. **TypeScript Importer** - Auto-import TypeScript modules
4. **Prettier - Code formatter** - Consistent code formatting
5. **ESLint** - Catch errors before runtime
6. **Auto Rename Tag** - Rename HTML/JSX tags automatically
7. **GitLens** - Better Git integration

**Workspace settings** (create `.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

**Code snippets** (create `.vscode/snippets.json`):
```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "export default function ${1:ComponentName}({ $3 }: ${1:ComponentName}Props) {",
      "  return (",
      "    <div>$4</div>",
      "  );",
      "}"
    ]
  }
}
```

### Available Scripts (What Each One Does)

```bash
# Development
npm run dev              # Start dev server (hot reloading enabled)
npm run build           # Create production build
npm run start           # Start production server locally
npm run lint            # Check for code style issues
npm run lint:fix        # Fix auto-fixable linting issues
npm run type-check      # Check TypeScript without building

# Testing (I should do more of this...)
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode (re-runs on changes)
npm run test:coverage   # Generate test coverage report
npm run test:ui         # Run tests with UI (using Vitest UI)

# Utilities
npm run clean           # Remove build artifacts and node_modules
npm run analyze         # Analyze bundle size (helps find bloat)
npm run db:migrate      # Run database migrations (when implemented)
npm run db:seed         # Seed database with test data
```

### My Development Workflow

This is how I typically work on new features:

1. **Start the dev server**: `npm run dev`
2. **Open the app** in browser with DevTools open (F12)
3. **Check the demo first**: `public/demo.html` to understand expected behavior
4. **Make changes** in small increments
5. **Test in browser** - refresh and see what broke 😅
6. **Check console** for errors or warnings
7. **Run linting**: `npm run lint` before committing
8. **Test on mobile** using Chrome DevTools device emulation

**Pro tip**: I keep the browser console open all the time. React error messages are actually really helpful once you get used to them.

## Architecture Overview (The 30,000 Foot View)

### How It All Fits Together

I built this as a **single-page application (SPA)** with a **RESTful API backend**. Here's the data flow:

```
User Input → React Component → API Call → AI Service → Database → Response → UI Update
```

**Frontend (React/Next.js):**
- Handles all user interactions
- Manages conversation state
- Processes voice input/output
- Displays progress and analytics

**Backend (Next.js API Routes):**
- Authenticates users
- Manages conversation history
- Integrates with OpenAI
- Tracks learning progress

**External Services:**
- **OpenAI GPT-4**: Main conversation AI
- **Web Speech API**: Voice recognition (browser-based)
- **Vercel**: Hosting and deployment

### State Management Philosophy

I kept it simple with React's built-in state management:

```typescript
// Global state: React Context
const AppContext = createContext<AppState>();

// Local state: useState hooks
const [messages, setMessages] = useState<Message[]>([]);

// Server state: Custom hooks with caching
const { data: progress } = useProgress();
```

**Why I didn't use Redux:** For this project size, React Context + useState was enough. Redux felt like overkill and would have slowed down development.

**State structure:**
- **User state**: Authentication, preferences, progress
- **Conversation state**: Current conversation, message history
- **UI state**: Loading states, modals, notifications
- **Cache state**: API responses, voice recordings

## AI Integration Deep Dive

### How I Built the Conversation Engine

This was the hardest part of the project. Here's what I learned:

**The Challenge**: Making GPT-4 act like a consistent language tutor who remembers context and adapts to user level.

**My Solution**: Custom prompt engineering + conversation context management.

```typescript
// Simplified version of my conversation engine
class ConversationEngine {
  async generateResponse(userMessage: string, context: ConversationContext) {
    // 1. Build the prompt with context
    const prompt = this.buildPrompt(userMessage, context);
    
    // 2. Call OpenAI with retries
    const response = await this.callOpenAI(prompt);
    
    // 3. Parse and validate response
    const parsedResponse = this.parseResponse(response);
    
    // 4. Update conversation context
    this.updateContext(context, userMessage, parsedResponse);
    
    return parsedResponse;
  }
  
  private buildPrompt(message: string, context: ConversationContext): string {
    return `
You are ${context.aiPersona.name}, a ${context.aiPersona.role}.
The user is learning ${context.language} at ${context.level} level.

Previous conversation:
${context.history.slice(-10).map(m => `${m.sender}: ${m.content}`).join('\n')}

User just said: "${message}"

Respond naturally, considering:
- Keep language appropriate for ${context.level} level
- Gently correct major errors
- Ask follow-up questions
- Stay in character

Response format:
{
  "text": "Your response in ${context.language}",
  "translation": "English translation", 
  "teaching_notes": ["Key grammar points", "Vocabulary tips"]
}
`;
  }
}
```

### Prompt Engineering Lessons

**What I learned the hard way:**

1. **Be specific about format**: GPT-4 is great but inconsistent without clear formatting instructions
2. **Context is everything**: Including recent conversation history made responses way more natural
3. **Personality matters**: Giving the AI a name and role made conversations feel more human
4. **Less is more**: My first prompts were 1000+ words. Shorter, focused prompts work better
5. **Test with edge cases**: What happens if the user says something inappropriate or completely off-topic?

**My prompt evolution:**
- **Version 1**: "You are a language tutor. Help the user learn Spanish."
- **Version 15**: *[2000 words of detailed instructions]*
- **Version 23** (current): *[Clean, focused, gets the job done]*

### Handling AI Failures

OpenAI's API isn't 100% reliable, so I built fallbacks:

```typescript
async function callAIWithFallbacks(prompt: string): Promise<AIResponse> {
  try {
    return await openAI.complete(prompt);
  } catch (error) {
    console.warn('OpenAI failed, trying backup strategies...');
    
    if (error.code === 'rate_limit_exceeded') {
      return await this.generateFallbackResponse(prompt);
    }
    
    if (error.code === 'service_unavailable') {
      return await this.getCachedResponse(prompt);
    }
    
    // Last resort: mock response
    return this.mockAIService.complete(prompt);
  }
}
```

## Voice Integration (The Tricky Part)

### Web Speech API Integration

Voice features were way harder than I expected. Here's what I learned:

**The Good:**
- Web Speech API is built into modern browsers
- No server-side processing needed
- Real-time speech recognition

**The Bad:**
- Browser support is inconsistent
- Accuracy varies wildly by accent
- Chrome works best, Safari is mediocre, Firefox is... complicated

**My implementation:**

```typescript
class VoiceHandler {
  private recognition: SpeechRecognition;
  
  constructor() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }
    
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.setupRecognition();
  }
  
  private setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-ES'; // Spanish recognition
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.onTranscript?.(transcript);
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.onError?.(event.error);
    };
  }
  
  startRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.onTranscript = resolve;
      this.onError = reject;
      this.recognition.start();
    });
  }
}
```

### Pronunciation Analysis

This was my biggest technical challenge. How do you score pronunciation programmatically?

**My approach:**
1. Use Web Speech API confidence scores
2. Compare recognized text with expected text
3. Phoneme-level analysis (basic)
4. User feedback integration

**The code (simplified):**

```typescript
class PronunciationAnalyzer {
  analyzePronunciation(audioBlob: Blob, expectedText: string): PronunciationScore {
    // This is obviously simplified - the real version is much more complex
    const recognizedText = this.speechToText(audioBlob);
    const similarity = this.textSimilarity(recognizedText, expectedText);
    const confidence = this.getConfidenceScore(audioBlob);
    
    return {
      score: Math.round((similarity + confidence) / 2),
      feedback: this.generateFeedback(recognizedText, expectedText),
      suggestions: this.getSuggestions(recognizedText, expectedText)
    };
  }
}
```

**Honestly**: Pronunciation scoring is still not perfect. It's more of a "directional guidance" than precise assessment. But users find it helpful, which is what matters.

## Testing Strategy (What I Actually Test)

### My Testing Philosophy

**Confession**: I didn't write tests from the beginning, and I regret it. Here's what I learned:

1. **Test user flows, not implementation details**
2. **Integration tests catch more real bugs than unit tests**
3. **Manual testing is still crucial for UX**
4. **Test error states - they happen more than you think**

### What I Test Now

**Unit Tests** (Jest + React Testing Library):
```typescript
// Example: Testing the conversation engine
describe('ConversationEngine', () => {
  it('generates appropriate responses for beginner level', async () => {
    const engine = new ConversationEngine();
    const response = await engine.generateResponse('Hola', {
      level: 'beginner',
      language: 'spanish'
    });
    
    expect(response.text).toBeDefined();
    expect(response.translation).toBeDefined();
    expect(response.difficulty).toBeLessThan(3); // On scale of 1-5
  });
  
  it('handles AI service failures gracefully', async () => {
    const engine = new ConversationEngine(new MockFailingAI());
    const response = await engine.generateResponse('Hello');
    
    expect(response.text).toContain('Sorry, I am having trouble');
  });
});
```

**Integration Tests** (Playwright):
```typescript
// Testing the full conversation flow
test('user can complete a conversation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Start conversation
  await page.click('[data-testid="start-conversation"]');
  await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  
  // Send message
  await page.fill('[data-testid="message-input"]', 'Hola');
  await page.click('[data-testid="send-button"]');
  
  // Check response
  await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  
  // Check grammar score appears
  await expect(page.locator('[data-testid="grammar-score"]')).toContainText('%');
});
```

**Manual Testing Checklist:**
- [ ] Conversation flow works on desktop
- [ ] Voice features work in Chrome/Safari
- [ ] Mobile responsive design works
- [ ] Error messages are helpful
- [ ] Loading states don't hang
- [ ] Offline mode degrades gracefully

### Running Tests

```bash
# Unit tests
npm run test                    # Run once
npm run test:watch             # Watch mode (re-runs on changes)
npm run test:coverage          # See test coverage

# Integration tests
npx playwright test            # Headless
npx playwright test --headed   # See browser
npx playwright test --debug    # Debug mode
```

## Deployment & DevOps

### Why I Chose Vercel

**The honest reasons:**
1. **It's free for students** (huge factor)
2. **Zero configuration** for Next.js
3. **Automatic deployments** from GitHub
4. **Built-in analytics** without extra setup
5. **Global CDN** makes the app fast worldwide

**The setup:**
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Push to main branch = automatic deployment
4. Preview deployments for pull requests

### Environment Variables for Production

```env
# Production environment variables
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
OPENAI_API_KEY=your_real_api_key
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_super_secret_key
```

### Deployment Process

My deployment workflow:

1. **Local development** with hot reloading
2. **Push to feature branch** for testing
3. **Create pull request** (gets preview deployment)
4. **Test preview deployment** to make sure it works
5. **Merge to main** (triggers production deployment)
6. **Monitor** for errors in production

**CI/CD Pipeline** (.github/workflows/deploy.yml):
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Contributing Guidelines

### How to Contribute (Please Do!)

I built this project because I believe language learning should be more accessible. If you want to help:

**Types of contributions I'd love:**
- 🐛 **Bug fixes** - especially voice/mobile issues
- 🌍 **Language support** - native speakers helping with conversation patterns
- 📱 **Mobile improvements** - making it work better on phones
- 🎯 **Accessibility** - making it usable for everyone
- 📚 **Documentation** - making setup easier for other students
- 🧪 **Testing** - writing tests I should have written from the start

### Code Style

I use Prettier and ESLint to keep code consistent:

```bash
# Format code
npm run lint:fix

# Check formatting
npm run lint
```

**My code style preferences:**
- **Descriptive variable names** - `conversationHistory` not `ch`
- **Small functions** - easier to test and understand
- **Comments for complex logic** - especially the AI prompt engineering
- **TypeScript for everything** - catches so many bugs
- **Consistent naming** - `camelCase` for variables, `PascalCase` for components

### Git Workflow

**Branch naming:**
- `feature/conversation-scenarios` - new features
- `fix/voice-recording-bug` - bug fixes
- `docs/api-examples` - documentation improvements

**Commit messages:**
```bash
git commit -m "feat: add Spanish conversation scenarios

- Implement restaurant, shopping, and travel scenarios
- Add cultural context notes for each scenario
- Update AI prompts for better Spanish responses

Closes #42"
```

**Pull Request Process:**
1. Fork the repo and create a feature branch
2. Make your changes with tests (if applicable)
3. Run `npm run lint` and `npm run type-check`
4. Push to your fork and create a pull request
5. Describe what you changed and why
6. Be patient with code review - I'm still learning too!

## Debugging Common Issues

### "It Doesn't Work!" Troubleshooting

**Issue: App won't start**
```bash
# Clear everything and start fresh
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

**Issue: OpenAI API errors**
- Check if your API key is correct in `.env.local`
- Make sure you have credit on your OpenAI account
- Set `MOCK_AI_SERVICE=true` to use mock responses instead

**Issue: Voice features don't work**
- Make sure you're using HTTPS (required for microphone access)
- Try Chrome first - it has the best Web Speech API support
- Check browser permissions for microphone access
- Test with different audio devices

**Issue: TypeScript compilation errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check types without building
npm run type-check
```

**Issue: Styles look broken**
- Make sure Tailwind CSS is properly configured
- Check if you're using the right class names
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)

### Debugging Tools I Use

**Browser DevTools:**
- **Console tab**: For JavaScript errors and logs
- **Network tab**: To see API requests and responses
- **Application tab**: To check localStorage and service workers
- **Device emulation**: To test mobile responsiveness

**VS Code debugging:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

**Useful debugging commands:**
```typescript
// Add these for debugging (remove before production)
console.log('Conversation state:', conversationState);
console.table(messages); // Nice table format for arrays
console.time('API call'); // Start timer
console.timeEnd('API call'); // End timer

// Breakpoint in development
if (process.env.NODE_ENV === 'development') {
  debugger;
}
```

## Performance Optimization

### What I Learned About Making Things Fast

**The biggest performance wins:**

1. **Code splitting**: Loading only what you need
```typescript
// Lazy load heavy components
const VoiceRecorder = dynamic(() => import('./VoiceRecorder'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Don't render on server
});
```

2. **Image optimization**: Using Next.js Image component
```typescript
import Image from 'next/image';

<Image
  src="/ai-avatar.jpg"
  alt="AI Avatar"
  width={64}
  height={64}
  priority // For above-the-fold images
/>
```

3. **API response caching**: Don't call expensive APIs repeatedly
```typescript
// Cache conversation responses
const conversationCache = new Map();

async function getCachedResponse(prompt: string) {
  if (conversationCache.has(prompt)) {
    return conversationCache.get(prompt);
  }
  
  const response = await openai.complete(prompt);
  conversationCache.set(prompt, response);
  return response;
}
```

### Bundle Analysis

```bash
# Check what's making your app big
npm run analyze

# Look for:
# - Huge libraries you don't really need
# - Duplicate dependencies
# - Code that could be lazy-loaded
```

## What I'd Do Differently

### Technical Decisions I'd Change

**State Management**: I'd probably use Zustand instead of React Context for global state. Context re-renders everything when state changes, which gets slow.

**Database**: I started without a database, then added one later. Planning data persistence from the beginning would have saved time.

**Testing**: I should have written tests from day one. Adding them later is painful and you miss bugs.

**API Design**: My first API was inconsistent. I wish I'd planned the endpoint structure better.

**Error Handling**: I built error handling reactively (when things broke). Proactive error handling would have made debugging easier.

### Product Decisions I'd Change

**Started too complex**: My first version tried to do everything. I should have started with just text conversations.

**Didn't talk to users enough**: I built features I thought were cool, then discovered users wanted different things.

**Perfectionism**: I spent too much time polishing small details instead of shipping and getting feedback.

### What Went Right

**Simple tech stack**: Next.js + TypeScript + Tailwind was a great choice. Everything works well together.

**Mobile-first**: Building for mobile from the start made the desktop version better too.

**Mock services**: Having mock AI responses saved tons of money during development.

**Documentation**: Writing documentation as I built features helped me think through the design.

## Resources That Helped Me

### Learning Resources

**Next.js:**
- [Next.js Documentation](https://nextjs.org/docs) - Actually really well written
- [Next.js Learn Course](https://nextjs.org/learn) - Interactive tutorials
- [Vercel's YouTube Channel](https://www.youtube.com/c/VercelHQ) - Great talks and tutorials

**React:**
- [React Documentation](https://react.dev/) - The new docs are fantastic
- [React Patterns](https://reactpatterns.com/) - Common patterns and best practices

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Comprehensive guide
- [Total TypeScript](https://totaltypescript.com/) - Advanced TypeScript patterns

**AI/OpenAI:**
- [OpenAI Documentation](https://platform.openai.com/docs) - API reference and guides
- [Prompt Engineering Guide](https://www.promptingguide.ai/) - How to write better prompts

### Tools I Use Daily

- **VS Code** with the extensions I mentioned above
- **Chrome DevTools** for debugging
- **Postman** for testing API endpoints
- **GitHub Desktop** because I'm not a command line hero
- **Figma** for quick UI mockups (free for students)

### Communities That Helped

- **Next.js Discord** - Super helpful community
- **r/reactjs** - Good for React questions
- **OpenAI Developer Forum** - For AI-specific issues
- **CS Discord servers** at my university - Peer support is invaluable

---

*Building this project taught me more than any class or tutorial. The best way to learn web development is to build something you actually want to use. Feel free to reach out if you get stuck or just want to chat about language learning tech!*

**[Email](mailto:priscilla.ong.chuhui@gmail.com)** | **[GitHub](https://github.com/PriscillaOng12)** | **Discord** @hiorhey
