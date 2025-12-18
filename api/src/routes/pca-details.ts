import express, { Request, Response, NextFunction } from 'express';
import { pcaDetailsService } from '../services/pca-details.service.js';
import { pcaService } from '../services/pca.service.js';

const router = express.Router();

/**
 * Middleware para verificar se usuário é Gestor ou Admin
 */
function isGestorOrAdmin(req: Request, res: Response, next: NextFunction) {
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
 * Extrair userId do request
 */
function getUserId(req: Request): number {
    const userId = req.headers['x-user-id'] as string || req.body.userId;
    return parseInt(userId) || 1;
}

/**
 * Middleware para verificar se o item PCA existe
 */
async function validatePcaItem(req: Request, res: Response, next: NextFunction) {
    const pcaItemId = parseInt(req.params.id);
    if (isNaN(pcaItemId)) {
        return res.status(400).json({ error: 'ID do item PCA inválido' });
    }

    const pcaItem = await pcaService.findById(pcaItemId);
    if (!pcaItem) {
        return res.status(404).json({ error: 'Item PCA não encontrado' });
    }

    // Adicionar ao request para uso posterior
    (req as any).pcaItem = pcaItem;
    next();
}

// ============================================================
// DEBUG ENDPOINT (TEMPORÁRIO - Remover após diagnosticar)
// ============================================================

/**
 * GET /api/pca-items/debug/:id
 * Endpoint de debug para diagnosticar problemas
 */
router.get('/debug/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        console.log('\n🔍 DEBUG ENDPOINT CHAMADO');
        console.log('ID recebido:', id);
        console.log('Tipo do ID:', typeof id);
        
        // Buscar por ID numérico
        const idNum = parseInt(id);
        let byId = null;
        if (!isNaN(idNum)) {
            byId = await pcaService.findById(idNum);
            console.log('Busca por ID numérico:', byId ? 'Encontrado ✅' : 'Não encontrado ❌');
        }
        
        // Buscar por item_pca
        const byItemPca = await pcaService.findByItemPca(id);
        console.log('Busca por item_pca:', byItemPca ? 'Encontrado ✅' : 'Não encontrado ❌');
        
        // Estatísticas
        const stats = await pcaService.getStats();
        
        return res.json({
            debug: true,
            id_buscado: id,
            tipo_id: typeof id,
            resultado_por_id_numerico: byId,
            resultado_por_item_pca: byItemPca,
            estatisticas: {
                total_registros: stats.total,
                mensagem: 'Verifique se os registros existem e não estão deletados'
            },
            proximos_passos: [
                'Se resultado_por_id_numerico está null, o registro não existe ou está deletado',
                'Execute no terminal: node scripts/diagnose-pca-items.js',
                'Se necessário, restaure os registros: node scripts/fix-pca-deleted.js'
            ]
        });
    } catch (error: any) {
        console.error('Erro no endpoint de debug:', error);
        return res.status(500).json({ 
            error: 'Erro ao executar debug',
            details: error.message
        });
    }
});

// ============================================================
// ROTAS DE DETALHES (Campos Estáticos)
// ============================================================

/**
 * GET /api/pca-items/:id/details
 * Retorna os campos estáticos (Validação DG e Fase Atual)
 */
