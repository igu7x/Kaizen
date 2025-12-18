/**
 * Script para executar a migração que adiciona diretoria aos colaboradores
 * 
 * Uso: node scripts/run-diretoria-migration.js
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
    console.log('  MIGRAÇÃO: ADICIONAR DIRETORIA AOS COLABORADORES');
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
        const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '030_add_diretoria_to_pessoas_colaboradores.sql');
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
            const countResult = await client.query(`
                SELECT diretoria, COUNT(*) as total 
                FROM pessoas_colaboradores 
                WHERE is_deleted = FALSE 
                GROUP BY diretoria 
                ORDER BY diretoria
            `);
            
            console.log('📊 Colaboradores por diretoria:');
            countResult.rows.forEach(row => {
                console.log(`   ${row.diretoria}: ${row.total}`);
            });
            
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
            console.log('ℹ️  O campo/constraint já existe. Migração pode já ter sido executada.');
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









