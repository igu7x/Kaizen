-- ============================================================
-- GRANTS PARA O USUÁRIO DA API
-- Execute este script como superusuário (DBA)
-- ============================================================

-- IMPORTANTE: Substitua 'sgjt' pelo usuário correto da API
-- Verifique o valor de DB_USER nas variáveis de ambiente do pod

-- ============================================================
-- MÓDULO PESSOAS (Colaboradores e Organograma)
-- ============================================================

-- Tabela principal de colaboradores
GRANT SELECT, INSERT, UPDATE, DELETE ON pessoas_colaboradores TO sgjt;

-- Tabela de gestores do organograma
GRANT SELECT, INSERT, UPDATE, DELETE ON pessoas_organograma_gestores TO sgjt;

-- Views (apenas SELECT)
GRANT SELECT ON pessoas_estatisticas TO sgjt;
GRANT SELECT ON pessoas_organograma_hierarquia TO sgjt;

-- Sequences (para INSERT com auto-increment)
GRANT USAGE, SELECT ON SEQUENCE pessoas_colaboradores_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE pessoas_organograma_gestores_id_seq TO sgjt;

-- ============================================================
-- MÓDULO COMITÊS
-- ============================================================

-- Tabelas de comitês
GRANT SELECT, INSERT, UPDATE, DELETE ON comites TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON comites_membros TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON comites_reunioes TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON comites_deliberacoes TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON comites_atas TO sgjt;

-- Sequences
GRANT USAGE, SELECT ON SEQUENCE comites_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE comites_membros_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE comites_reunioes_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE comites_deliberacoes_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE comites_atas_id_seq TO sgjt;

-- ============================================================
-- MÓDULO CONTRATAÇÕES (PCA)
-- ============================================================

-- Tabelas de PCA
GRANT SELECT, INSERT, UPDATE, DELETE ON pca_items TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON pca_renovacoes TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON pca_tarefas TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON pca_historico TO sgjt;
GRANT SELECT, INSERT, UPDATE, DELETE ON pca_documentos TO sgjt;

-- Sequences
GRANT USAGE, SELECT ON SEQUENCE pca_items_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE pca_renovacoes_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE pca_tarefas_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE pca_historico_id_seq TO sgjt;
GRANT USAGE, SELECT ON SEQUENCE pca_documentos_id_seq TO sgjt;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

-- Execute esta query para verificar se os grants foram aplicados:
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE grantee = 'sgjt'
-- ORDER BY table_name;


