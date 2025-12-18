import { query } from '../config/database.js';
import { AuditService } from './audit.service.js';

// ============================================================
// INTERFACES
// ============================================================

export interface Comite {
    id: number;
    nome: string;
    sigla: string;
    descricao: string | null;
    icone: string | null;
    cor: string;
    ordem: number;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    updated_by: number | null;
}

export interface ComiteMembro {
    id: number;
    comite_id: number;
    nome: string;
    cargo: string;
    ordem: number;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ComiteReuniao {
    id: number;
    comite_id: number;
    numero: number;
    ano: number;
    data: string;
    mes: string | null;
    status: 'Previsto' | 'Realizada' | 'Cancelada';
    titulo: string | null;
    observacoes: string | null;
    link_proad: string | null;
    link_transparencia: string | null;
    link_ata: string | null;
    // Campos de ata (PDF upload)
    ata_filename: string | null;
    ata_filepath: string | null;
    ata_filesize: number | null;
    ata_uploaded_at: Date | null;
    ata_uploaded_by: number | null;
    created_at: Date;
    updated_at: Date;
}

export interface ComiteReuniaoPauta {
    id: number;
    reuniao_id: number;
    numero_item: number;
    descricao: string;
    ordem: number;
    created_at: Date;
    updated_at: Date;
}

export interface ComiteQuadroControle {
    id: number;
    comite_id: number;
    item: string;
    discussao_contexto: string | null;
    deliberacao: string | null;
    decisao_encaminhamento: string | null;
    acoes_atividades: string | null;
    responsavel: string | null;
    prazo: string | null;
    observacoes: string | null;
    status: 'Andamento' | 'Concluída' | 'Cancelada';
    ordem: number;
    created_at: Date;
    updated_at: Date;
}

// ============================================================
// DTOs
// ============================================================

export interface UpdateComiteDto {
    nome?: string;
    descricao?: string;
    icone?: string;
    cor?: string;
    ordem?: number;
}

export interface CreateMembroDto {
    nome: string;
    cargo: string;
    ordem?: number;
}

export interface UpdateMembroDto {
    nome?: string;
    cargo?: string;
    ordem?: number;
}

export interface CreateReuniaoDto {
    numero: number;
    ano: number;
    data: string;
    mes?: string;
    status?: 'Previsto' | 'Realizada' | 'Cancelada';
    titulo?: string;
    observacoes?: string;
    link_proad?: string;
    link_transparencia?: string;
    link_ata?: string;
}

export interface UpdateReuniaoDto {
    numero?: number;
    ano?: number;
    data?: string;
    mes?: string;
    status?: 'Previsto' | 'Realizada' | 'Cancelada';
    titulo?: string;
    observacoes?: string;
    link_proad?: string;
    link_transparencia?: string;
    link_ata?: string;
}

export interface UpdateReuniaoAtaDto {
    ata_filename: string | null;
    ata_filepath: string | null;
    ata_filesize: number | null;
}

export interface CreatePautaDto {
    numero_item: number;
    descricao: string;
    ordem?: number;
}

export interface UpdatePautaDto {
    numero_item?: number;
    descricao?: string;
    ordem?: number;
}

export interface CreateQuadroControleDto {
    item: string;
    discussao_contexto?: string;
    deliberacao?: string;
    decisao_encaminhamento?: string;
    acoes_atividades?: string;
    responsavel?: string;
    prazo?: string;
    observacoes?: string;
    status?: 'Andamento' | 'Concluída' | 'Cancelada';
    ordem?: number;
}

export interface UpdateQuadroControleDto {
    item?: string;
    discussao_contexto?: string;
    deliberacao?: string;
    decisao_encaminhamento?: string;
    acoes_atividades?: string;
    responsavel?: string;
    prazo?: string;
    observacoes?: string;
    status?: 'Andamento' | 'Concluída' | 'Cancelada';
    ordem?: number;
}

// ============================================================
// SERVIÇO DE COMITÊS
// ============================================================

class ComitesService {
    private auditService = new AuditService();

    // ========================================
    // COMITÊS
    // ========================================

    /**
     * Listar todos os comitês ativos
     */
    async findAll(): Promise<Comite[]> {
        const result = await query(
            `SELECT * FROM comites 
             WHERE ativo = TRUE 
             ORDER BY ordem ASC`
        );
        return result.rows;
    }

