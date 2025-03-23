import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createAction } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { actions1FilterAtom, actions2FilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

export const Actions = memo(({ from }) => {
  const [actions1Filter] = useAtom(actions1FilterAtom)
  const [actions2Filter] = useAtom(actions2FilterAtom)

  const { projectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const filter = placeId2 ? actions2Filter : actions1Filter
  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const sql = `
    SELECT 
      action_id, 
      label 
    FROM actions 
    WHERE 
      place_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`
  const res = useLiveIncrementalQuery(sql, [placeId2 ?? placeId], 'action_id')
  const isLoading = res === undefined
  const actions = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createAction({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_id,
      params: (prev) => ({ ...prev, actionId: data.action_id }),
    })
  }, [db, navigate, placeId, placeId2, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Actions"
        nameSingular="action"
        tableName="actions"
        isFiltered={isFiltered}
        countFiltered={actions.length}
        isLoading={isLoading}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="actions"
              level={placeId2 ? 2 : 1}
              //TODO: from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {actions.map(({ action_id, label }) => (
              <Row
                key={action_id}
                label={label ?? action_id}
                to={action_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
