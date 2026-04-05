import { LayoutDashboard } from 'lucide-react';

export default function MasterUnitPage() {
  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center max-w-lg">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard className="w-10 h-10 text-slate-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Master Unit / Kebun</h1>
        <p className="text-slate-500 mb-6">Modul ini berisikan data daftar kebun, pimpinan afdeling, dan setup referensi lokasi jurnal.</p>
        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-full border border-slate-200">
          Dalam Pengembangan
        </span>
      </div>
    </div>
  );
}
