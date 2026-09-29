/**
 * Loads @e965/xlsx on demand, together with the codepage tables the
 * observation import needs. xlsx and cpexcel are large bundles, so they
 * must not be imported statically — callers load them when a file is
 * actually parsed. set_cptable is idempotent; calling it per import is
 * harmless.
 */
export const loadXlsx = async () => {
  const xlsx = await import('@e965/xlsx')
  const cptable = await import('@e965/xlsx/dist/cpexcel.full.mjs')
  xlsx.set_cptable(cptable)
  return xlsx
}
