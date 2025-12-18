import { query, transaction } from '../config/database.js';
import { AuditService } from './audit.service.js';
import pg from 'pg';

/**
 * BaseService - Classe abstrata com CRUD genérico + Soft Delete + Audit
 * 
 * Todas as operações utilizam Soft Delete (is_deleted = TRUE).
 * NUNCA faça DELETE físico. Use softDelete().
 */
export abstract class BaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
    protected auditService = new AuditService();

    constructor(protected tableName: string) { }

    /**
     * Buscar um registro por ID (ignorando deletados)
     */
    async findOne(id: number): Promise<T | null> {
        const result = await query(
            `SELECT * FROM ${this.tableName} WHERE id = $1 AND is_deleted = FALSE`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Buscar todos os registros (ignorando deletados)
     * @param whereClause - Cláusula WHERE adicional (opcional)
     * @param params - Parâmetros para a cláusula WHERE
     * @param orderBy - Ordenação (opcional)
     */
    async findAll(whereClause: string = '', params: any[] = [], orderBy: string = 'id'): Promise<T[]> {
        const baseQuery = `SELECT * FROM ${this.tableName} WHERE is_deleted = FALSE`;
        const finalQuery = whereClause 
            ? `${baseQuery} AND ${whereClause} ORDER BY ${orderBy}` 
            : `${baseQuery} ORDER BY ${orderBy}`;

        const result = await query(finalQuery, params);
        return result.rows;
    }

    /**
     * Contar registros (ignorando deletados)
     */
    async count(whereClause: string = '', params: any[] = []): Promise<number> {
        const baseQuery = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE is_deleted = FALSE`;
        const finalQuery = whereClause ? `${baseQuery} AND ${whereClause}` : baseQuery;
        
        const result = await query(finalQuery, params);
        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Criar novo registro
     * @param data - Objeto com os dados a serem inseridos
     * @param userId - ID do usuário que está criando (para audit)
     * @returns O registro criado
     */
    async create(data: CreateDto, userId: number): Promise<T> {
        const keys = Object.keys(data as object);
        const values = Object.values(data as object);
        
        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const result = await query(
            `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
            values
        );

        const created = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: created.id,
            action: 'INSERT',
            user_id: userId,
            new_values: created
        });

        return created;
    }

    /**
     * Atualizar registro existente
     * @param id - ID do registro
     * @param data - Objeto com os campos a serem atualizados
     * @param userId - ID do usuário que está atualizando (para audit)
     * @returns O registro atualizado
     */
    async update(id: number, data: UpdateDto, userId: number): Promise<T | null> {
        // Buscar registro antigo para audit
        const oldRecord = await this.findOne(id);
        if (!oldRecord) {
            return null;
        }

        // Remover campos undefined do objeto de atualização
        const filteredData = Object.fromEntries(
            Object.entries(data as object).filter(([_, v]) => v !== undefined)
        );

        const keys = Object.keys(filteredData);
        if (keys.length === 0) {
            return oldRecord; // Nada para atualizar
        }

        const values = Object.values(filteredData);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const result = await query(
            `UPDATE ${this.tableName} 
             SET ${setClause}, updated_at = NOW()
             WHERE id = $${keys.length + 1} AND is_deleted = FALSE
             RETURNING *`,
            [...values, id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const updated = result.rows[0];

        // Calcular campos alterados
        const changedFields: string[] = [];
        for (const key of keys) {
            if ((oldRecord as any)[key] !== (updated as any)[key]) {
                changedFields.push(key);
            }
        }

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: id,
            action: 'UPDATE',
            user_id: userId,
            old_values: oldRecord,
            new_values: updated,
            changed_fields: changedFields
        });

        return updated;
    }

    /**
     * Soft Delete - Marcar registro como deletado (NÃO remove fisicamente)
     * @param id - ID do registro
     * @param userId - ID do usuário que está deletando
     */
    async softDelete(id: number, userId: number): Promise<boolean> {
        // Verificar se registro existe
        const existing = await this.findOne(id);
        if (!existing) {
            return false;
        }

        const result = await query(
            `UPDATE ${this.tableName} 
             SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = $2
             WHERE id = $1 AND is_deleted = FALSE
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return false;
        }

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: id,
            action: 'SOFT_DELETE',
            user_id: userId,
            old_values: existing
        });

        return true;
    }

    /**
     * Restaurar registro deletado (soft delete)
     * @param id - ID do registro
     * @param userId - ID do usuário que está restaurando
     */
    async restore(id: number, userId: number): Promise<T | null> {
        const result = await query(
            `UPDATE ${this.tableName} 
             SET is_deleted = FALSE, deleted_at = NULL, deleted_by = NULL
             WHERE id = $1 AND is_deleted = TRUE
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const restored = result.rows[0];

        // Registrar no audit log
        await this.auditService.log({
            table_name: this.tableName,
            record_id: id,
            action: 'RESTORE',
            user_id: userId,
            new_values: restored
        });

        return restored;
    }

    /**
     * Buscar incluindo registros deletados (para admin)
     */
    async findAllIncludingDeleted(orderBy: string = 'id'): Promise<T[]> {
        const result = await query(
            `SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`
        );
        return result.rows;
    }

    /**
     * Executar operações em transação
     */
    async withTransaction<R>(callback: (client: pg.PoolClient) => Promise<R>): Promise<R> {
        return transaction(callback);
    }
}
