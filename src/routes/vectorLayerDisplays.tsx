import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createVectorLayerDisplay } from '../modules/createRows.ts'
import { mapDrawerVectorLayerDisplayAtom } from '../store.ts'

import '../form.css'

// this form can be used from the router or inside the left map drawer
// map drawer passes the vector_layer_id as a prop
export const Component = memo(({ vectorLayerId }) => {
  const setVectorLayerDisplayId = useSetAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const params = useParams()
  const vector_layer_id = vectorLayerId || params.vector_layer_id

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const db = usePGlite()
  const { results: vlds = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { vector_layer_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const vectorLayerDisplay = createVectorLayerDisplay({ vector_layer_id })
    await db.vector_layer_displays.create({ data: vectorLayerDisplay })
    if (vectorLayerId) {
      // we are in the map drawer
      setVectorLayerDisplayId(vectorLayerDisplay.vector_layer_display_id)
      return
    }
    // we are in normal routing
    navigate({
      pathname: vectorLayerDisplay.vector_layer_display_id,
      search: searchParams.toString(),
    })
  }, [
    db.vector_layer_displays,
    navigate,
    searchParams,
    setVectorLayerDisplayId,
    vectorLayerId,
    vector_layer_id,
  ])

  const onClickRow = useCallback(
    (vector_layer_display_id) => {
      if (vectorLayerId) {
        setVectorLayerDisplayId(vector_layer_display_id)
        return
      }
      navigate({
        pathname: vector_layer_display_id,
        search: searchParams.toString(),
      })
    },
    [navigate, searchParams, setVectorLayerDisplayId, vectorLayerId],
  )

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
            onClick={() => onClickRow(vector_layer_display_id)}
          />
        ))}
      </div>
    </div>
  )
})
