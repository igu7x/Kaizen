-- =====================================================
-- SCHEMA POSTGRESQL - PLATAFORMA DE GESTÃO
-- Sistema de OKR + Formulários Dinâmicos
-- Migrado de localStorage para PostgreSQL
-- Data: 2025-11-28
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABELAS DO SISTEMA DE GESTÃO (OKR)
-- =====================================================

-- Tabela: users
-- Armazena usuários do sistema com controle de acesso
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('VIEWER', 'MANAGER', 'ADMIN')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Usuários do sistema com controle de acesso baseado em roles';
COMMENT ON COLUMN users.role IS 'Nível de acesso: VIEWER (visualização), MANAGER (gestão), ADMIN (administração total)';
COMMENT ON COLUMN users.status IS 'Status do usuário: ACTIVE (ativo), INACTIVE (inativo)';
COMMENT ON COLUMN users.password_hash IS 'Hash SHA-256 da senha do usuário';

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Tabela: directorates
-- Diretorias do sistema (normalizada)
CREATE TABLE IF NOT EXISTS directorates (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE directorates IS 'Diretorias/Coordenadorias do sistema';

-- Inserir diretorias padrão
INSERT INTO directorates (code, name) VALUES
    ('DIJUD', 'Diretoria Judiciária'),
    ('DPE', 'Diretoria de Processos Especiais'),
    ('DTI', 'Diretoria de Tecnologia da Informação'),
    ('DSTI', 'Diretoria de Soluções de TI'),
    ('SGJT', 'Secretaria de Governança Judiciária e Tecnológica')
ON CONFLICT (code) DO NOTHING;

-- Tabela: objectives
-- Objetivos estratégicos (O do OKR)
CREATE TABLE IF NOT EXISTS objectives (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, directorate_code)
);

COMMENT ON TABLE objectives IS 'Objetivos estratégicos (Objectives) do framework OKR';
COMMENT ON COLUMN objectives.code IS 'Código identificador do objetivo (ex: Objetivo 1)';

CREATE INDEX idx_objectives_directorate ON objectives(directorate_code);

