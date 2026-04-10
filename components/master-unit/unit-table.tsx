"use client";

import { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { MasterUnit } from '@/lib/types/master-unit';
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { deleteMasterUnit } from '@/lib/actions/master-unit';
import { DataTable } from "@/components/ui/data-table";
import UnitForm from './unit-form';

interface UnitTableProps {
  data: MasterUnit[];
}

export default function UnitTable({ data }: UnitTableProps) {
  const [tableData, setTableData] = useState(data);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<MasterUnit | undefined>();

  const handleDelete = async (koke: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus unit ini?')) {
      try {
        await deleteMasterUnit(koke);
        setTableData(tableData.filter(d => d.KOKE !== koke));
      } catch (error) {
        alert('Gagal menghapus data.');
        console.error(error);
      }
    }
  };

  const columns: ColumnDef<MasterUnit>[] = [
    {
      accessorKey: "KOKE",
      header: "Kode",
      cell: ({ row }) => <div className="font-bold text-slate-800">{row.getValue("KOKE")}</div>,
    },
    {
      accessorKey: "NAKE",
      header: "Nama Kebun/Unit",
      cell: ({ row }) => <div className="font-medium">{row.getValue("NAKE")}</div>,
    },
    {
      accessorKey: "PIMPINAN",
      header: "Pimpinan",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.getValue("PIMPINAN") || "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "NAMA_KTU",
      header: "KTU",
      cell: ({ row }) => <span className="text-slate-500">{row.getValue("NAMA_KTU") || "-"}</span>,
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
              onClick={() => handleDelete(item.KOKE)}
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
        searchPlaceholder="Cari berdasarkan nama kebun, kode, atau pimpinan..."
        filename="Master_Unit_Seumadam"
        toolbarChildren={
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 shadow-sm shadow-emerald-200 transition-all" 
            onClick={() => {
              setEditingData(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Unit
          </Button>
        }
      />

      {isFormOpen && (
        <UnitForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          initialData={editingData} 
          onSuccess={(newData: MasterUnit, isEdit: boolean) => {
            setIsFormOpen(false);
            if (isEdit) {
              setTableData(tableData.map(d => d.KOKE === newData.KOKE ? newData : d));
            } else {
              setTableData([newData, ...tableData]);
            }
          }}
        />
      )}
    </div>
  );
}
