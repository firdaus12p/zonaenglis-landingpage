-- Create Settings Table for Admin Configuration
-- Phase 1: Profile, WhatsApp CTA, Commission Rate, Comment Moderation

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique identifier for setting',
  setting_value TEXT COMMENT 'Value of the setting (can be string, number, boolean as text)',
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT 'Data type of the value',
  category VARCHAR(50) NOT NULL COMMENT 'Category: general, profile, ambassador, content, security',
  label VARCHAR(200) NOT NULL COMMENT 'Human-readable label for UI',
  description TEXT COMMENT 'Description of what this setting does',
  is_public BOOLEAN DEFAULT FALSE COMMENT 'Can be accessed by frontend/public?',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT COMMENT 'Admin user ID who last updated',
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System settings for admin configuration';

-- Insert default Phase 1 settings
INSERT INTO settings (setting_key, setting_value, setting_type, category, label, description, is_public, updated_by) VALUES
-- Profile Settings
('admin_name', 'Administrator', 'string', 'profile', 'Admin Name', 'Name of the administrator', FALSE, 1),
('admin_email', 'admin@zonaenglish.com', 'string', 'profile', 'Admin Email', 'Email address for admin notifications', FALSE, 1),

-- WhatsApp CTA Numbers (Public - used in frontend)
('whatsapp_promo_hub', '6282345678901', 'string', 'general', 'WhatsApp Promo Hub', 'WhatsApp number for Promo Hub contact', TRUE, 1),
('whatsapp_general', '6282345678902', 'string', 'general', 'WhatsApp General', 'General WhatsApp contact number', TRUE, 1),
('whatsapp_pettarani', '6282345678903', 'string', 'general', 'WhatsApp Pettarani', 'WhatsApp for Pettarani branch', TRUE, 1),
('whatsapp_kolaka', '6282345678904', 'string', 'general', 'WhatsApp Kolaka', 'WhatsApp for Kolaka branch', TRUE, 1),
('whatsapp_kendari', '6282345678905', 'string', 'general', 'WhatsApp Kendari', 'WhatsApp for Kendari branch', TRUE, 1),

-- Ambassador Settings
('default_commission_rate', '10', 'number', 'ambassador', 'Default Commission Rate', 'Default commission percentage for new ambassadors', FALSE, 1),

-- Content/Article Settings
('article_auto_approve_comments', 'false', 'boolean', 'content', 'Auto Approve Comments', 'Automatically approve article comments without moderation', FALSE, 1),
('article_comments_enabled', 'true', 'boolean', 'content', 'Enable Comments', 'Allow comments on articles', TRUE, 1),
('article_default_status', 'Draft', 'string', 'content', 'Default Article Status', 'Default status for new articles (Draft/Published)', FALSE, 1)

ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = CURRENT_TIMESTAMP;
