import { query } from '../config/database.js';
import { BaseService } from './base.service.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user/index.js';
import crypto from 'crypto';

/**
 * Interface do usuário no banco de dados
 */
interface UserEntity {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'VIEWER' | 'MANAGER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    diretoria: 'SGJT' | 'DPE' | 'DIJUD' | 'DTI' | 'DSTI';
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
    deleted_at: Date | null;
    deleted_by: number | null;
}

/**
 * UserService - Serviço para operações de usuários
 * 
 * Estende BaseService com funcionalidades específicas para usuários:
 * - Hash de senha
 * - Validação de email único
 * - Autenticação
 */
export class UserService extends BaseService<UserEntity, CreateUserDto, UpdateUserDto> {
    constructor() {
        super('users');
    }

    /**
     * Helper para hash SHA-256 (compatibilidade com frontend)
     */
    private hashPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Mapear entidade para DTO de resposta (sem password_hash)
     */
    private toResponseDto(user: UserEntity): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            diretoria: user.diretoria || 'SGJT',
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }

    /**
     * Buscar todos os usuários (retorna sem senha)
     */
    async findAllUsers(orderBy: string = 'name'): Promise<UserResponseDto[]> {
        const users = await this.findAll('', [], orderBy);
        return users.map(u => this.toResponseDto(u));
    }

    /**
     * Buscar usuário por ID (retorna sem senha)
     */
    async findUserById(id: number): Promise<UserResponseDto | null> {
        const user = await this.findOne(id);
        if (!user) return null;
        return this.toResponseDto(user);
    }

    /**
     * Buscar usuário por email (para autenticação)
     */
    async findByEmail(email: string): Promise<UserEntity | null> {
        const result = await query(
            `SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE`,
            [email]
        );
        return result.rows[0] || null;
    }

    /**
     * Verificar se email já existe
     */
    async emailExists(email: string, excludeId?: number): Promise<boolean> {
        let queryText = `SELECT id FROM users WHERE email = $1 AND is_deleted = FALSE`;
        const params: any[] = [email];

        if (excludeId) {
            queryText += ` AND id != $2`;
            params.push(excludeId);
        }

        const result = await query(queryText, params);
        return result.rows.length > 0;
    }

    /**
     * Criar novo usuário
     */
    async createUser(data: CreateUserDto, createdByUserId: number): Promise<UserResponseDto> {
        // Verificar se email já existe
        if (await this.emailExists(data.email)) {
            throw new Error('EMAIL_ALREADY_EXISTS');
        }

        // Hash da senha
        const passwordHash = data.password 
            ? this.hashPassword(data.password) 
            : this.hashPassword('changeme123'); // Senha padrão

        const result = await query(
            `INSERT INTO users (name, email, password_hash, role, status, diretoria)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [data.name, data.email, passwordHash, data.role, data.status || 'ACTIVE', data.diretoria || 'SGJT']
        );

        const user = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: 'users',
            record_id: user.id,
            action: 'INSERT',
            user_id: createdByUserId,
            new_values: { ...user, password_hash: '[HIDDEN]' }
        });

        return this.toResponseDto(user);
    }

    /**
     * Atualizar usuário
     */
    async updateUser(id: number, data: UpdateUserDto, updatedByUserId: number): Promise<UserResponseDto | null> {
        const existing = await this.findOne(id);
        if (!existing) {
            return null;
        }

        // Se está atualizando email, verificar unicidade
        if (data.email && data.email !== existing.email) {
            if (await this.emailExists(data.email, id)) {
                throw new Error('EMAIL_ALREADY_EXISTS');
            }
        }

        // Construir query dinamicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(data.name);
        }
        if (data.email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(data.email);
        }
        if (data.password !== undefined) {
            updates.push(`password_hash = $${paramCount++}`);
            values.push(this.hashPassword(data.password));
        }
        if (data.role !== undefined) {
            updates.push(`role = $${paramCount++}`);
            values.push(data.role);
        }
        if (data.status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(data.status);
        }
        if (data.diretoria !== undefined) {
            updates.push(`diretoria = $${paramCount++}`);
            values.push(data.diretoria);
        }

        if (updates.length === 0) {
            return this.toResponseDto(existing);
        }

        updates.push('updated_at = NOW()');
        values.push(id);

        const result = await query(
            `UPDATE users 
             SET ${updates.join(', ')}
             WHERE id = $${paramCount} AND is_deleted = FALSE
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return null;
        }

        const updated = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: 'users',
            record_id: id,
            action: 'UPDATE',
            user_id: updatedByUserId,
            old_values: { ...existing, password_hash: '[HIDDEN]' },
            new_values: { ...updated, password_hash: '[HIDDEN]' }
        });

        return this.toResponseDto(updated);
    }

    /**
     * Deletar usuário (soft delete)
     */
    async deleteUser(id: number, deletedByUserId: number): Promise<boolean> {
        return this.softDelete(id, deletedByUserId);
    }

    /**
     * Autenticar usuário
     * @returns Usuário se credenciais válidas, null se inválidas
     */
    async authenticate(email: string, passwordHash: string): Promise<UserResponseDto | null> {
        const user = await this.findByEmail(email);

        if (!user) {
            return null;
        }

        // Verificar se usuário está ativo
        if (user.status !== 'ACTIVE') {
            return null;
        }

        // Verificar senha (já vem hasheada do frontend)
        if (user.password_hash !== passwordHash) {
            return null;
        }

        // Registrar login no audit
        await this.auditService.log({
            table_name: 'users',
            record_id: user.id,
            action: 'LOGIN',
            user_id: user.id
        });

        return this.toResponseDto(user);
    }

    /**
     * Buscar respostas de formulários do usuário (incluindo os answers)
     */
    async findUserResponses(userId: number): Promise<any[]> {
        // Buscar respostas do usuário
        const responsesResult = await query(
            `SELECT r.*, f.title as form_title, f.description as form_description
             FROM form_responses r
             JOIN forms f ON r.form_id = f.id
             WHERE r.user_id = $1 AND r.is_deleted = FALSE
             ORDER BY r.created_at DESC`,
            [userId]
        );

        // Para cada resposta, buscar os answers
        const responsesWithAnswers = await Promise.all(
            responsesResult.rows.map(async (row) => {
                // Buscar answers desta resposta
                const answersResult = await query(
                    `SELECT a.id, a.field_id, a.value
                     FROM form_answers a
                     WHERE a.response_id = $1 AND a.is_deleted = FALSE`,
                    [row.id]
                );

                const answers = answersResult.rows.map(ans => ({
                    id: String(ans.id),
                    fieldId: String(ans.field_id),
                    value: ans.value // JSONB já vem parseado
                }));

                return {
                    id: String(row.id),
                    formId: String(row.form_id),
                    userId: String(row.user_id),
                    status: row.status,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    submittedAt: row.submitted_at,
                    formTitle: row.form_title,
                    formDescription: row.form_description,
                    answers: answers
                };
            })
        );

        return responsesWithAnswers;
    }
}

// Singleton instance
export const userService = new UserService();
