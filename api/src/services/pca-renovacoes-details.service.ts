import { query, transaction } from '../config/database.js';
import { AuditService } from './audit.service.js';
import pg from 'pg';

// ============================================================
// INTERFACES
// ============================================================

export interface RenovacaoDetails {
    id: number;
    renovacao_id: number;
    validacao_dg_tipo: 'Pendente' | 'Data';
    validacao_dg_data: string | null;
    fase_atual: string | null;
    created_at: Date;
    updated_at: Date;
    updated_by: number | null;
}

export interface RenovacaoChecklistItem {
    id: number;
    renovacao_id: number;
    item_nome: string;
    item_ordem: number;
    status: 'Concluída' | 'Em andamento' | 'Não Iniciada';
    created_at: Date;
    updated_at: Date;
    updated_by: number | null;
}

export interface RenovacaoPontoControle {
    id: number;
    renovacao_id: number;
    ponto_controle: string;
    data: string;
    proxima_reuniao: string;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    updated_by: number | null;
}

export interface RenovacaoTarefa {
    id: number;
    renovacao_id: number;
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

export interface RenovacaoPontoControleComTarefas extends RenovacaoPontoControle {
    tarefas: RenovacaoTarefa[];
}

// DTOs
export interface UpdateRenovacaoDetailsDto {
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

// Request para salvar todas as mudanças
export interface SaveAllChangesRequest {
    details?: UpdateRenovacaoDetailsDto;
    checklist_updates?: Array<{ id: number; status: 'Concluída' | 'Em andamento' | 'Não Iniciada' }>;
    tarefas_updates?: Array<{ id: number; status: 'Não iniciada' | 'Em andamento' | 'Concluída'; ponto_controle_id?: number | null }>;
}

// ============================================================
// SERVIÇO DE DETALHES DE RENOVAÇÃO
// ============================================================

class PcaRenovacoesDetailsService {
    private auditService = new AuditService();

    // --------------------------------------------------------
    // DETALHES (Campos Estáticos)
    // --------------------------------------------------------

    async getDetails(renovacaoId: number): Promise<RenovacaoDetails | null> {
        const result = await query(
            `SELECT * FROM pca_item_details WHERE renovacao_id = $1 AND tipo = 'renovacao'`,
            [renovacaoId]
        );
        return result.rows[0] || null;
    }

    async upsertDetails(renovacaoId: number, data: UpdateRenovacaoDetailsDto, userId: number): Promise<RenovacaoDetails> {
        if (data.validacao_dg_tipo === 'Data' && !data.validacao_dg_data) {
            throw new Error('Data da validação é obrigatória quando tipo é "Data"');
        }

        if (data.fase_atual && data.fase_atual.length > 20) {
            throw new Error('Fase atual deve ter no máximo 20 caracteres');
        }

        if (data.validacao_dg_tipo === 'Pendente') {
            data.validacao_dg_data = null;
        }

        const existing = await this.getDetails(renovacaoId);

        if (existing) {
            const result = await query(
                `UPDATE pca_item_details 
                 SET validacao_dg_tipo = COALESCE($1, validacao_dg_tipo),
                     validacao_dg_data = $2,
                     fase_atual = COALESCE($3, fase_atual),
                     updated_by = $4,
                     updated_at = NOW()
                 WHERE renovacao_id = $5 AND tipo = 'renovacao'
                 RETURNING *`,
                [
                    data.validacao_dg_tipo || existing.validacao_dg_tipo,
                    data.validacao_dg_data !== undefined ? data.validacao_dg_data : existing.validacao_dg_data,
                    data.fase_atual !== undefined ? data.fase_atual : existing.fase_atual,
                    userId,
                    renovacaoId
                ]
            );
            return result.rows[0];
        } else {
            const result = await query(
                `INSERT INTO pca_item_details (renovacao_id, tipo, validacao_dg_tipo, validacao_dg_data, fase_atual, updated_by)
                 VALUES ($1, 'renovacao', $2, $3, $4, $5)
                 RETURNING *`,
                [
                    renovacaoId,
                    data.validacao_dg_tipo || 'Pendente',
                    data.validacao_dg_data || null,
                    data.fase_atual || null,
                    userId
                ]
            );
            return result.rows[0];
        }
    }

