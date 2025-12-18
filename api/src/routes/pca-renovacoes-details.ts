import { Router, Request, Response } from 'express';
import { pcaRenovacoesService } from '../services/pca-renovacoes.service.js';
import { pcaRenovacoesDetailsService } from '../services/pca-renovacoes-details.service.js';

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
// DADOS COMPLETOS
// ============================================================

/**
 * GET /api/pca-renovacoes-details/:id/all
 * Buscar todos os dados da renovação (inclui renovação + details + checklist + PCs + tarefas)
 */
router.get('/:id/all', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Buscar a renovação principal
        const renovacao = await pcaRenovacoesService.findById(id);
        if (!renovacao) {
            return res.status(404).json({ error: 'Renovação não encontrada' });
        }

        // Buscar todos os dados relacionados
        const allData = await pcaRenovacoesDetailsService.getAllData(id);

        res.json({
            renovacao,
            ...allData
        });
    } catch (error: any) {
        console.error('Erro ao buscar dados completos:', error);
        res.status(500).json({ error: 'Erro ao buscar dados da renovação' });
    }
});

// ============================================================
// DETAILS (Campos Estáticos)
// ============================================================

/**
 * GET /api/pca-renovacoes-details/:id/details
 * Buscar detalhes da renovação
 */
router.get('/:id/details', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const details = await pcaRenovacoesDetailsService.getDetails(id);
        res.json(details);
    } catch (error: any) {
        console.error('Erro ao buscar detalhes:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes' });
    }
});

/**
 * PUT /api/pca-renovacoes-details/:id/details
 * Atualizar detalhes da renovação
 */
router.put('/:id/details', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const details = await pcaRenovacoesDetailsService.upsertDetails(id, req.body, userId);
        res.json(details);
    } catch (error: any) {
        console.error('Erro ao atualizar detalhes:', error);
        res.status(500).json({ error: error.message || 'Erro ao atualizar detalhes' });
    }
});

// ============================================================
// CHECKLIST
// ============================================================

/**
 * GET /api/pca-renovacoes-details/:id/checklist
 * Buscar checklist da renovação
 */
router.get('/:id/checklist', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const checklist = await pcaRenovacoesDetailsService.getChecklist(id);
        const progress = pcaRenovacoesDetailsService.getChecklistProgress(checklist);
        
        res.json({ checklist, progress });
    } catch (error: any) {
        console.error('Erro ao buscar checklist:', error);
        res.status(500).json({ error: 'Erro ao buscar checklist' });
    }
});

/**
 * PATCH /api/pca-renovacoes-details/:id/checklist/:checklistId/status
 * Atualizar status de item do checklist
 */
router.patch('/:id/checklist/:checklistId/status', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const checklistId = parseInt(req.params.checklistId);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;
        const { status } = req.body;

        if (isNaN(checklistId)) {
            return res.status(400).json({ error: 'ID do checklist inválido' });
        }

        if (!status || !['Concluída', 'Em andamento', 'Não Iniciada'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const item = await pcaRenovacoesDetailsService.updateChecklistStatus(checklistId, status, userId);
        if (!item) {
            return res.status(404).json({ error: 'Item do checklist não encontrado' });
        }

        res.json(item);
    } catch (error: any) {
        console.error('Erro ao atualizar checklist:', error);
        res.status(500).json({ error: 'Erro ao atualizar checklist' });
    }
});

// ============================================================
// PONTOS DE CONTROLE
// ============================================================

/**
 * GET /api/pca-renovacoes-details/:id/pontos-controle
 * Listar pontos de controle
 */
router.get('/:id/pontos-controle', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const pontosControle = await pcaRenovacoesDetailsService.getPontosControle(id);
        res.json(pontosControle);
    } catch (error: any) {
        console.error('Erro ao buscar pontos de controle:', error);
        res.status(500).json({ error: 'Erro ao buscar pontos de controle' });
    }
});

/**
 * GET /api/pca-renovacoes-details/:id/pontos-controle-com-tarefas
 * Listar pontos de controle com tarefas
 */
router.get('/:id/pontos-controle-com-tarefas', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const pcs = await pcaRenovacoesDetailsService.getPontosControleComTarefas(id);
        res.json(pcs);
    } catch (error: any) {
        console.error('Erro ao buscar PCs com tarefas:', error);
        res.status(500).json({ error: 'Erro ao buscar pontos de controle' });
    }
});

/**
 * POST /api/pca-renovacoes-details/:id/pontos-controle
 * Criar ponto de controle
 */
router.post('/:id/pontos-controle', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const { ponto_controle, data, proxima_reuniao } = req.body;
        if (!ponto_controle || !data || !proxima_reuniao) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const pc = await pcaRenovacoesDetailsService.createPontoControle(id, req.body, userId);
        res.status(201).json(pc);
    } catch (error: any) {
        console.error('Erro ao criar ponto de controle:', error);
        res.status(500).json({ error: 'Erro ao criar ponto de controle' });
    }
});

