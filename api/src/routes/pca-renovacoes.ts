import { Router, Request, Response } from 'express';
import { pcaRenovacoesService } from '../services/pca-renovacoes.service.js';

const router = Router();

// Middleware para verificar se o usuário é gestor ou admin
const isGestorOrAdmin = (req: Request, res: Response, next: Function) => {
    const userRole = req.headers['x-user-role'] as string;
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas gestores e administradores podem realizar esta operação.' });
    }
    next();
};

// ============================================================
// ENDPOINTS DE LISTA
// ============================================================

/**
 * GET /api/pca-renovacoes
 * Listar todas as renovações
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const renovacoes = await pcaRenovacoesService.findAll();
        res.json(renovacoes);
    } catch (error: any) {
        console.error('Erro ao buscar renovações:', error);
        res.status(500).json({ error: 'Erro ao buscar renovações' });
    }
});

/**
 * GET /api/pca-renovacoes/stats
 * Obter estatísticas das renovações
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await pcaRenovacoesService.getStats();
        res.json(stats);
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

/**
 * GET /api/pca-renovacoes/resumo
 * Obter resumo completo
 */
router.get('/resumo', async (req: Request, res: Response) => {
    try {
        const resumo = await pcaRenovacoesService.getResumo();
        res.json(resumo);
    } catch (error: any) {
        console.error('Erro ao buscar resumo:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo' });
    }
});

/**
 * GET /api/pca-renovacoes/filters
 * Obter filtros disponíveis
 */
router.get('/filters', async (req: Request, res: Response) => {
    try {
        const filters = await pcaRenovacoesService.getFilters();
        res.json(filters);
    } catch (error: any) {
        console.error('Erro ao buscar filtros:', error);
        res.status(500).json({ error: 'Erro ao buscar filtros' });
    }
});

/**
 * GET /api/pca-renovacoes/:id
 * Buscar renovação por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const renovacao = await pcaRenovacoesService.findById(id);
        if (!renovacao) {
            return res.status(404).json({ error: 'Renovação não encontrada' });
        }

        res.json(renovacao);
    } catch (error: any) {
        console.error('Erro ao buscar renovação:', error);
        res.status(500).json({ error: 'Erro ao buscar renovação' });
    }
});

// ============================================================
// ENDPOINTS DE MODIFICAÇÃO (requerem permissão)
// ============================================================

/**
 * POST /api/pca-renovacoes
 * Criar nova renovação
 */
router.post('/', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;
        const { item_pca, area_demandante, gestor_demandante, contratada, objeto, valor_anual, data_estimada_contratacao, status } = req.body;

        // Validações
        if (!item_pca || !area_demandante || !gestor_demandante || !contratada || !objeto || !valor_anual || !data_estimada_contratacao) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        if (item_pca.length > 50) {
            return res.status(400).json({ error: 'Item PCA deve ter no máximo 50 caracteres' });
        }

        if (parseFloat(valor_anual) <= 0) {
            return res.status(400).json({ error: 'Valor anual deve ser maior que zero' });
        }

        const renovacao = await pcaRenovacoesService.create({
            item_pca,
            area_demandante,
            gestor_demandante,
            contratada,
            objeto,
            valor_anual: parseFloat(valor_anual),
            data_estimada_contratacao,
            status
        }, userId);

        res.status(201).json(renovacao);
    } catch (error: any) {
        console.error('Erro ao criar renovação:', error);
        if (error.message.includes('já existe')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao criar renovação' });
    }
});

/**
 * PUT /api/pca-renovacoes/:id
 * Atualizar renovação
 */
router.put('/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const renovacao = await pcaRenovacoesService.update(id, req.body, userId);
        if (!renovacao) {
            return res.status(404).json({ error: 'Renovação não encontrada' });
        }

        res.json(renovacao);
    } catch (error: any) {
        console.error('Erro ao atualizar renovação:', error);
        if (error.message.includes('já existe')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao atualizar renovação' });
    }
});

/**
 * PATCH /api/pca-renovacoes/:id/status
 * Atualizar apenas o status
 */
router.patch('/:id/status', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;
        const { status } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        if (!status || !['Concluída', 'Em andamento', 'Não Iniciada'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const renovacao = await pcaRenovacoesService.updateStatus(id, status, userId);
        if (!renovacao) {
            return res.status(404).json({ error: 'Renovação não encontrada' });
        }

        res.json(renovacao);
    } catch (error: any) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

/**
 * DELETE /api/pca-renovacoes/:id
 * Excluir renovação (soft delete)
 */
router.delete('/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const deleted = await pcaRenovacoesService.softDelete(id, userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Renovação não encontrada' });
        }

        res.json({ success: true, message: 'Renovação excluída com sucesso' });
    } catch (error: any) {
        console.error('Erro ao excluir renovação:', error);
        res.status(500).json({ error: 'Erro ao excluir renovação' });
    }
});

export default router;

