    // --------------------------------------------------------
    // CHECKLIST
    // --------------------------------------------------------

    async getChecklist(renovacaoId: number): Promise<RenovacaoChecklistItem[]> {
        const result = await query(
            `SELECT * FROM pca_checklist_items 
             WHERE renovacao_id = $1 AND tipo = 'renovacao'
             ORDER BY item_ordem`,
            [renovacaoId]
        );
        return result.rows;
    }

    async updateChecklistStatus(
        checklistId: number,
        status: 'Concluída' | 'Em andamento' | 'Não Iniciada',
        userId: number
    ): Promise<RenovacaoChecklistItem | null> {
        const result = await query(
            `UPDATE pca_checklist_items 
             SET status = $1, updated_by = $2, updated_at = NOW()
             WHERE id = $3 AND tipo = 'renovacao'
             RETURNING *`,
            [status, userId, checklistId]
        );
        return result.rows[0] || null;
    }

    getChecklistProgress(checklist: RenovacaoChecklistItem[]): number {
        if (checklist.length === 0) return 0;
        const completed = checklist.filter(item => item.status === 'Concluída').length;
        return Math.round((completed / checklist.length) * 100);
    }

    // --------------------------------------------------------
    // PONTOS DE CONTROLE
    // --------------------------------------------------------

    async getPontosControle(renovacaoId: number): Promise<RenovacaoPontoControle[]> {
        const result = await query(
            `SELECT * FROM pca_pontos_controle 
             WHERE renovacao_id = $1 AND tipo = 'renovacao'
             ORDER BY data DESC`,
            [renovacaoId]
        );
        return result.rows;
    }

    async getPontosControleComTarefas(renovacaoId: number): Promise<RenovacaoPontoControleComTarefas[]> {
        const pcs = await this.getPontosControle(renovacaoId);
        const result: RenovacaoPontoControleComTarefas[] = [];

        for (const pc of pcs) {
            const tarefasResult = await query(
                `SELECT * FROM pca_tarefas 
                 WHERE ponto_controle_id = $1 AND renovacao_id = $2 AND tipo = 'renovacao'
                 ORDER BY prazo`,
                [pc.id, renovacaoId]
            );
            result.push({
                ...pc,
                tarefas: tarefasResult.rows
            });
        }

        return result;
    }

    async createPontoControle(renovacaoId: number, data: CreatePontoControleDto, userId: number): Promise<RenovacaoPontoControle> {
        const result = await query(
            `INSERT INTO pca_pontos_controle (renovacao_id, tipo, ponto_controle, data, proxima_reuniao, created_by)
             VALUES ($1, 'renovacao', $2, $3, $4, $5)
             RETURNING *`,
            [renovacaoId, data.ponto_controle, data.data, data.proxima_reuniao, userId]
        );
        return result.rows[0];
    }

    async updatePontoControle(pcId: number, data: UpdatePontoControleDto, userId: number): Promise<RenovacaoPontoControle | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.ponto_controle !== undefined) {
            updates.push(`ponto_controle = $${idx++}`);
            values.push(data.ponto_controle);
        }
        if (data.data !== undefined) {
            updates.push(`data = $${idx++}`);
            values.push(data.data);
        }
        if (data.proxima_reuniao !== undefined) {
            updates.push(`proxima_reuniao = $${idx++}`);
            values.push(data.proxima_reuniao);
        }

        if (updates.length === 0) return null;

        updates.push(`updated_by = $${idx++}`);
        values.push(userId);
        values.push(pcId);

