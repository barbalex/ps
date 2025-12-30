import { useState } from 'react'
import {
  ToggleButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Tab,
  TabList,
  SelectTabData,
} from '@fluentui/react-components'
import { BsSquare } from 'react-icons/bs'
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
import { VectorLayerEditing } from '../Vector/Editing.tsx'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { VectorLayerDisplays } from '../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { VectorLayerDisplay } from '../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import layerStyles from '../index.module.css'
import styles from './OwnLayer.module.css'

type TabType = 'overall-displays' | 'feature-displays' | 'config'

export const OwnLayer = ({ layer, isLast, isOpen }) => {
  const [designing] = useAtom(designingAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')
  const { pathname } = useLocation()

  const onChange = async () => {
    if (!layer.layer_presentations?.[0]?.layer_presentation_id) {
      // create the missing layer_presentation
      await createLayerPresentation({
        vectorLayerId: layer.vector_layer_id,
        active: true,
        db,
      })
    } else {
      db.query(
        `UPDATE layer_presentations SET active = true WHERE layer_presentation_id = $1`,
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
          </TabList>
          {tab === 'config' && <VectorLayerEditing layer={layer} />}
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
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
