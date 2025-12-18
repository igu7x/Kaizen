-- ===================================================================
-- MIGRATION: POPULAR COMITÊ CPDP - BANCO CORPORATIVO
-- Comitê de Proteção de Dados Pessoais
-- Total: 11 Reuniões + 42 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================
-- INSTRUÇÕES PARA EQUIPE DE BANCO:
-- 1. Este arquivo deve ser executado no banco corporativo
-- 2. Execute em uma transação para garantir atomicidade
-- 3. A migration possui controle de execução duplicada
-- ===================================================================

CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  executed_by VARCHAR(100),
  notes TEXT
);

BEGIN;

DO $$
DECLARE
  v_comite_id INTEGER;
  v_reuniao_1_id INTEGER;
  v_reuniao_2_id INTEGER;
  v_reuniao_3_id INTEGER;
  v_reuniao_4_id INTEGER;
  v_reuniao_5_id INTEGER;
  v_reuniao_6_id INTEGER;
  v_reuniao_7_id INTEGER;
  v_reuniao_8_id INTEGER;
  v_reuniao_9_id INTEGER;
  v_reuniao_10_id INTEGER;
  v_reuniao_11_id INTEGER;
BEGIN

-- Verificar se migration já foi executada
IF EXISTS (SELECT 1 FROM migrations_log WHERE migration_name = '025_populate_cpdp') THEN
  RAISE NOTICE 'Migration já executada. Pulando...';
  RETURN;
END IF;

-- Buscar ID do comitê CPDP
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CPDP';

IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'ERRO: Comitê CPDP não encontrado no banco de dados.';
END IF;

RAISE NOTICE 'Populando comitê CPDP (ID: %)', v_comite_id;

-- REUNIÃO 1 - 21/03/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 1, 2025, '2025-03-21', 'março', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Primeira reunião de 2025', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Solicita informações sobre os concursos públicos deste Tribunal de Justiça (202503000622040)', 1),
  (v_reuniao_1_id, 2, 'Pedido de pesquisa sobre o tema depoimento especial, com recorte para os crimes sexuais (202501000603248)', 2),
  (v_reuniao_1_id, 3, 'Pedido de pesquisa sobre o impacto da implementação de tecnologias de inteligência artificial no sistema judiciário e sua representação social (202412000594791)', 3),
  (v_reuniao_1_id, 4, 'Solicitação de edição de nota técnica para proibir o uso de dados pessoais nas gravações de audiências do Tribunal do Júri para fins diferentes do processo judicial (202410000574789)', 4)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 2 - 24/04/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 2, 2025, '2025-04-24', 'abril', 'Realizada', 'Reunião 2 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião ordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_2_id;

