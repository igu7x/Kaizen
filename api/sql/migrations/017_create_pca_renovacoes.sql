-- Migration: Criar tabela de renovações e inserir 12 registros
-- Data: 2025-12-05

-- =============================================================================
-- PARTE 1: CRIAR TABELA pca_renovacoes
-- =============================================================================

CREATE TABLE IF NOT EXISTS pca_renovacoes (
  -- Identificação
  id SERIAL PRIMARY KEY,
  item_pca VARCHAR(50) UNIQUE NOT NULL,
  
  -- Informações principais
  area_demandante VARCHAR(100) NOT NULL,
  gestor_demandante VARCHAR(255) NOT NULL,
  contratada VARCHAR(255) NOT NULL,
  objeto TEXT NOT NULL,
  
  -- Valores e datas
  valor_anual DECIMAL(15,2) NOT NULL,
  data_estimada_contratacao VARCHAR(50) NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'Não Iniciada',
  
  -- Campos de auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deleted_by INTEGER REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT chk_renovacoes_status CHECK (status IN ('Não Iniciada', 'Em andamento', 'Concluída')),
  CONSTRAINT chk_renovacoes_valor_positivo CHECK (valor_anual > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_renovacoes_area ON pca_renovacoes(area_demandante);
CREATE INDEX IF NOT EXISTS idx_renovacoes_status ON pca_renovacoes(status);
CREATE INDEX IF NOT EXISTS idx_renovacoes_gestor ON pca_renovacoes(gestor_demandante);
CREATE INDEX IF NOT EXISTS idx_renovacoes_mes ON pca_renovacoes(data_estimada_contratacao);
CREATE INDEX IF NOT EXISTS idx_renovacoes_deleted ON pca_renovacoes(is_deleted);

-- Comentários para documentação
COMMENT ON TABLE pca_renovacoes IS 'Renovações de contratos do PCA 2026';
COMMENT ON COLUMN pca_renovacoes.item_pca IS 'Número do item do PCA (ex: PCA 236)';
COMMENT ON COLUMN pca_renovacoes.valor_anual IS 'Valor anual do contrato em reais';
COMMENT ON COLUMN pca_renovacoes.data_estimada_contratacao IS 'Mês estimado para renovação';

-- =============================================================================
-- PARTE 2: MODIFICAR TABELAS EXISTENTES PARA SUPORTAR RENOVAÇÕES
-- =============================================================================

-- pca_item_details: Adicionar campo tipo e renovacao_id
ALTER TABLE pca_item_details ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'nova';
ALTER TABLE pca_item_details ADD COLUMN IF NOT EXISTS renovacao_id INTEGER REFERENCES pca_renovacoes(id) ON DELETE CASCADE;
ALTER TABLE pca_item_details ALTER COLUMN pca_item_id DROP NOT NULL;

-- pca_checklist_items: Adicionar campo tipo e renovacao_id
ALTER TABLE pca_checklist_items ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'nova';
ALTER TABLE pca_checklist_items ADD COLUMN IF NOT EXISTS renovacao_id INTEGER REFERENCES pca_renovacoes(id) ON DELETE CASCADE;
ALTER TABLE pca_checklist_items ALTER COLUMN pca_item_id DROP NOT NULL;

-- pca_pontos_controle: Adicionar campo tipo e renovacao_id
ALTER TABLE pca_pontos_controle ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'nova';
ALTER TABLE pca_pontos_controle ADD COLUMN IF NOT EXISTS renovacao_id INTEGER REFERENCES pca_renovacoes(id) ON DELETE CASCADE;
ALTER TABLE pca_pontos_controle ALTER COLUMN pca_item_id DROP NOT NULL;

-- pca_tarefas: Adicionar campo tipo e renovacao_id
ALTER TABLE pca_tarefas ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'nova';
ALTER TABLE pca_tarefas ADD COLUMN IF NOT EXISTS renovacao_id INTEGER REFERENCES pca_renovacoes(id) ON DELETE CASCADE;
ALTER TABLE pca_tarefas ALTER COLUMN pca_item_id DROP NOT NULL;

-- Índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_item_details_tipo ON pca_item_details(tipo);
CREATE INDEX IF NOT EXISTS idx_item_details_renovacao ON pca_item_details(renovacao_id);
CREATE INDEX IF NOT EXISTS idx_checklist_tipo ON pca_checklist_items(tipo);
CREATE INDEX IF NOT EXISTS idx_checklist_renovacao ON pca_checklist_items(renovacao_id);
CREATE INDEX IF NOT EXISTS idx_pontos_controle_tipo ON pca_pontos_controle(tipo);
CREATE INDEX IF NOT EXISTS idx_pontos_controle_renovacao ON pca_pontos_controle(renovacao_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_tipo ON pca_tarefas(tipo);
CREATE INDEX IF NOT EXISTS idx_tarefas_renovacao ON pca_tarefas(renovacao_id);

-- =============================================================================
-- PARTE 3: LIMPAR DADOS PARCIAIS (caso a migração tenha falhado antes)
-- =============================================================================

DELETE FROM pca_checklist_items WHERE tipo = 'renovacao';
DELETE FROM pca_item_details WHERE tipo = 'renovacao';

-- =============================================================================
-- PARTE 4: INSERIR AS 12 RENOVAÇÕES
-- =============================================================================

INSERT INTO pca_renovacoes (
  item_pca, 
  area_demandante, 
  gestor_demandante, 
  contratada, 
  objeto, 
  valor_anual, 
  data_estimada_contratacao,
  status
) VALUES
-- 1. PCA 236 - Certificados SSL
('PCA 236', 'CITEC', 'Adail Antônio Pinto Junior', 
 'X DIGITAL BRASIL LTDA', 
 'Renovação do contrato de fornecimento de 2 (dois) certificados digitais SSL, do tipo "wildcard" OV e do tipo A1 para computadores servidores com a finalidade de atender às necessidades atualmente demandadas.',
 9434.70, 'Maio', 'Não Iniciada'),

-- 2. PCA 237 - Link de Dados OI
('PCA 237', 'CITEC', 'Adail Antônio Pinto Junior',
 'OI S/A',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 2571660.00, 'Julho', 'Não Iniciada'),

-- 3. PCA 238 - Link de Dados Vale do Ribeira
('PCA 238', 'CITEC', 'Adail Antônio Pinto Junior',
 'VALE DO RIBEIRA INTERNET LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 18320.40, 'Agosto', 'Não Iniciada'),

-- 4. PCA 239 - Link de Dados BRFIBRA
('PCA 239', 'CITEC', 'Adail Antônio Pinto Junior',
 'BRFIBRA TELECOMUNICAÇÕES LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 3390949.42, 'Julho', 'Não Iniciada'),

-- 5. PCA 240 - Link de Dados RD Telecom
('PCA 240', 'CITEC', 'Adail Antônio Pinto Junior',
 'RD TELECOM LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 557542.94, 'Julho', 'Não Iniciada'),

-- 6. PCA 241 - Link de Dados Cirion
('PCA 241', 'CITEC', 'Adail Antônio Pinto Junior',
 'CIRION TECHNOLOGIES DO BRASIL LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 1369658.30, 'Julho', 'Não Iniciada'),

-- 7. PCA 242 - Zimbra
('PCA 242', 'CITEC', 'Adail Antônio Pinto Junior',
 'KTREE PENSO LTDA',
 'Renovação do contrato de fornecimento de licenças de software de e-mail Zimbra, com disponibilização de ambiente de homologação (HML) e treinamento.',
 388202.79, 'Setembro', 'Não Iniciada'),

-- 8. PCA 243 - Inteligência Artificial
('PCA 243', 'CITEC', 'Adail Antônio Pinto Junior',
 'NIVA TECNOLOGIA LTDA',
 'Renovação do contrato de serviço de suporte e subscrição de licenças de Inteligência Artificial e solução de Business Intelligence.',
 1659777.00, 'Dezembro', 'Não Iniciada'),

-- 9. PCA 255 - Segurança (Disruptec)
('PCA 255', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira',
 'DISRUPTEC BRASIL S/A',
 'Renovação do contrato de fornecimento de plataforma em nuvem para detecção e remediação de ameaças cibernéticas.',
 1828260.02, 'Janeiro', 'Não Iniciada'),

-- 10. PCA 256 - Suporte Globalweb
('PCA 256', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira',
 'GLOBALWEB S/A',
 'Renovação do contrato de prestação de serviços de suporte às equipes de gestão técnica dos sistemas informatizados, envolvendo as soluções de redes, bancos de dados, storage, backup, virtualização e cloud computing.',
 10917500.00, 'Fevereiro', 'Não Iniciada'),

-- 11. PCA 264 - Gestão de Processos
('PCA 264', 'CES', 'Wilana Carlos da Silva',
 'MLV PRODUTOS E SERV. EM TECNOLOGIA',
 'Renovação do contrato de gestão de processos de desenvolvimento e manutenção de sistemas.',
 200590.00, 'Agosto', 'Não Iniciada'),

-- 12. PCA 272 - Residência em TIC (UFG)
('PCA 272', 'SGJT', 'Gustavo Machado do Prado Dias Maciel',
 'UFG',
 'Contratação de serviços destinados à realização do Programa de Residência em Tecnologia da Informação e Comunicação (TIC) para o Poder Judiciário de Goiás.',
 8355274.08, 'Dezembro', 'Não Iniciada')

ON CONFLICT (item_pca) DO NOTHING;

-- =============================================================================
-- PARTE 5: INSERIR DETAILS PARA AS 12 RENOVAÇÕES
-- =============================================================================

INSERT INTO pca_item_details (
  renovacao_id,
  tipo,
  validacao_dg_tipo,
  validacao_dg_data,
  fase_atual
)
SELECT 
  id,
  'renovacao',
  'Pendente',
  NULL,
  NULL
FROM pca_renovacoes
WHERE NOT EXISTS (
  SELECT 1 FROM pca_item_details WHERE pca_item_details.renovacao_id = pca_renovacoes.id
);

-- =============================================================================
-- PARTE 6: INSERIR CHECKLIST PARA AS 12 RENOVAÇÕES (6 itens cada)
-- =============================================================================

INSERT INTO pca_checklist_items (
  renovacao_id, 
  tipo,
  item_nome, 
  item_ordem, 
  status
)
SELECT 
  r.id,
  'renovacao',
  items.nome,
  items.ordem,
  'Não Iniciada'
FROM pca_renovacoes r
CROSS JOIN (
  VALUES 
    ('DOD', 1),
    ('ETP', 2),
    ('TR', 3),
    ('MGR', 4),
    ('Análise de mercado', 5),
    ('Distribuição orçamentária', 6)
) AS items(nome, ordem)
WHERE NOT EXISTS (
  SELECT 1 FROM pca_checklist_items 
  WHERE pca_checklist_items.renovacao_id = r.id 
  AND pca_checklist_items.item_nome = items.nome
);

-- Verificações
-- SELECT COUNT(*) FROM pca_renovacoes;  -- Deve retornar 12
-- SELECT COUNT(*) FROM pca_item_details WHERE tipo = 'renovacao';  -- Deve retornar 12
-- SELECT COUNT(*) FROM pca_checklist_items WHERE tipo = 'renovacao';  -- Deve retornar 72
