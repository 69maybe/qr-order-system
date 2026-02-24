-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 25, 2025 at 09:25 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qr_order_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `ban_an`
--

DROP TABLE IF EXISTS `ban_an`;
CREATE TABLE IF NOT EXISTS `ban_an` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_ban` varchar(10) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `trang_thai` enum('trong','co_nguoi') DEFAULT 'trong',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_ban` (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ban_an`
--

INSERT INTO `ban_an` (`id`, `ma_ban`, `qr_code`, `trang_thai`) VALUES
(1, 'B01', '/uploads/qrcodes/qrcode-B01-1766653949870.png', 'trong'),
(2, 'B02', '/uploads/qrcodes/qrcode-B02-1766654017244.png', 'trong'),
(3, 'B03', '/uploads/qrcodes/qrcode-B03-1766654056340.png', 'trong'),
(4, 'B04', '/uploads/qrcodes/qrcode-B04-1766654076882.png', 'trong'),
(5, 'B05', '/uploads/qrcodes/qrcode-B05-1766654103205.png', 'trong'),
(9, 'B06', '/uploads/qrcodes/qrcode-B06-1766653900387.png', 'trong');

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_don_hang`
--

DROP TABLE IF EXISTS `chi_tiet_don_hang`;
CREATE TABLE IF NOT EXISTS `chi_tiet_don_hang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `don_hang_id` int DEFAULT NULL,
  `mon_an_id` int DEFAULT NULL,
  `so_luong` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `don_hang_id` (`don_hang_id`),
  KEY `mon_an_id` (`mon_an_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `chi_tiet_don_hang`
--

INSERT INTO `chi_tiet_don_hang` (`id`, `don_hang_id`, `mon_an_id`, `so_luong`) VALUES
(8, 7, 1, 2),
(9, 8, 5, 3),
(10, 9, 4, 10),
(11, 10, 2, 1),
(12, 11, 5, 1),
(13, 12, 8, 1),
(14, 13, 6, 1),
(15, 13, 4, 2),
(16, 13, 9, 1),
(17, 14, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `don_hang`
--

DROP TABLE IF EXISTS `don_hang`;
CREATE TABLE IF NOT EXISTS `don_hang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ban_id` int DEFAULT NULL,
  `trang_thai` enum('cho_xu_ly','dang_chuan_bi','da_phuc_vu','huy') DEFAULT 'cho_xu_ly',
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tong_tien` decimal(10,2) DEFAULT '0.00',
  `da_thanh_toan` tinyint(1) DEFAULT '0',
  `nhan_vien_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ban_id` (`ban_id`),
  KEY `fk_donhang_nhanvien` (`nhan_vien_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `don_hang`
--

INSERT INTO `don_hang` (`id`, `ban_id`, `trang_thai`, `ngay_tao`, `tong_tien`, `da_thanh_toan`, `nhan_vien_id`) VALUES
(7, 2, 'da_phuc_vu', '2025-12-22 15:20:36', 90000.00, 1, 2),
(8, 3, 'da_phuc_vu', '2025-12-01 15:26:06', 30000.00, 1, 2),
(9, 1, 'da_phuc_vu', '2025-12-19 15:33:42', 20000.00, 1, 2),
(10, 1, 'da_phuc_vu', '2025-12-01 15:35:54', 50000.00, 1, 2),
(11, 2, 'da_phuc_vu', '2025-12-02 05:54:48', 10000.00, 1, 2),
(12, 2, 'da_phuc_vu', '2025-12-21 07:43:44', 2000.00, 1, 2),
(13, 5, 'da_phuc_vu', '2025-12-23 16:17:54', 20000.00, 1, 2),
(14, 5, 'da_phuc_vu', '2025-12-23 16:19:03', 90000.00, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `mon_an`
--

DROP TABLE IF EXISTS `mon_an`;
CREATE TABLE IF NOT EXISTS `mon_an` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_mon` varchar(100) NOT NULL,
  `mo_ta` text,
  `gia` decimal(10,2) NOT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `loai_mon` enum('mon_chinh','nuoc_uong','phu_kien') DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mon_an`
--

INSERT INTO `mon_an` (`id`, `ten_mon`, `mo_ta`, `gia`, `hinh_anh`, `loai_mon`, `status`) VALUES
(1, 'Phở bò', 'Món truyền thống Việt Nam', 45000.00, '/uploads/menu/menu-1766654570517-35147595.jpg', 'mon_chinh', 'active'),
(2, 'Bún chả', 'Đặc sản Hà Nội', 50000.00, 'bun-cha.jpg', 'mon_chinh', 'active'),
(3, 'Cơm tấm', 'Cơm tấm sườn bì chả', 40000.00, '/uploads/menu/menu-1766654590773-259252502.jpg', 'mon_chinh', 'active'),
(4, 'Trà đá', 'S-tier nước giải khát, vua của mọi loại đồ uống', 2000.00, '/uploads/menu/menu-1766654601717-46527893.jpg', 'nuoc_uong', 'active'),
(5, 'Nước suối', 'Nước suối 500ml', 10000.00, '/uploads/menu/menu-1766654608886-7738028.png', 'nuoc_uong', 'active'),
(6, 'Coca-Cola', 'Giải khát cực mạnh', 15000.00, '/uploads/menu/menu-1766654616017-903790465.jpg', 'nuoc_uong', 'active'),
(7, 'Khăn ướt', 'Khăn ướt Negav dùng một lần', 3000.00, '/uploads/menu/menu-1766654631827-698272864.jpg', 'phu_kien', 'active'),
(8, 'Khăn giấy', 'Khăn giấy lau mồm', 2000.00, '/uploads/menu/menu-1766654637408-507747153.jpg', 'phu_kien', 'active'),
(9, 'Muỗng nhựa', 'Muỗng dùng một lần', 1000.00, '/uploads/menu/menu-1764604204940-739466492.png', 'phu_kien', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `nguoi_dung`
--

DROP TABLE IF EXISTS `nguoi_dung`;
CREATE TABLE IF NOT EXISTS `nguoi_dung` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `vai_tro` enum('admin','nhanvien') NOT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `nguoi_dung`
--

INSERT INTO `nguoi_dung` (`id`, `ten_dang_nhap`, `mat_khau`, `vai_tro`, `ngay_tao`) VALUES
(1, 'admin', '$2b$10$UEJCw2U7hjnlFM3q4rb9hOZ3My3.6PGNgZoTlh8blumcRLnkPYe6.', 'admin', '2025-10-23 08:59:07'),
(2, 'nhanvien1', '$2b$10$UEJCw2U7hjnlFM3q4rb9hOZ3My3.6PGNgZoTlh8blumcRLnkPYe6.', 'nhanvien', '2025-10-23 08:59:07');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_1` FOREIGN KEY (`don_hang_id`) REFERENCES `don_hang` (`id`),
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_2` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an` (`id`);

--
-- Constraints for table `don_hang`
--
ALTER TABLE `don_hang`
  ADD CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`ban_id`) REFERENCES `ban_an` (`id`),
  ADD CONSTRAINT `fk_donhang_nhanvien` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nguoi_dung` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
