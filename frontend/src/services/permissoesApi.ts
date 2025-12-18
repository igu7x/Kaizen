import { apiClient } from './apiClient';

// Helper para obter userId do localStorage
const getUserId = (): string | null => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user?.id?.toString() || null;
        }
    } catch (e) {
        console.warn('Erro ao parsear user do localStorage');
    }
    return null;
};

// Tipos
export type Diretoria = 'SGJT' | 'DPE' | 'DIJUD' | 'DTI' | 'DSTI';

export const DIRETORIAS: Diretoria[] = ['SGJT', 'DPE', 'DIJUD', 'DTI', 'DSTI'];

export const DIRETORIAS_LABELS: Record<Diretoria, string> = {
    'SGJT': 'Secretaria de Governança Judiciária e TI',
    'DPE': 'Diretoria de Processo Eletrônico',
    'DIJUD': 'Diretoria de Informática Judiciária',
    'DTI': 'Diretoria de Tecnologia da Informação',
    'DSTI': 'Diretoria de Suporte em TI'
};

export interface Aba {
    codigo: string;
    nome: string;
    descricao: string | null;
    icone: string | null;
    ordem: number;
    ativo: boolean;
}

export interface PermissaoUsuario {
    aba_codigo: string;
    aba_nome: string;
    aba_icone: string | null;
    aba_ordem: number;
    pode_acessar: boolean;
    apenas_propria_diretoria: boolean;
}

export interface PermissaoDiretoria {
    aba_codigo: string;
    aba_nome: string;
    pode_acessar: boolean;
    apenas_propria_diretoria: boolean;
}

export interface MinhasPermissoes {
    diretoria: Diretoria | null;
    permissoes: PermissaoUsuario[];
}

export interface TodasPermissoes {
    abas: Aba[];
    permissoes_por_diretoria: Array<{
        diretoria: Diretoria;
        permissoes: PermissaoDiretoria[];
    }>;
}

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Buscar todas as abas da plataforma
 */
export const getAbas = async (): Promise<Aba[]> => {
    return apiClient.get<Aba[]>('/api/permissoes/abas');
};

/**
 * Buscar permissões do usuário logado
 */
export const getMinhasPermissoes = async (): Promise<MinhasPermissoes> => {
    const userId = getUserId();
    const headers: Record<string, string> = {};
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    return apiClient.get<MinhasPermissoes>('/api/permissoes/minha', { headers });
};

/**
 * Buscar permissões de um usuário específico
 */
export const getPermissoesUsuario = async (usuarioId: number): Promise<PermissaoUsuario[]> => {
    return apiClient.get<PermissaoUsuario[]>(`/api/permissoes/usuario/${usuarioId}`);
};

/**
 * Verificar se pode acessar uma aba
 */
export const verificarPermissao = async (abaCodigo: string): Promise<{
    pode_acessar: boolean;
    apenas_propria_diretoria: boolean;
    diretoria_usuario: Diretoria | null;
}> => {
    const userId = getUserId();
    const headers: Record<string, string> = {};
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    return apiClient.get(`/api/permissoes/verificar/${abaCodigo}`, { headers });
};

/**
 * Buscar permissões de uma diretoria
 */
export const getPermissoesDiretoria = async (diretoria: Diretoria): Promise<PermissaoDiretoria[]> => {
    return apiClient.get<PermissaoDiretoria[]>(`/api/permissoes/diretoria/${diretoria}`);
};

/**
 * Buscar todas as permissões (apenas SGJT)
 * Não faz logout em caso de erro - pode ser que as tabelas não existam ainda
 */
export const getTodasPermissoes = async (): Promise<TodasPermissoes> => {
    const userId = getUserId();
    const headers: Record<string, string> = {};
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    
    try {
        return await apiClient.get<TodasPermissoes>('/api/permissoes/todas', { headers });
    } catch (error: any) {
        console.warn('Erro ao buscar permissões (tabelas podem não existir):', error.message);
        throw error;
    }
};

/**
 * Atualizar permissões de uma diretoria (apenas SGJT)
 */
export const atualizarPermissoesDiretoria = async (
    diretoria: Diretoria,
    permissoes: Array<{
        aba_codigo: string;
        pode_acessar: boolean;
        apenas_propria_diretoria: boolean;
    }>
): Promise<{ success: boolean; message: string }> => {
    const userId = getUserId();
    const headers: Record<string, string> = {};
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    return apiClient.put(`/api/permissoes/diretoria/${diretoria}`, { permissoes }, { headers });
};

/**
 * Atualizar uma permissão específica (apenas SGJT)
 */
export const atualizarPermissao = async (
    diretoria: Diretoria,
    abaCodigo: string,
    podeAcessar: boolean,
    apenasPropriaDiretoria: boolean
): Promise<{ success: boolean }> => {
    const userId = getUserId();
    const headers: Record<string, string> = {};
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    return apiClient.put(`/api/permissoes/diretoria/${diretoria}/aba/${abaCodigo}`, {
        pode_acessar: podeAcessar,
        apenas_propria_diretoria: apenasPropriaDiretoria
    }, { headers });
};

// ============================================================
// EXPORT
// ============================================================

export const permissoesApi = {
    getAbas,
    getMinhasPermissoes,
    getPermissoesUsuario,
    verificarPermissao,
    getPermissoesDiretoria,
    getTodasPermissoes,
    atualizarPermissoesDiretoria,
    atualizarPermissao
};

export default permissoesApi;

