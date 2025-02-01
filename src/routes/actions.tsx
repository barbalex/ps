import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

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
  const result = useLiveQuery(
    `SELECT * FROM actions WHERE place_id = ?${
      filter && ` AND (${filter})`
    } order by label asc`,
    [place_id2 ?? place_id],
  )
  const actions = result?.rows ?? []

  const isFiltered = !!filter

  const add = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into actions (${columns}) values (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({ pathname: data.action_id, search: searchParams.toString() })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Actions"
        nameSingular="action"
        tableName="actions"
        isFiltered={isFiltered}
        countFiltered={actions.length}
        addRow={add}
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
