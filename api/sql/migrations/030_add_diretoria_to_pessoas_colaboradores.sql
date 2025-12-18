-- ===================================================================
-- MIGRATION: ADICIONAR DIRETORIA AOS COLABORADORES
-- Data: 2025-12-15
-- Descrição: Adicionar campo diretoria para filtrar colaboradores por área
-- ===================================================================

-- Adicionar coluna diretoria
ALTER TABLE pessoas_colaboradores 
ADD COLUMN IF NOT EXISTS diretoria VARCHAR(10) DEFAULT 'SGJT';

-- Criar constraint para valores válidos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_diretoria'
    ) THEN
        ALTER TABLE pessoas_colaboradores 
        ADD CONSTRAINT chk_diretoria CHECK (
            diretoria IN ('DIJUD', 'DPE', 'DTI', 'DSTI', 'SGJT')
        );
    END IF;
END $$;

-- Criar índice para a coluna diretoria
CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_diretoria 
ON pessoas_colaboradores(diretoria);

-- Atualizar registros existentes para SGJT
UPDATE pessoas_colaboradores 
SET diretoria = 'SGJT' 
WHERE diretoria IS NULL;

-- Comentário
COMMENT ON COLUMN pessoas_colaboradores.diretoria IS 'Diretoria à qual o colaborador pertence';

-- Recriar a view de estatísticas para incluir diretoria
DROP VIEW IF EXISTS pessoas_estatisticas;

CREATE VIEW pessoas_estatisticas AS
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

-- Verificar
DO $$
BEGIN
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'MIGRATION 030 EXECUTADA COM SUCESSO!';
  RAISE NOTICE 'Campo diretoria adicionado à tabela pessoas_colaboradores';
  RAISE NOTICE 'View pessoas_estatisticas atualizada com agrupamento por diretoria';
  RAISE NOTICE '===================================================================';
END $$;









