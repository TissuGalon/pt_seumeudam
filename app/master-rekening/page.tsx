import RekeningTable from '@/components/master-rekening/rekening-table';
import { getMasterRekening } from '@/lib/actions/master-rekening';
import { BookOpen } from 'lucide-react';

export default async function MasterRekeningPage() {
  const data = await getMasterRekening();

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" />
            Master Rekening (COA)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola hirarki Chart of Account dan sandi akun spesifik perusahaan.
          </p>
        </div>
      </div>
      
      <RekeningTable data={data} />
    </div>
  );
}
