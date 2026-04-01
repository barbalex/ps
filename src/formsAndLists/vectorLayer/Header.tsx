import { useParams, useNavigate } from '@tanstack/react-router'
import TreasureMapLine from '../../images/treasure-map-line.svg?react'
import TreasureMapLinePulsating from '../../images/treasure-map-line-pulsating.svg?react'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

const { Button, Menu, MenuTrigger, MenuList, MenuItem, MenuPopover } =
  fluentUiReactComponents
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { createVectorLayer } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import {
  tabsAtom,
  draggableLayersAtom,
  droppableLayersAtom,
  addOperationAtom,
  languageAtom,
} from '../../store.ts'
import type LayerPresentations from '../../models/public/LayerPresentations.ts'

// type props

export const Header = ({ autoFocusRef, row, from }) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/vector-layers/$vectorLayerId_/vector-layer'
  const [droppableLayers, setDroppableLayers] = useAtom(droppableLayersAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [draggableLayers, setDraggableLayers] = useAtom(draggableLayersAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, vectorLayerId } = useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const basePath = `/data/projects/${projectId}/vector-layers/${vectorLayerId}`
  const formPath = `${basePath}/vector-layer`

  const db = usePGlite()

  const resPlaceLevel1 = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const resPlaceLevel2 = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const places1Name =
    resPlaceLevel1?.rows?.[0]?.[`name_plural_${language}`] ??
    formatMessage({ id: 'Jm3KnP', defaultMessage: 'Orte 1' })
  const places2Name =
    resPlaceLevel2?.rows?.[0]?.[`name_plural_${language}`] ??
    formatMessage({ id: 'Kn4LoQ', defaultMessage: 'Orte 2' })

  // Keep a ref to the current vectorLayerId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const vectorLayerIdRef = useRef(vectorLayerId)
  useEffect(() => {
    vectorLayerIdRef.current = vectorLayerId
  }, [vectorLayerId])

  // need to:
  // 1. lowercase all
  // 2. replace all spaces with -
  const layerNameForState = row.label?.replace?.(/ /g, '-')?.toLowerCase?.()
  const isDraggable = draggableLayers.includes(layerNameForState)

  const onClickToggleAssign = () => {
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
  }

  const onClickAssignToPlaces = async () => {
    if (isDraggable) return
    // map needs to be visible
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    // this layer needs to be active
    const res = await db.query(
      `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
      [row.vector_layer_id],
    )
    const layerPresentation: LayerPresentations | undefined = res?.rows?.[0]
    if (!layerPresentation.active) {
      db.query(
        `UPDATE layer_presentations SET active = true WHERE layer_presentation_id = $1`,
        [layerPresentation.layer_presentation_id],
      )
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: layerPresentation.layer_presentation_id,
        operation: 'update',
        draft: { active: true },
        prev: { ...layerPresentation },
      })
    }
  }

  const onClickAssignToPlaces1 = () => {
    // Toggle places-1 in droppableLayers
    if (droppableLayers.includes('places-1')) {
      setDroppableLayers(droppableLayers.filter((l) => l !== 'places-1'))
    } else {
      setDroppableLayers([...droppableLayers, 'places-1'])
    }
    onClickToggleAssign()
    onClickAssignToPlaces()
  }

  const onClickAssignToPlaces2 = () => {
    // Toggle places-2 in droppableLayers
    if (droppableLayers.includes('places-2')) {
      setDroppableLayers(droppableLayers.filter((l) => l !== 'places-2'))
    } else {
      setDroppableLayers([...droppableLayers, 'places-2'])
    }
    onClickToggleAssign()
    onClickAssignToPlaces()
  }

  const addRow = async () => {
    const vectorLayerId = await createVectorLayer({
      projectId,
      type: 'wfs',
    })
    navigate({
      to: isForm
        ? `../../${vectorLayerId}/vector-layer`
        : `../${vectorLayerId}/vector-layer`,
      params: (prev) => ({
        ...prev,
        vectorLayerId,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      await db.query(`DELETE FROM vector_layers WHERE vector_layer_id = $1`, [
        vectorLayerId,
      ])
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting vector layer:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT vector_layer_id FROM vector_layers WHERE project_id = $1 order by label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.vector_layer_id === vectorLayerIdRef.current,
      )
      const next = rows[(index + 1) % len]
      navigate({
        to: isForm
          ? `../../${next.vector_layer_id}/vector-layer`
          : `../${next.vector_layer_id}`,
        params: (prev) => ({
          ...prev,
          vectorLayerId: next.vector_layer_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next vector layer:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT vector_layer_id FROM vector_layers WHERE project_id = $1 order by label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.vector_layer_id === vectorLayerIdRef.current,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: isForm
          ? `../../${previous.vector_layer_id}/vector-layer`
          : `../${previous.vector_layer_id}`,
        params: (prev) => ({
          ...prev,
          vectorLayerId: previous.vector_layer_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous vector layer:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'fN0sZQ', defaultMessage: 'Vektor-Ebene' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer"
      siblings={
        <>
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={formPath}
            historyTable="vector_layers_history"
            rowIdField="vector_layer_id"
            rowId={vectorLayerId}
          />
          {isDraggable ? (
            <Button
              size="medium"
              icon={<TreasureMapLinePulsating />}
              onClick={onClickToggleAssign}
              title={formatMessage({
                id: 'Il2JmO',
                defaultMessage: 'Zuweisung stoppen',
              })}
            />
          ) : (
            <Menu>
              <MenuTrigger disableButtonEnhancement>
              <Button
                size="medium"
                icon={<TreasureMapLine />}
                title={formatMessage({
                  id: 'Hk1IlN',
                  defaultMessage: 'Zuweisung starten',
                })}
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={onClickAssignToPlaces1}>
                  {places1Name}
                </MenuItem>
                <MenuItem onClick={onClickAssignToPlaces2}>
                  {places2Name}
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          )}
        </>
      }
    />
  )
}
