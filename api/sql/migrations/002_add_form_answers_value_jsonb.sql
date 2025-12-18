-- =====================================================
-- MIGRATION 002: Adicionar coluna value (JSONB) em form_answers
-- Data: 2025-12-02
-- Descrição: Backend espera coluna 'value' JSONB
-- =====================================================

-- Adicionar coluna value (JSONB) se não existir
ALTER TABLE form_answers
ADD COLUMN IF NOT EXISTS value JSONB;

-- Comentário
COMMENT ON COLUMN form_answers.value IS 
'Valor da resposta em formato JSONB. Pode ser string, number, array, etc.';

-- Criar índice GIN para queries eficientes
CREATE INDEX IF NOT EXISTS idx_form_answers_value ON form_answers USING GIN (value);

-- Log de execução
SELECT 'Migration 002 executada com sucesso!' as status;
SELECT COUNT(*) as total_answers FROM form_answers WHERE value IS NOT NULL;
