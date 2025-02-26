import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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

export const Header = memo(({ autoFocusRef }) => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const { project_id, place_id, place_id2, action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.action_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db,
    navigate,
    place_id,
    place_id2,
    project_id,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    db.query('DELETE FROM actions WHERE action_id = $1', [action_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT action_id FROM actions WHERE place_id = $1 ORDER BY label ASC',
      [place_id2 ?? place_id],
    )
    const actions = res.rows
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const next = actions[(index + 1) % len]
    navigate({
      pathname: `../${next.action_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, place_id, place_id2, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT action_id FROM actions WHERE place_id = $1 ORDER BY label ASC',
      [place_id2 ?? place_id],
    )
    const actions = res.rows
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const previous = actions[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.action_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, place_id, place_id2, searchParams])

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
      [action_id],
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
  }, [action_id, alertNoGeometry, db, setMapBounds, setTabs, tabs])

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
