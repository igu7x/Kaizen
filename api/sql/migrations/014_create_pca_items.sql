-- =====================================================
-- MIGRATION 014: Criação da tabela pca_items
-- Módulo: Contratações de TI - Esteira de Contratações
-- PCA 2026 - Plano de Contratações Anual
-- Data: 2025-12-04
-- =====================================================

-- Tabela: pca_items
-- Armazena os itens do Plano de Contratações Anual de TI
CREATE TABLE IF NOT EXISTS pca_items (
    id SERIAL PRIMARY KEY,
    item_pca VARCHAR(50) NOT NULL UNIQUE,
    area_demandante VARCHAR(100) NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    objeto TEXT NOT NULL,
    valor_anual DECIMAL(15, 2) NOT NULL CHECK (valor_anual > 0),
    data_estimada_contratacao VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Não Iniciada' CHECK (status IN ('Concluída', 'Em andamento', 'Não Iniciada')),
    
    -- Campos de auditoria
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by INTEGER REFERENCES users(id)
);

COMMENT ON TABLE pca_items IS 'Itens do Plano de Contratações Anual (PCA) de Tecnologia da Informação';
COMMENT ON COLUMN pca_items.item_pca IS 'Identificador único do item PCA (ex: PCA 263)';
COMMENT ON COLUMN pca_items.area_demandante IS 'Área demandante da contratação (DTI, DSTI, CITEC, CSTI, SGJT)';
COMMENT ON COLUMN pca_items.responsavel IS 'Nome completo do responsável pela contratação';
COMMENT ON COLUMN pca_items.objeto IS 'Descrição completa do objeto da contratação';
COMMENT ON COLUMN pca_items.valor_anual IS 'Valor anual estimado em reais';
COMMENT ON COLUMN pca_items.data_estimada_contratacao IS 'Mês previsto para a contratação';
COMMENT ON COLUMN pca_items.status IS 'Status atual: Concluída, Em andamento, Não Iniciada';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pca_items_area_demandante ON pca_items(area_demandante);
CREATE INDEX IF NOT EXISTS idx_pca_items_status ON pca_items(status);
CREATE INDEX IF NOT EXISTS idx_pca_items_responsavel ON pca_items(responsavel);
CREATE INDEX IF NOT EXISTS idx_pca_items_is_deleted ON pca_items(is_deleted);

-- Trigger para updated_at automático
CREATE TRIGGER update_pca_items_updated_at 
    BEFORE UPDATE ON pca_items
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERIR DADOS INICIAIS DO PCA 2026 (30 registros)
-- =====================================================

INSERT INTO pca_items (item_pca, area_demandante, responsavel, objeto, valor_anual, data_estimada_contratacao, status) VALUES

-- Fevereiro (3 itens)
('PCA 263', 'DTI', 'Glauco Cintra Parreira', 'Contratação de empresa especializada para implantação, treinamento e suporte do software GLPI na sua última versão.', 200000.00, 'Fevereiro', 'Não Iniciada'),

('PCA 266', 'DSTI', 'Domingos da Silva Chaves Junior', 'Contratação de solução para design de interfaces (FIGMA)', 20400.00, 'Fevereiro', 'Não Iniciada'),