router.get('/:id/details', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const details = await pcaDetailsService.getDetails(pcaItemId);
        
        // Se não existir, retornar valores padrão
        if (!details) {
            return res.json({
                pca_item_id: pcaItemId,
                validacao_dg_tipo: 'Pendente',
                validacao_dg_data: null,
                fase_atual: null
            });
        }
        
        res.json(details);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/pca-items/:id/details
 * Atualiza campos estáticos
 */
router.put('/:id/details', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const { validacao_dg_tipo, validacao_dg_data, fase_atual } = req.body;

        // Validações
        if (validacao_dg_tipo && !['Pendente', 'Data'].includes(validacao_dg_tipo)) {
            return res.status(400).json({ error: 'Tipo de validação DG inválido. Use: Pendente ou Data' });
        }

        if (fase_atual && fase_atual.length > 20) {
            return res.status(400).json({ error: 'Fase atual deve ter no máximo 20 caracteres' });
        }

        const updated = await pcaDetailsService.upsertDetails(pcaItemId, {
            validacao_dg_tipo,
            validacao_dg_data,
            fase_atual
        }, userId);

        res.json(updated);
    } catch (error: any) {
        if (error.message.includes('obrigatória') || error.message.includes('máximo')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

// ============================================================
// ROTAS DE CHECKLIST
// ============================================================

/**
 * GET /api/pca-items/:id/checklist
 * Retorna todos os itens do checklist
 */
router.get('/:id/checklist', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const [checklist, progress] = await Promise.all([
            pcaDetailsService.getChecklist(pcaItemId),
            pcaDetailsService.getChecklistProgress(pcaItemId)
        ]);
        
        res.json({
            items: checklist,
            progress
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/pca-items/:id/checklist/:checklistId/status
 * Atualiza apenas o status de um item do checklist
 */
router.patch('/:id/checklist/:checklistId/status', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const checklistId = parseInt(req.params.checklistId);
        if (isNaN(checklistId)) {
            return res.status(400).json({ error: 'ID do checklist inválido' });
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
        const updated = await pcaDetailsService.updateChecklistItemStatus(checklistId, status, userId);

        if (!updated) {
            return res.status(404).json({ error: 'Item do checklist não encontrado' });
        }

        // Retornar item atualizado junto com o progresso
        const pcaItemId = parseInt(req.params.id);
        const progress = await pcaDetailsService.getChecklistProgress(pcaItemId);

        res.json({
            item: updated,
            progress
        });
    } catch (error) {
        next(error);
    }
});

// ============================================================
// ROTAS DE PONTOS DE CONTROLE
// ============================================================

/**
 * GET /api/pca-items/:id/pontos-controle
 * Retorna todos os pontos de controle
 */
router.get('/:id/pontos-controle', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const pontosControle = await pcaDetailsService.getPontosControle(pcaItemId);
        res.json(pontosControle);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/pca-items/:id/pontos-controle
 * Cria novo ponto de controle
 */
router.post('/:id/pontos-controle', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const { ponto_controle, data, proxima_reuniao } = req.body;

        // Validações
        if (!ponto_controle || ponto_controle.trim() === '') {
            return res.status(400).json({ error: 'Ponto de controle é obrigatório' });
        }
        if (!data) {
            return res.status(400).json({ error: 'Data é obrigatória' });
        }
        if (!proxima_reuniao) {
            return res.status(400).json({ error: 'Próxima reunião é obrigatória' });
        }

        const created = await pcaDetailsService.createPontoControle(pcaItemId, {
            ponto_controle,
            data,
            proxima_reuniao
        }, userId);

        res.status(201).json(created);
    } catch (error: any) {
        if (error.message.includes('obrigat')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * PUT /api/pca-items/:id/pontos-controle/:pcId
 * Atualiza ponto de controle
 */
router.put('/:id/pontos-controle/:pcId', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcId = parseInt(req.params.pcId);
        if (isNaN(pcId)) {
            return res.status(400).json({ error: 'ID do ponto de controle inválido' });
        }

        const userId = getUserId(req);
        const { ponto_controle, data, proxima_reuniao } = req.body;

        const updated = await pcaDetailsService.updatePontoControle(pcId, {
            ponto_controle,
            data,
            proxima_reuniao
        }, userId);

        if (!updated) {
            return res.status(404).json({ error: 'Ponto de controle não encontrado' });
        }

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/pca-items/:id/pontos-controle/:pcId
 * Exclui ponto de controle
 * Query: deleteTarefas=true para excluir tarefas, false para manter órfãs
 */
router.delete('/:id/pontos-controle/:pcId', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcId = parseInt(req.params.pcId);
        if (isNaN(pcId)) {
            return res.status(400).json({ error: 'ID do ponto de controle inválido' });
        }

        const userId = getUserId(req);
        const deleteTarefas = req.query.deleteTarefas === 'true';
        
        const result = await pcaDetailsService.deletePontoControle(pcId, userId, deleteTarefas);

        if (!result.success) {
            return res.status(404).json({ error: 'Ponto de controle não encontrado' });
        }

        res.json({ 
            message: 'Ponto de controle excluído com sucesso',
            tarefas_afetadas: result.tarefasAfetadas,
            tarefas_deletadas: deleteTarefas
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/pca-items/:id/pontos-controle-com-tarefas
 * Retorna pontos de controle com suas tarefas aninhadas
 */
router.get('/:id/pontos-controle-com-tarefas', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const pontosControleComTarefas = await pcaDetailsService.getPontosControleComTarefas(pcaItemId);
        res.json(pontosControleComTarefas);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/pca-items/:id/tarefas-orfas
 * Retorna tarefas sem ponto de controle associado
 */
router.get('/:id/tarefas-orfas', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const tarefasOrfas = await pcaDetailsService.getTarefasOrfas(pcaItemId);
        res.json(tarefasOrfas);
    } catch (error) {
        next(error);
    }
});

// ============================================================
// ROTAS DE TAREFAS
// ============================================================

/**
 * GET /api/pca-items/:id/tarefas
 * Retorna todas as tarefas
 */
router.get('/:id/tarefas', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const tarefas = await pcaDetailsService.getTarefas(pcaItemId);
        res.json(tarefas);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/pca-items/:id/tarefas
 * Cria nova tarefa
 */
router.post('/:id/tarefas', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const { tarefa, responsavel, prazo, status, ponto_controle_id } = req.body;

        // Validações
        if (!tarefa || tarefa.trim() === '') {
            return res.status(400).json({ error: 'Tarefa é obrigatória' });
        }
        if (!responsavel || responsavel.trim() === '') {
            return res.status(400).json({ error: 'Responsável é obrigatório' });
        }
        if (!prazo) {
            return res.status(400).json({ error: 'Prazo é obrigatório' });
        }

        const created = await pcaDetailsService.createTarefa(pcaItemId, {
            tarefa,
            responsavel,
            prazo,
            status,
            ponto_controle_id: ponto_controle_id || null
        }, userId);

        res.status(201).json(created);
    } catch (error: any) {
        if (error.message.includes('obrigat') || error.message.includes('máximo') || error.message.includes('inválido') || error.message.includes('Ponto de controle')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * PUT /api/pca-items/:id/tarefas/:tarefaId
 * Atualiza tarefa
 */
router.put('/:id/tarefas/:tarefaId', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);
        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const userId = getUserId(req);
        const { tarefa, responsavel, prazo, status, ponto_controle_id } = req.body;

        const updated = await pcaDetailsService.updateTarefa(tarefaId, {
            tarefa,
            responsavel,
            prazo,
            status,
            ponto_controle_id
        }, userId);

        if (!updated) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json(updated);
    } catch (error: any) {
        if (error.message.includes('vazi') || error.message.includes('máximo') || error.message.includes('inválido') || error.message.includes('Ponto de controle')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
        }
});

/**
 * PATCH /api/pca-items/:id/tarefas/:tarefaId/associar-pc
 * Associa uma tarefa a um ponto de controle
 */
router.patch('/:id/tarefas/:tarefaId/associar-pc', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);
        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const { ponto_controle_id } = req.body;
        const userId = getUserId(req);

        const updated = await pcaDetailsService.associarTarefaAPontoControle(
            tarefaId, 
            ponto_controle_id !== undefined ? ponto_controle_id : null, 
            userId
        );

        if (!updated) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json(updated);
    } catch (error: any) {
        if (error.message.includes('Ponto de controle')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * PATCH /api/pca-items/:id/tarefas/:tarefaId/status
 * Atualiza apenas o status de uma tarefa
 */
router.patch('/:id/tarefas/:tarefaId/status', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);
        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const { status } = req.body;
        const validStatus = ['Não iniciada', 'Em andamento', 'Concluída'];

        if (!status || !validStatus.includes(status)) {
            return res.status(400).json({ 
                error: 'Status inválido', 
                details: ['Use: Não iniciada, Em andamento ou Concluída'] 
            });
        }

        const userId = getUserId(req);
        const updated = await pcaDetailsService.updateTarefaStatus(tarefaId, status, userId);

        if (!updated) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/pca-items/:id/tarefas/:tarefaId
 * Exclui tarefa
 */
router.delete('/:id/tarefas/:tarefaId', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tarefaId = parseInt(req.params.tarefaId);
        if (isNaN(tarefaId)) {
            return res.status(400).json({ error: 'ID da tarefa inválido' });
        }

        const userId = getUserId(req);
        const deleted = await pcaDetailsService.deleteTarefa(tarefaId, userId);

        if (!deleted) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json({ message: 'Tarefa excluída com sucesso' });
    } catch (error) {
        next(error);
    }
});

// ============================================================
// ROTA PARA BUSCAR TODOS OS DADOS DE UM ITEM
// ============================================================

/**
 * GET /api/pca-items/:id/all-details
 * Retorna todos os dados de detalhes de um item PCA
 */
router.get('/:id/all-details', validatePcaItem, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const pcaItem = (req as any).pcaItem;
        const allData = await pcaDetailsService.getAllData(pcaItemId);
        
        res.json({
            pcaItem,
            ...allData
        });
    } catch (error) {
        next(error);
    }
});

// ============================================================
// SALVAMENTO EM LOTE
// ============================================================

/**
 * PATCH /api/pca-items/:id/save-all-changes
 * Salva todas as alterações de uma vez usando transação
 */
router.patch('/:id/save-all-changes', validatePcaItem, isGestorOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcaItemId = parseInt(req.params.id);
        const userId = getUserId(req);

        const { details, checklist_updates, tarefas_updates } = req.body;

        // Validações básicas
        if (details) {
            if (details.validacao_dg_tipo && !['Pendente', 'Data'].includes(details.validacao_dg_tipo)) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Tipo de validação DG inválido. Use: Pendente ou Data' 
                });
            }
            if (details.validacao_dg_tipo === 'Data' && !details.validacao_dg_data) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Data da validação é obrigatória quando tipo é "Data"' 
                });
            }
            if (details.fase_atual && details.fase_atual.length > 20) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Fase atual deve ter no máximo 20 caracteres' 
                });
            }
        }

        if (checklist_updates && !Array.isArray(checklist_updates)) {
            return res.status(400).json({ 
                success: false,
                error: 'checklist_updates deve ser um array' 
            });
        }

        if (tarefas_updates && !Array.isArray(tarefas_updates)) {
            return res.status(400).json({ 
                success: false,
                error: 'tarefas_updates deve ser um array' 
            });
        }

        // Verificar se há algo para salvar
        const hasDetails = details && Object.keys(details).length > 0;
        const hasChecklist = checklist_updates && checklist_updates.length > 0;
        const hasTarefas = tarefas_updates && tarefas_updates.length > 0;

        if (!hasDetails && !hasChecklist && !hasTarefas) {
            return res.status(400).json({ 
                success: false,
                error: 'Nenhuma alteração para salvar' 
            });
        }

        // Salvar todas as alterações em transação
        const result = await pcaDetailsService.saveAllChanges(
            pcaItemId,
            { details, checklist_updates, tarefas_updates },
            userId
        );

        res.json(result);

    } catch (error: any) {
        console.error('Erro ao salvar alterações:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Erro ao salvar alterações'
        });
    }
});

export default router;
