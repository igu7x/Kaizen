import express from 'express';
import { permissoesService, DIRETORIAS, Diretoria } from '../services/permissoes.service.js';

const router = express.Router();

// Helper para obter userId do request
const getCurrentUserId = (req: express.Request): number | null => {
    const user = (req as any).user;
    if (user?.id) {
        return user.id;
    }
    const userId = (req as any).userId || req.body?.userId || req.headers['x-user-id'];
    return userId ? parseInt(userId) : null;
};

// ===================================================================
// GET /api/permissoes/abas - Listar todas as abas da plataforma
// ===================================================================
router.get('/abas', async (req, res, next) => {
    try {
        const abas = await permissoesService.getAbas();
        res.json(abas);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/permissoes/usuario/:id - Obter permissões de um usuário
// ===================================================================
router.get('/usuario/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = parseInt(id);
        
        if (isNaN(usuarioId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const permissoes = await permissoesService.getPermissoesUsuario(usuarioId);
        res.json(permissoes);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/permissoes/minha - Obter permissões do usuário logado
// ===================================================================
router.get('/minha', async (req, res, next) => {
    try {
        const userId = getCurrentUserId(req);
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const permissoes = await permissoesService.getPermissoesUsuario(userId);
        const diretoria = await permissoesService.getDiretoriaUsuario(userId);
        
        res.json({
            diretoria,
            permissoes
        });
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/permissoes/verificar/:aba - Verificar se pode acessar aba
// ===================================================================
router.get('/verificar/:aba', async (req, res, next) => {
    try {
        const { aba } = req.params;
        const userId = getCurrentUserId(req);
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const permissao = await permissoesService.verificarPermissao(userId, aba);
        res.json(permissao);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/permissoes/diretoria/:diretoria - Obter permissões de diretoria
// ===================================================================
router.get('/diretoria/:diretoria', async (req, res, next) => {
    try {
        const { diretoria } = req.params;
        
        if (!DIRETORIAS.includes(diretoria as Diretoria)) {
            return res.status(400).json({ 
                error: 'Diretoria inválida',
                diretorias_validas: DIRETORIAS
            });
        }

        const permissoes = await permissoesService.getPermissoesDiretoria(diretoria as Diretoria);
        res.json(permissoes);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/permissoes/todas - Obter todas as permissões (SGJT apenas)
// ===================================================================
router.get('/todas', async (req, res, next) => {
    try {
        const userId = getCurrentUserId(req);
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Verificar se é SGJT
        const diretoria = await permissoesService.getDiretoriaUsuario(userId);
        if (diretoria !== 'SGJT') {
            return res.status(403).json({ error: 'Apenas SGJT pode ver todas as permissões' });
        }

        const permissoes = await permissoesService.getTodasPermissoes();
        const abas = await permissoesService.getAbas();
        
        res.json({
            abas,
            permissoes_por_diretoria: permissoes
        });
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// PUT /api/permissoes/diretoria/:diretoria - Atualizar permissões (SGJT)
// ===================================================================
router.put('/diretoria/:diretoria', async (req, res, next) => {
    try {
        const { diretoria } = req.params;
        const { permissoes } = req.body;
        const userId = getCurrentUserId(req);
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!DIRETORIAS.includes(diretoria as Diretoria)) {
            return res.status(400).json({ 
                error: 'Diretoria inválida',
                diretorias_validas: DIRETORIAS
            });
        }

        if (!Array.isArray(permissoes)) {
            return res.status(400).json({ 
                error: 'Permissões devem ser um array',
                exemplo: [
                    { aba_codigo: 'gestao_estrategica', pode_acessar: true, apenas_propria_diretoria: true }
                ]
            });
        }

        const resultado = await permissoesService.atualizarPermissoesDiretoria(
            diretoria as Diretoria,
            permissoes,
            userId
        );

        res.json({
            success: true,
            message: `Permissões de ${diretoria} atualizadas`,
            permissoes: resultado
        });
    } catch (error: any) {
        if (error.message === 'PERMISSAO_NEGADA') {
            return res.status(403).json({ error: 'Apenas SGJT pode alterar permissões' });
        }
        if (error.message === 'NAO_PODE_ALTERAR_SGJT') {
            return res.status(400).json({ error: 'Não é permitido alterar permissões da SGJT' });
        }
        next(error);
    }
});

// ===================================================================
// PUT /api/permissoes/diretoria/:diretoria/aba/:aba - Atualizar uma permissão
// ===================================================================
router.put('/diretoria/:diretoria/aba/:aba', async (req, res, next) => {
    try {
        const { diretoria, aba } = req.params;
        const { pode_acessar, apenas_propria_diretoria } = req.body;
        const userId = getCurrentUserId(req);
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!DIRETORIAS.includes(diretoria as Diretoria)) {
            return res.status(400).json({ error: 'Diretoria inválida' });
        }

        if (typeof pode_acessar !== 'boolean') {
            return res.status(400).json({ error: 'pode_acessar deve ser boolean' });
        }

        const resultado = await permissoesService.atualizarPermissao(
            diretoria as Diretoria,
            aba,
            pode_acessar,
            apenas_propria_diretoria ?? false,
            userId
        );

        res.json({
            success: true,
            permissao: resultado
        });
    } catch (error: any) {
        if (error.message === 'PERMISSAO_NEGADA') {
            return res.status(403).json({ error: 'Apenas SGJT pode alterar permissões' });
        }
        if (error.message === 'NAO_PODE_ALTERAR_SGJT') {
            return res.status(400).json({ error: 'Não é permitido alterar permissões da SGJT' });
        }
        next(error);
    }
});

export default router;

