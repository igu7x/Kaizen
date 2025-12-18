-- ============================================================
-- MIGRAÇÃO 032: Sistema de Permissões por Diretoria
-- ============================================================
-- Adiciona campo diretoria no usuário e cria sistema de permissões
-- para controlar acesso às abas da plataforma por diretoria
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ADICIONAR COLUNA DIRETORIA NA TABELA USERS
-- ============================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS diretoria VARCHAR(10) DEFAULT 'SGJT';

-- Comentário
COMMENT ON COLUMN users.diretoria IS 'Diretoria do usuário: SGJT, DPE, DIJUD, DTI, DSTI';

-- Índice para busca por diretoria
CREATE INDEX IF NOT EXISTS idx_users_diretoria ON users(diretoria);

-- ============================================================
-- 2. CRIAR TABELA DE ABAS DA PLATAFORMA
-- ============================================================
CREATE TABLE IF NOT EXISTS plataforma_abas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE plataforma_abas IS 'Catálogo de todas as abas/módulos da plataforma';

-- Inserir abas da plataforma
INSERT INTO plataforma_abas (codigo, nome, descricao, icone, ordem) VALUES
    ('dashboard', 'Dashboard', 'Painel inicial com visão geral', 'LayoutDashboard', 1),
    ('gestao_estrategica', 'Gestão Estratégica', 'OKRs e monitoramento estratégico', 'Target', 2),
    ('contratacoes', 'Contratações de TI', 'Gestão de contratações e PCA', 'FileText', 3),
    ('comites', 'Comitês', 'Gestão de comitês e reuniões', 'Users', 4),
    ('pessoas', 'Pessoas', 'Painel de colaboradores e organograma', 'UserCircle', 5),
    ('formularios', 'Formulários', 'Formulários dinâmicos', 'ClipboardList', 6),
    ('administracao', 'Administração', 'Gestão de usuários e configurações', 'Settings', 7),
    ('sgjt', 'SGJT', 'Painel de controle SGJT - Gerenciar permissões', 'Shield', 8)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ordem = EXCLUDED.ordem;

-- ============================================================
-- 3. CRIAR TABELA DE PERMISSÕES POR DIRETORIA
-- ============================================================
CREATE TABLE IF NOT EXISTS permissoes_diretoria (
    id SERIAL PRIMARY KEY,
    diretoria VARCHAR(10) NOT NULL,
    aba_codigo VARCHAR(50) NOT NULL REFERENCES plataforma_abas(codigo) ON DELETE CASCADE,
    pode_acessar BOOLEAN DEFAULT FALSE,
    apenas_propria_diretoria BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INTEGER REFERENCES users(id),
    UNIQUE(diretoria, aba_codigo)
);

COMMENT ON TABLE permissoes_diretoria IS 'Permissões de acesso às abas por diretoria';
COMMENT ON COLUMN permissoes_diretoria.apenas_propria_diretoria IS 'Se TRUE, usuário só vê dados da própria diretoria';

CREATE INDEX IF NOT EXISTS idx_permissoes_diretoria ON permissoes_diretoria(diretoria);
CREATE INDEX IF NOT EXISTS idx_permissoes_aba ON permissoes_diretoria(aba_codigo);

-- ============================================================
-- 4. INSERIR PERMISSÕES PADRÃO POR DIRETORIA
-- ============================================================

-- SGJT - Acesso total a tudo
INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria) VALUES
    ('SGJT', 'dashboard', TRUE, FALSE),
    ('SGJT', 'gestao_estrategica', TRUE, FALSE),
    ('SGJT', 'contratacoes', TRUE, FALSE),
    ('SGJT', 'comites', TRUE, FALSE),
    ('SGJT', 'pessoas', TRUE, FALSE),
    ('SGJT', 'formularios', TRUE, FALSE),
    ('SGJT', 'administracao', TRUE, FALSE),
    ('SGJT', 'sgjt', TRUE, FALSE)
ON CONFLICT (diretoria, aba_codigo) DO UPDATE SET
    pode_acessar = EXCLUDED.pode_acessar,
    apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria;

-- DPE - Sem contratações, dados da própria diretoria
INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria) VALUES
    ('DPE', 'dashboard', TRUE, TRUE),
    ('DPE', 'gestao_estrategica', TRUE, TRUE),
    ('DPE', 'contratacoes', FALSE, TRUE),
    ('DPE', 'comites', TRUE, FALSE),
    ('DPE', 'pessoas', TRUE, TRUE),
    ('DPE', 'formularios', TRUE, TRUE),
    ('DPE', 'administracao', TRUE, TRUE),
    ('DPE', 'sgjt', FALSE, FALSE)
ON CONFLICT (diretoria, aba_codigo) DO UPDATE SET
    pode_acessar = EXCLUDED.pode_acessar,
    apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria;

-- DIJUD - Sem contratações, dados da própria diretoria
INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria) VALUES
    ('DIJUD', 'dashboard', TRUE, TRUE),
    ('DIJUD', 'gestao_estrategica', TRUE, TRUE),
    ('DIJUD', 'contratacoes', FALSE, TRUE),
    ('DIJUD', 'comites', TRUE, FALSE),
    ('DIJUD', 'pessoas', TRUE, TRUE),
    ('DIJUD', 'formularios', TRUE, TRUE),
    ('DIJUD', 'administracao', TRUE, TRUE),
    ('DIJUD', 'sgjt', FALSE, FALSE)
