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
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import {
  tabsAtom,
  draggableLayersAtom,
  droppableLayerAtom,
} from '../../store.ts'

// type props

export const Header = memo(({ autoFocusRef, row }) => {
  const setDroppableLayer = useSetAtom(droppableLayerAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [draggableLayers, setDraggableLayers] = useAtom(draggableLayersAtom)
  const { project_id, vector_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

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
    const result = db.query(
      `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
      [row.vector_layer_id],
    )
    const layerPresentation = result?.rows?.[0]
    if (!layerPresentation.active) {
      db.query(
        `UPDATE layer_presentations SET active = true WHERE layer_presentation_id = $1`,
        [layerPresentation.layer_presentation_id],
      )
    }
  }, [db, isDraggable, row.vector_layer_id, setTabs, tabs])

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
    const res = await createVectorLayer({ project_id, type: 'wfs', db })
    const vectorLayer = res?.rows?.[0]
    // also add vector_layer_display
    createVectorLayerDisplay({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    // add layer_presentation
    await createLayerPresentation({
      vector_layer_id: vectorLayer.vector_layer_id,
      db,
    })
    navigate({
      pathname: `../${vectorLayer.vector_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM vector_layers WHERE vector_layer_id = $1`, [
      vector_layer_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, vector_layer_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM vector_layers WHERE project_id = $1 order by label asc`,
      [project_id],
    )
    const vectorLayers = result?.rows
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const next = vectorLayers[(index + 1) % len]
    navigate({
      pathname: `../${next.vector_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, vector_layer_id])

  const toPrevious = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM vector_layers WHERE project_id = $1 order by label asc`,
      [project_id],
    )
    const vectorLayers = result?.rows
    const len = vectorLayers.length
    const index = vectorLayers.findIndex(
      (p) => p.vector_layer_id === vector_layer_id,
    )
    const previous = vectorLayers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.vector_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, vector_layer_id])

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
