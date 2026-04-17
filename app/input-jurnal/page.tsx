'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Plus, 
  Save, 
  Clock, 
  HelpCircle, 
  Check, 
  X,
  Building2,
  Calendar,
  AlertCircle,
  Hash,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { addJurnalTransaksi, getNextNoBukti } from '@/lib/actions/jurnal';
import { getMasterUnit } from '@/lib/actions/master-unit';
import { getMasterRekening } from '@/lib/actions/master-rekening';
import { MasterUnit } from '@/lib/types/master-unit';
import { MasterRekening } from '@/lib/types/master-rekening';
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

function CustomCombobox({ 
  items, 
  value, 
  onChange, 
  placeholder,
  valueKey,
  labelKey
}: { 
  items: any[]; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
  valueKey: string;
  labelKey: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = items.filter(i => 
    i[valueKey].toLowerCase().includes(search.toLowerCase()) || 
    i[labelKey].toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = items.find(i => i[valueKey] === value);

  return (
    <div ref={wrapperRef} className="relative">
      <div 
        className={cn(
          "flex items-center justify-between border rounded-xl px-3 py-2 bg-white cursor-pointer transition-all duration-200",
          open ? "border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm" : "border-slate-200 hover:border-slate-300"
        )}
        onClick={() => setOpen(!open)}
      >
        <span className={selectedItem ? "text-slate-900 text-sm font-medium" : "text-slate-400 text-sm"}>
          {selectedItem ? `${selectedItem[valueKey]} - ${selectedItem[labelKey]}` : placeholder}
        </span>
        <Search className="w-4 h-4 text-slate-400" />
      </div>

      {open && (
        <div className="absolute z-[60] top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-slate-50 bg-slate-50/50">
            <input 
              autoFocus
              type="text"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 transition-colors shadow-sm font-medium text-slate-700"
              placeholder="Cari kode atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-slate-400 text-center italic">Tidak ditemukan...</div>
            ) : (
              filtered.map((item) => (
                <div 
                  key={item[valueKey]}
                  className={cn(
                    "px-3 py-2.5 text-sm cursor-pointer rounded-lg flex items-center justify-between transition-colors",
                    value === item[valueKey] 
                      ? 'bg-emerald-50 text-emerald-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  onClick={() => {
                    onChange(item[valueKey]);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <span className="truncate">{item[valueKey]} - {item[labelKey]}</span>
                  {value === item[valueKey] && <Check className="w-4 h-4 shrink-0 shadow-sm" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InputJurnalPage() {
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [rekening, setRekening] = useState<MasterRekening[]>([]);
  const [cutoff, setCutoff] = useState<{ unit: string; bulan: string; tahun: string } | null>(null);
  const [tempUnit, setTempUnit] = useState('');
  const [tempBulan, setTempBulan] = useState('');
  const [tempTahun, setTempTahun] = useState(new Date().getFullYear().toString());

  // Form State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    noBukti: '',
    rekDebit: '',
    rekKredit: '',
    uraian: '',
    nilai: ''
  });

  const refreshNoBukti = async () => {
    if (!cutoff) return;
    try {
      const nextNo = await getNextNoBukti(cutoff.unit, cutoff.tahun, cutoff.bulan);
      setFormData(prev => ({ ...prev, noBukti: nextNo }));
    } catch (err) {
      console.error("Failed to fetch next no bukti:", err);
    }
  };

  useEffect(() => {
    if (cutoff) {
      refreshNoBukti();
    }
  }, [cutoff]);

  useEffect(() => {
    const initData = async () => {
      const [u, r] = await Promise.all([
        getMasterUnit(),
        getMasterRekening()
      ]);
      setUnits(u);
      setRekening(r);
    };
    initData();
  }, []);

  const handleCutoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUnit && tempBulan && tempTahun) {
      setCutoff({ unit: tempUnit, bulan: tempBulan, tahun: tempTahun });
    }
  };

  const handleSaveJurnal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const nilaiNum = parseFloat(formData.nilai);
    if (!formData.rekDebit || !formData.rekKredit || !formData.noBukti || isNaN(nilaiNum) || nilaiNum <= 0) {
      setMessage({ type: 'error', text: 'Pastikan Rekening Debit, Kredit, No Bukti, dan Nilai terisi benar.' });
      setLoading(false);
      return;
    }

    try {
      const debetAccount = rekening.find(r => r.REKSUB === formData.rekDebit);
      const kreditAccount = rekening.find(r => r.REKSUB === formData.rekKredit);

      const debitRow = {
        KOKE: cutoff!.unit,
        KOBU: cutoff!.bulan,
        NO_BUKJUR: formData.noBukti,
        TANGGAL: formData.tanggal,
        REK: formData.rekDebit,
        REKLA: formData.rekKredit,
        NAREK: debetAccount?.NAMA_PERK || '',
        URAIAN1: formData.uraian,
        DEBET: nilaiNum,
        KREDIT: 0
      };

      const creditRow = {
        KOKE: cutoff!.unit,
        KOBU: cutoff!.bulan,
        NO_BUKJUR: formData.noBukti,
        TANGGAL: formData.tanggal,
        REK: formData.rekKredit,
        REKLA: formData.rekDebit,
        NAREK: kreditAccount?.NAMA_PERK || '',
        URAIAN1: formData.uraian,
        DEBET: 0,
        KREDIT: nilaiNum
      };

      await addJurnalTransaksi([debitRow, creditRow]);

      setMessage({ type: 'success', text: 'Transaksi Double-Entry berhasil disimpan.' });
      setFormData(prev => ({
        ...prev,
        rekDebit: '',
        rekKredit: '',
        uraian: '',
        nilai: ''
      }));
      
      // Update No Bukti for next transaction
      refreshNoBukti();

    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal menyimpan transaksi: ' + (err.message || 'Unknown error') });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  if (!cutoff) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/20 h-full overflow-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all hover:translate-y-[-4px]">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-inner">
              <FileCheck className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Buka Bulan Buku</h2>
            <p className="text-emerald-100 text-sm font-medium leading-relaxed opacity-90 px-4">Pilih Unit Kebun dan periode bulan/tahun sebelum memulai input jurnal.</p>
          </div>
          
          <form onSubmit={handleCutoffSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Unit Kebun / Rekening
              </label>
              <select 
                required
                className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-0 focus:border-emerald-500 bg-white outline-none transition-all shadow-sm"
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
              >
                <option value="">-- Pilih Unit --</option>
                {units.map(u => (
                  <option key={u.KOKE} value={u.KOKE}>{u.KOKE} - {u.NAKE}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Bulan
                </label>
                <select 
                  required
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-0 focus:border-emerald-500 bg-white outline-none transition-all shadow-sm"
                  value={tempBulan}
                  onChange={(e) => setTempBulan(e.target.value)}
                >
                  <option value="">-- Bulan --</option>
                  {BULAN_OPTIONS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Tahun
                </label>
                <input 
                  type="number" 
                  required
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-0 focus:border-emerald-500 bg-white outline-none transition-all shadow-sm"
                  value={tempTahun}
                  onChange={(e) => setTempTahun(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-emerald-200 mt-2 active:scale-95"
            >
              <Check className="w-6 h-6 mr-2 stroke-[3px]" /> Buka Sesi Input
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-10 scroll-smooth">
      {/* Header Info */}
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-inner">
                <FileCheck className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Form Input Jurnal</h1>
                <p className="text-slate-400 mt-2 font-medium">Mode Entry Data Padat (Dense) dengan <span className="text-emerald-600 font-bold underline decoration-emerald-200 underline-offset-4 tracking-tight">Otomasi Double-Entry</span>.</p>
             </div>
          </div>
        </div>

        {/* Active Session Card */}
        <div className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-5 rounded-3xl group-hover:opacity-10 transition-opacity"></div>
            <div className="relative bg-white/50 backdrop-blur-md border border-emerald-100 shadow-xl shadow-emerald-50 rounded-3xl px-6 py-4 flex flex-row items-center gap-6 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Clock className="w-6 h-6 stroke-[2.5px]" />
              </div>
              <div className="min-w-0 pr-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5 opacity-70">Sesi Aktif</div>
                <div className="font-black text-slate-900 leading-tight">
                  Unit {cutoff.unit} <span className="text-emerald-500 mx-1.5">•</span> {BULAN_OPTIONS.find(b=>b.value===cutoff.bulan)?.label} {cutoff.tahun}
                </div>
              </div>
              <div className="w-px h-10 bg-emerald-100/50"></div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCutoff(null)} 
                className="h-10 w-10 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Tutup Bulan / Ganti Sesi"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </Button>
            </div>
        </div>
      </div>

      {/* Main Working Area: Dense Form */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500 h-2 w-6 rounded-full"></div>
             <h2 className="font-black text-xl text-slate-800 tracking-tight">
               Entri Transaksi Baru
             </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-[10px] font-black text-slate-400 tracking-wider">
            <HelpCircle className="w-3 w-3 text-emerald-500" /> SHORTCUT: TAB UNTUK PINDAH KOLOM
          </div>
        </div>
        
        <form onSubmit={handleSaveJurnal} className="p-8 lg:p-10">
          {message && (
             <div className={cn(
                 "mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-4 duration-300",
                 message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
             )}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
             </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-10">
            {/* Row 1 */}
            <div className="col-span-1 md:col-span-6 grid grid-cols-1 md:grid-cols-6 gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 shadow-inner">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Calendar className="w-3 h-3 text-emerald-500" /> Tanggal Bukti
                </label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                  value={formData.tanggal}
                  onChange={e => setFormData({...formData, tanggal: e.target.value})}
                />
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-emerald-500" /> Nomor Bukti Transaksi
                   </div>
                   <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-slate-400 hover:text-emerald-500"
                    onClick={refreshNoBukti}
                    title="Generate Ulang Nomor"
                   >
                     <RefreshCcw className="w-3 h-3" />
                   </Button>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: JR/01/26001"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm tracking-tight"
                  value={formData.noBukti}
                  onChange={e => setFormData({...formData, noBukti: e.target.value})}
                />
              </div>
            </div>

            {/* Row 2: Rekening */}
            <div className="md:col-span-3 space-y-3">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center justify-between pl-1">
                Rekening Debit
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black">MASUK (+)</span>
              </label>
              <CustomCombobox 
                items={rekening} 
                value={formData.rekDebit} 
                onChange={(v) => setFormData({...formData, rekDebit: v})} 
                placeholder="Pilih rekening debet..."
                valueKey="REKSUB"
                labelKey="NAMA_PERK"
              />
            </div>

            <div className="md:col-span-3 space-y-3">
              <label className="text-[10px] font-black text-rose-700 uppercase tracking-widest flex items-center justify-between pl-1">
                Rekening Kredit (Lawan)
                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[9px] font-black">KELUAR (-)</span>
              </label>
              <CustomCombobox 
                items={rekening} 
                value={formData.rekKredit} 
                onChange={(v) => setFormData({...formData, rekKredit: v})} 
                placeholder="Pilih rekening kredit..."
                valueKey="REKSUB"
                labelKey="NAMA_PERK"
              />
            </div>

            {/* Row 3: Detail */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Uraian Transaksi / Deskripsi</label>
              <input 
                type="text" 
                maxLength={255}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                placeholder="Tuliskan deskripsi lengkap transaksi..."
                value={formData.uraian}
                onChange={e => setFormData({...formData, uraian: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nilai Nominal Jurnal</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-black group-focus-within:text-emerald-500 transition-colors">Rp</span>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-lg font-black text-emerald-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm font-mono tracking-tighter"
                  placeholder="0.00"
                  value={formData.nilai}
                  onChange={e => setFormData({...formData, nilai: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-slate-50 flex flex-col sm:flex-row items-center justify-end gap-4 lg:gap-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData({
                  tanggal: new Date().toISOString().split('T')[0],
                  noBukti: '',
                  rekDebit: '',
                  rekKredit: '',
                  uraian: '',
                  nilai: ''
                });
                setMessage(null);
              }}
              className="w-full sm:w-auto px-8 h-12 bg-white border-2 border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-2xl font-black text-sm transition-all"
            >
              Reset Form
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-10 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              <Save className="w-5 h-5 stroke-[2.5px]" />
              {loading ? 'Menyimpan...' : 'Simpan Transaksi (Double Entry)'}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
