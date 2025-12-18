-- =====================================================
-- MIGRATION 015: Criação das tabelas de detalhes do PCA
-- Módulo: Contratações de TI - Página de Detalhes
-- Data: 2025-12-04
-- =====================================================

-- =====================================================
-- TABELA 1: pca_item_details (Campos Estáticos)
-- =====================================================

CREATE TABLE IF NOT EXISTS pca_item_details (
    id SERIAL PRIMARY KEY,
    pca_item_id INTEGER NOT NULL UNIQUE REFERENCES pca_items(id) ON DELETE CASCADE,
    validacao_dg_tipo VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (validacao_dg_tipo IN ('Pendente', 'Data')),
    validacao_dg_data DATE,
    fase_atual VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id),
    
    -- Constraint: Se tipo = 'Data', data não pode ser null
    CONSTRAINT check_validacao_data CHECK (
        validacao_dg_tipo = 'Pendente' OR 
        (validacao_dg_tipo = 'Data' AND validacao_dg_data IS NOT NULL)
    ),
    -- Constraint: fase_atual máximo 20 caracteres
    CONSTRAINT check_fase_atual_length CHECK (
        fase_atual IS NULL OR length(fase_atual) <= 20
    )
);

COMMENT ON TABLE pca_item_details IS 'Campos estáticos de detalhes dos itens PCA (Validação DG e Fase Atual)';
COMMENT ON COLUMN pca_item_details.validacao_dg_tipo IS 'Tipo de validação DG: Pendente ou Data';
COMMENT ON COLUMN pca_item_details.validacao_dg_data IS 'Data da validação DG (obrigatório se tipo = Data)';
COMMENT ON COLUMN pca_item_details.fase_atual IS 'Fase atual da contratação (máx 20 caracteres)';

CREATE INDEX IF NOT EXISTS idx_pca_item_details_pca_item ON pca_item_details(pca_item_id);

-- Trigger para updated_at automático
CREATE TRIGGER update_pca_item_details_updated_at 
    BEFORE UPDATE ON pca_item_details
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA 2: pca_checklist_items (Checklist)
-- =====================================================

CREATE TABLE IF NOT EXISTS pca_checklist_items (
    id SERIAL PRIMARY KEY,
    pca_item_id INTEGER NOT NULL REFERENCES pca_items(id) ON DELETE CASCADE,
    item_nome VARCHAR(100) NOT NULL,
    item_ordem INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Não Iniciada' CHECK (status IN ('Concluída', 'Em andamento', 'Não Iniciada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id),
    
    -- Não pode ter item duplicado no mesmo PCA
    UNIQUE(pca_item_id, item_nome)
);

COMMENT ON TABLE pca_checklist_items IS 'Itens de checklist para acompanhamento de contratações';
COMMENT ON COLUMN pca_checklist_items.item_nome IS 'Nome do item do checklist (DOD, ETP, TR, etc.)';
COMMENT ON COLUMN pca_checklist_items.item_ordem IS 'Ordem de exibição do item';
COMMENT ON COLUMN pca_checklist_items.status IS 'Status: Concluída, Em andamento, Não Iniciada';

CREATE INDEX IF NOT EXISTS idx_pca_checklist_pca_item ON pca_checklist_items(pca_item_id);
CREATE INDEX IF NOT EXISTS idx_pca_checklist_ordem ON pca_checklist_items(pca_item_id, item_ordem);

-- Trigger para updated_at automático
CREATE TRIGGER update_pca_checklist_items_updated_at 
    BEFORE UPDATE ON pca_checklist_items
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA 3: pca_pontos_controle (Pontos de Controle)
-- =====================================================

