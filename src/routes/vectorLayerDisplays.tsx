import { memo, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createVectorLayerDisplay } from '../modules/createRows.ts'
import { mapDrawerVectorLayerDisplayAtom } from '../store.ts'

import '../form.css'

// this form can be used from the router or inside the left map drawer
// map drawer passes the vector_layer_id as a prop
export const Component = memo(({ vectorLayerId }) => {
  const setVectorLayerDisplayId = useSetAtom(mapDrawerVectorLayerDisplayAtom)
  const params = useParams()
  const vector_layer_id = vectorLayerId || params.vector_layer_id

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1 order by label asc`,
    [vector_layer_id],
  )
  const vlds = result?.rows ?? []

  const add = useCallback(async () => {
    const vectorLayerDisplay = createVectorLayerDisplay({ vector_layer_id })
    const columns = Object.keys(vectorLayerDisplay).join(',')
    const values = Object.values(vectorLayerDisplay)
    const sql = `insert into vector_layer_displays (${columns}) values (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
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
    db,
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
        namePlural="Vector Layer Displays"
        nameSingular="Vector Layer Display"
        tableName="vector_layer_displays"
        isFiltered={false}
        countFiltered={vlds.length}
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
