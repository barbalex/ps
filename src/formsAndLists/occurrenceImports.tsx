import { useCallback, memo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createOccurrenceImport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/'

export const OccurrenceImports = memo(() => {
  const navigate = useNavigate()
  const { subprojectId } = useParams({ from })

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT occurrence_import_id, label FROM occurrence_imports WHERE subproject_id = $1 ORDER BY label`,
    [subprojectId],
    'occurrence_import_id',
  )
  const isLoading = res === undefined
  const occurrenceImports = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createOccurrenceImport({
      subproject_id: subprojectId,
      db,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.occurrence_import_id,
      params: (prev) => ({
        ...prev,
        occurrenceImportId: data.occurrence_import_id,
      }),
    })
  }, [db, navigate, subprojectId])

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
        {isLoading ?
          <Loading />
        : <>
            {occurrenceImports.map(({ occurrence_import_id, label }) => (
              <Row
                key={occurrence_import_id}
                label={label ?? occurrence_import_id}
                to={occurrence_import_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
