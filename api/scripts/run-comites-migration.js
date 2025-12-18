/**
 * Script para executar a migração do módulo Comitês
 * Execute com: node scripts/run-comites-migration.js
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
    database: process.env.DB_NAME || 'plataforma_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('\n🚀 Iniciando migração do módulo Comitês...\n');
        
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '019_create_comites.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Executar migração
        await client.query(sql);
        
        console.log('✅ Migração executada com sucesso!\n');
        
        // Verificar dados inseridos
        const comites = await client.query('SELECT id, sigla, nome FROM comites ORDER BY ordem');
        console.log('📋 Comitês criados:');
        comites.rows.forEach(c => {
            console.log(`   - [${c.sigla}] ${c.nome}`);
        });
        
        const reunioes = await client.query('SELECT COUNT(*) as total FROM comite_reunioes');
        console.log(`\n📅 Total de reuniões: ${reunioes.rows[0].total}`);
        
        const membros = await client.query('SELECT COUNT(*) as total FROM comite_membros WHERE ativo = TRUE');
        console.log(`👥 Total de membros: ${membros.rows[0].total}`);
        
        const pauta = await client.query('SELECT COUNT(*) as total FROM comite_reuniao_pauta');
        console.log(`📝 Total de itens de pauta: ${pauta.rows[0].total}`);
        
        const quadro = await client.query('SELECT COUNT(*) as total FROM comite_quadro_controle');
        console.log(`📊 Total de itens no quadro de controle: ${quadro.rows[0].total}`);
        
        console.log('\n✨ Módulo Comitês pronto para uso!\n');
        
    } catch (error) {
        console.error('\n❌ Erro na migração:', error.message);
        console.error('\n💥 Falha na migração:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();






















