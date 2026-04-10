'use client';

import React from 'react';
import { GlobalSidebar } from '@/components/global-sidebar';
import { useSidebar } from '@/lib/sidebar-context';
import { cn } from '@/lib/utils';
import { Menu, X, Bell, User, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/command-menu';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, openMobile, setOpenMobile, toggleSidebar, toggleMobile } = useSidebar();
  const [openCommand, setOpenCommand] = React.useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50/50 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <GlobalSidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 bg-white/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600 hover:bg-slate-100 rounded-xl"
              onClick={toggleMobile}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className={cn("h-5 w-5 transition-transform duration-500", isCollapsed && "rotate-180")} />
            </Button>

            <div 
              className="hidden md:flex items-center gap-3 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/60 w-64 lg:w-80 group hover:border-emerald-300 hover:bg-white cursor-pointer transition-all duration-300 select-none shadow-sm hover:shadow-emerald-500/5"
              onClick={() => setOpenCommand(true)}
            >
              <SearchIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <div className="flex-1 text-[13px] text-slate-400 font-medium truncate">
                Cari fitur atau laporan...
              </div>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-black text-slate-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-xl transition-all hover:scale-105 active:scale-95">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </Button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block opacity-50"></div>
            
            <div className="flex items-center gap-3 pl-1 group cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">Admin User</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-70">SIA SEUMADAM</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center transition-all group-hover:shadow-md group-hover:rotate-3 group-hover:scale-110">
                <User className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto relative scroll-smooth bg-slate-50/30">
          {children}
        </main>

        <CommandMenu open={openCommand} setOpen={setOpenCommand} />
      </div>
    </div>
  );
}
