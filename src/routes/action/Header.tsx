import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-button'
import bbox from '@turf/bbox'
import buffer from '@turf/buffer'
import { uuidv7 } from '@kripod/uuidv7'

import { createAction } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'
import { boundsFromBbox } from '../../modules/boundsFromBbox'
import { user_id } from '../../components/SqlInitializer'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, place_id, place_id2, action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.actions.create({ data })
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
    await db.actions.delete({ where: { action_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_id, db.actions, navigate, searchParams])

  const toNext = useCallback(async () => {
    const actions = await db.actions.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const next = actions[(index + 1) % len]
    navigate({
      pathname: `../${next.action_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, db.actions, navigate, place_id, place_id2, searchParams])

  const toPrevious = useCallback(async () => {
    const actions = await db.actions.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const previous = actions[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.action_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, db.actions, navigate, place_id, place_id2, searchParams])

  const alertNoGeometry = useCallback(async () => {
    await db.notifications.create({
      data: {
        notification_id: uuidv7(),
        title: 'No geometry',
        body: `To zoom to an action, create it's geometry first`,
        intent: 'error',
      },
    })
  }, [db.notifications])

  const onClickZoomTo = useCallback(async () => {
    const action = await db.actions.findUnique({
      where: { action_id },
    })
    const geometry = action?.geometry
    if (!geometry) return alertNoGeometry()

    // 1. show map if not happening
    const uiOption = await db.app_states.findUnique({
      where: { user_id },
    })
    const tabs = uiOption?.tabs ?? []
    if (!tabs.includes('map')) {
      await db.app_states.update({
        where: { user_id },
        data: { tabs: [...tabs, 'map'] },
      })
    }

    // 2. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    db.app_states.update({
      where: { user_id },
      data: { map_bounds: bounds },
    })
  }, [action_id, alertNoGeometry, db.actions, db.app_states])

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
