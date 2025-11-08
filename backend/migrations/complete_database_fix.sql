-- ============================================================================
-- COMPLETE DATABASE FIX - Zona English Admin Dashboard
-- Created: November 8, 2025
-- Purpose: Add all missing columns to existing tables
-- ============================================================================

USE zona_english_admin;

-- ============================================================================
-- FIX 1: admin_users - Add 'name' column
-- ============================================================================
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Admin User' AFTER email;

UPDATE admin_users 
SET name = 'Administrator'
WHERE username = 'admin';

-- ============================================================================
-- FIX 2: ambassadors - Add missing columns
-- ============================================================================
ALTER TABLE ambassadors 
ADD COLUMN IF NOT EXISTS institution VARCHAR(200) DEFAULT NULL AFTER location,
ADD COLUMN IF NOT EXISTS testimonial TEXT DEFAULT NULL AFTER affiliate_code,
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL AFTER email,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP NULL DEFAULT NULL AFTER total_earnings;

-- ============================================================================
-- FIX 3: affiliate_usage - Add ALL missing columns
-- ============================================================================

-- Check existing columns first
SELECT 'Checking affiliate_usage table structure...' as status;

-- Add columns one by one with IF NOT EXISTS
ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS user_city VARCHAR(100) DEFAULT NULL AFTER user_email;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS urgency ENUM('low', 'medium', 'high', 'browsing', 'urgent', 'this_month') DEFAULT 'browsing' AFTER program_name;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending' AFTER urgency;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT DEFAULT NULL AFTER follow_up_status;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS registered BOOLEAN DEFAULT FALSE AFTER follow_up_notes;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(255) DEFAULT NULL AFTER registered;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'promo_hub' AFTER device_fingerprint;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS deleted_by INT DEFAULT NULL AFTER deleted_at;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS ambassador_id INT DEFAULT NULL AFTER affiliate_code;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS notified_to_ambassador BOOLEAN DEFAULT FALSE AFTER source;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP NULL DEFAULT NULL AFTER notified_to_ambassador;

ALTER TABLE affiliate_usage 
ADD COLUMN IF NOT EXISTS notification_method VARCHAR(50) DEFAULT NULL AFTER notified_at;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_follow_up ON affiliate_usage(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_registered ON affiliate_usage(registered);
CREATE INDEX IF NOT EXISTS idx_source ON affiliate_usage(source);
CREATE INDEX IF NOT EXISTS idx_ambassador ON affiliate_usage(ambassador_id);

-- ============================================================================
-- FIX 4: promo_usage - Add missing columns for tracking
-- ============================================================================

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) NOT NULL DEFAULT 'Unknown' AFTER promo_code_id;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS user_phone VARCHAR(20) DEFAULT NULL AFTER user_name;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255) DEFAULT NULL AFTER user_phone;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS program_name VARCHAR(255) DEFAULT NULL AFTER user_email;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending' AFTER final_amount;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT DEFAULT NULL AFTER follow_up_status;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS registered BOOLEAN DEFAULT FALSE AFTER follow_up_notes;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL AFTER registered;

ALTER TABLE promo_usage 
ADD COLUMN IF NOT EXISTS deleted_by INT DEFAULT NULL AFTER deleted_at;

-- Add indexes for promo_usage
CREATE INDEX IF NOT EXISTS idx_deleted ON promo_usage(deleted_at);
CREATE INDEX IF NOT EXISTS idx_follow_up_promo ON promo_usage(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_registered_promo ON promo_usage(registered);

-- ============================================================================
-- FIX 5: countdown_batches - Add missing columns
-- ============================================================================

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT NULL AFTER id;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT NULL AFTER start_date;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT NULL AFTER end_date;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS instructor VARCHAR(255) DEFAULT NULL AFTER description;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS location_mode ENUM('Online', 'Offline', 'Hybrid') DEFAULT 'Online' AFTER instructor;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS location_address TEXT DEFAULT NULL AFTER location_mode;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00 AFTER location_address;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP NULL DEFAULT NULL AFTER price;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS target_students INT DEFAULT 0 AFTER registration_deadline;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS current_students INT DEFAULT 0 AFTER target_students;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Upcoming', 'Completed', 'Paused') DEFAULT 'Upcoming' AFTER current_students;

ALTER TABLE countdown_batches 
ADD COLUMN IF NOT EXISTS visibility ENUM('Public', 'Private') DEFAULT 'Public' AFTER status;

-- Update name from title for existing records
UPDATE countdown_batches 
SET name = title 
WHERE name IS NULL AND title IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Database fixes completed!' as status;

-- Show admin_users structure
SELECT 'admin_users columns:' as info;
SHOW COLUMNS FROM admin_users;

-- Show ambassadors structure
SELECT 'ambassadors columns:' as info;
SHOW COLUMNS FROM ambassadors;

-- Show affiliate_usage structure
SELECT 'affiliate_usage columns:' as info;
SHOW COLUMNS FROM affiliate_usage;

-- Show programs structure
SELECT 'programs columns:' as info;
SHOW COLUMNS FROM programs;

-- Show gallery structure
SELECT 'gallery columns:' as info;
SHOW COLUMNS FROM gallery;

SELECT '✅ All database fixes completed successfully!' as final_status;
