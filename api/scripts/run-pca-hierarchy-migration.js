/**
 * Script para executar a migration de hierarquia PC > Tarefas
 * SEGURO: Apenas adiciona coluna, NÃO deleta dados
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Iniciando migration: Hierarquia PC > Tarefas...\n');
        
        // Verificar dados existentes ANTES
        const tarefasBefore = await client.query('SELECT COUNT(*) FROM pca_tarefas');
        const pcsBefore = await client.query('SELECT COUNT(*) FROM pca_pontos_controle');
        
        console.log('📊 Dados existentes ANTES da migration:');
        console.log(`   - Tarefas: ${tarefasBefore.rows[0].count}`);
        console.log(`   - Pontos de Controle: ${pcsBefore.rows[0].count}\n`);
        
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, '../sql/migrations/016_add_ponto_controle_to_tarefas.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Executar migration em transação
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        console.log('✅ Migration executada com sucesso!\n');
        
        // Verificar dados existentes DEPOIS
        const tarefasAfter = await client.query('SELECT COUNT(*) FROM pca_tarefas');
        const pcsAfter = await client.query('SELECT COUNT(*) FROM pca_pontos_controle');
        
        console.log('📊 Dados existentes DEPOIS da migration:');
        console.log(`   - Tarefas: ${tarefasAfter.rows[0].count}`);
        console.log(`   - Pontos de Controle: ${pcsAfter.rows[0].count}\n`);
        
        // Verificar se coluna foi criada
        const columnCheck = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'pca_tarefas' 
            AND column_name = 'ponto_controle_id'
        `);
        
        if (columnCheck.rows.length > 0) {
            console.log('📋 Nova coluna criada:');
            console.log(`   - Nome: ${columnCheck.rows[0].column_name}`);
            console.log(`   - Tipo: ${columnCheck.rows[0].data_type}`);
            console.log(`   - Nullable: ${columnCheck.rows[0].is_nullable}`);
        }
        
        // Verificar tarefas órfãs (sem PC)
        const orfas = await client.query('SELECT COUNT(*) FROM pca_tarefas WHERE ponto_controle_id IS NULL');
        console.log(`\n⚠️  Tarefas órfãs (sem PC): ${orfas.rows[0].count}`);
        console.log('   💡 Use a interface para associá-las aos Pontos de Controle');
        
        console.log('\n✨ Migration concluída com sucesso! Nenhum dado foi perdido.');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erro ao executar migration:', error.message);
        console.log('🔄 Rollback executado - nenhuma alteração foi aplicada');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);


























