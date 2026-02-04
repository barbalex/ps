import { useParams, useNavigate } from '@tanstack/react-router'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-components'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { createAction } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { boundsFromBbox } from '../../modules/boundsFromBbox.ts'
import {
  tabsAtom,
  mapBoundsAtom,
  addOperationAtom,
  addNotificationAtom,
} from '../../store.ts'
import type Actions from '../../models/public/Actions.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action'
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)

  const { projectId, placeId, placeId2, actionId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current actionId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const actionIdRef = useRef(actionId)
  useEffect(() => {
    actionIdRef.current = actionId
  }, [actionId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM actions WHERE place_id = '${placeId2 ?? placeId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createAction({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/action` : `../${id}/action`,
      params: (prev) => ({ ...prev, actionId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM actions WHERE action_id = $1',
        [actionId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query('DELETE FROM actions WHERE action_id = $1', [actionId])
      addOperation({
        table: 'actions',
        rowIdName: 'action_id',
        rowId: actionId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting action:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT action_id FROM actions WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const actions = res?.rows
      const len = actions.length
      const index = actions.findIndex(
        (p) => p.action_id === actionIdRef.current,
      )
      const next = actions[(index + 1) % len]
      navigate({
        to: isForm ? `../../${next.action_id}/action` : `../${next.action_id}`,
        params: (prev) => ({ ...prev, actionId: next.action_id }),
      })
    } catch (error) {
      console.error('Error navigating to next action:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT action_id FROM actions WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const actions = res?.rows
      const len = actions.length
      const index = actions.findIndex(
        (p) => p.action_id === actionIdRef.current,
      )
      const previous = actions[(index + len - 1) % len]
      navigate({
        to:
          isForm ?
            `../../${previous.action_id}/action`
          : `../${previous.action_id}`,
        params: (prev) => ({ ...prev, actionId: previous.action_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous action:', error)
    }
  }

  const alertNoGeometry = () =>
    addNotification({
      title: 'No geometry',
      body: `To zoom to an action, create it's geometry first`,
      intent: 'error',
    })

  const onClickZoomTo = async () => {
    const res = await db.query(
      'SELECT geometry FROM actions WHERE action_id = $1',
      [actionId],
    )
    const geometry: Actions['geometry'] | undefined = res?.rows?.[0]?.geometry
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
  }

  return (
    <FormHeader
      title="Action"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
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
}
