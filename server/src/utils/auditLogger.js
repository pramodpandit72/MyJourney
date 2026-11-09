import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  actorId = null,
  actorRole = 'SYSTEM',
  action,
  entityType,
  entityId,
  summary,
  details = {}
}, session = null) => {
  try {
    const logDoc = new AuditLog({
      actorId,
      actorRole,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : 'N/A',
      summary,
      details,
      timestamp: new Date()
    });

    if (session) {
      await logDoc.save({ session });
    } else {
      await logDoc.save();
    }
  } catch (err) {
    console.error('[AuditLog Error] Failed to write audit log:', err.message);
    // Audit log error shouldn't crash main request if outside critical transaction, but log clearly
  }
};

