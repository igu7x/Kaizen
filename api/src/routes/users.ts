import express from 'express';
import { userService } from '../services/user.service.js';

const router = express.Router();

// Helper para obter userId do request (TODO: implementar autenticação JWT)
const getCurrentUserId = (req: express.Request): number => {
    // Por enquanto, usar ID fixo. Quando implementar JWT, extrair do token
    return (req as any).userId || 1;
};

// GET /api/users - Listar todos os usuários
router.get('/', async (req, res, next) => {
    try {
        const users = await userService.findAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

// GET /api/users/:id - Obter usuário por ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.findUserById(parseInt(id));

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// POST /api/users - Criar novo usuário
router.post('/', async (req, res, next) => {
    try {
        const { name, email, password, role, status, diretoria } = req.body;

        // Validar inputs
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Campos obrigatórios: name, email, password, role' });
        }

        const currentUserId = getCurrentUserId(req);

        const user = await userService.createUser(
            { name, email, password, role, status, diretoria },
            currentUserId
        );

        res.status(201).json(user);
    } catch (error: any) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }
        next(error);
    }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, status, diretoria } = req.body;
        const currentUserId = getCurrentUserId(req);

        const user = await userService.updateUser(
            parseInt(id),
            { name, email, password, role, status, diretoria },
            currentUserId
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error: any) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }
        next(error);
    }
});

// DELETE /api/users/:id - Deletar usuário (SOFT DELETE)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        console.log('[DELETE /users/:id] Deletando usuário:', { id, currentUserId });

        // Validar ID
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'ID do usuário inválido' });
        }

        // Não permitir auto-exclusão
        if (userId === currentUserId) {
            return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
        }

        const deleted = await userService.deleteUser(userId, currentUserId);

        if (!deleted) {
            console.warn('[DELETE /users/:id] Usuário não encontrado:', id);
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        console.log('[DELETE /users/:id] Usuário deletado com sucesso:', id);
        res.status(204).send();
    } catch (error: any) {
        console.error('[DELETE /users/:id] Erro:', error.message);
        res.status(500).json({ 
            error: 'Erro ao excluir usuário',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/users/:id/responses - Listar respostas do usuário
router.get('/:id/responses', async (req, res, next) => {
    try {
        const { id } = req.params;
        const responses = await userService.findUserResponses(parseInt(id));
        res.json(responses);
    } catch (error) {
        next(error);
    }
});

export default router;