('PCA 271', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de solução de comunicação Unificada (VoiP), da fabricante Avaya, compreendendo o Core e Contact Center, migrando para a modalidade de subscrição.', 4198269.26, 'Fevereiro', 'Não Iniciada'),

-- Março (4 itens)
('PCA 246', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de serviço de fornecimento de certificados digitais para computadores servidores', 20000.00, 'Março', 'Não Iniciada'),

('PCA 261', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'Contratação de serviços de outsourcing de impressão.', 5000000.00, 'Março', 'Não Iniciada'),

('PCA 262', 'DTI', 'Glauco Cintra Parreira', 'Aquisição de licenças de uso dos softwares de produtividade e colaboração (Microsoft 365) em regime de subscrição (pagamento de aluguel).', 20000000.00, 'Março', 'Não Iniciada'),

('PCA 267', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'Contratação de serviços de desenvolvimento e evolução de sistemas visando atender às necessidades do negócio da Justiça do Trabalho.', 543520.92, 'Março', 'Não Iniciada'),

-- Abril (2 itens)
('PCA 245', 'CITEC', 'Adail Antônio Pinto Junior', 'Renovação anual de licenças de uso do software de gerenciamento de identidades de usuários e controle de acesso da CA Technologies.', 700000.00, 'Abril', 'Não Iniciada'),

('PCA 268', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'Contratação de fábrica de software voltada para o desenvolvimento de sistemas nos padrões corporativos do TRT da 18ª Região.', 4513903.10, 'Abril', 'Não Iniciada'),

-- Maio (3 itens)
('PCA 253', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de serviços de sustentação de tecnologia da informação e comunicação.', 11700000.00, 'Maio', 'Não Iniciada'),

('PCA 258', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'Aquisição de equipamentos e periféricos de TI.', 30000000.00, 'Maio', 'Não Iniciada'),

('PCA 264', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'Aquisição de mobiliário específico para o datacenter.', 700000.00, 'Maio', 'Não Iniciada'),

-- Junho (3 itens)
('PCA 248', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de solução integrada de segurança da informação.', 4000000.00, 'Junho', 'Não Iniciada'),

('PCA 250', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de serviços de suporte técnico e atualização de versão de software de gerenciamento de banco de dados Oracle.', 8840273.08, 'Junho', 'Não Iniciada'),

('PCA 269', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'Contratação de empresa especializada em prestação de serviços técnicos de tecnologia da informação em regime de alocação de profissionais.', 800000.00, 'Junho', 'Não Iniciada'),

-- Julho (4 itens)
('PCA 247', 'CITEC', 'Adail Antônio Pinto Junior', 'Aquisição de equipamentos servidores para datacenter', 19000000.00, 'Julho', 'Não Iniciada'),

('PCA 249', 'CITEC', 'Adail Antônio Pinto Junior', 'Aquisição de appliances de criptografia de dados.', 3000000.00, 'Julho', 'Não Iniciada'),

('PCA 254', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de serviços de consultoria especializada para implantação da arquitetura corporativa e serviços de nuvem híbrida.', 2000000.00, 'Julho', 'Não Iniciada'),

('PCA 270', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'Contratação de empresa para realização de serviços técnicos especializados de suporte remoto, manutenção corretiva e preventiva dos sistemas corporativos.', 4439274.08, 'Julho', 'Não Iniciada'),

-- Agosto (3 itens)
('PCA 251', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de solução de storage (armazenamento) em nuvem.', 1000000.00, 'Agosto', 'Não Iniciada'),

('PCA 259', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'Aquisição de nobreaks.', 100000.00, 'Agosto', 'Não Iniciada'),

('PCA 265', 'DSTI', 'Domingos da Silva Chaves Junior', 'Contratação de Fábrica de Software para ampliação do atendimento às demandas de desenvolvimento e manutenção de sistemas.', 15000000.00, 'Agosto', 'Não Iniciada'),

-- Setembro (4 itens)
('PCA 252', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de solução de firewall e licenças agregadas de segurança.', 12000000.00, 'Setembro', 'Não Iniciada'),

('PCA 255', 'CITEC', 'Adail Antônio Pinto Junior', 'Aquisição de switches para rede local.', 247998.50, 'Setembro', 'Não Iniciada'),

('PCA 256', 'DSTI', 'Domingos da Silva Chaves Junior', 'Contratação de solução de software para testes automatizados.', 24000.00, 'Setembro', 'Não Iniciada'),

('PCA 257', 'DSTI', 'Domingos da Silva Chaves Junior', 'Contratação de solução de monitoramento de aplicações (APM - Application Performance Monitoring).', 260000.00, 'Setembro', 'Não Iniciada'),

-- Outubro (3 itens)
('PCA 260', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'Aquisição de câmeras de videoconferência.', 534000.00, 'Outubro', 'Não Iniciada'),

('PCA 272', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'Contratação de serviço de suporte técnico remoto e atualização de versão de software de Business Intelligence.', 916000.00, 'Outubro', 'Não Iniciada'),

('PCA 273', 'CITEC', 'Adail Antônio Pinto Junior', 'Aquisição de ar condicionado de precisão para datacenter.', 7722.00, 'Outubro', 'Não Iniciada'),

-- Dezembro (1 item)
('PCA 274', 'CITEC', 'Adail Antônio Pinto Junior', 'Contratação de serviços de seguro de equipamentos de TI.', 2716400.00, 'Dezembro', 'Não Iniciada')

ON CONFLICT (item_pca) DO NOTHING;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

SELECT 'Migration 014: pca_items criada com ' || COUNT(*) || ' registros' as status FROM pca_items;




























