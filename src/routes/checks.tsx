import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { useElectric } from '../ElectricProvider.tsx'
import { createCheck } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { checks1FilterAtom, checks2FilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [checks1Filter] = useAtom(checks1FilterAtom)
  const [checks2Filter] = useAtom(checks2FilterAtom)

  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { db } = useElectric()!

  const filter = place_id2 ? checks2Filter : checks1Filter
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: checks = [] } = useLiveQuery(
    db.checks.liveMany({
      where: { place_id: place_id2 ?? place_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: checksUnfiltered = [] } = useLiveQuery(
    db.checks.liveMany({
      where: { place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = checks.length !== checksUnfiltered.length

  const add = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate({ pathname: data.check_id, search: searchParams.toString() })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Checks (${
          isFiltered
            ? `${checks.length}/${checksUnfiltered.length}`
            : checks.length
        })`}
        addRow={add}
        tableName="check"
        menus={
          <>
            <LayerMenu
              table="checks"
              level={place_id2 ? 2 : 1}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {checks.map(({ check_id, label }) => (
          <Row
            key={check_id}
            label={label ?? check_id}
            to={check_id}
          />
        ))}
      </div>
    </div>
  )
})
