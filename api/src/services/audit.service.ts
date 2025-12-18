
import { query } from '../config/database.js';

export interface AuditLogEntry {
    table_name: string;
    record_id: number;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT' | 'UPDATE_ATA';
    user_id: number;
    changed_fields?: any;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
}

export class AuditService {
    async log(entry: AuditLogEntry) {
        try {
            await query(
                `INSERT INTO audit_log (
          table_name, record_id, action, user_id,
          changed_fields, old_values, new_values,
          ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)`,
                [
                    entry.table_name,
                    entry.record_id,
                    entry.action,
                    entry.user_id,
                    JSON.stringify(entry.changed_fields || null),
                    JSON.stringify(entry.old_values || null),
                    JSON.stringify(entry.new_values || null),
                    entry.ip_address || null,
                    entry.user_agent || null
                ]
            );
        } catch (error) {
            // Log do audit não deve quebrar a aplicação, mas deve ser registrado
            console.error('Erro ao registrar audit log:', error);
        }
    }
}
