import { query, transaction } from '../config/database.js';
import { BaseService } from './base.service.js';
import { 
    CreateFormDto, 
    UpdateFormDto, 
    FormSectionDto, 
    FormFieldDto,
    SaveFormStructureDto 
} from '../dtos/forms/index.js';
import pg from 'pg';

// ============================================================
// INTERFACES DE ENTIDADES
// ============================================================

interface FormEntity {
    id: number;
    title: string;
    description: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    created_by: number;
    directorate_code: string;
    allowed_directorates: string[] | null;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

interface FormSectionEntity {
    id: number;
    form_id: number;
    title: string;
    description: string | null;
    display_order: number;
    created_at: Date;
    is_deleted: boolean;
}

interface FormFieldEntity {
    id: number;
    form_id: number;
    section_id: number | null;
    field_type: string;
    label: string;
    help_text: string | null;
    required: boolean;
    display_order: number;
    config: any;
    created_at: Date;
    is_deleted: boolean;
}

interface FormResponseEntity {
    id: number;
    form_id: number;
    user_id: number;
    status: 'DRAFT' | 'SUBMITTED';
    submitted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

// ============================================================
// FORM SERVICE
// ============================================================

export class FormService extends BaseService<FormEntity, CreateFormDto, UpdateFormDto> {
    constructor() {
        super('forms');
    }

    /**
     * Mapeia tipos de campo do banco para o formato esperado pelo frontend
     * O banco pode ter tipos como TEXT, TEXTAREA, etc. que precisam ser mapeados
     * para SHORT_TEXT, LONG_TEXT, etc.
     */
    private mapFieldTypeToFrontend(dbType: string): string {
        const typeMap: { [key: string]: string } = {
            // Tipos do banco -> Tipos do frontend
            'TEXT': 'SHORT_TEXT',
            'TEXTAREA': 'LONG_TEXT',
            'SHORT_TEXT': 'SHORT_TEXT',
            'LONG_TEXT': 'LONG_TEXT',
            'RADIO': 'MULTIPLE_CHOICE',
            'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
            'CHECKBOX': 'CHECKBOXES',
            'CHECKBOXES': 'CHECKBOXES',
            'SELECT': 'DROPDOWN',
            'DROPDOWN': 'DROPDOWN',
            'SCALE': 'SCALE',
            'NUMBER': 'NUMBER',
            'DATE': 'DATE',
            'EMAIL': 'SHORT_TEXT',
            'PHONE': 'SHORT_TEXT',
            'FILE': 'FILE'
        };

        const upperType = (dbType || '').toUpperCase();
        return typeMap[upperType] || upperType || 'SHORT_TEXT';
    }

    /**
     * Mapeia tipos de campo do frontend para o banco
     */
    private mapFieldTypeToDb(frontendType: string): string {
        // Manter o tipo original - o banco agora aceita os tipos do frontend
        return frontendType;
    }