        const result = await query(
            `UPDATE pca_pontos_controle 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${idx} AND tipo = 'renovacao'
             RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    async deletePontoControle(pcId: number, deleteTarefas: boolean = false): Promise<boolean> {
        return await transaction(async (client) => {
            if (deleteTarefas) {
                await client.query(
                    `DELETE FROM pca_tarefas WHERE ponto_controle_id = $1 AND tipo = 'renovacao'`,
                    [pcId]
                );
            } else {
                await client.query(
                    `UPDATE pca_tarefas SET ponto_controle_id = NULL WHERE ponto_controle_id = $1 AND tipo = 'renovacao'`,
                    [pcId]
                );
            }

            const result = await client.query(
                `DELETE FROM pca_pontos_controle WHERE id = $1 AND tipo = 'renovacao' RETURNING id`,
                [pcId]
            );
            return result.rowCount !== null && result.rowCount > 0;
        });
    }

    // --------------------------------------------------------
    // TAREFAS
    // --------------------------------------------------------

    async getTarefas(renovacaoId: number): Promise<RenovacaoTarefa[]> {
        const result = await query(
            `SELECT * FROM pca_tarefas 
             WHERE renovacao_id = $1 AND tipo = 'renovacao'
             ORDER BY prazo`,
            [renovacaoId]
        );
        return result.rows;
    }

    async getTarefasOrfas(renovacaoId: number): Promise<RenovacaoTarefa[]> {
        const result = await query(
            `SELECT * FROM pca_tarefas 
             WHERE renovacao_id = $1 AND ponto_controle_id IS NULL AND tipo = 'renovacao'
             ORDER BY prazo`,
            [renovacaoId]
        );
        return result.rows;
    }

    async createTarefa(renovacaoId: number, data: CreateTarefaDto, userId: number): Promise<RenovacaoTarefa> {
        const result = await query(
            `INSERT INTO pca_tarefas (renovacao_id, tipo, ponto_controle_id, tarefa, responsavel, prazo, status, created_by)
             VALUES ($1, 'renovacao', $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                renovacaoId,
                data.ponto_controle_id || null,
                data.tarefa,
                data.responsavel,
                data.prazo,
                data.status || 'Não iniciada',
                userId
            ]
        );
        return result.rows[0];
    }

