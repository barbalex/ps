import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-button'
import bbox from '@turf/bbox'
import buffer from '@turf/buffer'
import { uuidv7 } from '@kripod/uuidv7'

import { createCheck } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'
import { boundsFromBbox } from '../../modules/boundsFromBbox'
import { user_id } from '../../components/SqlInitializer'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, place_id, place_id2, check_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate({
      pathname: `../${data.check_id}`,
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
    await db.checks.delete({
      where: { check_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [check_id, db.checks, navigate, searchParams])

  const toNext = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const next = checks[(index + 1) % len]
    navigate({
      pathname: `../${next.check_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, db.checks, navigate, place_id, place_id2, searchParams])

  const toPrevious = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const previous = checks[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.check_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, db.checks, navigate, place_id, place_id2, searchParams])

  const alertNoGeometry = useCallback(async () => {
    await db.notifications.create({
      data: {
        notification_id: uuidv7(),
        title: 'No geometry',
        body: `To zoom to a check, create it's geometry first`,
        intent: 'error',
      },
    })
  }, [db.notifications])

  const onClickZoomTo = useCallback(async () => {
    const check = await db.checks.findUnique({ where: { check_id } })
    const geometry = check?.geometry
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
  }, [alertNoGeometry, check_id, db.checks, db.app_states])

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
