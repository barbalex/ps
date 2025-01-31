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
  const { results: occurrenceImports = [] } = useLiveQuery(
    db.occurrence_imports.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = createOccurrenceImport({ subproject_id })
    await db.occurrence_imports.create({ data })
    navigate({
      pathname: data.occurrence_import_id,
      search: searchParams.toString(),
    })
  }, [db.occurrence_imports, navigate, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Occurrence imports"
        addRow={add}
        tableName="occurrence import"
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
