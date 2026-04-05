import Link from 'next/link';
import { ArrowRight, BookOpen, FileCheck, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-emerald-100/50 to-teal-50/20 blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-100/40 to-emerald-50/20 blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-24">
        {/* Header Section */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide shadow-sm border border-emerald-200/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Sistem Informasi Terpadu v1.0
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
            Modul Pembukuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Jurnal Akuntansi</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Selamat datang di Portal Akuntansi PT Seumadam. Sistem ini dirancang untuk kemudahan entry data jurnal secara presisi dan efisien.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link href="/input-jurnal" className="group">
            <div className="h-full block p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">Input Jurnal</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Pilih Bulan Buku dan Unit (Cut-Off), lalu catat transaksi harian secara otomatis (Double-Entry).</p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-emerald-600">
                  Buka Modul <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/laporan-jurnal" className="group">
            <div className="h-full block p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:teal-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-inner group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">Laporan & Tabel</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Cetak, lihat, dan ekspor data Jurnal Transaksi bulanan ke dalam format Microsoft Excel (.xlsx).</p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-teal-600">
                  Buka Modul <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/master-rekening" className="group">
            <div className="h-full block p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:sky-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">Master Rekening</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Database Chart of Accounts dan pengaturan kode unit perusahaan yang digunakan untuk pemetaan.</p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-sky-600">
                  Buka Modul <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
