import { memo, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { useLiveIncrementalQuery, usePGlite } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createVectorLayerDisplay } from '../modules/createRows.ts'
import { mapDrawerVectorLayerDisplayAtom } from '../store.ts'

import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer-displays/'

// this form can be used from the router or inside the left map drawer
// map drawer passes the vectorLayerId as a prop
export const VectorLayerDisplays = memo(
  ({ vectorLayerId: vectorLayerIdIn }) => {
    const setVectorLayerDisplayId = useSetAtom(mapDrawerVectorLayerDisplayAtom)
    const params = useParams({ from })
    const vectorLayerId = vectorLayerIdIn || params.vectorLayerId
    const db = usePGlite()

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const res = useLiveIncrementalQuery(
      `SELECT vector_layer_display_id, label FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY label`,
      [vectorLayerId],
      'vector_layer_display_id',
    )
    const isLoading = res === undefined
    const vlds = res?.rows ?? []

    const add = useCallback(async () => {
      const res = await createVectorLayerDisplay({ vectorLayerId, db })
      const data = res?.rows?.[0]
      if (!data) return
      if (vectorLayerId) {
        // we are in the map drawer
        setVectorLayerDisplayId(data.vector_layer_display_id)
        return
      }
      // we are in normal routing
      navigate({
        pathname: data.vector_layer_display_id,
        search: searchParams.toString(),
      })
    }, [db, navigate, searchParams, setVectorLayerDisplayId, vectorLayerId])

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
          isLoading={isLoading}
          addRow={add}
        />
        <div className="list-container">
          {isLoading ?
            <Loading />
          : <>
              {vlds.map(({ vector_layer_display_id, label }) => (
                <Row
                  key={vector_layer_display_id}
                  to={vector_layer_display_id}
                  label={label ?? vector_layer_display_id}
                  onClick={() => onClickRow(vector_layer_display_id)}
                />
              ))}
            </>
          }
        </div>
      </div>
    )
  },
)
