import { useCallback, memo } from 'react'
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

const layerToLabel = {
  'occurrences-to-assess': 'Occurrences to assess',
  'occurrences-not-to-assign': 'Occurrences not to assign',
  'occurrences-assigned-1': 'TODO: uups',
  'occurrences-assigned-2': 'TODO: uups',
}
const labelToLayer = Object.fromEntries(
  Object.entries(layerToLabel).map(([key, value]) => [value, key]),
)

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
  const draggableLayers = appState?.draggable_layers

  const isDraggable = draggableLayers?.length // TODO:

  console.log('hello vectorLayer Header', {
    droppableLayer,
    draggableLayers,
    TreasureMapLine,
    isDraggable,
    labelToLayer,
  })

  const onClickAssign = useCallback(() => {
    // TODO:
  }, [])

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
        <Button
          size="medium"
          icon={isDraggable ? <TreasureMapLineCrossed /> : <TreasureMapLine />}
          onClick={onClickAssign}
          title={isDraggable ? 'Disable assigning' : 'Enable assigning'}
        />
      }
    />
  )
})
