import type { Language } from '../store.ts'

/** SQL expression for the localized subproject singular name, with German fallback */
export const subprojectNameSingularExpr = (language: Language, tableAlias = '') => {
  const p = tableAlias ? `${tableAlias}.` : ''
  if (language === 'de') return `${p}subproject_name_singular`
  return `COALESCE(NULLIF(${p}subproject_name_singular_${language}, ''), ${p}subproject_name_singular)`
}

/** SQL expression for the localized subproject plural name, with German fallback */
export const subprojectNamePluralExpr = (language: Language, tableAlias = '') => {
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
