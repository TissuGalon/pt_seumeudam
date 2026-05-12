"use server";

import { pool } from '../db';
import { revalidatePath } from 'next/cache';
import { SaldoAwal } from '../types/saldo-awal';

export async function getSaldoAwal(filterUnit?: string, filterBulan?: string, filterTahun?: string) {
  try {
    let query = 'SELECT * FROM saldo_awal WHERE 1=1';
    const params: any[] = [];
    
    if (filterUnit) {
      query += ' AND KOKE = ?';
      params.push(filterUnit);
    }
    if (filterBulan) {
      query += ' AND BULAN = ?';
      params.push(filterBulan);
    }
    if (filterTahun) {
      query += ' AND TAHUN = ?';
      params.push(filterTahun);
    }
    
    const [rows] = await pool.query(query, params);
    return rows as SaldoAwal[];
  } catch (error) {
    console.error("Error fetching saldo awal:", error);
    return [];
  }
}

export async function addSaldoAwal(rows: SaldoAwal[]) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const row of rows) {
      // Check if entry already exists for this account, unit, and period
      // If you want to overwrite, you can use REPLACE INTO or DELETE first.
      // For simplicity and safety, we'll DELETE existing ones for the same KOKE/BULAN/TAHUN first if it's a bulk import.
      // But let's just use INSERT for now, or use a more specific logic.
      await connection.query('INSERT INTO saldo_awal SET ?', [row]);
    }
    
    await connection.commit();
    revalidatePath('/input-saldo-awal');
    return true;
  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding saldo awal:", error);
    throw new Error(error.message);
  } finally {
    connection.release();
  }
}

export async function deleteSaldoAwal(id: number) {
  try {
    await pool.query('DELETE FROM saldo_awal WHERE id = ?', [id]);
    revalidatePath('/input-saldo-awal');
    return true;
  } catch (error: any) {
    console.error("Error deleting saldo awal:", error);
    throw new Error(error.message);
  }
}

export async function clearSaldoAwal(unit: string, bulan: string, tahun: string) {
    try {
      await pool.query('DELETE FROM saldo_awal WHERE KOKE = ? AND BULAN = ? AND TAHUN = ?', [unit, bulan, tahun]);
      revalidatePath('/input-saldo-awal');
      return true;
    } catch (error: any) {
      console.error("Error clearing saldo awal:", error);
      throw new Error(error.message);
    }
}
