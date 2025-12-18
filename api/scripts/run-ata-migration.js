/**
 * Script para executar a migração de campos de ata de reunião
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

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_sgjt',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
});

async function runMigration() {
    console.log('🚀 Iniciando migração de campos de ata...\n');
    
    try {
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '020_add_ata_fields_reunioes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 Executando migração...\n');
        
        // Executar migração
        const result = await pool.query(sql);
        
        console.log('✅ Migração executada com sucesso!');
        console.log('\n📊 Colunas de ata adicionadas:');
        
        if (result && result.length > 0) {
            const lastResult = result[result.length - 1];
            if (lastResult.rows) {
                lastResult.rows.forEach(row => {
                    console.log(`   - ${row.column_name} (${row.data_type})`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

runMigration()
    .then(() => {
        console.log('\n✅ Processo finalizado com sucesso!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n💥 Falha na migração:', err);
        process.exit(1);
    });





















