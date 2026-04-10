'use client';

import { useState, useEffect } from 'react';
import { 
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
import { getJurnal, deleteJurnal } from '@/lib/actions/jurnal';
import * as XLSX from 'xlsx';
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

// Simulated database data
const DUMMY_UNITS = [
  { koke: '00', nake: 'Kantor Pusat PT Seumadam' },
  { koke: '01', nake: 'Kebun Plasma Seumadam' },
];

const BULAN_OPTIONS = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
  { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

// Initial mock data simulating double entries
const MOCK_DATA = [
  { id: '1', KOBU: '01', NO_BUKJUR: 'JR/01/26001', TANGGAL: '2026-01-10', REK: '210.00', REKLA: '154.00', URAIAN1: 'Gaji Pusat Jan 2026', DEBET: 50000000, KREDIT: 0 },
  { id: '2', KOBU: '01', NO_BUKJUR: 'JR/01/26001', TANGGAL: '2026-01-10', REK: '154.00', REKLA: '210.00', URAIAN1: 'Gaji Pusat Jan 2026', DEBET: 0, KREDIT: 50000000 },
  { id: '3', KOBU: '01', NO_BUKJUR: 'JR/01/26002', TANGGAL: '2026-01-15', REK: '511.00', REKLA: '154.00', URAIAN1: 'Listrik Kantor', DEBET: 2500000, KREDIT: 0 },
  { id: '4', KOBU: '01', NO_BUKJUR: 'JR/01/26002', TANGGAL: '2026-01-15', REK: '154.00', REKLA: '511.00', URAIAN1: 'Listrik Kantor', DEBET: 0, KREDIT: 2500000 },
];

export default function LaporanJurnalPage() {
  const [data, setData] = useState<any[]>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const [filterUnit, setFilterUnit] = useState('00');
  const [filterBulan, setFilterBulan] = useState('01');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getJurnal(filterUnit, filterBulan);
        
      if (result && result.length > 0) {
        setData(result);
      } else if (filterUnit === '00' && filterBulan === '01') {
        setData(MOCK_DATA);
      } else {
        setData([]);
      }
    } catch (e) {
      if (filterUnit === '00' && filterBulan === '01') {
        setData(MOCK_DATA);
      } else {
        setData([]);
      }
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay for UX
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
    
    const exportData = data.map(row => ({
      'Bulan': row.KOBU,
      'Tanggal': row.TANGGAL,
      'No Bukti': row.NO_BUKJUR,
      'Rekening': row.REK,
      'Rekening Lawan': row.REKLA,
      'Uraian': row.URAIAN1,
      'Debet': row.DEBET,
      'Kredit': row.KREDIT
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal_Transaksi");
    
    XLSX.writeFile(wb, `Jurnal_Unit_${filterUnit}_Bulan_${filterBulan}.xlsx`);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka || 0);
  };

  const totalDebet = data.reduce((acc, curr) => acc + Number(curr.DEBET || 0), 0);
  const totalKredit = data.reduce((acc, curr) => acc + Number(curr.KREDIT || 0), 0);
  const isBalanced = Math.abs(totalDebet - totalKredit) < 0.01;

  const columns = [
    {
      header: 'Tanggal',
      accessorKey: 'TANGGAL',
      cell: (info: any) => <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{info.getValue()}</span>
    },
    {
      header: 'No Bukti',
      accessorKey: 'NO_BUKJUR',
      cell: (info: any) => <span className="font-bold text-xs text-slate-800 whitespace-nowrap tracking-tight">{info.getValue()}</span>
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
            onClick={() => setEditingId(info.row.original.id)}
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
              {DUMMY_UNITS.map(u => <option key={u.koke} value={u.koke}>{u.nake}</option>)}
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
    </div>
  );
}
