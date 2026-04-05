-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Tabel master_unit
-- Menyimpan data lokasi/unit kebun
-- ==========================================
create table public.master_unit (
    "KOKE" varchar(10) primary key,
    "NAKE" varchar(255) not null,
    "PIMPINAN" varchar(255),
    "NAMA_KTU" varchar(255),
    "NAMA_ASST" varchar(255),
    "JAB_PIM" varchar(255),
    "JAB_KTU" varchar(255),
    "JAB_ASST" varchar(255),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. Tabel master_rekening
-- Menyimpan sandi-sandi akun akuntansi (Chart of Account)
-- ==========================================
create table public.master_rekening (
    "REKSUB" varchar(50) primary key,
    "REKIN" varchar(50) not null,
    "NAMA_PERK" varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. Tabel jurnal_transaksi
-- Menyimpan data transaksi harian double-entry
-- ==========================================
create table public.jurnal_transaksi (
    id uuid default uuid_generate_v4() primary key,
    "KOKE" varchar(10) not null references public.master_unit("KOKE"),
    "KOBU" varchar(5) not null,
    "NO_BUKJUR" varchar(50) not null,
    "TANGGAL" date not null,
    "NOREC" varchar(50),
    "REK" varchar(50) not null references public.master_rekening("REKSUB"),
    "REKLA" varchar(50) not null references public.master_rekening("REKSUB"),
    "NAREK" varchar(255),
    "URAIAN1" text,
    "URAIAN2" text,
    "URAIAN3" text,
    "URAIAN4" text,
    "DEBET" numeric(15,2) default 0.00,
    "KREDIT" numeric(15,2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Initial Dummy Data for Testing (Optional)
insert into public.master_unit ("KOKE", "NAKE") values 
('00', 'Kantor Pusat PT Seumadam'),
('01', 'Kebun Plasma Seumadam');

insert into public.master_rekening ("REKSUB", "REKIN", "NAMA_PERK") values 
('154.00', '154', 'Kas Lintas Unit'),
('210.00', '210', 'Hutang Gaji'),
('210.01', '210', 'Gaji Pokok');
