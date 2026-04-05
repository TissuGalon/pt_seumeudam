-- ==========================================
-- Schema Database MySQL untuk PT Seumadam
-- ==========================================

-- 1. Tabel master_unit
-- Menyimpan data lokasi/unit kebun
CREATE TABLE `master_unit` (
    `KOKE` VARCHAR(10) PRIMARY KEY,
    `NAKE` VARCHAR(255) NOT NULL,
    `PIMPINAN` VARCHAR(255),
    `NAMA_KTU` VARCHAR(255),
    `NAMA_ASST` VARCHAR(255),
    `JAB_PIM` VARCHAR(255),
    `JAB_KTU` VARCHAR(255),
    `JAB_ASST` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabel master_rekening
-- Menyimpan sandi-sandi akun akuntansi (Chart of Account)
CREATE TABLE `master_rekening` (
    `REKSUB` VARCHAR(50) PRIMARY KEY,
    `REKIN` VARCHAR(50) NOT NULL,
    `NAMA_PERK` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Tabel jurnal_transaksi
-- Menyimpan data transaksi harian double-entry
CREATE TABLE `jurnal_transaksi` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `KOKE` VARCHAR(10) NOT NULL,
    `KOBU` VARCHAR(5) NOT NULL,
    `NO_BUKJUR` VARCHAR(50) NOT NULL,
    `TANGGAL` DATE NOT NULL,
    `NOREC` VARCHAR(50),
    `REK` VARCHAR(50) NOT NULL,
    `REKLA` VARCHAR(50) NOT NULL,
    `NAREK` VARCHAR(255),
    `URAIAN1` TEXT,
    `URAIAN2` TEXT,
    `URAIAN3` TEXT,
    `URAIAN4` TEXT,
    `DEBET` DECIMAL(15,2) DEFAULT 0.00,
    `KREDIT` DECIMAL(15,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`KOKE`) REFERENCES `master_unit`(`KOKE`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`REK`) REFERENCES `master_rekening`(`REKSUB`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`REKLA`) REFERENCES `master_rekening`(`REKSUB`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ==========================================
-- Initial Dummy Data for Testing (Optional)
-- ==========================================
INSERT INTO `master_unit` (`KOKE`, `NAKE`) VALUES 
('00', 'Kantor Pusat PT Seumadam'),
('01', 'Kebun Plasma Seumadam');

INSERT INTO `master_rekening` (`REKSUB`, `REKIN`, `NAMA_PERK`) VALUES 
('154.00', '154', 'Kas Lintas Unit'),
('210.00', '210', 'Hutang Gaji'),
('210.01', '210', 'Gaji Pokok');
