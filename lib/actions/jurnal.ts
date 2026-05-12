"use server";

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function getJurnal(filterUnit?: string, filterBulan?: string) {
  const supabase = await createClient();
  try {
    let query = supabase.from('jurnal_transaksi').select('*');
    
    if (filterUnit) {
      query = query.eq('KOKE', filterUnit);
    }
    if (filterBulan) {
      query = query.eq('KOBU', filterBulan);
    }
    
    const { data, error } = await query
      .order('TANGGAL', { ascending: true })
      .order('NO_BUKJUR', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching jurnal:", error);
    return [];
  }
}

export async function deleteJurnal(id: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('jurnal_transaksi')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    revalidatePath('/laporan-jurnal');
    return true;
  } catch (error: any) {
    console.error("Error deleting jurnal:", error);
    throw new Error(error.message);
  }
}

export async function addJurnalTransaksi(rows: any[]) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('jurnal_transaksi')
      .insert(rows);
    
    if (error) throw error;
    
    revalidatePath('/laporan-jurnal');
    revalidatePath('/input-jurnal');
    return true;
  } catch (error: any) {
    console.error("Error adding jurnal:", error);
    throw new Error(error.message);
  }
}

export async function updateJurnal(id: string | number, input: any) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('jurnal_transaksi')
      .update(input)
      .eq('id', id);
    
    if (error) throw error;
    revalidatePath('/laporan-jurnal');
    return true;
  } catch (error: any) {
    console.error("Error updating jurnal:", error);
    throw new Error(error.message);
  }
}

export async function getNextNoBukti(unit: string, tahun: string, bulan: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('jurnal_transaksi')
      .select('NO_BUKJUR')
      .eq('KOKE', unit)
      .like('NO_BUKJUR', `M.${unit}.%.%.${tahun}`)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    let maxSeq = 0;
    data?.forEach((row: any) => {
      const parts = row.NO_BUKJUR.split('.');
      if (parts.length >= 4) {
        const seqStr = parts[3];
        const seq = parseInt(seqStr);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    const paddedSeq = nextSeq.toString().padStart(4, '0');
    return `M.${unit}.${bulan}.${paddedSeq}.${tahun}`;
  } catch (error) {
    console.error("Error calculating next No Bukti:", error);
    return `M.${unit}.${bulan}.0001.${tahun}`;
  }
}
