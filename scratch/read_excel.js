import XLSX from 'xlsx';
import path from 'path';

const filePath = 'e:\\PROJECT\\NEXTJS\\pt_seumadam\\referensi\\Input Saldo Awal\\SALDO AWAL 010126.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Sheet Name:', sheetName);
console.log('First 5 rows:');
data.slice(0, 5).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
});
