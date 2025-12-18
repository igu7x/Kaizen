/**
 * Script para executar migrations SQL no banco local
 * Uso: node scripts/run-migration.js <nome_do_arquivo.sql>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Configuração do pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'plataforma_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 2,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

async function runMigration(fileName) {
  console.log('========================================');
  console.log('EXECUTOR DE MIGRATIONS SQL');
  console.log('========================================');
  console.log(`Arquivo: ${fileName}`);
  console.log(`Banco: ${process.env.DB_NAME || 'plataforma_db'}`);
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log('----------------------------------------');

  // Construir caminho do arquivo
  const filePath = path.join(__dirname, '..', 'sql', 'migrations', fileName);
  
  // Verificar se arquivo existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  // Ler conteúdo do arquivo SQL
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`📄 Arquivo carregado (${sql.length} bytes)`);

  const client = await pool.connect();
  
  try {
    console.log('🔌 Conectado ao banco de dados');
    
    // Executar migration
    console.log('⚙️  Executando migration...');
    const result = await client.query(sql);
    
    console.log('✅ Migration executada com sucesso!');
    
    // Se houver resultado de SELECT, mostrar
    if (result && result.rows && result.rows.length > 0) {
      console.log('\n📊 Resultado:');
      console.table(result.rows);
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    if (error.detail) console.error('   Detalhe:', error.detail);
    if (error.hint) console.error('   Dica:', error.hint);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Conexão encerrada');
  }
}

// Verificar argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Uso: node scripts/run-migration.js <nome_do_arquivo.sql>');
  console.log('Exemplo: node scripts/run-migration.js 021_populate_cgov_tic_reunioes.sql');
  process.exit(1);
}

runMigration(args[0]);











