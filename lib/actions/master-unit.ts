"use server";

import { createClient } from '@supabase/supabase-js';
import { MasterUnit, MasterUnitInput } from '../types/master-unit';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key');

export async function getMasterUnit() {
  const { data, error } = await supabase
    .from('master_unit')
    .select('*')
    .order('KOKE', { ascending: true });

  if (error) {
    console.error("Error fetching master_unit:", error);
    return [];
  }

  return data as MasterUnit[];
}

export async function addMasterUnit(input: MasterUnitInput) {
  const { data, error } = await supabase
    .from('master_unit')
    .insert([input])
    .select();

  if (error) {
    console.error("Error adding master_unit:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-unit');
  return data?.[0] as MasterUnit;
}

export async function updateMasterUnit(koke: string, input: Partial<MasterUnitInput>) {
  const { data, error } = await supabase
    .from('master_unit')
    .update(input)
    .eq('KOKE', koke)
    .select();

  if (error) {
    console.error("Error updating master_unit:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-unit');
  return data?.[0] as MasterUnit;
}

export async function deleteMasterUnit(koke: string) {
  const { error } = await supabase
    .from('master_unit')
    .delete()
    .eq('KOKE', koke);

  if (error) {
    console.error("Error deleting master_unit:", error);
    throw new Error(error.message);
  }

  revalidatePath('/master-unit');
  return true;
}
