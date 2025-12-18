import express, { Request, Response, NextFunction } from 'express';
import { pcaService, CreatePcaItemDto, UpdatePcaItemDto } from '../services/pca.service.js';

const router = express.Router();

/**
 * Middleware para verificar se usuário é Gestor ou Admin
 */
function isGestorOrAdmin(req: Request, res: Response, next: NextFunction) {
    // TODO: Quando implementar JWT, extrair role do token
    // Por enquanto, verificar header x-user-role ou body.userRole
    const userRole = req.headers['x-user-role'] as string || req.body.userRole;
    
    if (!userRole) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const allowedRoles = ['MANAGER', 'ADMIN'];
    if (!allowedRoles.includes(userRole.toUpperCase())) {
        return res.status(403).json({ error: 'Acesso negado. Apenas gestores e administradores podem realizar esta ação.' });
    }

    next();
}

/**
 * Extrair userId do request (temporário até implementar JWT)
 */
function getUserId(req: Request): number {
    // TODO: Quando implementar JWT, extrair do token
    const userId = req.headers['x-user-id'] as string || req.body.userId;
    return parseInt(userId) || 1; // Default para 1 se não especificado
}

// ============================================================
// ROTAS PÚBLICAS (qualquer usuário autenticado)
// ============================================================

/**
 * GET /api/pca-items
 * Retorna todos os itens PCA ordenados por mês e número
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await pcaService.findAll();
        res.json(items);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/pca-items/stats
 * Retorna estatísticas do PCA (total, valor, status)
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await pcaService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/pca-items/filters
 * Retorna opções de filtros (áreas, responsáveis, meses)
 */
router.get('/filters', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [areasDemandantes, responsaveis, meses] = await Promise.all([
            pcaService.getAreasDemandantes(),
            pcaService.getResponsaveis(),
            pcaService.getMeses()
        ]);

        res.json({
            areasDemandantes,
            responsaveis,
            meses,
            statusOptions: ['Concluída', 'Em andamento', 'Não Iniciada']
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/pca-items/:id
 * Retorna detalhes de um item específico
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const item = await pcaService.findById(id);
        if (!item) {
            return res.status(404).json({ error: 'Item PCA não encontrado' });
        }

        res.json(item);
    } catch (error) {
        next(error);
    }
});

// ============================================================
// ROTAS PROTEGIDAS (apenas gestor e admin)
// ============================================================

/**
 * POST /api/pca-items
 * Criar novo item PCA
 */
