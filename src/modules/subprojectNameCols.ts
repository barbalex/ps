import type { Language } from '../store.ts'
import { projectTypeNames } from './projectTypeNames.ts'

/** Older projects may have only the German term, even for built-in names. */
export const subprojectNameSingularExpr = (
  language: Language,
  tableAlias = '',
) => {
  const p = tableAlias ? `${tableAlias}.` : ''
  if (language === 'de') return `${p}subproject_name_singular`
  const column = `subproject_name_singular_${language}` as const
  const literal = (text: string) => `'${text.replaceAll("'", "''")}'`
  const defaults = Object.values(projectTypeNames)
    .map(
      (names) =>
        `WHEN ${literal(names.subproject_name_singular)} THEN ${literal(names[column])}`,
    )
    .join(' ')
  return `COALESCE(NULLIF(${p}${column}, ''), CASE ${p}subproject_name_singular ${defaults} ELSE ${p}subproject_name_singular END)`
}

/** SQL expression for the localized subproject plural name, with German fallback */
export const subprojectNamePluralExpr = (
  language: Language,
  tableAlias = '',
) => {
  const p = tableAlias ? `${tableAlias}.` : ''
  if (language === 'de') return `${p}subproject_name_plural`
  return `COALESCE(NULLIF(${p}subproject_name_plural_${language}, ''), ${p}subproject_name_plural)`
}

/** Pick the localized subproject singular name from a row object, with German fallback */
export const getSubprojectNameSingular = (
  row: Record<string, unknown> | undefined,
  language: Language,
): string | undefined => {
  if (!row) return undefined
  if (language !== 'de') {
    const localized = row[`subproject_name_singular_${language}`]
    if (localized) return localized as string
  }
  return row.subproject_name_singular as string | undefined
}

/** Pick the localized subproject plural name from a row object, with German fallback */
export const getSubprojectNamePlural = (
  row: Record<string, unknown> | undefined,
  language: Language,
): string | undefined => {
  if (!row) return undefined
  if (language !== 'de') {
    const localized = row[`subproject_name_plural_${language}`]
    if (localized) return localized as string
  }
  return row.subproject_name_plural as string | undefined
}
