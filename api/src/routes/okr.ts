import express from 'express';
import { query } from '../config/database.js';
import { 
    objectiveService, 
    keyResultService, 
    initiativeService,
    programService,
    programInitiativeService,
    executionControlService
} from '../services/okr.service.js';

const router = express.Router();

// Helper para obter userId do request (TODO: implementar autenticação JWT)
const getCurrentUserId = (req: express.Request): number => {
    return (req as any).userId || 1;
};

// ============================================================
// OBJECTIVES
// ============================================================

// GET /api/objectives
router.get('/objectives', async (req, res, next) => {
    try {
        const { directorate } = req.query;
        const objectives = await objectiveService.findAllByDirectorate(
            directorate as string | undefined
        );
        res.json(objectives);
    } catch (error) {
        next(error);
    }
});

// POST /api/objectives
router.post('/objectives', async (req, res, next) => {
    try {
        const { code, title, description, directorate } = req.body;

        if (!code || !title || !directorate) {
            return res.status(400).json({ error: 'Campos obrigatórios: code, title, directorate' });
        }

        const currentUserId = getCurrentUserId(req);
        const objective = await objectiveService.createObjective(
            { code, title, description, directorate_code: directorate },
            currentUserId
        );

        res.status(201).json(objective);
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Código já existe para esta diretoria' });
        }
        next(error);
    }
});

