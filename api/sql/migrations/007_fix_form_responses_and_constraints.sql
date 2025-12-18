-- =====================================================
-- MIGRATION 007: Corrigir tabela form_responses e constraints
-- Data: 2025-12-02
-- Descrição: 
--   1. Adicionar coluna submitted_at na tabela form_responses
--   2. Remover constraints de FK que causam problemas de integridade
-- =====================================================

-- =====================================================
-- PARTE 1: Adicionar coluna submitted_at
-- =====================================================
ALTER TABLE form_responses
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN form_responses.submitted_at IS 'Data/hora de submissão do formulário';

-- Criar índice para queries por data de submissão
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at 
ON form_responses(submitted_at);

-- =====================================================
-- PARTE 2: Remover FKs problemáticas de deleted_by e updated_by
-- As referências devem permitir NULL e não impedir operações
-- =====================================================

-- Remover constraints existentes de deleted_by em todas as tabelas
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_deleted_by_fkey;
ALTER TABLE form_sections DROP CONSTRAINT IF EXISTS form_sections_deleted_by_fkey;
ALTER TABLE form_fields DROP CONSTRAINT IF EXISTS form_fields_deleted_by_fkey;
ALTER TABLE form_responses DROP CONSTRAINT IF EXISTS form_responses_deleted_by_fkey;
ALTER TABLE form_answers DROP CONSTRAINT IF EXISTS form_answers_deleted_by_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_deleted_by_fkey;
ALTER TABLE objectives DROP CONSTRAINT IF EXISTS objectives_deleted_by_fkey;
ALTER TABLE key_results DROP CONSTRAINT IF EXISTS key_results_deleted_by_fkey;
ALTER TABLE initiatives DROP CONSTRAINT IF EXISTS initiatives_deleted_by_fkey;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_deleted_by_fkey;
ALTER TABLE execution_controls DROP CONSTRAINT IF EXISTS execution_controls_deleted_by_fkey;

-- Remover constraints de updated_by também
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_updated_by_fkey;
ALTER TABLE form_sections DROP CONSTRAINT IF EXISTS form_sections_updated_by_fkey;
ALTER TABLE form_fields DROP CONSTRAINT IF EXISTS form_fields_updated_by_fkey;
ALTER TABLE form_responses DROP CONSTRAINT IF EXISTS form_responses_updated_by_fkey;
ALTER TABLE form_answers DROP CONSTRAINT IF EXISTS form_answers_updated_by_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_updated_by_fkey;
ALTER TABLE objectives DROP CONSTRAINT IF EXISTS objectives_updated_by_fkey;
ALTER TABLE key_results DROP CONSTRAINT IF EXISTS key_results_updated_by_fkey;
ALTER TABLE initiatives DROP CONSTRAINT IF EXISTS initiatives_updated_by_fkey;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_updated_by_fkey;
ALTER TABLE execution_controls DROP CONSTRAINT IF EXISTS execution_controls_updated_by_fkey;

-- Remover constraint de audit_log_user_id_fkey
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;

-- =====================================================
-- PARTE 3: Garantir que os campos são opcionais
-- =====================================================

-- Alterar deleted_by para permitir NULL (sem FK)
ALTER TABLE forms ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE form_sections ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE form_fields ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE form_responses ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE form_answers ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE users ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE objectives ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE key_results ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE initiatives ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE programs ALTER COLUMN deleted_by DROP NOT NULL;
ALTER TABLE execution_controls ALTER COLUMN deleted_by DROP NOT NULL;

-- =====================================================
-- Log de execução
-- =====================================================
SELECT 'Migration 007 executada com sucesso!' as status;
SELECT 'Coluna submitted_at adicionada em form_responses' as info1;
SELECT 'Constraints de FK removidas de deleted_by e updated_by' as info2;



