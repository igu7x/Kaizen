-- =====================================================
-- MIGRATION 008: Criar tabela program_initiatives
-- Data: 2025-12-02
-- Descrição: Criar tabela para iniciativas de programas
-- =====================================================

-- Criar tabela program_initiatives se não existir
CREATE TABLE IF NOT EXISTS program_initiatives (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    board_status VARCHAR(20) DEFAULT 'A_FAZER' CHECK (board_status IN ('A_FAZER', 'FAZENDO', 'FEITO')),
    priority VARCHAR(10) DEFAULT 'NAO' CHECK (priority IN ('SIM', 'NAO')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar colunas de auditoria se não existirem
ALTER TABLE program_initiatives
    ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_program_initiatives_program_id ON program_initiatives(program_id);
CREATE INDEX IF NOT EXISTS idx_program_initiatives_is_deleted ON program_initiatives(is_deleted);

-- Comentários
COMMENT ON TABLE program_initiatives IS 'Iniciativas vinculadas aos programas';
COMMENT ON COLUMN program_initiatives.program_id IS 'ID do programa ao qual esta iniciativa pertence';
COMMENT ON COLUMN program_initiatives.title IS 'Título da iniciativa';
COMMENT ON COLUMN program_initiatives.description IS 'Descrição detalhada da iniciativa';
COMMENT ON COLUMN program_initiatives.board_status IS 'Status no quadro: A_FAZER, FAZENDO, FEITO';
COMMENT ON COLUMN program_initiatives.priority IS 'Prioridade: SIM ou NAO';

-- Log de execução
SELECT 'Migration 008 executada com sucesso!' as status;



