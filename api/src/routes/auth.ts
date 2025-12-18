import express from 'express';
import { userService } from '../services/user.service.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Autenticar usuário (password já vem hasheado do frontend)
        const user = await userService.authenticate(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // TODO: Quando implementar JWT, gerar token aqui
        // const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        // res.json({ user, token });

        // Por enquanto, retornar apenas o usuário
        res.json(user);

    } catch (error) {
        next(error);
    }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    // TODO: Quando implementar JWT, invalidar token aqui (blacklist)
    
    // Por enquanto, apenas retorna sucesso
    res.json({ message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me - Obter usuário atual
router.get('/me', async (req, res) => {
    // TODO: Quando implementar JWT, extrair usuário do token
    // const userId = req.userId; // Será definido pelo middleware de autenticação
    // const user = await userService.findUserById(userId);
    // res.json(user);

    // Por enquanto, retorna 401
    res.status(401).json({ error: 'Não autenticado' });
});

export default router;
