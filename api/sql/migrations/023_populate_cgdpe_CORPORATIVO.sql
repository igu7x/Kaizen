-- ===================================================================
-- MIGRATION: POPULAR COMITÊ CGDPE - BANCO CORPORATIVO
-- Comitê Gestor da Diretoria de Processo Eletrônico
-- Total: 1 Reunião + 4 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================
-- INSTRUÇÕES PARA EQUIPE DE BANCO:
-- 1. Este arquivo deve ser executado no banco corporativo
-- 2. Execute em uma transação para garantir atomicidade
-- 3. A migration possui controle de execução duplicada
-- ===================================================================

-- ============================================================
-- CRIAR TABELA DE LOG DE MIGRATIONS (se não existir)
-- ============================================================
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  executed_by VARCHAR(100),
  notes TEXT
);

-- ============================================================
-- INÍCIO DA TRANSACTION
-- ============================================================
BEGIN;

-- Verificar se migration já foi executada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM migrations_log 
    WHERE migration_name = '023_populate_cgdpe'
  ) THEN
    RAISE NOTICE '⚠️  Migration já executada anteriormente. Abortando.';
    RETURN;
  END IF;
END $$;

-- ============================================================
-- EXECUTAR POPULAÇÃO
-- ============================================================
DO $$
DECLARE
  v_comite_id INTEGER;
  v_reuniao_1_id INTEGER;
BEGIN

-- Verificar se migration já foi executada
IF EXISTS (SELECT 1 FROM migrations_log WHERE migration_name = '023_populate_cgdpe') THEN
  RAISE NOTICE 'Migration já executada. Pulando...';
  RETURN;
END IF;

-- Buscar ID do comitê CGDPE
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGDPE';

IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'ERRO: Comitê CGDPE não encontrado no banco de dados.';
END IF;

RAISE NOTICE 'Populando comitê CGDPE (ID: %)', v_comite_id;

-- ===================================================================
-- REUNIÃO 1 - 02/06/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 1, 2025, '2025-06-02', 'junho', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-da-diretoria-de-processo-eletronico',
  'Primeira reunião do CGDPE em 2025',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Apresentação da nova composição;', 1),
  (v_reuniao_1_id, 2, 'Apresentação de diagnóstico realizado pela SGJT;', 2),
  (v_reuniao_1_id, 3, 'Feedback sobre curso do ISO;', 3),
  (v_reuniao_1_id, 4, 'Estadualização de centrais.', 4)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REGISTRAR MIGRATION
-- ===================================================================
INSERT INTO migrations_log (migration_name, executed_by, notes)
VALUES (
  '023_populate_cgdpe', 
  current_user,
  'População inicial do CGDPE: 1 reunião e 4 itens de pauta (2025)'
)
ON CONFLICT (migration_name) DO NOTHING;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
RAISE NOTICE 'Comitê: CGDPE';
RAISE NOTICE 'Reuniões inseridas: 1';
RAISE NOTICE 'Itens de pauta inseridos: 4';
RAISE NOTICE '===================================================================';

END $$;

-- ============================================================
-- COMMIT
-- ============================================================
COMMIT;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 
  c.sigla AS comite,
  c.nome AS nome_comite,
  COUNT(DISTINCT r.id) AS total_reunioes,
  COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGDPE'
GROUP BY c.sigla, c.nome;

-- Listar reuniões inseridas
SELECT 
  r.numero,
  r.titulo,
  TO_CHAR(r.data, 'DD/MM/YYYY') AS data,
  r.status,
  COUNT(p.id) AS itens_pauta
FROM comite_reunioes r
JOIN comites c ON r.comite_id = c.id
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGDPE' AND r.ano = 2025
GROUP BY r.numero, r.titulo, r.data, r.status
ORDER BY r.numero;











