import { query, transaction } from '../config/database.js';
import { BaseService } from './base.service.js';
import { 
    CreateObjectiveDto, 
    UpdateObjectiveDto, 
    CreateKeyResultDto, 
    UpdateKeyResultDto 
} from '../dtos/okr/index.js';
import pg from 'pg';

// ============================================================
// INTERFACES DE ENTIDADES
// ============================================================

interface ObjectiveEntity {
    id: number;
    code: string;
    title: string;
    description: string | null;
    directorate_code: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

interface KeyResultEntity {
    id: number;
    objective_id: number;
    code: string;
    description: string;
    status: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'NAO_INICIADO';
    situation: 'NO_PRAZO' | 'EM_ATRASO' | 'FINALIZADO';
    deadline: string | null;
    deadline_date: Date | null;
    directorate_code: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

interface InitiativeEntity {
    id: number;
    key_result_id: number;
    title: string;
    description: string | null;
    board_status: 'A_FAZER' | 'FAZENDO' | 'FEITO';
    location: 'BACKLOG' | 'EM_FILA' | 'SPRINT_ATUAL' | 'FORA_SPRINT' | 'CONCLUIDA';
    sprint_id: string | null;
    directorate_code: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

interface ProgramEntity {
    id: number;
    name: string;
    description: string | null;
    directorate_code: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

interface ProgramInitiativeEntity {
    id: number;
    program_id: number;
    title: string;
    description: string | null;
    board_status: 'A_FAZER' | 'FAZENDO' | 'FEITO';
    priority: 'SIM' | 'NAO';
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

interface ExecutionControlEntity {
    id: number;
    plan_program: string;
    kr_project_initiative: string;
    backlog_tasks: string | null;
    sprint_status: string;
    sprint_tasks: string | null;
    progress: string;
    directorate_code: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

// ============================================================
// OBJECTIVE SERVICE
// ============================================================

export class ObjectiveService extends BaseService<ObjectiveEntity, CreateObjectiveDto, UpdateObjectiveDto> {
    constructor() {
        super('objectives');
    }

    async findAllByDirectorate(directorateCode?: string): Promise<any[]> {
        let whereClause = '';
        let params: any[] = [];

        if (directorateCode) {
            whereClause = 'directorate_code = $1';
            params = [directorateCode];
        }

        const objectives = await this.findAll(whereClause, params, 'directorate_code, code');
        
        // Mapear para formato esperado pelo frontend
        return objectives.map(obj => ({
            id: obj.id,
            code: obj.code,
            title: obj.title,
            description: obj.description,
            directorate: obj.directorate_code,
            createdAt: obj.created_at,
            updatedAt: obj.updated_at
        }));
    }

