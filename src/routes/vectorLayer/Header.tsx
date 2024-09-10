import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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
import { useAtom, useSetAtom } from 'jotai'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { Vector_layers as VectorLayer } from '../../generated/client/index.ts'
import {
  tabsAtom,
  draggableLayersAtom,
  droppableLayerAtom,
} from '../../store.ts'

// type props
interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  row: VectorLayer
}

export const Header = memo(({ autoFocusRef, row }: Props) => {
  const setDroppableLayer = useSetAtom(droppableLayerAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [draggableLayers, setDraggableLayers] = useAtom(draggableLayersAtom)
  const { project_id, vector_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  // need to:
  // 1. lowercase all
  // 2. replace all spaces with -
  const layerNameForState = row.label?.replace?.(/ /g, '-')?.toLowerCase?.()
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
    setDraggableLayers(newDraggableLayers)
  }, [draggableLayers, isDraggable, layerNameForState, setDraggableLayers])
  const onClickAssignToPlaces = useCallback(() => {
    if (isDraggable) return
    // map needs to be visible
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    // this layer needs to be active
    const layerPresentation = db.layer_presentations.findFirst({
      where: { vector_layer_id: row.vector_layer_id },
    })
    if (!layerPresentation.active) {
      db.layer_presentations.update({
        where: {
          layer_presentation_id: layerPresentation.layer_presentation_id,
        },
        data: { active: true },
      })
    }
  }, [db.layer_presentations, isDraggable, row.vector_layer_id, setTabs, tabs])
  const onClickAssignToPlaces1 = useCallback(() => {
    setDroppableLayer('places1')
    onClickToggleAssign()
    onClickAssignToPlaces()
  }, [onClickAssignToPlaces, onClickToggleAssign, setDroppableLayer])
  const onClickAssignToPlaces2 = useCallback(() => {
    setDroppableLayer('places2')
    onClickToggleAssign()
    onClickAssignToPlaces()
  }, [onClickAssignToPlaces, onClickToggleAssign, setDroppableLayer])

  const addRow = useCallback(async () => {
    const vectorLayer = createVectorLayer({ project_id })
    await db.vector_layers.create({ data: vectorLayer })
    // also add vector_layer_display
    const vectorLayerDisplay = createVectorLayerDisplay({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    await db.vector_layer_displays.create({ data: vectorLayerDisplay })
    // add layer_presentation
    const layerPresentation = createLayerPresentation({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    navigate({
      pathname: `../${vectorLayer.vector_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.layer_presentations,
    db.vector_layer_displays,
    db.vector_layers,
    navigate,
    project_id,
    searchParams,
  ])

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
