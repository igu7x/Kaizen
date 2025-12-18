-- Migration: 006_fix_field_types.sql
-- Data: 2025-12-02
-- Descrição: Corrige tipos de campo para usar os tipos do frontend consistentemente
-- E atualiza a constraint para aceitar mais tipos

-- 1. Remover a constraint antiga
ALTER TABLE form_fields DROP CONSTRAINT IF EXISTS form_fields_field_type_check;

-- 2. Atualizar tipos existentes para o formato do frontend
UPDATE form_fields SET field_type = 'SHORT_TEXT' WHERE field_type IN ('TEXT', 'EMAIL', 'PHONE', 'URL');
UPDATE form_fields SET field_type = 'LONG_TEXT' WHERE field_type IN ('TEXTAREA');
UPDATE form_fields SET field_type = 'MULTIPLE_CHOICE' WHERE field_type IN ('RADIO');
UPDATE form_fields SET field_type = 'CHECKBOXES' WHERE field_type IN ('CHECKBOX');
UPDATE form_fields SET field_type = 'DROPDOWN' WHERE field_type IN ('SELECT');
-- SCALE, DATE, NUMBER já estão corretos

-- 3. Adicionar nova constraint mais flexível
ALTER TABLE form_fields ADD CONSTRAINT form_fields_field_type_check 
CHECK (field_type IN (
    'SHORT_TEXT', 
    'LONG_TEXT', 
    'MULTIPLE_CHOICE', 
    'CHECKBOXES', 
    'SCALE', 
    'DATE', 
    'NUMBER', 
    'DROPDOWN',
    -- Tipos legados (para compatibilidade)
    'TEXT',
    'TEXTAREA',
    'RADIO',
    'CHECKBOX',
    'SELECT',
    'EMAIL',
    'PHONE',
    'FILE'
));

-- 4. Adicionar comentário atualizado
COMMENT ON COLUMN form_fields.field_type IS 'Tipo do campo: SHORT_TEXT, LONG_TEXT, MULTIPLE_CHOICE, CHECKBOXES, SCALE, DATE, NUMBER, DROPDOWN';

-- Log da migração
DO $$
BEGIN
    RAISE NOTICE 'Migration 006_fix_field_types.sql executada com sucesso!';
    RAISE NOTICE 'Tipos de campo atualizados para formato consistente do frontend.';
END $$;



