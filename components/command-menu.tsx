'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Dialog } from 'radix-ui';
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  FileCheck, 
  FileSpreadsheet,
  Search,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, [setOpen]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Search"
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <Dialog.Title className="sr-only">Menu Pencarian Global</Dialog.Title>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-slate-900/5">
        <div className="flex items-center border-b border-slate-100 px-4">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <Command.Input
            placeholder="Cari fitur atau laporan..."
            className="flex-1 h-14 bg-transparent outline-none text-[15px] font-medium text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="h-5 px-1.5 rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-sm uppercase">ESC</kbd>
          </div>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Command.Empty className="py-12 text-center text-sm text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <Search className="h-6 w-6 text-slate-300" />
              </div>
              <p className="font-medium">Tidak ada fitur yang ditemukan.</p>
            </div>
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 pt-2 pb-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Menu Utama</div>
            <Item
              onSelect={() => runCommand(() => router.push('/'))}
              icon={Home}
              label="Dashboard"
              shortcut="H"
            />
            <Item
              onSelect={() => runCommand(() => router.push('/master-unit'))}
              icon={LayoutDashboard}
              label="Master Unit"
              shortcut="U"
            />
            <Item
              onSelect={() => runCommand(() => router.push('/master-rekening'))}
              icon={BookOpen}
              label="Master Rekening"
              shortcut="R"
            />
          </Command.Group>

          <Command.Separator className="h-px bg-slate-100 mx-2 my-2" />

          <Command.Group heading="Reports" className="px-2 pt-1 pb-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Jurnal & Laporan</div>
            <Item
              onSelect={() => runCommand(() => router.push('/input-jurnal'))}
              icon={FileCheck}
              label="Input Jurnal"
              shortcut="I"
            />
            <Item
              onSelect={() => runCommand(() => router.push('/laporan-jurnal'))}
              icon={FileSpreadsheet}
              label="Laporan Jurnal"
              shortcut="L"
            />
          </Command.Group>

          <Command.Separator className="h-px bg-slate-100 mx-2 my-2" />

          <Command.Group heading="Settings" className="px-2 pt-1 pb-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Sistem</div>
            <Item
              onSelect={() => runCommand(() => router.push('/logout'))}
              icon={LogOut}
              label="Keluar / Logout"
            />
          </Command.Group>
        </Command.List>

        <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="h-5 px-1.5 rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-sm">↑↓</kbd>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="h-5 px-1.5 rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-sm">ENTER</kbd>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-600/50 uppercase tracking-[0.15em]">SIA Seumadam Search</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

function Item({ 
  onSelect, 
  icon: Icon, 
  label, 
  shortcut 
}: { 
  onSelect: () => void; 
  icon: any; 
  label: string;
  shortcut?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center justify-between px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-emerald-500 aria-selected:text-white transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-50 group-aria-selected:bg-white/20 flex items-center justify-center transition-colors">
          <Icon className="h-5 w-5 text-slate-400 group-aria-selected:text-white transition-colors" />
        </div>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {shortcut && (
          <kbd className="hidden sm:inline-flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 group-aria-selected:border-white/20 group-aria-selected:bg-white/20 group-aria-selected:text-white transition-all">
            {shortcut}
          </kbd>
        )}
        <ArrowRight className="h-4 w-4 opacity-0 group-aria-selected:opacity-100 -translate-x-2 group-aria-selected:translate-x-0 transition-all text-white/70" />
      </div>
    </Command.Item>
  );
}
