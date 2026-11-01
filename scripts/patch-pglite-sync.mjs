// @electric-sql/pglite-sync's `initialInsertMethod: 'json'` bulk path builds
//   INSERT INTO "schema"."table" SELECT x.* FROM json_to_recordset($1) AS x(...)
// without a column list. The record set only contains the columns present in
// the shape (information_schema.columns filtered by the first row, in no
// guaranteed order), so for shapes with a `columns` subset — or any order
// mismatch — values land in the wrong table columns ("column X is of type
// boolean but expression is of type timestamp with time zone"). This adds the
// explicit column list after every install. Idempotent. Remove once upstream
// ships the fix (packages/pglite-sync/src/apply.ts, applyMessagesToTableWithJson).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'node_modules', '@electric-sql', 'pglite-sync', 'dist')

// `(${cols.map(c=>`"${c.column_name}"`).join(", ")})` — cols is the variable the
// minifier chose for the information_schema rows, captured from the SELECT below
const pattern =
  /(INSERT INTO "\$\{(\w+)\}"\."\$\{(\w+)\}")(\s+SELECT x\.\* from json_to_recordset\(\$1\) as x\(\$\{(\w+)\.map\()/g

for (const file of ['index.js', 'index.cjs']) {
  const path = join(dist, file)
  let source
  try {
    source = readFileSync(path, 'utf8')
  } catch {
    console.warn(`patch-pglite-sync: ${file} not found, skipping`)
    continue
  }
  if (source.includes('/* ps:json-column-list */')) {
    console.log(`patch-pglite-sync: ${file} already patched`)
    continue
  }
  let count = 0
  const patched = source.replace(pattern, (_m, insert, _schema, _table, rest, cols) => {
    count++
    return `${insert} /* ps:json-column-list */ (\${${cols}.map(b=>\`"\${b.column_name}"\`).join(", ")})${rest}`
  })
  if (count !== 1) {
    console.error(
      `patch-pglite-sync: expected 1 json_to_recordset INSERT in ${file}, found ${count} — pglite-sync changed, review the patch`,
    )
    process.exit(1)
  }
  writeFileSync(path, patched)
  console.log(`patch-pglite-sync: ${file} patched (explicit column list for json_to_recordset inserts)`)
}
