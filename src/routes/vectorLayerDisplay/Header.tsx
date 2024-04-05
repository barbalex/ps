import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(() => {
  const { vector_layer_id, vector_layer_display_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const toNext = useCallback(async () => {
    const vectorLayerDisplays = await db.vector_layer_displays.findMany({
      where: {  vector_layer_id },
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
      where: {  vector_layer_id },
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
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer display"
    />
  )
})