CREATE TABLE IF NOT EXISTS pca_pontos_controle (
    id SERIAL PRIMARY KEY,
    pca_item_id INTEGER NOT NULL REFERENCES pca_items(id) ON DELETE CASCADE,
    ponto_controle VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    proxima_reuniao DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

COMMENT ON TABLE pca_pontos_controle IS 'Pontos de controle para acompanhamento das contratações';
COMMENT ON COLUMN pca_pontos_controle.ponto_controle IS 'Identificador do ponto de controle (PC-1, PC-2, etc.)';
COMMENT ON COLUMN pca_pontos_controle.data IS 'Data do ponto de controle';
COMMENT ON COLUMN pca_pontos_controle.proxima_reuniao IS 'Data da próxima reunião';

CREATE INDEX IF NOT EXISTS idx_pca_pontos_controle_pca_item ON pca_pontos_controle(pca_item_id);

-- Trigger para updated_at automático
CREATE TRIGGER update_pca_pontos_controle_updated_at 
    BEFORE UPDATE ON pca_pontos_controle
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA 4: pca_tarefas (Tarefas)
-- =====================================================

CREATE TABLE IF NOT EXISTS pca_tarefas (
    id SERIAL PRIMARY KEY,
    pca_item_id INTEGER NOT NULL REFERENCES pca_items(id) ON DELETE CASCADE,
    tarefa VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    prazo DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Não iniciada' CHECK (status IN ('Não iniciada', 'Em andamento', 'Concluída')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

COMMENT ON TABLE pca_tarefas IS 'Tarefas vinculadas aos itens PCA';
COMMENT ON COLUMN pca_tarefas.tarefa IS 'Descrição da tarefa';
COMMENT ON COLUMN pca_tarefas.responsavel IS 'Nome do responsável pela tarefa';
COMMENT ON COLUMN pca_tarefas.prazo IS 'Data de prazo da tarefa';
COMMENT ON COLUMN pca_tarefas.status IS 'Status: Não iniciada, Em andamento, Concluída';

CREATE INDEX IF NOT EXISTS idx_pca_tarefas_pca_item ON pca_tarefas(pca_item_id);
CREATE INDEX IF NOT EXISTS idx_pca_tarefas_prazo ON pca_tarefas(prazo);

-- Trigger para updated_at automático
CREATE TRIGGER update_pca_tarefas_updated_at 
    BEFORE UPDATE ON pca_tarefas
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERIR DADOS INICIAIS: pca_item_details
-- Um registro para cada item PCA existente
-- =====================================================

INSERT INTO pca_item_details (pca_item_id, validacao_dg_tipo, validacao_dg_data, fase_atual)
SELECT id, 'Pendente', NULL, NULL
FROM pca_items
WHERE is_deleted = FALSE
ON CONFLICT (pca_item_id) DO NOTHING;

-- =====================================================
-- INSERIR DADOS INICIAIS: pca_checklist_items
-- 6 itens de checklist para cada item PCA existente
-- =====================================================

-- Criar função temporária para inserir checklist
DO $$
DECLARE
    pca_id INTEGER;
BEGIN
    -- Para cada item PCA existente
    FOR pca_id IN SELECT id FROM pca_items WHERE is_deleted = FALSE
    LOOP
        -- Inserir os 6 itens de checklist padrão
        INSERT INTO pca_checklist_items (pca_item_id, item_nome, item_ordem, status)
        VALUES 
            (pca_id, 'DOD', 1, 'Não Iniciada'),
            (pca_id, 'ETP', 2, 'Não Iniciada'),
            (pca_id, 'TR', 3, 'Não Iniciada'),
            (pca_id, 'MGR', 4, 'Não Iniciada'),
            (pca_id, 'Análise de mercado', 5, 'Não Iniciada'),
            (pca_id, 'Distribuição orçamentária', 6, 'Não Iniciada')
        ON CONFLICT (pca_item_id, item_nome) DO NOTHING;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'Tabelas criadas com sucesso!' as status;

SELECT 
    'pca_item_details' as tabela, 
    COUNT(*) as registros 
FROM pca_item_details
UNION ALL
SELECT 
    'pca_checklist_items' as tabela, 
    COUNT(*) as registros 
FROM pca_checklist_items
UNION ALL
SELECT 
    'pca_pontos_controle' as tabela, 
    COUNT(*) as registros 
FROM pca_pontos_controle
UNION ALL
SELECT 
    'pca_tarefas' as tabela, 
    COUNT(*) as registros 
FROM pca_tarefas;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
