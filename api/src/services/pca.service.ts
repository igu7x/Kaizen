import { query, transaction } from '../config/database.js';
import { AuditService } from './audit.service.js';

/**
 * Interface para item do PCA
 */
export interface PcaItem {
    id: number;
    item_pca: string;
    area_demandante: string;
    responsavel: string;
    objeto: string;
    valor_anual: number;
    data_estimada_contratacao: string;
    status: 'Concluída' | 'Em andamento' | 'Não Iniciada';
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    updated_by: number | null;
    deleted_at: Date | null;
    deleted_by: number | null;
}

/**
 * DTO para criação de item PCA
 */
export interface CreatePcaItemDto {
    item_pca: string;
    area_demandante: string;
    responsavel: string;
    objeto: string;
    valor_anual: number;
    data_estimada_contratacao: string;
    status?: 'Concluída' | 'Em andamento' | 'Não Iniciada';
}

/**
 * DTO para atualização de item PCA
 */
export interface UpdatePcaItemDto {
    item_pca?: string;
    area_demandante?: string;
    responsavel?: string;
    objeto?: string;
    valor_anual?: number;
    data_estimada_contratacao?: string;
    status?: 'Concluída' | 'Em andamento' | 'Não Iniciada';
}

// Mapeamento de meses para ordenação
const MONTH_ORDER: { [key: string]: number } = {
    'Janeiro': 1,
    'Fevereiro': 2,
    'Março': 3,
    'Abril': 4,
    'Maio': 5,
    'Junho': 6,
    'Julho': 7,
    'Agosto': 8,
    'Setembro': 9,
    'Outubro': 10,
    'Novembro': 11,
    'Dezembro': 12
};

/**
 * Serviço para gerenciamento de itens do PCA
 */
class PcaService {
    private auditService = new AuditService();
    private tableName = 'pca_items';

    /**
     * Buscar todos os itens PCA (não deletados)
     * Ordenados por mês e depois por número do PCA
     */
    async findAll(): Promise<PcaItem[]> {
        const result = await query(
            `SELECT * FROM ${this.tableName} 
             WHERE is_deleted = FALSE 
             ORDER BY 
                CASE data_estimada_contratacao
                    WHEN 'Janeiro' THEN 1
                    WHEN 'Fevereiro' THEN 2
                    WHEN 'Março' THEN 3
                    WHEN 'Abril' THEN 4
                    WHEN 'Maio' THEN 5
                    WHEN 'Junho' THEN 6
                    WHEN 'Julho' THEN 7
                    WHEN 'Agosto' THEN 8
                    WHEN 'Setembro' THEN 9
                    WHEN 'Outubro' THEN 10
                    WHEN 'Novembro' THEN 11
                    WHEN 'Dezembro' THEN 12
                    ELSE 13
                END,
                item_pca`
        );
        return result.rows;
    }

    /**
     * Buscar um item PCA por ID
     */
    async findById(id: number): Promise<PcaItem | null> {
        const result = await query(
            `SELECT * FROM ${this.tableName} WHERE id = $1 AND is_deleted = FALSE`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Buscar por item_pca (código único)
     */
    async findByItemPca(itemPca: string): Promise<PcaItem | null> {
        const result = await query(
            `SELECT * FROM ${this.tableName} WHERE item_pca = $1 AND is_deleted = FALSE`,
            [itemPca]
        );
        return result.rows[0] || null;
    }

    /**
     * Verificar se item_pca já existe (para validação de duplicação)
     */
    async existsByItemPca(itemPca: string, excludeId?: number): Promise<boolean> {
        let queryText = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE item_pca = $1 AND is_deleted = FALSE`;
        const params: any[] = [itemPca];

        if (excludeId) {
            queryText += ` AND id != $2`;
            params.push(excludeId);
        }

        const result = await query(queryText, params);
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Criar novo item PCA
     */
    async create(data: CreatePcaItemDto, userId: number): Promise<PcaItem> {
        // Verificar duplicação
        const exists = await this.existsByItemPca(data.item_pca);
        if (exists) {
            throw new Error(`Item PCA "${data.item_pca}" já existe`);
        }

        const result = await query(
            `INSERT INTO ${this.tableName} 
             (item_pca, area_demandante, responsavel, objeto, valor_anual, data_estimada_contratacao, status, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [
                data.item_pca,
                data.area_demandante,
                data.responsavel,
                data.objeto,
                data.valor_anual,
                data.data_estimada_contratacao,
                data.status || 'Não Iniciada',
                userId
            ]
        );

        const created = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: created.id,
            action: 'INSERT',
            user_id: userId,
            new_values: created
        });

        return created;
    }

