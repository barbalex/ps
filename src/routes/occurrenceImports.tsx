import { useCallback, memo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createOccurrenceImport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { subproject_id } = useParams()

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM occurrence_imports WHERE subproject_id = $1 order by label asc`,
    [subproject_id],
  )
  const occurrenceImports = result?.rows ?? []

  const add = useCallback(async () => {
    const data = createOccurrenceImport({ subproject_id })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into occurrence_imports (${columns}) values (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({
      pathname: data.occurrence_import_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Occurrence imports"
        nameSingular="occurrence import"
        tableName="occurrence_imports"
        isFiltered={false}
        countFiltered={occurrenceImports.length}
        addRow={add}
      />
      <div className="list-container">
        {occurrenceImports.map(({ occurrence_import_id, label }) => (
          <Row
            key={occurrence_import_id}
            label={label ?? occurrence_import_id}
            to={occurrence_import_id}
          />
        ))}
      </div>
    </div>
  )
})
