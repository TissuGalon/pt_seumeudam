"use server";

import { pool } from '../db';
import { revalidatePath } from 'next/cache';

export async function getJurnal(filterUnit?: string, filterBulan?: string) {
  try {
    let query = 'SELECT * FROM jurnal_transaksi WHERE 1=1';
    const params: any[] = [];
    
    if (filterUnit) {
      query += ' AND KOKE = ?';
      params.push(filterUnit);
    }
    if (filterBulan) {
      query += ' AND KOBU = ?';
      params.push(filterBulan);
    }
    
    query += ' ORDER BY TANGGAL ASC, NO_BUKJUR ASC';
    
    const [rows] = await pool.query(query, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching jurnal:", error);
    return [];
  }
}

export async function deleteJurnal(id: string) {
  try {
    await pool.query('DELETE FROM jurnal_transaksi WHERE id = ?', [id]);
    revalidatePath('/laporan-jurnal');
    return true;
  } catch (error: any) {
    console.error("Error deleting jurnal:", error);
    throw new Error(error.message);
  }
}

export async function addJurnalTransaksi(rows: any[]) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const row of rows) {
      await connection.query('INSERT INTO jurnal_transaksi SET ?', [row]);
    }
    
    await connection.commit();
    revalidatePath('/laporan-jurnal');
    revalidatePath('/input-jurnal');
    return true;
  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding jurnal:", error);
    throw new Error(error.message);
  } finally {
    connection.release();
  }
}

export async function updateJurnal(id: number, input: any) {
  try {
    await pool.query('UPDATE jurnal_transaksi SET ? WHERE id = ?', [input, id]);
    revalidatePath('/laporan-jurnal');
    return true;
  } catch (error: any) {
    console.error("Error updating jurnal:", error);
    throw new Error(error.message);
  }
}
