/**
 * API Configuration
 * Centralized API base URL to avoid duplication across components
 *
 * Automatically detects environment:
 * - Production: https://zonaenglish.com/api
 * - Development: http://localhost:3001/api
 */
export const API_BASE =
  import.meta.env.MODE === "production"
    ? "https://zonaenglish.com/api" // Production API
    : "http://localhost:3001/api"; // Development API

/**
 * Server URL (without /api suffix)
 * Used for image URLs and static assets
 */
export const SERVER_URL =
  import.meta.env.MODE === "production"
    ? "https://zonaenglish.com" // Production Server
    : "http://localhost:3001"; // Development Server

/**
 * API Endpoints
 * Commonly used endpoint paths
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    verify: `${API_BASE}/auth/verify`,
  },
  // Ambassadors
  ambassadors: `${API_BASE}/ambassadors`,
  // Articles
  articles: `${API_BASE}/articles`,
  articleComments: `${API_BASE}/articles/comments`,
  // Programs
  programs: `${API_BASE}/programs`,
  // Promos
  promos: `${API_BASE}/promos`,
  promoClaims: `${API_BASE}/promo-claims`,
  // Countdown
  countdown: `${API_BASE}/countdown`,
  // Gallery
  gallery: `${API_BASE}/gallery`,
  // Settings
  settings: `${API_BASE}/settings`,
  // Users
  users: `${API_BASE}/users`,
  // Upload
  upload: `${API_BASE}/upload`,
  // Affiliate
  affiliate: `${API_BASE}/affiliate`,
  // Validate
  validate: `${API_BASE}/validate`,
  // Bridge Cards
  bridgeCards: {
    base: `${API_BASE}/bridge-cards`,
    auth: `${API_BASE}/bridge-cards/auth/login`,
    verify: `${API_BASE}/bridge-cards/auth/verify`,
    leaderboard: `${API_BASE}/bridge-cards/leaderboard`,
    submitMastered: `${API_BASE}/bridge-cards/mastered`,
    admin: {
      cards: `${API_BASE}/bridge-cards/admin/cards`,
      students: `${API_BASE}/bridge-cards/admin/students`,
      leaderboard: `${API_BASE}/bridge-cards/admin/leaderboard`,
    },
  },
} as const;
