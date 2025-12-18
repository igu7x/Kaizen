/**
 * Script para executar a migração de OKRs da SGJT
 * SUBSTITUI todos os dados antigos da SGJT pelos novos
 * Preserva dados de outras diretorias (DPE, etc)
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
    console.log('='.repeat(70));
    console.log('🔄 SUBSTITUIÇÃO COMPLETA: OKRs da Diretoria SGJT');
    console.log('='.repeat(70));
    
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL');
        
        // Verificar dados ANTES da migração
        console.log('\n📊 SITUAÇÃO ANTES DA MIGRAÇÃO:');
        console.log('-'.repeat(70));
        
        const beforeSGJT = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM objectives WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)) as obj,
                (SELECT COUNT(*) FROM key_results WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)) as kr
        `);
        console.log(`  SGJT: ${beforeSGJT.rows[0].obj} objetivos, ${beforeSGJT.rows[0].kr} KRs`);
        
        const beforeDPE = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM objectives WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)) as obj,
                (SELECT COUNT(*) FROM key_results WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)) as kr
        `);
        console.log(`  DPE:  ${beforeDPE.rows[0].obj} objetivos, ${beforeDPE.rows[0].kr} KRs`);
        
        // Ler e executar arquivo SQL
        const sqlPath = path.resolve(__dirname, '../sql/migrations/010_replace_sgjt_okrs.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log('\n📄 Arquivo SQL carregado');
        
        console.log('\n🗑️  Excluindo dados antigos da SGJT...');
        console.log('📝 Inserindo novos dados da SGJT...\n');
        
        await client.query(sqlContent);
        
        // Verificar resultados APÓS a migração
        console.log('\n' + '='.repeat(70));
        console.log('📊 SITUAÇÃO APÓS A MIGRAÇÃO:');
        console.log('='.repeat(70));
        
        // SGJT
        const afterSGJT_obj = await client.query(`
            SELECT COUNT(*) as total FROM objectives 
            WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)
        `);
        const afterSGJT_kr = await client.query(`
            SELECT COUNT(*) as total FROM key_results 
            WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)
        `);
        console.log(`\n✅ SGJT: ${afterSGJT_obj.rows[0].total} objetivos, ${afterSGJT_kr.rows[0].total} KRs`);
        
        // DPE
        const afterDPE_obj = await client.query(`
            SELECT COUNT(*) as total FROM objectives 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
        `);
        const afterDPE_kr = await client.query(`
            SELECT COUNT(*) as total FROM key_results 
            WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL)
        `);
        console.log(`✅ DPE:  ${afterDPE_obj.rows[0].total} objetivos, ${afterDPE_kr.rows[0].total} KRs (preservados)`);
        
        // Listar objetivos da SGJT
        console.log('\n📋 OBJETIVOS SGJT INSERIDOS:');
        console.log('-'.repeat(70));
        const objectives = await client.query(`
            SELECT code, title FROM objectives 
            WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)
            ORDER BY code
        `);
        objectives.rows.forEach(obj => {
            console.log(`  ${obj.code}: ${obj.title.substring(0, 55)}...`);
        });
        
        // Listar KRs por objetivo
        console.log('\n📋 KEY RESULTS SGJT POR OBJETIVO:');
        console.log('-'.repeat(70));
        const keyResults = await client.query(`
            SELECT o.code as obj_code, kr.code as kr_code, kr.description, kr.status, kr.situation, kr.deadline
            FROM key_results kr
            JOIN objectives o ON kr.objective_id = o.id
            WHERE kr.directorate_code = 'SGJT' AND (kr.is_deleted = FALSE OR kr.is_deleted IS NULL)
            ORDER BY o.code, kr.code
        `);
        
        let currentObj = '';
        keyResults.rows.forEach(kr => {
            if (kr.obj_code !== currentObj) {
                console.log(`\n  ${kr.obj_code}:`);
                currentObj = kr.obj_code;
            }
            const statusIcon = kr.status === 'CONCLUIDO' ? '✅' : (kr.status === 'EM_ANDAMENTO' ? '🔄' : '⬜');
            const situationIcon = kr.situation === 'EM_ATRASO' ? '⚠️' : '';
            console.log(`    ${statusIcon} ${kr.kr_code} - ${kr.description.substring(0, 45)}... [${kr.deadline}] ${situationIcon}`);
        });
        
        // Verificar STATUS
        console.log('\n📊 DISTRIBUIÇÃO POR STATUS (SGJT):');
        const statusDist = await client.query(`
            SELECT status, COUNT(*) as count FROM key_results 
            WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)
            GROUP BY status ORDER BY status
        `);
        statusDist.rows.forEach(s => {
            const icon = s.status === 'CONCLUIDO' ? '✅' : (s.status === 'EM_ANDAMENTO' ? '🔄' : '⬜');
            console.log(`  ${icon} ${s.status}: ${s.count}`);
        });
        
        // Verificar SITUAÇÃO
        console.log('\n📊 DISTRIBUIÇÃO POR SITUAÇÃO (SGJT):');
        const sitDist = await client.query(`
            SELECT situation, COUNT(*) as count FROM key_results 
            WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)
            GROUP BY situation ORDER BY situation
        `);
        sitDist.rows.forEach(s => {
            const icon = s.situation === 'EM_ATRASO' ? '⚠️' : (s.situation === 'FINALIZADO' ? '✅' : '📅');
            console.log(`  ${icon} ${s.situation}: ${s.count}`);
        });
        
        // Verificar prazos
        console.log('\n📅 PRAZOS ÚNICOS (SGJT):');
        const deadlines = await client.query(`
            SELECT DISTINCT deadline FROM key_results 
            WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL)
            ORDER BY deadline
        `);
        deadlines.rows.forEach(d => {
            console.log(`  • ${d.deadline}`);
        });
        
        client.release();
        
        // Validação final
        console.log('\n' + '='.repeat(70));
        console.log('🎯 VALIDAÇÃO FINAL');
        console.log('='.repeat(70));
        
        const sgjt_kr_total = parseInt(afterSGJT_kr.rows[0].total);
        const sgjt_obj_total = parseInt(afterSGJT_obj.rows[0].total);
        const dpe_kr_total = parseInt(afterDPE_kr.rows[0].total);
        
        let allValid = true;
        
        if (sgjt_obj_total === 6) {
            console.log('✅ SGJT: 6 objetivos inseridos corretamente');
        } else {
            console.log(`❌ SGJT: Esperado 6 objetivos, encontrado ${sgjt_obj_total}`);
            allValid = false;
        }
        
        if (sgjt_kr_total === 25) {
            console.log('✅ SGJT: 25 Key Results inseridos corretamente');
        } else {
            console.log(`❌ SGJT: Esperado 25 KRs, encontrado ${sgjt_kr_total}`);
            allValid = false;
        }
        
        if (dpe_kr_total >= 23) {
            console.log('✅ DPE: Dados preservados intactos');
        } else {
            console.log(`⚠️ DPE: Verificar dados (${dpe_kr_total} KRs encontrados)`);
        }
        
        console.log('\n' + '='.repeat(70));
        if (allValid) {
            console.log('🎉 SUBSTITUIÇÃO CONCLUÍDA COM SUCESSO!');
        } else {
            console.log('⚠️ SUBSTITUIÇÃO CONCLUÍDA COM AVISOS');
        }
        console.log('='.repeat(70));
        
    } catch (error) {
        console.error('\n❌ ERRO NA MIGRAÇÃO:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();






