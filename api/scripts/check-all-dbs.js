#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

async function checkDatabases() {
    console.log('Verificando bancos de dados disponíveis...\n');

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        // Listar todos os bancos
        const dbs = await pool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false
            ORDER BY datname
        `);
        
        console.log('Bancos de dados encontrados:');
        dbs.rows.forEach(row => {
            console.log(`  - ${row.datname}`);
        });
        
        // Verificar se plataforma_db existe
        const plataformaDb = dbs.rows.find(r => r.datname === 'plataforma_db');
        const postgresDb = dbs.rows.find(r => r.datname === 'postgres');
        
        console.log('\n' + '='.repeat(60));
        
        if (plataformaDb) {
            console.log('✓ Banco "plataforma_db" existe');
            await pool.end();
            
            // Verificar tabelas no plataforma_db
            const dbPool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: 'plataforma_db',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD,
            });
            
            const tables = await dbPool.query(`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            `);
            
            console.log(`\nTabelas em "plataforma_db": ${tables.rows.length}`);
            if (tables.rows.length > 0) {
                tables.rows.forEach(row => {
                    console.log(`  - ${row.tablename}`);
                });
            } else {
                console.log('  ⚠️  Nenhuma tabela encontrada!');
                console.log('  💡 Execute: npm run db:setup');
            }
            
            await dbPool.end();
        } else {
            console.log('❌ Banco "plataforma_db" NÃO existe');
            console.log('\n💡 Opções:');
            console.log('   1. Execute: npm run db:setup (cria o banco e tabelas)');
            console.log('   2. Ou altere DB_NAME no .env para "postgres" e execute: npm run db:setup');
        }
        
        if (postgresDb) {
            console.log('\n✓ Banco "postgres" existe');
            const postgresPool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: 'postgres',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD,
            });
            
            const tables = await postgresPool.query(`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            `);
            
            console.log(`\nTabelas em "postgres": ${tables.rows.length}`);
            if (tables.rows.length > 0) {
                tables.rows.slice(0, 10).forEach(row => {
                    console.log(`  - ${row.tablename}`);
                });
                if (tables.rows.length > 10) {
                    console.log(`  ... e mais ${tables.rows.length - 10} tabelas`);
                }
            }
            
            await postgresPool.end();
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('Erro:', error.message);
        await pool.end();
        process.exit(1);
    }
}

checkDatabases();

