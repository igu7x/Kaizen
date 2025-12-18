import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'plataforma_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('🔄 Iniciando seed das renovações...\n');

    const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '018_seed_pca_renovacoes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    const countRen = await client.query('SELECT COUNT(*) FROM pca_renovacoes');
    const countDetails = await client.query("SELECT COUNT(*) FROM pca_item_details WHERE tipo = 'renovacao'");
    const countChecklist = await client.query("SELECT COUNT(*) FROM pca_checklist_items WHERE tipo = 'renovacao'");

    console.log(`✅ Renovações: ${countRen.rows[0].count}`);
    console.log(`✅ Details (renovação): ${countDetails.rows[0].count}`);
    console.log(`✅ Checklist (renovação): ${countChecklist.rows[0].count}`);

    console.log('\n🎉 Seed concluído!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no seed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


