    async updateTarefa(tarefaId: number, data: UpdateTarefaDto, userId: number): Promise<RenovacaoTarefa | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.tarefa !== undefined) {
            updates.push(`tarefa = $${idx++}`);
            values.push(data.tarefa);
        }
        if (data.responsavel !== undefined) {
            updates.push(`responsavel = $${idx++}`);
            values.push(data.responsavel);
        }
        if (data.prazo !== undefined) {
            updates.push(`prazo = $${idx++}`);
            values.push(data.prazo);
        }
        if (data.status !== undefined) {
            updates.push(`status = $${idx++}`);
            values.push(data.status);
        }
        if (data.ponto_controle_id !== undefined) {
            updates.push(`ponto_controle_id = $${idx++}`);
            values.push(data.ponto_controle_id);
        }

        if (updates.length === 0) return null;

        updates.push(`updated_by = $${idx++}`);
        values.push(userId);
        values.push(tarefaId);

        const result = await query(
            `UPDATE pca_tarefas 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${idx} AND tipo = 'renovacao'
             RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    async deleteTarefa(tarefaId: number): Promise<boolean> {
        const result = await query(
            `DELETE FROM pca_tarefas WHERE id = $1 AND tipo = 'renovacao' RETURNING id`,
            [tarefaId]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    async associarTarefaAPontoControle(tarefaId: number, pontoControleId: number | null, userId: number): Promise<RenovacaoTarefa | null> {
        const result = await query(
            `UPDATE pca_tarefas 
             SET ponto_controle_id = $1, updated_by = $2, updated_at = NOW()
             WHERE id = $3 AND tipo = 'renovacao'
             RETURNING *`,
            [pontoControleId, userId, tarefaId]
        );
        return result.rows[0] || null;
    }

    // --------------------------------------------------------
    // DADOS COMPLETOS
    // --------------------------------------------------------

    async getAllData(renovacaoId: number): Promise<{
        details: RenovacaoDetails | null;
        checklist: RenovacaoChecklistItem[];
        checklistProgress: number;
        pontosControle: RenovacaoPontoControle[];
        pontosControleComTarefas: RenovacaoPontoControleComTarefas[];
        tarefas: RenovacaoTarefa[];
        tarefasOrfas: RenovacaoTarefa[];
    }> {
        const details = await this.getDetails(renovacaoId);
        const checklist = await this.getChecklist(renovacaoId);
        const checklistProgress = this.getChecklistProgress(checklist);
        const pontosControle = await this.getPontosControle(renovacaoId);
        const pontosControleComTarefas = await this.getPontosControleComTarefas(renovacaoId);
        const tarefas = await this.getTarefas(renovacaoId);
        const tarefasOrfas = await this.getTarefasOrfas(renovacaoId);

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
    // SALVAR TODAS AS MUDANÇAS
    // --------------------------------------------------------

    async saveAllChanges(renovacaoId: number, changes: SaveAllChangesRequest, userId: number): Promise<{
        success: boolean;
        saved_count: { details: boolean; checklist: number; tarefas: number };
    }> {
        return await transaction(async (client) => {
            let detailsSaved = false;
            let checklistCount = 0;
            let tarefasCount = 0;

            // Salvar detalhes
            if (changes.details) {
                if (changes.details.validacao_dg_tipo === 'Pendente') {
                    changes.details.validacao_dg_data = null;
                }

                const existing = await this.getDetails(renovacaoId);
                if (existing) {
                    await client.query(
                        `UPDATE pca_item_details 
                         SET validacao_dg_tipo = COALESCE($1, validacao_dg_tipo),
                             validacao_dg_data = $2,
                             fase_atual = COALESCE($3, fase_atual),
                             updated_by = $4,
                             updated_at = NOW()
                         WHERE renovacao_id = $5 AND tipo = 'renovacao'`,
                        [
                            changes.details.validacao_dg_tipo || existing.validacao_dg_tipo,
                            changes.details.validacao_dg_data !== undefined ? changes.details.validacao_dg_data : existing.validacao_dg_data,
                            changes.details.fase_atual !== undefined ? changes.details.fase_atual : existing.fase_atual,
                            userId,
                            renovacaoId
                        ]
                    );
                    detailsSaved = true;
                }
            }

            // Salvar checklist
            if (changes.checklist_updates && changes.checklist_updates.length > 0) {
                for (const item of changes.checklist_updates) {
                    await client.query(
                        `UPDATE pca_checklist_items 
                         SET status = $1, updated_by = $2, updated_at = NOW()
                         WHERE id = $3 AND tipo = 'renovacao'`,
                        [item.status, userId, item.id]
                    );
                    checklistCount++;
                }
            }

            // Salvar tarefas
            if (changes.tarefas_updates && changes.tarefas_updates.length > 0) {
                for (const item of changes.tarefas_updates) {
                    const updates: string[] = ['status = $1'];
                    const values: any[] = [item.status];
                    let idx = 2;

                    if (item.ponto_controle_id !== undefined) {
                        updates.push(`ponto_controle_id = $${idx++}`);
                        values.push(item.ponto_controle_id);
                    }

                    values.push(userId);
                    values.push(item.id);

                    await client.query(
                        `UPDATE pca_tarefas 
                         SET ${updates.join(', ')}, updated_by = $${idx++}, updated_at = NOW()
                         WHERE id = $${idx} AND tipo = 'renovacao'`,
                        values
                    );
                    tarefasCount++;
                }
            }

            return {
                success: true,
                saved_count: {
                    details: detailsSaved,
                    checklist: checklistCount,
                    tarefas: tarefasCount
                }
            };
        });
    }
}

export const pcaRenovacoesDetailsService = new PcaRenovacoesDetailsService();
export default pcaRenovacoesDetailsService;

