    /**
     * Atualizar item PCA
     */
    async update(id: number, data: UpdatePcaItemDto, userId: number): Promise<PcaItem | null> {
        // Buscar registro antigo
        const oldRecord = await this.findById(id);
        if (!oldRecord) {
            return null;
        }

        // Se estiver alterando item_pca, verificar duplicação
        if (data.item_pca && data.item_pca !== oldRecord.item_pca) {
            const exists = await this.existsByItemPca(data.item_pca, id);
            if (exists) {
                throw new Error(`Item PCA "${data.item_pca}" já existe`);
            }
        }

        // Construir query de atualização dinamicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.item_pca !== undefined) {
            updates.push(`item_pca = $${paramIndex++}`);
            values.push(data.item_pca);
        }
        if (data.area_demandante !== undefined) {
            updates.push(`area_demandante = $${paramIndex++}`);
            values.push(data.area_demandante);
        }
        if (data.responsavel !== undefined) {
            updates.push(`responsavel = $${paramIndex++}`);
            values.push(data.responsavel);
        }
        if (data.objeto !== undefined) {
            updates.push(`objeto = $${paramIndex++}`);
            values.push(data.objeto);
        }
        if (data.valor_anual !== undefined) {
            updates.push(`valor_anual = $${paramIndex++}`);
            values.push(data.valor_anual);
        }
        if (data.data_estimada_contratacao !== undefined) {
            updates.push(`data_estimada_contratacao = $${paramIndex++}`);
            values.push(data.data_estimada_contratacao);
        }
        if (data.status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(data.status);
        }

        // Sempre atualizar updated_by
        updates.push(`updated_by = $${paramIndex++}`);
        values.push(userId);

        // Adicionar id no final
        values.push(id);

        if (updates.length === 1) {
            // Apenas updated_by, nada mais para atualizar
            return oldRecord;
        }

        const result = await query(
            `UPDATE ${this.tableName} 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex} AND is_deleted = FALSE
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return null;
        }

        const updated = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: updated
        });

        return updated;
    }

    /**
     * Atualizar apenas o status de um item
     */
    async updateStatus(id: number, status: 'Concluída' | 'Em andamento' | 'Não Iniciada', userId: number): Promise<PcaItem | null> {
        // Buscar registro antigo
        const oldRecord = await this.findById(id);
        if (!oldRecord) {
            return null;
        }

        const result = await query(
            `UPDATE ${this.tableName} 
             SET status = $1, updated_by = $2, updated_at = NOW()
             WHERE id = $3 AND is_deleted = FALSE
             RETURNING *`,
            [status, userId, id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const updated = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: updated,
            changed_fields: ['status']
        });

        return updated;
    }

    /**
     * Soft delete de um item PCA
     */
    async softDelete(id: number, userId: number): Promise<boolean> {
        const existing = await this.findById(id);
        if (!existing) {
            return false;
        }

        const result = await query(
            `UPDATE ${this.tableName} 
             SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = $2
             WHERE id = $1 AND is_deleted = FALSE
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return false;
        }

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: id,
            action: 'SOFT_DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }

    /**
     * Obter estatísticas do PCA
     */
    async getStats(): Promise<{
        total: number;
        valorTotal: number;
        concluidos: number;
        emAndamento: number;
        naoIniciados: number;
    }> {
        const result = await query(
            `SELECT 
                COUNT(*) as total,
                COALESCE(SUM(valor_anual), 0) as valor_total,
                COUNT(CASE WHEN status = 'Concluída' THEN 1 END) as concluidos,
                COUNT(CASE WHEN status = 'Em andamento' THEN 1 END) as em_andamento,
                COUNT(CASE WHEN status = 'Não Iniciada' THEN 1 END) as nao_iniciados
             FROM ${this.tableName}
             WHERE is_deleted = FALSE`
        );

        const row = result.rows[0];
        return {
            total: parseInt(row.total),
            valorTotal: parseFloat(row.valor_total),
            concluidos: parseInt(row.concluidos),
            emAndamento: parseInt(row.em_andamento),
            naoIniciados: parseInt(row.nao_iniciados)
        };
    }

    /**
     * Obter lista de áreas demandantes únicas
     */
    async getAreasDemandantes(): Promise<string[]> {
        const result = await query(
            `SELECT DISTINCT area_demandante 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE 
             ORDER BY area_demandante`
        );
        return result.rows.map(row => row.area_demandante);
    }

    /**
     * Obter lista de responsáveis únicos
     */
    async getResponsaveis(): Promise<string[]> {
        const result = await query(
            `SELECT DISTINCT responsavel 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE 
             ORDER BY responsavel`
        );
        return result.rows.map(row => row.responsavel);
    }

    /**
     * Obter lista de meses únicos
     */
    async getMeses(): Promise<string[]> {
        const result = await query(
            `SELECT DISTINCT data_estimada_contratacao 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE`
        );
        
        // Ordenar por ordem dos meses
        const meses = result.rows.map(row => row.data_estimada_contratacao);
        return meses.sort((a, b) => (MONTH_ORDER[a] || 13) - (MONTH_ORDER[b] || 13));
    }
}

export const pcaService = new PcaService();
export default pcaService;




























