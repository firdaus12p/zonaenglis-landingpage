export type CardMode =
  | "menu"
  | "warmup"
  | "partner"
  | "realPartner"
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
