# Rencana Migrasi Database ke Supabase (via MCP)

Dokumen ini merinci langkah-langkah untuk memigrasikan database MySQL (Hostinger) saat ini ke Supabase (PostgreSQL) menggunakan integrasi MCP.

## 1. Persiapan Lingkungan (Environment Setup)

### Instalasi Dependensi
Kita perlu menginstal library resmi Supabase untuk integrasi Next.js.
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Konfigurasi `.env.local`
Tambahkan variabel lingkungan berikut (ambil dari dashboard Supabase):
```env
NEXT_PUBLIC_SUPABASE_URL=https://ohdnbicqjatojnvpftjv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 2. Migrasi Schema (MySQL ke PostgreSQL)

### Finalisasi `supabase/schema.sql`
Update file `supabase/schema.sql` untuk menyertakan tabel `saldo_awal` yang belum ada, serta menyesuaikan tipe data dari MySQL ke PostgreSQL (misal: `AUTO_INCREMENT` menjadi `uuid` atau `bigserial`).

### Eksekusi Schema via MCP
Gunakan tool `execute_sql` dari Supabase MCP untuk menjalankan schema tersebut langsung ke instance database Supabase.

## 3. Implementasi Supabase Client

Buat helper client di folder `lib/supabase/` untuk menangani koneksi baik di sisi client maupun server (sesuai best practice Next.js App Router).

- `lib/supabase/client.ts`: Untuk Client Components.
- `lib/supabase/server.ts`: Untuk Server Components dan Server Actions.
- `lib/supabase/middleware.ts`: Untuk refresh session di middleware.

## 4. Refactoring Kode (Pemisahan dari MySQL2)

Identifikasi dan ubah semua penggunaan `pool.query()` dari `mysql2` di:
- `lib/actions/*.ts`
- Route Handlers (jika ada)

### Contoh Perubahan:
**Sebelum (MySQL):**
```typescript
const [rows] = await pool.query('SELECT * FROM master_unit');
```

**Sesudah (Supabase):**
```typescript
const { data, error } = await supabase.from('master_unit').select('*');
```

## 5. Migrasi Data (Opsional)

Jika ada data penting di database MySQL saat ini, kita bisa melakukan:
1. Export MySQL ke CSV.
2. Import CSV ke Supabase via Dashboard atau Script.

## 6. Verifikasi & Pembersihan

- Jalankan `npm run dev` dan tes fungsionalitas CRUD pada:
  - Manajemen Unit
  - Chart of Account (Master Rekening)
  - Jurnal Transaksi
  - Saldo Awal
- Setelah stabil, hapus dependensi `mysql2` dan file `lib/db.ts`.

---
**Status: Menunggu Persetujuan**
Silakan berikan masukan atau setujui rencana ini untuk memulai eksekusi.
