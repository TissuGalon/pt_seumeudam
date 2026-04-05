"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MasterRekening } from "@/lib/types/master-rekening";
import { addMasterRekening, updateMasterRekening } from "@/lib/actions/master-rekening";
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
  REKSUB: z.string().min(1, "Sandi Akun (Sub) diperlukan").max(50),
  REKIN: z.string().min(1, "Akun Induk diperlukan").max(50),
  NAMA_PERK: z.string().min(1, "Nama Perkiraan diperlukan").max(255),
});

type FormValues = z.infer<typeof formSchema>;

interface RekeningFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterRekening;
  onSuccess: (data: MasterRekening, isEdit: boolean) => void;
}

export default function RekeningForm({ isOpen, onClose, initialData, onSuccess }: RekeningFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      REKSUB: initialData?.REKSUB || "",
      REKIN: initialData?.REKIN || "",
      NAMA_PERK: initialData?.NAMA_PERK || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      let result;
      if (isEdit) {
        result = await updateMasterRekening(initialData.REKSUB, values);
      } else {
        result = await addMasterRekening(values);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Rekening" : "Tambah Rekening Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Ubah detail rekening di bawah ini. Pastikan sandi rekening benar." 
              : "Masukkan detail rekening baru. Sandi akun harus unik."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="REKSUB">Sandi Akun (Sub) *</Label>
            <Input 
              id="REKSUB" 
              placeholder="Contoh: 154.00" 
              disabled={isEdit} 
              {...register("REKSUB")} 
            />
            {errors.REKSUB && <p className="text-sm text-red-500 font-medium">{errors.REKSUB.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="REKIN">Akun Induk *</Label>
            <Input 
              id="REKIN" 
              placeholder="Contoh: 154" 
              {...register("REKIN")} 
            />
            {errors.REKIN && <p className="text-sm text-red-500 font-medium">{errors.REKIN.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="NAMA_PERK">Nama Perkiraan *</Label>
            <Input 
              id="NAMA_PERK" 
              placeholder="Contoh: Kas Lintas Unit" 
              {...register("NAMA_PERK")} 
            />
            {errors.NAMA_PERK && <p className="text-sm text-red-500 font-medium">{errors.NAMA_PERK.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
