#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

async function testConnection() {
    console.log('Testando conexão com PostgreSQL...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    console.log('Password:', process.env.DB_PASSWORD ? '***' : 'NÃO DEFINIDA');
    console.log('');

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        const result = await pool.query('SELECT NOW() as now, current_database() as db, current_user as user');
        console.log('✓ Conexão estabelecida com sucesso!');
        console.log('  Timestamp:', result.rows[0].now);
        console.log('  Database:', result.rows[0].db);
        console.log('  User:', result.rows[0].user);
        
        // Verificar tabelas
        const tables = await pool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        
        console.log(`\n  Tabelas encontradas: ${tables.rows.length}`);
        if (tables.rows.length > 0) {
            console.log('  Primeiras 10 tabelas:');
            tables.rows.slice(0, 10).forEach(row => {
                console.log(`    - ${row.tablename}`);
            });
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('✗ Erro ao conectar:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('\n💡 Verifique se a senha no .env está correta');
            console.error('   Se a senha contém caracteres especiais ($, !, etc), pode precisar de aspas');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Verifique se o PostgreSQL está rodando');
        }
        await pool.end();
        process.exit(1);
    }
}

testConnection();

