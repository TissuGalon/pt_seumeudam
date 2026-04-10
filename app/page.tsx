'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  BookOpen, 
  FileCheck, 
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NavigationCards = [
  {
    title: "Master Rekening",
    description: "Database Chart of Accounts dan pengaturan kode unit perusahaan yang digunakan untuk pemetaan sistem.",
    href: "/master-rekening",
    icon: BookOpen,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "group-hover:border-blue-200",
    gradient: "from-blue-600 to-indigo-600"
  },
  {
    title: "Input Jurnal harian",
    description: "Pilih Bulan Buku dan Unit (Cut-Off), lalu catat transaksi harian secara otomatis dengan sistem Double-Entry.",
    href: "/input-jurnal",
    icon: FileCheck,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "group-hover:border-emerald-200",
    gradient: "from-emerald-600 to-teal-600"
  },
  {
    title: "Laporan & Jurnal",
    description: "Cetak, lihat, dan ekspor data Jurnal Transaksi bulanan ke dalam format Microsoft Excel untuk audit & arsip.",
    href: "/laporan-jurnal",
    icon: FileSpreadsheet,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "group-hover:border-amber-200",
    gradient: "from-amber-600 to-orange-600"
  }
];

export default function Home() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 relative scroll-smooth h-full">
      {/* Premium Decorative Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-100/40 to-teal-50/20 blur-[120px] opacity-60 animate-pulse transition-all duration-1000" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-100/30 to-emerald-50/20 blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 lg:py-28">
        {/* Hero Section */}
        <div className="max-w-3xl mb-20 space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white shadow-xl shadow-emerald-100/50 border border-emerald-100 text-emerald-700 text-xs font-black tracking-widest uppercase">
            <Zap className="w-4 h-4 fill-emerald-500 stroke-none" />
            Sistem Informasi Akuntansi v1.2
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Kelola Finansial <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500">
              Lebih Presisi.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
            Selamat datang di Portal Akuntansi <span className="text-slate-900 font-bold underline decoration-emerald-200 underline-offset-4">PT Seumadam</span>. 
            Automasi pembukuan jurnal dengan efisiensi tinggi dan akurasi data yang terjamin.
          </p>

          <div className="flex flex-wrap items-center gap-8 pt-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center border border-slate-100">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-400">Secure Audit Trails</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center border border-slate-100">
                   <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm font-bold text-slate-400">Real-time Reports</span>
             </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NavigationCards.map((card, idx) => (
            <Link key={idx} href={card.href} className="group perspective-1000">
              <div className={cn(
                  "h-full p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-500",
                  "group-hover:shadow-2xl group-hover:shadow-slate-300/50 group-hover:-translate-y-2 group-hover:rotate-1",
                  card.borderColor
              )}>
                <div className="relative z-10 flex flex-col h-full space-y-6">
                  <div className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-12",
                      "bg-gradient-to-br text-white",
                      card.gradient
                  )}>
                    <card.icon className="h-8 w-8 stroke-[2.5px]" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                      {card.title}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                      {card.description}
                    </p>
                  </div>

                  <div className={cn(
                    "pt-6 flex items-center text-sm font-black uppercase tracking-widest transition-all",
                    card.textColor
                  )}>
                    Buka Modul 
                    <ArrowRight className="ml-2 w-4 h-4 stroke-[3px] group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

                {/* Glassy Background Accent */}
                <div className={cn(
                    "absolute top-0 right-0 w-40 h-40 rounded-bl-[10rem] transition-all duration-700 opacity-20 -z-0 group-hover:opacity-30 group-hover:scale-110",
                    card.lightColor
                )} />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Stats Mockup */}
        <div className="mt-24 pt-12 border-t-2 border-slate-100 font-black text-slate-300 tracking-[0.3em] uppercase text-[10px] flex gap-10">
           <span>Supabase Cloud Integrated</span>
           <span className="text-emerald-500/30">Next.js 14 Engine</span>
           <span>TanStack Logic 5.0</span>
        </div>
      </div>
    </div>
  );
}
