-- Migration: Add last_viewed_at column to ambassadors table
-- Purpose: Track when admin last viewed an ambassador's affiliate tracking data
-- This enables "unread badge" feature - only show badge for new leads since last view
-- Created: 2025-10-29

ALTER TABLE ambassadors 
ADD COLUMN last_viewed_at TIMESTAMP NULL DEFAULT NULL 
COMMENT 'When admin last viewed this ambassador in affiliate tracking dashboard';

-- Add index for performance
CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);