// PUT /api/objectives/:id
router.put('/objectives/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, title, description, directorate } = req.body;
        const currentUserId = getCurrentUserId(req);

        const objective = await objectiveService.updateObjective(
            parseInt(id),
            { code, title, description, directorate_code: directorate },
            currentUserId
        );

        if (!objective) {
            return res.status(404).json({ error: 'Objetivo não encontrado' });
        }

        res.json(objective);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/objectives/:id (SOFT DELETE)
router.delete('/objectives/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        const deleted = await objectiveService.deleteObjective(parseInt(id), currentUserId);

        if (!deleted) {
            return res.status(404).json({ error: 'Objetivo não encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ============================================================
// KEY RESULTS
// ============================================================

// GET /api/key-results
router.get('/key-results', async (req, res, next) => {
    try {
        const { objectiveId } = req.query;
        const keyResults = await keyResultService.findAllByObjective(
            objectiveId ? parseInt(objectiveId as string) : undefined
        );
        res.json(keyResults);
    } catch (error) {
        next(error);
    }
});

// POST /api/key-results
router.post('/key-results', async (req, res, next) => {
    try {
        const { objectiveId, code, description, status, deadline, directorate } = req.body;

        if (!objectiveId || !code || !description || !directorate) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios: objectiveId, code, description, directorate' 
            });
        }

        const currentUserId = getCurrentUserId(req);
        const keyResult = await keyResultService.createKeyResult(
            { 
                objective_id: objectiveId, 
                code, 
                description, 
                status: status || 'NAO_INICIADO', 
                deadline: deadline || '', 
                directorate_code: directorate 
            },
            currentUserId
        );

        res.status(201).json(keyResult);
    } catch (error: any) {
        if (error.code === '23503') {
            return res.status(404).json({ error: 'Objetivo não encontrado' });
        }
        next(error);
    }
});

// PUT /api/key-results/:id
router.put('/key-results/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, description, status, deadline } = req.body;
        const currentUserId = getCurrentUserId(req);

        const keyResult = await keyResultService.updateKeyResult(
            parseInt(id),
            { code, description, status, deadline },
            currentUserId
        );

        if (!keyResult) {
            return res.status(404).json({ error: 'Key Result não encontrado' });
        }

        res.json(keyResult);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/key-results/:id (SOFT DELETE)
router.delete('/key-results/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        const deleted = await keyResultService.deleteKeyResult(parseInt(id), currentUserId);

        if (!deleted) {
            return res.status(404).json({ error: 'Key Result não encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ============================================================
// INITIATIVES
// ============================================================

// GET /api/initiatives
router.get('/initiatives', async (req, res, next) => {
    try {
        const initiatives = await initiativeService.findAllInitiatives();
        res.json(initiatives);
    } catch (error) {
        next(error);
    }
});

// POST /api/initiatives
router.post('/initiatives', async (req, res, next) => {
    try {
        const { keyResultId, title, description, boardStatus, location, sprintId, directorate } = req.body;

        if (!keyResultId || !title || !directorate) {
            return res.status(400).json({ error: 'Campos obrigatórios: keyResultId, title, directorate' });
        }

        const currentUserId = getCurrentUserId(req);
        const initiative = await initiativeService.createInitiative(
            { keyResultId, title, description, boardStatus, location, sprintId, directorate },
            currentUserId
        );

        res.status(201).json(initiative);
    } catch (error: any) {
        if (error.code === '23503') {
            return res.status(404).json({ error: 'Key Result não encontrado' });
        }
        next(error);
    }
});

// PUT /api/initiatives/:id
router.put('/initiatives/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, boardStatus, location, sprintId } = req.body;
        const currentUserId = getCurrentUserId(req);

        const initiative = await initiativeService.updateInitiative(
            parseInt(id),
            { title, description, boardStatus, location, sprintId },
            currentUserId
        );

        if (!initiative) {
            return res.status(404).json({ error: 'Iniciativa não encontrada' });
        }

        res.json(initiative);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/initiatives/:id (SOFT DELETE)
router.delete('/initiatives/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        const deleted = await initiativeService.deleteInitiative(parseInt(id), currentUserId);

        if (!deleted) {
            return res.status(404).json({ error: 'Iniciativa não encontrada' });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ============================================================
// PROGRAMS
// ============================================================

// GET /api/programs
router.get('/programs', async (req, res, next) => {
    try {
        const programs = await programService.findAllPrograms();
        res.json(programs);
    } catch (error) {
        next(error);
    }
});

// POST /api/programs
router.post('/programs', async (req, res, next) => {
    try {
        const { name, description, directorate } = req.body;

        if (!name || !directorate) {
            return res.status(400).json({ error: 'Campos obrigatórios: name, directorate' });
        }

        const currentUserId = getCurrentUserId(req);
        const program = await programService.createProgram(
            { name, description, directorate },
            currentUserId
        );

        res.status(201).json(program);
    } catch (error) {
        next(error);
    }
});

// PUT /api/programs/:id
router.put('/programs/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const currentUserId = getCurrentUserId(req);

        const program = await programService.updateProgram(
            parseInt(id),
            { name, description },
            currentUserId
        );

        if (!program) {
            return res.status(404).json({ error: 'Programa não encontrado' });
        }

        res.json(program);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/programs/:id (SOFT DELETE)
router.delete('/programs/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        const deleted = await programService.deleteProgram(parseInt(id), currentUserId);

        if (!deleted) {
            return res.status(404).json({ error: 'Programa não encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ============================================================
// DIRECTORATES (mantido sem alteração - tabela de referência)
// ============================================================

// GET /api/directorates
router.get('/directorates', async (req, res, next) => {
    try {
        const result = await query('SELECT code, name, description FROM directorates ORDER BY code');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

// ============================================================
// PROGRAM INITIATIVES
// ============================================================

// GET /api/program-initiatives
router.get('/program-initiatives', async (req, res, next) => {
    try {
        const initiatives = await programInitiativeService.findAllProgramInitiatives();
        res.json(initiatives);
    } catch (error) {
        next(error);
    }
});

// POST /api/program-initiatives
router.post('/program-initiatives', async (req, res, next) => {
    try {
        const { programId, title, description, boardStatus, priority } = req.body;

        if (!programId || !title) {
            return res.status(400).json({ error: 'Campos obrigatórios: programId, title' });
        }

        const currentUserId = getCurrentUserId(req);
        const initiative = await programInitiativeService.createProgramInitiative(
            { programId, title, description, boardStatus, priority },
            currentUserId
        );

        res.status(201).json(initiative);
    } catch (error) {
        next(error);
    }
});

// PUT /api/program-initiatives/:id
router.put('/program-initiatives/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, boardStatus, priority } = req.body;
        const currentUserId = getCurrentUserId(req);

        const initiative = await programInitiativeService.updateProgramInitiative(
            parseInt(id),
            { title, description, boardStatus, priority },
            currentUserId
        );

        if (!initiative) {
            return res.status(404).json({ error: 'Iniciativa não encontrada' });
        }

        res.json(initiative);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/program-initiatives/:id (SOFT DELETE)
router.delete('/program-initiatives/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        const deleted = await programInitiativeService.deleteProgramInitiative(parseInt(id), currentUserId);

        if (!deleted) {
            return res.status(404).json({ error: 'Iniciativa não encontrada' });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ============================================================
// EXECUTION CONTROLS
// ============================================================

// GET /api/execution-controls
router.get('/execution-controls', async (req, res, next) => {
    try {
        const controls = await executionControlService.findAllExecutionControls();
        res.json(controls);
    } catch (error) {
        next(error);
    }
});

// POST /api/execution-controls
router.post('/execution-controls', async (req, res, next) => {
    try {
        const { planProgram, krProjectInitiative, backlogTasks, sprintStatus, sprintTasks, progress, directorate } = req.body;

        if (!planProgram || !krProjectInitiative || !directorate) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios: planProgram, krProjectInitiative, directorate' 
            });
        }

        const currentUserId = getCurrentUserId(req);
        const control = await executionControlService.createExecutionControl(
            { planProgram, krProjectInitiative, backlogTasks, sprintStatus, sprintTasks, progress, directorate },
            currentUserId
        );

        res.status(201).json(control);
    } catch (error) {
        next(error);
    }
});

// PUT /api/execution-controls/:id
router.put('/execution-controls/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { planProgram, krProjectInitiative, backlogTasks, sprintStatus, sprintTasks, progress, directorate } = req.body;
        const currentUserId = getCurrentUserId(req);

        const control = await executionControlService.updateExecutionControl(
            parseInt(id),
            { planProgram, krProjectInitiative, backlogTasks, sprintStatus, sprintTasks, progress, directorate },
            currentUserId
        );

        if (!control) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.json(control);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/execution-controls/:id (SOFT DELETE)
router.delete('/execution-controls/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = getCurrentUserId(req);

        const deleted = await executionControlService.deleteExecutionControl(parseInt(id), currentUserId);

        if (!deleted) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
