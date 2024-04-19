import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { RiTreasureMapLine } from 'react-icons/ri'
import { TbMapOff } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'
import { ReactComponent as TreasureMapLine } from '../../images/treasure-map-line.svg'

import { createVectorLayer } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, vector_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const droppableLayer = appState?.droppable_layer
  const draggableLayer = appState?.draggable_layer

  console.log('hello vectorLayer Header', {
    droppableLayer,
    draggableLayer,
    TreasureMapLine,
  })

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
          icon={<TreasureMapLine />}
          onClick={() => console.log('TODO:')}
          title={'test'}
        />
      }
    />
  )
})