    async createObjective(data: CreateObjectiveDto, userId: number): Promise<any> {
        const result = await query(
            `INSERT INTO objectives (code, title, description, directorate_code)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [data.code, data.title, data.description || null, data.directorate_code]
        );

        const obj = result.rows[0];

        await this.auditService.log({
            table_name: 'objectives',
            record_id: obj.id,
            action: 'INSERT',
            user_id: userId,
            new_values: obj
        });

        return {
            id: obj.id,
            code: obj.code,
            title: obj.title,
            description: obj.description,
            directorate: obj.directorate_code,
            createdAt: obj.created_at,
            updatedAt: obj.updated_at
        };
    }

    async updateObjective(id: number, data: UpdateObjectiveDto, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        const result = await query(
            `UPDATE objectives 
             SET code = COALESCE($1, code),
                 title = COALESCE($2, title),
                 description = COALESCE($3, description),
                 directorate_code = COALESCE($4, directorate_code),
                 updated_at = NOW()
             WHERE id = $5 AND is_deleted = FALSE
             RETURNING *`,
            [data.code, data.title, data.description, data.directorate_code, id]
        );

        if (result.rows.length === 0) return null;

        const obj = result.rows[0];

        await this.auditService.log({
            table_name: 'objectives',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: obj
        });

        return {
            id: obj.id,
            code: obj.code,
            title: obj.title,
            description: obj.description,
            directorate: obj.directorate_code,
            createdAt: obj.created_at,
            updatedAt: obj.updated_at
        };
    }

    async deleteObjective(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }
}

// ============================================================
// KEY RESULT SERVICE
// ============================================================

// Mapeamento de meses em português para número
const MONTH_MAP: Record<string, number> = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'marco': 2, 'abril': 3,
    'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
    'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
};

/**
 * Parseia um prazo no formato "mês - ano" ou "mês/ano" para uma data
 * Retorna o último dia do mês especificado
 */
function parseDeadline(deadline: string | null): Date | null {
    if (!deadline) return null;
    
    // Tentar formato "mês - ano" ou "mês/ano" ou "mês-ano"
    const normalized = deadline.toLowerCase().trim();
    
    // Tentar extrair mês e ano
    const match = normalized.match(/([a-zç]+)\s*[-\/]\s*(\d{4})/);
    if (match) {
        const monthName = match[1];
        const year = parseInt(match[2]);
        const month = MONTH_MAP[monthName];
        
        if (month !== undefined && year) {
            // Retorna o último dia do mês
            return new Date(year, month + 1, 0); // Dia 0 do próximo mês = último dia do mês atual
        }
    }
    
    // Tentar formato "MM/YYYY" ou "MM-YYYY"
    const numericMatch = normalized.match(/(\d{1,2})\s*[-\/]\s*(\d{4})/);
    if (numericMatch) {
        const month = parseInt(numericMatch[1]) - 1;
        const year = parseInt(numericMatch[2]);
        if (month >= 0 && month <= 11 && year) {
            return new Date(year, month + 1, 0);
        }
    }
    
    return null;
}

/**
 * Calcula a situação automaticamente baseada no status e no prazo
 */
function calculateSituation(status: string, deadline: string | null): 'NO_PRAZO' | 'EM_ATRASO' | 'FINALIZADO' {
    // Se concluído, situação é FINALIZADO
    if (status === 'CONCLUIDO') {
        return 'FINALIZADO';
    }
    
    // Tentar parsear o prazo
    const deadlineDate = parseDeadline(deadline);
    
    if (deadlineDate) {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Comparar apenas a data
        
        // Se o prazo já passou e não está concluído, está em atraso
        if (deadlineDate < now) {
            return 'EM_ATRASO';
        }
    }
    
    // Caso contrário, está no prazo
    return 'NO_PRAZO';
}

export class KeyResultService extends BaseService<KeyResultEntity, CreateKeyResultDto, UpdateKeyResultDto> {
    constructor() {
        super('key_results');
    }

    async findAllByObjective(objectiveId?: number): Promise<any[]> {
        let whereClause = '';
        let params: any[] = [];

        if (objectiveId) {
            whereClause = 'objective_id = $1';
            params = [objectiveId];
        }

        const krs = await this.findAll(whereClause, params, 'objective_id, code');

        // Calcular situação automaticamente para cada KR
        return krs.map(kr => {
            const calculatedSituation = calculateSituation(kr.status, kr.deadline);
            
            return {
                id: kr.id,
                objectiveId: kr.objective_id,
                code: kr.code,
                description: kr.description,
                status: kr.status,
                situation: calculatedSituation, // Situação calculada automaticamente
                deadline: kr.deadline,
                directorate: kr.directorate_code,
                createdAt: kr.created_at,
                updatedAt: kr.updated_at
            };
        });
    }

    async createKeyResult(data: CreateKeyResultDto, userId: number): Promise<any> {
        const status = data.status || 'NAO_INICIADO';
        const deadline = data.deadline || '';
        
        // Calcular situação automaticamente
        const situation = calculateSituation(status, deadline);
        
        const result = await query(
            `INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                data.objective_id, 
                data.code, 
                data.description, 
                status,
                situation,
                deadline, 
                data.directorate_code
            ]
        );

