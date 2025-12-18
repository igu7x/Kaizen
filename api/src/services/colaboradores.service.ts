import { query } from '../config/database.js';
import { BaseService } from './base.service.js';

/**
 * Diretorias válidas
 */
export type Diretoria = 'DIJUD' | 'DPE' | 'DTI' | 'DSTI' | 'SGJT';

export const DIRETORIAS: Diretoria[] = ['DIJUD', 'DPE', 'DTI', 'DSTI', 'SGJT'];

/**
 * Interface do colaborador no banco de dados
 */
export interface ColaboradorEntity {
    id: number;
    colaborador: string;
    unidade_lotacao: string;
    situacao_funcional: string;
    nome_cc_fc: string | null;
    classe_cc_fc: string | null;
    cargo_efetivo: string | null;
    classe_efetivo: string | null;
    diretoria: Diretoria;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    updated_by: number | null;
    is_deleted: boolean;
    deleted_at: Date | null;
    deleted_by: number | null;
}

/**
 * DTO para criação de colaborador
 */
export interface CreateColaboradorDto {
    colaborador: string;
    unidade_lotacao: string;
    situacao_funcional: string;
    nome_cc_fc?: string | null;
    classe_cc_fc?: string | null;
    cargo_efetivo?: string | null;
    classe_efetivo?: string | null;
    diretoria: Diretoria;
}

/**
 * DTO para atualização de colaborador
 */
export interface UpdateColaboradorDto {
    colaborador?: string;
    unidade_lotacao?: string;
    situacao_funcional?: string;
    nome_cc_fc?: string | null;
    classe_cc_fc?: string | null;
    cargo_efetivo?: string | null;
    classe_efetivo?: string | null;
    diretoria?: Diretoria;
}

/**
 * DTO de resposta (sem campos de auditoria internos)
 */
export interface ColaboradorResponseDto {
    id: number;
    colaborador: string;
    unidade_lotacao: string;
    situacao_funcional: string;
    nome_cc_fc: string | null;
    classe_cc_fc: string | null;
    cargo_efetivo: string | null;
    classe_efetivo: string | null;
    diretoria: Diretoria;
    created_at: Date;
    updated_at: Date;
}

/**
 * Interface das estatísticas
 */
export interface EstatisticasDto {
    total_colaboradores: number;
    total_estatutarios: number;
    total_cedidos: number;
    total_comissionados: number;
    total_terceirizados: number;
    total_residentes: number;
    total_estagiarios: number;
    percentual_estatutarios: number;
    percentual_cedidos: number;
    percentual_comissionados: number;
    percentual_terceirizados: number;
    percentual_residentes: number;
    percentual_estagiarios: number;
}

/**
 * Situações funcionais válidas
 */
export const SITUACOES_FUNCIONAIS = [
    'ESTATUTÁRIO',
    'NOMEADO EM COMISSÃO - INSS',
    'CEDIDO',
    'TERCEIRIZADO',
    'RESIDENTE',
    'ESTAGIÁRIO'
] as const;

export type SituacaoFuncional = typeof SITUACOES_FUNCIONAIS[number];

/**
 * ColaboradoresService - Serviço para operações de colaboradores
 */
export class ColaboradoresService extends BaseService<ColaboradorEntity, CreateColaboradorDto, UpdateColaboradorDto> {
    constructor() {
        super('pessoas_colaboradores');
    }

    /**
     * Mapear entidade para DTO de resposta
     */
    private toResponseDto(entity: ColaboradorEntity): ColaboradorResponseDto {
        return {
            id: entity.id,
            colaborador: entity.colaborador,
            unidade_lotacao: entity.unidade_lotacao,
            situacao_funcional: entity.situacao_funcional,
            nome_cc_fc: entity.nome_cc_fc,
            classe_cc_fc: entity.classe_cc_fc,
            cargo_efetivo: entity.cargo_efetivo,
            classe_efetivo: entity.classe_efetivo,
            diretoria: entity.diretoria,
            created_at: entity.created_at,
            updated_at: entity.updated_at
        };
    }

    /**
     * Buscar todos os colaboradores (retorna DTO)
     * @param diretoria - Filtrar por diretoria (opcional)
     */
    async findAllColaboradores(diretoria?: Diretoria, orderBy: string = 'colaborador'): Promise<ColaboradorResponseDto[]> {
        let colaboradores: ColaboradorEntity[];
        
        if (diretoria) {
            colaboradores = await this.findAll('diretoria = $1', [diretoria], orderBy);
        } else {
            colaboradores = await this.findAll('', [], orderBy);
        }
        
        return colaboradores.map(c => this.toResponseDto(c));
    }

