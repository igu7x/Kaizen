-- ============================================================
-- GRANTS PARA O USUÁRIO DA API
-- Execute este script como superusuário (DBA)
-- ============================================================

-- IMPORTANTE: Substitua 'sgjt' pelo usuário correto da API
-- Verifique o valor de DB_USER nas variáveis de ambiente do pod

-- Verificar se o role existe antes de conceder permissões
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sgjt') THEN
        RAISE NOTICE 'Role "sgjt" não existe. Pulando grants (ambiente local)';
        RETURN;
    END IF;

    -- ============================================================
    -- MÓDULO PESSOAS (Colaboradores e Organograma)
    -- ============================================================

    -- Tabela principal de colaboradores
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pessoas_colaboradores') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pessoas_colaboradores TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pessoas_colaboradores_id_seq TO sgjt;
    END IF;

    -- Tabela de gestores do organograma
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pessoas_organograma_gestores') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pessoas_organograma_gestores TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pessoas_organograma_gestores_id_seq TO sgjt;
    END IF;

    -- Views (apenas SELECT)
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'pessoas_estatisticas') THEN
        GRANT SELECT ON pessoas_estatisticas TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'pessoas_organograma_hierarquia') THEN
        GRANT SELECT ON pessoas_organograma_hierarquia TO sgjt;
    END IF;

    -- ============================================================
    -- MÓDULO COMITÊS
    -- ============================================================

    -- Tabelas de comitês
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comites') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON comites TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE comites_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comites_membros') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON comites_membros TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE comites_membros_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comites_reunioes') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON comites_reunioes TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE comites_reunioes_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comites_deliberacoes') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON comites_deliberacoes TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE comites_deliberacoes_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comites_atas') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON comites_atas TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE comites_atas_id_seq TO sgjt;
    END IF;

    -- ============================================================
    -- MÓDULO CONTRATAÇÕES (PCA)
    -- ============================================================

    -- Tabelas de PCA
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pca_items') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pca_items TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pca_items_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pca_renovacoes') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pca_renovacoes TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pca_renovacoes_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pca_tarefas') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pca_tarefas TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pca_tarefas_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pca_historico') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pca_historico TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pca_historico_id_seq TO sgjt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pca_documentos') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON pca_documentos TO sgjt;
        GRANT USAGE, SELECT ON SEQUENCE pca_documentos_id_seq TO sgjt;
    END IF;

    RAISE NOTICE 'Grants aplicados com sucesso para o role "sgjt"';
END $$;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

-- Execute esta query para verificar se os grants foram aplicados:
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE grantee = 'sgjt'
-- ORDER BY table_name;
