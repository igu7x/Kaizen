/**
 * Script para executar a migration da tabela pca_items
 * 
 * Uso: node scripts/run-pca-migration.js
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
    console.log('  🚀 MIGRATION: pca_items');
    console.log('='.repeat(60));
    console.log('');

    const client = await pool.connect();

    try {
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '014_create_pca_items.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Arquivo SQL:', sqlPath);
        console.log('');

        // Executar migration
        console.log('⏳ Executando migration...');
        await client.query(sql);

        // Verificar resultados
        const countResult = await client.query('SELECT COUNT(*) as count FROM pca_items WHERE is_deleted = FALSE');
        const count = countResult.rows[0].count;

        const statsResult = await client.query(`
            SELECT 
                COUNT(*) as total,
                SUM(valor_anual) as valor_total
            FROM pca_items 
            WHERE is_deleted = FALSE
        `);
        const stats = statsResult.rows[0];

        console.log('');
        console.log('✅ Migration executada com sucesso!');
        console.log('');
        console.log('📊 Estatísticas:');
        console.log(`   - Total de itens PCA: ${count}`);
        console.log(`   - Valor total: R$ ${parseFloat(stats.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        console.log('');

        // Listar alguns itens como exemplo
        const itemsResult = await client.query(`
            SELECT item_pca, area_demandante, valor_anual, data_estimada_contratacao 
            FROM pca_items 
            WHERE is_deleted = FALSE 
            ORDER BY id 
            LIMIT 5
        `);

        console.log('📋 Primeiros 5 itens:');
        itemsResult.rows.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.item_pca} - ${item.area_demandante} - R$ ${parseFloat(item.valor_anual).toLocaleString('pt-BR')} - ${item.data_estimada_contratacao}`);
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




























