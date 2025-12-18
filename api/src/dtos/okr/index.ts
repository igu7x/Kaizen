
export interface CreateObjectiveDto {
    code: string;
    title: string;
    description?: string;
    directorate_code: string;
}

export interface UpdateObjectiveDto {
    code?: string;
    title?: string;
    description?: string;
    directorate_code?: string;
}

export interface CreateKeyResultDto {
    objective_id: number;
    code: string;
    description: string;
    status: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'NAO_INICIADO';
    deadline: string;
    directorate_code: string;
}

export interface UpdateKeyResultDto {
    code?: string;
    description?: string;
    status?: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'NAO_INICIADO';
    deadline?: string;
    directorate_code?: string;
}
