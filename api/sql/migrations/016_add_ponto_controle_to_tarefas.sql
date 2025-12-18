-- Migration: Adicionar relacionamento entre Tarefas e Pontos de Controle
-- Data: 2025-12-05
-- Descrição: Adiciona coluna ponto_controle_id na tabela pca_tarefas
-- IMPORTANTE: Esta migration NÃO deleta dados existentes

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pca_tarefas' 
        AND column_name = 'ponto_controle_id'
    ) THEN
        -- Adicionar coluna ponto_controle_id (NULLABLE para não afetar dados existentes)
        ALTER TABLE pca_tarefas 
        ADD COLUMN ponto_controle_id INTEGER;
        
        RAISE NOTICE 'Coluna ponto_controle_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna ponto_controle_id já existe';
    END IF;
END $$;

-- Adicionar foreign key (apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tarefas_ponto_controle'
    ) THEN
        ALTER TABLE pca_tarefas
        ADD CONSTRAINT fk_tarefas_ponto_controle
        FOREIGN KEY (ponto_controle_id)
        REFERENCES pca_pontos_controle(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key fk_tarefas_ponto_controle adicionada';
    ELSE
        RAISE NOTICE 'Foreign key já existe';
    END IF;
END $$;

-- Criar índice (apenas se não existir)
CREATE INDEX IF NOT EXISTS idx_tarefas_ponto_controle 
ON pca_tarefas(ponto_controle_id);

-- Comentário para documentação
COMMENT ON COLUMN pca_tarefas.ponto_controle_id IS 
'ID do Ponto de Controle ao qual esta tarefa pertence. NULL = tarefa órfã (sem PC associado).';


























