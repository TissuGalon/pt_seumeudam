"use server";

import { pool } from '../db';
import { MasterRekening, MasterRekeningInput } from '../types/master-rekening';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

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

export async function importMasterRekening(formData: FormData) {
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

    // Map data and ensure keys match database (case-insensitive check for common headers)
    const dataToInsert = rawData.map((row: any) => {
      // Find keys regardless of case
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

    // Prepare for batch insertion
    const values = dataToInsert.map(d => [d.REKSUB, d.REKIN, d.NAMA_PERK]);
    
    const query = `
      INSERT INTO master_rekening (REKSUB, REKIN, NAMA_PERK)
      VALUES ?
      ON DUPLICATE KEY UPDATE
      REKIN = VALUES(REKIN),
      NAMA_PERK = VALUES(NAMA_PERK)
    `;

    await pool.query(query, [values]);
    revalidatePath('/master-rekening');
    
    return { success: true, count: dataToInsert.length };
  } catch (error: any) {
    console.error("Error importing master_rekening:", error);
    throw new Error(error.message || "Gagal mengimpor data.");
  }
}
