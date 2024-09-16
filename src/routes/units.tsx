import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { useElectric } from '../ElectricProvider.tsx'
import { createUnit } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { unitsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(unitsFilterAtom)
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { db } = useElectric()!

  const where = filter.length > 1 ? { OR: filter } : filter[0]

  const { results: units = [] } = useLiveQuery(
    db.units.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: unitsUnfiltered = [] } = useLiveQuery(
    db.units.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = units.length !== unitsUnfiltered.length

  const add = useCallback(async () => {
    const unit = createUnit()
    await db.units.create({
      data: {
        ...unit,
        project_id,
      },
    })
    navigate({ pathname: unit.unit_id, search: searchParams.toString() })
  }, [db.units, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Units (${
          isFiltered
            ? `${units.length}/${unitsUnfiltered.length}`
            : units.length
        })`}
        addRow={add}
        tableName="unit"
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
