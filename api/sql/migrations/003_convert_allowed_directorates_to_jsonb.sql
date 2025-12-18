-- =====================================================
-- MIGRATION 003: Converter allowed_directorates para JSONB
-- Data: 2025-12-02
-- Descrição: Backend trata allowed_directorates como JSONB, mas schema é TEXT[]
-- =====================================================

-- Verificar o tipo atual
DO $$
DECLARE
  current_type TEXT;
BEGIN
  SELECT data_type INTO current_type
  FROM information_schema.columns
  WHERE table_name = 'forms' AND column_name = 'allowed_directorates';
  
  IF current_type = 'ARRAY' THEN
    -- Converter de TEXT[] para JSONB
    ALTER TABLE forms
    ALTER COLUMN allowed_directorates TYPE JSONB
    USING CASE
      WHEN allowed_directorates IS NULL THEN '[]'::jsonb
      ELSE to_jsonb(allowed_directorates)
    END;
    
    RAISE NOTICE 'Coluna allowed_directorates convertida de TEXT[] para JSONB';
  ELSIF current_type = 'jsonb' THEN
    RAISE NOTICE 'Coluna allowed_directorates já é JSONB, nada a fazer';
  ELSE
    RAISE NOTICE 'Tipo atual: %, pulando conversão', current_type;
  END IF;
END $$;

-- Comentário
COMMENT ON COLUMN forms.allowed_directorates IS 
'Array JSONB de diretorias permitidas. Use ["ALL"] para permitir todas as diretorias.';

-- Criar índice GIN para queries eficientes com operador ?
CREATE INDEX IF NOT EXISTS idx_forms_allowed_directorates 
ON forms USING GIN (allowed_directorates);

-- Log de execução
SELECT 'Migration 003 executada com sucesso!' as status;
SELECT COUNT(*) as total_forms FROM forms;