    /**
     * Buscar colaborador por ID (retorna DTO)
     */
    async findColaboradorById(id: number): Promise<ColaboradorResponseDto | null> {
        const colaborador = await this.findOne(id);
        if (!colaborador) return null;
        return this.toResponseDto(colaborador);
    }

    /**
     * Criar novo colaborador
     */
    async createColaborador(data: CreateColaboradorDto, userId: number | null): Promise<ColaboradorResponseDto> {
        // Validar situação funcional
        if (!SITUACOES_FUNCIONAIS.includes(data.situacao_funcional as SituacaoFuncional)) {
            throw new Error('SITUACAO_FUNCIONAL_INVALIDA');
        }

        // Validar diretoria
        if (!DIRETORIAS.includes(data.diretoria)) {
            throw new Error('DIRETORIA_INVALIDA');
        }

        const result = await query(
            `INSERT INTO pessoas_colaboradores (
                colaborador, unidade_lotacao, situacao_funcional,
                nome_cc_fc, classe_cc_fc, cargo_efetivo, classe_efetivo, diretoria
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                data.colaborador,
                data.unidade_lotacao,
                data.situacao_funcional,
                data.nome_cc_fc || null,
                data.classe_cc_fc || null,
                data.cargo_efetivo || null,
                data.classe_efetivo || null,
                data.diretoria
            ]
        );

        const created = result.rows[0];

        // Registrar no audit log (se tiver userId)
        if (userId) {
            await this.auditService.log({
                table_name: 'pessoas_colaboradores',
                record_id: created.id,
                action: 'INSERT',
                user_id: userId,
                new_values: created
            });
        }

        return this.toResponseDto(created);
    }

    /**
     * Atualizar colaborador
     */
    async updateColaborador(id: number, data: UpdateColaboradorDto, userId: number | null): Promise<ColaboradorResponseDto | null> {
        const existing = await this.findOne(id);
        if (!existing) {
            return null;
        }

        // Validar situação funcional se foi fornecida
        if (data.situacao_funcional && !SITUACOES_FUNCIONAIS.includes(data.situacao_funcional as SituacaoFuncional)) {
            throw new Error('SITUACAO_FUNCIONAL_INVALIDA');
        }

        // Validar diretoria se foi fornecida
        if (data.diretoria && !DIRETORIAS.includes(data.diretoria)) {
            throw new Error('DIRETORIA_INVALIDA');
        }

        // Construir query dinamicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.colaborador !== undefined) {
            updates.push(`colaborador = $${paramCount++}`);
            values.push(data.colaborador);
        }
        if (data.unidade_lotacao !== undefined) {
            updates.push(`unidade_lotacao = $${paramCount++}`);
            values.push(data.unidade_lotacao);
        }
        if (data.situacao_funcional !== undefined) {
            updates.push(`situacao_funcional = $${paramCount++}`);
            values.push(data.situacao_funcional);
        }
        if (data.nome_cc_fc !== undefined) {
            updates.push(`nome_cc_fc = $${paramCount++}`);
            values.push(data.nome_cc_fc || null);
        }
        if (data.classe_cc_fc !== undefined) {
            updates.push(`classe_cc_fc = $${paramCount++}`);
            values.push(data.classe_cc_fc || null);
        }
        if (data.cargo_efetivo !== undefined) {
            updates.push(`cargo_efetivo = $${paramCount++}`);
            values.push(data.cargo_efetivo || null);
        }
        if (data.classe_efetivo !== undefined) {
            updates.push(`classe_efetivo = $${paramCount++}`);
            values.push(data.classe_efetivo || null);
        }
        if (data.diretoria !== undefined) {
            updates.push(`diretoria = $${paramCount++}`);
            values.push(data.diretoria);
        }

        if (updates.length === 0) {
            return this.toResponseDto(existing);
        }

        // Sempre atualiza updated_at
        updates.push('updated_at = NOW()');

        const result = await query(
            `UPDATE pessoas_colaboradores 
             SET ${updates.join(', ')}
             WHERE id = $${paramCount} AND is_deleted = FALSE
             RETURNING *`,
            [...values, id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const updated = result.rows[0];

        // Registrar no audit log (se tiver userId)
        if (userId) {
            await this.auditService.log({
                table_name: 'pessoas_colaboradores',
                record_id: id,
                action: 'UPDATE',
                user_id: userId,
                old_values: existing,
                new_values: updated
            });
        }

        return this.toResponseDto(updated);
    }

    /**
     * Deletar colaborador (soft delete)
     */
    async deleteColaborador(id: number, userId: number | null): Promise<boolean> {
        // Se não tiver userId, faz delete sem audit
        if (!userId) {
            const result = await query(
                `UPDATE pessoas_colaboradores 
                 SET is_deleted = TRUE, deleted_at = NOW()
                 WHERE id = $1 AND is_deleted = FALSE
                 RETURNING id`,
                [id]
            );
            return result.rows.length > 0;
        }
        return this.softDelete(id, userId);
    }

    /**
     * Buscar estatísticas dos colaboradores
     * @param diretoria - Filtrar por diretoria (opcional)
     */
    async getEstatisticas(diretoria?: Diretoria): Promise<EstatisticasDto> {
        let result;
        
        if (diretoria) {
            result = await query(
                'SELECT * FROM pessoas_estatisticas WHERE diretoria = $1',
                [diretoria]
            );
        } else {
            // Se não filtrar por diretoria, agrega todas
            result = await query(`
                SELECT 
                    SUM(total_colaboradores)::INTEGER AS total_colaboradores,
                    SUM(total_estatutarios)::INTEGER AS total_estatutarios,
                    SUM(total_cedidos)::INTEGER AS total_cedidos,
                    SUM(total_comissionados)::INTEGER AS total_comissionados,
                    SUM(total_terceirizados)::INTEGER AS total_terceirizados,
                    SUM(total_residentes)::INTEGER AS total_residentes,
                    SUM(total_estagiarios)::INTEGER AS total_estagiarios,
                    ROUND((SUM(total_estatutarios)::DECIMAL / NULLIF(SUM(total_colaboradores), 0)) * 100, 0) AS percentual_estatutarios,
                    ROUND((SUM(total_cedidos)::DECIMAL / NULLIF(SUM(total_colaboradores), 0)) * 100, 0) AS percentual_cedidos,
                    ROUND((SUM(total_comissionados)::DECIMAL / NULLIF(SUM(total_colaboradores), 0)) * 100, 0) AS percentual_comissionados,
                    ROUND((SUM(total_terceirizados)::DECIMAL / NULLIF(SUM(total_colaboradores), 0)) * 100, 0) AS percentual_terceirizados,
                    ROUND((SUM(total_residentes)::DECIMAL / NULLIF(SUM(total_colaboradores), 0)) * 100, 0) AS percentual_residentes,
                    ROUND((SUM(total_estagiarios)::DECIMAL / NULLIF(SUM(total_colaboradores), 0)) * 100, 0) AS percentual_estagiarios
                FROM pessoas_estatisticas
            `);
        }

        if (result.rows.length === 0) {
            return {
                total_colaboradores: 0,
                total_estatutarios: 0,
                total_cedidos: 0,
                total_comissionados: 0,
                total_terceirizados: 0,
                total_residentes: 0,
                total_estagiarios: 0,
                percentual_estatutarios: 0,
                percentual_cedidos: 0,
                percentual_comissionados: 0,
                percentual_terceirizados: 0,
                percentual_residentes: 0,
                percentual_estagiarios: 0
            };
        }

        const row = result.rows[0];
        return {
            total_colaboradores: parseInt(row.total_colaboradores) || 0,
            total_estatutarios: parseInt(row.total_estatutarios) || 0,
            total_cedidos: parseInt(row.total_cedidos) || 0,
            total_comissionados: parseInt(row.total_comissionados) || 0,
            total_terceirizados: parseInt(row.total_terceirizados) || 0,
            total_residentes: parseInt(row.total_residentes) || 0,
            total_estagiarios: parseInt(row.total_estagiarios) || 0,
            percentual_estatutarios: parseInt(row.percentual_estatutarios) || 0,
            percentual_cedidos: parseInt(row.percentual_cedidos) || 0,
            percentual_comissionados: parseInt(row.percentual_comissionados) || 0,
            percentual_terceirizados: parseInt(row.percentual_terceirizados) || 0,
            percentual_residentes: parseInt(row.percentual_residentes) || 0,
            percentual_estagiarios: parseInt(row.percentual_estagiarios) || 0
        };
    }

    /**
     * Buscar unidades de lotação distintas (para filtros/autocomplete)
     */
    async getUnidadesLotacao(): Promise<string[]> {
        const result = await query(
            `SELECT DISTINCT unidade_lotacao 
             FROM pessoas_colaboradores 
             WHERE is_deleted = FALSE 
             ORDER BY unidade_lotacao`
        );
        return result.rows.map(r => r.unidade_lotacao);
    }

    // ===================================================================
    // MÉTODOS DO ORGANOGRAMA
    // ===================================================================

    /**
     * Cache para verificação de coluna nome_exibicao (evita múltiplas queries)
     */
    private _hasNomeExibicaoCache: boolean | null = null;
    
    /**
     * Verifica se a coluna nome_exibicao existe na tabela pessoas_organograma_gestores
     */
    private async hasNomeExibicaoColumn(): Promise<boolean> {
        if (this._hasNomeExibicaoCache !== null) {
            return this._hasNomeExibicaoCache;
        }
        
        const colCheck = await query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'pessoas_organograma_gestores' AND column_name = 'nome_exibicao'
        `);
        this._hasNomeExibicaoCache = colCheck.rows.length > 0;
        return this._hasNomeExibicaoCache;
    }

