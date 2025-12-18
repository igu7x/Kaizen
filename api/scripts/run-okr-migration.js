/**
 * Script para executar a migração de OKRs da DPE
 * Executa o arquivo SQL 009_insert_dpe_okrs.sql
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function runMigration() {
    console.log('='.repeat(60));
    console.log('🚀 EXECUTANDO MIGRAÇÃO: OKRs da Diretoria DPE');
    console.log('='.repeat(60));
    
    try {
        // Testar conexão
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL');
        
        // Ler arquivo SQL
        const sqlPath = path.resolve(__dirname, '../sql/migrations/009_insert_dpe_okrs.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log('📄 Arquivo SQL carregado');
        
        // Executar migração
        console.log('\n📝 Executando inserções...\n');
        await client.query(sqlContent);
        
        // Verificar resultados
        console.log('\n='.repeat(60));
        console.log('📊 VALIDAÇÃO DOS DADOS INSERIDOS');
        console.log('='.repeat(60));
        
        // Contar objetivos
        const objResult = await client.query(`
            SELECT COUNT(*) as total FROM objectives 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
        `);
        console.log(`\n✅ Objetivos DPE: ${objResult.rows[0].total}`);
        
        // Contar key results
        const krResult = await client.query(`
            SELECT COUNT(*) as total FROM key_results 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
        `);
        console.log(`✅ Key Results DPE: ${krResult.rows[0].total}`);
        
        // Listar objetivos
        console.log('\n📋 OBJETIVOS INSERIDOS:');
        console.log('-'.repeat(60));
        const objectives = await client.query(`
            SELECT code, title FROM objectives 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
            ORDER BY code
        `);
        objectives.rows.forEach(obj => {
            console.log(`  ${obj.code}: ${obj.title.substring(0, 60)}...`);
        });
        
        // Listar KRs por objetivo
        console.log('\n📋 KEY RESULTS POR OBJETIVO:');
        console.log('-'.repeat(60));
        const keyResults = await client.query(`
            SELECT o.code as obj_code, kr.code as kr_code, kr.description, kr.status, kr.situation, kr.deadline
            FROM key_results kr
            JOIN objectives o ON kr.objective_id = o.id
            WHERE kr.directorate_code = 'DPE' AND (kr.is_deleted = FALSE OR kr.is_deleted IS NULL)
            ORDER BY o.code, kr.code
        `);
        
        let currentObj = '';
        keyResults.rows.forEach(kr => {
            if (kr.obj_code !== currentObj) {
                console.log(`\n  ${kr.obj_code}:`);
                currentObj = kr.obj_code;
            }
            const statusIcon = kr.status === 'CONCLUIDO' ? '✅' : (kr.status === 'EM_ANDAMENTO' ? '🔄' : '⬜');
            console.log(`    ${statusIcon} ${kr.kr_code} - ${kr.description.substring(0, 50)}... [${kr.deadline}]`);
        });
        
        // Verificar prazos
        console.log('\n📅 VERIFICAÇÃO DE FORMATOS DE PRAZO:');
        console.log('-'.repeat(60));
        const deadlines = await client.query(`
            SELECT DISTINCT deadline FROM key_results 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
            ORDER BY deadline
        `);
        console.log('  Prazos encontrados:', deadlines.rows.map(d => d.deadline).join(', '));
        
        // Verificar status e situação
        console.log('\n📊 DISTRIBUIÇÃO POR STATUS:');
        const statusDist = await client.query(`
            SELECT status, COUNT(*) as count FROM key_results 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
            GROUP BY status
        `);
        statusDist.rows.forEach(s => {
            console.log(`  ${s.status}: ${s.count}`);
        });
        
        console.log('\n📊 DISTRIBUIÇÃO POR SITUAÇÃO:');
        const sitDist = await client.query(`
            SELECT situation, COUNT(*) as count FROM key_results 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
            GROUP BY situation
        `);
        sitDist.rows.forEach(s => {
            console.log(`  ${s.situation}: ${s.count}`);
        });
        
        client.release();
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(60));
        
        // Validação final
        const totalKRs = parseInt(krResult.rows[0].total);
        if (totalKRs >= 23) {
            console.log('\n✅ VALIDAÇÃO: 23+ Key Results inseridos corretamente!');
        } else {
            console.log(`\n⚠️ ATENÇÃO: Apenas ${totalKRs} KRs encontrados (esperado: 23)`);
        }
        
    } catch (error) {
        console.error('\n❌ ERRO NA MIGRAÇÃO:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();






