"use server";

import { createClient } from '../supabase/server';
import { MasterRekening, MasterRekeningInput } from '../types/master-rekening';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

export async function getMasterRekening() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('master_rekening')
      .select('*')
      .order('REKSUB', { ascending: true });
    
    if (error) throw error;
    return data as MasterRekening[];
  } catch (error) {
    console.error("Error fetching master_rekening:", error);
    return [];
  }
}

export async function addMasterRekening(input: MasterRekeningInput) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('master_rekening')
      .insert([input])
      .select()
      .single();
    
    if (error) throw error;
    revalidatePath('/master-rekening');
    return data as MasterRekening;
  } catch (error: any) {
    console.error("Error adding master_rekening:", error);
    throw new Error(error.message);
  }
}

export async function updateMasterRekening(reksub: string, input: Partial<MasterRekeningInput>) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('master_rekening')
      .update(input)
      .eq('REKSUB', reksub)
      .select()
      .single();
    
    if (error) throw error;
    revalidatePath('/master-rekening');
    return data as MasterRekening;
  } catch (error: any) {
    console.error("Error updating master_rekening:", error);
    throw new Error(error.message);
  }
}

export async function deleteMasterRekening(reksub: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('master_rekening')
      .delete()
      .eq('REKSUB', reksub);
    
    if (error) throw error;
    revalidatePath('/master-rekening');
    return true;
  } catch (error: any) {
    console.error("Error deleting master_rekening:", error);
    throw new Error(error.message);
  }
}

export async function importMasterRekening(formData: FormData) {
  const supabase = await createClient();
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("File tidak ditemukan.");

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (!rawData || rawData.length === 0) {
      throw new Error("File Excel kosong atau tidak valid.");
    }

    const dataToInsert = rawData.map((row: any) => {
      const findKey = (candidates: string[]) => {
        const key = Object.keys(row).find(k => candidates.includes(k.toUpperCase()));
        return key ? String(row[key]).trim() : '';
      };

      return {
        REKSUB: findKey(['REKSUB', 'KODE', 'ACCOUNT_CODE']),
        REKIN: findKey(['REKIN', 'INDUK', 'PARENT_CODE']),
        NAMA_PERK: findKey(['NAMA_PERK', 'NAMA', 'ACCOUNT_NAME']),
      };
    }).filter(item => item.REKSUB && item.NAMA_PERK);

    if (dataToInsert.length === 0) {
      throw new Error("Format data Excel tidak sesuai. Pastikan memiliki kolom REKSUB dan NAMA_PERK.");
    }

    // Deduplicate data based on REKSUB to prevent "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    const uniqueData = Array.from(
      new Map(dataToInsert.map(item => [item.REKSUB, item])).values()
    );

    const { error } = await supabase
      .from('master_rekening')
      .upsert(uniqueData, { onConflict: 'REKSUB' });

    if (error) throw error;

    revalidatePath('/master-rekening');
    return { success: true, count: dataToInsert.length };
  } catch (error: any) {
    console.error("Error importing master_rekening:", error);
    throw new Error(error.message || "Gagal mengimpor data.");
  }
}
