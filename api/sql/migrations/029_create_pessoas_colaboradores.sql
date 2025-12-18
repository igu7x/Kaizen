-- ===================================================================
-- MIGRATION: CRIAR MÓDULO PESSOAS - COLABORADORES
-- Data: 2025-12-15
-- Descrição: Criar tabela de colaboradores e view de estatísticas
-- ===================================================================

-- Criar tabela de colaboradores
CREATE TABLE IF NOT EXISTS pessoas_colaboradores (
  id SERIAL PRIMARY KEY,
  colaborador VARCHAR(255) NOT NULL,
  unidade_lotacao VARCHAR(255) NOT NULL,
  situacao_funcional VARCHAR(100) NOT NULL,
  nome_cc_fc VARCHAR(255),
  classe_cc_fc VARCHAR(50),
  cargo_efetivo VARCHAR(255),
  classe_efetivo VARCHAR(50),
  diretoria VARCHAR(10) DEFAULT 'SGJT',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deleted_by INTEGER REFERENCES users(id),
  
  CONSTRAINT chk_situacao_funcional CHECK (
    situacao_funcional IN (
      'ESTATUTÁRIO',
      'NOMEADO EM COMISSÃO - INSS',
      'CEDIDO',
      'TERCEIRIZADO',
      'RESIDENTE',
      'ESTAGIÁRIO'
    )
  ),
  
  CONSTRAINT chk_diretoria CHECK (
    diretoria IN ('DIJUD', 'DPE', 'DTI', 'DSTI', 'SGJT')
  )
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_nome 
ON pessoas_colaboradores(colaborador);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_unidade 
ON pessoas_colaboradores(unidade_lotacao);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_situacao 
ON pessoas_colaboradores(situacao_funcional);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_deleted 
ON pessoas_colaboradores(is_deleted);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_diretoria
ON pessoas_colaboradores(diretoria);

-- Comentários
COMMENT ON TABLE pessoas_colaboradores IS 'Cadastro de colaboradores do TJGO';
COMMENT ON COLUMN pessoas_colaboradores.colaborador IS 'Nome completo do colaborador';
COMMENT ON COLUMN pessoas_colaboradores.unidade_lotacao IS 'Unidade onde o colaborador está lotado';
COMMENT ON COLUMN pessoas_colaboradores.situacao_funcional IS 'Situação funcional do colaborador';
COMMENT ON COLUMN pessoas_colaboradores.nome_cc_fc IS 'Nome do Cargo em Comissão ou Função Comissionada';
COMMENT ON COLUMN pessoas_colaboradores.classe_cc_fc IS 'Classe do CC/FC';
COMMENT ON COLUMN pessoas_colaboradores.cargo_efetivo IS 'Nome do cargo efetivo do servidor';
COMMENT ON COLUMN pessoas_colaboradores.classe_efetivo IS 'Classe do cargo efetivo';
COMMENT ON COLUMN pessoas_colaboradores.diretoria IS 'Diretoria à qual o colaborador pertence';

-- Criar view de estatísticas (agrupada por diretoria)
CREATE OR REPLACE VIEW pessoas_estatisticas AS
SELECT 
  diretoria,
  COUNT(*) AS total_colaboradores,
  COUNT(*) FILTER (WHERE situacao_funcional = 'ESTATUTÁRIO') AS total_estatutarios,
  COUNT(*) FILTER (WHERE situacao_funcional = 'CEDIDO') AS total_cedidos,
  COUNT(*) FILTER (WHERE situacao_funcional = 'NOMEADO EM COMISSÃO - INSS') AS total_comissionados,
  COUNT(*) FILTER (WHERE situacao_funcional = 'TERCEIRIZADO') AS total_terceirizados,
  COUNT(*) FILTER (WHERE situacao_funcional = 'RESIDENTE') AS total_residentes,
  COUNT(*) FILTER (WHERE situacao_funcional = 'ESTAGIÁRIO') AS total_estagiarios,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'ESTATUTÁRIO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_estatutarios,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'CEDIDO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_cedidos,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'NOMEADO EM COMISSÃO - INSS')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_comissionados,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'TERCEIRIZADO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_terceirizados,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'RESIDENTE')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_residentes,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'ESTAGIÁRIO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_estagiarios
FROM pessoas_colaboradores
WHERE is_deleted = FALSE
GROUP BY diretoria;

COMMENT ON VIEW pessoas_estatisticas IS 'Estatísticas calculadas automaticamente dos colaboradores por diretoria';

-- Inserir dados iniciais de exemplo (diretoria SGJT)
INSERT INTO pessoas_colaboradores (
  colaborador, unidade_lotacao, situacao_funcional, 
  nome_cc_fc, classe_cc_fc, cargo_efetivo, classe_efetivo, diretoria
) VALUES 
(
  'José João Pedro', 
  'Coordenadoria de Tecnologia da Informação', 
  'ESTATUTÁRIO', 
  'COORDENADOR', 
  'DAE8', 
  'AUXILIAR JUDICIARIO-CATEGORIA DIVERSOS', 
  'F2',
  'SGJT'
),
(
  'Maria do Exemplo', 
  'Núcleo de Sistemas', 
  'NOMEADO EM COMISSÃO - INSS', 
  'Assessor Técnico', 
  'FEC3', 
  NULL, 
  NULL,
  'SGJT'
),
(
  'João Fulano de Tal', 
  'Diretoria de Tecnologia', 
  'CEDIDO', 
  'ASSESSOR ADMINISTRATIVO I', 
  'DAE2', 
  NULL, 
  NULL,
  'SGJT'
),
(
  'Paula Maria', 
  'Gerência de Infraestrutura', 
  'ESTATUTÁRIO', 
  NULL, 
  NULL, 
  'AUXILIAR JUDICIARIO-CATEGORIA DIVERSOS', 
  'F1',
  'SGJT'
),
(
  'Susana do Exemplo', 
  'Núcleo de Suporte', 
  'ESTATUTÁRIO', 
  NULL, 
  NULL, 
  'AUXILIAR JUDICIARIO-CATEGORIA DIVERSOS', 
  'C3',
  'SGJT'
);

-- Verificar criação
DO $$
BEGIN
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
  RAISE NOTICE 'Módulo Pessoas - Colaboradores criado';
  RAISE NOTICE 'Tabela: pessoas_colaboradores';
  RAISE NOTICE 'View: pessoas_estatisticas';
  RAISE NOTICE 'Colaboradores iniciais inseridos: 5';
  RAISE NOTICE '===================================================================';
END $$;