IF v_reuniao_2_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_2_id, 1, 'Solicita informações sobre servidores com deficiência no TJGO (202503000628173)', 1),
  (v_reuniao_2_id, 2, 'Aprovação do Calendário de Reuniões', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 3 - 19/05/2025 (EXTRAORDINÁRIA)
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 3, 2025, '2025-05-19', 'maio', 'Realizada', 'Reunião Extraordinária 3 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião Extraordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_3_id;

IF v_reuniao_3_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_3_id, 1, 'Desenvolvimento de pesquisa sobre o tema depoimento especial, com recorte para os crimes sexuais (202501000603248)', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 4 - 24/06/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 4, 2025, '2025-06-24', 'junho', 'Realizada', 'Reunião 4 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião ordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_4_id;

IF v_reuniao_4_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_4_id, 1, '202501000603248 - Pedido de pesquisa depoimento especial;', 1),
  (v_reuniao_4_id, 2, '202410000578246 - Pedido de servidor para pesquisa SOBRE "Saúde ambiental e qualidade de vida no trabalho: análise no Poder Judiciário de Goiás";', 2),
  (v_reuniao_4_id, 3, '202303000394904 - Sindjustiça requer informações da quantidade de Servidores que possuem crédito de Banco de horas registrados no sistema e qual a quantidade de horas que cada Servidor filiado possui registrado no sistema;', 3),
  (v_reuniao_4_id, 4, '202504000635476 - Iniciativa da Ouvidoria por meio de pedido de informação para acesso a dados como quantitativos de terceirizados e servidores do NAC, NAJ e acesso a todos documentos relacionados à informação requerida;', 4),
  (v_reuniao_4_id, 5, '202501000596782 - Pedido de servidora para pesquisa tema: "Relação dos nomes e e-mails institucionais dos servidores e estagiários lotados nas UPJ Cível e Criminal do 2º Grau;', 5),
  (v_reuniao_4_id, 6, '202503000622266 - Pedido de Servidora para pesquisa acadêmica tema: "Sistemas de medição de desempenho";', 6),
  (v_reuniao_4_id, 7, '202504000634341 - Solicitação Judicial CGJ - Setor de Diligências da Procuradoria-Geral da Fazenda Nacional requer cópias inventário;', 7),
  (v_reuniao_4_id, 8, '202506000646214 - Pedido de servidor para pesquisa acadêmica sobre "Transformação Digital, Inovação Aberta e Capacidades Dinâmicas: Proposta de um Modelo de Diagnóstico para o Poder Judiciário"', 8),
  (v_reuniao_4_id, 9, '202506000646184 - Solicitação de anonimização de dados pessoais nas publicações disponíveis nos motores de busca deste TJGO.', 9)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 5 - 24/07/2025 (EXTRAORDINÁRIA)
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 5, 2025, '2025-07-24', 'julho', 'Realizada', 'Reunião Extraordinária 5 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião Extraordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_5_id;

IF v_reuniao_5_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_5_id, 1, '202506000646214 - Pedido de servidor para pesquisa acadêmica sobre "Transformação Digital, Inovação Aberta e Capacidades Dinâmicas: Proposta de um Modelo de Diagnóstico para o Poder Judiciário"', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 6 - 26/08/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 6, 2025, '2025-08-26', 'agosto', 'Realizada', 'Reunião 6 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião ordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_6_id;

IF v_reuniao_6_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_6_id, 1, '202503000622266 - Pedido de Pesquisa sobre Sistemas de Mediação e Desempenho ajuste calendário mensal', 1),
  (v_reuniao_6_id, 2, '202208000355239 - Acesso Consultor Segredo de Justiça', 2),
  (v_reuniao_6_id, 3, '202507000658895 (Ouvidoria Denúncia Possível Falha TJDocs parte documento sigiloso)', 3),
  (v_reuniao_6_id, 4, '202507000653255 - Projeto de Pesquisa: "Interações entre o Sistema de Justiça, a Polícia e os Programas de Reabilitação a partir das Reformas Legais sobre os Agressores na Violência Doméstica".', 4)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 7 - 25/09/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 7, 2025, '2025-09-25', 'setembro', 'Realizada', 'Reunião 7 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião ordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_7_id;

IF v_reuniao_7_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_7_id, 1, '202506000646184 - Anonimização de Dados Pessoais', 1),
  (v_reuniao_7_id, 2, 'Atualização do "Plano de Ação de Adequação à LGPD"', 2),
  (v_reuniao_7_id, 3, '202507000656807 - Estudos sobre o acesso da Comunidade Quilombola Kalunga aos sistemas locais de justiça;', 3),
  (v_reuniao_7_id, 4, '202505000641584 - Ferramenta de anonimização de dados para utilização da AGAIA;', 4),
  (v_reuniao_7_id, 5, '202410000578246 - Pedido de servidor para pesquisa sobre "Saúde ambiental e qualidade de vida no trabalho: análise no Poder Judiciário de Goiás".', 5),
  (v_reuniao_7_id, 6, '202509000668747 - Solicitação de acesso ao processo Lázaro;', 6),
  (v_reuniao_7_id, 7, '202507000656061 - Solicitação CGJ - Criação Banco telefones magistrados;', 7),
  (v_reuniao_7_id, 8, '202507000654820 - Solicitação de listagem das empresas em Recuperação Judicial no Estado de Goiás.', 8)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 8 - 10/10/2025 (EXTRAORDINÁRIA)
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 8, 2025, '2025-10-10', 'outubro', 'Realizada', 'Reunião Extraordinária 8 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião Extraordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_8_id;

