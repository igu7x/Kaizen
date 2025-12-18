import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'plataforma_sgjt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addSGJT() {
  let client;
  
  try {
    console.log('==========================================');
    console.log('ADICIONANDO ORGANOGRAMA SGJT');
    console.log('==========================================\n');
    
    client = await pool.connect();
    console.log('✓ Conectado ao banco\n');
    
    const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '032_add_organograma_sgjt.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Executando SQL...\n');
    await client.query(migrationSQL);
    
    console.log('\n✅ ORGANOGRAMA SGJT ADICIONADO!\n');
    
    // Verificar
    const result = await client.query(`
      SELECT COUNT(*) as total 
      FROM pessoas_organograma_gestores 
      WHERE diretoria = 'SGJT' AND ativo = TRUE
    `);
    
    console.log(`✓ ${result.rows[0].total} registros SGJT no banco\n`);
    console.log('==========================================\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    throw error;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

addSGJT()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));







