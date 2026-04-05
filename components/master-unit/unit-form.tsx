"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MasterUnit } from "@/lib/types/master-unit";
import { addMasterUnit, updateMasterUnit } from "@/lib/actions/master-unit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  KOKE: z.string().min(1, "Kode Kebun diperlukan").max(10),
  NAKE: z.string().min(1, "Nama Kebun diperlukan").max(255),
  PIMPINAN: z.string().max(255).optional().nullable(),
  NAMA_KTU: z.string().max(255).optional().nullable(),
  NAMA_ASST: z.string().max(255).optional().nullable(),
  JAB_PIM: z.string().max(255).optional().nullable(),
  JAB_KTU: z.string().max(255).optional().nullable(),
  JAB_ASST: z.string().max(255).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface UnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterUnit;
  onSuccess: (data: MasterUnit, isEdit: boolean) => void;
}

export default function UnitForm({ isOpen, onClose, initialData, onSuccess }: UnitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      KOKE: initialData?.KOKE || "",
      NAKE: initialData?.NAKE || "",
      PIMPINAN: initialData?.PIMPINAN || "",
      NAMA_KTU: initialData?.NAMA_KTU || "",
      NAMA_ASST: initialData?.NAMA_ASST || "",
      JAB_PIM: initialData?.JAB_PIM || "",
      JAB_KTU: initialData?.JAB_KTU || "",
      JAB_ASST: initialData?.JAB_ASST || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      let result;
      // Convert empty strings to null for optional fields
      const processedValues = {
        KOKE: values.KOKE,
        NAKE: values.NAKE,
        PIMPINAN: values.PIMPINAN || null,
        NAMA_KTU: values.NAMA_KTU || null,
        NAMA_ASST: values.NAMA_ASST || null,
        JAB_PIM: values.JAB_PIM || null,
        JAB_KTU: values.JAB_KTU || null,
        JAB_ASST: values.JAB_ASST || null,
      };

      if (isEdit && initialData) {
        result = await updateMasterUnit(initialData.KOKE, processedValues);
      } else {
        result = await addMasterUnit(processedValues);
      }
      onSuccess(result, isEdit);
    } catch (error: any) {
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit/Kebun" : "Tambah Unit/Kebun Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Ubah detail unit/kebun di bawah ini. Pastikan kode kebun benar." 
              : "Masukkan detail unit/kebun baru. Kode kebun harus unik."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="KOKE">Kode Kebun *</Label>
              <Input 
                id="KOKE" 
                placeholder="Contoh: 00" 
                disabled={isEdit} 
                {...register("KOKE")} 
              />
              {errors.KOKE && <p className="text-sm text-red-500 font-medium">{errors.KOKE.message}</p>}
            </div>
            
            <div className="space-y-2">
               <Label htmlFor="NAKE">Nama Kebun *</Label>
               <Input 
                id="NAKE" 
                placeholder="Contoh: Kantor Pusat" 
                {...register("NAKE")} 
               />
               {errors.NAKE && <p className="text-sm text-red-500 font-medium">{errors.NAKE.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="PIMPINAN">Nama Pimpinan</Label>
              <Input 
                id="PIMPINAN" 
                placeholder="Nama Pimpinan" 
                {...register("PIMPINAN")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="JAB_PIM">Jabatan Pimpinan</Label>
              <Input 
                id="JAB_PIM" 
                placeholder="Jabatan Pimpinan" 
                {...register("JAB_PIM")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="NAMA_KTU">Nama KTU</Label>
              <Input 
                id="NAMA_KTU" 
                placeholder="Nama KTU" 
                {...register("NAMA_KTU")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="JAB_KTU">Jabatan KTU</Label>
              <Input 
                id="JAB_KTU" 
                placeholder="Jabatan KTU" 
                {...register("JAB_KTU")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="NAMA_ASST">Nama Asisten</Label>
              <Input 
                id="NAMA_ASST" 
                placeholder="Nama Asisten" 
                {...register("NAMA_ASST")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="JAB_ASST">Jabatan Asisten</Label>
              <Input 
                id="JAB_ASST" 
                placeholder="Jabatan Asisten" 
                {...register("JAB_ASST")} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 min-w-[120px]" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