IF v_reuniao_8_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_8_id, 1, 'PROAD 202505000641584 – Ferramenta de anonimização de dados para utilização da AGAIA.', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 9 - 21/10/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 9, 2025, '2025-10-21', 'outubro', 'Realizada', 'Reunião 9 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião ordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_9_id;

IF v_reuniao_9_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_9_id, 1, '202509000670761 - Análise da homotransfobia em processos criminais.', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 10 - 24/11/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 10, 2025, '2025-11-24', 'novembro', 'Realizada', 'Reunião 10 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Reunião ordinária', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_10_id;

IF v_reuniao_10_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_10_id, 1, '202509000669817 - Solicitação anonimização dados em processos cíveis e criminais + 202510000674362 - Requerimento Ouvidoria - Possível disponibilização de dados sensíveis', 1),
  (v_reuniao_10_id, 2, '202510000675131 - Solicitação de coleta de dados nas obras do TJGO para utilização em Mestrado Profissional.', 2),
  (v_reuniao_10_id, 3, '202508000662697 - Secretaria de Economia - Dados Estatísticos Tributários.', 3)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 11 - 16/12/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 11, 2025, '2025-12-16', 'dezembro', 'Realizada', 'Reunião 11 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-protecao-de-dados-pessoais',
  'Última reunião ordinária de 2025', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_11_id;

IF v_reuniao_11_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_11_id, 1, '202508000665872 – Pesquisa sobre o quantitativo total de magistrados lotados nas Varas Cíveis da Comarca de Goiânia e o quantitativo de magistrados vinculados a título de substituição, nos anos de 2024 e 2025.', 1),
  (v_reuniao_11_id, 2, '202510000678091 – Solicitação do magistrado Felipe Morais Barbosa: relatórios criminais relacionados ao crime de tráfico de drogas e correlatos, abrangendo inquéritos policiais e ações penais, ativos e arquivados.', 2),
  (v_reuniao_11_id, 3, '202509000671726 – Solicitação de pesquisa sobre violência contra a mulher e estupro de vulnerável.', 3),
  (v_reuniao_11_id, 4, '202510000675434 – Pesquisa "Linguagem simples e acesso à Justiça".', 4),
  (v_reuniao_11_id, 5, '202507000656807 – Autorização de pesquisa científica referente à Comunidade Kalunga.', 5),
  (v_reuniao_11_id, 6, '202508000661039 – Pesquisa sobre reincidência criminal.', 6),
  (v_reuniao_11_id, 7, '202511000687114 – Pesquisa sobre economia circular e sustentabilidade.', 7),
  (v_reuniao_11_id, 8, '202511000687704 – Desarquivamento e acesso referente ao caso Lázaro Barbosa.', 8)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REGISTRAR MIGRATION
INSERT INTO migrations_log (migration_name, executed_by, notes)
VALUES ('025_populate_cpdp', current_user, 'População CPDP: 11 reuniões e 42 itens de pauta (2025)')
ON CONFLICT (migration_name) DO NOTHING;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
RAISE NOTICE 'Comitê: CPDP';
RAISE NOTICE 'Reuniões inseridas: 11';
RAISE NOTICE 'Itens de pauta inseridos: 42';
RAISE NOTICE '===================================================================';

END $$;

COMMIT;

-- VERIFICAÇÃO FINAL
SELECT c.sigla, c.nome, COUNT(DISTINCT r.id) AS total_reunioes, COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CPDP' GROUP BY c.sigla, c.nome;











