#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function checkData() {
    console.log('Verificando dados no banco...\n');

    try {
        const users = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_deleted = FALSE');
        console.log(`✓ Usuários: ${users.rows[0].count}`);

        const objectives = await pool.query('SELECT COUNT(*) as count FROM objectives WHERE is_deleted = FALSE');
        console.log(`✓ Objetivos: ${objectives.rows[0].count}`);

        const keyResults = await pool.query('SELECT COUNT(*) as count FROM key_results WHERE is_deleted = FALSE');
        console.log(`✓ Key Results: ${keyResults.rows[0].count}`);

        const programs = await pool.query('SELECT COUNT(*) as count FROM programs WHERE is_deleted = FALSE');
        console.log(`✓ Programas: ${programs.rows[0].count}`);

        const pcaItems = await pool.query('SELECT COUNT(*) as count FROM pca_items WHERE is_deleted = FALSE');
        console.log(`✓ Itens PCA: ${pcaItems.rows[0].count}`);

        const forms = await pool.query('SELECT COUNT(*) as count FROM forms WHERE is_deleted = FALSE');
        console.log(`✓ Formulários: ${forms.rows[0].count}`);

        console.log('\n' + '='.repeat(60));
        if (parseInt(users.rows[0].count) === 0) {
            console.log('⚠️  Nenhum dado encontrado!');
            console.log('💡 Execute: npm run db:seed');
        } else {
            console.log('✓ Banco de dados populado!');
        }
        console.log('='.repeat(60));

    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        await pool.end();
    }
}

checkData();

