import { API_ENDPOINTS } from "../config/api";
import type {
  BridgeCardRecord,
  BridgeStudentProfile,
  BridgeStudentAccount,
  VoiceAnalysisResult,
} from "../types/bridgeCards";

/**
 * Bridge Cards Service
 *
 * Two auth contexts — completely isolated:
 * - fetchWithStudentAuth: uses ze_bridge_token (student login)
 * - fetchWithAdminAuth: uses zona_english_auth_token (admin login)
 */

// ====== AUTH HELPERS ======

const STUDENT_TOKEN_KEY = "ze_bridge_token";
const ADMIN_TOKEN_KEY = "zona_english_auth_token";

async function fetchWithStudentAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem(STUDENT_TOKEN_KEY);

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || errorData?.error || `HTTP Error ${response.status}`,
    );
  }

  return response.json();
}

async function fetchWithAdminAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || errorData?.error || `HTTP Error ${response.status}`,
    );
  }

  return response.json();
}

// ====== SERVICE ======

export const bridgeCardsService = {
  // ------------------------------------------------------------------
  // STUDENT ENDPOINTS (use fetchWithStudentAuth)
  // ------------------------------------------------------------------

  /** Fetch active cards for student, grouped by category */
  async getCards(): Promise<{
    warmup: BridgeCardRecord[];
    partner: BridgeCardRecord[];
  }> {
    return fetchWithStudentAuth(`${API_ENDPOINTS.bridgeCards.base}/cards`);
  },

  /** Submit a newly mastered card to increment points */
  async submitMasteredCard(
    cardId: number,
  ): Promise<{ success: boolean; newTotal: number }> {
    return fetchWithStudentAuth(API_ENDPOINTS.bridgeCards.submitMastered, {
      method: "POST",
      body: JSON.stringify({ cardId }),
    });
  },

  /** Fetch student leaderboard */
  async getLeaderboard(): Promise<BridgeStudentProfile[]> {
    return fetchWithStudentAuth(API_ENDPOINTS.bridgeCards.leaderboard);
  },

  // ------------------------------------------------------------------
  // STUDENT: AI VOICE PRACTICE (use fetchWithStudentAuth)
  // ------------------------------------------------------------------

  /** Submit spoken text for AI analysis against target */
  async analyzeVoice(
    cardId: number,
    spokenText: string,
    targetText: string,
  ): Promise<VoiceAnalysisResult> {
    const data = await fetchWithStudentAuth(
      API_ENDPOINTS.bridgeCards.voice.analyze,
      {
        method: "POST",
        body: JSON.stringify({ cardId, spokenText, targetText }),
      },
    );
    return data as VoiceAnalysisResult;
  },

  /** Generate TTS audio for correct pronunciation */
  async getTTS(text: string): Promise<{ audioUrl: string }> {
    return fetchWithStudentAuth(API_ENDPOINTS.bridgeCards.voice.tts, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  // ------------------------------------------------------------------
  // ADMIN: CARDS CMS (use fetchWithAdminAuth)
  // ------------------------------------------------------------------

  /** Admin: Fetch all cards */
  async getAdminCards(): Promise<BridgeCardRecord[]> {
    return fetchWithAdminAuth(API_ENDPOINTS.bridgeCards.admin.cards);
  },

  /** Admin: Fetch single card by ID */
  async getAdminCard(id: number): Promise<BridgeCardRecord> {
    return fetchWithAdminAuth(`${API_ENDPOINTS.bridgeCards.admin.cards}/${id}`);
  },

  /** Admin: Create a new flashcard */
  async createCard(payload: {
    category: string;
    contentFront: string;
    contentBack: string;
    keywords?: string;
  }): Promise<{ success: boolean; id: number }> {
    return fetchWithAdminAuth(API_ENDPOINTS.bridgeCards.admin.cards, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Admin: Update an existing flashcard */
  async updateCard(
    id: number,
    payload: {
      category: string;
      contentFront: string;
      contentBack: string;
      keywords?: string;
    },
  ): Promise<{ success: boolean }> {
    return fetchWithAdminAuth(
      `${API_ENDPOINTS.bridgeCards.admin.cards}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  },

  /** Admin: Soft-delete a flashcard */
  async deleteCard(id: number): Promise<{ success: boolean }> {
    return fetchWithAdminAuth(
      `${API_ENDPOINTS.bridgeCards.admin.cards}/${id}`,
      {
        method: "DELETE",
      },
    );
  },

  // ------------------------------------------------------------------
  // ADMIN: STUDENT MANAGEMENT (use fetchWithAdminAuth)
  // ------------------------------------------------------------------

  /** Admin: Fetch all students */
  async getStudents(): Promise<BridgeStudentAccount[]> {
    return fetchWithAdminAuth(API_ENDPOINTS.bridgeCards.admin.students);
  },

  /** Admin: Fetch single student by ID */
  async getStudent(id: number): Promise<BridgeStudentAccount> {
    return fetchWithAdminAuth(
      `${API_ENDPOINTS.bridgeCards.admin.students}/${id}`,
    );
  },

  /** Admin: Create a new student account */
  async createStudent(payload: {
    name: string;
    email: string;
    studentCode: string;
    pin: string;
  }): Promise<{ success: boolean; id: number }> {
    return fetchWithAdminAuth(API_ENDPOINTS.bridgeCards.admin.students, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Admin: Update student data (pin optional) */
  async updateStudent(
    id: number,
    payload: { name: string; email: string; studentCode: string; pin?: string },
  ): Promise<{ success: boolean }> {
    return fetchWithAdminAuth(
      `${API_ENDPOINTS.bridgeCards.admin.students}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  },

  /** Admin: Soft-delete a student */
  async deleteStudent(id: number): Promise<{ success: boolean }> {
    return fetchWithAdminAuth(
      `${API_ENDPOINTS.bridgeCards.admin.students}/${id}`,
      {
        method: "DELETE",
      },
    );
  },

  // ------------------------------------------------------------------
  // ADMIN: LEADERBOARD (use fetchWithAdminAuth)
  // ------------------------------------------------------------------

  /** Admin: Fetch leaderboard with full student details */
  async getAdminLeaderboard(): Promise<BridgeStudentProfile[]> {
    return fetchWithAdminAuth(API_ENDPOINTS.bridgeCards.admin.leaderboard);
  },
};
