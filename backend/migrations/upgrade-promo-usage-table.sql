-- Migration: Upgrade promo_usage table to support lead tracking
-- Date: 2025-10-30
-- Purpose: Add fields to track user journey similar to affiliate_usage

-- Add program_name field
ALTER TABLE promo_usage 
ADD COLUMN program_name VARCHAR(100) NULL AFTER discount_amount;

-- Add follow-up tracking fields
ALTER TABLE promo_usage
ADD COLUMN follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending' AFTER program_name,
ADD COLUMN follow_up_notes TEXT NULL AFTER follow_up_status;

-- Add registration tracking
ALTER TABLE promo_usage
ADD COLUMN registered TINYINT(1) DEFAULT 0 AFTER follow_up_notes,
ADD COLUMN registered_at TIMESTAMP NULL AFTER registered;

-- Add soft delete fields
ALTER TABLE promo_usage
ADD COLUMN deleted_at TIMESTAMP NULL AFTER registered_at,
ADD COLUMN deleted_by VARCHAR(255) NULL AFTER deleted_at;

-- Add index for follow_up_status for faster queries
ALTER TABLE promo_usage
ADD INDEX idx_follow_up_status (follow_up_status);

-- Add index for deleted_at for soft delete queries
ALTER TABLE promo_usage
ADD INDEX idx_deleted_at (deleted_at);

-- Rename fields to match naming convention
ALTER TABLE promo_usage
CHANGE COLUMN student_name user_name VARCHAR(100) NOT NULL,
CHANGE COLUMN student_email user_email VARCHAR(100) NULL,
CHANGE COLUMN student_phone user_phone VARCHAR(20) NULL;

-- Update existing records to have pending status
UPDATE promo_usage 
SET follow_up_status = 'pending' 
WHERE follow_up_status IS NULL;

-- Show final structure
DESCRIBE promo_usage;