    /**
     * Buscar formulários com filtros de visibilidade
     */
    async findAllForms(directorateCode?: string, isAdmin: boolean = false): Promise<any[]> {
        let queryText = 'SELECT * FROM forms WHERE is_deleted = FALSE';
        let queryParams: any[] = [];

        if (!isAdmin && directorateCode) {
            // Filtrar por visibilidade
            queryText += ` AND (
                allowed_directorates IS NULL 
                OR allowed_directorates = '[]'
                OR allowed_directorates::jsonb ? 'ALL'
                OR allowed_directorates::jsonb ? $1
            )`;
            queryParams.push(directorateCode);
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await query(queryText, queryParams);

        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            directorate: row.directorate_code,
            allowedDirectorates: row.allowed_directorates,
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    /**
     * Buscar formulário completo com seções, campos e contagem de respostas
     */
    async findFormById(id: number): Promise<any | null> {
        // Buscar formulário
        const formResult = await query(
            'SELECT * FROM forms WHERE id = $1 AND is_deleted = FALSE',
            [id]
        );

        if (formResult.rows.length === 0) {
            return null;
        }

        const form = formResult.rows[0];

        // Buscar seções
        const sectionsResult = await query(
            'SELECT * FROM form_sections WHERE form_id = $1 AND is_deleted = FALSE ORDER BY display_order',
            [id]
        );

        // Buscar campos
        const fieldsResult = await query(
            'SELECT * FROM form_fields WHERE form_id = $1 AND is_deleted = FALSE ORDER BY display_order',
            [id]
        );

        // Contar respostas submetidas
        const countResult = await query(
            `SELECT COUNT(*) as count FROM form_responses 
             WHERE form_id = $1 AND status = 'SUBMITTED' AND is_deleted = FALSE`,
            [id]
        );

        return {
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            directorate: form.directorate_code,
            allowedDirectorates: form.allowed_directorates,
            createdBy: form.created_by,
            createdAt: form.created_at,
            updatedAt: form.updated_at,
            sections: sectionsResult.rows.map(s => ({
                id: String(s.id),
                formId: String(id),
                title: s.title,
                description: s.description,
                order: s.display_order
            })),
            fields: fieldsResult.rows.map(f => ({
                id: String(f.id),
                formId: String(id),
                sectionId: f.section_id ? String(f.section_id) : undefined,
                type: this.mapFieldTypeToFrontend(f.field_type),
                label: f.label,
                helpText: f.help_text,
                required: f.required,
                order: f.display_order,
                config: f.config || {}
            })),
            responseCount: parseInt(countResult.rows[0].count)
        };
    }

    /**
     * Criar novo formulário
     */
    async createForm(data: CreateFormDto, userId: number): Promise<any> {
        const allowedDirs = data.allowed_directorates || [];

        const result = await query(
            `INSERT INTO forms (title, description, directorate_code, allowed_directorates, created_by, status)
             VALUES ($1, $2, $3, $4::jsonb, $5, $6)
             RETURNING *`,
            [
                data.title,
                data.description || null,
                data.directorate_code,
                JSON.stringify(allowedDirs),
                userId,
                data.status || 'DRAFT'
            ]
        );

        const form = result.rows[0];

        await this.auditService.log({
            table_name: 'forms',
            record_id: form.id,
            action: 'INSERT',
            user_id: userId,
            new_values: form
        });

        return {
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            directorate: form.directorate_code,
            allowedDirectorates: form.allowed_directorates,
            createdBy: form.created_by,
            createdAt: form.created_at,
            updatedAt: form.updated_at
        };
    }

    /**
     * Atualizar formulário
     */
    async updateForm(id: number, data: UpdateFormDto, userId: number): Promise<any | null> {
        const existing = await this.findOne(id);
        if (!existing) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(data.description);
        }
        if (data.status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(data.status);
        }
        if (data.allowed_directorates !== undefined) {
            updates.push(`allowed_directorates = $${paramCount++}::jsonb`);
            values.push(JSON.stringify(data.allowed_directorates));
        }

        if (updates.length === 0) {
            return this.findFormById(id);
        }

        updates.push('updated_at = NOW()');
        values.push(id);

        const result = await query(
            `UPDATE forms 
             SET ${updates.join(', ')}
             WHERE id = $${paramCount} AND is_deleted = FALSE
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) return null;

        const form = result.rows[0];

        await this.auditService.log({
            table_name: 'forms',
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: existing,
            new_values: form
        });

        return {
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            directorate: form.directorate_code,
            allowedDirectorates: form.allowed_directorates,
            createdBy: form.created_by,
            createdAt: form.created_at,
            updatedAt: form.updated_at
        };
    }

    /**
     * Deletar formulário (soft delete)
     */
    async deleteForm(id: number, userId: number): Promise<boolean> {
        return this.softDelete(id, userId);
    }

    /**
     * Carregar estrutura do formulário (seções e campos)
     */
    async getFormStructure(formId: number): Promise<{ sections: any[], fields: any[] }> {
        const sectionsResult = await query(
            'SELECT * FROM form_sections WHERE form_id = $1 AND is_deleted = FALSE ORDER BY display_order',
            [formId]
        );

        const fieldsResult = await query(
            'SELECT * FROM form_fields WHERE form_id = $1 AND is_deleted = FALSE ORDER BY display_order',
            [formId]
        );

        return {
            sections: sectionsResult.rows.map(s => ({
                id: String(s.id),
                formId: String(formId),
                title: s.title,
                description: s.description,
                order: s.display_order
            })),
            fields: fieldsResult.rows.map(f => ({
                id: String(f.id),
                formId: String(formId),
                sectionId: f.section_id ? String(f.section_id) : undefined,
                type: this.mapFieldTypeToFrontend(f.field_type),
                label: f.label,
                helpText: f.help_text,
                required: f.required,
                order: f.display_order,
                config: f.config || {}
            }))
        };
    }

    /**
     * Salvar estrutura do formulário (seções e campos)
     * Usa transação para garantir consistência
     */
    async saveFormStructure(
        formId: number, 
        data: { sections: any[], fields: any[] }, 
        userId: number
    ): Promise<boolean> {
        await transaction(async (client) => {
            // 1. Soft delete seções e campos antigos
            await client.query(
                `UPDATE form_fields SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = $2 
                 WHERE form_id = $1 AND is_deleted = FALSE`,
                [formId, userId]
            );
            await client.query(
                `UPDATE form_sections SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = $2 
                 WHERE form_id = $1 AND is_deleted = FALSE`,
                [formId, userId]
            );

            // Map para guardar IDs novos das seções
            const sectionIdMap = new Map<string | number, number>();

            // 2. Inserir Seções
            for (const section of data.sections) {
                const oldId = section.id;
                const res = await client.query(
                    `INSERT INTO form_sections (form_id, title, description, display_order)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                    [formId, section.title, section.description, section.order]
                );
                sectionIdMap.set(oldId, res.rows[0].id);
            }

            // 3. Inserir Campos
            for (const field of data.fields) {
                // Recuperar ID real da seção
                let realSectionId: number | null = null;
                if (field.sectionId) {
                    realSectionId = sectionIdMap.get(field.sectionId) || null;
                }

                // IMPORTANTE: Salvar o tipo original do frontend (não converter)
                // Os tipos válidos são: SHORT_TEXT, LONG_TEXT, MULTIPLE_CHOICE, CHECKBOXES, SCALE, DATE, NUMBER, DROPDOWN
                const fieldType = field.type || 'SHORT_TEXT';

                // Preparar config JSON - preservar config existente ou criar novo
                const config = field.config || {
                    options: field.options || [],
                    placeholder: field.placeholder,
                    minValue: field.minValue,
                    maxValue: field.maxValue,
                    minLabel: field.minLabel,
                    maxLabel: field.maxLabel
                };

                await client.query(
                    `INSERT INTO form_fields (
                        form_id, section_id, label, field_type, required, 
                        display_order, help_text, config
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
                    [
                        formId,
                        realSectionId,
                        field.label,
                        fieldType,
                        field.required || false,
                        field.order || 0,
                        field.helpText || null,
                        JSON.stringify(config)
                    ]
                );
            }

            // Registrar no audit
            await this.auditService.log({
                table_name: 'forms',
                record_id: formId,
                action: 'UPDATE',
                user_id: userId,
                changed_fields: ['structure', 'sections', 'fields']
            });
        });

        return true;
    }

    /**
     * Buscar respostas de um formulário
     */
    async getFormResponses(formId: number): Promise<any[]> {
        const result = await query(
            `SELECT r.*, u.name as user_name 
             FROM form_responses r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.form_id = $1 AND r.is_deleted = FALSE
             ORDER BY r.created_at DESC`,
            [formId]
        );

        // Para cada resposta, buscar as respostas dos campos
        const responses = await Promise.all(result.rows.map(async (resp) => {
            const answersResult = await query(
                'SELECT * FROM form_answers WHERE response_id = $1 AND is_deleted = FALSE',
                [resp.id]
            );

            const answers = answersResult.rows.map(answer => ({
                id: answer.id,
                responseId: answer.response_id,
                fieldId: answer.field_id,
                value: answer.value
            }));

            return {
                id: resp.id,
                formId: resp.form_id,
                userId: resp.user_id,
                userName: resp.user_name || 'Usuário Desconhecido',
                status: resp.status,
                submittedAt: resp.submitted_at || resp.created_at,
                createdAt: resp.created_at,
                updatedAt: resp.updated_at,
                answers: answers
            };
        }));

        return responses;
    }

    /**
     * Salvar resposta de formulário
     */
    async saveFormResponse(
        formId: number, 
        userId: number, 
        answers: { fieldId: number, value: any }[], 
        status: 'DRAFT' | 'SUBMITTED' = 'SUBMITTED'
    ): Promise<any> {
        return transaction(async (client) => {
            // Verificar se usuário já respondeu
            const existing = await client.query(
                'SELECT id, status FROM form_responses WHERE form_id = $1 AND user_id = $2 AND is_deleted = FALSE',
                [formId, userId]
            );

            if (existing.rows.length > 0) {
                const existingResponse = existing.rows[0];

                // Se já foi submetido, retornar erro
                if (existingResponse.status === 'SUBMITTED') {
                    throw new Error('ALREADY_SUBMITTED');
                }

                // Se for rascunho, atualizamos
                await client.query(
                    `UPDATE form_responses 
                     SET status = $1, updated_at = NOW(), submitted_at = $3
                     WHERE id = $2`,
                    [status, existingResponse.id, status === 'SUBMITTED' ? new Date() : null]
                );

                // Soft delete respostas antigas
                await client.query(
                    `UPDATE form_answers 
                     SET is_deleted = TRUE, deleted_at = NOW() 
                     WHERE response_id = $1`,
                    [existingResponse.id]
                );

                // Inserir novas respostas
                for (const answer of answers) {
                    await client.query(
                        `INSERT INTO form_answers (response_id, field_id, value)
                         VALUES ($1, $2, $3::jsonb)`,
                        [existingResponse.id, answer.fieldId, JSON.stringify(answer.value)]
                    );
                }

                await this.auditService.log({
                    table_name: 'form_responses',
                    record_id: existingResponse.id,
                    action: 'UPDATE',
                    user_id: userId
                });

                return { id: existingResponse.id, status };
            }

            // Criar nova resposta
            const respRes = await client.query(
                `INSERT INTO form_responses (form_id, user_id, status, submitted_at)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [formId, userId, status, status === 'SUBMITTED' ? new Date() : null]
            );
            const response = respRes.rows[0];

            // Salvar respostas dos campos
            for (const answer of answers) {
                await client.query(
                    `INSERT INTO form_answers (response_id, field_id, value)
                     VALUES ($1, $2, $3::jsonb)`,
                    [response.id, answer.fieldId, JSON.stringify(answer.value)]
                );
            }

            await this.auditService.log({
                table_name: 'form_responses',
                record_id: response.id,
                action: 'INSERT',
                user_id: userId
            });

            return { 
                id: response.id, 
                formId: response.form_id, 
                userId: response.user_id, 
                status: response.status 
            };
        });
    }
}

// Singleton instance
export const formService = new FormService();

