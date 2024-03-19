import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createAction } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import { LayerMenu } from '../components/shared/LayerMenu'

import '../form.css'

export const Component = () => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: actions = [] } = useLiveQuery(
    db.actions.liveMany({
      where: { place_id: place_id2 ?? place_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

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
        title="Actions"
        addRow={add}
        tableName="action"
        menus={<LayerMenu table="actions" level={place_id2 ? 2 : 1} />}
      />
      <div className="list-container">
        {actions.map(({ action_id, label }) => (
          <Row key={action_id} label={label} to={action_id} />
        ))}
      </div>
    </div>
  )
}
