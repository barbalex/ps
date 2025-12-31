import { useState, useEffect } from 'react'
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
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
  addOperationAtom,
} from '../../../../../store.ts'
import { VectorLayerEditing } from './Editing.tsx'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { VectorLayerDisplays } from '../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { VectorLayerDisplay } from '../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import layerStyles from '../index.module.css'
import styles from './VectorLayer.module.css'

// type Props = {
//   layer: VectorLayer
//   isLast: number
//   isOpen: boolean
// }

type TabType = 'overall-displays' | 'feature-displays' | 'config'

export const VectorLayer = ({ layer, isLast, isOpen }) => {
  const [designing] = useAtom(designingAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const { pathname } = useLocation()

  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')

  // effect: if layer has no wfs_service_id or wfs_service_layer_name: set tab to 'config'
  useEffect(() => {
    if (!layer.wfs_service_id || !layer.wfs_service_layer_name) {
      setTab('config')
    }
  }, [layer.wfs_service_id, layer.wfs_service_layer_name])

  const onChange = async () => {
    if (!layer.layer_presentations?.[0]?.layer_presentation_id) {
      // create the missing layer_presentation
      await createLayerPresentation({
        vectorLayerId: layer.vector_layer_id,
        active: true,
      })
    } else {
      db.query(
        `UPDATE layer_presentations SET active = TRUE WHERE layer_presentation_id = $1`,
        [layer.layer_presentations?.[0]?.layer_presentation_id],
      )
      // add task to update server and rollback PGlite in case of error
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: layer.layer_presentations?.[0]?.layer_presentation_id,
        operation: 'update',
        draft: { active: true },
        prev: { ...layer.layer_presentations?.[0] },
      })
    }
  }

  const onTabSelect = (event, data: SelectTabData) => setTab(data.value)

  const onClickFeatureDisplays = () => setVectorLayerDisplayId(null)

  const onDelete = () => {
    db.query(`DELETE FROM vector_layers WHERE vector_layer_id = $1`, [
      layer.vector_layer_id,
    ])
    // add task to update server and rollback PGlite in case of error
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: layer.vector_layer_id,
      operation: 'delete',
      draft: {},
      prev: { ...layer },
    })
  }

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
          <div className={layerStyles.headerContainer}>
            <ToggleButton
              icon={<BsSquare className={layerStyles.headerToggleIcon} />}
              checked={false}
              onClick={onChange}
              style={isOpen ? { backgroundColor: 'none' } : undefined}
              className={styles.labelButton}
              // as the accordion header is a button, we need to set this as an a
              // because nested buttons are not allowed
              as="a"
            />
            <p className={layerStyles.headerLabel}>{layer.label}</p>
          </div>
        </AccordionHeader>
        <AccordionPanel className={layerStyles.panel}>
          <TabList
            selectedValue={tab}
            onTabSelect={onTabSelect}
            className={layerStyles.tabList}
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
          {tab === 'overall-displays' && (
            <LayerPresentationForm layer={layer} />
          )}
          {tab === 'feature-displays' && (
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
          {tab === 'config' && <VectorLayerEditing layer={layer} />}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
