"use server";

import { pool } from '../db';
import { MasterUnit, MasterUnitInput } from '../types/master-unit';
import { revalidatePath } from 'next/cache';

export async function getMasterUnit() {
  try {
    const [rows] = await pool.query('SELECT * FROM master_unit ORDER BY KOKE ASC');
    return rows as MasterUnit[];
  } catch (error) {
    console.error("Error fetching master_unit:", error);
    return [];
  }
}

export async function addMasterUnit(input: MasterUnitInput) {
  try {
    await pool.query('INSERT INTO master_unit SET ?', [input]);
    const [rows] = await pool.query('SELECT * FROM master_unit WHERE KOKE = ?', [input.KOKE]);
    revalidatePath('/master-unit');
    return (rows as any[])[0] as MasterUnit;
  } catch (error: any) {
    console.error("Error adding master_unit:", error);
    throw new Error(error.message);
  }
}

export async function updateMasterUnit(koke: string, input: Partial<MasterUnitInput>) {
  try {
    await pool.query('UPDATE master_unit SET ? WHERE KOKE = ?', [input, koke]);
    const [rows] = await pool.query('SELECT * FROM master_unit WHERE KOKE = ?', [koke]);
    revalidatePath('/master-unit');
    return (rows as any[])[0] as MasterUnit;
  } catch (error: any) {
    console.error("Error updating master_unit:", error);
    throw new Error(error.message);
  }
}

export async function deleteMasterUnit(koke: string) {
  try {
    await pool.query('DELETE FROM master_unit WHERE KOKE = ?', [koke]);
    revalidatePath('/master-unit');
    return true;
  } catch (error: any) {
    console.error("Error deleting master_unit:", error);
    throw new Error(error.message);
  }
}
