/**
 * EXECUTOR DE MIGRATIONS
 * 
 * Script para executar migrations em ordem sequencial
 * Mantém controle de quais migrations já foram executadas
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

// Configuração do pool de conexão
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

// Criar tabela de controle de migrations
async function createMigrationsTable() {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(migration_name);
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at ON schema_migrations(executed_at DESC);
    `);
        console.log('✓ Tabela schema_migrations criada/verificada');
    } catch (error) {
        console.error('Erro ao criar tabela de migrations:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Verificar se migration já foi executada
async function isMigrationExecuted(migrationName) {
    const result = await pool.query(
        'SELECT * FROM schema_migrations WHERE migration_name = $1 AND success = TRUE',
        [migrationName]
    );
    return result.rows.length > 0;
}

// Registrar migration executada
async function registerMigration(migrationName, executionTimeMs, success, errorMessage = null) {
    await pool.query(
        `INSERT INTO schema_migrations (migration_name, execution_time_ms, success, error_message)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (migration_name) DO UPDATE
     SET executed_at = NOW(), execution_time_ms = $2, success = $3, error_message = $4`,
        [migrationName, executionTimeMs, success, errorMessage]
    );
}

// Executar arquivo SQL
async function executeSqlFile(filePath) {
    const sql = await fs.readFile(filePath, 'utf-8');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Executar todas as migrations
async function runMigrations() {
    console.log('\n========================================');
    console.log('  EXECUTOR DE MIGRATIONS');
    console.log('========================================\n');

    try {
        // Testar conexão
        await pool.query('SELECT NOW()');
        console.log('✓ Conexão com PostgreSQL estabelecida\n');

        // Criar tabela de controle
        await createMigrationsTable();

        // Listar arquivos de migration
        const migrationsDir = path.join(__dirname, '..', 'sql', 'migrations');

        // Verificar se diretório existe
        try {
            await fs.access(migrationsDir);
        } catch {
            console.error(`❌ Diretório de migrations não encontrado: ${migrationsDir}`);
            process.exit(1);
        }

        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ordenar por nome (001_, 002_, etc)

        console.log(`Encontradas ${migrationFiles.length} migrations\n`);

        if (migrationFiles.length === 0) {
            console.log('Nenhuma migration para executar.');
            return;
        }

        let executed = 0;
        let skipped = 0;
        let failed = 0;

        for (const file of migrationFiles) {
            const migrationName = path.basename(file, '.sql');
            const filePath = path.join(migrationsDir, file);

            // Verificar se já foi executada
            if (await isMigrationExecuted(migrationName)) {
                console.log(`⊘ ${migrationName} - JÁ EXECUTADA (pulando)`);
                skipped++;
                continue;
            }

            // Executar migration
            console.log(`→ Executando ${migrationName}...`);
            const startTime = Date.now();

            try {
                await executeSqlFile(filePath);
                const executionTime = Date.now() - startTime;

                await registerMigration(migrationName, executionTime, true);
                console.log(`✓ ${migrationName} - SUCESSO (${executionTime}ms)`);
                executed++;
            } catch (error) {
                const executionTime = Date.now() - startTime;
                await registerMigration(migrationName, executionTime, false, error.message);
                console.error(`✗ ${migrationName} - FALHOU`);
                console.error(`  Erro: ${error.message}`);
                failed++;

                // Parar execução em caso de erro
                break;
            }
        }

        console.log('\n========================================');
        console.log('  RESUMO');
        console.log('========================================');
        console.log(`Executadas: ${executed}`);
        console.log(`Puladas:    ${skipped}`);
        console.log(`Falharam:   ${failed}`);
        console.log('========================================\n');

        if (failed > 0) {
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Erro ao executar migrations:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Executar
runMigrations();
