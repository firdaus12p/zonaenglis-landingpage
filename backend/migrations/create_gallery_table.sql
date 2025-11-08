-- Migration: Create gallery table
-- Description: Tabel untuk menyimpan galeri kegiatan Kids, Teens, dan Intensive

CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT 'Judul/caption foto',
  image_url TEXT NOT NULL COMMENT 'URL atau path foto',
  category ENUM('Kids', 'Teens', 'Intensive') NOT NULL COMMENT 'Kategori program',
  description TEXT COMMENT 'Deskripsi tambahan (opsional)',
  order_index INT DEFAULT 0 COMMENT 'Urutan tampil (semakin kecil semakin di depan)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
