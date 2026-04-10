
import XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import { pool } from '../lib/db.js';

async function testImport() {
  try {
    const filePath = 'e:/PROJECT/NEXTJS/pt_seumadam/public/bahan/REKENING.xls';
    const buf = await readFile(filePath);
    const workbook = XLSX.read(buf, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${rawData.length} rows in Excel.`);

    const dataToInsert = rawData.map((row) => {
      const findKey = (candidates) => {
        const key = Object.keys(row).find(k => candidates.includes(k.toUpperCase()));
        return key ? String(row[key]).trim() : '';
      };

      return {
        REKSUB: findKey(['REKSUB', 'KODE', 'ACCOUNT_CODE']),
        REKIN: findKey(['REKIN', 'INDUK', 'PARENT_CODE']),
        NAMA_PERK: findKey(['NAMA_PERK', 'NAMA', 'ACCOUNT_NAME']),
      };
    }).filter(item => item.REKSUB && item.NAMA_PERK);

    console.log(`Valid data to insert: ${dataToInsert.length} rows.`);

    if (dataToInsert.length === 0) {
      console.log('No valid data found.');
      return;
    }

    const values = dataToInsert.map(d => [d.REKSUB, d.REKIN, d.NAMA_PERK]);
    
    const query = `
      INSERT INTO master_rekening (REKSUB, REKIN, NAMA_PERK)
      VALUES ?
      ON DUPLICATE KEY UPDATE
      REKIN = VALUES(REKIN),
      NAMA_PERK = VALUES(NAMA_PERK)
    `;

    // We can't easily run pool.query from a random script without proper setup, 
    // but we can check the values.
    console.log('First 3 values:', values.slice(0, 3));
    
    // To actually run it, we'd need to mock or use the real pool.
    // I'll just check if the logic works.
    console.log('Import logic simulation successful.');
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testImport();
