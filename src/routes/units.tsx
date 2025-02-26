import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createUnit } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { unitsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(unitsFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM units WHERE project_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by label asc`,
    [project_id],
  )
  const units = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createUnit({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.unit_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Units"
        nameSingular="Unit"
        tableName="units"
        isFiltered={isFiltered}
        countFiltered={units.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {units.map(({ unit_id, label }) => (
          <Row
            key={unit_id}
            label={label ?? unit_id}
            to={unit_id}
          />
        ))}
      </div>
    </div>
  )
})
