import { memo, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createVectorLayerDisplay } from '../modules/createRows.ts'
import { useVectorLayerDisplaysNavData } from '../modules/useVectorLayerDisplaysNavData.ts'
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
    const { projectId } = params
    const vectorLayerId = vectorLayerIdIn || params.vectorLayerId
    const calledFromMapDrawer = vectorLayerIdIn !== undefined
    const db = usePGlite()

    const navigate = useNavigate()

    const { loading, navData } = useVectorLayerDisplaysNavData({
      projectId,
      vectorLayerId,
    })
    const { navs, label, nameSingular } = navData

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
        to: data.vector_layer_display_id,
        params: (prev) => ({
          ...prev,
          vectorLayerDisplayId: data.vector_layer_display_id,
        }),
      })
    }, [db, navigate, setVectorLayerDisplayId, vectorLayerId])

    const onClickRow = useCallback(
      (vector_layer_display_id) => {
        if (vectorLayerId) {
          setVectorLayerDisplayId(vector_layer_display_id)
          return
        }
        console.log('VectorLayerDisplays.onClickRow', {
          vector_layer_display_id,
          vectorLayerId,
        })
        navigate({
          to: vector_layer_display_id,
          params: (prev) => ({
            ...prev,
            vectorLayerDisplayId: vector_layer_display_id,
          }),
        })
      },
      [navigate, setVectorLayerDisplayId, vectorLayerId],
    )

    return (
      <div className="list-view">
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
        />
        <div className="list-container">
          {loading ?
            <Loading />
          : <>
              {navs.map(({ vector_layer_display_id, label }) => (
                <Row
                  key={vector_layer_display_id}
                  to={vector_layer_display_id}
                  label={label ?? vector_layer_display_id}
                  onClick={
                    calledFromMapDrawer ?
                      () => onClickRow(vector_layer_display_id)
                    : undefined
                  }
                />
              ))}
            </>
          }
        </div>
      </div>
    )
  },
)
