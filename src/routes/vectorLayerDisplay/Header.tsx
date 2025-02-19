import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { createVectorLayerDisplay } from '../../modules/createRows.ts'
import { mapDrawerVectorLayerDisplayAtom } from '../../store.ts'

export const Header = memo(({ vectorLayerDisplayId }) => {
  const setMapLayerDrawerVectorLayerDisplayId = useSetAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const { vector_layer_display_id: vectorLayerDisplayIdFromRouter } =
    useParams()
  const vector_layer_display_id =
    vectorLayerDisplayId ?? vectorLayerDisplayIdFromRouter

  const db = usePGlite()
  // fetch the vector_layer_id from the db as params is not available in the map drawer
  const { rows: vectorLayerDisplays } = useLiveQuery(
    `SELECT vector_layer_id FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
    [vector_layer_display_id],
  )
  const vector_layer_id = vectorLayerDisplays?.[0]?.vector_layer_id

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const addRow = useCallback(async () => {
    const res = await createVectorLayerDisplay({ vector_layer_id })
    const vectorLayerDisplay = res.rows[0]
    if (vectorLayerDisplayId) {
      setMapLayerDrawerVectorLayerDisplayId(
        vectorLayerDisplay.vector_layer_display_id,
      )
      return
    }
    navigate({
      pathname: `../${vectorLayerDisplay.vector_layer_display_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    navigate,
    searchParams,
    setMapLayerDrawerVectorLayerDisplayId,
    vectorLayerDisplayId,
    vector_layer_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.vector_layer_displays.delete({
      where: { vector_layer_display_id },
    })
    if (vectorLayerDisplayId) {
      setMapLayerDrawerVectorLayerDisplayId(null)
      return
    }
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [
    db.vector_layer_displays,
    vector_layer_display_id,
    vectorLayerDisplayId,
    navigate,
    searchParams,
    setMapLayerDrawerVectorLayerDisplayId,
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
    if (vectorLayerDisplayId) {
      setMapLayerDrawerVectorLayerDisplayId(next.vector_layer_display_id)
      return
    }
    navigate({
      pathname: `../${next.vector_layer_display_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.vector_layer_displays,
    navigate,
    searchParams,
    setMapLayerDrawerVectorLayerDisplayId,
    vectorLayerDisplayId,
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
    if (vectorLayerDisplayId) {
      setMapLayerDrawerVectorLayerDisplayId(previous.vector_layer_display_id)
      return
    }
    navigate({
      pathname: `../${previous.vector_layer_display_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.vector_layer_displays,
    navigate,
    searchParams,
    setMapLayerDrawerVectorLayerDisplayId,
    vectorLayerDisplayId,
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
