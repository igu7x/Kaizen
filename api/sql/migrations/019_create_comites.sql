-- ============================================================
-- MIGRAÇÃO: Criação das tabelas do módulo Comitês
-- Data: 2025-12-09
-- ============================================================

-- ============================================================
-- 1. TABELA PRINCIPAL: comites
-- ============================================================
CREATE TABLE IF NOT EXISTS comites (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    sigla VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(20) DEFAULT '#1565C0',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Comentários
COMMENT ON TABLE comites IS 'Comitês do Tribunal de Justiça';
COMMENT ON COLUMN comites.descricao IS 'Descrição institucional do comitê';
COMMENT ON COLUMN comites.icone IS 'Nome do ícone para exibição';
COMMENT ON COLUMN comites.cor IS 'Cor do card na seleção';
COMMENT ON COLUMN comites.ordem IS 'Ordem de exibição na página de seleção';

-- Índices
CREATE INDEX IF NOT EXISTS idx_comites_ativo ON comites(ativo);
CREATE INDEX IF NOT EXISTS idx_comites_ordem ON comites(ordem);
CREATE INDEX IF NOT EXISTS idx_comites_sigla ON comites(sigla);

-- ============================================================
-- 2. TABELA: comite_membros
-- ============================================================
CREATE TABLE IF NOT EXISTS comite_membros (
    id SERIAL PRIMARY KEY,
    comite_id INTEGER NOT NULL REFERENCES comites(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cargo TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Comentários
COMMENT ON TABLE comite_membros IS 'Membros dos comitês';
COMMENT ON COLUMN comite_membros.ordem IS 'Ordem de exibição na lista de membros';

-- Índices
CREATE INDEX IF NOT EXISTS idx_comite_membros_comite ON comite_membros(comite_id);
CREATE INDEX IF NOT EXISTS idx_comite_membros_ativo ON comite_membros(ativo);
CREATE INDEX IF NOT EXISTS idx_comite_membros_ordem ON comite_membros(ordem);

-- ============================================================
-- 3. TABELA: comite_reunioes
-- ============================================================
CREATE TABLE IF NOT EXISTS comite_reunioes (
    id SERIAL PRIMARY KEY,
    comite_id INTEGER NOT NULL REFERENCES comites(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    data DATE NOT NULL,
    mes VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Previsto',
    titulo VARCHAR(255),
    observacoes TEXT,
    
    -- Links externos
    link_proad VARCHAR(500),
    link_transparencia VARCHAR(500),
    link_ata VARCHAR(500),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    
    CONSTRAINT chk_reuniao_status CHECK (status IN ('Previsto', 'Realizada', 'Cancelada')),
    CONSTRAINT unique_comite_reuniao UNIQUE (comite_id, numero, ano)
);

-- Comentários
COMMENT ON TABLE comite_reunioes IS 'Reuniões dos comitês';
COMMENT ON COLUMN comite_reunioes.numero IS 'Número da reunião no ano';
COMMENT ON COLUMN comite_reunioes.mes IS 'Mês por extenso';
COMMENT ON COLUMN comite_reunioes.link_ata IS 'Link para ata da reunião';

-- Índices
CREATE INDEX IF NOT EXISTS idx_reunioes_comite ON comite_reunioes(comite_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_data ON comite_reunioes(data);
CREATE INDEX IF NOT EXISTS idx_reunioes_status ON comite_reunioes(status);
CREATE INDEX IF NOT EXISTS idx_reunioes_ano ON comite_reunioes(ano);

-- ============================================================
-- 4. TABELA: comite_reuniao_pauta
-- ============================================================
CREATE TABLE IF NOT EXISTS comite_reuniao_pauta (
    id SERIAL PRIMARY KEY,
    reuniao_id INTEGER NOT NULL REFERENCES comite_reunioes(id) ON DELETE CASCADE,
    numero_item INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    
    CONSTRAINT unique_reuniao_pauta_item UNIQUE (reuniao_id, numero_item)
);

-- Comentários
COMMENT ON TABLE comite_reuniao_pauta IS 'Itens da pauta das reuniões';
COMMENT ON COLUMN comite_reuniao_pauta.numero_item IS 'Número do item na pauta';

-- Índices
CREATE INDEX IF NOT EXISTS idx_reuniao_pauta_reuniao ON comite_reuniao_pauta(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_reuniao_pauta_ordem ON comite_reuniao_pauta(ordem);

-- ============================================================
-- 5. TABELA: comite_quadro_controle
-- ============================================================
CREATE TABLE IF NOT EXISTS comite_quadro_controle (
    id SERIAL PRIMARY KEY,
    comite_id INTEGER NOT NULL REFERENCES comites(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    discussao_contexto TEXT,
    deliberacao VARCHAR(100),
    decisao_encaminhamento TEXT,
    acoes_atividades TEXT,
    responsavel VARCHAR(255),
    prazo DATE,
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'Andamento',
    ordem INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    
    CONSTRAINT chk_quadro_status CHECK (status IN ('Andamento', 'Concluída', 'Cancelada'))
);

-- Comentários
COMMENT ON TABLE comite_quadro_controle IS 'Quadro de controle dos comitês';
COMMENT ON COLUMN comite_quadro_controle.deliberacao IS 'Ex: Reunião 19-2025';

-- Índices
CREATE INDEX IF NOT EXISTS idx_quadro_controle_comite ON comite_quadro_controle(comite_id);
CREATE INDEX IF NOT EXISTS idx_quadro_controle_status ON comite_quadro_controle(status);
CREATE INDEX IF NOT EXISTS idx_quadro_controle_ordem ON comite_quadro_controle(ordem);

-- ============================================================
-- 6. INSERIR DADOS INICIAIS: 8 Comitês
-- ============================================================
INSERT INTO comites (nome, sigla, descricao, icone, ordem) VALUES
('Comitê Gestor de Tecnologia da Informação e Comunicação', 'CGTIC', 
 'Comitê Gestor de Tecnologia da Informação e Comunicação – CGTIC – atua como colegiado consultivo do Tribunal de Justiça, objetivando a consolidação do alinhamento da área de negócio com a área de Tecnologia da Informação, em consonância com as diretrizes nacionais e do Plano Estratégico vigente.', 
 'megafone', 1),
('Comitê de Governança de Tecnologia da Informação e Comunicação', 'CGOV-TIC', 
 'Responsável pela governança e direcionamento estratégico de TIC no âmbito do Tribunal.',
 'pessoas', 2),
('Comitê de Proteção de Dados Pessoais', 'CPDP', 
 'Responsável pela proteção de dados pessoais e conformidade com a LGPD.',
 'pessoa-escudo', 3),
('Comitê Gestor de Segurança da Informação', 'CGSI', 
 'Responsável pela segurança da informação e gestão de riscos de TI.',
 'escudo', 4),
('Comitê Gestor do Proad', 'CGP', 
 'Responsável pela gestão e governança do Processo Administrativo Digital.',
 'diagrama', 5),
('Comitê de Tratamento de Incidentes de Tecnologia da Informação', 'CTITI', 
 'Responsável pelo tratamento e gestão de incidentes de segurança em TI.',
 'relogio-alerta', 6),
('Comitê de Governança e Gestão de Projetos de Inteligência Artificial e Cognição Automatizada', 'CGGPIAC', 
 'Responsável pela governança de projetos de Inteligência Artificial e cognição automatizada.',
 'lampada', 7),
('Comitê Gestor da Diretoria de Processo Eletrônico', 'CGDPE', 
 'Responsável pela gestão do processo judicial eletrônico.',
 'balanca', 8)
ON CONFLICT (sigla) DO NOTHING;

-- ============================================================
-- 7. INSERIR MEMBROS DO CGTIC
-- ============================================================
INSERT INTO comite_membros (comite_id, nome, cargo, ordem) 
SELECT c.id, m.nome, m.cargo, m.ordem
FROM comites c
CROSS JOIN (VALUES
    ('ADAIL ANTONIO PINTO JUNIOR', 'Coordenador de Infraestrutura Tecnológica', 1),
    ('ANA PAULA DA SILVA DE MORAES', 'Divisão de Atendimento aos Usuários de Sistemas.', 2),
    ('DOMINGOS DA SILVA CHAVES JÚNIOR', 'Diretor de Soluções em Tecnologia de Informação', 3),
    ('GLAUCO CINTRA PARREIRA', 'Diretor de TI da Presidência', 4),
    ('GUSTAVO ASSIS GARCIA', 'Juiz(a) Auxiliar da Presidência com a competência delegada para atuar em demandas pertinentes à tecnologia da informação', 5),
    ('GUSTAVO MACHADO DO PRADO DIAS MACIEL', 'Secretário de Governança Judiciária e Tecnológica', 6),
    ('JOUBERT DUARTE BORGES', 'Coordenador de Governança e Planejamento de TIC', 7),
    ('KEILA SOUSA E SILVA', 'Coordenadoria de Transformação Digital', 8),
    ('MARCUS VINICIUS GONZAGA FERREIRA', 'Coordenador(a) de Suporte em Tecnologia da Informação', 9)
) AS m(nome, cargo, ordem)
WHERE c.sigla = 'CGTIC'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. INSERIR REUNIÕES DO CGTIC 2025
-- ============================================================
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes) 
SELECT c.id, r.numero, r.ano, r.data::DATE, r.mes, r.status, r.titulo, r.link_proad, r.link_transparencia, r.observacoes
FROM comites c
CROSS JOIN (VALUES
    (1, 2025, '2025-02-14', 'fevereiro', 'Realizada', 'Reunião 1 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (2, 2025, '2025-02-28', 'fevereiro', 'Realizada', 'Reunião 2 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (3, 2025, '2025-03-14', 'março', 'Realizada', 'Reunião 3 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (4, 2025, '2025-03-31', 'março', 'Realizada', 'Reunião 4 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (5, 2025, '2025-04-14', 'abril', 'Realizada', 'Reunião 5 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (6, 2025, '2025-04-28', 'abril', 'Realizada', 'Reunião 6 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (7, 2025, '2025-05-12', 'maio', 'Realizada', 'Reunião 7 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (8, 2025, '2025-05-26', 'maio', 'Realizada', 'Reunião 8 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (9, 2025, '2025-06-09', 'junho', 'Realizada', 'Reunião 9 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (10, 2025, '2025-06-24', 'junho', 'Realizada', 'Reunião 10 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (11, 2025, '2025-07-14', 'julho', 'Realizada', 'Reunião 11 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (12, 2025, '2025-07-28', 'julho', 'Realizada', 'Reunião 12 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (13, 2025, '2025-08-11', 'agosto', 'Realizada', 'Reunião 13 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (14, 2025, '2025-08-25', 'agosto', 'Realizada', 'Reunião 14 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (15, 2025, '2025-09-08', 'setembro', 'Realizada', 'Reunião 15 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (16, 2025, '2025-09-22', 'setembro', 'Realizada', 'Reunião 16 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (17, 2025, '2025-10-06', 'outubro', 'Realizada', 'Reunião 17 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (18, 2025, '2025-10-20', 'outubro', 'Realizada', 'Reunião 18 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (19, 2025, '2025-11-12', 'novembro', 'Realizada', 'Reunião 19 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (20, 2025, '2025-11-24', 'novembro', 'Realizada', 'Reunião 20 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais'),
    (21, 2025, '2025-12-09', 'dezembro', 'Previsto', 'Reunião 21 - 2025',
     'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
     'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
     'Reuniões Quinzenais')
) AS r(numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes)
WHERE c.sigla = 'CGTIC'
ON CONFLICT (comite_id, numero, ano) DO NOTHING;

-- ============================================================
-- 9. INSERIR ITENS DE PAUTA DA REUNIÃO 1 DO CGTIC
-- ============================================================
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem)
SELECT r.id, p.numero_item, p.descricao, p.ordem
FROM comite_reunioes r
JOIN comites c ON r.comite_id = c.id
CROSS JOIN (VALUES
    (1, 'Alinhamentos de apresentação do Comitê.', 1),
    (2, 'Revisão do Plano de Contratação Anual (PCA) 2025', 2),
    (3, 'Avaliação Preliminar sobre o 3º Datacenter.', 3),
    (4, 'Orientação sobre o fluxo de recebimento de demandas de desenvolvimento', 4),
    (5, 'Plano Diretor de Tecnologia da Informação e Comunicação – PDTIC', 5)
) AS p(numero_item, descricao, ordem)
WHERE c.sigla = 'CGTIC' AND r.numero = 1 AND r.ano = 2025
ON CONFLICT (reuniao_id, numero_item) DO NOTHING;

-- ============================================================
-- 10. INSERIR ITENS DO QUADRO DE CONTROLE DO CGTIC
-- ============================================================
INSERT INTO comite_quadro_controle (comite_id, item, deliberacao, decisao_encaminhamento, status, ordem)
SELECT c.id, q.item, q.deliberacao, q.decisao_encaminhamento, q.status, q.ordem
FROM comites c
CROSS JOIN (VALUES
    ('Distribuição de Equipamentos', 'Reunião 19-2025', 
     'Realização de sondagem junto às unidades para identificar o interesse na utilização dos equipamentos disponíveis', 
     'Andamento', 1),
    ('Revisão do Processo de Gerenciamento de Incidentes de Segurança da Informação', 'Reunião 3-2025', 
     'Aprovado por unanimidade', 
     'Concluída', 2),
    ('Revisão do Processo de Gerenciamento de Mudanças', 'Reunião 4-2025', 
     'Aprovado por unanimidade', 
     'Concluída', 3),
    ('Revisão do Processo de Negócio de Planejamento Orçamentário de TIC', 'Reunião 13-2025', 
     'Aprovado por unanimidade', 
     'Concluída', 4),
    ('20250500637323 - IGovTIC-JUD 2025', 'Reunião 16-2025', 
     'Resultado Geral apresentado', 
     'Concluída', 5),
    ('Apresentação da Minuta de Resolução', 'Reunião 20-2025', 
     'Minuta apresentada e aprovada', 
     'Concluída', 6)
) AS q(item, deliberacao, decisao_encaminhamento, status, ordem)
WHERE c.sigla = 'CGTIC'
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================






















