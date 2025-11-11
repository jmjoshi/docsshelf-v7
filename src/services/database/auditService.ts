/**
 * Audit Service
 * GDPR-compliant audit logging for user actions
 * Production-grade with data retention and export capabilities
 */

import { db } from './dbInit';

export interface AuditLogEntry {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilter {
  action?: string;
  entity_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Log an audit event
 */
export async function logAudit(
  userId: number,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: Record<string, any>
): Promise<void> {
  try {
    await db.runAsync(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        userId,
        action,
        entityType,
        entityId,
        details ? JSON.stringify(details) : null,
      ]
    );
  } catch (error) {
    // Don't throw - audit logging should not break app functionality
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Get audit logs for user
 */
export async function getAuditLogs(
  userId: number,
  filter: AuditLogFilter = {}
): Promise<AuditLogEntry[]> {
  try {
    let query = 'SELECT * FROM audit_log WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (filter.action) {
      query += ' AND action = ?';
      params.push(filter.action);
    }
    
    if (filter.entity_type) {
      query += ' AND entity_type = ?';
      params.push(filter.entity_type);
    }
    
    if (filter.date_from) {
      query += ' AND created_at >= ?';
      params.push(filter.date_from);
    }
    
    if (filter.date_to) {
      query += ' AND created_at <= ?';
      params.push(filter.date_to);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
      
      if (filter.offset) {
        query += ' OFFSET ?';
        params.push(filter.offset);
      }
    }
    
    const logs = await db.getAllAsync<AuditLogEntry>(query, params);
    return logs;
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw new Error('Failed to retrieve audit logs');
  }
}

/**
 * Export audit logs for GDPR compliance
 */
export async function exportUserAuditLogs(userId: number): Promise<string> {
  try {
    const logs = await getAuditLogs(userId);
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    throw new Error('Failed to export audit logs');
  }
}

/**
 * Clean up old audit logs (data retention policy)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffStr = cutoffDate.toISOString();
    
    const result = await db.runAsync(
      'DELETE FROM audit_log WHERE created_at < ?',
      [cutoffStr]
    );
    
    return result.changes;
  } catch (error) {
    console.error('Failed to cleanup audit logs:', error);
    throw new Error('Failed to cleanup audit logs');
  }
}