        const kr = result.rows[0];

        await this.auditService.log({
            table_name: 'key_results',
            record_id: kr.id,
            action: 'INSERT',
            user_id: userId,
            new_values: kr
        });

        return {
            id: kr.id,
            objectiveId: kr.objective_id,
            code: kr.code,
            description: kr.description,
            status: kr.status,
            situation: situation, // Situação calculada
            deadline: kr.deadline,
            directorate: kr.directorate_code,
            createdAt: kr.created_at,
            updatedAt: kr.updated_at
        };
    }

    async updateKeyResult(id: number, data: UpdateKeyResultDto, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        // Determinar os valores finais para calcular a situação
        const finalStatus = data.status || existing.status;
        const finalDeadline = data.deadline !== undefined ? data.deadline : existing.deadline;
        
        // Calcular situação automaticamente
        const situation = calculateSituation(finalStatus, finalDeadline);

        const result = await query(
            `UPDATE key_results 
             SET code = COALESCE($1, code),
                 description = COALESCE($2, description),
                 status = COALESCE($3, status),
                 deadline = COALESCE($4, deadline),
                 situation = $5,
                 updated_at = NOW()
             WHERE id = $6 AND is_deleted = FALSE
             RETURNING *`,
            [data.code, data.description, data.status, data.deadline, situation, id]
        );

        if (result.rows.length === 0) return null;

        const kr = result.rows[0];

        await this.auditService.log({
            table_name: 'key_results',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: kr
        });

        return {
            id: kr.id,
            objectiveId: kr.objective_id,
            code: kr.code,
            description: kr.description,
            status: kr.status,
            situation: situation, // Situação calculada
            deadline: kr.deadline,
            directorate: kr.directorate_code,
            createdAt: kr.created_at,
            updatedAt: kr.updated_at
        };
    }

    async deleteKeyResult(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }
}

// ============================================================
// INITIATIVE SERVICE
// ============================================================

export class InitiativeService extends BaseService<InitiativeEntity> {
    constructor() {
        super('initiatives');
    }

    async findAllInitiatives(): Promise<any[]> {
        const initiatives = await this.findAll('', [], 'directorate_code, location, board_status');

        return initiatives.map(init => ({
            id: init.id,
            keyResultId: init.key_result_id,
            title: init.title,
            description: init.description,
            boardStatus: init.board_status,
            location: init.location,
            sprintId: init.sprint_id,
            directorate: init.directorate_code,
            createdAt: init.created_at,
            updatedAt: init.updated_at
        }));
    }

