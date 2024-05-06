import { useCallback, memo, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'
import TreasureMapLine from '../../images/treasure-map-line.svg?react'
import TreasureMapLinePulsating from '../../images/treasure-map-line-pulsating.svg?react'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
} from '@fluentui/react-components'

import { createVectorLayer } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'
import { Vector_layers as VectorLayer } from '../../generated/client'

// type props
interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  row: VectorLayer
}

export const Header = memo(({ autoFocusRef, row }: Props) => {
  const { project_id, vector_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const draggableLayers = useMemo(
    () => appState?.draggable_layers ?? [],
    [appState?.draggable_layers],
  )

  // need to:
  // 1. lowercase all
  // 2. replace all spaces with -
  const layerNameForState = row.label.replace(/ /g, '-').toLowerCase()
  const isDraggable = draggableLayers.includes(layerNameForState)

  const onClickToggleAssign = useCallback(() => {
    let newDraggableLayers = []
    // 1. if isDraggable, remove from draggableLayers
    if (isDraggable) {
      // remove from draggableLayers
      newDraggableLayers = draggableLayers?.filter(
        (layer) => layer !== layerNameForState,
      )
    } else {
      // add to draggableLayers
      newDraggableLayers = [...draggableLayers, layerNameForState]
    }
    db.app_states.update({
      where: { app_state_id: appState.app_state_id },
      data: { draggable_layers: newDraggableLayers },
    })
  }, [
    appState?.app_state_id,
    db.app_states,
    draggableLayers,
    isDraggable,
    layerNameForState,
  ])
  const onClickAssignToPlaces = useCallback(() => {
    if (isDraggable) return
    // map needs to be visible
    if (!appState.tabs.includes('map')) {
      db.app_states.update({
        where: { app_state_id: appState.app_state_id },
        data: { tabs: [...appState.tabs, 'map'] },
      })
    }
    // this layer needs to be active
    if (!row.active) {
      db.vector_layers.update({
        where: { vector_layer_id: row.vector_layer_id },
        data: { active: true },
      })
    }
  }, [
    appState?.app_state_id,
    appState?.tabs,
    db.app_states,
    db.vector_layers,
    isDraggable,
    row.active,
    row.vector_layer_id,
  ])
  const onClickAssignToPlaces1 = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState.app_state_id },
      data: { droppable_layer: 'places1' },
    })
    onClickToggleAssign()
    onClickAssignToPlaces()
  }, [
    appState?.app_state_id,
    db.app_states,
    onClickAssignToPlaces,
    onClickToggleAssign,
  ])
  const onClickAssignToPlaces2 = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState.app_state_id },
      data: { droppable_layer: 'places2' },
    })
    onClickToggleAssign()
    onClickAssignToPlaces()
  }, [
    appState?.app_state_id,
    db.app_states,
    onClickAssignToPlaces,
    onClickToggleAssign,
  ])

  const addRow = useCallback(async () => {
    const vectorLayer = createVectorLayer({ project_id })
    await db.vector_layers.create({ data: vectorLayer })
    navigate({
      pathname: `../${vectorLayer.vector_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.vector_layers, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.vector_layers.delete({ where: { vector_layer_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.vector_layers, navigate, vector_layer_id, searchParams])

  const toNext = useCallback(async () => {
    const vectorLayers = await db.vector_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const next = vectorLayers[(index + 1) % len]
    navigate({
      pathname: `../${next.vector_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.vector_layers, navigate, project_id, vector_layer_id, searchParams])

  const toPrevious = useCallback(async () => {
    const vectorLayers = await db.vector_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const previous = vectorLayers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.vector_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.vector_layers, navigate, project_id, vector_layer_id, searchParams])

  return (
    <FormHeader
      title="Vector Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer"
      siblings={
        isDraggable ? (
          <Button
            size="medium"
            icon={<TreasureMapLinePulsating />}
            onClick={onClickToggleAssign}
            title="Stop assigning"
          />
        ) : (
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                size="medium"
                icon={<TreasureMapLine />}
                title="Start assigning"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={onClickAssignToPlaces1}>Places 1</MenuItem>
                <MenuItem onClick={onClickAssignToPlaces2}>Places 2</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        )
      }
    />
  )
})
