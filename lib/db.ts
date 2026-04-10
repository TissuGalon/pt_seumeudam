import mysql from 'mysql2/promise';

const dbConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST || 'sql12.freesqldatabase.com',
  user: process.env.MYSQL_USER || 'sql12822332',
  password: process.env.MYSQL_PASSWORD || 'ybkZjbfgGr',
  database: process.env.MYSQL_DATABASE || 'sql12822332',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/* const dbConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'pt_seumadam',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}; */

// Create a pool instead of a single connection for better performance in Next.js Server environments
export const pool = mysql.createPool(dbConfig);
