import { query, transaction } from '../config/database.js';
import { AuditService } from './audit.service.js';
import pg from 'pg';

// ============================================================
// INTERFACES
// ============================================================

export interface PcaItemDetails {
    id: number;
    pca_item_id: number;
    validacao_dg_tipo: 'Pendente' | 'Data';
    validacao_dg_data: string | null;
    fase_atual: string | null;
    created_at: Date;
    updated_at: Date;
    updated_by: number | null;
}

export interface PcaChecklistItem {
    id: number;
    pca_item_id: number;
    item_nome: string;
    item_ordem: number;
    status: 'Concluída' | 'Em andamento' | 'Não Iniciada';
    created_at: Date;
    updated_at: Date;
    updated_by: number | null;
}

export interface PcaPontoControle {
    id: number;
    pca_item_id: number;
    ponto_controle: string;
    data: string;
    proxima_reuniao: string;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    updated_by: number | null;
}

export interface PcaTarefa {
    id: number;
    pca_item_id: number;
    ponto_controle_id: number | null;
    tarefa: string;
    responsavel: string;
    prazo: string;
    status: 'Não iniciada' | 'Em andamento' | 'Concluída';
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    updated_by: number | null;
}

// Interface para PC com tarefas aninhadas
export interface PcaPontoControleComTarefas extends PcaPontoControle {
    tarefas: PcaTarefa[];
}

// DTOs
export interface UpdatePcaDetailsDto {
    validacao_dg_tipo?: 'Pendente' | 'Data';
    validacao_dg_data?: string | null;
    fase_atual?: string | null;
}

export interface CreatePontoControleDto {
    ponto_controle: string;
    data: string;
    proxima_reuniao: string;
}

export interface UpdatePontoControleDto {
    ponto_controle?: string;
    data?: string;
    proxima_reuniao?: string;
}

export interface CreateTarefaDto {
    tarefa: string;
    responsavel: string;
    prazo: string;
    status?: 'Não iniciada' | 'Em andamento' | 'Concluída';
    ponto_controle_id?: number | null;
}

export interface UpdateTarefaDto {
    tarefa?: string;
    responsavel?: string;
    prazo?: string;
    status?: 'Não iniciada' | 'Em andamento' | 'Concluída';
    ponto_controle_id?: number | null;
}

// ============================================================
// SERVIÇO DE DETALHES DO PCA
// ============================================================

class PcaDetailsService {
    private auditService = new AuditService();

    // --------------------------------------------------------
    // DETALHES (Campos Estáticos)
    // --------------------------------------------------------

