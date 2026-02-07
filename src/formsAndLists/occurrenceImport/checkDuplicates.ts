/**
 * Checks if imported data rows already exist in the database
 * Samples up to 100 rows and queries the database for each to check duplicates
 */
export const checkDuplicates = async (
  db: any,
  dataRows: any[],
  accountId: string,
): Promise<number> => {
  if (!dataRows || dataRows.length === 0) return 0

  // Sample rows: all if < 100, else every nth row to get ~100 samples
  let rowsToCheck: any[]
  if (dataRows.length <= 100) {
    rowsToCheck = dataRows
  } else {
    const step = Math.floor(dataRows.length / 100)
    rowsToCheck = []
    for (let i = 0; i < dataRows.length; i += step) {
      rowsToCheck.push(dataRows[i])
      if (rowsToCheck.length >= 100) break
    }
  }

  let duplicateCount = 0

  for (const newRow of rowsToCheck) {
    // Build WHERE conditions for non-object fields
    const conditions: string[] = []
    const values: any[] = [accountId]
    let paramIndex = 2

    for (const [key, value] of Object.entries(newRow)) {
      // Only include non-object values in the query
      if (typeof value !== 'object' || value === null) {
        conditions.push(`data->>'${key}' = $${paramIndex}`)
        values.push(value === null ? null : String(value))
        paramIndex++
      }
    }

    if (conditions.length === 0) {
      // No non-object fields to compare
      continue
    }

    // Query for matching rows
    const query = `
      SELECT COUNT(*) as count 
      FROM occurrences 
      WHERE account_id = $1 
      AND ${conditions.join(' AND ')}
    `

    try {
      const result = await db.query(query, values)
      const count = parseInt(result?.rows?.[0]?.count || 0)

      if (count > 0) {
        duplicateCount++
      }
    } catch (error) {
      // Continue checking other rows even if one fails
    }
  }

  return duplicateCount
}
