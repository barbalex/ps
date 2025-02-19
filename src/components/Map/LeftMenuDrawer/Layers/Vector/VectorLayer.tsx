import { memo, useCallback, useState, useEffect } from 'react'
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
import { BsSquare } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { useAtom } from 'jotai'
import { pipe } from 'remeda'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
} from '../../../../../store.ts'
import { VectorLayerEditing } from './Editing.tsx'
import {
  panelStyle,
  tabListStyle,
  headerContainerStyle,
  headerToggleIconStyle,
  headerLabelStyle,
  deleteButtonStyle,
} from '../styles.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { Component as VectorLayerDisplays } from '../../../../../routes/vectorLayerDisplays.tsx'
import { Component as VectorLayerDisplay } from '../../../../../routes/vectorLayerDisplay/index.tsx'
import { on } from '../../../../../css.ts'

type Props = {
  layer: VectorLayer
  isLast: number
  isOpen: boolean
}

type TabType = 'overall-displays' | 'feature-displays' | 'config'

export const VectorLayer = memo(({ layer, isLast, isOpen }) => {
  const [designing] = useAtom(designingAtom)
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )

  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')

  // effect: if layer has no wfs_service_id or wfs_service_layer_name: set tab to 'config'
  useEffect(() => {
    if (!layer.wfs_service_id || !layer.wfs_service_layer_name) {
      setTab('config')
    }
  }, [layer.wfs_service_id, layer.wfs_service_layer_name])

  const onChange = useCallback(async () => {
    if (!layer.layer_presentations?.[0]?.layer_presentation_id) {
      // create the missing layer_presentation
      await createLayerPresentation({
        vector_layer_id: layer.vector_layer_id,
        active: true,
        db,
      })
    } else {
      db.layer_presentations.update({
        where: {
          layer_presentation_id:
            layer.layer_presentations?.[0]?.layer_presentation_id,
        },
        data: { active: true },
      })
    }
  }, [db, layer.layer_presentations, layer.vector_layer_id])

  const onTabSelect = useCallback(
    (event, data: SelectTabData) => setTab(data.value),
    [],
  )

  const onClickFeatureDisplays = useCallback(
    () => setVectorLayerDisplayId(null),
    [setVectorLayerDisplayId],
  )

  const onDelete = useCallback(
    () =>
      db.vector_layers.delete({
        where: { vector_layer_id: layer.vector_layer_id },
      }),
    [db.vector_layers, layer.vector_layer_id],
  )

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.vector_layer_id}
        style={{
          borderTop: `${isOpen ? 3 : 1}px solid rgba(55, 118, 28, 0.5)`,
          ...(isLast
            ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
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
          <div style={headerContainerStyle}>
            <ToggleButton
              icon={<BsSquare style={headerToggleIconStyle} />}
              checked={false}
              onClick={onChange}
              style={pipe(
                {
                  marginLeft: 2,
                  border: 'none',
                  ...(isOpen ? { backgroundColor: 'none' } : {}),
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
            <Tab value="feature-displays" onClick={onClickFeatureDisplays}>
              Feature Displays
            </Tab>
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
          {tab === 'overall-displays' && (
            <LayerPresentationForm layer={layer} />
          )}
          {tab === 'feature-displays' && (
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
          {tab === 'config' && <VectorLayerEditing layer={layer} />}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
})
