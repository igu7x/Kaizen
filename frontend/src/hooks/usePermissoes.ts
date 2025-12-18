import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { permissoesApi, PermissaoUsuario, Diretoria, MinhasPermissoes } from '@/services/permissoesApi';
import { Directorate, DIRECTORATES } from '@/types';

export interface UsePermissoesReturn {
    // Estado
    loading: boolean;
    permissoes: PermissaoUsuario[];
    diretoriaUsuario: Diretoria | null;
    
    // Verificações
    podeAcessar: (abaCodigo: string) => boolean;
    apenasPropriaDiretoria: (abaCodigo: string) => boolean;
    isSGJT: boolean;
    
    // Diretorias disponíveis (para dropdown de filtro)
    diretoriasDisponiveis: Directorate[];
    
    // Função para recarregar
    recarregar: () => Promise<void>;
}

/**
 * Hook para gerenciar permissões do usuário logado
 */
export function usePermissoes(): UsePermissoesReturn {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [permissoes, setPermissoes] = useState<PermissaoUsuario[]>([]);
    const [diretoriaUsuario, setDiretoriaUsuario] = useState<Diretoria | null>(null);

    const carregarPermissoes = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const dados = await permissoesApi.getMinhasPermissoes();
            setPermissoes(dados.permissoes);
            setDiretoriaUsuario(dados.diretoria);
        } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            // Se falhar, assume diretoria do usuário
            setDiretoriaUsuario((user as any).diretoria || 'SGJT');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        carregarPermissoes();
    }, [carregarPermissoes]);

    // Verificar se pode acessar uma aba
    const podeAcessar = useCallback((abaCodigo: string): boolean => {
        // Durante carregamento, permite acesso para evitar flickering
        if (loading) return true;
        
        // SGJT sempre pode acessar tudo
        if (diretoriaUsuario === 'SGJT') return true;
        
        // Verificar nas permissões carregadas
        const permissao = permissoes.find(p => p.aba_codigo === abaCodigo);
        return permissao?.pode_acessar ?? false;
    }, [loading, diretoriaUsuario, permissoes]);

    // Verificar se deve mostrar apenas própria diretoria
    const apenasPropriaDiretoria = useCallback((abaCodigo: string): boolean => {
        // SGJT vê todas as diretorias
        if (diretoriaUsuario === 'SGJT') return false;
        
        // Verificar nas permissões
        const permissao = permissoes.find(p => p.aba_codigo === abaCodigo);
        return permissao?.apenas_propria_diretoria ?? true;
    }, [diretoriaUsuario, permissoes]);

    // Verificar se é SGJT
    const isSGJT = useMemo(() => diretoriaUsuario === 'SGJT', [diretoriaUsuario]);

    // Diretorias disponíveis para o usuário
    const diretoriasDisponiveis = useMemo((): Directorate[] => {
        // SGJT pode ver todas
        if (diretoriaUsuario === 'SGJT') {
            return DIRECTORATES.map(d => d.value);
        }
        
        // Outros usuários só veem a própria diretoria
        if (diretoriaUsuario) {
            return [diretoriaUsuario as Directorate];
        }
        
        return [];
    }, [diretoriaUsuario]);

    return {
        loading,
        permissoes,
        diretoriaUsuario,
        podeAcessar,
        apenasPropriaDiretoria,
        isSGJT,
        diretoriasDisponiveis,
        recarregar: carregarPermissoes
    };
}

export default usePermissoes;

