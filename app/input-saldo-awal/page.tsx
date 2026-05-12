'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Upload, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Calendar,
  FileSpreadsheet,
  X,
  Search,
  Check,
  RefreshCcw,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getMasterUnit } from '@/lib/actions/master-unit';
import { getMasterRekening } from '@/lib/actions/master-rekening';
import { addSaldoAwal, getSaldoAwal, clearSaldoAwal } from '@/lib/actions/saldo-awal';
import { MasterUnit } from '@/lib/types/master-unit';
import { MasterRekening } from '@/lib/types/master-rekening';
import { SaldoAwal } from '@/lib/types/saldo-awal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BULAN_OPTIONS = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
  { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

export default function InputSaldoAwalPage() {
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [rekening, setRekening] = useState<MasterRekening[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('01');
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
  
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [existingData, setExistingData] = useState<SaldoAwal[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const [u, r] = await Promise.all([
        getMasterUnit(),
        getMasterRekening()
      ]);
      setUnits(u);
      setRekening(r);
    };
    init();
  }, []);

  const fetchExistingData = async () => {
    if (!selectedUnit || !selectedBulan || !selectedTahun) return;
    setLoading(true);
    try {
      const data = await getSaldoAwal(selectedUnit, selectedBulan, selectedTahun);
      setExistingData(data);
    } catch (err) {
      console.error("Failed to fetch existing data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingData();
  }, [selectedUnit, selectedBulan, selectedTahun]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Map data to match schema and show in preview
      const mapped = data.map((row: any) => ({
        KOKE: String(row.KOKE || selectedUnit),
        BULAN: String(row.BULAN || selectedBulan),
        TAHUN: selectedTahun, // We use the selected year from UI
        REK: String(row.REKSUB || row.REK || ''),
        NAMA_PERK: row.NAMA_PERK || '',
        DEBET: parseFloat(row.SAWAL_DEB || row.DEBET || 0),
        KREDIT: parseFloat(row.SAWAL_KRE || row.KREDIT || 0)
      })).filter(r => r.REK !== '');

      setPreviewData(mapped);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async () => {
    if (previewData.length === 0) return;
    setLoading(true);
    setMessage(null);

    try {
      // Convert preview data to SaldoAwal type
      const rowsToSave: SaldoAwal[] = previewData.map(p => ({
        KOKE: p.KOKE,
        BULAN: p.BULAN,
        TAHUN: p.TAHUN,
        REK: p.REK,
        DEBET: p.DEBET,
        KREDIT: p.KREDIT
      }));

      // Optional: Clear existing first
      await clearSaldoAwal(selectedUnit, selectedBulan, selectedTahun);
      await addSaldoAwal(rowsToSave);

      setMessage({ type: 'success', text: `Berhasil menyimpan ${rowsToSave.length} data saldo awal.` });
      setPreviewData([]);
      fetchExistingData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal menyimpan: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Hapus semua saldo awal untuk unit dan periode ini?")) return;
    setLoading(true);
    try {
      await clearSaldoAwal(selectedUnit, selectedBulan, selectedTahun);
      setMessage({ type: 'success', text: 'Data saldo awal telah dikosongkan.' });
      fetchExistingData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal menghapus: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-10 scroll-smooth bg-slate-50/20">
      {/* Header */}
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-inner">
                <TrendingUp className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Input Saldo Awal</h1>
                <p className="text-slate-400 mt-2 font-medium">Pengaturan saldo awal akun untuk memulai periode pembukuan baru.</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 px-6 h-12 rounded-2xl font-black text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import Excel
          </Button>
          {previewData.length > 0 && (
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 rounded-2xl font-black text-sm shadow-xl shadow-emerald-200 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Saldo Awal'}
            </Button>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <Building2 className="w-4 h-4 text-indigo-500" />
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Unit & Periode</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              <option value="">-- Pilih Unit --</option>
              {units.map(u => <option key={u.KOKE} value={u.KOKE}>{u.KOKE} - {u.NAKE}</option>)}
            </select>
            <select 
              className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
            >
              {BULAN_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <input 
              type="number"
              className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
           <div className="relative z-10">
              <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Total Saldo Awal</div>
              <div className="text-3xl font-black tracking-tight">{existingData.length} <small className="text-xs font-medium opacity-60">Akun</small></div>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-indigo-100">
                 <CheckCircle2 className="w-3 h-3" /> Data sudah tersinkronisasi
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center">
            <Button 
              variant="ghost"
              onClick={handleClear}
              disabled={loading || existingData.length === 0}
              className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold flex flex-col items-center gap-1 h-auto py-3 rounded-2xl w-full"
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-[10px] uppercase tracking-widest">Kosongkan Data</span>
            </Button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-4 duration-300",
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
          <button className="ml-auto" onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 h-2 w-6 rounded-full"></div>
             <h2 className="font-black text-xl text-slate-800 tracking-tight">
               {previewData.length > 0 ? 'Preview Data Excel' : 'Daftar Saldo Awal Terdaftar'}
             </h2>
          </div>
          {previewData.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setPreviewData([])} className="text-slate-400 hover:text-rose-500">
               Batalkan Preview
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Kode Akun</th>
                <th className="px-8 py-4">Nama Rekening</th>
                <th className="px-8 py-4 text-right">Debet</th>
                <th className="px-8 py-4 text-right">Kredit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                      <span className="text-sm font-bold text-slate-400">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : (previewData.length > 0 ? previewData : existingData).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <FileSpreadsheet className="w-8 h-8 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-700 font-bold text-lg">Belum ada data saldo awal</p>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">Silakan import dari Excel atau gunakan formulir untuk menambah data.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (previewData.length > 0 ? previewData : existingData).map((row, i) => {
                const rekDetail = rekening.find(r => r.REKSUB === row.REK);
                return (
                  <tr key={i} className={cn("hover:bg-indigo-50/30 transition-colors", previewData.length > 0 && "bg-emerald-50/10")}>
                    <td className="px-8 py-4 font-mono text-sm font-bold text-indigo-700">{row.REK}</td>
                    <td className="px-8 py-4 text-sm font-bold text-slate-700">{row.NAMA_PERK || rekDetail?.NAMA_PERK || 'Tidak dikenal'}</td>
                    <td className="px-8 py-4 text-right font-mono text-sm font-black text-emerald-600">{formatRupiah(row.DEBET)}</td>
                    <td className="px-8 py-4 text-right font-mono text-sm font-black text-rose-600">{formatRupiah(row.KREDIT)}</td>
                  </tr>
                );
              })}
            </tbody>
            {(previewData.length > 0 || existingData.length > 0) && (
              <tfoot className="bg-slate-50/80 font-black">
                <tr>
                  <td colSpan={2} className="px-8 py-4 text-slate-400 text-xs uppercase tracking-widest">Total Keseluruhan</td>
                  <td className="px-8 py-4 text-right font-mono text-lg text-emerald-700">
                    {formatRupiah((previewData.length > 0 ? previewData : existingData).reduce((a, b) => a + b.DEBET, 0))}
                  </td>
                  <td className="px-8 py-4 text-right font-mono text-lg text-rose-700">
                    {formatRupiah((previewData.length > 0 ? previewData : existingData).reduce((a, b) => a + b.KREDIT, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
         <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
            <Info className="w-5 h-5" />
         </div>
         <div className="space-y-1">
            <h4 className="font-black text-amber-900 text-sm">Petunjuk Penggunaan</h4>
            <p className="text-amber-700/80 text-xs font-medium leading-relaxed">
              Saldo awal biasanya dimasukkan sekali pada awal tahun buku. Pastikan total Debet dan Kredit Anda seimbang sebelum menyimpan. 
              Jika mengimpor dari Excel, pastikan kolom <span className="font-black">REKSUB</span> (kode akun) sesuai dengan yang ada di Master Rekening.
            </p>
         </div>
      </div>
    </div>
  );
}
