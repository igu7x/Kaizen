-- ============================================================
-- MIGRAÇÃO: Adicionar campos para ata de reunião (PDF upload)
-- ============================================================

-- Adicionar colunas para armazenar informações da ata
ALTER TABLE comite_reunioes 
ADD COLUMN IF NOT EXISTS ata_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS ata_filepath VARCHAR(500),
ADD COLUMN IF NOT EXISTS ata_filesize INTEGER,
ADD COLUMN IF NOT EXISTS ata_uploaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ata_uploaded_by INTEGER REFERENCES users(id);

-- Comentários
COMMENT ON COLUMN comite_reunioes.ata_filename IS 'Nome original do arquivo PDF da ata';
COMMENT ON COLUMN comite_reunioes.ata_filepath IS 'Caminho completo do arquivo no servidor';
COMMENT ON COLUMN comite_reunioes.ata_filesize IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN comite_reunioes.ata_uploaded_at IS 'Data/hora do upload da ata';
COMMENT ON COLUMN comite_reunioes.ata_uploaded_by IS 'Usuário que fez upload da ata';

-- Criar índice para consultas
CREATE INDEX IF NOT EXISTS idx_reunioes_ata_filename ON comite_reunioes(ata_filename);

-- Verificar estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'comite_reunioes' 
  AND column_name LIKE 'ata_%'
ORDER BY ordinal_position;





















