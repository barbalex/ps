import {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useContext,
} from 'react'
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
import invariant from 'tiny-invariant'
import { useAtom } from 'jotai'
import { pipe } from 'remeda'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../../../modules/createRows.ts'
import { DragAndDropContext } from '../DragAndDropContext.ts'
import { itemKey } from '../shared.ts'
import { LayerPresentationForm } from '../../LayerPresentationForm.tsx'
import {
  panelStyle,
  tabListStyle,
  headerContainerStyle,
  headerLabelStyle,
  deleteButtonStyle,
} from '../../styles.ts'
import { VectorLayerEditing } from '../../Vector/Editing.tsx'
import { WmsLayerEditing } from '../../WMS/Editing.tsx'
import { Component as VectorLayerDisplays } from '../../../../../../routes/vectorLayerDisplays.tsx'
import { Component as VectorLayerDisplay } from '../../../../../../routes/vectorLayerDisplay/index.tsx'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
} from '../../../../../../store.ts'
import { on } from '../../../../../../css.ts'
import { DragHandle } from '../../../../../shared/DragAndDrop/DragHandle.tsx'

import './active.css'


type TabType = 'overall-displays' | 'feature-displays' | 'config'



export const Content = memo(
  ({ layer, isOpen, layerCount, dragHandleRef }) => {
    const [designing] = useAtom(designingAtom)
    const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
      mapDrawerVectorLayerDisplayAtom,
    )
    const db = usePGlite()
    const [tab, setTab] = useState<TabType>('overall-displays')

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

    const onChangeActive = useCallback(() => {
      if (!layer.layer_presentation_id) {
        // if no presentation exists, create notification
        return createNotification({
          title: 'Layer presentation not found',
          type: 'warning',
          db,
        })
      }
      db.query(
        `UPDATE layer_presentations SET active = false WHERE layer_presentation_id = $1`,
        [layer.layer_presentation_id],
      )
    }, [db, layer.layer_presentation_id])


    const canDrag = layerCount > 1

    const onTabSelect = useCallback(
      (event, data: SelectTabData) => setTab(data.value),
      [],
    )

    const onClickFeatureDisplays = useCallback(
      () => setVectorLayerDisplayId(null),
      [setVectorLayerDisplayId],
    )

    const onDelete = useCallback(() => {
      if (isVectorLayer) {
        db.query(`DELETE FROM vector_layers WHERE vector_layer_id = $1`, [
          layer.vector_layer_id,
        ])
      } else {
        db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
          layer.wms_layer_id,
        ])
      }
    }, [db, isVectorLayer, layer.vector_layer_id, layer.wms_layer_id])

    // drag and drop items by dragging the drag icon
    // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
    return (
      <ErrorBoundary>
          <AccordionHeader
            expandIconPosition="end"
            size="extra-large"
            expandIcon={designing ? undefined : null}
            style={
              isOpen
                ? {
                    backgroundColor: 'rgba(103, 216, 101, 0.1)',
                  }
                : {}
            }
          >
            {canDrag && <DragHandle ref={dragHandleRef} />}
            <div style={headerContainerStyle}>
              <ToggleButton
                icon={
                  <BsCheckSquareFill
                    style={{ color: 'rgba(38, 82, 37, 0.9)' }}
                  />
                }
                checked={layer.layer_presentation_active}
                onClick={onChangeActive}
                style={pipe(
                  {
                    marginLeft: 2,
                    border: 'none',
                    backgroundColor: 'transparent',
                  },
                  on('&:hover', {
                    backgroundColor: 'var(--colorNeutralBackground1Hover)',
                  }),
                )}
                // as the accordion header is a button, we need to set this as an a
                // because nested buttons are not allowed
                as="a"
              />
              <p style={headerLabelStyle}>{layer.label}</p>
            </div>
          </AccordionHeader>
          <AccordionPanel style={panelStyle}>
            <TabList
              selectedValue={tab}
              onTabSelect={onTabSelect}
              style={tabListStyle}
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
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    size="medium"
                    icon={<MdDeleteOutline />}
                    title={`Delete Layer '${layer.label}'`}
                    style={deleteButtonStyle}
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
            {tab === 'overall-displays' && (
              <LayerPresentationForm layer={layer} />
            )}
            {tab === 'feature-displays' && isVectorLayer && (
              <>
                {vectorLayerDisplayId ? (
                  <VectorLayerDisplay
                    vectorLayerDisplayId={vectorLayerDisplayId}
                  />
                ) : (
                  <VectorLayerDisplays vectorLayerId={layer.vector_layer_id} />
                )}
              </>
            )}
          </AccordionPanel>
      </ErrorBoundary>
    )
  },
)
