
import XLSX from 'xlsx';
import { readFile } from 'fs/promises';

const filePath = 'e:/PROJECT/NEXTJS/pt_seumadam/public/bahan/REKENING.xls';
const buf = await readFile(filePath);
const workbook = XLSX.read(buf, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Headers:', data[0]);
console.log('Sample Data:', data.slice(1, 4));
