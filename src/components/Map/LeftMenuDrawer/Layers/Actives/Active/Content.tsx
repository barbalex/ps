import {
  useEffect,
  useState,
  useMemo,
  type MouseEvent,
  type RefObject,
} from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  AccordionHeader,
  AccordionPanel,
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuGroupHeader,
  ToggleButton,
  Tab,
  TabList,
  Checkbox,
  Tooltip,
} = fluentUiReactComponents
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components'
import { BsCheckSquareFill, BsSquare } from 'react-icons/bs'
import { DeleteLayerTrigger } from '../../DeleteLayerTrigger.tsx'
import { TbZoomScan, TbTarget } from 'react-icons/tb'
import { FaPlay, FaStopCircle } from 'react-icons/fa'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { useOwnLayerScope } from '../../../../../../modules/useOwnLayerScope.ts'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../../../../shared/ErrorBoundary.tsx'
import { TooltipButton } from '../../../../../shared/TooltipButton.tsx'
import { AddToLayer } from './AddToLayer.tsx'
import { ClusterMenu } from './ClusterMenu.tsx'
import { mapCreationTarget } from '../../../../../../modules/mapCreationParents.ts'
import { LayerPresentationForm } from '../../LayerPresentationForm.tsx'
import { VectorLayerEditing } from '../../Vector/Editing.tsx'
import { WmsLayerEditing } from '../../WMS/Editing.tsx'
import { TileLayerEditing } from '../../Tile/Editing.tsx'
import { VectorLayerDisplays } from '../../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { VectorLayerDisplay } from '../../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
  addOperationAtom,
  addNotificationAtom,
  mapBoundsAtom,
  draggableLayersAtom,
  droppableLayersAtom,
  languageAtom,
} from '../../../../../../store.ts'
import { DragHandle } from '../../../../../shared/DragAndDrop/DragHandle.tsx'
import { zoomToVectorLayer } from '../../../../../../modules/zoomToVectorLayer.ts'
import { zoomToWmsLayer } from '../../../../../../modules/zoomToWmsLayer.ts'
import { useUrlLayers } from '../../../../../../modules/useUrlLayers.ts'
import { useLayerActivation } from '../../../../../../modules/useLayerActivation.ts'
import {
  getVectorLayerLabel,
  usePlaceLevels,
} from '../../../../../../modules/vectorLayerLabel.ts'
import type VectorLayers from '../../../../../../models/public/VectorLayers.ts'
import type { ActiveLayerRow } from '../index.tsx'
import layerStyles from '../../index.module.css'

import './active.css'
import styles from './Content.module.css'

type TabType = 'overall-displays' | 'feature-displays' | 'config'

// row of the place layers query below
type ActivePlaceLayer = VectorLayers & {
  name: string
  name_plural: string | null
}

