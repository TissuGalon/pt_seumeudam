'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BookOpen, FileCheck, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Master Unit', href: '/master-unit', icon: LayoutDashboard },
    { name: 'Master Rekening', href: '/master-rekening', icon: BookOpen },
    { name: 'Input Jurnal', href: '/input-jurnal', icon: FileCheck },
    { name: 'Laporan Jurnal', href: '/laporan-jurnal', icon: FileSpreadsheet },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950 text-slate-50 flex flex-col items-stretch border-r border-slate-800 z-50 shadow-2xl">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            S
          </div>
          <span className="font-bold text-lg tracking-tight">SIA Seumadam</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Menu Utama
        </div>
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive ? 'scale-110 text-emerald-400' : 'text-slate-500 group-hover:text-slate-300 group-hover:rotate-6'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2026 PT Seumadam
      </div>
    </aside>
  );
}
