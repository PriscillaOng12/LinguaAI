import { z } from 'zod';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Speech synthesis and recognition types
export interface SpeechConfig {
  language: string;
  accent?: string;
  speed: number;
  pitch: number;
  volume: number;
}

export interface PronunciationAssessment {
  accuracy_score: number;
  fluency_score: number;
  completeness_score: number;
  overall_score: number;
  word_scores: Array<{
    word: string;
    accuracy_score: number;
    error_type?: 'mispronunciation' | 'omission' | 'insertion';
  }>;
  feedback: string;
  suggestions: string[];
}

export interface VoiceActivity {
  is_speaking: boolean;
  confidence: number;
  timestamp: number;
}

export class VoiceHandler {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isPlaying: boolean = false;
  private config: SpeechConfig;
  private onResultCallback?: (text: string, confidence: number) => void;
  private onActivityCallback?: (activity: VoiceActivity) => void;

  constructor(config: SpeechConfig) {
    this.config = config;
    this.initializeSpeechAPIs();
  }

  private initializeSpeechAPIs(): void {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.config.language;
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onActivityCallback?.({
            is_speaking: false,
            confidence: 0,
            timestamp: Date.now()
          });
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onActivityCallback?.({
            is_speaking: false,
            confidence: 0,
            timestamp: Date.now()
          });
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1];
          const text = result[0].transcript;
          const confidence = result[0].confidence;

          if (result.isFinal) {
            this.onResultCallback?.(text, confidence);
          }

          this.onActivityCallback?.({
            is_speaking: true,
            confidence,
            timestamp: Date.now()
          });
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          this.isListening = false;
        };
      }
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Start listening for speech input
   */
  startListening(onResult: (text: string, confidence: number) => void, onActivity?: (activity: VoiceActivity) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.onResultCallback = onResult;
      this.onActivityCallback = onActivity;

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech input
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Convert text to speech and play it
   */
  async speak(text: string, options?: Partial<SpeechConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (this.isPlaying) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const config = { ...this.config, ...options };

      // Find appropriate voice
      const voices = this.synthesis.getVoices();
      const voice = voices.find(v => 
        v.lang.startsWith(config.language) || 
        v.lang === config.language
      );

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = config.speed;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;

      utterance.onstart = () => {
        this.isPlaying = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech playback
   */
  stopSpeaking(): void {
    if (this.synthesis && this.isPlaying) {
      this.synthesis.cancel();
      this.isPlaying = false;
    }
  }

  /**
   * Assess pronunciation quality (simulated - would integrate with actual pronunciation API)
   */
  async assessPronunciation(
    targetText: string, 
    spokenText: string, 
    audioData?: Blob
  ): Promise<PronunciationAssessment> {
    // This is a simplified simulation - in a real implementation, 
    // you would integrate with Azure Speech Services, Google Speech API, or similar
    
    const targetWords = targetText.toLowerCase().split(' ');
    const spokenWords = spokenText.toLowerCase().split(' ');
    
    // Simple word matching for demonstration
    const wordScores = targetWords.map(targetWord => {
      const closestMatch = spokenWords.find(spokenWord => 
        this.calculateSimilarity(targetWord, spokenWord) > 0.7
      );
      
      const accuracy = closestMatch ? 
        this.calculateSimilarity(targetWord, closestMatch) * 100 : 0;
      
      return {
        word: targetWord,
        accuracy_score: accuracy,
        error_type: accuracy < 70 ? 'mispronunciation' as const : undefined
      };
    });

    const averageAccuracy = wordScores.reduce((sum, score) => sum + score.accuracy_score, 0) / wordScores.length;
    
    // Simulate other metrics
    const fluency_score = Math.max(0, averageAccuracy - Math.random() * 10);
    const completeness_score = (spokenWords.length / targetWords.length) * 100;
    const overall_score = (averageAccuracy + fluency_score + completeness_score) / 3;

    const feedback = this.generatePronunciationFeedback(overall_score, wordScores);
    const suggestions = this.generatePronunciationSuggestions(wordScores);

    return {
      accuracy_score: averageAccuracy,
      fluency_score,
      completeness_score,
      overall_score,
      word_scores: wordScores,
      feedback,
      suggestions
    };
  }

  /**
   * Get available voices for the target language
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    
    return this.synthesis.getVoices().filter(voice => 
      voice.lang.startsWith(this.config.language)
    );
  }

  /**
   * Update speech configuration
   */
  updateConfig(newConfig: Partial<SpeechConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.recognition && newConfig.language) {
      this.recognition.lang = newConfig.language;
    }
  }

  /**
   * Check if voice features are supported
   */
  isSupported(): {
    recognition: boolean;
    synthesis: boolean;
  } {
    return {
      recognition: !!this.recognition,
      synthesis: !!this.synthesis
    };
  }

  /**
   * Get current listening state
   */
  getListeningState(): boolean {
    return this.isListening;
  }

  /**
   * Get current playing state
   */
  getPlayingState(): boolean {
    return this.isPlaying;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance implementation
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength;
  }

  private generatePronunciationFeedback(score: number, wordScores: Array<{word: string; accuracy_score: number}>): string {
    if (score >= 90) {
      return "Excellent pronunciation! Your speech is very clear and accurate.";
    } else if (score >= 75) {
      return "Good pronunciation! There are a few areas where you can improve clarity.";
    } else if (score >= 60) {
      return "Fair pronunciation. Focus on articulation and practice the challenging words.";
    } else {
      return "Pronunciation needs improvement. Consider slowing down and focusing on individual sounds.";
    }
  }

  private generatePronunciationSuggestions(wordScores: Array<{word: string; accuracy_score: number}>): string[] {
    const suggestions = [];
    const poorWords = wordScores.filter(score => score.accuracy_score < 70);
    
    if (poorWords.length > 0) {
      suggestions.push(`Practice these words: ${poorWords.map(w => w.word).join(', ')}`);
    }
    
    suggestions.push("Try speaking more slowly and clearly");
    suggestions.push("Focus on proper mouth positioning for difficult sounds");
    suggestions.push("Listen to native speakers and repeat after them");
    
    return suggestions;
  }
}

// Audio utilities
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// Voice interaction hooks and utilities
export function createVoiceSession(language: string) {
  const voiceHandler = new VoiceHandler({
    language,
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  });

  return voiceHandler;
}
