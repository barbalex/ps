import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const { project_id, subproject_id, place_id, place_id2, check_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate(`${baseUrl}/${data.check_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.checks.delete({
      where: {
        check_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_id, db.checks, navigate])

  const toNext = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const next = checks[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_id}`)
  }, [baseUrl, check_id, db.checks, navigate, place_id, place_id2])

  const toPrevious = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const previous = checks[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_id}`)
  }, [baseUrl, check_id, db.checks, navigate, place_id, place_id2])

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
    const uiOption = await db.ui_options.findUnique({
      where: { user_id },
    })
    const tabs = uiOption?.tabs ?? []
    if (!tabs.includes('map')) {
      await db.ui_options.update({
        where: { user_id },
        data: { tabs: [...tabs, 'map'] },
      })
    }

    // 2. zoom to place
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return alertNoGeometry()
    db.ui_options.update({
      where: { user_id },
      data: { map_bounds: bounds },
    })
  }, [alertNoGeometry, check_id, db.checks, db.ui_options])

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
