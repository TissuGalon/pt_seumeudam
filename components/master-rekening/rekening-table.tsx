"use client";

import { useState, useRef, useEffect } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { MasterRekening } from '@/lib/types/master-rekening';
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileUp, Loader2 } from 'lucide-react';
import { deleteMasterRekening, importMasterRekening, getMasterRekening } from '@/lib/actions/master-rekening';
import { DataTable } from "@/components/ui/data-table";
import RekeningForm from './rekening-form';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface RekeningTableProps {
  data: MasterRekening[];
}

export default function RekeningTable({ data }: RekeningTableProps) {
  const [tableData, setTableData] = useState(data);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<MasterRekening | undefined>();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await importMasterRekening(formData);
      if (result.success) {
        alert(`Berhasil mengimpor ${result.count} data rekening.`);
        router.refresh();
        // Fallback: manually fetch and update if refresh is slow
        const newData = await getMasterRekening();
        setTableData(newData);
      }
    } catch (error: any) {
      alert(error.message || 'Gagal mengimpor data.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (reksub: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rekening ini?')) {
      try {
        await deleteMasterRekening(reksub);
        setTableData(tableData.filter(d => d.REKSUB !== reksub));
      } catch (error) {
        alert('Gagal menghapus data.');
        console.error(error);
      }
    }
  };

  const columns: ColumnDef<MasterRekening>[] = [
    {
      accessorKey: "REKSUB",
      header: "Sandi Akun",
      cell: ({ row }) => <div className="font-mono font-bold text-emerald-700">{row.getValue("REKSUB")}</div>,
    },
    {
      accessorKey: "NAMA_PERK",
      header: "Nama Perkiraan",
      cell: ({ row }) => <div className="font-medium">{row.getValue("NAMA_PERK")}</div>,
    },
    {
      accessorKey: "REKIN",
      header: "Akun Induk",
      cell: ({ row }) => <span className="text-slate-500 font-mono text-xs">{row.getValue("REKIN") || "-"}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => {
        const val = row.getValue("created_at");
        if (!val) return <span className="text-slate-400">-</span>;
        try {
          return (
            <div className="text-xs text-slate-500 whitespace-nowrap">
              {format(new Date(val as string), 'dd MMM yyyy', { locale: id })}
            </div>
          );
        } catch (e) {
          return <span className="text-xs text-slate-400">{String(val)}</span>;
        }
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 rounded-lg border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all"
              onClick={() => {
                setEditingData(item);
                setIsFormOpen(true);
              }}
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 rounded-lg border-slate-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-all"
              onClick={() => handleDelete(item.REKSUB)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={tableData} 
        searchPlaceholder="Cari berdasarkan nama atau kode rekening..."
        filename="Master_Rekening_Seumadam"
        toolbarChildren={
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx,.xls" 
              onChange={handleImport}
            />
            <Button 
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-10 px-4 transition-all"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileUp className="w-4 h-4 mr-2" />
              )}
              Import Excel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 shadow-sm shadow-emerald-200 transition-all" 
              onClick={() => {
                setEditingData(undefined);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Rekening
            </Button>
          </div>
        }
      />

      {isFormOpen && (
        <RekeningForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          initialData={editingData} 
          onSuccess={(newData: MasterRekening, isEdit: boolean) => {
            setIsFormOpen(false);
            if (isEdit) {
              setTableData(tableData.map(d => d.REKSUB === newData.REKSUB ? newData : d));
            } else {
              setTableData([newData, ...tableData]);
            }
          }}
        />
      )}
    </div>
  );
}
