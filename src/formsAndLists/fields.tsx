import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createField } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { fieldsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Fields = memo(({ from }) => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const [filter] = useAtom(fieldsFilterAtom)
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT field_id, label 
    FROM fields 
    WHERE project_id ${projectId ? `= '${projectId}'` : 'IS NULL'}
    ${filterString ? ` AND ${filterString}` : ''} 
    ORDER BY table_name, name, level`,
    undefined,
    'field_id',
  )
  const isLoading = res === undefined
  const fields = res?.rows ?? []

  console.log('Fields', { filter, filterString, isFiltered, fields })

  const add = useCallback(async () => {
    const res = await createField({ projectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.field_id,
      params: (prev) => ({ ...prev, fieldId: data.field_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Fields"
        nameSingular="Field"
        tablename="fields"
        isFiltered={isFiltered}
        countFiltered={fields.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {fields.map(({ field_id, label }) => (
              <Row
                key={field_id}
                label={label ?? field_id}
                to={field_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