-- Tabela: key_results
-- Resultados-chave (KR do OKR)
CREATE TABLE IF NOT EXISTS key_results (
    id SERIAL PRIMARY KEY,
    objective_id INTEGER NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NAO_INICIADO' CHECK (status IN ('CONCLUIDO', 'EM_ANDAMENTO', 'NAO_INICIADO')),
    situation VARCHAR(20) NOT NULL DEFAULT 'NO_PRAZO' CHECK (situation IN ('NO_PRAZO', 'EM_ATRASO', 'FINALIZADO')),
    deadline VARCHAR(100),
    deadline_date DATE,
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE key_results IS 'Key Results (resultados-chave) vinculados aos objetivos';
COMMENT ON COLUMN key_results.status IS 'Status da execução: CONCLUIDO, EM_ANDAMENTO, NAO_INICIADO';
COMMENT ON COLUMN key_results.situation IS 'Situação quanto ao prazo: NO_PRAZO, EM_ATRASO, FINALIZADO';
COMMENT ON COLUMN key_results.deadline IS 'Prazo em formato texto livre (ex: 11/2025, jul/2025)';
COMMENT ON COLUMN key_results.deadline_date IS 'Prazo convertido para Date (calculado automaticamente)';

CREATE INDEX idx_kr_objective ON key_results(objective_id);
CREATE INDEX idx_kr_directorate ON key_results(directorate_code);
CREATE INDEX idx_kr_status ON key_results(status);
CREATE INDEX idx_kr_situation ON key_results(situation);
CREATE INDEX idx_kr_deadline_date ON key_results(deadline_date);

-- Tabela: initiatives
-- Iniciativas vinculadas aos Key Results
CREATE TABLE IF NOT EXISTS initiatives (
    id SERIAL PRIMARY KEY,
    key_result_id INTEGER NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    board_status VARCHAR(20) NOT NULL DEFAULT 'A_FAZER' CHECK (board_status IN ('A_FAZER', 'FAZENDO', 'FEITO')),
    location VARCHAR(20) NOT NULL DEFAULT 'BACKLOG' CHECK (location IN ('BACKLOG', 'EM_FILA', 'SPRINT_ATUAL', 'FORA_SPRINT', 'CONCLUIDA')),
    sprint_id VARCHAR(100),
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE initiatives IS 'Iniciativas vinculadas aos Key Results';
COMMENT ON COLUMN initiatives.board_status IS 'Status no board Kanban: A_FAZER, FAZENDO, FEITO';
COMMENT ON COLUMN initiatives.location IS 'Localização na gestão: BACKLOG, EM_FILA, SPRINT_ATUAL, FORA_SPRINT, CONCLUIDA';

CREATE INDEX idx_initiatives_kr ON initiatives(key_result_id);
CREATE INDEX idx_initiatives_directorate ON initiatives(directorate_code);
CREATE INDEX idx_initiatives_location ON initiatives(location);
CREATE INDEX idx_initiatives_board_status ON initiatives(board_status);

-- Tabela: programs
-- Programas estratégicos
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE programs IS 'Programas estratégicos (ex: CONECTA JUD, SINERGIA TEC-JUD)';

CREATE INDEX idx_programs_directorate ON programs(directorate_code);

-- Tabela: program_initiatives
-- Iniciativas dos programas
CREATE TABLE IF NOT EXISTS program_initiatives (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    board_status VARCHAR(20) NOT NULL DEFAULT 'A_FAZER' CHECK (board_status IN ('A_FAZER', 'FAZENDO', 'FEITO')),
    priority VARCHAR(10) NOT NULL DEFAULT 'NAO' CHECK (priority IN ('SIM', 'NAO')),
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE program_initiatives IS 'Iniciativas vinculadas aos programas estratégicos';
COMMENT ON COLUMN program_initiatives.priority IS 'Prioridade da iniciativa: SIM ou NAO';

CREATE INDEX idx_program_initiatives_program ON program_initiatives(program_id);
CREATE INDEX idx_program_initiatives_directorate ON program_initiatives(directorate_code);

-- Tabela: execution_controls
-- Controle de execução
CREATE TABLE IF NOT EXISTS execution_controls (
    id SERIAL PRIMARY KEY,
    plan_program VARCHAR(255) NOT NULL,
    kr_project_initiative VARCHAR(255) NOT NULL,
    backlog_tasks TEXT,
    sprint_status VARCHAR(20) NOT NULL DEFAULT 'BACKLOG' CHECK (sprint_status IN ('BACKLOG', 'EM_FILA', 'SPRINT_ATUAL', 'FORA_SPRINT', 'CONCLUIDA')),
    sprint_tasks TEXT,
    progress VARCHAR(20) NOT NULL DEFAULT 'A_FAZER' CHECK (progress IN ('FAZENDO', 'FEITO', 'A_FAZER')),
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE execution_controls IS 'Controle de execução de planos e programas';

CREATE INDEX idx_execution_controls_directorate ON execution_controls(directorate_code);
CREATE INDEX idx_execution_controls_sprint_status ON execution_controls(sprint_status);

-- =====================================================
-- 2. TABELAS DO SISTEMA DE FORMULÁRIOS
-- =====================================================

-- Tabela: forms
-- Formulários dinâmicos
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    directorate_code VARCHAR(10) NOT NULL REFERENCES directorates(code) ON DELETE CASCADE,
    allowed_directorates TEXT[], -- Array de diretorias permitidas (ou ['ALL'])
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE forms IS 'Formulários dinâmicos do módulo de Pessoas';
COMMENT ON COLUMN forms.status IS 'Status do formulário: DRAFT (rascunho), PUBLISHED (publicado), ARCHIVED (arquivado)';
COMMENT ON COLUMN forms.allowed_directorates IS 'Diretorias que podem visualizar o formulário. Usar {ALL} para todos';

CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_directorate ON forms(directorate_code);

-- Tabela: form_sections
-- Seções dos formulários
CREATE TABLE IF NOT EXISTS form_sections (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE form_sections IS 'Seções que organizam campos dentro de um formulário';
COMMENT ON COLUMN form_sections.display_order IS 'Ordem de exibição da seção no formulário';

CREATE INDEX idx_form_sections_form ON form_sections(form_id);
CREATE INDEX idx_form_sections_order ON form_sections(form_id, display_order);

-- Tabela: form_fields
-- Campos dos formulários
CREATE TABLE IF NOT EXISTS form_fields (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES form_sections(id) ON DELETE CASCADE,
    field_type VARCHAR(30) NOT NULL CHECK (field_type IN ('SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'CHECKBOXES', 'SCALE', 'DATE', 'NUMBER', 'DROPDOWN')),
    label VARCHAR(500) NOT NULL,
    help_text TEXT,
    required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    config JSONB, -- Configuração adicional (options, min/max values, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE form_fields IS 'Campos (perguntas) dos formulários';
COMMENT ON COLUMN form_fields.field_type IS 'Tipo do campo: SHORT_TEXT, LONG_TEXT, MULTIPLE_CHOICE, etc';
COMMENT ON COLUMN form_fields.config IS 'Configuração JSON com options, minValue, maxValue, placeholder, etc';
COMMENT ON COLUMN form_fields.section_id IS 'ID da seção (opcional, pode ser null para campos sem seção)';

CREATE INDEX idx_form_fields_form ON form_fields(form_id);
CREATE INDEX idx_form_fields_section ON form_fields(section_id);
CREATE INDEX idx_form_fields_order ON form_fields(form_id, display_order);

-- Tabela: form_responses
-- Respostas aos formulários
CREATE TABLE IF NOT EXISTS form_responses (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE form_responses IS 'Respostas enviadas aos formulários';
COMMENT ON COLUMN form_responses.status IS 'Status da resposta: DRAFT (rascunho), SUBMITTED (enviada)';

CREATE INDEX idx_form_responses_form ON form_responses(form_id);
CREATE INDEX idx_form_responses_user ON form_responses(user_id);
CREATE INDEX idx_form_responses_status ON form_responses(status);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);

-- Tabela: form_answers
-- Respostas individuais a cada campo
CREATE TABLE IF NOT EXISTS form_answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
    value_text TEXT, -- Para respostas texto
    value_number NUMERIC, -- Para respostas numéricas
    value_array TEXT[], -- Para múltipla escolha (array)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(response_id, field_id)
);

COMMENT ON TABLE form_answers IS 'Respostas individuais para cada campo do formulário';
COMMENT ON COLUMN form_answers.value_text IS 'Valor texto (usado para SHORT_TEXT, LONG_TEXT, DATE, DROPDOWN, etc)';
COMMENT ON COLUMN form_answers.value_number IS 'Valor numérico (usado para NUMBER, SCALE)';
COMMENT ON COLUMN form_answers.value_array IS 'Array de valores (usado para CHECKBOXES, MULTIPLE_CHOICE)';

CREATE INDEX idx_form_answers_response ON form_answers(response_id);
CREATE INDEX idx_form_answers_field ON form_answers(field_id);

-- =====================================================
-- 3. TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Função: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_key_results_updated_at BEFORE UPDATE ON key_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_initiatives_updated_at BEFORE UPDATE ON initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_initiatives_updated_at BEFORE UPDATE ON program_initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_execution_controls_updated_at BEFORE UPDATE ON execution_controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at BEFORE UPDATE ON form_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função: calcular situação do KR automaticamente
-- REGRA: Se CONCLUIDO, sempre FINALIZADO
-- REGRA: Se prazo vencido e não concluído, EM_ATRASO
CREATE OR REPLACE FUNCTION calculate_kr_situation()
RETURNS TRIGGER AS $$
BEGIN
    -- Se concluído, sempre finalizado
    IF NEW.status = 'CONCLUIDO' THEN
        NEW.situation := 'FINALIZADO';
        RETURN NEW;
    END IF;

    -- Se tem deadline_date e está no passado, em atraso
    IF NEW.deadline_date IS NOT NULL AND NEW.deadline_date < CURRENT_DATE THEN
        NEW.situation := 'EM_ATRASO';
    ELSE
        NEW.situation := 'NO_PRAZO';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_kr_situation_trigger
    BEFORE INSERT OR UPDATE OF status, deadline_date
    ON key_results
    FOR EACH ROW
    EXECUTE FUNCTION calculate_kr_situation();

-- Função: converter deadline texto para deadline_date automaticamente
CREATE OR REPLACE FUNCTION parse_deadline_to_date()
RETURNS TRIGGER AS $$
DECLARE
    month_num INT;
    year_num INT;
    day_num INT := 1;
    deadline_lower TEXT;
BEGIN
    -- Se não tem deadline, retornar
    IF NEW.deadline IS NULL OR NEW.deadline = '' THEN
        NEW.deadline_date := NULL;
        RETURN NEW;
    END IF;

    deadline_lower := LOWER(NEW.deadline);

    -- Tentar extrair MM/AAAA (ex: 11/2025)
    IF deadline_lower ~ '^\d{1,2}/\d{4}' THEN
        month_num := SUBSTRING(deadline_lower FROM '(\d{1,2})')::INT;
        year_num := SUBSTRING(deadline_lower FROM '/(\d{4})')::INT;
        -- Último dia do mês
        NEW.deadline_date := (DATE(year_num || '-' || month_num || '-01') + INTERVAL '1 month - 1 day')::DATE;
        RETURN NEW;
    END IF;

    -- Tentar extrair DD/MM/AAAA (ex: 15/11/2025)
    IF deadline_lower ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN
        day_num := SPLIT_PART(deadline_lower, '/', 1)::INT;
        month_num := SPLIT_PART(deadline_lower, '/', 2)::INT;
        year_num := SPLIT_PART(deadline_lower, '/', 3)::INT;
        NEW.deadline_date := DATE(year_num || '-' || month_num || '-' || day_num);
        RETURN NEW;
    END IF;

    -- Tentar extrair ano (procurar 4 dígitos)
    IF deadline_lower ~ '\d{4}' THEN
        year_num := SUBSTRING(deadline_lower FROM '(\d{4})')::INT;
        
        -- Mapear meses por nome
        month_num := CASE
            WHEN deadline_lower ~ 'janeiro|jan' THEN 1
            WHEN deadline_lower ~ 'fevereiro|fev' THEN 2
            WHEN deadline_lower ~ 'março|mar' THEN 3
            WHEN deadline_lower ~ 'abril|abr' THEN 4
            WHEN deadline_lower ~ 'maio|mai' THEN 5
            WHEN deadline_lower ~ 'junho|jun' THEN 6
            WHEN deadline_lower ~ 'julho|jul' THEN 7
            WHEN deadline_lower ~ 'agosto|ago' THEN 8
            WHEN deadline_lower ~ 'setembro|set' THEN 9
            WHEN deadline_lower ~ 'outubro|out' THEN 10
            WHEN deadline_lower ~ 'novembro|nov' THEN 11
            WHEN deadline_lower ~ 'dezembro|dez' THEN 12
            ELSE NULL
        END;

        IF month_num IS NOT NULL THEN
            -- Último dia do mês
            NEW.deadline_date := (DATE(year_num || '-' || month_num || '-01') + INTERVAL '1 month - 1 day')::DATE;
            RETURN NEW;
        END IF;
    END IF;

    -- Se não conseguiu converter, deixar NULL
    NEW.deadline_date := NULL;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Dropar triggers antigos
DROP TRIGGER IF EXISTS parse_deadline_trigger ON key_results;
DROP TRIGGER IF EXISTS calculate_kr_situation_trigger ON key_results;

-- Criar função unificada
CREATE OR REPLACE FUNCTION process_key_result()
RETURNS TRIGGER AS $$
DECLARE
    month_num INT;
    year_num INT;
    deadline_lower TEXT;
BEGIN
    -- PASSO 1: Parse do deadline
    IF NEW.deadline IS NOT NULL AND NEW.deadline != '' THEN
        deadline_lower := LOWER(NEW.deadline);
        
        -- Tentar MM/AAAA
        IF deadline_lower ~ '^\d{1,2}/\d{4}' THEN
            month_num := SUBSTRING(deadline_lower FROM '(\d{1,2})')::INT;
            year_num := SUBSTRING(deadline_lower FROM '/(\d{4})')::INT;
            NEW.deadline_date := (DATE(year_num || '-' || month_num || '-01') + INTERVAL '1 month - 1 day')::DATE;
        END IF;
    ELSE
        NEW.deadline_date := NULL;
    END IF;

    -- PASSO 2: Calcular situação
    IF NEW.status = 'CONCLUIDO' THEN
        NEW.situation := 'FINALIZADO';
    ELSIF NEW.deadline_date IS NOT NULL AND NEW.deadline_date < CURRENT_DATE THEN
        NEW.situation := 'EM_ATRASO';
    ELSE
        NEW.situation := 'NO_PRAZO';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger unificado
CREATE TRIGGER process_key_result_trigger
    BEFORE INSERT OR UPDATE
    ON key_results
    FOR EACH ROW
    EXECUTE FUNCTION process_key_result();

-- =====================================================
-- 4. VIEWS ÚTEIS
-- =====================================================

-- View: Visão completa de OKRs com hierarquia
CREATE OR REPLACE VIEW v_okr_hierarchy AS
SELECT 
    o.id as objective_id,
    o.code as objective_code,
    o.title as objective_title,
    o.directorate_code,
    d.name as directorate_name,
    kr.id as kr_id,
    kr.code as kr_code,
    kr.description as kr_description,
    kr.status as kr_status,
    kr.situation as kr_situation,
    kr.deadline,
    kr.deadline_date,
    COUNT(DISTINCT i.id) as initiatives_count
FROM objectives o
LEFT JOIN directorates d ON o.directorate_code = d.code
LEFT JOIN key_results kr ON o.id = kr.objective_id
LEFT JOIN initiatives i ON kr.id = i.key_result_id
GROUP BY o.id, o.code, o.title, o.directorate_code, d.name, 
         kr.id, kr.code, kr.description, kr.status, kr.situation, kr.deadline, kr.deadline_date;

-- View: Estatísticas por diretoria
CREATE OR REPLACE VIEW v_directorate_stats AS
SELECT 
    d.code as directorate_code,
    d.name as directorate_name,
    COUNT(DISTINCT o.id) as total_objectives,
    COUNT(DISTINCT kr.id) as total_key_results,
    COUNT(DISTINCT CASE WHEN kr.status = 'CONCLUIDO' THEN kr.id END) as kr_concluidos,
    COUNT(DISTINCT CASE WHEN kr.status = 'EM_ANDAMENTO' THEN kr.id END) as kr_em_andamento,
    COUNT(DISTINCT CASE WHEN kr.status = 'NAO_INICIADO' THEN kr.id END) as kr_nao_iniciados,
    COUNT(DISTINCT CASE WHEN kr.situation = 'EM_ATRASO' THEN kr.id END) as kr_em_atraso,
    COUNT(DISTINCT i.id) as total_initiatives,
    COUNT(DISTINCT p.id) as total_programs
FROM directorates d
LEFT JOIN objectives o ON d.code = o.directorate_code
LEFT JOIN key_results kr ON o.id = kr.objective_id
LEFT JOIN initiatives i ON kr.id = i.key_result_id
LEFT JOIN programs p ON d.code = p.directorate_code
GROUP BY d.code, d.name;

-- =====================================================
-- 5. FUNÇÃO PARA LIMPEZA E RESET (APENAS DESENVOLVIMENTO)
-- =====================================================

-- Função para limpar todos os dados (CUIDADO!)
CREATE OR REPLACE FUNCTION reset_all_data()
RETURNS void AS $$
BEGIN
    -- Desabilitar triggers temporariamente
    SET session_replication_role = 'replica';
    
    TRUNCATE TABLE form_answers CASCADE;
    TRUNCATE TABLE form_responses CASCADE;
    TRUNCATE TABLE form_fields CASCADE;
    TRUNCATE TABLE form_sections CASCADE;
    TRUNCATE TABLE forms CASCADE;
    TRUNCATE TABLE execution_controls CASCADE;
    TRUNCATE TABLE program_initiatives CASCADE;
    TRUNCATE TABLE programs CASCADE;
    TRUNCATE TABLE initiatives CASCADE;
    TRUNCATE TABLE key_results CASCADE;
    TRUNCATE TABLE objectives CASCADE;
    TRUNCATE TABLE users CASCADE;
    
    -- Resetar sequences
    ALTER SEQUENCE users_id_seq RESTART WITH 1;
    ALTER SEQUENCE objectives_id_seq RESTART WITH 1;
    ALTER SEQUENCE key_results_id_seq RESTART WITH 1;
    ALTER SEQUENCE initiatives_id_seq RESTART WITH 1;
    ALTER SEQUENCE programs_id_seq RESTART WITH 1;
    ALTER SEQUENCE program_initiatives_id_seq RESTART WITH 1;
    ALTER SEQUENCE execution_controls_id_seq RESTART WITH 1;
    ALTER SEQUENCE forms_id_seq RESTART WITH 1;
    ALTER SEQUENCE form_sections_id_seq RESTART WITH 1;
    ALTER SEQUENCE form_fields_id_seq RESTART WITH 1;
    ALTER SEQUENCE form_responses_id_seq RESTART WITH 1;
    ALTER SEQUENCE form_answers_id_seq RESTART WITH 1;
    
    -- Reabilitar triggers
    SET session_replication_role = 'origin';
    
    RAISE NOTICE 'Todos os dados foram limpos e sequences resetadas';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Confirmar criação
SELECT 'Schema criado com sucesso!' as status;
