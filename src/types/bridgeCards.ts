export type CardMode =
  | "menu"
  | "warmup"
  | "partner"
  | "realPartner"
  | "voicePractice"
  | "complete";
export type StudentRole = "A" | "B";

export interface WarmupCard {
  id: number;
  front: string;
  back: string;
  audio: string;
}

export interface PartnerCard {
  id: number;
  question: string;
  expected: string;
  keywords: string[];
}

export interface BridgeCardState {
  mode: CardMode;
  lastPlayedMode: CardMode | null;
  currentCard: number;
  isFlipped: boolean;
  masteredCards: number[];
  reviewCards: number[];
  userAnswer: string;
  feedback: string;
  streak: number;
  todayCount: number;
  studentRole: StudentRole;
  showAnswer: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export interface BridgeStudentProfile {
  id: number;
  name: string;
  totalMastered: number;
  levelName: string;
  createdAt: string;
}

export interface BridgeCardRecord {
  id: number; // ID Database
  category: CardMode;
  contentFront: string;
  contentBack: string;
  keywords?: string[];
  audioAsset?: string;
}

export interface BridgeStudentAccount {
  id: number;
  name: string;
  email: string;
  studentCode: string;
  totalMastered: number;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export interface VoiceCorrection {
  wrong: string;
  right: string;
  explanation: string;
}

export interface VoiceAnalysisResult {
  grammarScore: number;
  vocabScore: number;
  pronunciationScore: number;
  corrections: VoiceCorrection[];
  overallFeedback: string;
}

/** Extended result returned by /chat/analyze — includes daily session credit status. */
export interface ChatAnalysisResult extends VoiceAnalysisResult {
  /** true = first session today, credits awarded; false = already credited today */
  sessionCredited: boolean;
}