    /**
     * Buscar detalhes de um item PCA
     */
    async getDetails(pcaItemId: number): Promise<PcaItemDetails | null> {
        const result = await query(
            `SELECT * FROM pca_item_details WHERE pca_item_id = $1`,
            [pcaItemId]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar ou atualizar detalhes de um item PCA
     */
    async upsertDetails(pcaItemId: number, data: UpdatePcaDetailsDto, userId: number): Promise<PcaItemDetails> {
        // Validar: se tipo = 'Data', data é obrigatória
        if (data.validacao_dg_tipo === 'Data' && !data.validacao_dg_data) {
            throw new Error('Data da validação é obrigatória quando tipo é "Data"');
    }

        // Validar fase_atual: máximo 20 caracteres
        if (data.fase_atual && data.fase_atual.length > 20) {
            throw new Error('Fase atual deve ter no máximo 20 caracteres');
        }

        // Se mudar para 'Pendente', limpar a data
        if (data.validacao_dg_tipo === 'Pendente') {
            data.validacao_dg_data = null;
        }

        const existing = await this.getDetails(pcaItemId);

        if (existing) {
            // UPDATE
        const result = await query(
            `UPDATE pca_item_details 
                 SET validacao_dg_tipo = COALESCE($1, validacao_dg_tipo),
                     validacao_dg_data = $2,
                     fase_atual = COALESCE($3, fase_atual),
                     updated_by = $4,
                     updated_at = NOW()
                 WHERE pca_item_id = $5
                 RETURNING *`,
                [
                    data.validacao_dg_tipo,
                    data.validacao_dg_data,
                    data.fase_atual,
                    userId,
                    pcaItemId
                ]
            );
            return result.rows[0];
        } else {
            // INSERT
            const result = await query(
                `INSERT INTO pca_item_details 
                 (pca_item_id, validacao_dg_tipo, validacao_dg_data, fase_atual, updated_by)
                 VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
                [
                    pcaItemId,
                    data.validacao_dg_tipo || 'Pendente',
                    data.validacao_dg_data,
                    data.fase_atual,
                    userId
                ]
        );
        return result.rows[0];
        }
    }

    // --------------------------------------------------------
    // CHECKLIST
    // --------------------------------------------------------

    /**
     * Buscar todos os itens do checklist de um PCA
     */
    async getChecklist(pcaItemId: number): Promise<PcaChecklistItem[]> {
        const result = await query(
            `SELECT * FROM pca_checklist_items 
             WHERE pca_item_id = $1 
             ORDER BY item_ordem`,
            [pcaItemId]
        );
        return result.rows;
    }

    /**
     * Obter progresso do checklist
     */
    async getChecklistProgress(pcaItemId: number): Promise<{ total: number; concluidos: number; percentual: number }> {
        const result = await query(
            `SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'Concluída' THEN 1 END) as concluidos
             FROM pca_checklist_items
             WHERE pca_item_id = $1`,
            [pcaItemId]
        );
        const total = parseInt(result.rows[0].total);
        const concluidos = parseInt(result.rows[0].concluidos);
        const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;
        return { total, concluidos, percentual };
    }

    /**
     * Atualizar status de um item do checklist
     */
    async updateChecklistItemStatus(
        checklistId: number, 
        status: 'Concluída' | 'Em andamento' | 'Não Iniciada',
        userId: number
    ): Promise<PcaChecklistItem | null> {
        const validStatus = ['Concluída', 'Em andamento', 'Não Iniciada'];
        if (!validStatus.includes(status)) {
            throw new Error('Status inválido');
        }

        const result = await query(
            `UPDATE pca_checklist_items 
             SET status = $1, updated_by = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [status, userId, checklistId]
        );
        return result.rows[0] || null;
    }

    // --------------------------------------------------------
    // PONTOS DE CONTROLE
    // --------------------------------------------------------

    /**
     * Buscar todos os pontos de controle de um PCA
     */
    async getPontosControle(pcaItemId: number): Promise<PcaPontoControle[]> {
        const result = await query(
            `SELECT * FROM pca_pontos_controle 
             WHERE pca_item_id = $1 
             ORDER BY ponto_controle`,
            [pcaItemId]
        );
        return result.rows;
    }

    /**
     * Buscar um ponto de controle por ID
     */
    async getPontoControleById(id: number): Promise<PcaPontoControle | null> {
        const result = await query(
            `SELECT * FROM pca_pontos_controle WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar novo ponto de controle
     */
    async createPontoControle(pcaItemId: number, data: CreatePontoControleDto, userId: number): Promise<PcaPontoControle> {
        // Validações
        if (!data.ponto_controle || data.ponto_controle.trim() === '') {
            throw new Error('Ponto de controle é obrigatório');
        }
        if (!data.data) {
            throw new Error('Data é obrigatória');
        }
        if (!data.proxima_reuniao) {
            throw new Error('Próxima reunião é obrigatória');
        }

        const result = await query(
            `INSERT INTO pca_pontos_controle 
             (pca_item_id, ponto_controle, data, proxima_reuniao, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $5)
             RETURNING *`,
            [pcaItemId, data.ponto_controle, data.data, data.proxima_reuniao, userId]
        );

        await this.auditService.log({
            table_name: 'pca_pontos_controle',
            record_id: result.rows[0].id,
            action: 'INSERT',
            user_id: userId,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar ponto de controle
     */
    async updatePontoControle(id: number, data: UpdatePontoControleDto, userId: number): Promise<PcaPontoControle | null> {
        const existing = await this.getPontoControleById(id);
        if (!existing) return null;

        const result = await query(
            `UPDATE pca_pontos_controle 
             SET ponto_controle = COALESCE($1, ponto_controle),
                 data = COALESCE($2, data),
                 proxima_reuniao = COALESCE($3, proxima_reuniao),
                 updated_by = $4,
                 updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [data.ponto_controle, data.data, data.proxima_reuniao, userId, id]
        );

        await this.auditService.log({
            table_name: 'pca_pontos_controle',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Excluir ponto de controle
     */
    /**
     * Excluir ponto de controle
     * @param deleteTarefas Se true, deleta as tarefas junto; se false, as tarefas ficam órfãs (SET NULL)
     */
    async deletePontoControle(id: number, userId: number, deleteTarefas: boolean = false): Promise<{ success: boolean; tarefasAfetadas: number }> {
        const existing = await this.getPontoControleById(id);
        if (!existing) return { success: false, tarefasAfetadas: 0 };

        // Contar tarefas antes de deletar
        const countResult = await query('SELECT COUNT(*) FROM pca_tarefas WHERE ponto_controle_id = $1', [id]);
        const tarefasAfetadas = parseInt(countResult.rows[0].count);

        if (deleteTarefas && tarefasAfetadas > 0) {
            // Deletar tarefas primeiro
            await query('DELETE FROM pca_tarefas WHERE ponto_controle_id = $1', [id]);
        }
        // Se não deletar, as tarefas ficam órfãs automaticamente (ON DELETE SET NULL)

        await query(`DELETE FROM pca_pontos_controle WHERE id = $1`, [id]);

        await this.auditService.log({
            table_name: 'pca_pontos_controle',
            record_id: id,
            action: 'DELETE',
            user_id: userId,
            old_values: { ...existing, tarefas_deletadas: deleteTarefas, tarefas_afetadas: tarefasAfetadas }
        });

        return { success: true, tarefasAfetadas };
    }

    /**
     * Contar tarefas de um ponto de controle
     */
    async countTarefasByPontoControle(pontoControleId: number): Promise<number> {
        const result = await query(
            'SELECT COUNT(*) FROM pca_tarefas WHERE ponto_controle_id = $1',
            [pontoControleId]
        );
        return parseInt(result.rows[0].count);
    }

    /**
     * Buscar tarefas de um ponto de controle específico
     */
    async getTarefasByPontoControle(pontoControleId: number): Promise<PcaTarefa[]> {
        const result = await query(
            `SELECT * FROM pca_tarefas 
             WHERE ponto_controle_id = $1 
             ORDER BY prazo`,
            [pontoControleId]
        );
        return result.rows;
    }

    /**
     * Buscar tarefas órfãs (sem ponto de controle)
     */
    async getTarefasOrfas(pcaItemId: number): Promise<PcaTarefa[]> {
        const result = await query(
            `SELECT * FROM pca_tarefas 
             WHERE pca_item_id = $1 AND ponto_controle_id IS NULL
             ORDER BY prazo`,
            [pcaItemId]
        );
        return result.rows;
    }

    /**
     * Buscar pontos de controle com suas tarefas aninhadas
     */
    async getPontosControleComTarefas(pcaItemId: number): Promise<PcaPontoControleComTarefas[]> {
        const pcs = await this.getPontosControle(pcaItemId);
        const result: PcaPontoControleComTarefas[] = [];
        
        for (const pc of pcs) {
            const tarefas = await this.getTarefasByPontoControle(pc.id);
            result.push({ ...pc, tarefas });
        }
        
        return result;
    }

    /**
     * Associar tarefa a um ponto de controle
     */
    async associarTarefaAPontoControle(
        tarefaId: number, 
        pontoControleId: number | null, 
        userId: number
    ): Promise<PcaTarefa | null> {
        const existing = await this.getTarefaById(tarefaId);
        if (!existing) return null;

        if (pontoControleId !== null) {
            const pc = await this.getPontoControleById(pontoControleId);
            if (!pc || pc.pca_item_id !== existing.pca_item_id) {
                throw new Error('Ponto de controle inválido');
            }
        }

        const result = await query(
            `UPDATE pca_tarefas 
             SET ponto_controle_id = $1, updated_by = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [pontoControleId, userId, tarefaId]
        );

        return result.rows[0];
    }

    // --------------------------------------------------------
    // TAREFAS
    // --------------------------------------------------------

    /**
     * Buscar todas as tarefas de um PCA
     */
    async getTarefas(pcaItemId: number): Promise<PcaTarefa[]> {
        const result = await query(
            `SELECT * FROM pca_tarefas 
             WHERE pca_item_id = $1 
             ORDER BY prazo`,
            [pcaItemId]
        );
        return result.rows;
    }

    /**
     * Buscar uma tarefa por ID
     */
    async getTarefaById(id: number): Promise<PcaTarefa | null> {
        const result = await query(
            `SELECT * FROM pca_tarefas WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar nova tarefa
     */
    async createTarefa(pcaItemId: number, data: CreateTarefaDto, userId: number): Promise<PcaTarefa> {
        // Validações
        if (!data.tarefa || data.tarefa.trim() === '') {
            throw new Error('Tarefa é obrigatória');
        }
        if (data.tarefa.length > 255) {
            throw new Error('Tarefa deve ter no máximo 255 caracteres');
        }
        if (!data.responsavel || data.responsavel.trim() === '') {
            throw new Error('Responsável é obrigatório');
        }
        if (data.responsavel.length > 255) {
            throw new Error('Responsável deve ter no máximo 255 caracteres');
        }
        if (!data.prazo) {
            throw new Error('Prazo é obrigatório');
        }

        const status = data.status || 'Não iniciada';
        const validStatus = ['Não iniciada', 'Em andamento', 'Concluída'];
        if (!validStatus.includes(status)) {
            throw new Error('Status inválido');
        }

        // Validar ponto_controle_id se fornecido
        if (data.ponto_controle_id) {
            const pc = await this.getPontoControleById(data.ponto_controle_id);
            if (!pc || pc.pca_item_id !== pcaItemId) {
                throw new Error('Ponto de controle inválido');
            }
        }

        const result = await query(
            `INSERT INTO pca_tarefas 
             (pca_item_id, ponto_controle_id, tarefa, responsavel, prazo, status, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
             RETURNING *`,
            [pcaItemId, data.ponto_controle_id || null, data.tarefa, data.responsavel, data.prazo, status, userId]
        );

        await this.auditService.log({
            table_name: 'pca_tarefas',
            record_id: result.rows[0].id,
            action: 'INSERT',
            user_id: userId,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar tarefa
     */
    async updateTarefa(id: number, data: UpdateTarefaDto, userId: number): Promise<PcaTarefa | null> {
        const existing = await this.getTarefaById(id);
        if (!existing) return null;

        // Validações
        if (data.tarefa !== undefined && data.tarefa.trim() === '') {
            throw new Error('Tarefa não pode ser vazia');
        }
        if (data.tarefa && data.tarefa.length > 255) {
            throw new Error('Tarefa deve ter no máximo 255 caracteres');
        }
        if (data.responsavel !== undefined && data.responsavel.trim() === '') {
            throw new Error('Responsável não pode ser vazio');
        }
        if (data.responsavel && data.responsavel.length > 255) {
            throw new Error('Responsável deve ter no máximo 255 caracteres');
        }
        if (data.status) {
            const validStatus = ['Não iniciada', 'Em andamento', 'Concluída'];
            if (!validStatus.includes(data.status)) {
                throw new Error('Status inválido');
            }
        }

        const result = await query(
            `UPDATE pca_tarefas 
             SET tarefa = COALESCE($1, tarefa),
                 responsavel = COALESCE($2, responsavel),
                 prazo = COALESCE($3, prazo),
                 status = COALESCE($4, status),
                 updated_by = $5,
                 updated_at = NOW()
             WHERE id = $6
             RETURNING *`,
            [data.tarefa, data.responsavel, data.prazo, data.status, userId, id]
        );

        await this.auditService.log({
            table_name: 'pca_tarefas',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar apenas o status de uma tarefa
     */
    async updateTarefaStatus(
        id: number, 
        status: 'Não iniciada' | 'Em andamento' | 'Concluída', 
        userId: number
    ): Promise<PcaTarefa | null> {
        const validStatus = ['Não iniciada', 'Em andamento', 'Concluída'];
        if (!validStatus.includes(status)) {
            throw new Error('Status inválido');
        }

        const result = await query(
            `UPDATE pca_tarefas 
             SET status = $1, updated_by = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [status, userId, id]
        );
        return result.rows[0] || null;
    }

    /**
     * Excluir tarefa
     */
    async deleteTarefa(id: number, userId: number): Promise<boolean> {
        const existing = await this.getTarefaById(id);
        if (!existing) return false;

        await query(`DELETE FROM pca_tarefas WHERE id = $1`, [id]);

        await this.auditService.log({
            table_name: 'pca_tarefas',
            record_id: id,
            action: 'DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }

    // --------------------------------------------------------
    // DADOS COMPLETOS
    // --------------------------------------------------------

    /**
     * Buscar todos os dados de detalhes de um item PCA
     */
    async getAllData(pcaItemId: number): Promise<{
        details: PcaItemDetails | null;
        checklist: PcaChecklistItem[];
        checklistProgress: { total: number; concluidos: number; percentual: number };
        pontosControle: PcaPontoControle[];
        pontosControleComTarefas: PcaPontoControleComTarefas[];
        tarefas: PcaTarefa[];
        tarefasOrfas: PcaTarefa[];
    }> {
        const [details, checklist, checklistProgress, pontosControle, pontosControleComTarefas, tarefas, tarefasOrfas] = await Promise.all([
            this.getDetails(pcaItemId),
            this.getChecklist(pcaItemId),
            this.getChecklistProgress(pcaItemId),
            this.getPontosControle(pcaItemId),
            this.getPontosControleComTarefas(pcaItemId),
            this.getTarefas(pcaItemId),
            this.getTarefasOrfas(pcaItemId)
        ]);

        return {
            details,
            checklist,
            checklistProgress,
            pontosControle,
            pontosControleComTarefas,
            tarefas,
            tarefasOrfas
        };
    }

    // --------------------------------------------------------
    // SALVAMENTO EM LOTE
    // --------------------------------------------------------

    /**
     * Interface para dados de salvamento em lote
     */

    /**
     * Salvar todas as alterações de uma vez usando transação
     */
    async saveAllChanges(
        pcaItemId: number,
        changes: {
            details?: {
                validacao_dg_tipo?: 'Pendente' | 'Data';
                validacao_dg_data?: string | null;
                fase_atual?: string | null;
            };
            checklist_updates?: Array<{ id: number; status: 'Concluída' | 'Em andamento' | 'Não Iniciada' }>;
            tarefas_updates?: Array<{ id: number; status: 'Não iniciada' | 'Em andamento' | 'Concluída' }>;
        },
        userId: number
    ): Promise<{
        success: boolean;
        message: string;
        saved_count: {
            details: number;
            checklist: number;
            tarefas: number;
        };
    }> {
        const savedCount = {
            details: 0,
            checklist: 0,
            tarefas: 0
        };

        // Validações antes de iniciar a transação
        if (changes.details) {
            if (changes.details.validacao_dg_tipo === 'Data' && !changes.details.validacao_dg_data) {
                throw new Error('Data da validação é obrigatória quando tipo é "Data"');
            }
            if (changes.details.fase_atual && changes.details.fase_atual.length > 20) {
                throw new Error('Fase atual deve ter no máximo 20 caracteres');
            }
        }

        if (changes.checklist_updates) {
            const validChecklistStatus = ['Concluída', 'Em andamento', 'Não Iniciada'];
            for (const update of changes.checklist_updates) {
                if (!validChecklistStatus.includes(update.status)) {
                    throw new Error(`Status de checklist inválido: ${update.status}`);
                }
            }
        }

        if (changes.tarefas_updates) {
            const validTarefaStatus = ['Não iniciada', 'Em andamento', 'Concluída'];
            for (const update of changes.tarefas_updates) {
                if (!validTarefaStatus.includes(update.status)) {
                    throw new Error(`Status de tarefa inválido: ${update.status}`);
                }
            }
        }

        // Executar salvamento em transação
        return transaction(async (client: pg.PoolClient) => {
            // 1. Salvar detalhes se houver alterações
            if (changes.details && Object.keys(changes.details).length > 0) {
                // Verificar se já existe registro de detalhes
                const existingResult = await client.query(
                    'SELECT id FROM pca_item_details WHERE pca_item_id = $1',
                    [pcaItemId]
                );

                // Se mudar para 'Pendente', limpar a data
                let validacaoData = changes.details.validacao_dg_data;
                if (changes.details.validacao_dg_tipo === 'Pendente') {
                    validacaoData = null;
                }

                if (existingResult.rows.length > 0) {
                    // UPDATE
                    await client.query(
                        `UPDATE pca_item_details 
                         SET validacao_dg_tipo = COALESCE($1, validacao_dg_tipo),
                             validacao_dg_data = $2,
                             fase_atual = COALESCE($3, fase_atual),
                             updated_by = $4,
                             updated_at = NOW()
                         WHERE pca_item_id = $5`,
                        [
                            changes.details.validacao_dg_tipo,
                            validacaoData,
                            changes.details.fase_atual,
                            userId,
                            pcaItemId
                        ]
                    );
                } else {
                    // INSERT
                    await client.query(
                        `INSERT INTO pca_item_details 
                         (pca_item_id, validacao_dg_tipo, validacao_dg_data, fase_atual, updated_by)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            pcaItemId,
                            changes.details.validacao_dg_tipo || 'Pendente',
                            validacaoData,
                            changes.details.fase_atual,
                            userId
                        ]
                    );
                }
                savedCount.details = 1;
            }

            // 2. Atualizar checklist se houver alterações
            if (changes.checklist_updates && changes.checklist_updates.length > 0) {
                for (const update of changes.checklist_updates) {
                    await client.query(
                        `UPDATE pca_checklist_items 
                         SET status = $1, updated_by = $2, updated_at = NOW()
                         WHERE id = $3`,
                        [update.status, userId, update.id]
                    );
                    savedCount.checklist++;
                }
            }

            // 3. Atualizar tarefas se houver alterações
            if (changes.tarefas_updates && changes.tarefas_updates.length > 0) {
                for (const update of changes.tarefas_updates) {
                    await client.query(
                        `UPDATE pca_tarefas 
                         SET status = $1, updated_by = $2, updated_at = NOW()
                         WHERE id = $3`,
                        [update.status, userId, update.id]
                    );
                    savedCount.tarefas++;
                }
            }

            return {
                success: true,
                message: 'Todas as alterações foram salvas com sucesso',
                saved_count: savedCount
            };
        });
    }
}

export const pcaDetailsService = new PcaDetailsService();
export default pcaDetailsService;
