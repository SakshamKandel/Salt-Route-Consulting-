import { prisma } from './db'
import { AuditAction, Prisma } from '@prisma/client'

interface AuditLogInput {
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, unknown>
  userId?: string
  ipAddress?: string
}

/**
 * Creates an audit log entry.
 * Fire-and-forget by default — does not block the request.
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        details: input.details ? (input.details as Prisma.InputJsonValue) : Prisma.JsonNull,
        userId: input.userId ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    })
  } catch (error) {
    // Never let audit logging crash the main request
    console.error('[AUDIT] Failed to create audit log:', error)
  }
}

/**
 * Helper to extract IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
