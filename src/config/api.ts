/**
 * API Configuration
 * Centralized API base URL to avoid duplication across components
 */
export const API_BASE = "http://localhost:3001/api";

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
} as const;
