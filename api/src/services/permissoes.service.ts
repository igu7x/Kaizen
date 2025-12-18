import { query } from '../config/database.js';

/**
 * Tipos para o sistema de permissões
 */
export type Diretoria = 'SGJT' | 'DPE' | 'DIJUD' | 'DTI' | 'DSTI';

export const DIRETORIAS: Diretoria[] = ['SGJT', 'DPE', 'DIJUD', 'DTI', 'DSTI'];

export interface Aba {
    codigo: string;
    nome: string;
    descricao: string | null;
    icone: string | null;
    ordem: number;
    ativo: boolean;
}

export interface PermissaoDiretoria {
    diretoria: Diretoria;
    aba_codigo: string;
    pode_acessar: boolean;
    apenas_propria_diretoria: boolean;
}

export interface PermissaoUsuario {
    aba_codigo: string;
    aba_nome: string;
    aba_icone: string | null;
    aba_ordem: number;
    pode_acessar: boolean;
    apenas_propria_diretoria: boolean;
}

/**
 * PermissoesService - Gerencia permissões por diretoria
 */
class PermissoesService {
    
    /**
     * Buscar todas as abas da plataforma
     */
    async getAbas(): Promise<Aba[]> {
        const result = await query(
            'SELECT codigo, nome, descricao, icone, ordem, ativo FROM plataforma_abas WHERE ativo = TRUE ORDER BY ordem'
        );
        return result.rows;
    }

    /**
     * Buscar permissões de um usuário específico
     */
    async getPermissoesUsuario(usuarioId: number): Promise<PermissaoUsuario[]> {
        const result = await query(
            'SELECT * FROM obter_permissoes_usuario($1)',
            [usuarioId]
        );
        return result.rows;
    }

    /**
     * Verificar se usuário pode acessar uma aba
     */
    async verificarPermissao(usuarioId: number, abaCodigo: string): Promise<{
        pode_acessar: boolean;
        apenas_propria_diretoria: boolean;
        diretoria_usuario: Diretoria | null;
    }> {
        const result = await query(
            'SELECT * FROM verificar_permissao($1, $2)',
            [usuarioId, abaCodigo]
        );
        
        if (result.rows.length === 0) {
            return {
                pode_acessar: false,
                apenas_propria_diretoria: true,
                diretoria_usuario: null
            };
        }
        
        return result.rows[0];
    }

    /**
     * Buscar permissões de uma diretoria
     */
    async getPermissoesDiretoria(diretoria: Diretoria): Promise<PermissaoDiretoria[]> {
        const result = await query(
            `SELECT pd.diretoria, pd.aba_codigo, pd.pode_acessar, pd.apenas_propria_diretoria
             FROM permissoes_diretoria pd
             WHERE pd.diretoria = $1
             ORDER BY (SELECT ordem FROM plataforma_abas WHERE codigo = pd.aba_codigo)`,
            [diretoria]
        );
        return result.rows;
    }

    /**
     * Buscar todas as permissões (para painel SGJT)
     */
    async getTodasPermissoes(): Promise<{
        diretoria: Diretoria;
        permissoes: Array<{
            aba_codigo: string;
            aba_nome: string;
            pode_acessar: boolean;
            apenas_propria_diretoria: boolean;
        }>;
    }[]> {
        const result = await query(
            `SELECT 
                pd.diretoria,
                pd.aba_codigo,
                pa.nome as aba_nome,
                pd.pode_acessar,
                pd.apenas_propria_diretoria
             FROM permissoes_diretoria pd
             JOIN plataforma_abas pa ON pa.codigo = pd.aba_codigo
             WHERE pa.ativo = TRUE
             ORDER BY pd.diretoria, pa.ordem`
        );

        // Agrupar por diretoria
        const agrupado: Record<string, any[]> = {};
        for (const row of result.rows) {
            if (!agrupado[row.diretoria]) {
                agrupado[row.diretoria] = [];
            }
            agrupado[row.diretoria].push({
                aba_codigo: row.aba_codigo,
                aba_nome: row.aba_nome,
                pode_acessar: row.pode_acessar,
                apenas_propria_diretoria: row.apenas_propria_diretoria
            });
        }

        return Object.entries(agrupado).map(([diretoria, permissoes]) => ({
            diretoria: diretoria as Diretoria,
            permissoes
        }));
    }

    /**
     * Atualizar permissão de uma diretoria para uma aba (apenas SGJT pode fazer isso)
     */
    async atualizarPermissao(
        diretoria: Diretoria,
        abaCodigo: string,
        podeAcessar: boolean,
        apenasPropriaDiretoria: boolean,
        usuarioId: number
    ): Promise<PermissaoDiretoria> {
        // Verificar se usuário é SGJT
        const userCheck = await query(
            'SELECT diretoria FROM users WHERE id = $1 AND is_deleted = FALSE',
            [usuarioId]
        );
        
        if (userCheck.rows.length === 0 || userCheck.rows[0].diretoria !== 'SGJT') {
            throw new Error('PERMISSAO_NEGADA');
        }

        // Não permitir alterar permissões da SGJT
        if (diretoria === 'SGJT') {
            throw new Error('NAO_PODE_ALTERAR_SGJT');
        }

        const result = await query(
            `INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria, updated_by)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (diretoria, aba_codigo) 
             DO UPDATE SET 
                pode_acessar = EXCLUDED.pode_acessar,
                apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria,
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by
             RETURNING *`,
            [diretoria, abaCodigo, podeAcessar, apenasPropriaDiretoria, usuarioId]
        );

        return result.rows[0];
    }

    /**
     * Atualizar múltiplas permissões de uma diretoria de uma vez
     */
    async atualizarPermissoesDiretoria(
        diretoria: Diretoria,
        permissoes: Array<{
            aba_codigo: string;
            pode_acessar: boolean;
            apenas_propria_diretoria: boolean;
        }>,
        usuarioId: number
    ): Promise<PermissaoDiretoria[]> {
        // Verificar se usuário é SGJT
        const userCheck = await query(
            'SELECT diretoria FROM users WHERE id = $1 AND is_deleted = FALSE',
            [usuarioId]
        );
        
        if (userCheck.rows.length === 0 || userCheck.rows[0].diretoria !== 'SGJT') {
            throw new Error('PERMISSAO_NEGADA');
        }

        // Não permitir alterar permissões da SGJT
        if (diretoria === 'SGJT') {
            throw new Error('NAO_PODE_ALTERAR_SGJT');
        }

        const resultados: PermissaoDiretoria[] = [];

        for (const perm of permissoes) {
            const result = await query(
                `INSERT INTO permissoes_diretoria (diretoria, aba_codigo, pode_acessar, apenas_propria_diretoria, updated_by)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (diretoria, aba_codigo) 
                 DO UPDATE SET 
                    pode_acessar = EXCLUDED.pode_acessar,
                    apenas_propria_diretoria = EXCLUDED.apenas_propria_diretoria,
                    updated_at = NOW(),
                    updated_by = EXCLUDED.updated_by
                 RETURNING *`,
                [diretoria, perm.aba_codigo, perm.pode_acessar, perm.apenas_propria_diretoria, usuarioId]
            );
            resultados.push(result.rows[0]);
        }

        return resultados;
    }

    /**
     * Obter diretoria do usuário
     */
    async getDiretoriaUsuario(usuarioId: number): Promise<Diretoria | null> {
        const result = await query(
            'SELECT diretoria FROM users WHERE id = $1 AND is_deleted = FALSE',
            [usuarioId]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return result.rows[0].diretoria;
    }
}

// Exportar instância singleton
export const permissoesService = new PermissoesService();

