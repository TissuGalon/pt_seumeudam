'use client';

import { useState, useEffect } from 'react';
import { getJurnal, deleteJurnal, updateJurnal } from '@/lib/actions/jurnal';
import { getMasterUnit } from '@/lib/actions/master-unit';
import { getMasterRekening } from '@/lib/actions/master-rekening';
import { MasterUnit } from '@/lib/types/master-unit';
import { MasterRekening } from '@/lib/types/master-rekening';
import * as XLSX from 'xlsx';
import { 
  Search,
  Check,
  X,
  Save,
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Edit, 
  Filter, 
  RefreshCcw,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
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


import { useRef } from 'react';

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
    i[valueKey]?.toLowerCase().includes(search.toLowerCase()) || 
    i[labelKey]?.toLowerCase().includes(search.toLowerCase())
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
        <div className="absolute z-[60] top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
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
          <div className="max-h-60 overflow-y-auto p-1">
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

export default function LaporanJurnalPage() {
  const [data, setData] = useState<any[]>([]);
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [rekening, setRekening] = useState<MasterRekening[]>([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const [filterUnit, setFilterUnit] = useState('00');
  const [filterBulan, setFilterBulan] = useState('01');
  
  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    id: 0,
    TANGGAL: '',
    NO_BUKJUR: '',
    REK: '',
    REKLA: '',
    URAIAN1: '',
    DEBET: 0,
    KREDIT: 0
  });

  useEffect(() => {
    const initPage = async () => {
      const [u, r] = await Promise.all([
        getMasterUnit(),
        getMasterRekening()
      ]);
      setUnits(u);
      setRekening(r);
      if (u.length > 0 && !filterUnit) {
        setFilterUnit(u[0].KOKE);
      }
    };
    initPage();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getJurnal(filterUnit, filterBulan);
      
      // Calculate Record sequence (1, 2, ...) for rows with same NO_BUKJUR
      let currentNoBukti = '';
      let recordCounter = 0;
      const dataWithRecords = (result || []).map((row: any) => {
        if (row.NO_BUKJUR !== currentNoBukti) {
          currentNoBukti = row.NO_BUKJUR;
          recordCounter = 1;
        } else {
          recordCounter++;
        }
        return { ...row, record_seq: recordCounter };
      });

      setData(dataWithRecords);
    } catch (e) {
      console.error("Error fetching data:", e);
      setData([]);
    } finally {
      setTimeout(() => setLoading(false), 500); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterUnit, filterBulan]);

  const handleDelete = async (id: string) => {
    if(!confirm("Yakin ingin menghapus record ini?")) return;
    try {
      await deleteJurnal(id);
      setData(data.filter(d => d.id !== id));
    } catch(e) {
      setData(data.filter(d => d.id !== id));
    }
  };

  const handleExport = () => {
    if(data.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }
    
    const exportData = data.map(row => {
      let tanggalStr = '';
      try {
        const d = new Date(row.TANGGAL);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        tanggalStr = `${day}/${month}/${year}`;
      } catch (e) {
        tanggalStr = String(row.TANGGAL);
      }

      return {
        'Bulan': row.KOBU,
        'Tanggal': tanggalStr,
        'No Bukti': row.NO_BUKJUR,
        'Record': row.record_seq,
        'Rekening': row.REK,
        'Rekening Lawan': row.REKLA,
        'Uraian': row.URAIAN1,
        'Debet': Number(row.DEBET || 0),
        'Kredit': Number(row.KREDIT || 0)
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal_Transaksi");
    
    XLSX.writeFile(wb, `Jurnal_Unit_${filterUnit}_Bulan_${filterBulan}.xlsx`);
  };

  const formatRupiah = (angka: any) => {
    const num = typeof angka === 'number' ? angka : parseFloat(angka || 0);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalDebet = data.reduce((acc, curr) => acc + Number(curr.DEBET || 0), 0);
  const totalKredit = data.reduce((acc, curr) => acc + Number(curr.KREDIT || 0), 0);
  const isBalanced = Math.abs(totalDebet - totalKredit) < 0.01;

  const handleOpenEdit = (row: any) => {
    setEditingRow(row);
    setEditFormData({
      id: row.id,
      TANGGAL: row.TANGGAL instanceof Date ? row.TANGGAL.toISOString().split('T')[0] : String(row.TANGGAL).split('T')[0],
      NO_BUKJUR: row.NO_BUKJUR,
      REK: row.REK,
      REKLA: row.REKLA,
      URAIAN1: row.URAIAN1,
      DEBET: parseFloat(row.DEBET || 0),
      KREDIT: parseFloat(row.KREDIT || 0)
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { id, ...input } = editFormData;
      
      // Update NAREK if needed (optional but good for consistency)
      const debetAccount = rekening.find(r => r.REKSUB === input.REK);
      const updatedInput = {
        ...input,
        NAREK: debetAccount?.NAMA_PERK || editingRow.NAREK
      };

      await updateJurnal(id, updatedInput);
      setIsEditOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal mengupdate jurnal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Tanggal',
      accessorKey: 'TANGGAL',
      cell: (info: any) => {
        const val = info.getValue();
        const dateStr = val instanceof Date ? val.toISOString().split('T')[0] : String(val || '');
        return <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{dateStr}</span>
      }
    },
    {
      header: 'No Bukti',
      accessorKey: 'NO_BUKJUR',
      cell: (info: any) => <span className="font-bold text-xs text-slate-800 whitespace-nowrap tracking-tight">{info.getValue()}</span>
    },
    {
      header: 'Rec',
      accessorKey: 'record_seq',
      cell: (info: any) => <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md">{info.getValue()}</span>
    },
    {
      header: 'Rek',
      accessorKey: 'REK',
      cell: (info: any) => <span className="text-emerald-700 font-mono text-xs font-bold">{info.getValue()}</span>
    },
    {
      header: 'Rek Lawan',
      accessorKey: 'REKLA',
      cell: (info: any) => <span className="text-rose-700 font-mono text-xs font-bold">{info.getValue()}</span>
    },
    {
      header: 'Uraian',
      accessorKey: 'URAIAN1',
      cell: (info: any) => <span className="text-[11px] leading-relaxed line-clamp-2 max-w-[250px] text-slate-600" title={info.getValue()}>{info.getValue()}</span>
    },
    {
      header: 'Debet',
      accessorKey: 'DEBET',
      cell: (info: any) => <span className="font-mono text-xs text-right font-bold text-slate-700">{formatRupiah(info.getValue())}</span>
    },
    {
      header: 'Kredit',
      accessorKey: 'KREDIT',
      cell: (info: any) => <span className="font-mono text-xs text-right font-bold text-slate-700">{formatRupiah(info.getValue())}</span>
    },
    {
      header: 'Aksi',
      id: 'actions',
      cell: (info: any) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
            onClick={() => handleOpenEdit(info.row.original)}
            title="Koreksi"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            onClick={() => handleDelete(info.row.original.id)}
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="flex-1 p-4 lg:p-8 flex flex-col h-full bg-slate-50/20 overflow-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
              <FileSpreadsheet className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tinjauan Data Jurnal
            </h1>
          </div>
          <p className="text-slate-500 text-sm lg:text-base max-w-2xl ml-1">
            Lihat, koreksi, dan ekspor data buku jurnal (cut-off). Pastikan total pada Debet dan Kredit seimbang.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto">
          <Button 
            onClick={fetchData}
            variant="outline"
            className="h-10 px-4 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            title="Refresh Data"
          >
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>

          <Button 
            onClick={handleExport}
            className="h-10 px-5 bg-[#1d6f42] hover:bg-[#155a34] text-white font-bold rounded-xl shadow-md shadow-emerald-100 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 pl-1 mr-4">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Data</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select 
              value={filterUnit} 
              onChange={e => setFilterUnit(e.target.value)}
              className="text-sm bg-transparent outline-none font-bold text-slate-700 py-1 cursor-pointer"
            >
              {units.map(u => <option key={u.KOKE} value={u.KOKE}>{u.NAKE}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select 
              value={filterBulan} 
              onChange={e => setFilterBulan(e.target.value)}
              className="text-sm bg-transparent outline-none font-bold text-slate-700 py-1 cursor-pointer"
            >
              {BULAN_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-200 z-10 backdrop-blur-md">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 text-sm font-medium animate-pulse">Menyiapkan data jurnal...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                        <FileSpreadsheet className="w-10 h-10 opacity-20" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">Data Tidak Ditemukan</h3>
                      <p className="text-sm max-w-xs mx-auto mt-2">Tidak ada transaksi yang tercatat untuk unit ini pada bulan {BULAN_OPTIONS.find(b => b.value === filterBulan)?.label}.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id} className={cn(
                    "group border-b border-slate-100 transition-colors",
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30',
                    "hover:bg-emerald-50/40"
                  )}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-3 px-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer balancing info & Pagination */}
        <div className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-200 p-6 shrink-0">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Total Transaksi</span>
                <span className="text-xl font-extrabold text-slate-900">{data.length} <small className="text-slate-400 font-medium text-xs">baris</small></span>
              </div>
              
              <div className="h-10 w-px bg-slate-200 hidden lg:block mx-2"></div>

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                {!isBalanced ? (
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                ) : (
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                )}
                
                <div className="flex gap-6 lg:gap-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Debet</span>
                    <span className="text-base font-mono font-black text-emerald-600 tracking-tighter">{formatRupiah(totalDebet)}</span>
                  </div>
                  <div className="flex flex-col pr-4 border-r border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Kredit</span>
                    <span className="text-base font-mono font-black text-rose-600 tracking-tighter">{formatRupiah(totalKredit)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  {isBalanced ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase mt-1">Balanced</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center animate-pulse">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <span className="text-[9px] font-black text-rose-500 uppercase mt-1">Not Balanced</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-slate-200 bg-white shadow-sm disabled:opacity-30"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm font-bold text-sm text-slate-700">
                {table.getState().pagination.pageIndex + 1} <span className="text-slate-300 mx-1 font-medium">/</span> {table.getPageCount()}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-slate-200 bg-white shadow-sm disabled:opacity-30"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Koreksi Transaksi</h3>
                  <p className="text-xs text-emerald-100 font-medium opacity-80">ID Jurnal: #{editFormData.id}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditOpen(false)}
                className="text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-emerald-500" /> Tanggal
                  </label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    value={editFormData.TANGGAL}
                    onChange={e => setEditFormData({...editFormData, TANGGAL: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-3 h-3 text-emerald-500" /> No Bukti
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-800 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    value={editFormData.NO_BUKJUR}
                    onChange={e => setEditFormData({...editFormData, NO_BUKJUR: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest pl-1">Rekening Utama</label>
                  <CustomCombobox 
                    items={rekening} 
                    value={editFormData.REK} 
                    onChange={(v) => setEditFormData({...editFormData, REK: v})} 
                    placeholder="Pilih rekening..."
                    valueKey="REKSUB"
                    labelKey="NAMA_PERK"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-700 uppercase tracking-widest pl-1">Rekening Lawan</label>
                  <CustomCombobox 
                    items={rekening} 
                    value={editFormData.REKLA} 
                    onChange={(v) => setEditFormData({...editFormData, REKLA: v})} 
                    placeholder="Pilih rekening lawan..."
                    valueKey="REKSUB"
                    labelKey="NAMA_PERK"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Uraian / Keterangan</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all shadow-sm"
                  value={editFormData.URAIAN1}
                  onChange={e => setEditFormData({...editFormData, URAIAN1: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Debet</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-emerald-700 focus:border-emerald-500 outline-none shadow-sm"
                    value={editFormData.DEBET}
                    onChange={e => setEditFormData({...editFormData, DEBET: parseFloat(e.target.value || '0')})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Kredit</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-rose-700 focus:border-emerald-500 outline-none shadow-sm"
                    value={editFormData.KREDIT}
                    onChange={e => setEditFormData({...editFormData, KREDIT: parseFloat(e.target.value || '0')})}
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="px-6 h-11 border-2 border-slate-100 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Added Hash icon for the modal label
const Hash = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
);
