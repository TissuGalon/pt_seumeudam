"use server";

import { createClient } from '@supabase/supabase-js';
import { MasterRekening, MasterRekeningInput } from '../types/master-rekening';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key');

export async function getMasterRekening() {
  const { data, error } = await supabase
    .from('master_rekening')
    .select('*')
    .order('REKSUB', { ascending: true });

  if (error) {
    console.error("Error fetching master_rekening:", error);
    return [];
  }

  return data as MasterRekening[];
}

export async function addMasterRekening(input: MasterRekeningInput) {
  const { data, error } = await supabase
    .from('master_rekening')
    .insert([input])
    .select();

  if (error) {
    console.error("Error adding master_rekening:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-rekening');
  return data?.[0] as MasterRekening;
}

export async function updateMasterRekening(reksub: string, input: Partial<MasterRekeningInput>) {
  const { data, error } = await supabase
    .from('master_rekening')
    .update(input)
    .eq('REKSUB', reksub)
    .select();

  if (error) {
    console.error("Error updating master_rekening:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-rekening');
  return data?.[0] as MasterRekening;
}

export async function deleteMasterRekening(reksub: string) {
  const { error } = await supabase
    .from('master_rekening')
    .delete()
    .eq('REKSUB', reksub);

  if (error) {
    console.error("Error deleting master_rekening:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-rekening');
  return true;
}
