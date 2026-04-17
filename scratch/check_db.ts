import { pool } from "@/lib/db";


async function checkNoBukti() {
  try {
    const [rows]: any = await pool.query('SELECT NO_BUKJUR FROM jurnal_transaksi LIMIT 20');
    console.log('Existing NO_BUKJUR records:');
    rows.forEach((row: any) => console.log(row.NO_BUKJUR));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkNoBukti();
