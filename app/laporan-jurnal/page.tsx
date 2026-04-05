'use client';

import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Filter, 
  RefreshCcw 
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
      setLoading(false);
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
    
    // Prepare data for export
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

  const columns = [
    {
      header: 'Tanggal',
      accessorKey: 'TANGGAL',
      cell: (info: any) => <span className="text-xs">{info.getValue()}</span>
    },
    {
      header: 'No Bukti',
      accessorKey: 'NO_BUKJUR',
      cell: (info: any) => <span className="font-semibold text-xs">{info.getValue()}</span>
    },
    {
      header: 'Rek',
      accessorKey: 'REK',
      cell: (info: any) => <span className="text-emerald-700 font-mono text-xs">{info.getValue()}</span>
    },
    {
      header: 'Rek Lawan',
      accessorKey: 'REKLA',
      cell: (info: any) => <span className="text-rose-700 font-mono text-xs">{info.getValue()}</span>
    },
    {
      header: 'Uraian',
      accessorKey: 'URAIAN1',
      cell: (info: any) => <span className="text-xs truncate max-w-[200px] block" title={info.getValue()}>{info.getValue()}</span>
    },
    {
      header: 'Debet',
      accessorKey: 'DEBET',
      cell: (info: any) => <span className="font-mono text-xs text-right block">{formatRupiah(info.getValue())}</span>
    },
    {
      header: 'Kredit',
      accessorKey: 'KREDIT',
      cell: (info: any) => <span className="font-mono text-xs text-right block">{formatRupiah(info.getValue())}</span>
    },
    {
      header: 'Aksi',
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          <button 
            className="p-1 hover:bg-slate-200 text-slate-500 rounded"
            onClick={() => setEditingId(info.row.original.id)}
            title="Koreksi"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1 hover:bg-red-100 text-red-500 rounded"
            onClick={() => handleDelete(info.row.original.id)}
            title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
    <div className="flex-1 p-8 flex flex-col h-full bg-slate-50 overflow-hidden">
      
      {/* Header & Toolbars */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 inline-flex items-center gap-3">
            <FileSpreadsheet className="text-teal-600" /> Tinjauan Data Jurnal
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl text-sm">
            Lihat, koreksi, dan ekspor data buku jurnal (cut-off). Pastikan total pada Debet dan Kredit seimbang.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterUnit} 
              onChange={e => setFilterUnit(e.target.value)}
              className="text-sm bg-transparent outline-none font-medium py-1"
            >
              {DUMMY_UNITS.map(u => <option key={u.koke} value={u.koke}>Unit {u.koke}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
            <select 
              value={filterBulan} 
              onChange={e => setFilterBulan(e.target.value)}
              className="text-sm bg-transparent outline-none font-medium py-1"
            >
              {BULAN_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          
          <button 
            onClick={fetchData}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-[#1d6f42] hover:bg-[#155a34] text-white text-sm font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 z-10 backdrop-blur-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-500">Memuat data...</td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileSpreadsheet className="w-12 h-12 mb-3 opacity-20" />
                      <p>Data jurnal bulan {filterBulan} kosong.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id} className={`border-b border-slate-100 hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-2.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="text-sm">
              Total Baris: <span className="font-bold text-slate-800">{data.length}</span>
            </div>
            
            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold flex gap-4">
              <div className="text-slate-600">Total Debet: <span className="font-mono text-emerald-600 ml-1">{formatRupiah(totalDebet)}</span></div>
              <div className="text-slate-600 border-l border-slate-200 pl-4">Total Kredit: <span className="font-mono text-rose-600 ml-1">{formatRupiah(totalKredit)}</span></div>
            </div>
            
            {totalDebet !== totalKredit && (
              <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                TIDAK BALANCE
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 text-sm font-medium px-3"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 text-sm font-medium px-3"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
