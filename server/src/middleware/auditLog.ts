import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Audit log middleware — appends an immutable record for every mutating API call.
 * Uses anonymization tokens for GDPR right-to-erasure compliance.
 */
export function auditLog(module: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only log mutating operations
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    // Capture the original json method to intercept the response
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Log after response is sent (non-blocking)
      setImmediate(async () => {
        try {
          await query(
            `INSERT INTO audit_logs (tenant_id, anonymization_token, user_id, action, module, entity_type, entity_id, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              req.tenantId || null,
              uuidv4(), // Anonymization token
              req.user?.userId || null,
              action || req.method,
              module,
              module,
              req.params?.id || null,
              req.body ? JSON.stringify(req.body) : null,
              req.ip,
              req.headers['user-agent'] || null,
            ]
          );
        } catch (err) {
          console.error('Audit log error:', err);
        }
      });

      return originalJson(body);
    };

    next();
  };
}
