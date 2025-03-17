import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { createVectorLayerDisplay } from '../../modules/createRows.ts'
import { mapDrawerVectorLayerDisplayAtom } from '../../store.ts'

export const Header = memo(
  ({
    vectorLayerDisplayId: vectorLayerDisplayIdFromProps,
    autoFocusRef,
    from,
  }) => {
    const setMapLayerDrawerVectorLayerDisplayId = useSetAtom(
      mapDrawerVectorLayerDisplayAtom,
    )
    const { vectorLayerDisplayId: vectorLayerDisplayIdFromRouter } = useParams({
      from,
    })
    const vectorLayerDisplayId =
      vectorLayerDisplayIdFromProps ?? vectorLayerDisplayIdFromRouter

    const db = usePGlite()
    // fetch the vector_layer_id from the db as params is not available in the map drawer
    const res = useLiveIncrementalQuery(
      `SELECT vector_layer_display_id, vector_layer_id FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
      [vectorLayerDisplayId],
      'vector_layer_display_id',
    )
    const vectorLayerDisplays = res?.rows ?? []
    const vectorLayerId = vectorLayerDisplays?.[0]?.vector_layer_id

    const navigate = useNavigate()

    const addRow = useCallback(async () => {
      const res = await createVectorLayerDisplay({ vectorLayerId, db })
      const vectorLayerDisplay = res?.rows?.[0]
      if (vectorLayerDisplayIdFromProps) {
        setMapLayerDrawerVectorLayerDisplayId(
          vectorLayerDisplay.vector_layer_display_id,
        )
        return
      }
      navigate({
        to: `../${vectorLayerDisplay.vector_layer_display_id}`,
        params: (prev) => ({
          ...prev,
          vectorLayerDisplayId: vectorLayerDisplay.vector_layer_display_id,
        }),
      })
      autoFocusRef.current?.focus()
    }, [
      autoFocusRef,
      db,
      navigate,
      setMapLayerDrawerVectorLayerDisplayId,
      vectorLayerDisplayIdFromProps,
      vectorLayerId,
    ])

    const deleteRow = useCallback(async () => {
      db.query(
        `DELETE FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
        [vectorLayerDisplayId],
      )
      if (vectorLayerDisplayIdFromProps) {
        setMapLayerDrawerVectorLayerDisplayId(null)
        return
      }
      navigate({ to: '..' })
    }, [
      db,
      vectorLayerDisplayId,
      vectorLayerDisplayIdFromProps,
      navigate,
      setMapLayerDrawerVectorLayerDisplayId,
    ])

    const toNext = useCallback(async () => {
      const res = await db.query(
        `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY label`,
        [vectorLayerId],
      )
      const vectorLayerDisplays = res?.rows
      const len = vectorLayerDisplays.length
      const index = vectorLayerDisplays.findIndex(
        (p) => p.vector_layer_display_id === vectorLayerDisplayId,
      )
      const next = vectorLayerDisplays[(index + 1) % len]
      if (vectorLayerDisplayIdFromProps) {
        setMapLayerDrawerVectorLayerDisplayId(next.vector_layer_display_id)
        return
      }
      navigate({
        to: `../${next.vector_layer_display_id}`,
        params: (prev) => ({
          ...prev,
          vectorLayerDisplayId: next.vector_layer_display_id,
        }),
      })
    }, [
      db,
      navigate,
      setMapLayerDrawerVectorLayerDisplayId,
      vectorLayerDisplayIdFromProps,
      vectorLayerDisplayId,
      vectorLayerId,
    ])

    const toPrevious = useCallback(async () => {
      const res = await db.query(
        `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY label`,
        [vectorLayerId],
      )
      const vectorLayerDisplays = res?.rows
      const len = vectorLayerDisplays.length
      const index = vectorLayerDisplays.findIndex(
        (p) => p.vector_layer_display_id === vectorLayerDisplayId,
      )
      const previous = vectorLayerDisplays[(index + len - 1) % len]
      if (vectorLayerDisplayIdFromProps) {
        setMapLayerDrawerVectorLayerDisplayId(previous.vector_layer_display_id)
        return
      }
      navigate({
        to: `../${previous.vector_layer_display_id}`,
        params: (prev) => ({
          ...prev,
          vectorLayerDisplayId: previous.vector_layer_display_id,
        }),
      })
    }, [
      db,
      navigate,
      setMapLayerDrawerVectorLayerDisplayId,
      vectorLayerDisplayIdFromProps,
      vectorLayerDisplayId,
      vectorLayerId,
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
  },
)
