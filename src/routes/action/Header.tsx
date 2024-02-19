import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TbZoomScan } from 'react-icons/tb'
import { Button } from '@fluentui/react-button'
import bbox from '@turf/bbox'
import buffer from '@turf/buffer'

import { createAction } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'
import { boundsFromBbox } from '../../modules/boundsFromBbox'
import { user_id } from '../../components/SqlInitializer'
import {
  Actions as Action,
  Ui_options as UiOption,
} from '../../generated/client'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, place_id, place_id2, action_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createAction({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.actions.create({ data })
    navigate(`${baseUrl}/${data.action_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.actions.delete({
      where: { action_id },
    })
    navigate(baseUrl)
  }, [action_id, baseUrl, db.actions, navigate])

  const toNext = useCallback(async () => {
    const actions = await db.actions.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const next = actions[(index + 1) % len]
    navigate(`${baseUrl}/${next.action_id}`)
  }, [action_id, baseUrl, db.actions, navigate, place_id, place_id2])

  const toPrevious = useCallback(async () => {
    const actions = await db.actions.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = actions.length
    const index = actions.findIndex((p) => p.action_id === action_id)
    const previous = actions[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.action_id}`)
  }, [action_id, baseUrl, db.actions, navigate, place_id, place_id2])

  const onClickZoomTo = useCallback(async () => {
    const action: Action = await db.actions.findUnique({
      where: { action_id },
    })
    const geometry = action?.geometry
    // TODO: tell user
    if (!geometry) return

    // 1. show map if not happening
    const uiOption: UiOption = await db.ui_options.findUnique({
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
    db.ui_options.update({
      where: { user_id },
      data: { map_bounds: bounds },
    })
  }, [action_id, db.actions, db.ui_options])

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
