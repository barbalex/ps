import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createVectorLayer } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, vector_layer_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const vectorLayer = createVectorLayer({ project_id })
    await db.vector_layers.create({ data: vectorLayer })
    navigate(`../${vectorLayer.vector_layer_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.vector_layers, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.vector_layers.delete({ where: { vector_layer_id } })
    navigate('..')
  }, [db.vector_layers, navigate, vector_layer_id])

  const toNext = useCallback(async () => {
    const vectorLayers = await db.vector_layers.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const next = vectorLayers[(index + 1) % len]
    navigate(`../${next.vector_layer_id}`)
  }, [db.vector_layers, navigate, project_id, vector_layer_id])

  const toPrevious = useCallback(async () => {
    const vectorLayers = await db.vector_layers.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const previous = vectorLayers[(index + len - 1) % len]
    navigate(`../${previous.vector_layer_id}`)
  }, [db.vector_layers, navigate, project_id, vector_layer_id])

  return (
    <FormHeader
      title="Vector Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer"
    />
  )
})