    /**
     * Buscar organograma completo ou filtrado por diretoria
     */
    async getOrganograma(diretoria?: string): Promise<any[]> {
        const hasNomeExibicao = await this.hasNomeExibicaoColumn();
        
        // Query base - adapta dinamicamente baseado na existência da coluna
        let queryText = `
            SELECT 
                id, nome_area, 
                ${hasNomeExibicao ? 'nome_exibicao,' : 'NULL as nome_exibicao,'}
                nome_gestor, nome_cargo, foto_gestor,
                linha_organograma, subordinacao_id, cor_barra, diretoria,
                ordem_exibicao, caminho, caminho_texto, profundidade
            FROM pessoas_organograma_hierarquia
        `;
        
        const params: any[] = [];
        if (diretoria && diretoria !== 'Todas') {
            queryText += ' WHERE diretoria = $1';
            params.push(diretoria);
        }
        
        queryText += ' ORDER BY caminho, ordem_exibicao';
        
        const result = await query(queryText, params);
        return result.rows;
    }

    /**
     * Buscar subordinados diretos de um gestor
     */
    async getSubordinados(gestorId: number): Promise<any[]> {
        const result = await query(
            `SELECT 
                id, nome_area, nome_gestor, nome_cargo, foto_gestor,
                linha_organograma, subordinacao_id, cor_barra, ordem_exibicao
            FROM pessoas_organograma_gestores
            WHERE subordinacao_id = $1 AND ativo = TRUE
            ORDER BY ordem_exibicao`,
            [gestorId]
        );
        return result.rows;
    }