    async createInitiative(data: any, userId: number): Promise<any> {
        const result = await query(
            `INSERT INTO initiatives (key_result_id, title, description, board_status, location, sprint_id, directorate_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                data.keyResultId, 
                data.title, 
                data.description || '', 
                data.boardStatus || 'A_FAZER', 
                data.location || 'BACKLOG', 
                data.sprintId || null, 
                data.directorate
            ]
        );

        const init = result.rows[0];

        await this.auditService.log({
            table_name: 'initiatives',
            record_id: init.id,
            action: 'INSERT',
            user_id: userId,
            new_values: init
        });

        return {
            id: init.id,
            keyResultId: init.key_result_id,
            title: init.title,
            description: init.description,
            boardStatus: init.board_status,
            location: init.location,
            sprintId: init.sprint_id,
            directorate: init.directorate_code,
            createdAt: init.created_at,
            updatedAt: init.updated_at
        };
    }

    async updateInitiative(id: number, data: any, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        const result = await query(
            `UPDATE initiatives 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 board_status = COALESCE($3, board_status),
                 location = COALESCE($4, location),
                 sprint_id = COALESCE($5, sprint_id),
                 updated_at = NOW()
             WHERE id = $6 AND is_deleted = FALSE
             RETURNING *`,
            [data.title, data.description, data.boardStatus, data.location, data.sprintId, id]
        );

        if (result.rows.length === 0) return null;

        const init = result.rows[0];

        await this.auditService.log({
            table_name: 'initiatives',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: init
        });

        return {
            id: init.id,
            keyResultId: init.key_result_id,
            title: init.title,
            description: init.description,
            boardStatus: init.board_status,
            location: init.location,
            sprintId: init.sprint_id,
            directorate: init.directorate_code,
            createdAt: init.created_at,
            updatedAt: init.updated_at
        };
    }

    async deleteInitiative(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }
}

// ============================================================
// PROGRAM SERVICE
// ============================================================

export class ProgramService extends BaseService<ProgramEntity> {
    constructor() {
        super('programs');
    }

    async findAllPrograms(): Promise<any[]> {
        const programs = await this.findAll('', [], 'directorate_code, name');

        return programs.map(prog => ({
            id: prog.id,
            name: prog.name,
            description: prog.description,
            directorate: prog.directorate_code,
            createdAt: prog.created_at,
            updatedAt: prog.updated_at
        }));
    }

    async createProgram(data: any, userId: number): Promise<any> {
        const result = await query(
            `INSERT INTO programs (name, description, directorate_code)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [data.name, data.description || '', data.directorate]
        );

        const prog = result.rows[0];

        await this.auditService.log({
            table_name: 'programs',
            record_id: prog.id,
            action: 'INSERT',
            user_id: userId,
            new_values: prog
        });

        return {
            id: prog.id,
            name: prog.name,
            description: prog.description,
            directorate: prog.directorate_code,
            createdAt: prog.created_at,
            updatedAt: prog.updated_at
        };
    }

    async updateProgram(id: number, data: any, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        const result = await query(
            `UPDATE programs 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 updated_at = NOW()
             WHERE id = $3 AND is_deleted = FALSE
             RETURNING *`,
            [data.name, data.description, id]
        );

        if (result.rows.length === 0) return null;

        const prog = result.rows[0];

        await this.auditService.log({
            table_name: 'programs',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: prog
        });

        return {
            id: prog.id,
            name: prog.name,
            description: prog.description,
            directorate: prog.directorate_code,
            createdAt: prog.created_at,
            updatedAt: prog.updated_at
        };
    }

    async deleteProgram(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }
}

// ============================================================
// PROGRAM INITIATIVE SERVICE
// ============================================================

export class ProgramInitiativeService extends BaseService<ProgramInitiativeEntity> {
    constructor() {
        super('program_initiatives');
    }

    async findAllProgramInitiatives(): Promise<any[]> {
        const initiatives = await this.findAll('', [], 'created_at DESC');

        return initiatives.map(init => ({
            id: init.id,
            programId: init.program_id,
            title: init.title,
            description: init.description,
            boardStatus: init.board_status,
            priority: init.priority,
            createdAt: init.created_at
        }));
    }

