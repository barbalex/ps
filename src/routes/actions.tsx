import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createAction } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'

import '../form.css'

export const Component = memo(() => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const filterField = place_id2 ? 'filter_actions_2' : 'filter_actions_1'

  const filter = useMemo(
    () =>
      appState?.[filterField]?.filter?.((f) => Object.keys(f).length > 0) ?? [],
    [appState, filterField],
  )
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
            <LayerMenu table="actions" level={place_id2 ? 2 : 1} />
            <FilterButton
              table="actions"
              filterField={filterField}
            />
          </>
        }
      />
      <div className="list-container">
        {actions.map(({ action_id, label }) => (
          <Row key={action_id} label={label ?? action_id} to={action_id} />
        ))}
      </div>
    </div>
  )
})