    /**
     * Buscar gestores por linha (nível hierárquico)
     */
    async getGestoresPorLinha(linha: number, diretoria?: string): Promise<any[]> {
        let queryText = `
            SELECT 
                id, nome_area, nome_gestor, nome_cargo, foto_gestor,
                linha_organograma, subordinacao_id, cor_barra, ordem_exibicao
            FROM pessoas_organograma_gestores
            WHERE linha_organograma = $1 AND ativo = TRUE
        `;
        
        const params: any[] = [linha];
        if (diretoria && diretoria !== 'Todas') {
            queryText += ' AND diretoria = $2';
            params.push(diretoria);
        }
        
        queryText += ' ORDER BY ordem_exibicao';
        
        const result = await query(queryText, params);
        return result.rows;
    }

    /**
     * Buscar possíveis pais (todas as áreas de níveis superiores) para subordinação
     * Retorna todos os gestores de linhas anteriores à linha informada
     * @param linha - Linha do organograma (nível)
     * @param diretoria - Diretoria para filtrar (opcional)
     */
    async getPossiveisPais(linha: number, diretoria?: string): Promise<any[]> {
        if (linha <= 1) {
            return [];
        }
        
        // Buscar gestores de níveis superiores (linha 1 até linha-1)
        // Se diretoria for informada, filtra apenas pela diretoria
        let sqlQuery = `SELECT id, nome_area, nome_gestor, nome_cargo, diretoria, linha_organograma
             FROM pessoas_organograma_gestores
             WHERE linha_organograma < $1 AND ativo = TRUE`;
        
        const params: any[] = [linha];
        
        if (diretoria && diretoria !== 'Todas') {
            sqlQuery += ` AND diretoria = $2`;
            params.push(diretoria);
        }
        
        sqlQuery += ` ORDER BY linha_organograma, diretoria, ordem_exibicao`;
        
        const result = await query(sqlQuery, params);
        
        return result.rows;
    }

