import { useCallback, memo, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'
import TreasureMapLine from '../../images/treasure-map-line.svg?react'
import TreasureMapLineCrossed from '../../images/treasure-map-line-crossed.svg?react'

import { createVectorLayer } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'
import { Vector_layers as VectorLayer } from '../../generated/client'

// type props
interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  row: VectorLayer
}

export const Header = memo(({ autoFocusRef, row }: Props) => {
  const { project_id, vector_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const droppableLayer = appState?.droppable_layer
  const draggableLayers = useMemo(
    () => appState?.draggable_layers ?? [],
    [appState?.draggable_layers],
  )

  // need to:
  // 1. lowercase all
  // 2. replace all spaces with -
  const layerNameForState = row.label.replace(/ /g, '-').toLowerCase()
  const isDraggable = draggableLayers.includes(layerNameForState)

  console.log('hello vectorLayer Header', {
    droppableLayer,
    draggableLayers,
    isDraggable,
    layerNameForState,
  })

  const onClickToggleAssign = useCallback(() => {
    let newDraggableLayers = []
    // 1. if isDraggable, remove from draggableLayers
    if (isDraggable) {
      // remove from draggableLayers
      newDraggableLayers = draggableLayers?.filter(
        (layer) => layer !== layerNameForState,
      )
    } else {
      // add to draggableLayers
      newDraggableLayers = [...draggableLayers, layerNameForState]
    }
    db.app_states.update({
      where: { app_state_id: appState.app_state_id },
      data: { draggable_layers: newDraggableLayers },
    })
  }, [
    appState?.app_state_id,
    db.app_states,
    draggableLayers,
    isDraggable,
    layerNameForState,
  ])

  const addRow = useCallback(async () => {
    const vectorLayer = createVectorLayer({ project_id })
    await db.vector_layers.create({ data: vectorLayer })
    navigate({
      pathname: `../${vectorLayer.vector_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.vector_layers, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.vector_layers.delete({ where: { vector_layer_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.vector_layers, navigate, vector_layer_id, searchParams])

  const toNext = useCallback(async () => {
    const vectorLayers = await db.vector_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const next = vectorLayers[(index + 1) % len]
    navigate({
      pathname: `../${next.vector_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.vector_layers, navigate, project_id, vector_layer_id, searchParams])

  const toPrevious = useCallback(async () => {
    const vectorLayers = await db.vector_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const previous = vectorLayers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.vector_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.vector_layers, navigate, project_id, vector_layer_id, searchParams])

  return (
    <FormHeader
      title="Vector Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer"
      siblings={
        isDraggable ? (
          <Button
            size="medium"
            icon={<TreasureMapLineCrossed />}
            onClick={onClickToggleAssign}
            title="Stop assigning"
          />
        ) : (
          <Button
            size="medium"
            icon={<TreasureMapLine />}
            onClick={onClickToggleAssign}
            title="Start assigning"
          />
        )
      }
    />
  )
})
