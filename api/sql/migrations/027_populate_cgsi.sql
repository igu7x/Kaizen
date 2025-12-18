-- ===================================================================
-- MIGRAÇÃO: POPULAR COMITÊ CGSI
-- Comitê Gestor de Segurança da Informação
-- Total: 6 Reuniões (3 Ordinárias + 3 Extraordinárias) + 19 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================

DO $$
DECLARE
  v_comite_id INTEGER;
  v_reuniao_1_id INTEGER;
  v_reuniao_2_id INTEGER;
  v_reuniao_3_id INTEGER;
  v_reuniao_4_id INTEGER;
  v_reuniao_5_id INTEGER;
  v_reuniao_6_id INTEGER;
BEGIN

-- ===================================================================
-- ETAPA 1: VALIDAÇÃO
-- ===================================================================

-- Buscar ID do comitê CGSI
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGSI';

-- Verificar se comitê existe
IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'Comitê CGSI não encontrado. Verifique se o comitê foi criado na tabela comites.';
END IF;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'Iniciando população do comitê CGSI (ID: %)', v_comite_id;
RAISE NOTICE '===================================================================';

-- ===================================================================
-- REUNIÃO 1 - 23/04/2025 (ORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 1, 2025, '2025-04-23', 'abril', 'Realizada', 'Reunião 1 - Ordinária',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-seguranca-da-informacao',
  'Primeira reunião ordinária - Reestruturação e Plano de Ação de Segurança',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Alinhamento e apresentação da reestruturação do Comitê', 1),
  (v_reuniao_1_id, 2, 'PROAD 202502000617586 Plano de Ação de Segurança da Informação do TJGO para o Biênio 2025/2026', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 1 (Ordinária) inserida - 2 itens de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 2 - 13/05/2025 (EXTRAORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 2, 2025, '2025-05-13', 'maio', 'Realizada', 'Reunião 2 - Extraordinária',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-seguranca-da-informacao',
  'Reunião Extraordinária - Políticas de Acesso e Protocolos de Segurança Cibernética',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_2_id;

IF v_reuniao_2_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_2_id, 1, 'PROAD 202503000626435- Proposição de Política de Acesso à Rede de Dados do TJGO;', 1),
  (v_reuniao_2_id, 2, 'PROAD 202502000617588 - Política de Acesso Remoto à Rede Privada de Dados do Tribunal de Justiça de Goiás;', 2),
  (v_reuniao_2_id, 3, 'PROAD 202504000636117 - Apresentação das Minutas do Protocolo de Prevenção de Incidentes Cibernéticos e do Protocolo de Gerenciamento de Crises Cibernéticas;', 3),
  (v_reuniao_2_id, 4, 'PROAD 202101000254391 - ATO NORMATIVO Nº 0010158-46.2020.2.00.0000, REFERENTE A RECOMENDAÇÃO Nº 362, DETERMINA A ADOÇÃO DE PROTOCOLO DE PREVENÇÃO A INCIDENTES CIBERNÉTICOS;', 4),
  (v_reuniao_2_id, 5, 'PROAD 202101000254397 - ATO NORMATIVO SOB O Nº 0010347-24.2020.2.00.0000 REFERENTE A RESOLUÇÃO Nº 362/2020, DE 17 DE DEZEMBRO DE 2020.', 5),
  (v_reuniao_2_id, 6, 'PROAD 202101000254393 - ATO NORMATIVO SOB O Nº0010159-31.2020.2.00.0000, RECOMENDAÇÃO Nº 360, DE 17 DE NOVEMBRO DE 2020, REFERENTE A INSTITUIÇÃO DE PROTOCOLO DE GERENCIAMENTO DE CRISES CIBERNÉTICAS NO ÂMBITO DO PODER JUDICIÁRIO.', 6)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 2 (Extraordinária) inserida - 6 itens de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 3 - 23/05/2025 (EXTRAORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 3, 2025, '2025-05-23', 'maio', 'Realizada', 'Reunião 3 - Extraordinária',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-seguranca-da-informacao',
  'Reunião Extraordinária - Planos de Ação para Proteção de Infraestruturas Críticas',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_3_id;

IF v_reuniao_3_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_3_id, 1, 'PROAD 202505000642216 - (a) Plano de Ação para Implementação do Manual de Proteção de Infraestruturas Criticas de TIC – biênio 2025/2026; e (b) Plano de Ação para Implementação do Manual de Política de Educação e Cultura em Segurança Cibernética do Poder Judiciário – biênio 2025/2026', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 3 (Extraordinária) inserida - 1 item de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 4 - 16/06/2025 (ORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 4, 2025, '2025-06-16', 'junho', 'Realizada', 'Reunião 4 - Ordinária',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-seguranca-da-informacao',
  'Reunião ordinária - Continuidade Política de Acesso à Rede',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_4_id;

IF v_reuniao_4_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_4_id, 1, '202503000626435 – Proposição de Política de Acesso à Rede de Dados do TJGO', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 4 (Ordinária) inserida - 1 item de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 5 - 26/08/2025 (ORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 5, 2025, '2025-08-26', 'agosto', 'Realizada', 'Reunião 5 - Ordinária',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-seguranca-da-informacao',
  'Reunião ordinária - Política de Acesso e MFA no Zoom',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_5_id;

IF v_reuniao_5_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_5_id, 1, '202503000626435 - Política de Acesso à Rede de Dados', 1),
  (v_reuniao_5_id, 2, '202508000660610 - Ativação do MFA na plataforma de Videoconferência ZOOM', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 5 (Ordinária) inserida - 2 itens de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 6 - 21/10/2025 (ORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 6, 2025, '2025-10-21', 'outubro', 'Realizada', 'Reunião 6 - Ordinária',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-seguranca-da-informacao',
  'Reunião ordinária - Política de Acesso, Reinício de Computadores e Incidentes',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_6_id;

IF v_reuniao_6_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_6_id, 1, '202503000626435 - Política de Acesso à Rede de Dados;', 1),
  (v_reuniao_6_id, 2, '202509000669393 - Solicitação de autorização para reinício periódico dos computadores do parque tecnológico;', 2),
  (v_reuniao_6_id, 3, '202509000671863 - Relatório de incidente zoom;', 3),
  (v_reuniao_6_id, 4, '202509000673771 - Diretor Judiciário Thiago Borges Dutra solicita acesso ao sistema VNC.', 4)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 6 (Ordinária) inserida - 4 itens de pauta';
END IF;

-- ===================================================================
-- FINALIZAÇÃO
-- ===================================================================

RAISE NOTICE '';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'POPULAÇÃO CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'Comitê: CGSI (ID: %)', v_comite_id;
RAISE NOTICE 'Reuniões inseridas: 6 (3 ordinárias + 3 extraordinárias)';
RAISE NOTICE 'Itens de pauta inseridos: 16';
RAISE NOTICE 'Foco: Segurança Cibernética, Políticas de Acesso, Proteção de Infraestrutura';
RAISE NOTICE '===================================================================';

END $$;

-- ============================================================
-- VERIFICAÇÃO: Contar reuniões e pautas inseridas
-- ============================================================
SELECT 
  c.sigla AS comite,
  COUNT(DISTINCT r.id) AS total_reunioes,
  COUNT(DISTINCT CASE WHEN r.titulo ILIKE '%extraordin%' THEN r.id END) AS extraordinarias,
  COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGSI'
GROUP BY c.sigla;