ON CONFLICT (diretoria, aba_codigo) DO UPDATE SET
    pode_acessar = EXCLUDED.pode_acessar,
    apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria;

-- DTI - Com contratações, dados da própria diretoria
INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria) VALUES
    ('DTI', 'dashboard', TRUE, TRUE),
    ('DTI', 'gestao_estrategica', TRUE, TRUE),
    ('DTI', 'contratacoes', TRUE, TRUE),
    ('DTI', 'comites', TRUE, FALSE),
    ('DTI', 'pessoas', TRUE, TRUE),
    ('DTI', 'formularios', TRUE, TRUE),
    ('DTI', 'administracao', TRUE, TRUE),
    ('DTI', 'sgjt', FALSE, FALSE)
ON CONFLICT (diretoria, aba_codigo) DO UPDATE SET
    pode_acessar = EXCLUDED.pode_acessar,
    apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria;

-- DSTI - Com contratações, dados da própria diretoria
INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria) VALUES
    ('DSTI', 'dashboard', TRUE, TRUE),
    ('DSTI', 'gestao_estrategica', TRUE, TRUE),
    ('DSTI', 'contratacoes', TRUE, TRUE),
    ('DSTI', 'comites', TRUE, FALSE),
    ('DSTI', 'pessoas', TRUE, TRUE),
    ('DSTI', 'formularios', TRUE, TRUE),
    ('DSTI', 'administracao', TRUE, TRUE),
    ('DSTI', 'sgjt', FALSE, FALSE)
ON CONFLICT (diretoria, aba_codigo) DO UPDATE SET
    pode_acessar = EXCLUDED.pode_acessar,
    apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria;

-- ============================================================
-- 5. VIEW PARA CONSULTAR PERMISSÕES DE USUÁRIO
-- ============================================================
CREATE OR REPLACE VIEW vw_usuario_permissoes AS
SELECT 
    u.id AS usuario_id,
    u.name AS usuario_nome,
    u.email AS usuario_email,
    u.role AS usuario_role,
    u.diretoria AS usuario_diretoria,
    pa.codigo AS aba_codigo,
    pa.nome AS aba_nome,
    pa.icone AS aba_icone,
    pa.ordem AS aba_ordem,
    COALESCE(pd.pode_acessar, FALSE) AS pode_acessar,
    COALESCE(pd.apenas_propria_diretoria, TRUE) AS apenas_propria_diretoria,
    -- Admin da própria diretoria pode acessar administração
    CASE 
        WHEN pa.codigo = 'administracao' AND u.role = 'ADMIN' THEN TRUE
        ELSE COALESCE(pd.pode_acessar, FALSE)
    END AS acesso_final
FROM users u
CROSS JOIN plataforma_abas pa
LEFT JOIN permissoes_diretoria pd ON pd.diretoria = u.diretoria AND pd.aba_codigo = pa.codigo
WHERE u.is_deleted = FALSE AND pa.ativo = TRUE
ORDER BY u.id, pa.ordem;

COMMENT ON VIEW vw_usuario_permissoes IS 'View com permissões calculadas para cada usuário';

-- ============================================================
-- 6. FUNÇÃO PARA VERIFICAR PERMISSÃO
-- ============================================================
CREATE OR REPLACE FUNCTION verificar_permissao(
    p_usuario_id INTEGER,
    p_aba_codigo VARCHAR(50)
)
RETURNS TABLE (
    pode_acessar BOOLEAN,
    apenas_propria_diretoria BOOLEAN,
    diretoria_usuario VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vp.acesso_final,
        vp.apenas_propria_diretoria,
        vp.usuario_diretoria
    FROM vw_usuario_permissoes vp
    WHERE vp.usuario_id = p_usuario_id
      AND vp.aba_codigo = p_aba_codigo;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verificar_permissao IS 'Verifica se usuário tem permissão para acessar uma aba';

-- ============================================================
-- 7. FUNÇÃO PARA OBTER TODAS AS PERMISSÕES DO USUÁRIO
-- ============================================================
CREATE OR REPLACE FUNCTION obter_permissoes_usuario(p_usuario_id INTEGER)
RETURNS TABLE (
    aba_codigo VARCHAR(50),
    aba_nome VARCHAR(100),
    aba_icone VARCHAR(50),
    aba_ordem INTEGER,
    pode_acessar BOOLEAN,
    apenas_propria_diretoria BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vp.aba_codigo,
        vp.aba_nome,
        vp.aba_icone,
        vp.aba_ordem,
        vp.acesso_final,
        vp.apenas_propria_diretoria
    FROM vw_usuario_permissoes vp
    WHERE vp.usuario_id = p_usuario_id
    ORDER BY vp.aba_ordem;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obter_permissoes_usuario IS 'Retorna todas as permissões de um usuário';

COMMIT;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT * FROM plataforma_abas;
-- SELECT * FROM permissoes_diretoria ORDER BY diretoria, aba_codigo;
-- SELECT * FROM vw_usuario_permissoes WHERE usuario_id = 1;
-- SELECT * FROM verificar_permissao(1, 'gestao_estrategica');
-- SELECT * FROM obter_permissoes_usuario(1);

