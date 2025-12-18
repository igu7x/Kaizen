-- =====================================================
-- MIGRATION 001: Corrigir tipos de campo em form_fields
-- Data: 2025-12-02
-- Descrição: Adicionar tipos do frontend ao CHECK constraint
-- =====================================================

-- Remover constraint antiga
ALTER TABLE form_fields
DROP CONSTRAINT IF EXISTS form_fields_field_type_check;

-- Adicionar nova constraint com TODOS os tipos aceitos
ALTER TABLE form_fields
ADD CONSTRAINT form_fields_field_type_check CHECK (
  field_type IN (
    -- Tipos do frontend (preferidos)
    'SHORT_TEXT',
    'LONG_TEXT',
    'MULTIPLE_CHOICE',
    'CHECKBOXES',
    'SCALE',
    'DATE',
    'NUMBER',
    'DROPDOWN',
    -- Tipos mapeados do backend (compatibilidade)
    'TEXT',
    'TEXTAREA',
    'RADIO',
    'CHECKBOX',
    'SELECT',
    'EMAIL',
    'PHONE',
    'FILE'
  )
);

-- Comentário
COMMENT ON CONSTRAINT form_fields_field_type_check ON form_fields IS 
'Permite tipos do frontend (SHORT_TEXT, etc) e tipos mapeados do backend (TEXT, etc)';

-- Log de execução
SELECT 'Migration 001 executada com sucesso!' as status;
