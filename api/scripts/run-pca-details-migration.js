/**
 * Script para executar a migration das tabelas de detalhes do PCA
 * 
 * Uso: node scripts/run-pca-details-migration.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

// Configuração do pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function runMigration() {
    console.log('');
    console.log('='.repeat(60));
    console.log('  🚀 MIGRATION: Tabelas de Detalhes do PCA');
    console.log('='.repeat(60));
    console.log('');

    const client = await pool.connect();

    try {
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '015_create_pca_details_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Arquivo SQL:', sqlPath);
        console.log('');

        // Executar migration
        console.log('⏳ Executando migration...');
        await client.query(sql);

        // Verificar resultados
        console.log('');
        console.log('✅ Migration executada com sucesso!');
        console.log('');

        // Contar registros em cada tabela
        const tables = [
            { name: 'pca_item_details', desc: 'Campos estáticos' },
            { name: 'pca_checklist_items', desc: 'Itens de checklist' },
            { name: 'pca_pontos_controle', desc: 'Pontos de controle' },
            { name: 'pca_tarefas', desc: 'Tarefas' }
        ];

        console.log('📊 Estatísticas:');
        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) as count FROM ${table.name}`);
            console.log(`   - ${table.name}: ${result.rows[0].count} registros (${table.desc})`);
        }

        // Verificar checklist
        const checklistResult = await client.query(`
            SELECT pca_item_id, COUNT(*) as items
            FROM pca_checklist_items 
            GROUP BY pca_item_id
            ORDER BY pca_item_id
            LIMIT 5
        `);
        
        console.log('');
        console.log('📋 Primeiros 5 itens PCA com checklist:');
        checklistResult.rows.forEach(row => {
            console.log(`   - PCA Item ID ${row.pca_item_id}: ${row.items} itens no checklist`);
        });

        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ Erro ao executar migration:', error.message);
        console.error('');
        
        if (error.detail) {
            console.error('Detalhes:', error.detail);
        }

        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }

    console.log('='.repeat(60));
    console.log('');
}

runMigration();
