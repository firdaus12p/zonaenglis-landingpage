-- Zona English Database Schema
-- Created: 2025-10-27

-- Create database
CREATE DATABASE IF NOT EXISTS zonaenglish_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE zonaenglish_db;

-- Table: ambassadors
CREATE TABLE IF NOT EXISTS ambassadors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Senior Ambassador', 'Campus Ambassador', 'Community Ambassador', 'Affiliate') NOT NULL DEFAULT 'Campus Ambassador',
    location VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    photo VARCHAR(500),
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    total_referred INT DEFAULT 0,
    total_earnings DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('Active', 'Inactive', 'Pending') NOT NULL DEFAULT 'Active',
    join_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_affiliate_code (affiliate_code),
    INDEX idx_status (status),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: institutions (for ambassador directory)
CREATE TABLE IF NOT EXISTS institutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    branch ENUM('Pettarani', 'Kolaka', 'Kendari') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch (branch)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: ambassador_institutions (many-to-many relationship)
CREATE TABLE IF NOT EXISTS ambassador_institutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambassador_id INT NOT NULL,
    institution_id INT NOT NULL,
    role ENUM('Ambassador', 'Affiliate') NOT NULL DEFAULT 'Ambassador',
    testimonial TEXT,
    contact VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambassador_id) REFERENCES ambassadors(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    INDEX idx_ambassador (ambassador_id),
    INDEX idx_institution (institution_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample institutions
INSERT INTO institutions (name, branch) VALUES
('SMAN 1 Makassar', 'Pettarani'),
('Universitas Hasanuddin', 'Pettarani'),
('PT Maju Jaya Makassar', 'Pettarani');

-- Insert sample ambassadors
INSERT INTO ambassadors (name, type, location, address, email, phone, affiliate_code, total_referred, total_earnings, status, join_date) VALUES
('Sari Dewi', 'Senior Ambassador', 'Makassar', 'Jl. Boulevard No. 45, Makassar', 'sari.dewi@email.com', '+62812-3456-7890', 'ZE-SNR-SAR001', 45, 2300000, 'Active', '2024-04-15'),
('Ahmad Rahman', 'Campus Ambassador', 'Universitas Hasanuddin', 'Kampus Unhas Tamalanrea', 'ahmad.rahman@email.com', '+62813-4567-8901', 'ZE-CMP-AHM002', 32, 1600000, 'Active', '2024-06-20'),
('Maya Putri', 'Community Ambassador', 'Jakarta', 'Jl. Sudirman No. 123, Jakarta', 'maya.putri@email.com', '+62814-5678-9012', 'ZE-COM-MAY003', 78, 3900000, 'Active', '2024-03-10'),
('Budi Santoso', 'Senior Ambassador', 'Yogyakarta', 'Jl. Malioboro No. 123, Yogyakarta', 'budi.santoso@email.com', '+62812-1234-5678', 'ZE-SNR-BUD889', 0, 0, 'Active', '2025-10-27'),
('Muh. Firdaus', 'Senior Ambassador', 'Makassar', 'Jl. AP Pettarani No. 88, Makassar', 'firdaus@email.com', '+62813-9876-5432', 'ZE-SNR-FIR004', 0, 0, 'Active', '2025-10-27'),
('Aulia Ramadhani', 'Campus Ambassador', 'Makassar', 'SMAN 1 Makassar', 'aulia.r@email.com', '+62812-3456-7890', 'ZE-AULIA11', 12, 600000, 'Active', '2024-08-15'),
('Fahri', 'Affiliate', 'Makassar', 'SMAN 1 Makassar', 'fahri@email.com', '+62856-7890-1234', 'ZE-FAHRI12', 8, 400000, 'Active', '2024-09-01'),
('Tania', 'Campus Ambassador', 'Makassar', 'Universitas Hasanuddin', 'tania@email.com', '+62877-8899-0011', 'ZE-TANIA11', 15, 750000, 'Active', '2024-07-10'),
('Rizal', 'Affiliate', 'Makassar', 'PT Maju Jaya Makassar', 'rizal@email.com', '+62822-3344-5566', 'ZE-RIZAL88', 5, 250000, 'Active', '2024-10-05');

-- Link ambassadors to institutions
INSERT INTO ambassador_institutions (ambassador_id, institution_id, role, testimonial, contact) VALUES
(6, 1, 'Ambassador', 'Kelas premium-nya seru & fokus speaking!', 'https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English'),
(7, 1, 'Affiliate', 'Tutor sabar & progress report-nya jelas.', 'https://wa.me/6285678901234?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English'),
(8, 2, 'Ambassador', 'Bisa tanya jadwal & level yang cocok dulu.', 'https://wa.me/6287788990011?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English'),
(9, 3, 'Affiliate', 'Cocok buat upgrade speaking kantor.', 'https://wa.me/6282233445566?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English');
