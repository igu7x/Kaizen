import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Arquivo .env carregado:', envPath);
} else {
  console.warn('⚠ Arquivo .env não encontrado:', envPath);
}

const { Pool } = pg;

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'plataforma_sgjt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  let client;
  
  try {
    console.log('==========================================');
    console.log('EXECUTANDO MIGRATION: ORGANOGRAMA COMPLETO');
    console.log('==========================================\n');
    
    // Mostrar configuração (sem senha)
    console.log('🔌 Configuração do banco:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 5432}`);
    console.log(`   Database: ${process.env.DB_NAME || 'plataforma_sgjt'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
    console.log('');
    
    console.log('🔗 Conectando ao banco de dados...');
    client = await pool.connect();
    console.log('✓ Conexão estabelecida!\n');
    
    // Ler o arquivo SQL
    const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '031_create_organograma_completo.sql');
    console.log(`📄 Lendo arquivo: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Arquivo não encontrado: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✓ Arquivo carregado (${migrationSQL.length} caracteres)\n`);
    
    console.log('🔄 Executando SQL...');
    await client.query(migrationSQL);
    
    console.log('\n✅ MIGRATION EXECUTADA COM SUCESSO!\n');
    console.log('Tabela criada: pessoas_organograma_gestores');
    console.log('View criada: pessoas_organograma_hierarquia');
    console.log('Dados iniciais: 16 registros (DPE)');
    console.log('\n==========================================\n');
    
  } catch (error) {
    console.error('\n❌ ERRO ao executar migration:');
    console.error('   Mensagem:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalhes:', error.detail || 'N/A');
    if (error.stack) {
      console.error('\n   Stack:', error.stack);
    }
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Executar
runMigration()
  .then(() => {
    console.log('✓ Processo finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Processo finalizado com erro');
    process.exit(1);
  });

