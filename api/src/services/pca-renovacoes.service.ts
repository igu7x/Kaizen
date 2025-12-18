import { query, transaction } from '../config/database.js';
import { AuditService } from './audit.service.js';

/**
 * Interface para item de Renovação do PCA
 */
export interface PcaRenovacao {
    id: number;
    item_pca: string;
    area_demandante: string;
    gestor_demandante: string;
    contratada: string;
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
 * DTO para criação de renovação
 */
export interface CreateRenovacaoDto {
    item_pca: string;
    area_demandante: string;
    gestor_demandante: string;
    contratada: string;
    objeto: string;
    valor_anual: number;
    data_estimada_contratacao: string;
    status?: 'Concluída' | 'Em andamento' | 'Não Iniciada';
}

/**
 * DTO para atualização de renovação
 */
export interface UpdateRenovacaoDto {
    item_pca?: string;
    area_demandante?: string;
    gestor_demandante?: string;
    contratada?: string;
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
 * Serviço para gerenciamento de Renovações do PCA
 */
class PcaRenovacoesService {
    private auditService = new AuditService();
    private tableName = 'pca_renovacoes';

    /**
     * Buscar todas as renovações (não deletadas)
     * Ordenadas por mês e depois por número do PCA
     */
    async findAll(): Promise<PcaRenovacao[]> {
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
     * Buscar uma renovação por ID
     */
    async findById(id: number): Promise<PcaRenovacao | null> {
        const result = await query(
            `SELECT * FROM ${this.tableName} WHERE id = $1 AND is_deleted = FALSE`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Buscar por item_pca (código único)
     */
    async findByItemPca(itemPca: string): Promise<PcaRenovacao | null> {
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
     * Criar nova renovação
     */
    async create(data: CreateRenovacaoDto, userId: number): Promise<PcaRenovacao> {
        // Verificar duplicação
        const exists = await this.existsByItemPca(data.item_pca);
        if (exists) {
            throw new Error(`Item PCA "${data.item_pca}" já existe nas renovações`);
        }

        return await transaction(async (client) => {
            // Inserir renovação
            const result = await client.query(
                `INSERT INTO ${this.tableName} 
                 (item_pca, area_demandante, gestor_demandante, contratada, objeto, valor_anual, data_estimada_contratacao, status, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                 RETURNING *`,
                [
                    data.item_pca,
                    data.area_demandante,
                    data.gestor_demandante,
                    data.contratada,
                    data.objeto,
                    data.valor_anual,
                    data.data_estimada_contratacao,
                    data.status || 'Não Iniciada',
                    userId
                ]
            );

            const created = result.rows[0];

            // Criar registro em pca_item_details
            await client.query(
                `INSERT INTO pca_item_details (renovacao_id, tipo, validacao_dg_tipo, fase_atual)
                 VALUES ($1, 'renovacao', 'Pendente', NULL)`,
                [created.id]
            );

            // Criar 6 itens de checklist
            const checklistItems = [
                { nome: 'DOD', ordem: 1 },
                { nome: 'ETP', ordem: 2 },
                { nome: 'TR', ordem: 3 },
                { nome: 'MGR', ordem: 4 },
                { nome: 'Análise de mercado', ordem: 5 },
                { nome: 'Distribuição orçamentária', ordem: 6 }
            ];

            for (const item of checklistItems) {
                await client.query(
                    `INSERT INTO pca_checklist_items (renovacao_id, tipo, item_nome, item_ordem, status)
                     VALUES ($1, 'renovacao', $2, $3, 'Não Iniciada')`,
                    [created.id, item.nome, item.ordem]
                );
            }

            // Registrar no audit log
            await this.auditService.log({
                table_name: this.tableName,
                record_id: created.id,
                action: 'INSERT',
                user_id: userId,
                new_values: created
            });

            return created;
        });
    }

    /**
     * Atualizar renovação
     */
    async update(id: number, data: UpdateRenovacaoDto, userId: number): Promise<PcaRenovacao | null> {
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
        if (data.gestor_demandante !== undefined) {
            updates.push(`gestor_demandante = $${paramIndex++}`);
            values.push(data.gestor_demandante);
        }
        if (data.contratada !== undefined) {
            updates.push(`contratada = $${paramIndex++}`);
            values.push(data.contratada);
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
     * Atualizar apenas o status de uma renovação
     */
    async updateStatus(id: number, status: 'Concluída' | 'Em andamento' | 'Não Iniciada', userId: number): Promise<PcaRenovacao | null> {
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
     * Soft delete de uma renovação
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
     * Obter estatísticas das renovações
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
     * Obter resumo completo para o frontend
     */
    async getResumo(): Promise<{
        total: number;
        valor_total: number;
        por_status: { [key: string]: number };
        por_area: { [key: string]: { quantidade: number; valor: number } };
        por_mes: { [key: string]: number };
    }> {
        // Por status
        const statusResult = await query(
            `SELECT status, COUNT(*) as count 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE 
             GROUP BY status`
        );
        const por_status: { [key: string]: number } = {
            'Não Iniciada': 0,
            'Em andamento': 0,
            'Concluída': 0
        };
        statusResult.rows.forEach(row => {
            por_status[row.status] = parseInt(row.count);
        });

        // Por área
        const areaResult = await query(
            `SELECT area_demandante, COUNT(*) as quantidade, SUM(valor_anual) as valor
             FROM ${this.tableName}
             WHERE is_deleted = FALSE
             GROUP BY area_demandante
             ORDER BY valor DESC`
        );
        const por_area: { [key: string]: { quantidade: number; valor: number } } = {};
        areaResult.rows.forEach(row => {
            por_area[row.area_demandante] = {
                quantidade: parseInt(row.quantidade),
                valor: parseFloat(row.valor)
            };
        });

        // Por mês
        const mesResult = await query(
            `SELECT data_estimada_contratacao, COUNT(*) as count
             FROM ${this.tableName}
             WHERE is_deleted = FALSE
             GROUP BY data_estimada_contratacao`
        );
        const por_mes: { [key: string]: number } = {};
        mesResult.rows.forEach(row => {
            por_mes[row.data_estimada_contratacao] = parseInt(row.count);
        });

        // Total geral
        const totalResult = await query(
            `SELECT COUNT(*) as total, COALESCE(SUM(valor_anual), 0) as valor_total
             FROM ${this.tableName}
             WHERE is_deleted = FALSE`
        );

        return {
            total: parseInt(totalResult.rows[0].total),
            valor_total: parseFloat(totalResult.rows[0].valor_total),
            por_status,
            por_area,
            por_mes
        };
    }

    /**
     * Obter filtros disponíveis
     */
    async getFilters(): Promise<{
        areasDemandantes: string[];
        gestores: string[];
        meses: string[];
    }> {
        const areasResult = await query(
            `SELECT DISTINCT area_demandante 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE 
             ORDER BY area_demandante`
        );

        const gestoresResult = await query(
            `SELECT DISTINCT gestor_demandante 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE 
             ORDER BY gestor_demandante`
        );

        const mesesResult = await query(
            `SELECT DISTINCT data_estimada_contratacao 
             FROM ${this.tableName} 
             WHERE is_deleted = FALSE`
        );

        // Ordenar meses
        const meses = mesesResult.rows.map(row => row.data_estimada_contratacao);
        meses.sort((a, b) => (MONTH_ORDER[a] || 13) - (MONTH_ORDER[b] || 13));

        return {
            areasDemandantes: areasResult.rows.map(row => row.area_demandante),
            gestores: gestoresResult.rows.map(row => row.gestor_demandante),
            meses
        };
    }
}

export const pcaRenovacoesService = new PcaRenovacoesService();
export default pcaRenovacoesService;

























