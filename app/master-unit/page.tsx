import UnitTable from '@/components/master-unit/unit-table';
import { getMasterUnit } from '@/lib/actions/master-unit';
import { LayoutDashboard } from 'lucide-react';

export default async function MasterUnitPage() {
  const data = await getMasterUnit();

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-sky-600" />
            Master Unit / Kebun
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data daftar kebun, pimpinan afdeling, dan referensi lokasi operasional.
          </p>
        </div>
      </div>
      
      <UnitTable data={data} />
    </div>
  );
}
