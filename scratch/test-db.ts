import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

async function testConnection() {
  console.log('--- Database Connection Test ---');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!');
    
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('✅ Query successful! Result:', (rows as any)[0].solution);
    
    await connection.end();
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('Errno:', error.errno);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}

testConnection();
