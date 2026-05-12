"use server";

import { createClient } from '../supabase/server';
import { MasterUnit, MasterUnitInput } from '../types/master-unit';
import { revalidatePath } from 'next/cache';

export async function getMasterUnit() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('master_unit')
      .select('*')
      .order('KOKE', { ascending: true });
    
    if (error) throw error;
    return data as MasterUnit[];
  } catch (error) {
    console.error("Error fetching master_unit:", error);
    return [];
  }
}

export async function addMasterUnit(input: MasterUnitInput) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('master_unit')
      .insert([input])
      .select()
      .single();
    
    if (error) throw error;
    revalidatePath('/master-unit');
    return data as MasterUnit;
  } catch (error: any) {
    console.error("Error adding master_unit:", error);
    throw new Error(error.message);
  }
}

export async function updateMasterUnit(koke: string, input: Partial<MasterUnitInput>) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('master_unit')
      .update(input)
      .eq('KOKE', koke)
      .select()
      .single();
    
    if (error) throw error;
    revalidatePath('/master-unit');
    return data as MasterUnit;
  } catch (error: any) {
    console.error("Error updating master_unit:", error);
    throw new Error(error.message);
  }
}

export async function deleteMasterUnit(koke: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('master_unit')
      .delete()
      .eq('KOKE', koke);
    
    if (error) throw error;
    revalidatePath('/master-unit');
    return true;
  } catch (error: any) {
    console.error("Error deleting master_unit:", error);
    throw new Error(error.message);
  }
}