    async createProgramInitiative(data: any, userId: number): Promise<any> {
        const result = await query(
            `INSERT INTO program_initiatives (program_id, title, description, board_status, priority)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [data.programId, data.title, data.description, data.boardStatus || 'A_FAZER', data.priority || 'NAO']
        );

        const init = result.rows[0];

        await this.auditService.log({
            table_name: 'program_initiatives',
            record_id: init.id,
            action: 'INSERT',
            user_id: userId,
            new_values: init
        });

        return {
            id: init.id,
            programId: init.program_id,
            title: init.title,
            description: init.description,
            boardStatus: init.board_status,
            priority: init.priority,
            createdAt: init.created_at
        };
    }

    async updateProgramInitiative(id: number, data: any, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        const result = await query(
            `UPDATE program_initiatives 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 board_status = COALESCE($3, board_status),
                 priority = COALESCE($4, priority),
                 updated_at = NOW()
             WHERE id = $5 AND is_deleted = FALSE
             RETURNING *`,
            [data.title, data.description, data.boardStatus, data.priority, id]
        );

        if (result.rows.length === 0) return null;

        const init = result.rows[0];

        await this.auditService.log({
            table_name: 'program_initiatives',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: init
        });

        return {
            id: init.id,
            programId: init.program_id,
            title: init.title,
            description: init.description,
            boardStatus: init.board_status,
            priority: init.priority,
            createdAt: init.created_at
        };
    }

    async deleteProgramInitiative(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }
}

// ============================================================
// EXECUTION CONTROL SERVICE
// ============================================================

export class ExecutionControlService extends BaseService<ExecutionControlEntity> {
    constructor() {
        super('execution_controls');
    }

    async findAllExecutionControls(): Promise<any[]> {
        const controls = await this.findAll('', [], 'created_at DESC');

        return controls.map(ctrl => ({
            id: ctrl.id,
            planProgram: ctrl.plan_program,
            krProjectInitiative: ctrl.kr_project_initiative,
            backlogTasks: ctrl.backlog_tasks,
            sprintStatus: ctrl.sprint_status,
            sprintTasks: ctrl.sprint_tasks,
            progress: ctrl.progress,
            directorate: ctrl.directorate_code,
            createdAt: ctrl.created_at
        }));
    }

    async createExecutionControl(data: any, userId: number): Promise<any> {
        const result = await query(
            `INSERT INTO execution_controls (plan_program, kr_project_initiative, backlog_tasks, sprint_status, sprint_tasks, progress, directorate_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                data.planProgram, 
                data.krProjectInitiative, 
                data.backlogTasks, 
                data.sprintStatus, 
                data.sprintTasks, 
                data.progress, 
                data.directorate
            ]
        );

        const ctrl = result.rows[0];

        await this.auditService.log({
            table_name: 'execution_controls',
            record_id: ctrl.id,
            action: 'INSERT',
            user_id: userId,
            new_values: ctrl
        });

        return {
            id: ctrl.id,
            planProgram: ctrl.plan_program,
            krProjectInitiative: ctrl.kr_project_initiative,
            backlogTasks: ctrl.backlog_tasks,
            sprintStatus: ctrl.sprint_status,
            sprintTasks: ctrl.sprint_tasks,
            progress: ctrl.progress,
            directorate: ctrl.directorate_code,
            createdAt: ctrl.created_at
        };
    }

    async updateExecutionControl(id: number, data: any, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        const result = await query(
            `UPDATE execution_controls 
             SET plan_program = COALESCE($1, plan_program),
                 kr_project_initiative = COALESCE($2, kr_project_initiative),
                 backlog_tasks = COALESCE($3, backlog_tasks),
                 sprint_status = COALESCE($4, sprint_status),
                 sprint_tasks = COALESCE($5, sprint_tasks),
                 progress = COALESCE($6, progress),
                 directorate_code = COALESCE($7, directorate_code),
                 updated_at = NOW()
             WHERE id = $8 AND is_deleted = FALSE
             RETURNING *`,
            [
                data.planProgram, 
                data.krProjectInitiative, 
                data.backlogTasks, 
                data.sprintStatus, 
                data.sprintTasks, 
                data.progress, 
                data.directorate, 
                id
            ]
        );

        if (result.rows.length === 0) return null;

        const ctrl = result.rows[0];

        await this.auditService.log({
            table_name: 'execution_controls',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: ctrl
        });

        return {
            id: ctrl.id,
            planProgram: ctrl.plan_program,
            krProjectInitiative: ctrl.kr_project_initiative,
            backlogTasks: ctrl.backlog_tasks,
            sprintStatus: ctrl.sprint_status,
            sprintTasks: ctrl.sprint_tasks,
            progress: ctrl.progress,
            directorate: ctrl.directorate_code,
            createdAt: ctrl.created_at
        };
    }

    async deleteExecutionControl(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }
}

// ============================================================
// SINGLETON INSTANCES
// ============================================================

export const objectiveService = new ObjectiveService();
export const keyResultService = new KeyResultService();
export const initiativeService = new InitiativeService();
export const programService = new ProgramService();
export const programInitiativeService = new ProgramInitiativeService();
export const executionControlService = new ExecutionControlService();

