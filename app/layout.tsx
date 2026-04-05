import { GlobalSidebar } from '@/components/global-sidebar';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SIA - PT Seumadam',
  description: 'Sistem Informasi Akuntansi & Pembukuan Jurnal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-900 overflow-hidden`}>
        <div className="flex h-screen w-full">
          {/* Sidebar */}
          <GlobalSidebar />
          
          {/* Main Content */}
          <main className="flex-1 flex flex-col ml-64 h-full bg-slate-50/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
