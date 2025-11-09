/**
 * Audit Logging Service
 * Tracks all user actions for security and compliance
 * Implements GDPR-compliant audit trails
 */

import { db } from './dbInit';

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogFilter {
  user_id?: number;
  action?: string;
  entity_type?: string;
  entity_id?: number;
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
  details?: any,
  ipAddress?: string
): Promise<void> {
  try {
    const detailsJson = details ? JSON.stringify(details) : null;

    await db.runAsync(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, action, entityType, entityId, detailsJson, ipAddress || null]
    );
  } catch (error) {
    // Don't throw on audit failures to avoid breaking main operations
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
  try {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.user_id) {
      conditions.push('user_id = ?');
      params.push(filter.user_id);
    }

    if (filter.action) {
      conditions.push('action = ?');
      params.push(filter.action);
    }

    if (filter.entity_type) {
      conditions.push('entity_type = ?');
      params.push(filter.entity_type);
    }

    if (filter.entity_id) {
      conditions.push('entity_id = ?');
      params.push(filter.entity_id);
    }

    if (filter.date_from) {
      conditions.push('created_at >= ?');
      params.push(filter.date_from);
    }

    if (filter.date_to) {
      conditions.push('created_at <= ?');
      params.push(filter.date_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = filter.limit ? `LIMIT ${filter.limit}` : '';
    const offsetClause = filter.offset ? `OFFSET ${filter.offset}` : '';

    const logs = await db.getAllAsync<AuditLog>(
      `SELECT * FROM audit_log ${whereClause} ORDER BY created_at DESC ${limitClause} ${offsetClause}`,
      params
    );

    return logs;
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw new Error('Failed to retrieve audit logs');
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditHistory(
  entityType: string,
  entityId: number
): Promise<AuditLog[]> {
  return getAuditLogs({ entity_type: entityType, entity_id: entityId });
}

/**
 * Delete old audit logs (GDPR compliance - data retention)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 365): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString();

    const result = await db.runAsync(
      'DELETE FROM audit_log WHERE created_at < ?',
      [cutoffDateStr]
    );

    console.log(`Cleaned up ${result.changes} old audit logs`);
    return result.changes;
  } catch (error) {
    console.error('Failed to cleanup audit logs:', error);
    throw new Error('Failed to cleanup audit logs');
  }
}

/**
 * Export audit logs for a user (GDPR compliance)
 */
export async function exportUserAuditLogs(userId: number): Promise<string> {
  try {
    const logs = await getAuditLogs({ user_id: userId });
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    throw new Error('Failed to export audit logs');
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(userId?: number): Promise<{
  totalLogs: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  recentActivity: number; // Last 24 hours
}> {
  try {
    const conditions = userId ? 'WHERE user_id = ?' : '';
    const params = userId ? [userId] : [];

    // Total logs
    const totalResult = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM audit_log ${conditions}`,
      params
    );
    const totalLogs = totalResult?.count || 0;

    // By action
    const actionResults = await db.getAllAsync<{ action: string; count: number }>(
      `SELECT action, COUNT(*) as count FROM audit_log ${conditions} GROUP BY action`,
      params
    );
    const byAction: Record<string, number> = {};
    actionResults.forEach(r => {
      byAction[r.action] = r.count;
    });

    // By entity type
    const entityResults = await db.getAllAsync<{ entity_type: string; count: number }>(
      `SELECT entity_type, COUNT(*) as count FROM audit_log ${conditions} GROUP BY entity_type`,
      params
    );
    const byEntityType: Record<string, number> = {};
    entityResults.forEach(r => {
      byEntityType[r.entity_type] = r.count;
    });

    // Recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const yesterdayStr = yesterday.toISOString();
    
    const recentConditions = userId
      ? 'WHERE user_id = ? AND created_at >= ?'
      : 'WHERE created_at >= ?';
    const recentParams = userId ? [userId, yesterdayStr] : [yesterdayStr];

    const recentResult = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM audit_log ${recentConditions}`,
      recentParams
    );
    const recentActivity = recentResult?.count || 0;

    return {
      totalLogs,
      byAction,
      byEntityType,
      recentActivity,
    };
  } catch (error) {
    console.error('Failed to get audit stats:', error);
    throw new Error('Failed to retrieve audit statistics');
  }
}
