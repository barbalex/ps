import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheck } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import { createNotification } from '../../modules/createRows.ts'
import { tabsAtom, mapBoundsAtom } from '../../store.ts'

export const Header = memo(({ autoFocusRef, from }) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const { projectId, placeId, placeId2, checkId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createCheck({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.check_id}`,
      params: (prev) => ({ ...prev, checkId: data.check_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, placeId, placeId2, projectId])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM checks WHERE check_id = $1`, [checkId])
    navigate({ to: '..' })
  }, [checkId, db, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT check_id FROM checks WHERE place_id = $1 ORDER BY label`,
      [placeId2 ?? placeId],
    )
    const checks = res?.rows
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === checkId)
    const next = checks[(index + 1) % len]
    navigate({
      to: `../${next.check_id}`,
      params: (prev) => ({ ...prev, checkId: next.check_id }),
    })
  }, [checkId, db, navigate, placeId, placeId2])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT check_id FROM checks WHERE place_id = $1 ORDER BY label`,
      [placeId2 ?? placeId],
    )
    const checks = res?.rows
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === checkId)
    const previous = checks[(index + len - 1) % len]
    navigate({
      to: `../${previous.check_id}`,
      params: (prev) => ({ ...prev, checkId: previous.check_id }),
    })
  }, [checkId, db, navigate, placeId, placeId2])

  const alertNoGeometry = useCallback(async () => {
    createNotification({
      title: 'No geometry',
      body: `To zoom to a check, create it's geometry first`,
      intent: 'error',
      db,
    })
  }, [db])

  const onClickZoomTo = useCallback(async () => {
    const res = await db.query(`SELECT * FROM checks WHERE check_id = $1`, [
      checkId,
    ])
    const check = res?.rows?.[0]
    const geometry = check?.geometry
    if (!geometry) return alertNoGeometry()

    // 1. show map if not happening
    if (!tabs.includes('map')) setTabs([...tabs, 'map'])

    // 2. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    setMapBounds(bounds)
  }, [db, checkId, alertNoGeometry, tabs, setTabs, setMapBounds])

  return (
    <FormHeader
      title="Check"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check"
      siblings={
        <Button
          size="medium"
          icon={<TbZoomScan />}
          onClick={onClickZoomTo}
          title={`Zoom to check in map`}
        />
      }
    />
  )
})
