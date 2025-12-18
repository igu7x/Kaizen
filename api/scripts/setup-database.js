#!/usr/bin/env node

/**
 * SETUP DO BANCO DE DADOS
 * 
 * Cria o banco de dados e executa o schema SQL
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Conectar ao postgres para criar o DB
};

const targetDb = process.env.DB_NAME || 'plataforma_db';

async function main() {
    console.log('='.repeat(60));
    console.log('  SETUP DO BANCO DE DADOS POSTGRESQL');
    console.log('='.repeat(60));
    console.log('');

    const pool = new Pool(dbConfig);

    try {
        // Verificar se o banco já existe
        console.log(`Verificando se o banco '${targetDb}' existe...`);
        const checkDb = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [targetDb]
        );

        if (checkDb.rows.length === 0) {
            // Criar banco
            console.log(`\nCriando banco de dados '${targetDb}'...`);
            await pool.query(`CREATE DATABASE ${targetDb}`);
            console.log(`✓ Banco '${targetDb}' criado com sucesso!`);
        } else {
            console.log(`✓ Banco '${targetDb}' já existe`);
        }

        await pool.end();

        // Conectar ao banco criado e executar schema
        console.log(`\nExecutando schema SQL...`);
        const targetPool = new Pool({
            ...dbConfig,
            database: targetDb
        });

        try {
            const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
            const schema = await fs.readFile(schemaPath, 'utf-8');

            await targetPool.query(schema);
            console.log('✓ Schema executado com sucesso!');

            // Verificar tabelas criadas
            const tables = await targetPool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

            console.log(`\n✓ ${tables.rows.length} tabelas criadas:`);
            tables.rows.forEach(row => {
                console.log(`  - ${row.tablename}`);
            });

            console.log('\n' + '='.repeat(60));
            console.log('  SETUP CONCLUÍDO COM SUCESSO!');
            console.log('='.repeat(60));
            console.log('');
            console.log('Próximos passos:');
            console.log('1. Se tiver dados no localStorage, execute: npm run migrate');
            console.log('2. Ou popule dados iniciais com: npm run db:seed');
            console.log('3. Inicie o servidor com: npm run dev');
            console.log('');

        } finally {
            await targetPool.end();
        }

    } catch (error) {
        console.error('\n✗ Erro durante setup:', error);
        process.exit(1);
    }
}

main();