    /**
     * Buscar comitê por ID
     */
    async findById(id: number): Promise<Comite | null> {
        const result = await query(
            `SELECT * FROM comites WHERE id = $1 AND ativo = TRUE`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Buscar comitê por sigla
     */
    async findBySigla(sigla: string): Promise<Comite | null> {
        const result = await query(
            `SELECT * FROM comites WHERE UPPER(sigla) = UPPER($1) AND ativo = TRUE`,
            [sigla]
        );
        return result.rows[0] || null;
    }

    /**
     * Atualizar comitê
     */
    async update(id: number, data: UpdateComiteDto, userId: number): Promise<Comite | null> {
        const oldRecord = await this.findById(id);
        if (!oldRecord) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.nome !== undefined) {
            updates.push(`nome = $${paramIndex++}`);
            values.push(data.nome);
        }
        if (data.descricao !== undefined) {
            updates.push(`descricao = $${paramIndex++}`);
            values.push(data.descricao);
        }
        if (data.icone !== undefined) {
            updates.push(`icone = $${paramIndex++}`);
            values.push(data.icone);
        }
        if (data.cor !== undefined) {
            updates.push(`cor = $${paramIndex++}`);
            values.push(data.cor);
        }
        if (data.ordem !== undefined) {
            updates.push(`ordem = $${paramIndex++}`);
            values.push(data.ordem);
        }

        updates.push(`updated_by = $${paramIndex++}`);
        values.push(userId);
        values.push(id);

        if (updates.length === 1) return oldRecord;

        const result = await query(
            `UPDATE comites 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex} AND ativo = TRUE
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) return null;

        await this.auditService.log({
            table_name: 'comites',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    // ========================================
    // MEMBROS
    // ========================================

    /**
     * Listar membros de um comitê
     */
    async findMembros(comiteId: number): Promise<ComiteMembro[]> {
        const result = await query(
            `SELECT * FROM comite_membros 
             WHERE comite_id = $1 AND ativo = TRUE
             ORDER BY ordem ASC`,
            [comiteId]
        );
        return result.rows;
    }

    /**
     * Buscar membro por ID
     */
    async findMembroById(id: number): Promise<ComiteMembro | null> {
        const result = await query(
            `SELECT * FROM comite_membros WHERE id = $1 AND ativo = TRUE`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar membro
     */
    async createMembro(comiteId: number, data: CreateMembroDto, userId: number): Promise<ComiteMembro> {
        const result = await query(
            `INSERT INTO comite_membros (comite_id, nome, cargo, ordem, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $5)
             RETURNING *`,
            [comiteId, data.nome, data.cargo, data.ordem || 0, userId]
        );

        await this.auditService.log({
            table_name: 'comite_membros',
            record_id: result.rows[0].id,
            action: 'INSERT',
            user_id: userId,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar membro
     */
    async updateMembro(id: number, data: UpdateMembroDto, userId: number): Promise<ComiteMembro | null> {
        const oldRecord = await this.findMembroById(id);
        if (!oldRecord) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.nome !== undefined) {
            updates.push(`nome = $${paramIndex++}`);
            values.push(data.nome);
        }
        if (data.cargo !== undefined) {
            updates.push(`cargo = $${paramIndex++}`);
            values.push(data.cargo);
        }
        if (data.ordem !== undefined) {
            updates.push(`ordem = $${paramIndex++}`);
            values.push(data.ordem);
        }

        updates.push(`updated_by = $${paramIndex++}`);
        values.push(userId);
        values.push(id);

        if (updates.length === 1) return oldRecord;

        const result = await query(
            `UPDATE comite_membros 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex} AND ativo = TRUE
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) return null;

        await this.auditService.log({
            table_name: 'comite_membros',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Remover membro (soft delete)
     */
    async deleteMembro(id: number, userId: number): Promise<boolean> {
        const existing = await this.findMembroById(id);
        if (!existing) return false;

        await query(
            `UPDATE comite_membros SET ativo = FALSE WHERE id = $1`,
            [id]
        );

        await this.auditService.log({
            table_name: 'comite_membros',
            record_id: id,
            action: 'SOFT_DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }

    // ========================================
    // REUNIÕES
    // ========================================

    /**
     * Listar reuniões de um comitê
     */
    async findReunioes(comiteId: number, ano?: number): Promise<ComiteReuniao[]> {
        let queryText = `SELECT * FROM comite_reunioes WHERE comite_id = $1`;
        const params: any[] = [comiteId];

        if (ano) {
            queryText += ` AND ano = $2`;
            params.push(ano);
        }

        queryText += ` ORDER BY data ASC`;

        const result = await query(queryText, params);
        return result.rows;
    }

    /**
     * Buscar reunião por ID
     */
    async findReuniaoById(id: number): Promise<ComiteReuniao | null> {
        const result = await query(
            `SELECT * FROM comite_reunioes WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar reunião
     */
    async createReuniao(comiteId: number, data: CreateReuniaoDto, userId: number): Promise<ComiteReuniao> {
        const result = await query(
            `INSERT INTO comite_reunioes 
             (comite_id, numero, ano, data, mes, status, titulo, observacoes, link_proad, link_transparencia, link_ata, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
             RETURNING *`,
            [
                comiteId,
                data.numero,
                data.ano,
                data.data,
                data.mes || null,
                data.status || 'Previsto',
                data.titulo || `Reunião ${data.numero} - ${data.ano}`,
                data.observacoes || null,
                data.link_proad || null,
                data.link_transparencia || null,
                data.link_ata || null,
                userId
            ]
        );

        await this.auditService.log({
            table_name: 'comite_reunioes',
            record_id: result.rows[0].id,
            action: 'INSERT',
            user_id: userId,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar reunião
     */
    async updateReuniao(id: number, data: UpdateReuniaoDto, userId: number): Promise<ComiteReuniao | null> {
        const oldRecord = await this.findReuniaoById(id);
        if (!oldRecord) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const fields = ['numero', 'ano', 'data', 'mes', 'status', 'titulo', 'observacoes', 'link_proad', 'link_transparencia', 'link_ata'];
        
        for (const field of fields) {
            if ((data as any)[field] !== undefined) {
                updates.push(`${field} = $${paramIndex++}`);
                values.push((data as any)[field]);
            }
        }

        updates.push(`updated_by = $${paramIndex++}`);
        values.push(userId);
        values.push(id);

        if (updates.length === 1) return oldRecord;

        const result = await query(
            `UPDATE comite_reunioes 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) return null;

        await this.auditService.log({
            table_name: 'comite_reunioes',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Remover reunião
     */
    async deleteReuniao(id: number, userId: number): Promise<boolean> {
        const existing = await this.findReuniaoById(id);
        if (!existing) return false;

        await query(`DELETE FROM comite_reunioes WHERE id = $1`, [id]);

        await this.auditService.log({
            table_name: 'comite_reunioes',
            record_id: id,
            action: 'DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }

    /**
     * Atualizar informações da ata (PDF upload)
     */
    async updateReuniaoAta(id: number, data: UpdateReuniaoAtaDto, userId: number): Promise<ComiteReuniao | null> {
        const oldRecord = await this.findReuniaoById(id);
        if (!oldRecord) return null;

        let result;
        
        if (data.ata_filename === null) {
            // Remover ata
            result = await query(
                `UPDATE comite_reunioes 
                 SET ata_filename = NULL, 
                     ata_filepath = NULL, 
                     ata_filesize = NULL, 
                     ata_uploaded_at = NULL,
                     ata_uploaded_by = NULL,
                     updated_at = NOW(),
                     updated_by = $1
                 WHERE id = $2
                 RETURNING *`,
                [userId, id]
            );
        } else {
            // Adicionar/atualizar ata
            result = await query(
                `UPDATE comite_reunioes 
                 SET ata_filename = $1, 
                     ata_filepath = $2, 
                     ata_filesize = $3, 
                     ata_uploaded_at = NOW(),
                     ata_uploaded_by = $4,
                     updated_at = NOW(),
                     updated_by = $4
                 WHERE id = $5
                 RETURNING *`,
                [data.ata_filename, data.ata_filepath, data.ata_filesize, userId, id]
            );
        }

        if (result.rows.length === 0) return null;

        await this.auditService.log({
            table_name: 'comite_reunioes',
            record_id: id,
            action: 'UPDATE_ATA',
            user_id: userId,
            old_values: { ata_filename: oldRecord.ata_filename, ata_filepath: oldRecord.ata_filepath },
            new_values: { ata_filename: data.ata_filename, ata_filepath: data.ata_filepath }
        });

        return result.rows[0];
    }

    // ========================================
    // PAUTA
    // ========================================

    /**
     * Listar itens da pauta de uma reunião
     */
    async findPauta(reuniaoId: number): Promise<ComiteReuniaoPauta[]> {
        const result = await query(
            `SELECT * FROM comite_reuniao_pauta 
             WHERE reuniao_id = $1
             ORDER BY ordem ASC, numero_item ASC`,
            [reuniaoId]
        );
        return result.rows;
    }

    /**
     * Buscar item da pauta por ID
     */
    async findPautaById(id: number): Promise<ComiteReuniaoPauta | null> {
        const result = await query(
            `SELECT * FROM comite_reuniao_pauta WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar item da pauta
     */
    async createPauta(reuniaoId: number, data: CreatePautaDto, userId: number): Promise<ComiteReuniaoPauta> {
        const result = await query(
            `INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $5)
             RETURNING *`,
            [reuniaoId, data.numero_item, data.descricao, data.ordem || data.numero_item, userId]
        );

        await this.auditService.log({
            table_name: 'comite_reuniao_pauta',
            record_id: result.rows[0].id,
            action: 'INSERT',
            user_id: userId,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar item da pauta
     */
    async updatePauta(id: number, data: UpdatePautaDto, userId: number): Promise<ComiteReuniaoPauta | null> {
        const oldRecord = await this.findPautaById(id);
        if (!oldRecord) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.numero_item !== undefined) {
            updates.push(`numero_item = $${paramIndex++}`);
            values.push(data.numero_item);
        }
        if (data.descricao !== undefined) {
            updates.push(`descricao = $${paramIndex++}`);
            values.push(data.descricao);
        }
        if (data.ordem !== undefined) {
            updates.push(`ordem = $${paramIndex++}`);
            values.push(data.ordem);
        }

        updates.push(`updated_by = $${paramIndex++}`);
        values.push(userId);
        values.push(id);

        if (updates.length === 1) return oldRecord;

        const result = await query(
            `UPDATE comite_reuniao_pauta 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) return null;

        await this.auditService.log({
            table_name: 'comite_reuniao_pauta',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Remover item da pauta
     */
    async deletePauta(id: number, userId: number): Promise<boolean> {
        const existing = await this.findPautaById(id);
        if (!existing) return false;

        await query(`DELETE FROM comite_reuniao_pauta WHERE id = $1`, [id]);

        await this.auditService.log({
            table_name: 'comite_reuniao_pauta',
            record_id: id,
            action: 'DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }

    // ========================================
    // QUADRO DE CONTROLE
    // ========================================

    /**
     * Listar itens do quadro de controle
     */
    async findQuadroControle(comiteId: number): Promise<ComiteQuadroControle[]> {
        const result = await query(
            `SELECT * FROM comite_quadro_controle 
             WHERE comite_id = $1
             ORDER BY ordem ASC, created_at DESC`,
            [comiteId]
        );
        return result.rows;
    }

    /**
     * Buscar item do quadro por ID
     */
    async findQuadroControleById(id: number): Promise<ComiteQuadroControle | null> {
        const result = await query(
            `SELECT * FROM comite_quadro_controle WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Criar item no quadro de controle
     */
    async createQuadroControle(comiteId: number, data: CreateQuadroControleDto, userId: number): Promise<ComiteQuadroControle> {
        // Helper para converter string vazia em null
        const toNull = (val: any) => val === '' ? null : (val || null);
        
        const result = await query(
            `INSERT INTO comite_quadro_controle 
             (comite_id, item, discussao_contexto, deliberacao, decisao_encaminhamento, acoes_atividades, responsavel, prazo, observacoes, status, ordem, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
             RETURNING *`,
            [
                comiteId,
                data.item,
                toNull(data.discussao_contexto),
                toNull(data.deliberacao),
                toNull(data.decisao_encaminhamento),
                toNull(data.acoes_atividades),
                toNull(data.responsavel),
                toNull(data.prazo),
                toNull(data.observacoes),
                data.status || 'Andamento',
                data.ordem || 0,
                userId
            ]
        );

        await this.auditService.log({
            table_name: 'comite_quadro_controle',
            record_id: result.rows[0].id,
            action: 'INSERT',
            user_id: userId,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Atualizar item do quadro de controle
     */
    async updateQuadroControle(id: number, data: UpdateQuadroControleDto, userId: number): Promise<ComiteQuadroControle | null> {
        const oldRecord = await this.findQuadroControleById(id);
        if (!oldRecord) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const fields = ['item', 'discussao_contexto', 'deliberacao', 'decisao_encaminhamento', 'acoes_atividades', 'responsavel', 'prazo', 'observacoes', 'status', 'ordem'];
        
        for (const field of fields) {
            if ((data as any)[field] !== undefined) {
                updates.push(`${field} = $${paramIndex++}`);
                // Converter string vazia para null (especialmente importante para campos date como 'prazo')
                const value = (data as any)[field];
                values.push(value === '' ? null : value);
            }
        }

        updates.push(`updated_by = $${paramIndex++}`);
        values.push(userId);
        values.push(id);

        if (updates.length === 1) return oldRecord;

        const result = await query(
            `UPDATE comite_quadro_controle 
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) return null;

        await this.auditService.log({
            table_name: 'comite_quadro_controle',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: result.rows[0]
        });

        return result.rows[0];
    }

    /**
     * Remover item do quadro de controle
     */
    async deleteQuadroControle(id: number, userId: number): Promise<boolean> {
        const existing = await this.findQuadroControleById(id);
        if (!existing) return false;

        await query(`DELETE FROM comite_quadro_controle WHERE id = $1`, [id]);

        await this.auditService.log({
            table_name: 'comite_quadro_controle',
            record_id: id,
            action: 'DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }
}

export const comitesService = new ComitesService();
export default comitesService;


