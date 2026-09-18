import { parseDocument } from 'yaml'
import type { ZodError, ZodType } from 'zod'
import {
  resultEnvelopeSchema,
  taskPacketSchema,
  type ResultEnvelope,
  type TaskPacket,
} from './schemas'

export const MAX_PROTOCOL_BYTES = 256 * 1024

export interface ValidationIssue {
  path: string
  message: string
}

export interface ValidationResult<T> {
  valid: boolean
  value?: T
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

function zodIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '$',
    message: issue.message,
  }))
}

function parseYamlJsonLike(rawYaml: string): ValidationResult<unknown> {
  if (byteLength(rawYaml) > MAX_PROTOCOL_BYTES) {
    return {
      valid: false,
      errors: [
        {
          path: '$',
          message: `Protocol block exceeds ${MAX_PROTOCOL_BYTES} bytes`,
        },
      ],
      warnings: [],
    }
  }

  const doc = parseDocument(rawYaml, {
    version: '1.2',
    uniqueKeys: true,
    maxAliasCount: 0,
    prettyErrors: false,
  })

  if (doc.errors.length > 0) {
    return {
      valid: false,
      errors: doc.errors.map((error) => ({
        path: '$',
        message: error.message,
      })),
      warnings: doc.warnings.map((warning) => ({
        path: '$',
        message: warning.message,
      })),
    }
  }

  let value: unknown
  try {
    value = doc.toJS({ maxAliasCount: 0 })
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: '$',
          message: error instanceof Error ? error.message : 'Unable to decode YAML',
        },
      ],
      warnings: [],
    }
  }

  return {
    valid: true,
    value,
    errors: [],
    warnings: doc.warnings.map((warning) => ({
      path: '$',
      message: warning.message,
    })),
  }
}

function validateWithSchema<T>(
  rawYaml: string,
  schema: ZodType<T>,
): ValidationResult<T> {
  const parsed = parseYamlJsonLike(rawYaml)
  if (!parsed.valid) return parsed as ValidationResult<T>

  const checked = schema.safeParse(parsed.value)
  if (!checked.success) {
    return {
      valid: false,
      errors: zodIssues(checked.error),
      warnings: parsed.warnings,
    }
  }

  return {
    valid: true,
    value: checked.data,
    errors: [],
    warnings: parsed.warnings,
  }
}

export function validateTaskPacket(rawYaml: string): ValidationResult<TaskPacket> {
  return validateWithSchema(rawYaml, taskPacketSchema)
}

export function validateResultEnvelope(
  rawYaml: string,
  expectedTaskId?: string,
): ValidationResult<ResultEnvelope> {
  const result = validateWithSchema(rawYaml, resultEnvelopeSchema)
  if (!result.valid || !result.value) return result

  if (expectedTaskId && result.value.task_id !== expectedTaskId) {
    return {
      valid: false,
      errors: [
        {
          path: 'task_id',
          message: `Expected task_id ${expectedTaskId}, received ${result.value.task_id}`,
        },
      ],
      warnings: result.warnings,
    }
  }

  return result
}
