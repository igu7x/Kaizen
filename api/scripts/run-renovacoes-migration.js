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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração de Renovações...\n');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '017_create_pca_renovacoes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar a migração
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migração executada com sucesso!\n');
    
    // Verificar resultados
    const renovacoesCount = await client.query('SELECT COUNT(*) FROM pca_renovacoes');
    console.log(`📊 Total de renovações: ${renovacoesCount.rows[0].count}`);
    
    const detailsCount = await client.query("SELECT COUNT(*) FROM pca_item_details WHERE tipo = 'renovacao'");
    console.log(`📊 Total de details (renovações): ${detailsCount.rows[0].count}`);
    
    const checklistCount = await client.query("SELECT COUNT(*) FROM pca_checklist_items WHERE tipo = 'renovacao'");
    console.log(`📊 Total de checklist items (renovações): ${checklistCount.rows[0].count}`);
    
    // Mostrar resumo por área
    const porArea = await client.query(`
      SELECT 
        area_demandante, 
        COUNT(*) as quantidade,
        SUM(valor_anual) as valor_total
      FROM pca_renovacoes
      GROUP BY area_demandante
      ORDER BY valor_total DESC
    `);
    
    console.log('\n📋 Resumo por área:');
    porArea.rows.forEach(row => {
      console.log(`   ${row.area_demandante}: ${row.quantidade} renovações, R$ ${Number(row.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    });
    
    // Total geral
    const total = await client.query('SELECT SUM(valor_anual) as total FROM pca_renovacoes');
    console.log(`\n💰 Valor total: R$ ${Number(total.rows[0].total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migração:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n🎉 Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na migração:', error);
    process.exit(1);
  });
