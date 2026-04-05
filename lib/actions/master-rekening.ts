"use server";

import { pool } from '../db';
import { MasterRekening, MasterRekeningInput } from '../types/master-rekening';
import { revalidatePath } from 'next/cache';

export async function getMasterRekening() {
  try {
    const [rows] = await pool.query('SELECT * FROM master_rekening ORDER BY REKSUB ASC');
    return rows as MasterRekening[];
  } catch (error) {
    console.error("Error fetching master_rekening:", error);
    return [];
  }
}

export async function addMasterRekening(input: MasterRekeningInput) {
  try {
    await pool.query('INSERT INTO master_rekening SET ?', [input]);
    const [rows] = await pool.query('SELECT * FROM master_rekening WHERE REKSUB = ?', [input.REKSUB]);
    revalidatePath('/master-rekening');
    return (rows as any[])[0] as MasterRekening;
  } catch (error: any) {
    console.error("Error adding master_rekening:", error);
    throw new Error(error.message);
  }
}

export async function updateMasterRekening(reksub: string, input: Partial<MasterRekeningInput>) {
  try {
    await pool.query('UPDATE master_rekening SET ? WHERE REKSUB = ?', [input, reksub]);
    const [rows] = await pool.query('SELECT * FROM master_rekening WHERE REKSUB = ?', [reksub]);
    revalidatePath('/master-rekening');
    return (rows as any[])[0] as MasterRekening;
  } catch (error: any) {
    console.error("Error updating master_rekening:", error);
    throw new Error(error.message);
  }
}

export async function deleteMasterRekening(reksub: string) {
  try {
    await pool.query('DELETE FROM master_rekening WHERE REKSUB = ?', [reksub]);
    revalidatePath('/master-rekening');
    return true;
  } catch (error: any) {
    console.error("Error deleting master_rekening:", error);
    throw new Error(error.message);
  }
}
