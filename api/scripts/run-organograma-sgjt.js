/**
 * Script para popular o organograma SGJT com dados de exemplo
 * Usa os 5 colaboradores já cadastrados no sistema
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function main() {
    console.log('='.repeat(60));
    console.log('POPULAR ORGANOGRAMA SGJT');
    console.log('='.repeat(60));
    
    // Configuração do banco
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'plataforma_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    try {
        console.log('\n📦 Conectando ao banco de dados...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'plataforma_db'}`);
        
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida!\n');
        
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, '../sql/migrations/033_popular_organograma_sgjt_exemplo.sql');
        console.log(`📄 Lendo migration: ${sqlPath}`);
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Arquivo não encontrado: ${sqlPath}`);
        }
        
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`✅ Arquivo lido (${sql.length} bytes)\n`);
        
        // Executar migration
        console.log('🚀 Executando migration...\n');
        await client.query(sql);
        
        console.log('✅ Migration executada com sucesso!\n');
        
        // Verificar resultado
        console.log('📊 Verificando resultado...\n');
        
        const resultado = await client.query(`
            SELECT 
                linha_organograma,
                nome_area,
                nome_gestor,
                nome_cargo,
                subordinacao_id
            FROM pessoas_organograma_gestores
            WHERE diretoria = 'SGJT' AND ativo = TRUE
            ORDER BY linha_organograma, ordem_exibicao
        `);
        
        console.log('Organograma SGJT:');
        console.log('-'.repeat(60));
        
        resultado.rows.forEach(row => {
            const indent = '  '.repeat(row.linha_organograma - 1);
            console.log(`${indent}[Nível ${row.linha_organograma}] ${row.nome_area}`);
            console.log(`${indent}        ${row.nome_gestor} - ${row.nome_cargo}`);
        });
        
        console.log('-'.repeat(60));
        console.log(`Total: ${resultado.rows.length} registros\n`);
        
        // Estatísticas por nível
        const stats = await client.query(`
            SELECT 
                linha_organograma,
                COUNT(*) as total
            FROM pessoas_organograma_gestores
            WHERE diretoria = 'SGJT' AND ativo = TRUE
            GROUP BY linha_organograma
            ORDER BY linha_organograma
        `);
        
        console.log('Estatísticas por nível:');
        stats.rows.forEach(row => {
            const nomes = { 1: 'Diretoria', 2: 'Coordenadoria', 3: 'Divisão', 4: 'Núcleo' };
            console.log(`  Nível ${row.linha_organograma} (${nomes[row.linha_organograma] || 'Outro'}): ${row.total}`);
        });
        
        client.release();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ORGANOGRAMA SGJT CRIADO COM SUCESSO!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        if (error.detail) {
            console.error('   Detalhe:', error.detail);
        }
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();






