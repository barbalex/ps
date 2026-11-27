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
  // On an unchanged resume the complete watermark equals the saved LSN:
  // upstream skips the transaction and never calls onInitialSync. Commit
  // once at that watermark too, but never at the -1 (incomplete) sentinel.
  if (!source.includes('/* ps:resume-watermark */')) {
    const called = source.match(/&&!(\w+)&&\w+\.isUpToDate&&\(/)?.[1]
    const watermark = /(\w+)=(\w+)>(\w+),(\w+)=\2>=\3&&/
    if (!called || !watermark.test(source)) throw new Error(`Unknown pglite-sync watermark logic in ${file}`)
    source = source.replace(watermark, `$1=$2>$3||/* ps:resume-watermark */(!${called}&&$2=== $3&&$2>=0n),$4=$2>=$3&&`)
    writeFileSync(path, source)
  }
  // 0.7.0 fires commitUpToLsn without awaiting it, then reads stream
  // readiness and offsets *inside* the async transaction. Another stream
  // can advance both while that commit is pending (or even after it fails).
  if (!source.includes('/* ps:ordered-apply */')) {
    const replaceOnce = (from, to) => {
      if (source.split(from).length !== 2) throw new Error(`Unknown pglite-sync apply logic in ${file}: ${from}`)
      source = source.replace(from, () => to)
    }
    const esm = file === 'index.js'
    const msg = esm ? 'l' : 'p'
    const errorHandler = esm ? 'a' : 'o'
    const commit = esm ? 'te' : 'ae'
    replaceOnce(`return A.subscribe(async ${msg}=>{if(y)return;`, `
      /* ps:ordered-apply */
      let queue=Promise.resolve(), failed=false;
      const caughtUp=new Set(), cursors={...w?.shape_metadata};
      return A.subscribe(${msg}=>{
        const received=new Map(${msg}.map(({shape})=>[shape,{
          handle:A.shapes[shape].shapeHandle,offset:A.shapes[shape].lastOffset
        }]));
        queue=queue.then(async ()=>{
          if(y||failed)return;
          for(const [shape,cursor] of received)cursors[shape]=cursor;
          for(const {shape,headers} of ${msg}){
            if(headers.control==="up-to-date")caughtUp.add(shape);
            if(headers.control==="must-refetch")caughtUp.delete(shape);
          }
    `)
    replaceOnce('Object.fromEntries(Object.keys(m).map(C=>[C,{handle:A.shapes[C].shapeHandle,offset:A.shapes[C].lastOffset}]))', 'cursors')
    const saveState = esm ? 'V' : 'z'
    replaceOnce(`f&&await ${saveState}({pg:O`, `f&&Array.from(j.values()).every(buffer=>buffer.size===0)&&await ${saveState}({pg:O`)
    replaceOnce('D&&!d&&A.isUpToDate', 'D&&!d&&!y&&caughtUp.size===Object.keys(m).length&&Array.from(j.values()).every(buffer=>buffer.size===0)')
    const end = `(${esm ? 'c' : 'l'}=>setTimeout(${esm ? 'c' : 'l'})))},${errorHandler})`
    replaceOnce(`(O||C)&&(${commit}(N),await new Promise${end}`, `
          if((O||C)&&(d||caughtUp.size===Object.keys(m).length))await ${commit}(N);
        }).catch(cause=>{
          failed=true;
          const error=new Error("Sync apply failed: "+cause,{cause});
          error.name="SyncApplyError";
          if(${errorHandler})${errorHandler}(error);else throw error;
        });
        return queue;
      },${errorHandler})`)
    writeFileSync(path, source)
  }
  if (source.includes('/* ps:json-column-list */')) continue
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
