import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createCheck } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import { tabsAtom, mapBoundsAtom, addNotificationAtom, addOperationAtom } from '../../store.ts'
import type Checks from '../../models/public/Checks.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/check'
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, placeId, placeId2, checkId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM checks WHERE place_id = '${placeId2 ?? placeId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createCheck({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/check` : `../${id}/check`,
      params: (prev) => ({ ...prev, checkId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM checks WHERE check_id = $1`, [
        checkId,
      ])
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM checks WHERE check_id = $1`, [checkId])
      addOperation({
        table: 'checks',
        rowIdName: 'check_id',
        rowId: checkId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting check:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows
      const len = checks.length
      const index = checks.findIndex((p) => p.check_id === checkId)
      const next = checks[(index + 1) % len]
      navigate({
        to: isForm ? `../../${next.check_id}/check` : `../${next.check_id}`,
        params: (prev) => ({ ...prev, checkId: next.check_id }),
      })
    } catch (error) {
      console.error('Error navigating to next check:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows
      const len = checks.length
      const index = checks.findIndex((p) => p.check_id === checkId)
      const previous = checks[(index + len - 1) % len]
      navigate({
        to: isForm
          ? `../../${previous.check_id}/check`
          : `../${previous.check_id}`,
        params: (prev) => ({ ...prev, checkId: previous.check_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous check:', error)
    }
  }

  const alertNoGeometry = () =>
    addNotification({
      title: 'No geometry',
      body: `To zoom to a check, create it's geometry first`,
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const res = await db.query(`SELECT * FROM checks WHERE check_id = $1`, [
      checkId,
    ])
    const check: Checks | undefined = res?.rows?.[0]
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
  }

  return (
    <FormHeader
      title="Check"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
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
}
