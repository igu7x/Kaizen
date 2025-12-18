import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente do .env APENAS em ambiente local (não produção)
// Em produção (OpenShift), as variáveis são injetadas pelo deployment
if (process.env.NODE_ENV !== 'production') {
  const envPath = resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });
  console.log('📁 .env carregado para ambiente local');
}

// Configuração do banco - suporta variáveis do OpenShift e locais
// OpenShift usa: OPENSHIFT_POSTGRESQL_DB_*
// Local usa: DB_*
const dbHost = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || process.env.DB_HOST || 'localhost';
const dbPort = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || process.env.DB_PORT || '5432';
const dbName = process.env.OPENSHIFT_POSTGRESQL_DB_DATABASE || process.env.DB_NAME || 'plataforma_db';
const dbUser = process.env.OPENSHIFT_POSTGRESQL_DB_USER || process.env.DB_USER || 'postgres';
const dbPassword = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.DB_PASSWORD;

// Log para debug
console.log('🔐 DB_HOST:', dbHost);
console.log('🔐 DB_PORT:', dbPort);
console.log('🔐 DB_NAME:', dbName);
console.log('🔐 DB_USER:', dbUser);

const { Pool } = pg;

// Configuração do pool de conexões
export const pool = new Pool({
    host: dbHost,
    port: parseInt(dbPort),
    database: dbName,
    user: dbUser,
    password: dbPassword,
    max: process.env.NODE_ENV === 'production' ? 10 : 5, // Produção: 10, Dev: 5
    min: 1,  // Apenas 1 conexão mínima ativa
    idleTimeoutMillis: 5000, // 5s - libera conexões ociosas rapidamente
    connectionTimeoutMillis: 5000, // 5s timeout
    allowExitOnIdle: true, // Permite que o processo termine se não houver conexões ativas
});

// Evento de erro no pool
pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool de conexões PostgreSQL:', err);
    if (err.message.includes('terminating connection') || err.message.includes('Connection terminated')) {
        console.error('⚠️  Conexão terminada inesperadamente. Tentando reconectar...');
    } else {
        console.error('🔴 Erro crítico no pool. Reiniciando processo...');
        process.exit(-1);
    }
});

// Monitorar pool (apenas em desenvolvimento) - DESABILITADO para evitar poluir console
if (false && process.env.NODE_ENV === 'development') {
    setInterval(() => {
        console.log('📊 Pool Status:', {
            total: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount
        });
    }, 60000); // Log a cada 60 segundos
}

// Teste de conexão
export async function testConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✓ Conexão com PostgreSQL estabelecida com sucesso!');
        console.log('  Timestamp do servidor:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('✗ Erro ao conectar com PostgreSQL:', error);
        return false;
    }
}

// Query helper com prepared statements (previne SQL injection)
export async function query(text: string, params?: any[]) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;

        // Log de queries desabilitado para não poluir o console
        // if (process.env.NODE_ENV === 'development') {
        //     console.log('Query executada:', { text, duration: `${duration}ms`, rows: res.rowCount });
        // }

        return res;
    } catch (error) {
        console.error('Erro na query:', { text, error });
        throw error;
    }
}

// Transaction helper
export async function transaction(callback: (client: pg.PoolClient) => Promise<any>) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Finalizar pool (útil para testes e scripts)
export async function closePool() {
    await pool.end();
    console.log('Pool de conexões PostgreSQL finalizado');
}

// Exportar configuração
export const dbConfig = {
    host: dbHost,
    port: parseInt(dbPort),
    database: dbName,
    user: dbUser,
};

export default {
    pool,
    query,
    transaction,
    testConnection,
    closePool,
    dbConfig
};
