import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { comitesService } from '../services/comites.service.js';
import { uploadAta, deleteFile, fileExists, getAbsolutePath } from '../config/upload.js';

const router = Router();

// ============================================================
// MIDDLEWARES
// ============================================================

/**
 * Middleware para extrair userId dos headers
 */
const getUserId = (req: Request): number => {
    const userId = req.headers['x-user-id'];
    return userId ? parseInt(userId as string) : 1;
};

/**
 * Middleware para verificar se é gestor ou admin
 */
const isGestorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers['x-user-role'] as string;
    
    if (!userRole) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    
    const allowedRoles = ['GESTOR', 'ADMIN', 'MANAGER'];
    if (!allowedRoles.includes(userRole.toUpperCase())) {
        return res.status(403).json({ error: 'Sem permissão. Apenas gestores e administradores.' });
    }
    
    next();
};

// ============================================================
// ROTAS DE COMITÊS
// ============================================================

/**
 * GET /api/comites
 * Listar todos os comitês ativos
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const comites = await comitesService.findAll();
        res.json(comites);
    } catch (error: any) {
        console.error('Erro ao listar comitês:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/comites/:sigla
 * Buscar comitê por sigla
 */
router.get('/:sigla', async (req: Request, res: Response) => {
    try {
        const { sigla } = req.params;
        
        // Tentar buscar por sigla primeiro
        let comite = await comitesService.findBySigla(sigla);
        
        // Se não encontrou e é um número, tentar buscar por ID
        if (!comite && !isNaN(parseInt(sigla))) {
            comite = await comitesService.findById(parseInt(sigla));
        }
        
        if (!comite) {
            return res.status(404).json({ error: 'Comitê não encontrado' });
        }
        
        res.json(comite);
    } catch (error: any) {
        console.error('Erro ao buscar comitê:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/comites/:id
 * Atualizar comitê
 */
router.put('/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const updated = await comitesService.update(id, req.body, userId);
        
        if (!updated) {
            return res.status(404).json({ error: 'Comitê não encontrado' });
        }
        
        res.json(updated);
    } catch (error: any) {
        console.error('Erro ao atualizar comitê:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ROTAS DE MEMBROS
// ============================================================

/**
 * GET /api/comites/:comiteId/membros
 * Listar membros de um comitê
 */
router.get('/:comiteId/membros', async (req: Request, res: Response) => {
    try {
        const comiteId = parseInt(req.params.comiteId);
        const membros = await comitesService.findMembros(comiteId);
        res.json(membros);
    } catch (error: any) {
        console.error('Erro ao listar membros:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/comites/:comiteId/membros
 * Criar membro
 */
router.post('/:comiteId/membros', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const comiteId = parseInt(req.params.comiteId);
        const userId = getUserId(req);
        
        const { nome, cargo, ordem } = req.body;
        
        if (!nome || !cargo) {
            return res.status(400).json({ error: 'Nome e cargo são obrigatórios' });
        }
        
        const membro = await comitesService.createMembro(comiteId, { nome, cargo, ordem }, userId);
        res.status(201).json(membro);
    } catch (error: any) {
        console.error('Erro ao criar membro:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/comites/:comiteId/membros/:id
 * Atualizar membro
 */
router.put('/:comiteId/membros/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const updated = await comitesService.updateMembro(id, req.body, userId);
        
        if (!updated) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }
        
        res.json(updated);
    } catch (error: any) {
        console.error('Erro ao atualizar membro:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/comites/:comiteId/membros/:id
 * Remover membro
 */
router.delete('/:comiteId/membros/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const deleted = await comitesService.deleteMembro(id, userId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }
        
        res.json({ message: 'Membro removido com sucesso' });
    } catch (error: any) {
        console.error('Erro ao remover membro:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ROTAS DE REUNIÕES
// ============================================================

/**
 * GET /api/comites/:comiteId/reunioes
 * Listar reuniões de um comitê
 */
router.get('/:comiteId/reunioes', async (req: Request, res: Response) => {
    try {
        const comiteId = parseInt(req.params.comiteId);
        const ano = req.query.ano ? parseInt(req.query.ano as string) : undefined;
        
        const reunioes = await comitesService.findReunioes(comiteId, ano);
        res.json(reunioes);
    } catch (error: any) {
        console.error('Erro ao listar reuniões:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/comites/:comiteId/reunioes/:id
 * Buscar reunião por ID
 */
router.get('/:comiteId/reunioes/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const reuniao = await comitesService.findReuniaoById(id);
        
        if (!reuniao) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        res.json(reuniao);
    } catch (error: any) {
        console.error('Erro ao buscar reunião:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/comites/:comiteId/reunioes
 * Criar reunião
 */
router.post('/:comiteId/reunioes', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const comiteId = parseInt(req.params.comiteId);
        const userId = getUserId(req);
        
        const { numero, ano, data, mes, status, titulo, observacoes, link_proad, link_transparencia, link_ata } = req.body;
        
        if (!numero || !ano || !data) {
            return res.status(400).json({ error: 'Número, ano e data são obrigatórios' });
        }
        
        const reuniao = await comitesService.createReuniao(comiteId, {
            numero, ano, data, mes, status, titulo, observacoes, link_proad, link_transparencia, link_ata
        }, userId);
        
        res.status(201).json(reuniao);
    } catch (error: any) {
        console.error('Erro ao criar reunião:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Já existe uma reunião com este número e ano' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/comites/:comiteId/reunioes/:id
 * Atualizar reunião
 */
router.put('/:comiteId/reunioes/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const updated = await comitesService.updateReuniao(id, req.body, userId);
        
        if (!updated) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        res.json(updated);
    } catch (error: any) {
        console.error('Erro ao atualizar reunião:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/comites/:comiteId/reunioes/:id
 * Remover reunião
 */
router.delete('/:comiteId/reunioes/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const deleted = await comitesService.deleteReuniao(id, userId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        res.json({ message: 'Reunião removida com sucesso' });
    } catch (error: any) {
        console.error('Erro ao remover reunião:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ROTAS DE PAUTA
// ============================================================

/**
 * GET /api/comites/:comiteId/reunioes/:reuniaoId/pauta
 * Listar itens da pauta
 */
router.get('/:comiteId/reunioes/:reuniaoId/pauta', async (req: Request, res: Response) => {
    try {
        const reuniaoId = parseInt(req.params.reuniaoId);
        const pauta = await comitesService.findPauta(reuniaoId);
        res.json(pauta);
    } catch (error: any) {
        console.error('Erro ao listar pauta:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/comites/:comiteId/reunioes/:reuniaoId/pauta
 * Criar item da pauta
 */
router.post('/:comiteId/reunioes/:reuniaoId/pauta', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const reuniaoId = parseInt(req.params.reuniaoId);
        const userId = getUserId(req);
        
        const { numero_item, descricao, ordem } = req.body;
        
        if (!numero_item || !descricao) {
            return res.status(400).json({ error: 'Número do item e descrição são obrigatórios' });
        }
        
        const item = await comitesService.createPauta(reuniaoId, { numero_item, descricao, ordem }, userId);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Erro ao criar item da pauta:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Já existe um item com este número nesta reunião' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/comites/:comiteId/reunioes/:reuniaoId/pauta/:id
 * Atualizar item da pauta
 */
router.put('/:comiteId/reunioes/:reuniaoId/pauta/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const updated = await comitesService.updatePauta(id, req.body, userId);
        
        if (!updated) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        res.json(updated);
    } catch (error: any) {
        console.error('Erro ao atualizar item da pauta:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/comites/:comiteId/reunioes/:reuniaoId/pauta/:id
 * Remover item da pauta
 */
router.delete('/:comiteId/reunioes/:reuniaoId/pauta/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const deleted = await comitesService.deletePauta(id, userId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        res.json({ message: 'Item removido com sucesso' });
    } catch (error: any) {
        console.error('Erro ao remover item da pauta:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ROTAS DE QUADRO DE CONTROLE
// ============================================================

/**
 * GET /api/comites/:comiteId/quadro-controle
 * Listar itens do quadro de controle
 */
router.get('/:comiteId/quadro-controle', async (req: Request, res: Response) => {
    try {
        const comiteId = parseInt(req.params.comiteId);
        const quadro = await comitesService.findQuadroControle(comiteId);
        res.json(quadro);
    } catch (error: any) {
        console.error('Erro ao listar quadro de controle:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/comites/:comiteId/quadro-controle
 * Criar item no quadro de controle
 */
router.post('/:comiteId/quadro-controle', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const comiteId = parseInt(req.params.comiteId);
        const userId = getUserId(req);
        
        console.log('📝 POST quadro-controle:', { comiteId, body: req.body, userId });
        
        const { item } = req.body;
        
        if (!item) {
            return res.status(400).json({ error: 'Item (título) é obrigatório' });
        }
        
        const quadroItem = await comitesService.createQuadroControle(comiteId, req.body, userId);
        console.log('✅ Quadro criado:', quadroItem.id);
        res.status(201).json(quadroItem);
    } catch (error: any) {
        console.error('❌ Erro ao criar item do quadro:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/comites/:comiteId/quadro-controle/:id
 * Atualizar item do quadro de controle
 */
router.put('/:comiteId/quadro-controle/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        console.log('📝 PUT quadro-controle:', { id, body: req.body, userId });
        
        const updated = await comitesService.updateQuadroControle(id, req.body, userId);
        
        if (!updated) {
            console.log('❌ Item não encontrado:', id);
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        console.log('✅ Quadro atualizado:', updated.id);
        res.json(updated);
    } catch (error: any) {
        console.error('❌ Erro ao atualizar item do quadro:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/comites/:comiteId/quadro-controle/:id
 * Remover item do quadro de controle
 */
router.delete('/:comiteId/quadro-controle/:id', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const userId = getUserId(req);
        
        const deleted = await comitesService.deleteQuadroControle(id, userId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        res.json({ message: 'Item removido com sucesso' });
    } catch (error: any) {
        console.error('Erro ao remover item do quadro:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ROTAS DE UPLOAD DE ATA (PDF)
// ============================================================

/**
 * POST /api/comites/:sigla/reunioes/:reuniaoId/upload-ata
 * Upload de PDF da ata de reunião
 */
router.post('/:sigla/reunioes/:reuniaoId/upload-ata', isGestorOrAdmin, uploadAta.single('ata'), async (req: Request, res: Response) => {
    try {
        const reuniaoId = parseInt(req.params.reuniaoId);
        const userId = getUserId(req);
        
        // Verificar se arquivo foi enviado
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        
        // Informações do arquivo
        const filename = req.file.filename;
        const filepath = req.file.path;
        const filesize = req.file.size;
        
        // Buscar reunião para validar e pegar ata anterior
        const reuniao = await comitesService.findReuniaoById(reuniaoId);
        
        if (!reuniao) {
            // Deletar arquivo enviado
            deleteFile(filepath);
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        // Se existir ata anterior, deletar arquivo antigo
        if (reuniao.ata_filepath) {
            deleteFile(reuniao.ata_filepath);
            console.log('📁 Ata anterior removida:', reuniao.ata_filepath);
        }
        
        // Atualizar registro no banco de dados
        await comitesService.updateReuniaoAta(reuniaoId, {
            ata_filename: filename,
            ata_filepath: filepath,
            ata_filesize: filesize
        }, userId);
        
        console.log('✅ Ata enviada com sucesso:', filename);
        
        return res.json({
            message: 'Ata enviada com sucesso',
            filename: filename,
            filesize: filesize,
            uploaded_at: new Date()
        });
        
    } catch (error: any) {
        console.error('❌ Erro ao fazer upload de ata:', error);
        
        // Se houver erro, deletar arquivo enviado
        if (req.file && req.file.path) {
            deleteFile(req.file.path);
        }
        
        return res.status(500).json({ 
            error: 'Erro ao fazer upload da ata',
            details: error.message 
        });
    }
});

/**
 * GET /api/comites/:sigla/reunioes/:reuniaoId/ata
 * Buscar informações da ata (sem baixar o arquivo)
 */
router.get('/:sigla/reunioes/:reuniaoId/ata', async (req: Request, res: Response) => {
    try {
        const reuniaoId = parseInt(req.params.reuniaoId);
        
        const reuniao = await comitesService.findReuniaoById(reuniaoId);
        
        if (!reuniao) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        if (!reuniao.ata_filename) {
            return res.json({ 
                has_ata: false,
                error: 'Ata não disponível'
            });
        }
        
        return res.json({
            has_ata: true,
            filename: reuniao.ata_filename,
            filesize: reuniao.ata_filesize,
            uploaded_at: reuniao.ata_uploaded_at
        });
        
    } catch (error: any) {
        console.error('❌ Erro ao buscar ata:', error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/comites/:sigla/reunioes/:reuniaoId/download-ata
 * Download/visualização do PDF da ata
 */
router.get('/:sigla/reunioes/:reuniaoId/download-ata', async (req: Request, res: Response) => {
    try {
        const reuniaoId = parseInt(req.params.reuniaoId);
        
        // Buscar reunião
        const reuniao = await comitesService.findReuniaoById(reuniaoId);
        
        if (!reuniao) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        if (!reuniao.ata_filepath) {
            return res.status(404).json({ error: 'Ata não disponível' });
        }
        
        // Verificar se arquivo existe
        if (!fileExists(reuniao.ata_filepath)) {
            console.error('❌ Arquivo não encontrado no servidor:', reuniao.ata_filepath);
            return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
        }
        
        // Definir headers para exibir PDF no navegador (não forçar download)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${reuniao.ata_filename}"`);
        
        // Enviar arquivo
        res.sendFile(getAbsolutePath(reuniao.ata_filepath));
        
    } catch (error: any) {
        console.error('❌ Erro ao baixar ata:', error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/comites/:sigla/reunioes/:reuniaoId/ata
 * Deletar ata de uma reunião
 */
router.delete('/:sigla/reunioes/:reuniaoId/ata', isGestorOrAdmin, async (req: Request, res: Response) => {
    try {
        const reuniaoId = parseInt(req.params.reuniaoId);
        const userId = getUserId(req);
        
        // Buscar reunião
        const reuniao = await comitesService.findReuniaoById(reuniaoId);
        
        if (!reuniao) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }
        
        // Deletar arquivo do sistema de arquivos
        if (reuniao.ata_filepath) {
            deleteFile(reuniao.ata_filepath);
        }
        
        // Limpar campos no banco de dados
        await comitesService.updateReuniaoAta(reuniaoId, {
            ata_filename: null,
            ata_filepath: null,
            ata_filesize: null
        }, userId);
        
        return res.json({ message: 'Ata deletada com sucesso' });
        
    } catch (error: any) {
        console.error('❌ Erro ao deletar ata:', error);
        return res.status(500).json({ error: error.message });
    }
});

export default router;


