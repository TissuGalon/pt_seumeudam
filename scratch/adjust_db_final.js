import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function run() {
    const envPath = path.resolve('.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });

    const connection = await mysql.createConnection({
        host: env.MYSQL_HOST,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        port: parseInt(env.MYSQL_PORT || '3306'),
        multipleStatements: true
    });

    try {
        console.log('Menyesuaikan database dengan collation utf8mb4_general_ci...');
        
        const sql = `
            SET FOREIGN_KEY_CHECKS = 0;
            DROP TABLE IF EXISTS \`saldo_awal\`;
            CREATE TABLE \`saldo_awal\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`KOKE\` VARCHAR(10) COLLATE utf8mb4_general_ci NOT NULL,
                \`BULAN\` VARCHAR(5) COLLATE utf8mb4_general_ci NOT NULL,
                \`TAHUN\` VARCHAR(5) COLLATE utf8mb4_general_ci NOT NULL,
                \`REK\` VARCHAR(50) COLLATE utf8mb4_general_ci NOT NULL,
                \`DEBET\` DECIMAL(15,2) DEFAULT 0.00,
                \`KREDIT\` DECIMAL(15,2) DEFAULT 0.00,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                INDEX \`idx_unit_period\` (\`KOKE\`, \`BULAN\`, \`TAHUN\`),
                CONSTRAINT \`fk_sa_unit_v2\` FOREIGN KEY (\`KOKE\`) REFERENCES \`master_unit\` (\`KOKE\`) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT \`fk_sa_rek_v2\` FOREIGN KEY (\`REK\`) REFERENCES \`master_rekening\` (\`REKSUB\`) ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            SET FOREIGN_KEY_CHECKS = 1;
        `;

        await connection.query(sql);
        console.log('Tabel saldo_awal BERHASIL dibuat!');
    } catch (error) {
        console.error('Gagal menyesuaikan database:', error);
    } finally {
        await connection.end();
    }
}

run();
