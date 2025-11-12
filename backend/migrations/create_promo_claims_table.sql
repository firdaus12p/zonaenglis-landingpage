-- Create table for direct promo claims (without promo code)
-- Users who want to claim promo without using any affiliate/promo code

CREATE TABLE IF NOT EXISTS promo_claims (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  user_email VARCHAR(255),
  user_city VARCHAR(100),
  
  -- Promo/Program details
  program_id INT,
  program_name VARCHAR(255) NOT NULL,
  program_branch VARCHAR(50),
  program_type VARCHAR(50),
  program_category VARCHAR(50),
  
  -- Tracking
  urgency ENUM('urgent', 'this_month', 'browsing') DEFAULT 'browsing',
  source VARCHAR(50) DEFAULT 'promo_hub',
  device_fingerprint VARCHAR(255),
  
  -- Follow-up management
  follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending',
  follow_up_notes TEXT,
  follow_up_by INT,
  
  -- Registration tracking
  registered BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Soft delete
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(100),
  
  -- Indexes for better query performance
  INDEX idx_user_phone (user_phone),
  INDEX idx_program_id (program_id),
  INDEX idx_follow_up_status (follow_up_status),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  
  -- Foreign keys
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
  FOREIGN KEY (follow_up_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores direct promo claims from users who do not have affiliate/promo codes';
