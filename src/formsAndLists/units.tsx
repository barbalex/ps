import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createUnit } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { unitsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/units/'

export const Units = memo(() => {
  const [filter] = useAtom(unitsFilterAtom)
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      unit_id, 
      label 
    FROM units 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label`,
    [projectId],
    'unit_id',
  )
  const isLoading = res === undefined
  const units = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createUnit({ db,  projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.unit_id,
      params: (prev) => ({ ...prev, unitId: data.unit_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Units"
        nameSingular="Unit"
        tableName="units"
        isFiltered={isFiltered}
        countFiltered={units.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {units.map(({ unit_id, label }) => (
              <Row key={unit_id} label={label ?? unit_id} to={unit_id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