/**
 * PUT /api/pca-renovacoes-details/:id/pontos-controle/:pcId
 * Atualizar ponto de controle
 */
router.put('/:id/pontos-controle/:pcId', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const pcId = parseInt(req.params.pcId);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(pcId)) {
            return res.status(400).json({ error: 'ID do ponto de controle inválido' });
        }

        const pc = await pcaRenovacoesDetailsService.updatePontoControle(pcId, req.body, userId);
        if (!pc) {
            return res.status(404).json({ error: 'Ponto de controle não encontrado' });
        }

        res.json(pc);
    } catch (error: any) {
        console.error('Erro ao atualizar ponto de controle:', error);
        res.status(500).json({ error: 'Erro ao atualizar ponto de controle' });
    }
});

/**
 * DELETE /api/pca-renovacoes-details/:id/pontos-controle/:pcId
 * Excluir ponto de controle
 */
router.delete('/:id/pontos-controle/:pcId', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const pcId = parseInt(req.params.pcId);
        const deleteTarefas = req.query.deleteTarefas === 'true';

        if (isNaN(pcId)) {
            return res.status(400).json({ error: 'ID do ponto de controle inválido' });
        }

        const deleted = await pcaRenovacoesDetailsService.deletePontoControle(pcId, deleteTarefas);
        if (!deleted) {
            return res.status(404).json({ error: 'Ponto de controle não encontrado' });
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao excluir ponto de controle:', error);
        res.status(500).json({ error: 'Erro ao excluir ponto de controle' });
    }
});

// ============================================================
// TAREFAS
// ============================================================

/**
 * GET /api/pca-renovacoes-details/:id/tarefas
 * Listar tarefas
 */
router.get('/:id/tarefas', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const tarefas = await pcaRenovacoesDetailsService.getTarefas(id);
        res.json(tarefas);
    } catch (error: any) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
});

/**
 * GET /api/pca-renovacoes-details/:id/tarefas-orfas
 * Listar tarefas órfãs
 */
router.get('/:id/tarefas-orfas', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const tarefas = await pcaRenovacoesDetailsService.getTarefasOrfas(id);
        res.json(tarefas);
    } catch (error: any) {
        console.error('Erro ao buscar tarefas órfãs:', error);
        res.status(500).json({ error: 'Erro ao buscar tarefas órfãs' });
    }
});

/**
 * POST /api/pca-renovacoes-details/:id/tarefas
 * Criar tarefa
 */
router.post('/:id/tarefas', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const { tarefa, responsavel, prazo } = req.body;
        if (!tarefa || !responsavel || !prazo) {
            return res.status(400).json({ error: 'Tarefa, responsável e prazo são obrigatórios' });
        }

        const newTarefa = await pcaRenovacoesDetailsService.createTarefa(id, req.body, userId);
        res.status(201).json(newTarefa);
    } catch (error: any) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

/**
 * PUT /api/pca-renovacoes-details/:id/tarefas/:tarefaId
 * Atualizar tarefa
 */
router.put('/:id/tarefas/:tarefaId', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const tarefa = await pcaRenovacoesDetailsService.updateTarefa(tarefaId, req.body, userId);
        if (!tarefa) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json(tarefa);
    } catch (error: any) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

/**
 * DELETE /api/pca-renovacoes-details/:id/tarefas/:tarefaId
 * Excluir tarefa
 */
router.delete('/:id/tarefas/:tarefaId', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);

        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const deleted = await pcaRenovacoesDetailsService.deleteTarefa(tarefaId);
        if (!deleted) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao excluir tarefa:', error);
        res.status(500).json({ error: 'Erro ao excluir tarefa' });
    }
});

/**
 * PATCH /api/pca-renovacoes-details/:id/tarefas/:tarefaId/associar-pc
 * Associar tarefa a ponto de controle
 */
router.patch('/:id/tarefas/:tarefaId/associar-pc', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;
        const { ponto_controle_id } = req.body;

        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const tarefa = await pcaRenovacoesDetailsService.associarTarefaAPontoControle(tarefaId, ponto_controle_id, userId);
        if (!tarefa) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json(tarefa);
    } catch (error: any) {
        console.error('Erro ao associar tarefa:', error);
        res.status(500).json({ error: 'Erro ao associar tarefa' });
    }
});

// ============================================================
// SALVAR TODAS AS MUDANÇAS
// ============================================================

/**
 * PATCH /api/pca-renovacoes-details/:id/save-all-changes
 * Salvar todas as mudanças de uma vez
 */
router.patch('/:id/save-all-changes', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = parseInt(req.headers['x-user-id'] as string) || 1;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const result = await pcaRenovacoesDetailsService.saveAllChanges(id, req.body, userId);
        res.json(result);
    } catch (error: any) {
        console.error('Erro ao salvar mudanças:', error);
        res.status(500).json({ error: error.message || 'Erro ao salvar mudanças' });
    }
});

export default router;

























