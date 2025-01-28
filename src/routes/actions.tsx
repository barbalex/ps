import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createAction } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { actions1FilterAtom, actions2FilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [actions1Filter] = useAtom(actions1FilterAtom)
  const [actions2Filter] = useAtom(actions2FilterAtom)

  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filter = place_id2 ? actions2Filter : actions1Filter
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: actions = [] } = useLiveQuery(
    db.actions.liveMany({
      where: { place_id: place_id2 ?? place_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: actionsUnfiltered = [] } = useLiveQuery(
    db.actions.liveMany({
      where: { place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = actions.length !== actionsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.actions.create({ data })
    navigate({ pathname: data.action_id, search: searchParams.toString() })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Actions (${
          isFiltered
            ? `${actions.length}/${actionsUnfiltered.length}`
            : actions.length
        })`}
        addRow={add}
        tableName="action"
        menus={
          <>
            <LayerMenu
              table="actions"
              level={place_id2 ? 2 : 1}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {actions.map(({ action_id, label }) => (
          <Row
            key={action_id}
            label={label ?? action_id}
            to={action_id}
          />
        ))}
      </div>
    </div>
  )
})
