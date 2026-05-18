"use server";

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { SaldoAwal } from '../types/saldo-awal';

export async function getSaldoAwal(filterUnit?: string, filterBulan?: string, filterTahun?: string) {
  const supabase = await createClient();
  try {
    let query = supabase.from('saldo_awal').select('*');
    
    if (filterUnit) {
      query = query.eq('KOKE', filterUnit);
    }
    if (filterBulan) {
      query = query.eq('BULAN', filterBulan);
    }
    if (filterTahun) {
      query = query.eq('TAHUN', filterTahun);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data as SaldoAwal[];
  } catch (error) {
    console.error("Error fetching saldo awal:", error);
    return [];
  }
}

export async function addSaldoAwal(rows: SaldoAwal[]) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('saldo_awal')
      .insert(rows);
    
    if (error) throw error;
    
    revalidatePath('/input-saldo-awal');
    return true;
  } catch (error: any) {
    console.error("Error adding saldo awal:", error);
    throw new Error(error.message);
  }
}

export async function deleteSaldoAwal(id: string | number) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('saldo_awal')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    revalidatePath('/input-saldo-awal');
    return true;
  } catch (error: any) {
    console.error("Error deleting saldo awal:", error);
    throw new Error(error.message);
  }
}

export async function updateSaldoAwal(id: string | number, data: Partial<SaldoAwal>) {
  const supabase = await createClient();
  try {
    // Remove virtual properties or fields that shouldn't be updated
    const { NAMA_PERK, id: _id, created_at, ...updateData } = data as any;
    
    const { error } = await supabase
      .from('saldo_awal')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    revalidatePath('/input-saldo-awal');
    return true;
  } catch (error: any) {
    console.error("Error updating saldo awal:", error);
    throw new Error(error.message);
  }
}

export async function clearSaldoAwal(unit: string, bulan: string, tahun: string) {
    const supabase = await createClient();
    try {
      const { error } = await supabase
        .from('saldo_awal')
        .delete()
        .eq('KOKE', unit)
        .eq('BULAN', bulan)
        .eq('TAHUN', tahun);
      
      if (error) throw error;
      
      revalidatePath('/input-saldo-awal');
      return true;
    } catch (error: any) {
      console.error("Error clearing saldo awal:", error);
      throw new Error(error.message);
    }
}
