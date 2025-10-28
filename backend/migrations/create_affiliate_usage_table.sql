-- Migration: Create affiliate_usage table for tracking affiliate code usage
-- Purpose: Track when users apply affiliate codes for follow-up and commission tracking
-- Created: 2025-10-28

CREATE TABLE IF NOT EXISTS affiliate_usage (
  -- Primary Key
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- User Information (Required)
  user_name VARCHAR(100) NOT NULL COMMENT 'Full name of the user who applied the code',
  user_phone VARCHAR(20) NOT NULL COMMENT 'WhatsApp number for follow-up (format: 08xxx or 62xxx)',
  
  -- User Information (Optional)
  user_email VARCHAR(100) DEFAULT NULL COMMENT 'Email address for additional contact',
  user_city VARCHAR(50) DEFAULT NULL COMMENT 'User city/location',
  
  -- Affiliate Information
  affiliate_code VARCHAR(20) NOT NULL COMMENT 'The affiliate code that was applied',
  ambassador_id INT NOT NULL COMMENT 'Foreign key to ambassadors table',
  
  -- Program/Context Information
  program_id INT DEFAULT NULL COMMENT 'Program the user is interested in',
  program_name VARCHAR(100) DEFAULT NULL COMMENT 'Program name for quick reference',
  discount_applied DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage applied (e.g., 30.00 for 30%)',
  
  -- User Behavior
  urgency ENUM('urgent', 'this_month', 'browsing') DEFAULT 'browsing' COMMENT 'How urgent the user wants to start',
  source VARCHAR(50) DEFAULT 'promo_hub' COMMENT 'Where the code was applied (promo_hub, landing, etc)',
  
  -- Timestamps
  first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the code was first applied',
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  -- Ambassador Notification Tracking
  notified_to_ambassador BOOLEAN DEFAULT FALSE COMMENT 'Whether ambassador was notified',
  notified_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When ambassador was notified',
  notification_method ENUM('click_to_chat', 'auto_whatsapp', 'email') DEFAULT 'click_to_chat' COMMENT 'How ambassador was notified',
  
  -- Follow-up Status
  follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending' COMMENT 'Current status of follow-up',
  follow_up_notes TEXT DEFAULT NULL COMMENT 'Notes from ambassador about follow-up',
  
  -- Conversion Tracking
  registered BOOLEAN DEFAULT FALSE COMMENT 'Whether user completed registration',
  registered_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When user registered',
  
  -- Device Fingerprint (for spam prevention)
  device_fingerprint VARCHAR(255) DEFAULT NULL COMMENT 'Browser fingerprint to prevent spam',
  
  -- Indexes for Performance
  INDEX idx_phone (user_phone),
  INDEX idx_ambassador (ambassador_id, first_used_at),
  INDEX idx_code_date (affiliate_code, DATE(first_used_at)),
  INDEX idx_follow_up_status (follow_up_status, ambassador_id),
  INDEX idx_phone_date (user_phone, DATE(first_used_at)),
  
  -- Foreign Key Constraints
  FOREIGN KEY (ambassador_id) REFERENCES ambassadors(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tracks affiliate code usage for follow-up and commission tracking';

-- Create view for ambassador dashboard (active leads)
CREATE OR REPLACE VIEW v_ambassador_active_leads AS
SELECT 
  au.id,
  au.user_name,
  au.user_phone,
  au.user_email,
  au.program_name,
  au.discount_applied,
  au.first_used_at,
  au.follow_up_status,
  au.follow_up_notes,
  a.name AS ambassador_name,
  a.affiliate_code,
  DATEDIFF(CURRENT_TIMESTAMP, au.first_used_at) AS days_since_applied
FROM affiliate_usage au
INNER JOIN ambassadors a ON au.ambassador_id = a.id
WHERE au.follow_up_status IN ('pending', 'contacted')
  AND au.registered = FALSE
ORDER BY au.first_used_at DESC;

-- Create view for commission tracking (converted leads)
CREATE OR REPLACE VIEW v_ambassador_conversions AS
SELECT 
  a.id AS ambassador_id,
  a.name AS ambassador_name,
  a.affiliate_code,
  COUNT(au.id) AS total_conversions,
  SUM(au.discount_applied) AS total_discount_given,
  MIN(au.registered_at) AS first_conversion,
  MAX(au.registered_at) AS last_conversion
FROM ambassadors a
LEFT JOIN affiliate_usage au ON a.id = au.ambassador_id AND au.registered = TRUE
GROUP BY a.id, a.name, a.affiliate_code
ORDER BY total_conversions DESC;