    /**
     * Criar novo gestor/área no organograma
     */
    async createGestor(data: any, userId: number | null): Promise<any> {
        const {
            nome_area,
            nome_exibicao,
            nome_gestor,
            nome_cargo,
            foto_gestor,
            linha_organograma,
            subordinacao_id,
            cor_barra,
            diretoria,
            ordem_exibicao
        } = data;

        // Validações
        if (linha_organograma < 1 || linha_organograma > 10) {
            throw new Error('LINHA_INVALIDA');
        }

        if (linha_organograma === 1 && subordinacao_id) {
            throw new Error('LINHA_1_SEM_SUBORDINACAO');
        }

        if (linha_organograma > 1 && !subordinacao_id) {
            throw new Error('SUBORDINACAO_OBRIGATORIA');
        }

        // Buscar diretoria do pai se não fornecida
        let diretoriaFinal = diretoria;
        if (linha_organograma > 1 && subordinacao_id && !diretoria) {
            const parent = await query(
                'SELECT diretoria FROM pessoas_organograma_gestores WHERE id = $1',
                [subordinacao_id]
            );
            if (parent.rows.length > 0) {
                diretoriaFinal = parent.rows[0].diretoria;
            }
        }

        // Verificar se a coluna nome_exibicao existe
        const hasNomeExibicao = await this.hasNomeExibicaoColumn();
        
        let result;
        if (hasNomeExibicao) {
            result = await query(
                `INSERT INTO pessoas_organograma_gestores (
                    nome_area, nome_exibicao, nome_gestor, nome_cargo, foto_gestor, linha_organograma,
                    subordinacao_id, cor_barra, diretoria, ordem_exibicao,
                    created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
                RETURNING *`,
                [nome_area, nome_exibicao || null, nome_gestor, nome_cargo, foto_gestor || null, linha_organograma,
                 subordinacao_id || null, cor_barra || null, diretoriaFinal,
                 ordem_exibicao || null, userId]
            );
        } else {
            result = await query(
                `INSERT INTO pessoas_organograma_gestores (
                    nome_area, nome_gestor, nome_cargo, foto_gestor, linha_organograma,
                    subordinacao_id, cor_barra, diretoria, ordem_exibicao,
                    created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
                RETURNING *`,
                [nome_area, nome_gestor, nome_cargo, foto_gestor || null, linha_organograma,
                 subordinacao_id || null, cor_barra || null, diretoriaFinal,
                 ordem_exibicao || null, userId]
            );
        }

        return result.rows[0];
    }

    /**
     * Atualizar gestor/área existente
     */
    async updateGestor(id: number, data: any, userId: number | null): Promise<any | null> {
        const {
            nome_area,
            nome_exibicao,
            nome_gestor,
            nome_cargo,
            foto_gestor,
            linha_organograma,
            subordinacao_id,
            cor_barra,
            diretoria,
            ordem_exibicao
        } = data;

        // Verificar se existe
        const existing = await query(
            'SELECT * FROM pessoas_organograma_gestores WHERE id = $1 AND ativo = TRUE',
            [id]
        );

        if (existing.rows.length === 0) {
            return null;
        }

        // Validações
        if (linha_organograma && (linha_organograma < 1 || linha_organograma > 10)) {
            throw new Error('LINHA_INVALIDA');
        }

        // Se foto_gestor foi enviada, atualizar. Se não, manter a atual
        const fotoFinal = foto_gestor !== undefined ? foto_gestor : existing.rows[0].foto_gestor;

        // Verificar se a coluna nome_exibicao existe
        const hasNomeExibicao = await this.hasNomeExibicaoColumn();
        
        let result;
        if (hasNomeExibicao) {
            result = await query(
                `UPDATE pessoas_organograma_gestores SET
                    nome_area = COALESCE($1, nome_area),
                    nome_exibicao = $2,
                    nome_gestor = COALESCE($3, nome_gestor),
                    nome_cargo = COALESCE($4, nome_cargo),
                    foto_gestor = $5,
                    linha_organograma = COALESCE($6, linha_organograma),
                    subordinacao_id = COALESCE($7, subordinacao_id),
                    cor_barra = COALESCE($8, cor_barra),
                    diretoria = COALESCE($9, diretoria),
                    ordem_exibicao = COALESCE($10, ordem_exibicao),
                    updated_at = NOW(),
                    updated_by = $11
                WHERE id = $12 AND ativo = TRUE
                RETURNING *`,
                [nome_area, nome_exibicao || null, nome_gestor, nome_cargo, fotoFinal, linha_organograma,
                 subordinacao_id, cor_barra, diretoria, ordem_exibicao, userId, id]
            );
        } else {
            result = await query(
                `UPDATE pessoas_organograma_gestores SET
                    nome_area = COALESCE($1, nome_area),
                    nome_gestor = COALESCE($2, nome_gestor),
                    nome_cargo = COALESCE($3, nome_cargo),
                    foto_gestor = $4,
                    linha_organograma = COALESCE($5, linha_organograma),
                    subordinacao_id = COALESCE($6, subordinacao_id),
                    cor_barra = COALESCE($7, cor_barra),
                    diretoria = COALESCE($8, diretoria),
                    ordem_exibicao = COALESCE($9, ordem_exibicao),
                    updated_at = NOW(),
                    updated_by = $10
                WHERE id = $11 AND ativo = TRUE
                RETURNING *`,
                [nome_area, nome_gestor, nome_cargo, fotoFinal, linha_organograma,
                 subordinacao_id, cor_barra, diretoria, ordem_exibicao, userId, id]
            );
        }

        return result.rows[0];
    }