router.post('/', isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const data: CreatePcaItemDto = {
            item_pca: req.body.item_pca,
            area_demandante: req.body.area_demandante,
            responsavel: req.body.responsavel,
            objeto: req.body.objeto,
            valor_anual: parseFloat(req.body.valor_anual),
            data_estimada_contratacao: req.body.data_estimada_contratacao,
            status: req.body.status || 'Não Iniciada'
        };

        // Validações
        const errors: string[] = [];

        if (!data.item_pca || data.item_pca.trim() === '') {
            errors.push('Item do PCA é obrigatório');
        } else if (data.item_pca.length > 50) {
            errors.push('Item do PCA deve ter no máximo 50 caracteres');
        }

        if (!data.area_demandante || data.area_demandante.trim() === '') {
            errors.push('Área demandante é obrigatória');
        } else if (data.area_demandante.length > 100) {
            errors.push('Área demandante deve ter no máximo 100 caracteres');
        }

        if (!data.responsavel || data.responsavel.trim() === '') {
            errors.push('Responsável é obrigatório');
        } else if (data.responsavel.length > 255) {
            errors.push('Responsável deve ter no máximo 255 caracteres');
        }

        if (!data.objeto || data.objeto.trim() === '') {
            errors.push('Objeto é obrigatório');
        }

        if (isNaN(data.valor_anual) || data.valor_anual <= 0) {
            errors.push('Valor anual deve ser um número positivo maior que zero');
        }

        if (!data.data_estimada_contratacao || data.data_estimada_contratacao.trim() === '') {
            errors.push('Data estimada de contratação é obrigatória');
        }

        const validStatus = ['Concluída', 'Em andamento', 'Não Iniciada'];
        if (data.status && !validStatus.includes(data.status)) {
            errors.push('Status inválido. Use: Concluída, Em andamento ou Não Iniciada');
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: 'Dados inválidos', details: errors });
        }

        const created = await pcaService.create(data, userId);
        res.status(201).json(created);

    } catch (error: any) {
        if (error.message.includes('já existe')) {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * PUT /api/pca-items/:id
 * Atualizar item PCA existente
 */
router.put('/:id', isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const userId = getUserId(req);
        const data: UpdatePcaItemDto = {};

        // Preencher apenas campos fornecidos
        if (req.body.item_pca !== undefined) data.item_pca = req.body.item_pca;
        if (req.body.area_demandante !== undefined) data.area_demandante = req.body.area_demandante;
        if (req.body.responsavel !== undefined) data.responsavel = req.body.responsavel;
        if (req.body.objeto !== undefined) data.objeto = req.body.objeto;
        if (req.body.valor_anual !== undefined) data.valor_anual = parseFloat(req.body.valor_anual);
        if (req.body.data_estimada_contratacao !== undefined) data.data_estimada_contratacao = req.body.data_estimada_contratacao;
        if (req.body.status !== undefined) data.status = req.body.status;

        // Validações
        const errors: string[] = [];

        if (data.item_pca !== undefined) {
            if (data.item_pca.trim() === '') {
                errors.push('Item do PCA não pode ser vazio');
            } else if (data.item_pca.length > 50) {
                errors.push('Item do PCA deve ter no máximo 50 caracteres');
            }
        }

        if (data.area_demandante !== undefined) {
            if (data.area_demandante.trim() === '') {
                errors.push('Área demandante não pode ser vazia');
            } else if (data.area_demandante.length > 100) {
                errors.push('Área demandante deve ter no máximo 100 caracteres');
            }
        }

        if (data.responsavel !== undefined) {
            if (data.responsavel.trim() === '') {
                errors.push('Responsável não pode ser vazio');
            } else if (data.responsavel.length > 255) {
                errors.push('Responsável deve ter no máximo 255 caracteres');
            }
        }

        if (data.objeto !== undefined && data.objeto.trim() === '') {
            errors.push('Objeto não pode ser vazio');
        }

        if (data.valor_anual !== undefined && (isNaN(data.valor_anual) || data.valor_anual <= 0)) {
            errors.push('Valor anual deve ser um número positivo maior que zero');
        }

        if (data.data_estimada_contratacao !== undefined && data.data_estimada_contratacao.trim() === '') {
            errors.push('Data estimada de contratação não pode ser vazia');
        }

        const validStatus = ['Concluída', 'Em andamento', 'Não Iniciada'];
        if (data.status !== undefined && !validStatus.includes(data.status)) {
            errors.push('Status inválido. Use: Concluída, Em andamento ou Não Iniciada');
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: 'Dados inválidos', details: errors });
        }

        const updated = await pcaService.update(id, data, userId);
        if (!updated) {
            return res.status(404).json({ error: 'Item PCA não encontrado' });
        }

        res.json(updated);

    } catch (error: any) {
        if (error.message.includes('já existe')) {
            return res.status(409).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * PATCH /api/pca-items/:id/status
 * Atualizar apenas o status de um item
 */
router.patch('/:id/status', isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const { status } = req.body;
        const validStatus = ['Concluída', 'Em andamento', 'Não Iniciada'];

        if (!status || !validStatus.includes(status)) {
            return res.status(400).json({ 
                error: 'Status inválido', 
                details: ['Use: Concluída, Em andamento ou Não Iniciada'] 
            });
        }

        const userId = getUserId(req);
        const updated = await pcaService.updateStatus(id, status, userId);

        if (!updated) {
            return res.status(404).json({ error: 'Item PCA não encontrado' });
        }

        res.json(updated);

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/pca-items/:id
 * Excluir item PCA (soft delete)
 */
router.delete('/:id', isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const userId = getUserId(req);
        const deleted = await pcaService.softDelete(id, userId);

        if (!deleted) {
            return res.status(404).json({ error: 'Item PCA não encontrado' });
        }

        res.json({ message: 'Item PCA excluído com sucesso' });

    } catch (error) {
        next(error);
    }
});

export default router;




























