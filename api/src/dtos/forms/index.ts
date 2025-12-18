
export interface CreateFormDto {
    title: string;
    description?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    directorate_code: string;
    allowed_directorates?: string[]; // Array de strings ou JSONB no banco
    created_by: number;
}

export interface UpdateFormDto {
    title?: string;
    description?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    allowed_directorates?: string[];
}

export interface FormResponseDto {
    id: number;
    formId: number;
    userId: number;
    userName: string;
    status: 'DRAFT' | 'SUBMITTED';
    submittedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    answers: FormAnswerDto[];
}

export interface FormAnswerDto {
    id: number;
    responseId: number;
    fieldId: number;
    value: any;
}

export interface FormSectionDto {
    id?: number; // Opcional para novos
    title: string;
    description?: string;
    display_order: number;
}

export interface FormFieldDto {
    id?: number;
    section_id?: number;
    field_type: string;
    label: string;
    help_text?: string;
    required: boolean;
    display_order: number;
    config?: any;
}

export interface SaveFormStructureDto {
    sections: FormSectionDto[];
    fields: FormFieldDto[];
}