    /**
     * Deletar gestor/área (soft delete)
     */
    async deleteGestor(id: number, userId: number | null): Promise<boolean> {
        // Verificar se tem subordinados
        const subordinados = await query(
            'SELECT COUNT(*) as count FROM pessoas_organograma_gestores WHERE subordinacao_id = $1 AND ativo = TRUE',
            [id]
        );

        if (parseInt(subordinados.rows[0].count) > 0) {
            throw new Error('TEM_SUBORDINADOS');
        }

        const result = await query(
            `UPDATE pessoas_organograma_gestores 
             SET ativo = FALSE, updated_at = NOW(), updated_by = $1
             WHERE id = $2 AND ativo = TRUE`,
            [userId, id]
        );

        return result.rowCount > 0;
    }

    /**
     * Reordenar gestores dentro do mesmo nível (Drag and Drop)
     * @param linha - Linha/nível do organograma
     * @param novaOrdem - Array com {id, ordem} para cada gestor
     * @param userId - ID do usuário que está reordenando
     */
    async reordenarGestores(
        linha: number, 
        novaOrdem: Array<{ id: number; ordem: number }>,
        userId: number | null
    ): Promise<boolean> {
        // Validar que todos os IDs pertencem à mesma linha
        const ids = novaOrdem.map(item => item.id);
        
        const verificacao = await query(
            `SELECT id, linha_organograma FROM pessoas_organograma_gestores 
             WHERE id = ANY($1) AND ativo = TRUE`,
            [ids]
        );

        // Verificar se todos os IDs existem
        if (verificacao.rows.length !== ids.length) {
            throw new Error('IDS_INVALIDOS');
        }

        // Verificar se todos estão na mesma linha
        const linhasDistintas = new Set(verificacao.rows.map(r => r.linha_organograma));
        if (linhasDistintas.size > 1 || !linhasDistintas.has(linha)) {
            throw new Error('LINHAS_DIFERENTES');
        }

        // Atualizar ordem de cada gestor
        for (const item of novaOrdem) {
            await query(
                `UPDATE pessoas_organograma_gestores 
                 SET ordem_exibicao = $1, updated_at = NOW(), updated_by = $2
                 WHERE id = $3 AND ativo = TRUE`,
                [item.ordem, userId, item.id]
            );
        }

        return true;
    }

    /**
     * Buscar gestor por ID (para verificar subordinação)
     */
    async getGestorById(id: number): Promise<any | null> {
        const hasNomeExibicao = await this.hasNomeExibicaoColumn();
        
        const result = await query(
            `SELECT id, nome_area, ${hasNomeExibicao ? 'nome_exibicao,' : 'NULL as nome_exibicao,'} 
                    nome_gestor, nome_cargo, foto_gestor,
                    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
             FROM pessoas_organograma_gestores
             WHERE id = $1 AND ativo = TRUE`,
            [id]
        );
        
        return result.rows[0] || null;
    }
}

// Singleton instance
export const colaboradoresService = new ColaboradoresService();

