-- =====================================================
-- MIGRATION 004: Adicionar campos de auditoria completa
-- Data: 2025-12-02
-- Descrição: Adicionar updated_by, is_deleted, deleted_at, deleted_by
--            para auditoria completa e soft delete
-- =====================================================

-- Função helper para adicionar campos de auditoria
CREATE OR REPLACE FUNCTION add_audit_columns(target_table TEXT)
RETURNS void AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Verificar se tabela existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = target_table
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE 'Tabela % não existe, pulando...', target_table;
    RETURN;
  END IF;

  -- Adicionar colunas de auditoria
  EXECUTE format('
    ALTER TABLE %I 
    ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
  ', target_table);
  
  -- Criar índice em is_deleted para queries eficientes
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_%I_is_deleted ON %I(is_deleted);
  ', target_table, target_table);
  
  -- Adicionar comentários
  EXECUTE format('
    COMMENT ON COLUMN %I.updated_by IS ''ID do usuário que fez a última atualização'';
    COMMENT ON COLUMN %I.is_deleted IS ''Soft delete: TRUE se registro foi deletado logicamente'';
    COMMENT ON COLUMN %I.deleted_at IS ''Data/hora da deleção lógica'';
    COMMENT ON COLUMN %I.deleted_by IS ''ID do usuário que deletou o registro'';
  ', target_table, target_table, target_table, target_table);
  
  RAISE NOTICE 'Campos de auditoria adicionados à tabela %', target_table;
END;
$$ LANGUAGE plpgsql;

-- Aplicar à tabela users
SELECT add_audit_columns('users');

-- Aplicar a TODAS as tabelas de OKR
SELECT add_audit_columns('objectives');
SELECT add_audit_columns('key_results');
SELECT add_audit_columns('initiatives');

-- Aplicar às tabelas de Programs
SELECT add_audit_columns('programs');

-- Aplicar às tabelas de Execution Controls
SELECT add_audit_columns('execution_controls');

-- Aplicar às tabelas de Forms
SELECT add_audit_columns('forms');
SELECT add_audit_columns('form_sections');
SELECT add_audit_columns('form_fields');
SELECT add_audit_columns('form_responses');
SELECT add_audit_columns('form_answers');

-- Criar function para soft delete
CREATE OR REPLACE FUNCTION soft_delete(
  table_name TEXT,
  record_id INTEGER,
  user_id INTEGER
)
RETURNS void AS $$
BEGIN
  EXECUTE format('
    UPDATE %I
    SET is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = $1
    WHERE id = $2 AND is_deleted = FALSE
  ', table_name)
  USING user_id, record_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro não encontrado ou já deletado: %.id=%', table_name, record_id;
  END IF;
  
  RAISE NOTICE 'Registro %.id=% deletado logicamente por usuário %', table_name, record_id, user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION soft_delete IS 'Deleta logicamente um registro, marcando is_deleted=TRUE';

-- Criar function para restaurar registro deletado
CREATE OR REPLACE FUNCTION restore_deleted(
  table_name TEXT,
  record_id INTEGER
)
RETURNS void AS $$
BEGIN
  EXECUTE format('
    UPDATE %I
    SET is_deleted = FALSE,
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = $1 AND is_deleted = TRUE
  ', table_name)
  USING record_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro não encontrado ou não estava deletado: %.id=%', table_name, record_id;
  END IF;
  
  RAISE NOTICE 'Registro %.id=% restaurado com sucesso', table_name, record_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION restore_deleted IS 'Restaura um registro deletado logicamente';

-- Log de execução
SELECT 'Migration 004 executada com sucesso!' as status;
SELECT 'Campos de auditoria adicionados em todas as tabelas existentes' as info;
SELECT 'Funções criadas: soft_delete(), restore_deleted()' as functions;
