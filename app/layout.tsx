import { SidebarProvider } from '@/lib/sidebar-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
      <body className={`${inter.className} text-slate-900`}>
        <SidebarProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </SidebarProvider>
      </body>
    </html>
  );
}
