#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Conectar ao postgres primeiro
};

async function checkDatabase() {
    console.log('='.repeat(60));
    console.log('  DIAGNÓSTICO DO BANCO DE DADOS');
    console.log('='.repeat(60));
    console.log('');

    const pool = new Pool(dbConfig);
    const targetDb = process.env.DB_NAME || 'plataforma_db';

    try {
        // 1. Verificar se o banco existe
        console.log(`1. Verificando se o banco '${targetDb}' existe...`);
        const checkDb = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [targetDb]
        );

        if (checkDb.rows.length === 0) {
            console.log(`   ❌ Banco '${targetDb}' NÃO existe!`);
            console.log(`   💡 Execute: npm run db:setup`);
            await pool.end();
            return;
        }

        console.log(`   ✓ Banco '${targetDb}' existe`);

        await pool.end();

        // 2. Conectar ao banco e verificar tabelas
        console.log(`\n2. Verificando tabelas no banco '${targetDb}'...`);
        const targetPool = new Pool({
            ...dbConfig,
            database: targetDb
        });

        try {
            const tables = await targetPool.query(`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            `);

            if (tables.rows.length === 0) {
                console.log(`   ❌ Nenhuma tabela encontrada!`);
                console.log(`   💡 Execute: npm run db:setup`);
            } else {
                console.log(`   ✓ ${tables.rows.length} tabelas encontradas:`);
                tables.rows.forEach(row => {
                    console.log(`      - ${row.tablename}`);
                });

                // 3. Verificar dados em algumas tabelas principais
                console.log(`\n3. Verificando dados nas tabelas principais...`);
                
                const mainTables = ['users', 'objectives', 'key_results', 'pca_items', 'forms'];
                for (const table of mainTables) {
                    if (tables.rows.some(t => t.tablename === table)) {
                        const count = await targetPool.query(
                            `SELECT COUNT(*) as count FROM ${table} WHERE is_deleted = FALSE`
                        );
                        const total = await targetPool.query(
                            `SELECT COUNT(*) as total FROM ${table}`
                        );
                        console.log(`   ${table}: ${count.rows[0].count} registros ativos (${total.rows[0].total} total)`);
                    }
                }
            }

        } finally {
            await targetPool.end();
        }

        console.log('\n' + '='.repeat(60));
        console.log('  DIAGNÓSTICO CONCLUÍDO');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Erro durante diagnóstico:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('   💡 Verifique as credenciais no arquivo .env');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('   💡 Verifique se o PostgreSQL está rodando');
        }
        process.exit(1);
    }
}

checkDatabase();

