import { useCallback, memo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createOccurrenceImport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { subproject_id } = useParams()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT occurrence_import_id, label FROM occurrence_imports WHERE subproject_id = $1 ORDER BY label`,
    [subproject_id],
    'occurrence_import_id',
  )
  const isLoading = res === undefined
  const occurrenceImports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createOccurrenceImport({ subproject_id, db })
    const data = res?.rows?.[0]
    if (!data) return
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
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {occurrenceImports.map(({ occurrence_import_id, label }) => (
              <Row
                key={occurrence_import_id}
                label={label ?? occurrence_import_id}
                to={occurrence_import_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
