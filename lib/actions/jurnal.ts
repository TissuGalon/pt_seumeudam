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

export async function getNextNoBukti(unit: string, tahun: string, bulan: string) {
  try {
    // Search for pattern M.[Unit].[Month].[Sequence].[Year]
    // User wants sequence to continue throughout the year for a given Unit.
    const pattern = `M.${unit}.%.%.${tahun}`;
    const [rows]: any = await pool.query(
      "SELECT NO_BUKJUR FROM jurnal_transaksi WHERE KOKE = ? AND NO_BUKJUR LIKE ? ORDER BY id DESC LIMIT 200",
      [unit, pattern]
    );

    let maxSeq = 0;
    rows.forEach((row: any) => {
      const parts = row.NO_BUKJUR.split('.');
      if (parts.length >= 4) {
        // Part 3 is the sequence (0-indexed: 0=M, 1=Unit, 2=Month, 3=Sequence, 4=Year)
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
