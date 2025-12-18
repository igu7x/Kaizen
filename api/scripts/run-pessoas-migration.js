/**
 * Script para executar a migração do módulo Pessoas
 * 
 * Uso: node scripts/run-pessoas-migration.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

async function runMigration() {
    console.log('');
    console.log('='.repeat(60));
    console.log('  MIGRAÇÃO: MÓDULO PESSOAS - COLABORADORES');
    console.log('='.repeat(60));
    console.log('');

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'plataforma_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log('📡 Conectando ao banco de dados...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'plataforma_db'}`);
        console.log('');

        // Ler arquivo de migração
        const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '029_create_pessoas_colaboradores.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Arquivo de migração encontrado');
        console.log(`   ${migrationPath}`);
        console.log('');

        // Executar migração
        console.log('🔄 Executando migração...');
        console.log('');

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            await client.query(migrationSQL);
            await client.query('COMMIT');
            
            console.log('✅ Migração executada com sucesso!');
            console.log('');
            
            // Verificar dados
            const countResult = await client.query('SELECT COUNT(*) as total FROM pessoas_colaboradores WHERE is_deleted = FALSE');
            const statsResult = await client.query('SELECT * FROM pessoas_estatisticas');
            
            console.log('📊 Verificação:');
            console.log(`   Colaboradores inseridos: ${countResult.rows[0].total}`);
            
            if (statsResult.rows.length > 0) {
                const stats = statsResult.rows[0];
                console.log(`   Total (via view): ${stats.total_colaboradores}`);
                console.log(`   Estatutários: ${stats.total_estatutarios}`);
                console.log(`   Cedidos: ${stats.total_cedidos}`);
                console.log(`   Comissionados: ${stats.total_comissionados}`);
            }
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('');
        console.error('❌ Erro ao executar migração:');
        console.error(error.message);
        
        if (error.message.includes('already exists')) {
            console.log('');
            console.log('ℹ️  A tabela já existe. Migração pode já ter sido executada.');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('  ✓ MIGRAÇÃO FINALIZADA');
    console.log('='.repeat(60));
    console.log('');
}

runMigration();









