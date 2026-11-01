import { projectTables } from '../../../scripts/project-dump-tables.mjs'
import { DUMP_TAG } from './exportProjectDump.ts'

/** parsing of the dump format written by exportProjectDump.ts; no app deps */

const knownTables = new Set(projectTables.map((entry) => entry.table))

export type DumpStatement = {
  table: string
  columns: string[]
  rows: Record<string, unknown>[]
}

export type ParsedDump = {
  statements: DumpStatement[]
  projectId: string
  projectName: string | null
}

export class ProjectDumpError extends Error {
  constructor(
    public readonly reason: 'invalid' | 'exists' | 'server' | 'offline',
    message: string,
    public readonly projectName: string | null = null,
  ) {
    super(message)
  }
}

const escapedTag = DUMP_TAG.replaceAll('$', '\\$')
const statementPattern = new RegExp(
  `^INSERT INTO "([a-z_]+)" \\(([^)]+)\\) SELECT [^$]+ FROM jsonb_populate_recordset\\(NULL::"\\1", ${escapedTag}(.*)${escapedTag}::jsonb\\)`,
)

export const parseProjectDump = (text: string): ParsedDump => {
  const statements: DumpStatement[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('--')) continue
    const match = statementPattern.exec(trimmed)
    if (!match) {
      throw new ProjectDumpError(
        'invalid',
        `not a project dump of this app: ${trimmed.slice(0, 80)}`,
      )
    }
    const [, table, columnList, json] = match
    if (!knownTables.has(table!)) {
      throw new ProjectDumpError('invalid', `unknown table ${table}`)
    }
    let rows: unknown
    try {
      rows = JSON.parse(json!)
    } catch {
      throw new ProjectDumpError('invalid', `invalid row data for ${table}`)
    }
    if (!Array.isArray(rows)) {
      throw new ProjectDumpError('invalid', `invalid row data for ${table}`)
    }
    statements.push({
      table: table!,
      columns: columnList!
        .split(',')
        .map((c) => c.trim().replace(/^"|"$/g, '')),
      rows: rows as Record<string, unknown>[],
    })
  }

  const projectRows = statements
    .filter((s) => s.table === 'projects')
    .flatMap((s) => s.rows)
  if (projectRows.length !== 1 || !projectRows[0]!.project_id) {
    throw new ProjectDumpError(
      'invalid',
      'the dump must contain exactly one project',
    )
  }
  return {
    statements,
    projectId: String(projectRows[0]!.project_id),
    projectName: (projectRows[0]!.name as string | null) ?? null,
  }
}
