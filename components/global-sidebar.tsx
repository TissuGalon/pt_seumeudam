'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BookOpen, FileCheck, FileSpreadsheet, ChevronLeft, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/lib/sidebar-context';
import { Button } from '@/components/ui/button';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, openMobile, setOpenMobile } = useSidebar();

  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Master Unit', href: '/master-unit', icon: LayoutDashboard },
    { name: 'Master Rekening', href: '/master-rekening', icon: BookOpen },
    { name: 'Input Jurnal', href: '/input-jurnal', icon: FileCheck },
    { name: 'Laporan Jurnal', href: '/laporan-jurnal', icon: FileSpreadsheet },
  ];

  const secondaryLinks = [
    { name: 'Pengaturan', href: '/settings', icon: Settings },
    { name: 'Keluar', href: '/logout', icon: LogOut, className: 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300' },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 bg-slate-950 text-slate-50 flex flex-col items-stretch border-r border-slate-800 z-[70] transition-all duration-300 ease-in-out shadow-2xl overflow-hidden',
        isCollapsed ? 'w-20' : 'w-64',
        openMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 bg-slate-950/50 backdrop-blur shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
            S
          </div>
          <div className={cn("transition-opacity duration-300 flex flex-col min-w-0", isCollapsed ? 'opacity-0 w-0' : 'opacity-100')}>
            <span className="font-bold text-base tracking-tight truncate leading-none">SIA Seumadam</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] mt-1">PT Seumadam</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className={cn("px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-opacity duration-300", isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100')}>
          Menu Utama
        </div>
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpenMobile(false)}
              className={cn(
                'group flex items-center h-11 rounded-xl text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  'h-5 w-5 transition-all duration-300 shrink-0',
                  isActive ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span className={cn("transition-all duration-300 truncate", isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100')}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className={cn("px-3 pt-6 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-opacity duration-300", isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100')}>
          Lainnya
        </div>
        {secondaryLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setOpenMobile(false)}
            className={cn(
              'group flex items-center h-10 rounded-xl text-xs font-medium transition-all duration-200',
              item.className || 'text-slate-500 hover:bg-slate-900 hover:text-slate-300',
              isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
            )}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className={cn("transition-all duration-300 truncate", isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100')}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 shrink-0 bg-slate-950/80 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="bg-slate-900/50 rounded-lg p-3 mb-4 border border-white/5">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status Sistem</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] text-slate-300 font-medium font-mono">Server Online</span>
            </div>
          </div>
        )}
        <div className={cn("flex items-center transition-all duration-300", isCollapsed ? 'flex-col gap-4' : 'justify-between')}>
          <div className={cn("text-[10px] text-slate-600 font-medium transition-opacity", isCollapsed ? 'opacity-0 h-0 w-0 hidden' : 'opacity-100')}>
            &copy; 2026 PT SEUMADAM
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-900 border border-white/5"
            onClick={toggleSidebar}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
