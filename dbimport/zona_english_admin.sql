-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Waktu pembuatan: 20 Nov 2025 pada 10.19
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zona_english_admin`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateAmbassadorStats` (IN `ambassador_id` INT)   BEGIN
    UPDATE ambassadors 
    SET 
        referrals = (SELECT COUNT(*) FROM affiliate_transactions WHERE ambassador_id = ambassadors.id AND status IN ('confirmed', 'paid')),
        total_earnings = (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_transactions WHERE ambassador_id = ambassadors.id AND status = 'paid')
    WHERE id = ambassador_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdatePromoUsage` (IN `promo_id` INT)   BEGIN
    UPDATE promo_codes 
    SET used_count = (SELECT COUNT(*) FROM promo_usage WHERE promo_code_id = promo_id)
    WHERE id = promo_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Admin User',
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','editor') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `name`, `password_hash`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@zonaenglish.com', 'Administrator', '$2b$10$zOw2DjTqGkXNHDG8B5QKY.GTXEoIj.ROwk6laThKH19b0MycvzvjS', 'super_admin', 1, '2025-11-13 08:54:47', '2025-11-08 13:13:14', '2025-11-13 08:54:47'),
(2, '', 'firdaus12p@zonaenglish.com', 'firdaus', '$2b$10$SUAy5ZytsXlqCPsdlNkcmeqivLV5CXGVoZ8eapZa4/ec6Wk7OlGWe', 'admin', 1, '2025-11-09 07:29:49', '2025-11-09 07:28:58', '2025-11-09 07:29:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `affiliate_transactions`
--

CREATE TABLE `affiliate_transactions` (
  `id` int(11) NOT NULL,
  `ambassador_id` int(11) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `student_email` varchar(100) DEFAULT NULL,
  `student_phone` varchar(20) DEFAULT NULL,
  `program_type` varchar(50) DEFAULT NULL,
  `registration_fee` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `status` enum('pending','confirmed','paid','cancelled') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Trigger `affiliate_transactions`
--
DELIMITER $$
CREATE TRIGGER `after_affiliate_transaction_insert` AFTER INSERT ON `affiliate_transactions` FOR EACH ROW BEGIN
    CALL UpdateAmbassadorStats(NEW.ambassador_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_affiliate_transaction_update` AFTER UPDATE ON `affiliate_transactions` FOR EACH ROW BEGIN
    CALL UpdateAmbassadorStats(NEW.ambassador_id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `affiliate_usage`
--

CREATE TABLE `affiliate_usage` (
  `id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_phone` varchar(20) NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_city` varchar(100) DEFAULT NULL,
  `affiliate_code` varchar(50) NOT NULL,
  `ambassador_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `urgency` enum('low','medium','high') DEFAULT 'medium',
  `follow_up_status` enum('pending','contacted','converted','lost') DEFAULT 'pending',
  `follow_up_notes` text DEFAULT NULL,
  `registered` tinyint(1) DEFAULT 0,
  `device_fingerprint` varchar(255) DEFAULT NULL,
  `source` varchar(50) DEFAULT 'promo_hub',
  `notified_to_ambassador` tinyint(1) DEFAULT 0,
  `notified_at` timestamp NULL DEFAULT NULL,
  `notification_method` varchar(50) DEFAULT NULL,
  `discount_applied` decimal(10,2) DEFAULT 0.00,
  `first_used_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `affiliate_usage`
--

INSERT INTO `affiliate_usage` (`id`, `user_name`, `user_phone`, `user_email`, `user_city`, `affiliate_code`, `ambassador_id`, `program_id`, `program_name`, `urgency`, `follow_up_status`, `follow_up_notes`, `registered`, `device_fingerprint`, `source`, `notified_to_ambassador`, `notified_at`, `notification_method`, `discount_applied`, `first_used_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'tes', '081264323812', 'tes@gmail.com', NULL, 'AHMAD2024', 2, 1, 'Tes Program', '', 'pending', NULL, 0, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0MS4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLTo6MQ==', 'promo_hub', 0, NULL, NULL, 50000.00, '2025-11-08 13:41:17', NULL, NULL),
(2, 'tes maya', '081243527834', 'muhammad@gmail.com', NULL, 'MAYA2024', 3, 1, 'Tes Program', '', 'contacted', 'sementara di follow up', 0, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0MS4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLTo6MQ==', 'promo_hub', 1, '2025-11-08 13:42:43', 'click_to_chat', 50000.00, '2025-11-08 13:42:43', NULL, NULL),
(3, 'tescodefirdaus', '08953741232', 'tescodefirdaus@gmail.com', NULL, 'ZE-CAM-FIR786', 5, 1, 'Tes Program', '', 'converted', NULL, 1, 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Mi4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLGVuO3E9MC45LTo6MQ==', 'promo_hub', 1, '2025-11-13 10:26:51', 'click_to_chat', 50000.00, '2025-11-13 10:26:51', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `ambassadors`
--

CREATE TABLE `ambassadors` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('Senior Ambassador','Campus Ambassador','Community Ambassador','Junior Ambassador') NOT NULL,
  `location` varchar(100) NOT NULL,
  `institution` varchar(200) DEFAULT NULL,
  `achievement` varchar(100) DEFAULT NULL,
  `commission` decimal(10,2) DEFAULT 0.00,
  `referrals` int(11) DEFAULT 0,
  `badge_text` varchar(50) DEFAULT NULL,
  `badge_variant` enum('premium','ambassador','active','location') DEFAULT 'ambassador',
  `image_url` text DEFAULT NULL,
  `affiliate_code` varchar(20) NOT NULL,
  `testimonial` text DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT 15.00,
  `is_active` tinyint(1) DEFAULT 1,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `total_earnings` decimal(12,2) DEFAULT 0.00,
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `ambassadors`
--

INSERT INTO `ambassadors` (`id`, `name`, `role`, `location`, `institution`, `achievement`, `commission`, `referrals`, `badge_text`, `badge_variant`, `image_url`, `affiliate_code`, `testimonial`, `commission_rate`, `is_active`, `phone`, `email`, `address`, `bank_account`, `bank_name`, `total_earnings`, `last_viewed_at`, `created_at`, `updated_at`) VALUES
(1, 'Sarah Pratiwi', 'Senior Ambassador', 'Makassar', NULL, 'Top Recruiter', 8500000.00, 47, 'Ambassador Elite', 'premium', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop', 'SARAH2024', NULL, 25.00, 1, '+62821-1234-5678', 'sarah@zonaenglish.id', NULL, NULL, NULL, 0.00, '2025-11-13 10:43:45', '2025-11-08 13:13:14', '2025-11-13 10:43:45'),
(2, 'Ahmad Rizki', 'Campus Ambassador', 'Kendari', NULL, 'Rising Star', 4200000.00, 23, 'Campus Leader', 'ambassador', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', 'AHMAD2024', NULL, 20.00, 1, '+62821-2345-6789', 'ahmad@zonaenglish.id', NULL, NULL, NULL, 0.00, '2025-11-13 10:43:41', '2025-11-08 13:13:14', '2025-11-13 10:43:41'),
(3, 'Maya Sari', 'Community Ambassador', 'Kolaka', NULL, 'Konsisten', 2800000.00, 15, 'Community Star', 'ambassador', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', 'MAYA2024', NULL, 15.00, 1, '+62821-3456-7890', 'maya@zonaenglish.id', NULL, NULL, NULL, 0.00, '2025-11-13 10:43:43', '2025-11-08 13:13:14', '2025-11-13 10:43:43'),
(4, 'Firdaus', 'Campus Ambassador', 'Pettarani', 'Universitas Muhammadiyah Makassar', NULL, 0.00, 0, NULL, 'ambassador', '/images/ambassadors/default.jpg', 'ZE-CAM-FIR797', 'Kelas Premiumnya anda bisa dapatkan potongan harga menggunakan code saya!', 15.00, NULL, '0895374751414', 'firdaus@gmail.com', NULL, NULL, NULL, 0.00, NULL, '2025-11-13 10:24:29', '2025-11-13 10:25:04'),
(5, 'Firdaus', 'Campus Ambassador', 'Pettarani', 'Universitas Muhammadiyah Makassar', NULL, 0.00, 0, NULL, 'ambassador', NULL, 'ZE-CAM-FIR786', 'Gunakan code promo saya untuk mendapatka potongan harga', 15.00, 1, '0895374751414', 'firdaus@gmail.com', NULL, NULL, NULL, 0.00, '2025-11-13 10:43:46', '2025-11-13 10:26:13', '2025-11-13 10:43:46');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `ambassador_performance`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `ambassador_performance` (
`id` int(11)
,`name` varchar(100)
,`role` enum('Senior Ambassador','Campus Ambassador','Community Ambassador','Junior Ambassador')
,`location` varchar(100)
,`affiliate_code` varchar(20)
,`commission_rate` decimal(5,2)
,`referrals` int(11)
,`total_earnings` decimal(12,2)
,`total_transactions` bigint(21)
,`confirmed_earnings` decimal(32,2)
,`pending_earnings` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `author` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `status` enum('Published','Draft','Scheduled','Archived') DEFAULT 'Draft',
  `published_at` datetime DEFAULT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `likes_count` int(11) DEFAULT 0,
  `loves_count` int(11) DEFAULT 0,
  `comments_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `articles`
--

INSERT INTO `articles` (`id`, `title`, `slug`, `excerpt`, `content`, `author`, `category`, `status`, `published_at`, `featured_image`, `seo_title`, `seo_description`, `views`, `likes_count`, `loves_count`, `comments_count`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Tips Mudah Belajar Grammar Bahasa Inggris', 'tips-mudah-belajar-grammar-bahasa-inggris', 'Pelajari cara efektif menguasai grammar dengan metode yang mudah dipahami.', '<h2 class=\"text-2xl font-bold mb-3 mt-4\"><span style=\"white-space: pre-wrap;\">Pengenalan Grammar</span></h2><p class=\"mb-2\"><span style=\"white-space: pre-wrap;\">Grammar adalah fondasi penting dalam mempelajari bahasa Inggris. Dengan memahami grammar, kamu akan lebih percaya diri dalam berbicara dan menulis.</span></p><h3 class=\"text-xl font-bold mb-2 mt-3\"><span style=\"white-space: pre-wrap;\">Tips Praktis:</span></h3><ol class=\"list-decimal list-inside mb-2\"><li value=\"1\" class=\"ml-4\"><span style=\"white-space: pre-wrap;\">Mulai dari dasar (Present Tense)</span></li><li value=\"2\" class=\"ml-4\"><span style=\"white-space: pre-wrap;\">Praktik setiap hari 15 menit</span></li><li value=\"3\" class=\"ml-4\"><span style=\"white-space: pre-wrap;\">Gunakan dalam percakapan nyata</span></li></ol><p class=\"mb-2\"><b><strong class=\"font-bold\" style=\"white-space: pre-wrap;\">Ingat:</strong></b><span style=\"white-space: pre-wrap;\"> Konsistensi lebih penting daripada durasi!</span></p>', 'Admin Zona English', 'Grammar', 'Published', '2025-11-12 19:22:32', '/uploads/articles/article-1762950262684-483762138.jpg', 'Tips Mudah Belajar Grammar Bahasa Inggris | Zona English', 'Pelajari cara efektif menguasai grammar bahasa Inggris dengan metode yang mudah dipahami dan praktis.', 0, 0, 0, 0, '2025-11-12 11:22:32', '2025-11-12 12:27:53', '2025-11-12 12:27:53'),
(2, '50 Vocabulary Harian yang Wajib Dikuasai', '50-vocabulary-harian-wajib-dikuasai', 'Kumpulan 50 kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari.', '<h2>Vocabulary Essentials</h2><p>Berikut adalah 50 kata yang <em>wajib</em> kamu kuasai untuk percakapan sehari-hari:</p><h3>Greetings:</h3><ul><li>Hello - Halo</li><li>Good morning - Selamat pagi</li><li>How are you? - Apa kabar?</li></ul><p>Dengan menguasai vocabulary dasar ini, kamu akan lebih <strong>confident</strong> dalam berbicara bahasa Inggris!</p>', 'Sarah Teacher', 'Vocabulary', 'Published', '2025-11-12 19:22:32', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800', '50 Vocabulary Harian yang Wajib Dikuasai | Zona English', 'Kumpulan 50 kosakata bahasa Inggris untuk percakapan sehari-hari beserta contoh penggunaannya.', 0, 0, 0, 0, '2025-11-12 11:22:32', '2025-11-12 11:22:32', NULL),
(3, 'Cara Meningkatkan Speaking Skill dengan Percaya Diri', 'cara-meningkatkan-speaking-skill-percaya-diri', 'Strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris tanpa takut salah.', '<h2>Speaking with Confidence</h2><p>Banyak orang takut berbicara bahasa Inggris karena <strong>takut salah</strong>. Padahal, salah adalah bagian dari proses belajar!</p><h3>5 Tips Meningkatkan Speaking:</h3><ol><li>Praktik berbicara setiap hari</li><li>Rekam diri sendiri</li><li>Join speaking club</li><li>Tonton film berbahasa Inggris</li><li>Jangan takut salah!</li></ol><p>Remember: <em>Practice makes perfect</em> 💪</p>', 'Michael English', 'Speaking', 'Published', '2025-11-12 19:22:32', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800', 'Cara Meningkatkan Speaking Skill dengan Percaya Diri | Zona English', 'Pelajari strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri.', 0, 0, 0, 0, '2025-11-12 11:22:32', '2025-11-12 11:22:32', NULL),
(4, 'Undangan Top', 'undangan-top', 'Mari Buat Undangan Digital Di Undangantop.com', '<h2 class=\"text-2xl font-bold mb-3 mt-4\"><span style=\"white-space: pre-wrap;\">Pesan SEKARANG</span></h2><p class=\"mb-2\"><span style=\"white-space: pre-wrap;\">Membuat undangan digital di </span><i><em class=\"italic\" style=\"white-space: pre-wrap;\">undangan top</em></i><span style=\"white-space: pre-wrap;\"> sangat </span><b><strong class=\"font-bold\" style=\"white-space: pre-wrap;\">murah</strong></b><span style=\"white-space: pre-wrap;\"> dan </span><b><strong class=\"font-bold\" style=\"white-space: pre-wrap;\">cepat.</strong></b></p>', 'Admin Zona English', 'Grammar', 'Published', '2025-11-12 11:33:17', '/uploads/articles/article-1762947197243-251205140.jpg', 'Undangan Top', 'Mari Buat Undangan Digital Di Undangantop.com', 0, 0, 0, 0, '2025-11-12 11:33:17', '2025-11-12 12:05:08', '2025-11-12 12:05:08'),
(5, 'Zona English Promo', 'zona-english-promo', 'Tips untuk mendaftar kelas zona english', '<h2 class=\"text-2xl font-bold mb-3 mt-4\"><span style=\"white-space: pre-wrap;\">Tips Mendaftar Kelas di Zona English</span></h2><p class=\"mb-2\"><span style=\"white-space: pre-wrap;\">Pergi ke halaman </span><b><strong class=\"font-bold\" style=\"white-space: pre-wrap;\">promo hub </strong></b><span style=\"white-space: pre-wrap;\">lalu silahkan gunakan code </span><i><em class=\"italic\" style=\"white-space: pre-wrap;\">ambassador</em></i><span style=\"white-space: pre-wrap;\"> yang di tampilkan, agar dapat potongan harga.</span></p><ol class=\"list-decimal list-inside mb-2\"><li value=\"1\" class=\"ml-4\"><span style=\"white-space: pre-wrap;\">Tes</span></li><li value=\"2\" class=\"ml-4\"><span style=\"white-space: pre-wrap;\">ts lagi</span></li></ol>', 'Admin Zona English', 'Tips', 'Published', '2025-11-12 11:52:16', '/uploads/articles/article-1762948963482-712978605.jpg', 'Zona English Promo', 'Tips untuk mendaftar kelas zona english', 0, 0, 0, 0, '2025-11-12 11:52:16', '2025-11-12 12:05:06', '2025-11-12 12:05:06'),
(6, 'tes', 'tes', 'dawasd', '<p class=\"mb-2\"><span style=\"white-space: pre-wrap;\">asdwasdwawasdw</span></p>', 'Admin Zona English', 'Grammar', 'Published', '2025-11-12 12:06:16', '/uploads/articles/article-1762949176347-619866764.jpg', 'tes', 'dawasd', 0, 0, 0, 0, '2025-11-12 12:06:16', '2025-11-12 12:10:36', '2025-11-12 12:10:36'),
(7, 'Artikel ku', 'artikel-ku', 'asdwasd', '<p class=\"mb-2\"><span style=\"white-space: pre-wrap;\">asdwasdwasdwasd</span></p>', 'Admin Zona English', 'Grammar', 'Published', '2025-11-12 12:28:14', '/uploads/articles/article-1762950494915-7355652.jpg', 'Artikel ku', 'asdwasd', 0, 0, 0, 0, '2025-11-12 12:28:14', '2025-11-12 12:31:31', '2025-11-12 12:31:31'),
(8, 'Tips Belajar Grammar dengan Mudah', 'tips-belajar-grammar-dengan-mudah', 'Pelajari cara mudah memahami grammar bahasa Inggris untuk pemula', '<p class=\"mb-2\"><span style=\"white-space: pre-wrap;\">Grammar adalah fondasi penting dalam belajar bahasa Inggris. Artikel ini akan membantu Anda memahami konsep dasar grammar dengan cara yang mudah dan </span><b><strong class=\"font-bold\" style=\"white-space: pre-wrap;\">menyenangkan.</strong></b></p>', 'Admin Zona English', 'tes', 'Published', '2025-11-12 12:38:00', '/uploads/articles/article-1762951080410-102891032.jpg', 'Tips Belajar Grammar dengan Mudah', 'Pelajari cara mudah memahami grammar bahasa Inggris untuk pemula', 0, 0, 0, 0, '2025-11-12 12:38:00', '2025-11-13 10:55:50', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_categories`
--

CREATE TABLE `article_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `article_categories`
--

INSERT INTO `article_categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Grammar', 'grammar', 'Articles about English grammar rules and usage', '2025-11-13 09:06:45', '2025-11-13 09:06:45', NULL),
(2, 'Vocabulary', 'vocabulary', 'Vocabulary building and word learning articles', '2025-11-13 09:06:45', '2025-11-13 09:06:45', NULL),
(3, 'Speaking', 'speaking', 'Tips and guides for improving speaking skills', '2025-11-13 09:06:45', '2025-11-13 09:06:45', NULL),
(4, 'Listening', 'listening', 'Listening comprehension and practice materials', '2025-11-13 09:06:45', '2025-11-13 09:06:45', NULL),
(5, 'Tips', 'tips', 'General English learning tips and strategies', '2025-11-13 09:06:45', '2025-11-13 09:06:45', NULL),
(6, 'News', 'news', 'Latest news and updates from Zona English', '2025-11-13 09:06:45', '2025-11-13 09:06:45', NULL),
(7, 'tes', 'tes', 'tes pembuatan kategory saja', '2025-11-13 09:19:29', '2025-11-13 09:19:29', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_comments`
--

CREATE TABLE `article_comments` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `comment` text NOT NULL,
  `status` enum('Pending','Approved','Spam','Deleted') DEFAULT 'Pending',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `article_comments`
--

INSERT INTO `article_comments` (`id`, `article_id`, `user_name`, `user_email`, `comment`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 1, 'tes', 'tes@gmail.com', 'tesas', 'Approved', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 11:35:06', '2025-11-12 11:46:42'),
(2, 1, 'tesss', 'tes@gmail.com', 'asdwasd', 'Approved', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 11:35:51', '2025-11-12 11:46:39'),
(3, 4, 'tes comment', 'tescomment@gmail.com', 'tescomment', 'Approved', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 11:48:48', '2025-11-12 11:49:10'),
(4, 8, 'tescomment', 'tescomment@gmail.com', 'asdwasd', 'Approved', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:55:08', '2025-11-13 10:55:25'),
(5, 3, 'tes auto approve', 'tesautoapprove@gmail.com', 'tes auto approve', 'Approved', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 11:01:53', '2025-11-13 11:02:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_hashtags`
--

CREATE TABLE `article_hashtags` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `hashtag` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `article_hashtags`
--

INSERT INTO `article_hashtags` (`id`, `article_id`, `hashtag`, `created_at`) VALUES
(5, 2, 'vocabulary', '2025-11-12 11:22:32'),
(6, 2, 'daily', '2025-11-12 11:22:32'),
(7, 2, 'conversation', '2025-11-12 11:22:32'),
(8, 2, 'practice', '2025-11-12 11:22:32'),
(9, 3, 'speaking', '2025-11-12 11:22:32'),
(10, 3, 'confidence', '2025-11-12 11:22:32'),
(11, 3, 'fluency', '2025-11-12 11:22:32'),
(12, 3, 'practice', '2025-11-12 11:22:32'),
(13, 4, '#learning #undangantop', '2025-11-12 11:33:17'),
(15, 5, '#tips #promo', '2025-11-12 12:02:43'),
(28, 6, '#asdwa', '2025-11-12 12:06:16'),
(29, 1, 'belajar', '2025-11-12 12:24:22'),
(30, 1, 'grammar', '2025-11-12 12:24:22'),
(31, 1, 'pemula', '2025-11-12 12:24:22'),
(32, 1, 'tips', '2025-11-12 12:24:22'),
(33, 7, '#learning', '2025-11-12 12:28:14'),
(36, 8, 'tips', '2025-11-13 10:55:50');

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_images`
--

CREATE TABLE `article_images` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_likes`
--

CREATE TABLE `article_likes` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `user_identifier` varchar(255) NOT NULL,
  `reaction_type` enum('like','love') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `article_likes`
--

INSERT INTO `article_likes` (`id`, `article_id`, `user_identifier`, `reaction_type`, `created_at`) VALUES
(1, 4, '::1', 'love', '2025-11-12 11:33:31'),
(2, 8, '::1', 'like', '2025-11-13 10:54:55');

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_views`
--

CREATE TABLE `article_views` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `user_identifier` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `viewed_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `article_views`
--

INSERT INTO `article_views` (`id`, `article_id`, `user_identifier`, `ip_address`, `user_agent`, `viewed_at`, `created_at`) VALUES
(1, 1, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12', '2025-11-12 11:24:35'),
(2, 4, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12', '2025-11-12 11:33:28'),
(3, 2, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12', '2025-11-12 12:24:38'),
(4, 3, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12', '2025-11-12 12:24:40'),
(5, 7, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12', '2025-11-12 12:31:25'),
(6, 8, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12', '2025-11-12 12:41:35'),
(8, 8, '::1', NULL, 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-13', '2025-11-13 08:54:09'),
(9, 2, '::1', NULL, 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-13', '2025-11-13 08:54:17'),
(10, 3, '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13', '2025-11-13 11:01:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `countdown_batches`
--

CREATE TABLE `countdown_batches` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `batch_name` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Asia/Makassar',
  `instructor` varchar(255) DEFAULT NULL,
  `location_mode` enum('Online','Offline','Hybrid') DEFAULT 'Online',
  `location_address` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `registration_deadline` date DEFAULT NULL,
  `target_students` int(11) DEFAULT 0,
  `current_students` int(11) DEFAULT 0,
  `status` enum('Active','Upcoming','Completed','Paused') DEFAULT 'Upcoming',
  `visibility` enum('Public','Private') DEFAULT 'Public',
  `is_active` tinyint(1) DEFAULT 1,
  `show_on_homepage` tinyint(1) DEFAULT 0,
  `background_color` varchar(7) DEFAULT '#2563eb',
  `text_color` varchar(7) DEFAULT '#ffffff',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `countdown_batches`
--

INSERT INTO `countdown_batches` (`id`, `name`, `batch_name`, `title`, `description`, `start_date`, `start_time`, `end_date`, `end_time`, `timezone`, `instructor`, `location_mode`, `location_address`, `price`, `registration_deadline`, `target_students`, `current_students`, `status`, `visibility`, `is_active`, `show_on_homepage`, `background_color`, `text_color`, `created_by`, `created_at`, `updated_at`) VALUES
(4, 'tes update', '', '', 'tes update', '2025-11-15', '00:00:00', '2025-11-15', '23:00:00', 'WITA', 'Firdaus', 'Online', 'Jl. Pettarani Makassar', 100000.00, '2025-11-15', 50, 0, 'Active', 'Public', 1, 0, '#2563eb', '#ffffff', NULL, '2025-11-09 05:59:11', '2025-11-13 10:54:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `gallery`
--

CREATE TABLE `gallery` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_url` text DEFAULT NULL COMMENT 'URL atau path foto (opsional untuk video)',
  `category` enum('Kids','Teens','Intensive') NOT NULL,
  `description` text DEFAULT NULL,
  `media_type` enum('image','video') NOT NULL DEFAULT 'image' COMMENT 'Tipe media (image atau video)',
  `youtube_url` varchar(500) DEFAULT NULL COMMENT 'URL video YouTube (hanya untuk media_type=video)',
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `gallery`
--

INSERT INTO `gallery` (`id`, `title`, `image_url`, `category`, `description`, `media_type`, `youtube_url`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'Pengantin', '/uploads/gallery/image-1762671111954-428673592.jpg', 'Kids', 'Pengantin Haidul', 'image', NULL, 0, '2025-11-09 06:51:51', '2025-11-09 06:51:51'),
(2, 'Tes Judul', NULL, 'Intensive', 'Tes upload video', 'video', 'https://www.youtube.com/watch?v=8REHtRbQR2s', 1, '2025-11-10 08:30:53', '2025-11-10 08:30:53'),
(3, 'Cuci AC', '/uploads/gallery/image-1763031405996-196793058.png', 'Teens', 'Cuci AC', 'image', NULL, 1, '2025-11-13 10:56:46', '2025-11-13 10:56:46');

-- --------------------------------------------------------

--
-- Struktur dari tabel `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `program` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `quota` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `perks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`perks`)),
  `image_url` text DEFAULT NULL,
  `wa_link` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `programs`
--

INSERT INTO `programs` (`id`, `title`, `branch`, `type`, `program`, `start_date`, `end_date`, `quota`, `price`, `perks`, `image_url`, `wa_link`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Tes Program', 'Pettarani', 'tes', 'tes', '2025-11-07', '2025-11-08', 100, 200000.00, '[\"tes\",\"tes\",\"tes\"]', '/uploads/2-1762608452925-465661927.jpg', 'https://wa.me/62812363281234?text=Halo%2C%20saya%20ingin%20mendaftar%20program%20Tes%20Program', 1, '2025-11-08 13:27:44', '2025-11-09 05:57:41'),
(2, 'tes', 'Pettarani', 'tes', 'tes', '2025-11-08', '2025-11-09', 100, 20000.00, '[\"rsadw\",\"sataw\"]', '/uploads/3-1762608537737-998710369.jpg', 'https://wa.me/628124632341342?text=Halo%2C%20saya%20ingin%20mendaftar%20program%20tes', 1, '2025-11-08 13:29:05', '2025-11-08 13:29:05');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `promo_analytics`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `promo_analytics` (
`id` int(11)
,`code` varchar(20)
,`name` varchar(100)
,`discount_value` decimal(10,2)
,`usage_limit` int(11)
,`used_count` int(11)
,`actual_usage` bigint(21)
,`total_discount_given` decimal(32,2)
,`valid_from` timestamp
,`valid_until` timestamp
,`status` varchar(11)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `promo_claims`
--

CREATE TABLE `promo_claims` (
  `id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_phone` varchar(20) NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_city` varchar(100) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `program_name` varchar(255) NOT NULL,
  `program_branch` varchar(50) DEFAULT NULL,
  `program_type` varchar(50) DEFAULT NULL,
  `program_category` varchar(50) DEFAULT NULL,
  `urgency` enum('urgent','this_month','browsing') DEFAULT 'browsing',
  `source` varchar(50) DEFAULT 'promo_hub',
  `device_fingerprint` varchar(255) DEFAULT NULL,
  `follow_up_status` enum('pending','contacted','converted','lost') DEFAULT 'pending',
  `follow_up_notes` text DEFAULT NULL,
  `follow_up_by` int(11) DEFAULT NULL,
  `registered` tinyint(1) DEFAULT 0,
  `registered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores direct promo claims from users who do not have affiliate/promo codes';

--
-- Dumping data untuk tabel `promo_claims`
--

INSERT INTO `promo_claims` (`id`, `user_name`, `user_phone`, `user_email`, `user_city`, `program_id`, `program_name`, `program_branch`, `program_type`, `program_category`, `urgency`, `source`, `device_fingerprint`, `follow_up_status`, `follow_up_notes`, `follow_up_by`, `registered`, `registered_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'firdaus', '0895374751414', 'firdaus@gmail.com', NULL, 2, 'tes', 'Pettarani', 'tes', NULL, 'browsing', 'promo_hub', 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Mi4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLGVuO3E9MC45LTo6MQ==', 'lost', 'batal, karena kurang dana\n', NULL, 0, NULL, '2025-11-12 07:38:21', '2025-11-12 12:57:22', NULL, NULL),
(2, 'tes ambil saja', '081472132391', 'tessajaambil@gmail.com', NULL, 2, 'tes', 'Pettarani', 'tes', NULL, 'browsing', 'promo_hub', 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Mi4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLGVuO3E9MC45LTo6MQ==', 'converted', 'Di Follow up sama daus', NULL, 0, NULL, '2025-11-12 12:51:23', '2025-11-12 12:56:57', NULL, NULL),
(3, 'tanpacodepromo', '0812343273812', 'tanpacodepromo@gmail.com', NULL, 2, 'tes', 'Pettarani', 'tes', NULL, 'browsing', 'promo_hub', 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Mi4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLTo6MQ==', 'pending', NULL, NULL, 0, NULL, '2025-11-13 10:33:25', '2025-11-13 10:44:26', '2025-11-13 10:44:26', 'admin'),
(4, 'testanpacodepromo', '081243712823', 'testanpacodepromo@gmail.com', NULL, 2, 'tes', 'Pettarani', 'tes', NULL, 'browsing', 'promo_hub', 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0Mi4wLjAuMCBTYWZhcmkvNTM3LjM2LWlkLTo6MQ==', 'pending', NULL, NULL, 0, NULL, '2025-11-13 10:44:47', '2025-11-13 10:44:47', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `valid_from` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `valid_until` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `is_active` tinyint(1) DEFAULT 1,
  `applicable_to` enum('all','new_students','specific_programs') DEFAULT 'all',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `promo_codes`
--

INSERT INTO `promo_codes` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `min_purchase`, `max_discount`, `usage_limit`, `used_count`, `valid_from`, `valid_until`, `is_active`, `applicable_to`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'GAJIAN90', 'Promo Gajian', 'Hemat s.d. 90% biaya pendaftaran', 'percentage', 90.00, 0.00, NULL, NULL, 2, '2025-11-13 10:46:20', '2025-11-30 07:59:00', 1, 'all', 1, '2025-11-08 13:13:14', '2025-11-13 10:46:20'),
(2, 'EARLY50', 'Early Bird', 'Diskon 50% untuk pendaftar awal', 'percentage', 50.00, 0.00, NULL, NULL, 0, '2025-11-08 13:57:05', '2024-12-31 15:59:59', 1, 'all', 1, '2025-11-08 13:13:14', '2025-11-08 13:57:05'),
(3, 'STUDENT25', 'Student Discount', 'Khusus mahasiswa aktif', 'percentage', 25.00, 0.00, NULL, NULL, 0, '2024-10-26 16:00:00', '2025-03-31 15:59:59', 1, 'all', 1, '2025-11-08 13:13:14', '2025-11-08 13:13:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `promo_usage`
--

CREATE TABLE `promo_usage` (
  `id` int(11) NOT NULL,
  `promo_code_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `user_phone` varchar(20) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `student_name` varchar(100) NOT NULL,
  `student_email` varchar(100) DEFAULT NULL,
  `student_phone` varchar(20) DEFAULT NULL,
  `original_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `final_amount` decimal(10,2) NOT NULL,
  `follow_up_status` enum('pending','contacted','converted','lost') DEFAULT 'pending',
  `follow_up_notes` text DEFAULT NULL,
  `registered` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `promo_usage`
--

INSERT INTO `promo_usage` (`id`, `promo_code_id`, `user_name`, `user_phone`, `user_email`, `program_name`, `student_name`, `student_email`, `student_phone`, `original_amount`, `discount_amount`, `final_amount`, `follow_up_status`, `follow_up_notes`, `registered`, `deleted_at`, `deleted_by`, `used_at`) VALUES
(1, 1, 'GAJIAN90', '0827436782123', 'GAJIAN90@gmail.com', 'Tes Program', '', NULL, NULL, 200000.00, 180000.00, 20000.00, 'pending', NULL, 0, NULL, NULL, '2025-11-08 13:58:20'),
(2, 1, 'tespromocodesgajian', '0812391239021', 'tespromocodesgajian@gmail.com', 'tes', '', NULL, NULL, 20000.00, 18000.00, 2000.00, 'converted', NULL, 1, NULL, NULL, '2025-11-13 10:46:20');

--
-- Trigger `promo_usage`
--
DELIMITER $$
CREATE TRIGGER `after_promo_usage_insert` AFTER INSERT ON `promo_usage` FOR EACH ROW BEGIN
    CALL UpdatePromoUsage(NEW.promo_code_id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json','text') DEFAULT 'string',
  `category` varchar(50) NOT NULL,
  `label` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `category`, `label`, `description`, `is_public`, `created_at`, `updated_at`, `updated_by`) VALUES
(1, 'admin_name', 'Administrator', 'string', 'profile', 'Admin Name', 'Name of the administrator', 0, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(2, 'admin_email', 'admin@zonaenglish.com', 'string', 'profile', 'Admin Email', 'Email address for admin notifications', 0, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(3, 'whatsapp_promo_hub', '6282188080688', 'string', 'general', 'WhatsApp Promo Hub', 'WhatsApp number for Promo Hub contact', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(4, 'whatsapp_general', '6282188080688', 'string', 'general', 'WhatsApp General', 'General WhatsApp contact number', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(5, 'whatsapp_pettarani', '6282188080688', 'string', 'general', 'WhatsApp Pettarani', 'WhatsApp for Pettarani branch', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(6, 'whatsapp_kolaka', '6282188080688', 'string', 'general', 'WhatsApp Kolaka', 'WhatsApp for Kolaka branch', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(7, 'whatsapp_kendari', '6282188080688', 'string', 'general', 'WhatsApp Kendari', 'WhatsApp for Kendari branch', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(8, 'default_commission_rate', '10', 'number', 'ambassador', 'Default Commission Rate', 'Default commission percentage for new ambassadors', 0, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(10, 'article_comments_enabled', 'true', 'boolean', 'content', 'Enable Comments', 'Allow comments on articles', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(11, 'article_default_status', 'draft', 'string', 'content', 'Default Article Status', 'Default status for new articles', 0, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(12, 'site_name', 'Zona English', 'string', 'general', 'Site Name', 'Website name', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(13, 'site_tagline', 'Belajar Bahasa Inggris dengan Mudah dan Menyenangkan', 'string', 'general', 'Site Tagline', 'Website tagline', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(14, 'contact_phone', '082188080688', 'string', 'contact', 'Phone Number', 'Nomor WhatsApp untuk kontak', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(15, 'contact_email', 'info@zonaenglish.com', 'string', 'contact', 'Contact Email', 'Email untuk kontak umum', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(16, 'office_address', 'Makassar, Sulawesi Selatan', 'text', 'business', 'Office Address', 'Alamat kantor utama', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(17, 'business_hours', '08:00 - 17:00 WITA', 'string', 'business', 'Business Hours', 'Jam operasional', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(18, 'registration_open', 'true', 'boolean', 'business', 'Registration Open', 'Status pendaftaran siswa baru', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(19, 'timezone', 'WITA', 'string', 'general', 'Timezone', 'Zona waktu yang digunakan (WIB/WITA/WIT)', 1, '2025-11-09 06:20:18', '2025-11-09 06:20:18', 1),
(20, 'homepage_video_url', 'https://youtu.be/wGEmHvnCqGQ?si=dP-M5ITXaXyTvS5V', 'text', 'homepage', 'Inside Zona English Video', 'YouTube URL for the homepage preview video (autoplay)', 1, '2025-11-10 08:49:53', '2025-11-13 11:01:09', NULL);

-- --------------------------------------------------------

--
-- Struktur untuk view `ambassador_performance`
--
DROP TABLE IF EXISTS `ambassador_performance`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ambassador_performance`  AS SELECT `a`.`id` AS `id`, `a`.`name` AS `name`, `a`.`role` AS `role`, `a`.`location` AS `location`, `a`.`affiliate_code` AS `affiliate_code`, `a`.`commission_rate` AS `commission_rate`, `a`.`referrals` AS `referrals`, `a`.`total_earnings` AS `total_earnings`, count(`at`.`id`) AS `total_transactions`, sum(case when `at`.`status` = 'confirmed' then `at`.`commission_amount` else 0 end) AS `confirmed_earnings`, sum(case when `at`.`status` = 'pending' then `at`.`commission_amount` else 0 end) AS `pending_earnings` FROM (`ambassadors` `a` left join `affiliate_transactions` `at` on(`a`.`id` = `at`.`ambassador_id`)) WHERE `a`.`is_active` = 1 GROUP BY `a`.`id` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `promo_analytics`
--
DROP TABLE IF EXISTS `promo_analytics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `promo_analytics`  AS SELECT `pc`.`id` AS `id`, `pc`.`code` AS `code`, `pc`.`name` AS `name`, `pc`.`discount_value` AS `discount_value`, `pc`.`usage_limit` AS `usage_limit`, `pc`.`used_count` AS `used_count`, count(`pu`.`id`) AS `actual_usage`, sum(`pu`.`discount_amount`) AS `total_discount_given`, `pc`.`valid_from` AS `valid_from`, `pc`.`valid_until` AS `valid_until`, CASE WHEN `pc`.`valid_until` < current_timestamp() THEN 'Expired' WHEN `pc`.`valid_from` > current_timestamp() THEN 'Not Started' ELSE 'Active' END AS `status` FROM (`promo_codes` `pc` left join `promo_usage` `pu` on(`pc`.`id` = `pu`.`promo_code_id`)) GROUP BY `pc`.`id` ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indeks untuk tabel `affiliate_transactions`
--
ALTER TABLE `affiliate_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ambassador_id` (`ambassador_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_affiliate_transactions_ambassador_status` (`ambassador_id`,`status`);

--
-- Indeks untuk tabel `affiliate_usage`
--
ALTER TABLE `affiliate_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_affiliate` (`affiliate_code`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_ambassador` (`ambassador_id`),
  ADD KEY `idx_follow_up` (`follow_up_status`),
  ADD KEY `idx_registered` (`registered`),
  ADD KEY `idx_source` (`source`);

--
-- Indeks untuk tabel `ambassadors`
--
ALTER TABLE `ambassadors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `affiliate_code` (`affiliate_code`),
  ADD KEY `idx_affiliate_code` (`affiliate_code`),
  ADD KEY `idx_location` (`location`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_ambassadors_active_location` (`is_active`,`location`);

--
-- Indeks untuk tabel `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_published_at` (`published_at`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `article_categories`
--
ALTER TABLE `article_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indeks untuk tabel `article_comments`
--
ALTER TABLE `article_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_article_status` (`article_id`,`status`),
  ADD KEY `idx_status` (`status`);

--
-- Indeks untuk tabel `article_hashtags`
--
ALTER TABLE `article_hashtags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_article_hashtag` (`article_id`,`hashtag`),
  ADD KEY `idx_hashtag` (`hashtag`);

--
-- Indeks untuk tabel `article_images`
--
ALTER TABLE `article_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_article_id` (`article_id`);

--
-- Indeks untuk tabel `article_likes`
--
ALTER TABLE `article_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_article_like` (`article_id`,`user_identifier`),
  ADD KEY `idx_article_reaction` (`article_id`,`reaction_type`);

--
-- Indeks untuk tabel `article_views`
--
ALTER TABLE `article_views`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_daily_view` (`article_id`,`user_identifier`,`viewed_at`),
  ADD KEY `idx_article_date` (`article_id`,`viewed_at`);

--
-- Indeks untuk tabel `countdown_batches`
--
ALTER TABLE `countdown_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_batch_name` (`batch_name`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_order` (`order_index`),
  ADD KEY `idx_media_type` (`media_type`);

--
-- Indeks untuk tabel `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_branch` (`branch`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `promo_claims`
--
ALTER TABLE `promo_claims`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_phone` (`user_phone`),
  ADD KEY `idx_program_id` (`program_id`),
  ADD KEY `idx_follow_up_status` (`follow_up_status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `follow_up_by` (`follow_up_by`);

--
-- Indeks untuk tabel `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_valid_period` (`valid_from`,`valid_until`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `promo_usage`
--
ALTER TABLE `promo_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_promo_code_id` (`promo_code_id`),
  ADD KEY `idx_used_at` (`used_at`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_follow_up_promo` (`follow_up_status`),
  ADD KEY `idx_registered_promo` (`registered`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_key` (`setting_key`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `affiliate_transactions`
--
ALTER TABLE `affiliate_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `affiliate_usage`
--
ALTER TABLE `affiliate_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `ambassadors`
--
ALTER TABLE `ambassadors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `article_categories`
--
ALTER TABLE `article_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `article_comments`
--
ALTER TABLE `article_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `article_hashtags`
--
ALTER TABLE `article_hashtags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT untuk tabel `article_images`
--
ALTER TABLE `article_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `article_likes`
--
ALTER TABLE `article_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `article_views`
--
ALTER TABLE `article_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `countdown_batches`
--
ALTER TABLE `countdown_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `promo_claims`
--
ALTER TABLE `promo_claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `promo_usage`
--
ALTER TABLE `promo_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `affiliate_transactions`
--
ALTER TABLE `affiliate_transactions`
  ADD CONSTRAINT `affiliate_transactions_ibfk_1` FOREIGN KEY (`ambassador_id`) REFERENCES `ambassadors` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `article_comments`
--
ALTER TABLE `article_comments`
  ADD CONSTRAINT `article_comments_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `article_hashtags`
--
ALTER TABLE `article_hashtags`
  ADD CONSTRAINT `article_hashtags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `article_images`
--
ALTER TABLE `article_images`
  ADD CONSTRAINT `article_images_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `article_likes`
--
ALTER TABLE `article_likes`
  ADD CONSTRAINT `article_likes_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `article_views`
--
ALTER TABLE `article_views`
  ADD CONSTRAINT `article_views_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `countdown_batches`
--
ALTER TABLE `countdown_batches`
  ADD CONSTRAINT `countdown_batches_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `promo_claims`
--
ALTER TABLE `promo_claims`
  ADD CONSTRAINT `promo_claims_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `promo_claims_ibfk_2` FOREIGN KEY (`follow_up_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD CONSTRAINT `promo_codes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `promo_usage`
--
ALTER TABLE `promo_usage`
  ADD CONSTRAINT `promo_usage_ibfk_1` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
