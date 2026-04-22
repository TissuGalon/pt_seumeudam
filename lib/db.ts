import mysql from 'mysql2/promise';

// Check for missing environment variables in server-side context
if (typeof window === 'undefined') {
  const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`[DB] Warning: Missing database environment variables: ${missing.join(', ')}`);
    console.warn('[DB] Falling back to hardcoded defaults (Not recommended for production)');
  }
}

const dbConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST || 'srv1987.hstgr.io',
  user: process.env.MYSQL_USER || 'u427727524_dev',
  password: process.env.MYSQL_PASSWORD || 'B@zBDCp9KWf7',
  database: process.env.MYSQL_DATABASE || 'u427727524_pt_seumeudam',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create a pool instead of a single connection for better performance in Next.js Server environments
export const pool = mysql.createPool(dbConfig);

// Debug connection on initialization (server-side only)
if (typeof window === 'undefined') {
  pool.getConnection()
    .then((conn) => {
      console.log(`[DB] Successfully connected to ${dbConfig.host} as ${dbConfig.user}`);
      conn.release();
    })
    .catch((err) => {
      console.error('[DB] Connection attempt failed during initialization:', err.message);
    });
}
