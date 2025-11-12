-- Migration: Add video support to gallery table
-- Description: Menambahkan field untuk mendukung video YouTube

ALTER TABLE gallery
  ADD COLUMN media_type ENUM('image', 'video') DEFAULT 'image' NOT NULL COMMENT 'Tipe media (image atau video)' AFTER description,
  ADD COLUMN youtube_url VARCHAR(500) NULL COMMENT 'URL video YouTube (hanya untuk media_type=video)' AFTER media_type,
  MODIFY image_url TEXT NULL COMMENT 'URL atau path foto (opsional untuk video)',
  ADD INDEX idx_media_type (media_type);

-- Update existing records to have media_type = 'image'
UPDATE gallery SET media_type = 'image' WHERE media_type IS NULL;
