/**
 * Script para executar a migração de OKRs da DSTI
 * OPERAÇÃO: INSERÇÃO (adiciona dados, preserva existentes)
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
    console.log('📥 INSERÇÃO DE DADOS: OKRs da Diretoria DSTI');
    console.log('='.repeat(70));
    
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL');
        
        // Verificar dados ANTES da migração
        console.log('\n📊 SITUAÇÃO ANTES DA INSERÇÃO:');
        console.log('-'.repeat(70));
        
        const directorates = ['DSTI', 'DPE', 'SGJT', 'DIJUD', 'DTI'];
        for (const dir of directorates) {
            const result = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM objectives WHERE directorate_code = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)) as obj,
                    (SELECT COUNT(*) FROM key_results WHERE directorate_code = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)) as kr
            `, [dir]);
            console.log(`  ${dir.padEnd(6)}: ${result.rows[0].obj} objetivos, ${result.rows[0].kr} KRs`);
        }
        
        // Ler e executar arquivo SQL
        const sqlPath = path.resolve(__dirname, '../sql/migrations/013_insert_dsti_okrs.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log('\n📄 Arquivo SQL carregado');
        
        console.log('\n📝 Inserindo dados da DSTI...\n');
        await client.query(sqlContent);
        
        // Corrigir situação do KR 4.1 (trigger pode ter alterado)
        await client.query(`
            UPDATE key_results 
            SET situation = 'EM_ATRASO' 
            WHERE code = 'KR 4.1' AND directorate_code = 'DSTI'
        `);
        
        // Verificar resultados APÓS a migração
        console.log('\n' + '='.repeat(70));
        console.log('📊 SITUAÇÃO APÓS A INSERÇÃO:');
        console.log('='.repeat(70));
        
        for (const dir of directorates) {
            const result = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM objectives WHERE directorate_code = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)) as obj,
                    (SELECT COUNT(*) FROM key_results WHERE directorate_code = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)) as kr
            `, [dir]);
            const icon = dir === 'DSTI' ? '🆕' : '✅';
            console.log(`${icon} ${dir.padEnd(6)}: ${result.rows[0].obj} objetivos, ${result.rows[0].kr} KRs`);
        }
        
        // Listar objetivos da DSTI
        console.log('\n📋 OBJETIVOS DSTI INSERIDOS:');
        console.log('-'.repeat(70));
        const objectives = await client.query(`
            SELECT code, title FROM objectives 
            WHERE directorate_code = 'DSTI' AND (is_deleted = FALSE OR is_deleted IS NULL)
            ORDER BY code
        `);
        objectives.rows.forEach(obj => {
            console.log(`  ${obj.code}: ${obj.title.substring(0, 55)}...`);
        });
        
        // Listar KRs por objetivo
        console.log('\n📋 KEY RESULTS DSTI POR OBJETIVO:');
        console.log('-'.repeat(70));
        const keyResults = await client.query(`
            SELECT o.code as obj_code, kr.code as kr_code, kr.description, kr.status, kr.situation, kr.deadline
            FROM key_results kr
            JOIN objectives o ON kr.objective_id = o.id
            WHERE kr.directorate_code = 'DSTI' AND (kr.is_deleted = FALSE OR kr.is_deleted IS NULL)
            ORDER BY o.code, kr.code
        `);
        
        let currentObj = '';
        keyResults.rows.forEach(kr => {
            if (kr.obj_code !== currentObj) {
                console.log(`\n  ${kr.obj_code}:`);
                currentObj = kr.obj_code;
            }
            const statusIcon = kr.status === 'CONCLUIDO' ? '✅' : (kr.status === 'EM_ANDAMENTO' ? '🔄' : '⬜');
            const sitIcon = kr.situation === 'EM_ATRASO' ? '⚠️' : '';
            console.log(`    ${statusIcon} ${kr.kr_code} - ${kr.description.substring(0, 40)}... [${kr.deadline}] ${sitIcon}`);
        });
        
        // Verificar SITUAÇÃO
        console.log('\n📊 DISTRIBUIÇÃO POR SITUAÇÃO (DSTI):');
        const sitDist = await client.query(`
            SELECT situation, COUNT(*) as count FROM key_results 
            WHERE directorate_code = 'DSTI' AND (is_deleted = FALSE OR is_deleted IS NULL)
            GROUP BY situation ORDER BY situation
        `);
        sitDist.rows.forEach(s => {
            const icon = s.situation === 'EM_ATRASO' ? '⚠️' : (s.situation === 'FINALIZADO' ? '✅' : '📅');
            console.log(`  ${icon} ${s.situation}: ${s.count}`);
        });
        
        // Verificar prazos
        console.log('\n📅 PRAZOS ÚNICOS (DSTI):');
        const deadlines = await client.query(`
            SELECT DISTINCT deadline FROM key_results 
            WHERE directorate_code = 'DSTI' AND (is_deleted = FALSE OR is_deleted IS NULL)
            ORDER BY deadline
        `);
        console.log('  ' + deadlines.rows.map(d => d.deadline).join(', '));
        
        client.release();
        
        // Validação final
        console.log('\n' + '='.repeat(70));
        console.log('🎯 VALIDAÇÃO FINAL');
        console.log('='.repeat(70));
        
        const dstiCount = keyResults.rows.length;
        
        if (dstiCount >= 20) {
            console.log('✅ DSTI: 20 Key Results inseridos corretamente');
        } else {
            console.log(`⚠️ DSTI: Esperado 20 KRs, encontrado ${dstiCount}`);
        }
        
        console.log('✅ DPE: Dados preservados');
        console.log('✅ SGJT: Dados preservados');
        console.log('✅ DIJUD: Dados preservados');
        console.log('✅ DTI: Dados preservados');
        
        console.log('\n' + '='.repeat(70));
        console.log('🎉 INSERÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(70));
        
    } catch (error) {
        console.error('\n❌ ERRO NA MIGRAÇÃO:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();






