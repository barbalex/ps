import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { createVectorLayerDisplay } from '../../modules/createRows.ts'

export const Header = memo(() => {
  const { vector_layer_id, vector_layer_display_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const vectorLayerDisplay = createVectorLayerDisplay({ vector_layer_id })
    await db.vector_layer_displays.create({ data: vectorLayerDisplay })
    navigate({
      pathname: `../${vectorLayerDisplay.vector_layer_display_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [db.vector_layer_displays, navigate, searchParams, vector_layer_id])

  const deleteRow = useCallback(async () => {
    await db.vector_layer_displays.delete({
      where: { vector_layer_display_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [
    db.vector_layer_displays,
    vector_layer_display_id,
    navigate,
    searchParams,
  ])

  const toNext = useCallback(async () => {
    const vectorLayerDisplays = await db.vector_layer_displays.findMany({
      where: { vector_layer_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayerDisplays.length
    const index = vectorLayerDisplays.findIndex(
      (p) => p.vector_layer_display_id === vector_layer_display_id,
    )
    const next = vectorLayerDisplays[(index + 1) % len]
    navigate({
      pathname: `../${next.vector_layer_display_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.vector_layer_displays,
    navigate,
    searchParams,
    vector_layer_display_id,
    vector_layer_id,
  ])

  const toPrevious = useCallback(async () => {
    const vectorLayerDisplays = await db.vector_layer_displays.findMany({
      where: { vector_layer_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayerDisplays.length
    const index = vectorLayerDisplays.findIndex(
      (p) => p.vector_layer_display_id === vector_layer_display_id,
    )
    const previous = vectorLayerDisplays[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.vector_layer_display_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.vector_layer_displays,
    navigate,
    searchParams,
    vector_layer_display_id,
    vector_layer_id,
  ])

  return (
    <FormHeader
      title="Vector Layer Display"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer display"
    />
  )
})
