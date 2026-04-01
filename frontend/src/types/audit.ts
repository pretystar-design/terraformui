export type AuditAction =
  | 'project.create'
  | 'project.delete'
  | 'project.save'
  | 'project.rollback'
  | 'node.create'
  | 'node.delete'
  | 'node.update'
  | 'node.duplicate'
  | 'edge.create'
  | 'edge.delete'
  | 'export.execute'
  | 'validate.execute'
  | 'plan.execute'
  | 'import.execute'
  | 'auth.login'
  | 'auth.logout'

export interface AuditLogEntry {
  id: string
  userId: string
  action: AuditAction
  timestamp: number
  resourceType?: string
  resourceId?: string
  before?: unknown
  after?: unknown
  ipAddress?: string
  userAgent?: string
}