export const Content = ({
  layer,
  isOpen,
  layerCount,
  dragHandleRef,
}: {
  layer: ActiveLayerRow
  isOpen: boolean
  layerCount: number
  dragHandleRef: RefObject<HTMLDivElement | null>
}) => {
  const { formatMessage } = useIntl()
  const { projectId, subprojectId, filterSql } = useOwnLayerScope()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const { isLayerVisible } = useUrlLayers()
  const { activateLayer, deactivateLayer } = useLayerActivation()
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const [draggableLayers, setDraggableLayers] = useAtom(draggableLayersAtom)
  const [droppableLayers, setDroppableLayers] = useAtom(droppableLayersAtom)
  const language = useAtomValue(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)

  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')
  const [assignMenuOpen, setAssignMenuOpen] = useState(false)
  const [selectedPlaceLayers, setSelectedPlaceLayers] = useState<string[]>([])
  const { pathname } = useLocation()

  const isVectorLayer = layer.layer_type === 'vector'
  const isWmsLayer = layer.layer_type === 'wms'
  const isTileLayer = layer.layer_type === 'tile'
  const creationTarget = mapCreationTarget(layer)
  const zoomLabel = formatMessage({
    id: 'mapZoomToLayer',
    defaultMessage: 'Auf Layer zoomen',
  })

  const placeLevels = usePlaceLevels(layer.project_id)
  // Derived display label: own/wfs/upload vector layers compute it (there is no
  // stored label column anymore); wms layers keep their own stored label —
  // which is null while no service layer has been chosen
  const label =
    isVectorLayer ?
      getVectorLayerLabel(layer as VectorLayers, language, placeLevels)
    : isTileLayer ?
      (layer.label ||
      formatMessage({
        id: 'tileLayerNoName',
        defaultMessage: 'Tile-Layer ohne Name',
      }))
    : (layer.label ||
      formatMessage({
        id: 'wmsLayerNoLayerChosen',
        defaultMessage: 'Kein Layer gewählt',
      }))

  // Stable identity key for drag/drop state (same value as in TableLayer)
  const layerNameForState =
    (layer.name ?? layer.label ?? layer.tile_layer_id) as string

  // Check if this is an observation layer
  const tableName =
    layer.own_table_level ?
      `${layer.own_table}${layer.own_table_level}`
    : layer.own_table
  const isObservationLayer =
    tableName === 'observations_to_assess' ||
    tableName === 'observations_not_to_assign' ||
    tableName?.startsWith('observations_assigned')

  // Check if this is a place layer that's droppable
  const isPlaceLayer = layer.own_table === 'places'
  const isDroppable =
    isPlaceLayer && droppableLayers.includes(layerNameForState)

  const isAssigning = draggableLayers.includes(layerNameForState)
  const assignLabel = isAssigning
    ? formatMessage({ id: 'obsAssignStop', defaultMessage: 'Zuordnung der Beobachtungen beenden' })
    : formatMessage({ id: 'obsAssignDrag', defaultMessage: 'Beobachtungen durch Ziehen zuordnen' })

  // Query for active place layers
  const resPlaceLayers = useLiveQuery<ActivePlaceLayer>(
    `
    SELECT 
      vl.*,
      pl.name_plural_${language} AS name_plural
    FROM vector_layers vl
    LEFT JOIN place_levels pl ON vl.own_table_level = pl.level AND vl.project_id = pl.project_id
    INNER JOIN layer_presentations lp 
      ON vl.vector_layer_id = lp.vector_layer_id 
      AND lp.active = TRUE
    WHERE vl.project_id = $1
      AND vl.type = 'own'
      AND vl.own_table = 'places'
    ORDER BY vl.own_table_level
    `,
    [layer.project_id],
  )
  const activePlaceLayers = useMemo(
    () => resPlaceLayers?.rows ?? [],
    [resPlaceLayers],
  )

  // Initialize selectedPlaceLayers from droppableLayers when menu opens
  useEffect(() => {
    if (!assignMenuOpen || !isObservationLayer) return

    const placeLayerNames = activePlaceLayers
      .map((pl) => pl.name)
      .filter(Boolean)

    const selectedFromStore = droppableLayers.filter((dl) =>
      placeLayerNames.includes(dl),
    )

    // Only update if the selection has changed to avoid cascading renders
    if (
      JSON.stringify(selectedFromStore.sort()) !==
      JSON.stringify(selectedPlaceLayers.sort())
    ) {
      // Use setTimeout to defer the state update
      const timeout = setTimeout(
        () => setSelectedPlaceLayers(selectedFromStore),
        0,
      )
      return () => clearTimeout(timeout)
    }
  }, [
    assignMenuOpen,
    isObservationLayer,
    activePlaceLayers,
    droppableLayers,
    selectedPlaceLayers,
  ])

  // effect:
  // if layer is wms and has no wms_service_id or wms_service_layer_name: set tab to 'config'
  // if layer is wfs and has no wfs_service_id or wfs_service_layer_name: set tab to 'config'
  useEffect(() => {
    const shouldShowConfig =
      (isVectorLayer && layer.type === 'wfs' &&
        (!layer.wfs_service_id || !layer.wfs_service_layer_name)) ||
      (isWmsLayer && (!layer.wms_service_id || !layer.wms_service_layer_name)) ||
      (isTileLayer && !layer.url_template)

    if (shouldShowConfig) {
      // Use setTimeout to defer the state update
      const timeout = setTimeout(() => setTab('config'), 0)
      return () => clearTimeout(timeout)
    }
  }, [
    isVectorLayer,
    layer.type,
    isWmsLayer,
    isTileLayer,
    layer.wfs_service_id,
    layer.wfs_service_layer_name,
    layer.wms_service_id,
    layer.wms_service_layer_name,
    layer.url_template,
  ])

  // toggling the checkbox fully activates/deactivates the layer — the
  // layer_presentations.active design flag (what lists it under Active)
  // plus the render list — like every other layer toggle. A view-only url
  // toggle here left layers listed under Active with an unchecked box
  const onChangeActive = async () => {
    if (!layer.layer_presentation_id) {
      // if no presentation exists, create notification
      return addNotification({
        title: 'Layer presentation not found',
        type: 'warning',
      } as Parameters<typeof addNotification>[0])
    }
    if (
      isLayerVisible(
        layer.layer_presentation_id,
        layer.layer_presentation_active === true,
      )
    ) {
      await deactivateLayer(layer.layer_presentation_id)
      return
    }
    await activateLayer(layer.layer_presentation_id)
  }

  const canDrag = layerCount > 1

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    setTab(data.value as TabType)

  const onClickFeatureDisplays = () => setVectorLayerDisplayId(null)

  const onDelete = () => {
    if (isTileLayer) {
      db.query(`DELETE FROM tile_layers WHERE tile_layer_id = $1`, [
        layer.tile_layer_id,
      ])
      addOperation({
        table: 'tile_layers',
        rowIdName: 'tile_layer_id',
        rowId: layer.tile_layer_id,
        operation: 'delete',
        draft: {},
        prev: { ...layer },
      })
    } else if (isVectorLayer) {
      db.query(`DELETE FROM vector_layers WHERE vector_layer_id = $1`, [
        layer.vector_layer_id,
      ])
      // task to delete from server db and rollback PGlite in case of error
      addOperation({
        table: 'vector_layers',
        rowIdName: 'vector_layer_id',
        rowId: layer.vector_layer_id,
        operation: 'delete',
        draft: {},
        prev: { ...layer },
      })
    } else {
      db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
        layer.wms_layer_id,
      ])
      // task to delete from server db and rollback PGlite in case of error
      addOperation({
        table: 'wms_layers',
        rowIdName: 'wms_layer_id',
        rowId: layer.wms_layer_id,
        operation: 'delete',
        draft: {},
        prev: { ...layer },
      })
    }
  }

  const onTogglePlaceLayer = (placeLayerName: string) => {
    if (selectedPlaceLayers.includes(placeLayerName)) {
      setSelectedPlaceLayers(
        selectedPlaceLayers.filter((l) => l !== placeLayerName),
      )
    } else {
      setSelectedPlaceLayers([...selectedPlaceLayers, placeLayerName])
    }
  }

  const onClickAssignButton = (event: MouseEvent) => {
    event.stopPropagation()

    // If only one place layer is available, directly start/stop assignment without opening menu
    if (activePlaceLayers.length === 1) {
      const placeLayerName = activePlaceLayers[0]?.name

      if (isAssigning) {
        // Stop assigning
        setDraggableLayers(
          draggableLayers.filter((layer) => layer !== layerNameForState),
        )
        setDroppableLayers(droppableLayers.filter((l) => l !== placeLayerName))
      } else {
        // Start assigning with the only available place layer
        setDraggableLayers([...draggableLayers, layerNameForState])
        const newDroppableLayers = [
          ...new Set([...droppableLayers, placeLayerName as string]),
        ]
        setDroppableLayers(newDroppableLayers)
      }
    } else {
      // Multiple place layers available, open menu for selection
      setAssignMenuOpen(true)
    }
  }

  const onClickStartStopAssigning = (event: MouseEvent) => {
    event.stopPropagation()

    if (isAssigning) {
      // Stop assigning: remove observation layer from draggable and clear droppable layers
      setDraggableLayers(
        draggableLayers.filter((layer) => layer !== layerNameForState),
      )
      // Remove all selected place layers from droppable
      setDroppableLayers(
        droppableLayers.filter((l) => !selectedPlaceLayers.includes(l)),
      )
    } else {
      // Start assigning: add observation layer to draggable and set droppable layers
      setDraggableLayers([...draggableLayers, layerNameForState])
      // Add selected place layers to droppable (merge with existing)
      const newDroppableLayers = [
        ...new Set([...droppableLayers, ...selectedPlaceLayers]),
      ]
      setDroppableLayers(newDroppableLayers)
    }

    // Close the menu
    setAssignMenuOpen(false)
  }

  const onClickZoomToFeatures = (event: MouseEvent) => {
    event.stopPropagation()
    if (isWmsLayer) {
      void zoomToWmsLayer({
        db,
        layer,
        addNotification,
        setMapBounds,
      })
      return
    }
    if (!isVectorLayer) return
    void zoomToVectorLayer({
      db,
      layer,
      subprojectId,
      filterSql,
      addNotification,
      setMapBounds,
    })
  }

  // drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <AccordionHeader
        button={{ 'aria-label': label }}
        expandIconPosition="end"
        size="extra-large"
        expandIcon={designing ? undefined : null}
        className={`${styles.headerIconWidth}${isOpen ? ` ${styles.headerColor}` : ''}`}
      >
        {canDrag && <DragHandle ref={dragHandleRef} />}
        <div className={layerStyles.headerContainer}>
          <ToggleButton
            icon={
              isLayerVisible(
                layer.layer_presentation_id ?? '',
                layer.layer_presentation_active === true,
              ) ? (
                <BsCheckSquareFill className={layerStyles.checkedToggleIcon} />
              ) : (
                <BsSquare className={styles.headerIcon} />
              )
            }
            checked={isLayerVisible(
              layer.layer_presentation_id ?? '',
              layer.layer_presentation_active === true,
            )}
            onClick={(event) => {
              // only the visibility toggle, not the accordion header
              event.stopPropagation()
              onChangeActive()
            }}
            className={styles.headerButton}
            // as the accordion header is a button, we need to set this as an a
            // because nested buttons are not allowed
            as="a"
          />
          <p className={layerStyles.headerLabel}>{label}</p>
        </div>
        {isObservationLayer &&
          (activePlaceLayers.length === 1 ?
            // Single place layer: just a button, no menu
            <TooltipButton
              icon={
                isAssigning ?
                  <FaStopCircle />
                : <FaPlay className={styles.playIcon} />
              }
              onClick={onClickAssignButton}
              className={`${styles.headerButton}${isAssigning ? ` ${styles.assigningButton}` : ''}`}
              label={assignLabel}
              appearance="subtle"
              size="small"
              as="a"
            />
            // Multiple place layers: show menu
          : <Menu
              open={assignMenuOpen}
              onOpenChange={(_e, data) => setAssignMenuOpen(data.open)}
            >
              <MenuTrigger disableButtonEnhancement>
                <TooltipButton
                  icon={
                    isAssigning ?
                      <FaStopCircle />
                    : <FaPlay className={styles.playIcon} />
                  }
                  onClick={(e) => e.stopPropagation()}
                  className={`${styles.headerButton}${isAssigning ? ` ${styles.assigningButton}` : ''}`}
                  label={assignLabel}
                  appearance="subtle"
                  size="small"
                  as="a"
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuGroupHeader>
                    {isAssigning ?
                      'Stop assigning?'
                    : 'Assign to which places?'}
                  </MenuGroupHeader>
                  {!isAssigning &&
                    activePlaceLayers.map((placeLayer) => {
                      const placeLayerName = placeLayer.name
                      const isChecked =
                        selectedPlaceLayers.includes(placeLayerName)
                      return (
                        <MenuItem
                          key={placeLayer.vector_layer_id}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onTogglePlaceLayer(placeLayerName)
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            label={
                              placeLayer.name_plural ||
                              `Places ${placeLayer.own_table_level}`
                            }
                            onChange={(e) => {
                              e.stopPropagation()
                              onTogglePlaceLayer(placeLayerName)
                            }}
                          />
                        </MenuItem>
                      )
                    })}
                  <MenuItem
                    onClick={onClickStartStopAssigning}
                    disabled={!isAssigning && selectedPlaceLayers.length === 0}
                  >
                    {isAssigning ? 'Stop assigning' : 'Start assigning'}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>)}
        {isDroppable && (
          <TooltipButton
            icon={<TbTarget />}
            className={`${styles.headerButton} ${styles.droppableButton}`}
            label={formatMessage({ id: 'obsAssignTarget', defaultMessage: 'Beobachtungen können auf diesem Layer abgelegt werden' })}
            appearance="subtle"
            size="small"
            as="a"
          />
        )}
        {creationTarget && layer.project_id && (
          <AddToLayer {...creationTarget} projectId={layer.project_id} layerLabel={label} />
        )}
        {isVectorLayer && layer.own_table !== 'observations_assigned_lines' && (
          <ClusterMenu id={layer.layer_presentation_id} defaultOn={layer.cluster_markers ?? true} />
        )}
        {!isTileLayer && (
          <Tooltip content={zoomLabel} relationship="label">
            <Button
              icon={<TbZoomScan />}
              onClick={onClickZoomToFeatures}
              className={styles.headerButton}
              aria-label={zoomLabel}
              appearance="subtle"
              size="small"
              as="a"
            />
          </Tooltip>
        )}
      </AccordionHeader>
      <AccordionPanel className={layerStyles.panel}>
        <TabList
          selectedValue={tab}
          onTabSelect={onTabSelect}
          className={layerStyles.tabList}
        >
          <Tab value="overall-displays">Overall Display</Tab>
          {isVectorLayer && (
            <Tab
              value="feature-displays"
              onClick={onClickFeatureDisplays}
            >
              Feature Displays
            </Tab>
          )}
          <Tab value="config">Config</Tab>
          <Menu>
            <DeleteLayerTrigger label={label} />

            <MenuPopover>
              <MenuList>
                <MenuGroupHeader>
                  {formatMessage(
                    {
                      id: 'layerDeleteConfirmHeader',
                      defaultMessage: 'Layer {label} löschen?',
                    },
                    { label },
                  )}
                </MenuGroupHeader>
                <MenuItem onClick={onDelete}>
                  {formatMessage({
                    id: 'layerDeleteYes',
                    defaultMessage: 'Ja',
                  })}
                </MenuItem>
                <MenuItem>
                  {formatMessage({
                    id: 'layerDeleteNo',
                    defaultMessage: 'Nein',
                  })}
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </TabList>
        {tab === 'config' &&
          (isTileLayer ?
            <TileLayerEditing layer={layer} />
          : isVectorLayer ?
            <VectorLayerEditing layer={layer} />
          : <WmsLayerEditing layer={layer} />)}
        {tab === 'overall-displays' && <LayerPresentationForm layer={layer} />}
        {tab === 'feature-displays' && isVectorLayer && (
          <>
            {vectorLayerDisplayId ?
              <VectorLayerDisplay
                vectorLayerDisplayId={vectorLayerDisplayId}
                {...{ from: pathname }}
              />
            : <VectorLayerDisplays
                vectorLayerId={layer.vector_layer_id}
                {...{ from: pathname }}
              />
            }
          </>
        )}
      </AccordionPanel>
    </ErrorBoundary>
  )
}
