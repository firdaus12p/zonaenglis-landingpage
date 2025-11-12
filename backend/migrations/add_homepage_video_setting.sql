-- Add homepage video setting to settings table

INSERT INTO settings 
  (setting_key, setting_value, setting_type, category, label, description, is_public)
VALUES 
  ('homepage_video_url', '', 'text', 'homepage', 'Inside Zona English Video', 'YouTube URL for the homepage preview video (autoplay)', 1)
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  setting_type = VALUES(setting_type),
  category = VALUES(category),
  label = VALUES(label),
  description = VALUES(description),
  is_public = VALUES(is_public);
