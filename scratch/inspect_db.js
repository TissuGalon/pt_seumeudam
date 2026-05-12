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
    });

    try {
        console.log('--- DESCRIBE master_unit ---');
        const [unitRows] = await connection.query('DESCRIBE master_unit');
        console.log(JSON.stringify(unitRows, null, 2));

        console.log('--- DESCRIBE master_rekening ---');
        const [rekRows] = await connection.query('DESCRIBE master_rekening');
        console.log(JSON.stringify(rekRows, null, 2));
        
        console.log('--- SHOW CREATE TABLE master_unit ---');
        const [createUnit] = await connection.query('SHOW CREATE TABLE master_unit');
        console.log(createUnit[0]['Create Table']);

        console.log('--- SHOW CREATE TABLE master_rekening ---');
        const [createRek] = await connection.query('SHOW CREATE TABLE master_rekening');
        console.log(createRek[0]['Create Table']);

    } catch (error) {
        console.error('Error fetching table info:', error);
    } finally {
        await connection.end();
    }
}

run();
