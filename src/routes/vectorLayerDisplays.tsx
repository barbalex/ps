import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createVectorLayerDisplay } from '../modules/createRows.ts'

import '../form.css'

export const Component = memo(() => {
  const { vector_layer_id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: vlds = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { vector_layer_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const vectorLayerDisplay = createVectorLayerDisplay({ vector_layer_id })
    await db.vector_layer_displays.create({ data: vectorLayerDisplay })
    console.log('VectorLayerDisplays.add', { vectorLayerDisplay })
    navigate({
      pathname: vectorLayerDisplay.vector_layer_display_id,
      search: searchParams.toString(),
    })
  }, [db.vector_layer_displays, navigate, searchParams, vector_layer_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Vector Layer Displays"
        tableName="vector layer display"
        addRow={add}
      />
      <div className="list-container">
        {vlds.map(({ vector_layer_display_id, label }) => (
          <Row
            key={vector_layer_display_id}
            to={vector_layer_display_id}
            label={label ?? vector_layer_display_id}
          />
        ))}
      </div>
    </div>
  )
})
