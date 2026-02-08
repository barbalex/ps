import { useEffect, useState } from 'react'
import {
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
  SelectTabData,
} from '@fluentui/react-components'
import { BsCheckSquareFill } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import { featureCollection } from '@turf/helpers'

import { ErrorBoundary } from '../../../../../shared/ErrorBoundary.tsx'
import { LayerPresentationForm } from '../../LayerPresentationForm.tsx'
import { VectorLayerEditing } from '../../Vector/Editing.tsx'
import { WmsLayerEditing } from '../../WMS/Editing.tsx'
import { VectorLayerDisplays } from '../../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { VectorLayerDisplay } from '../../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
  addOperationAtom,
  addNotificationAtom,
  mapBoundsAtom,
} from '../../../../../../store.ts'
import { DragHandle } from '../../../../../shared/DragAndDrop/DragHandle.tsx'
import { boundsFromBbox } from '../../../../../../modules/boundsFromBbox.ts'
import layerStyles from '../../index.module.css'

import './active.css'
import styles from './Content.module.css'

type TabType = 'overall-displays' | 'feature-displays' | 'config'

export const Content = ({ layer, isOpen, layerCount, dragHandleRef }) => {
  const [designing] = useAtom(designingAtom)
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)

  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')
  const { pathname } = useLocation()

  const isVectorLayer = layer.layer_type === 'vector'
  const isWmsLayer = layer.layer_type === 'wms'

  // effect:
  // if layer is wms and has no wms_service_id or wms_service_layer_name: set tab to 'config'
  // if layer is wfs and has no wfs_service_id or wfs_service_layer_name: set tab to 'config'
  useEffect(() => {
    if (
      (isVectorLayer &&
        (!layer.wfs_service_id || !layer.wfs_service_layer_name)) ||
      (isWmsLayer && (!layer.wms_service_id || !layer.wms_service_layer_name))
    ) {
      setTab('config')
    }
  }, [
    isVectorLayer,
    isWmsLayer,
    layer.layer_type,
    layer.wfs_service_id,
    layer.wfs_service_layer_name,
    layer.wms_service_id,
    layer.wms_service_layer_name,
  ])

  const onChangeActive = async () => {
    if (!layer.layer_presentation_id) {
      // if no presentation exists, create notification
      return addNotification({
        title: 'Layer presentation not found',
        type: 'warning',
      })
    }
    db.query(
      `UPDATE layer_presentations SET active = false WHERE layer_presentation_id = $1`,
      [layer.layer_presentation_id],
    )
    // get layer_presentation for prev value
    const lpRes = await db.query(
      `SELECT * FROM layer_presentations WHERE layer_presentation_id = $1`,
      [layer.layer_presentation_id],
    )
    const prev = lpRes?.rows?.[0] ?? {}
    // add operation to store on server db
    addOperation({
      table: 'layer_presentations',
      rowIdName: 'layer_presentation_id',
      rowId: layer.layer_presentation_id,
      operation: 'update',
      draft: { active: false },
      prev,
    })
  }

  const canDrag = layerCount > 1

  const onTabSelect = (event, data: SelectTabData) => setTab(data.value)

  const onClickFeatureDisplays = () => setVectorLayerDisplayId(null)

  const onDelete = () => {
    if (isVectorLayer) {
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
  const onClickZoomToFeatures = async () => {
    // Get all geometries for this layer
    let geometries = []

    if (isVectorLayer) {
      // For vector layers (including table layers)
      const tableName = layer.own_table_level
        ? `${layer.own_table}${layer.own_table_level}`
        : layer.own_table

      if (tableName?.startsWith('places')) {
        const level = layer.own_table_level
        const res = await db.query(
          `SELECT geometry FROM places p 
           INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
           WHERE s.project_id = $1 
           AND p.geometry IS NOT NULL
           ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
          [layer.project_id],
        )
        geometries = res?.rows ?? []
      } else if (tableName?.startsWith('actions')) {
        const level = layer.own_table_level
        const res = await db.query(
          `SELECT a.geometry FROM actions a 
           INNER JOIN places p ON a.place_id = p.place_id 
           INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
           WHERE s.project_id = $1 
           AND a.geometry IS NOT NULL
           ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
          [layer.project_id],
        )
        geometries = res?.rows ?? []
      } else if (tableName?.startsWith('checks')) {
        const level = layer.own_table_level
        const res = await db.query(
          `SELECT c.geometry FROM checks c 
           INNER JOIN places p ON c.place_id = p.place_id 
           INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
           WHERE s.project_id = $1 
           AND c.geometry IS NOT NULL
           ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
          [layer.project_id],
        )
        geometries = res?.rows ?? []
      } else if (tableName?.startsWith('occurrences_assigned')) {
        const level = layer.own_table_level
        const res = await db.query(
          `SELECT o.geometry FROM occurrences o 
           INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id 
           INNER JOIN places p ON o.place_id = p.place_id 
           INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
           WHERE s.project_id = $1 
           AND o.geometry IS NOT NULL
           ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
          [layer.project_id],
        )
        geometries = res?.rows ?? []
      } else if (tableName === 'occurrences_to_assess') {
        const res = await db.query(
          `SELECT o.geometry FROM occurrences o 
           INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id 
           INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id 
           WHERE s.project_id = $1 
           AND o.place_id IS NULL
           AND (o.not_to_assign IS NULL OR o.not_to_assign = FALSE)
           AND o.geometry IS NOT NULL`,
          [layer.project_id],
        )
        geometries = res?.rows ?? []
      } else if (tableName === 'occurrences_not_to_assign') {
        const res = await db.query(
          `SELECT o.geometry FROM occurrences o 
           INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id 
           INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id 
           WHERE s.project_id = $1 
           AND o.place_id IS NULL
           AND o.not_to_assign = true
           AND o.geometry IS NOT NULL`,
          [layer.project_id],
        )
        geometries = res?.rows ?? []
      } else if (layer.type === 'wfs') {
        // For WFS layers, get from vector_layer_geoms
        const res = await db.query(
          `SELECT geometry FROM vector_layer_geoms WHERE vector_layer_id = $1`,
          [layer.vector_layer_id],
        )
        geometries = res?.rows ?? []
      } else {
        // For uploaded vector layers
        const res = await db.query(
          `SELECT geometry FROM vector_layer_geoms WHERE vector_layer_id = $1`,
          [layer.vector_layer_id],
        )
        geometries = res?.rows ?? []
      }
    }

    if (!geometries.length) {
      return addNotification({
        title: 'No geometries found for this layer',
        intent: 'info',
      })
    }

    // Flatten all features from all FeatureCollections
    const allFeatures = geometries.flatMap((g) => g.geometry?.features ?? [])

    if (!allFeatures.length) {
      return addNotification({
        title: 'No geometries found for this layer',
        intent: 'info',
      })
    }

    const fc = featureCollection(allFeatures)
    const bufferedFC = buffer(fc, 0.05)
    const newBbox = bbox(bufferedFC)
    const newBounds = boundsFromBbox(newBbox)

    setMapBounds(newBounds)
  }

  // drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <AccordionHeader
        expandIconPosition="end"
        size="extra-large"
        expandIcon={designing ? undefined : null}
        className={isOpen ? styles.headerColor : undefined}
        style={{ '--fui-AccordionHeader--icon-width': '32px' }}
      >
        {canDrag && <DragHandle ref={dragHandleRef} />}
        <div className={layerStyles.headerContainer}>
          <ToggleButton
            icon={<BsCheckSquareFill className={styles.headerIcon} />}
            checked={layer.layer_presentation_active}
            onClick={onChangeActive}
            className={styles.headerButton}
            // as the accordion header is a button, we need to set this as an a
            // because nested buttons are not allowed
            as="a"
          />
          <p className={layerStyles.headerLabel}>{layer.label}</p>
        </div>
        <Button
          icon={<TbZoomScan />}
          onClick={onClickZoomToFeatures}
          className={styles.headerButton}
          title="Zoom to layer"
          appearance="subtle"
          size="small"
          as="a"
        />
      </AccordionHeader>
      <AccordionPanel className={layerStyles.panel}>
        <TabList
          selectedValue={tab}
          onTabSelect={onTabSelect}
          className={layerStyles.tabList}
        >
          <Tab value="overall-displays">Overall Display</Tab>
          {isVectorLayer && (
            <Tab value="feature-displays" onClick={onClickFeatureDisplays}>
              Feature Displays
            </Tab>
          )}
          <Tab value="config">Config</Tab>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                size="medium"
                icon={<MdDeleteOutline />}
                title={`Delete Layer '${layer.label}'`}
                className={layerStyles.deleteButton}
              />
            </MenuTrigger>

            <MenuPopover>
              <MenuList>
                <MenuGroupHeader>{`Delete Layer '${layer.label}'?`}</MenuGroupHeader>
                <MenuItem onClick={onDelete}>Yes</MenuItem>
                <MenuItem>Noooooo!</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </TabList>
        {tab === 'config' &&
          (isVectorLayer ? (
            <VectorLayerEditing layer={layer} />
          ) : (
            <WmsLayerEditing layer={layer} />
          ))}
        {tab === 'overall-displays' && <LayerPresentationForm layer={layer} />}
        {tab === 'feature-displays' && isVectorLayer && (
          <>
            {vectorLayerDisplayId ? (
              <VectorLayerDisplay
                vectorLayerDisplayId={vectorLayerDisplayId}
                from={pathname}
              />
            ) : (
              <VectorLayerDisplays
                vectorLayerId={layer.vector_layer_id}
                from={pathname}
              />
            )}
          </>
        )}
      </AccordionPanel>
    </ErrorBoundary>
  )
}
