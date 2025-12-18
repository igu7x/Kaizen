import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { colaboradoresService, SITUACOES_FUNCIONAIS, DIRETORIAS, Diretoria } from '../services/colaboradores.service.js';

const router = express.Router();

// Configuração do __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer para upload de fotos
const uploadsDir = path.join(__dirname, '../../uploads/gestores');

// Criar diretório se não existir
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `gestor-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens JPG, JPEG e PNG são permitidas'));
        }
    }
});

// Helper para obter userId do request (TODO: implementar autenticação JWT)
const getCurrentUserId = (req: express.Request): number | null => {
    // Tenta obter do usuário autenticado no request
    const user = (req as any).user;
    if (user?.id) {
        return user.id;
    }
    // Fallback: tenta obter do header ou body (para compatibilidade)
    const userId = (req as any).userId || req.body?.userId || req.headers['x-user-id'];
    return userId ? parseInt(userId) : null;
};

// ===================================================================
// GET /api/colaboradores - Listar todos os colaboradores
// Query params: ?diretoria=SGJT (opcional)
// ===================================================================
router.get('/', async (req, res, next) => {
    try {
        const diretoria = req.query.diretoria as Diretoria | undefined;
        
        // Validar diretoria se fornecida
        if (diretoria && !DIRETORIAS.includes(diretoria)) {
            return res.status(400).json({ 
                error: 'Diretoria inválida',
                validas: DIRETORIAS 
            });
        }
        
        const colaboradores = await colaboradoresService.findAllColaboradores(diretoria);
        res.json(colaboradores);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/colaboradores/estatisticas - Buscar estatísticas
// Query params: ?diretoria=SGJT (opcional)
// ===================================================================
router.get('/estatisticas', async (req, res, next) => {
    try {
        const diretoria = req.query.diretoria as Diretoria | undefined;
        
        // Validar diretoria se fornecida
        if (diretoria && !DIRETORIAS.includes(diretoria)) {
            return res.status(400).json({ 
                error: 'Diretoria inválida',
                validas: DIRETORIAS 
            });
        }
        
        const estatisticas = await colaboradoresService.getEstatisticas(diretoria);
        res.json(estatisticas);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/colaboradores/unidades - Buscar unidades de lotação
// ===================================================================
router.get('/unidades', async (req, res, next) => {
    try {
        const unidades = await colaboradoresService.getUnidadesLotacao();
        res.json(unidades);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// GET /api/colaboradores/situacoes - Listar situações funcionais válidas
// ===================================================================
router.get('/situacoes', async (_req, res) => {
    res.json(SITUACOES_FUNCIONAIS);
});

// ===================================================================
// GET /api/colaboradores/diretorias - Listar diretorias válidas
// ===================================================================
router.get('/diretorias', async (_req, res) => {
    res.json(DIRETORIAS);
});

// ===================================================================
// ORGANOGRAMA - ENDPOINTS
// ===================================================================

// GET /api/colaboradores/organograma - Buscar hierarquia completa ou filtrada
router.get('/organograma', async (req, res, next) => {
    try {
        const { diretoria } = req.query;
        
        console.log('[GET /organograma] Buscando organograma:', { diretoria });
        
        const organograma = await colaboradoresService.getOrganograma(diretoria as string);
        res.json(organograma);
    } catch (error) {
        next(error);
    }
});

// GET /api/colaboradores/organograma/diretorias - Listar diretorias disponíveis
router.get('/organograma/diretorias', async (req, res, next) => {
    try {
        console.log('[GET /organograma/diretorias] Buscando diretorias');
        
        const diretorias = await colaboradoresService.getDiretorias();
        res.json(diretorias);
    } catch (error) {
        next(error);
    }
});

// GET /api/colaboradores/organograma/subordinados/:id - Buscar subordinados diretos
router.get('/organograma/subordinados/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const gestorId = parseInt(id);
        
        if (isNaN(gestorId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        console.log('[GET /organograma/subordinados/:id] Buscando subordinados:', gestorId);
        
        const subordinados = await colaboradoresService.getSubordinados(gestorId);
        res.json(subordinados);
    } catch (error) {
        next(error);
    }
});

// GET /api/colaboradores/organograma/linha/:linha - Buscar por linha
router.get('/organograma/linha/:linha', async (req, res, next) => {
    try {
        const { linha } = req.params;
        const { diretoria } = req.query;
        const linhaNum = parseInt(linha);
        
        if (isNaN(linhaNum) || linhaNum < 1 || linhaNum > 10) {
            return res.status(400).json({ error: 'Linha deve estar entre 1 e 10' });
        }
        
        console.log('[GET /organograma/linha/:linha] Buscando linha:', { linha: linhaNum, diretoria });
        
        const gestores = await colaboradoresService.getGestoresPorLinha(linhaNum, diretoria as string);
        res.json(gestores);
    } catch (error) {
        next(error);
    }
});

// GET /api/colaboradores/organograma/possiveis-pais/:linha - Áreas disponíveis para subordinação
router.get('/organograma/possiveis-pais/:linha', async (req, res, next) => {
    try {
        const { linha } = req.params;
        const { diretoria } = req.query;
        const linhaNum = parseInt(linha);
        
        if (isNaN(linhaNum) || linhaNum < 2 || linhaNum > 10) {
            return res.status(400).json({ error: 'Linha deve estar entre 2 e 10' });
        }
        
        const possiveisPais = await colaboradoresService.getPossiveisPais(linhaNum, diretoria as string);
        res.json(possiveisPais);
    } catch (error) {
        next(error);
    }
});

// PUT /api/colaboradores/organograma/reordenar - Reordenar gestores (Drag and Drop)
router.put('/organograma/reordenar', async (req, res, next) => {
    try {
        const { linha_organograma, nova_ordem } = req.body;
        const currentUserId = getCurrentUserId(req);
        
        // Validações
        if (!linha_organograma || !Array.isArray(nova_ordem)) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios: linha_organograma (number), nova_ordem (array)' 
            });
        }

        const linha = parseInt(linha_organograma);
        if (isNaN(linha) || linha < 1 || linha > 10) {
            return res.status(400).json({ error: 'Linha deve estar entre 1 e 10' });
        }

        // Validar estrutura do array
        for (const item of nova_ordem) {
            if (!item.id || typeof item.ordem !== 'number') {
                return res.status(400).json({ 
                    error: 'Cada item deve ter: id (number) e ordem (number)' 
                });
            }
        }

        console.log('[PUT /organograma/reordenar] Reordenando:', { linha, nova_ordem });

        await colaboradoresService.reordenarGestores(linha, nova_ordem, currentUserId);
        
        res.json({ success: true, message: 'Ordem atualizada com sucesso' });
    } catch (error: any) {
        if (error.message === 'IDS_INVALIDOS') {
            return res.status(400).json({ error: 'Um ou mais IDs são inválidos' });
        }
        if (error.message === 'LINHAS_DIFERENTES') {
            return res.status(400).json({ error: 'Todos os gestores devem pertencer à mesma linha' });
        }
        next(error);
    }
});

// GET /api/colaboradores/organograma/:id - Buscar gestor por ID
router.get('/organograma/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const gestorId = parseInt(id);
        
        if (isNaN(gestorId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const gestor = await colaboradoresService.getGestorById(gestorId);
        
        if (!gestor) {
            return res.status(404).json({ error: 'Gestor não encontrado' });
        }
        
        res.json(gestor);
    } catch (error) {
        next(error);
    }
});

// POST /api/colaboradores/organograma - Criar novo gestor/área (com upload de foto)
router.post('/organograma', upload.single('foto'), async (req, res, next) => {
    try {
        const currentUserId = getCurrentUserId(req);
        const fotoPath = req.file ? `/uploads/gestores/${req.file.filename}` : null;
        
        const novoGestor = await colaboradoresService.createGestor(
            { ...req.body, foto_gestor: fotoPath },
            currentUserId
        );
        res.status(201).json(novoGestor);
    } catch (error: any) {
        // Se houver erro, remover arquivo upado
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        if (error.message === 'LINHA_INVALIDA') {
            return res.status(400).json({ error: 'Linha deve estar entre 1 e 10' });
        }
        if (error.message === 'SUBORDINACAO_OBRIGATORIA') {
            return res.status(400).json({ error: 'Linhas 2+ devem ter subordinação' });
        }
        if (error.message === 'LINHA_1_SEM_SUBORDINACAO') {
            return res.status(400).json({ error: 'Linha 1 não pode ter subordinação' });
        }
        next(error);
    }
});

// PUT /api/colaboradores/organograma/:id - Atualizar gestor/área (com upload de foto)
router.put('/organograma/:id', upload.single('foto'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const gestorId = parseInt(id);
        
        if (isNaN(gestorId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const currentUserId = getCurrentUserId(req);
        
        // Determinar o valor da foto
        let fotoGestor: string | null | undefined;
        
        if (req.file) {
            // Nova foto foi enviada
            fotoGestor = `/uploads/gestores/${req.file.filename}`;
        } else if (req.body.remover_foto === 'true' || req.body.remover_foto === true) {
            // Usuário quer remover a foto
            fotoGestor = null;
        }
        // Se nenhum dos dois, fotoGestor fica undefined e mantém a atual
        
        console.log('[PUT /organograma/:id] Atualizando:', { 
            gestorId, 
            remover_foto: req.body.remover_foto,
            nova_foto: req.file?.filename,
            fotoGestor 
        });
        
        const atualizado = await colaboradoresService.updateGestor(
            gestorId,
            { ...req.body, ...(fotoGestor !== undefined ? { foto_gestor: fotoGestor } : {}) },
            currentUserId
        );
        
        if (!atualizado) {
            // Se não encontrou gestor, remover arquivo upado
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ error: 'Gestor não encontrado' });
        }
        
        res.json(atualizado);
    } catch (error: any) {
        // Se houver erro, remover arquivo upado
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        if (error.message === 'LINHA_INVALIDA') {
            return res.status(400).json({ error: 'Linha deve estar entre 1 e 10' });
        }
        next(error);
    }
});

// DELETE /api/colaboradores/organograma/:id - Deletar gestor/área (soft delete)
router.delete('/organograma/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const gestorId = parseInt(id);
        
        if (isNaN(gestorId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const currentUserId = getCurrentUserId(req);
        const deleted = await colaboradoresService.deleteGestor(gestorId, currentUserId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Gestor não encontrado' });
        }
        
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'TEM_SUBORDINADOS') {
            return res.status(400).json({ error: 'Não é possível excluir: existem áreas subordinadas' });
        }
        next(error);
    }
});

// ===================================================================
// GET /api/colaboradores/:id - Buscar colaborador por ID
// ===================================================================
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const colaborador = await colaboradoresService.findColaboradorById(parseInt(id));

        if (!colaborador) {
            return res.status(404).json({ error: 'Colaborador não encontrado' });
        }

        res.json(colaborador);
    } catch (error) {
        next(error);
    }
});

// ===================================================================
// POST /api/colaboradores - Criar novo colaborador
// ===================================================================
router.post('/', async (req, res, next) => {
    try {
        const {
            colaborador,
            unidade_lotacao,
            situacao_funcional,
            nome_cc_fc,
            classe_cc_fc,
            cargo_efetivo,
            classe_efetivo,
            diretoria
        } = req.body;

        // Validar campos obrigatórios
        if (!colaborador || !unidade_lotacao || !situacao_funcional || !diretoria) {
            return res.status(400).json({
                error: 'Campos obrigatórios: colaborador, unidade_lotacao, situacao_funcional, diretoria'
            });
        }

        const currentUserId = getCurrentUserId(req);

        const novoColaborador = await colaboradoresService.createColaborador(
            {
                colaborador,
                unidade_lotacao,
                situacao_funcional,
                nome_cc_fc,
                classe_cc_fc,
                cargo_efetivo,
                classe_efetivo,
                diretoria
            },
            currentUserId
        );

        console.log('[POST /colaboradores] Colaborador criado:', novoColaborador.id);
        res.status(201).json(novoColaborador);
    } catch (error: any) {
        if (error.message === 'SITUACAO_FUNCIONAL_INVALIDA') {
            return res.status(400).json({
                error: 'Situação funcional inválida',
                validos: SITUACOES_FUNCIONAIS
            });
        }
        if (error.message === 'DIRETORIA_INVALIDA') {
            return res.status(400).json({
                error: 'Diretoria inválida',
                validas: DIRETORIAS
            });
        }
        next(error);
    }
});

// ===================================================================
// PUT /api/colaboradores/:id - Atualizar colaborador
// ===================================================================
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            colaborador,
            unidade_lotacao,
            situacao_funcional,
            nome_cc_fc,
            classe_cc_fc,
            cargo_efetivo,
            classe_efetivo,
            diretoria
        } = req.body;

        const currentUserId = getCurrentUserId(req);

        const atualizado = await colaboradoresService.updateColaborador(
            parseInt(id),
            {
                colaborador,
                unidade_lotacao,
                situacao_funcional,
                nome_cc_fc,
                classe_cc_fc,
                cargo_efetivo,
                classe_efetivo,
                diretoria
            },
            currentUserId
        );

        if (!atualizado) {
            return res.status(404).json({ error: 'Colaborador não encontrado' });
        }

        console.log('[PUT /colaboradores/:id] Colaborador atualizado:', id);
        res.json(atualizado);
    } catch (error: any) {
        if (error.message === 'SITUACAO_FUNCIONAL_INVALIDA') {
            return res.status(400).json({
                error: 'Situação funcional inválida',
                validos: SITUACOES_FUNCIONAIS
            });
        }
        if (error.message === 'DIRETORIA_INVALIDA') {
            return res.status(400).json({
                error: 'Diretoria inválida',
                validas: DIRETORIAS
            });
        }
        next(error);
    }
});

// ===================================================================
// DELETE /api/colaboradores/:id - Deletar colaborador (SOFT DELETE)
// ===================================================================
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        console.log('[DELETE /colaboradores/:id] Deletando colaborador:', { id, currentUserId });

        // Validar ID
        const colaboradorId = parseInt(id);
        if (isNaN(colaboradorId)) {
            return res.status(400).json({ error: 'ID do colaborador inválido' });
        }

        const deleted = await colaboradoresService.deleteColaborador(colaboradorId, currentUserId);

        if (!deleted) {
            console.warn('[DELETE /colaboradores/:id] Colaborador não encontrado:', id);
            return res.status(404).json({ error: 'Colaborador não encontrado' });
        }

        console.log('[DELETE /colaboradores/:id] Colaborador deletado com sucesso:', id);
        res.status(204).send();
    } catch (error: any) {
        console.error('[DELETE /colaboradores/:id] Erro:', error.message);
        res.status(500).json({
            error: 'Erro ao excluir colaborador',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;

