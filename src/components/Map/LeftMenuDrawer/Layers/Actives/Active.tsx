import {
  memo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useContext,
} from 'react'
import { createPortal } from 'react-dom'
import {
  AccordionHeader,
  AccordionItem,
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
import { MdDragIndicator, MdDeleteOutline } from 'react-icons/md'
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import invariant from 'tiny-invariant'
import { useAtom } from 'jotai'
import { pipe } from 'remeda'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../../modules/createRows.ts'
import { ListContext } from './index.tsx'
import { itemKey, isItemData } from './shared.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import {
  panelStyle,
  tabListStyle,
  headerContainerStyle,
  headerLabelStyle,
  deleteButtonStyle,
} from '../styles.ts'
import { VectorLayerEditing } from '../Vector/Editing.tsx'
import { WmsLayerEditing } from '../WMS/Editing.tsx'
import { Component as VectorLayerDisplays } from '../../../../../routes/vectorLayerDisplays.tsx'
import { Component as VectorLayerDisplay } from '../../../../../routes/vectorLayerDisplay/index.tsx'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
} from '../../../../../store.ts'
import { on } from '../../../../../css.ts'

import './active.css'

function useListContext() {
  const listContext = useContext(ListContext)
  invariant(listContext !== null)

  return listContext
}

function getItemData({ layer, index, instanceId }) {
  return {
    [itemKey]: true,
    layer,
    index,
    instanceId,
  }
}

type DraggableState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'dragging' }

const idleState: DraggableState = { type: 'idle' }
const draggingState: DraggableState = { type: 'dragging' }

type TabType = 'overall-displays' | 'feature-displays' | 'config'

const previewStyle = {
  padding: '0.5rem',
  backgroundColor: 'white',
  borderRadius: '0.25rem',
}
const dragHandleStyle = {
  display: 'flex',
  alignItems: 'center',
}
const dragIndicatorStyle = {
  fontSize: 'x-large',
  color: 'rgba(55, 118, 28, 0.6)',
  paddingRight: 5,
  cursor: 'grab',
}

export const ActiveLayer = memo(
  ({ layer, index, isLast, isOpen, layerCount }) => {
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

    const { registerItem, instanceId } = useListContext()
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)
    const [draggableState, setDraggableState] =
      useState<DraggableState>(idleState)

    useEffect(() => {
      const element = ref.current
      const dragHandle = dragHandleRef.current
      invariant(element)
      invariant(dragHandle)

      const data = getItemData({ layer, index, instanceId })

      // draggable returns its cleanup function
      return combine(
        registerItem({
          itemId: layer.layer_presentation_id,
          element,
        }),
        draggable({
          element: dragHandle,
          canDrag: () => layerCount > 1,
          getInitialData: () => data,
          onGenerateDragPreview({ nativeSetDragImage }) {
            setCustomNativeDragPreview({
              nativeSetDragImage,
              getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
              render({ container }) {
                setDraggableState({ type: 'preview', container })

                return () => setDraggableState(draggingState)
              },
            })
          },
          onDragStart() {
            setDraggableState(draggingState)
          },
          onDrop() {
            setDraggableState(idleState)
          },
        }),
        dropTargetForElements({
          element,
          canDrop({ source }) {
            return (
              isItemData(source.data) && source.data.instanceId === instanceId
            )
          },
          getData({ input }) {
            return attachClosestEdge(data, {
              element,
              input,
              allowedEdges: ['top', 'bottom'],
            })
          },
          onDrag({ self, source }) {
            const isSource =
              source.data.layer.layer_presentation_id ===
              element.dataset.presentationId
            if (isSource) {
              setClosestEdge(null)
              return
            }

            const closestEdge = extractClosestEdge(self.data)

            const sourceIndex = source.data.index
            invariant(typeof sourceIndex === 'number')

            const isItemBeforeSource = index === sourceIndex - 1
            const isItemAfterSource = index === sourceIndex + 1

            const isDropIndicatorHidden =
              (isItemBeforeSource && closestEdge === 'bottom') ||
              (isItemAfterSource && closestEdge === 'top')

            if (isDropIndicatorHidden) {
              setClosestEdge(null)
              return
            }

            setClosestEdge(closestEdge)
          },
          onDragLeave() {
            setClosestEdge(null)
          },
          onDrop() {
            setClosestEdge(null)
          },
        }),
      )
    }, [index, instanceId, layer, layerCount, registerItem])

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
        <AccordionItem
          value={layer.layer_presentation_id}
          ref={ref}
          style={{
            // needed for the drop indicator to appear
            position: 'relative',
            borderTop: `${isOpen ? 3 : 1}px solid rgba(55, 118, 28, 0.5)`,
            ...(isLast
              ? {
                  borderBottom: `1px solid rgba(55, 118, 28, 0.5)`,
                }
              : {}),
            ...(isOpen
              ? { borderBottom: `3px solid rgba(55, 118, 28, 0.5)` }
              : {}),
          }}
        >
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
            <div
              ref={dragHandleRef}
              style={dragHandleStyle}
              onClick={(e) => e.preventDefault()}
              title="drag to reorder"
            >
              {canDrag && <MdDragIndicator style={dragIndicatorStyle} />}
            </div>
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
          {closestEdge && (
            <DropIndicator
              edge={closestEdge}
              gap="1px"
            />
          )}
        </AccordionItem>
        {draggableState.type === 'preview' &&
          createPortal(
            <div style={previewStyle}>{layer.label}</div>,
            draggableState.container,
          )}
      </ErrorBoundary>
    )
  },
)
