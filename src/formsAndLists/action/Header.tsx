import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createAction } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import { createNotification } from '../../modules/createRows.ts'
import { tabsAtom, mapBoundsAtom } from '../../store.ts'

export const Header = memo(({ autoFocusRef, from }) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const { projectId, placeId, placeId2, actionId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createAction({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.action_id}`,
      params: (prev) => ({ ...prev, actionId: data.action_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, placeId, placeId2, projectId])

  const deleteRow = useCallback(async () => {
    db.query('DELETE FROM actions WHERE action_id = $1', [actionId])
    navigate({ to: '..' })
  }, [actionId, db, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT action_id FROM actions WHERE place_id = $1 ORDER BY label',
      [placeId2 ?? placeId],
    )
    const actions = res?.rows
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === actionId)
    const next = actions[(index + 1) % len]
    navigate({
      to: `../${next.action_id}`,
      params: (prev) => ({ ...prev, actionId: next.action_id }),
    })
  }, [actionId, db, navigate, placeId, placeId2])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT action_id FROM actions WHERE place_id = $1 ORDER BY label',
      [placeId2 ?? placeId],
    )
    const actions = res?.rows
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === actionId)
    const previous = actions[(index + len - 1) % len]
    navigate({
      to: `../${previous.action_id}`,
      params: (prev) => ({ ...prev, actionId: previous.action_id }),
    })
  }, [actionId, db, navigate, placeId, placeId2])

  const alertNoGeometry = useCallback(() => {
    createNotification({
      title: 'No geometry',
      body: `To zoom to an action, create it's geometry first`,
      intent: 'error',
      db,
    })
  }, [db])

  const onClickZoomTo = useCallback(async () => {
    const res = await db.query(
      'SELECT geometry FROM actions WHERE action_id = $1',
      [actionId],
    )
    const action = res?.rows?.[0]
    const geometry = action?.geometry
    if (!geometry) return alertNoGeometry()

    // 1. show map if not happening
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }

    // 2. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    setMapBounds(bounds)
  }, [actionId, alertNoGeometry, db, setMapBounds, setTabs, tabs])

  return (
    <FormHeader
      title="Action"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="action"
      siblings={
        <Button
          size="medium"
          icon={<TbZoomScan />}
          onClick={onClickZoomTo}
          title={`Zoom to action in map`}
        />
      }
    />
  )
})
