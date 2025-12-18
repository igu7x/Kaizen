-- =====================================================
-- MIGRATION 005: Criar tabela de audit log
-- Data: 2025-12-02
-- Descrição: Tabela para registrar TODAS as operações críticas do sistema
--            Tribunal de Justiça exige auditoria completa
-- =====================================================

-- Tabela de audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'EXPORT')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role VARCHAR(20),
  changed_fields JSONB,  -- Campos que foram alterados (para UPDATE)
  old_values JSONB,      -- Valores antigos (para UPDATE/DELETE)
  new_values JSONB,      -- Valores novos (para INSERT/UPDATE)
  ip_address INET,       -- Endereço IP do usuário
  user_agent TEXT,       -- User-Agent do navegador
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índices para performance
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Índices GIN para busca em JSONB
CREATE INDEX idx_audit_log_changed_fields ON audit_log USING GIN (changed_fields);
CREATE INDEX idx_audit_log_old_values ON audit_log USING GIN (old_values);
CREATE INDEX idx_audit_log_new_values ON audit_log USING GIN (new_values);

-- Comentários
COMMENT ON TABLE audit_log IS 'Log de auditoria completo de todas as operações do sistema';
COMMENT ON COLUMN audit_log.table_name IS 'Nome da tabela afetada';
COMMENT ON COLUMN audit_log.record_id IS 'ID do registro afetado';
COMMENT ON COLUMN audit_log.action IS 'Tipo de operação: INSERT, UPDATE, DELETE, etc';
COMMENT ON COLUMN audit_log.changed_fields IS 'Array JSONB dos campos que foram alterados';
COMMENT ON COLUMN audit_log.old_values IS 'Valores antigos do registro (antes da operação)';
COMMENT ON COLUMN audit_log.new_values IS 'Valores novos do registro (depois da operação)';

-- Função para criar entrada de audit log
CREATE OR REPLACE FUNCTION create_audit_log(
  p_table_name VARCHAR(100),
  p_record_id INTEGER,
  p_action VARCHAR(20),
  p_user_id INTEGER,
  p_changed_fields JSONB DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  log_id BIGINT;
  user_info RECORD;
BEGIN
  -- Buscar informações do usuário
  SELECT email, role INTO user_info FROM users WHERE id = p_user_id;
  
  -- Inserir log
  INSERT INTO audit_log (
    table_name, record_id, action, user_id, user_email, user_role,
    changed_fields, old_values, new_values, ip_address, user_agent
  ) VALUES (
    p_table_name, p_record_id, p_action, p_user_id, user_info.email, user_info.role,
    p_changed_fields, p_old_values, p_new_values, p_ip_address, p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_audit_log IS 'Cria entrada de audit log manualmente';

-- Trigger function para audit log automático em tabelas críticas
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields JSONB := '[]'::jsonb;
  old_values JSONB;
  new_values JSONB;
  action_type VARCHAR(20);
BEGIN
  -- Determinar tipo de ação
  IF (TG_OP = 'INSERT') THEN
    action_type := 'INSERT';
    new_values := to_jsonb(NEW);
    old_values := NULL;
  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'UPDATE';
    new_values := to_jsonb(NEW);
    old_values := to_jsonb(OLD);
    
    -- Identificar campos alterados
    -- (Simplificado - em produção, comparar campo a campo)
  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'DELETE';
    old_values := to_jsonb(OLD);
    new_values := NULL;
  END IF;
  
  -- Inserir log
  INSERT INTO audit_log (
    table_name, record_id, action, user_id,
    old_values, new_values
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    action_type,
    COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by, 1), -- Default user 1 se não informado
    old_values,
    new_values
  );
  
  -- Retornar registro apropriado
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_trigger_function IS 'Trigger function para criar audit log automaticamente';

-- Aplicar trigger em tabelas críticas (opcional - pode ter impacto em performance)
-- Descomente para ativar audit log automático
/*
CREATE TRIGGER audit_objectives_trigger
  AFTER INSERT OR UPDATE OR DELETE ON objectives
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_key_results_trigger
  AFTER INSERT OR UPDATE OR DELETE ON key_results
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_forms_trigger
  AFTER INSERT OR UPDATE OR DELETE ON forms
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
*/

-- View para relatório de auditoria
CREATE OR REPLACE VIEW v_audit_report AS
SELECT 
  al.id,
  al.table_name,
  al.record_id,
  al.action,
  al.user_email,
  al.user_role,
  al.created_at,
  al.ip_address,
  CASE 
    WHEN al.action = 'INSERT' THEN 'Criou registro'
    WHEN al.action = 'UPDATE' THEN 'Editou registro'
    WHEN al.action = 'DELETE' THEN 'Deletou registro'
    WHEN al.action = 'SOFT_DELETE' THEN 'Deletou logicamente registro'
    WHEN al.action = 'RESTORE' THEN 'Restaurou registro'
    WHEN al.action = 'LOGIN' THEN 'Login no sistema'
    WHEN al.action = 'LOGOUT' THEN 'Logout do sistema'
    ELSE al.action
  END as action_description
FROM audit_log al
ORDER BY al.created_at DESC;

COMMENT ON VIEW v_audit_report IS 'View formatada para relatórios de auditoria';

-- Log de execução
SELECT 'Migration 005 executada com sucesso!' as status;
SELECT 'Tabela audit_log criada' as info;
SELECT 'Função create_audit_log() criada' as func1;
SELECT 'Função audit_trigger_function() criada' as func2;
SELECT 'View v_audit_report criada' as view;
