import express from 'express';
import { formService } from '../services/form.service.js';

const router = express.Router();

// Helper para obter userId do request (TODO: implementar autenticação JWT)
const getCurrentUserId = (req: express.Request): number => {
    return (req as any).userId || 1;
};

// ============================================================
// FORMS
// ============================================================

// GET /api/forms - Listar todos os formulários
router.get('/', async (req, res, next) => {
    try {
        const { directorate, isAdmin } = req.query;

        const forms = await formService.findAllForms(
            directorate as string | undefined,
            isAdmin === 'true'
        );

        res.json(forms);
    } catch (error) {
        next(error);
    }
});

// GET /api/forms/:id - Obter formulário completo
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const form = await formService.findFormById(parseInt(id));

        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        res.json(form);
    } catch (error) {
        next(error);
    }
});

// POST /api/forms - Criar formulário
router.post('/', async (req, res, next) => {
    try {
        const { title, description, directorate, allowedDirectorates, status } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Campo obrigatório: title' });
        }

        const currentUserId = getCurrentUserId(req);

        const form = await formService.createForm(
            {
                title,
                description,
                directorate_code: directorate,
                allowed_directorates: allowedDirectorates,
                status: status || 'DRAFT',
                created_by: currentUserId
            },
            currentUserId
        );

        res.status(201).json(form);
    } catch (error) {
        console.error('Erro ao criar formulário:', error);
        next(error);
    }
});


// PUT /api/forms/:id - Atualizar formulário
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, directorate, allowedDirectorates, status } = req.body;
        const currentUserId = getCurrentUserId(req);

        const form = await formService.updateForm(
            parseInt(id),
            { 
                title, 
                description, 
                status,
                allowed_directorates: allowedDirectorates
            },
            currentUserId
        );

        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        res.json(form);
    } catch (error) {
        console.error('Erro ao atualizar formulário:', error);
        next(error);
    }
});

// DELETE /api/forms/:id - Deletar formulário (SOFT DELETE)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        console.log('[DELETE /forms/:id] Deletando formulário:', { id, userId: currentUserId });

        // Validar ID
        const formId = parseInt(id);
        if (isNaN(formId)) {
            return res.status(400).json({ error: 'ID do formulário inválido' });
        }

        const deleted = await formService.deleteForm(formId, currentUserId);

        if (!deleted) {
            console.warn('[DELETE /forms/:id] Formulário não encontrado:', id);
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        console.log('[DELETE /forms/:id] Formulário deletado com sucesso:', id);
        res.status(204).send();
    } catch (error: any) {
        console.error('[DELETE /forms/:id] Erro:', error.message, error.stack);
        res.status(500).json({ 
            error: 'Erro ao excluir formulário',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================================
// SECTIONS & FIELDS (STRUCTURE)
// ============================================================

// GET /:id/structure - Carregar estrutura do formulário
router.get('/:id/structure', async (req, res, next) => {
    try {
        const { id } = req.params;
        const structure = await formService.getFormStructure(parseInt(id));
        res.json(structure);
    } catch (error) {
        console.error('Erro ao carregar estrutura:', error);
        next(error);
    }
});

// POST /:id/structure - Salvar estrutura do formulário
router.post('/:id/structure', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { sections, fields } = req.body;
        const currentUserId = getCurrentUserId(req);

        await formService.saveFormStructure(
            parseInt(id),
            { sections: sections || [], fields: fields || [] },
            currentUserId
        );

        res.json({ success: true, message: 'Estrutura atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar estrutura:', error);
        next(error);
    }
});

// ============================================================
// RESPONSES
// ============================================================

// GET /api/forms/:id/responses - Listar respostas de um formulário
router.get('/:id/responses', async (req, res, next) => {
    try {
        const { id } = req.params;
        const responses = await formService.getFormResponses(parseInt(id));
        res.json(responses);
    } catch (error) {
        console.error('Erro ao buscar respostas:', error);
        next(error);
    }
});

// POST /api/forms/:id/responses - Salvar resposta
router.post('/:id/responses', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId, answers, status } = req.body;

        console.log('[POST /responses] Recebido:', { formId: id, userId, answersCount: answers?.length, status });

        if (!userId || !answers) {
            return res.status(400).json({ error: 'Campos obrigatórios: userId, answers' });
        }

        // ✅ CORREÇÃO: Converter userId para número
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        
        if (isNaN(userIdNum)) {
            return res.status(400).json({ error: 'userId deve ser um número válido' });
        }

        // ✅ CORREÇÃO: Converter fieldId para número em cada answer
        const normalizedAnswers = answers.map((answer: any) => ({
            fieldId: typeof answer.fieldId === 'string' ? parseInt(answer.fieldId, 10) : answer.fieldId,
            value: answer.value
        }));

        console.log('[POST /responses] Normalizado:', { userIdNum, normalizedAnswers });

        const response = await formService.saveFormResponse(
            parseInt(id),
            userIdNum,
            normalizedAnswers,
            status || 'SUBMITTED'
        );

        console.log('[POST /responses] Sucesso:', response);
        res.status(201).json(response);
    } catch (error: any) {
        console.error('[POST /responses] Erro:', error.message, error.stack);

        // Retornar 409 CONFLICT para duplicatas
        if (error.message === 'ALREADY_SUBMITTED') {
            return res.status(409).json({ error: 'Você já respondeu este formulário.' });
        }

        // Retornar erro mais detalhado em desenvolvimento
        res.status(500).json({ 
            error: 'Erro ao salvar resposta',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
