"use client";

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { MasterRekening } from '@/lib/types/master-rekening';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { deleteMasterRekening } from '@/lib/actions/master-rekening';
import RekeningForm from './rekening-form';

interface RekeningTableProps {
  data: MasterRekening[];
}

export default function RekeningTable({ data }: RekeningTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [tableData, setTableData] = useState(data);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<MasterRekening | undefined>();

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
      header: "Sandi Akun (Sub)",
      cell: ({ row }) => <div className="font-semibold text-slate-700">{row.getValue("REKSUB")}</div>,
    },
    {
      accessorKey: "REKIN",
      header: "Akun Induk",
    },
    {
      accessorKey: "NAMA_PERK",
      header: "Nama Perkiraan",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditingData(item);
                setIsFormOpen(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-1 text-sky-600" /> Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(item.REKSUB)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari rekening..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button 
          className="bg-sky-600 hover:bg-sky-700 text-white" 
          onClick={() => {
            setEditingData(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Rekening
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} className="px-6 py-3 font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-slate-50/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-slate-500">
                    Tidak ada data rekening ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>

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
              setTableData([...tableData, newData]);
            }
          }}
        />
      )}
    </div>
  );
}
