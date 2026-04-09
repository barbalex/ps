import { useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const {
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
} = fluentUiReactComponents
import { BsSquare } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { designingAtom, addOperationAtom } from '../../../../../store.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { WmsLayerEditing } from './Editing.tsx'
import layerStyles from '../index.module.css'
import styles from './WmsLayer.module.css'
import type LayerPresentations from '../../../../../models/public/LayerPresentations.ts'
import type WmsLayerType from '../../../../../models/public/WMSLayers.ts'

type TabType = 'overall-displays' | 'config'

type Props = {
  layer: WmsLayerType
  isLast: boolean
  isOpen: boolean
}

export const WmsLayer = ({ layer, isLast, isOpen }: Props) => {
  const { formatMessage } = useIntl()
  const [designing] = useAtom(designingAtom)
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')

  // effect: if layer has no wms_service_id or wms_service_layer_name: set tab to 'config'
  useEffect(() => {
    if (!layer.wms_service_id || !layer.wms_service_layer_name) {
      setTab('config')
    }
  }, [layer.wms_service_id, layer.wms_service_layer_name])

  const onChange = async () => {
    // 1. check if layer has a presentation
    const res = await db.query(
      `SELECT * FROM layer_presentations WHERE wms_layer_id = $1`,
      [layer.wms_layer_id],
    )
    const presentation: LayerPresentations | undefined = res?.rows?.[0]
    // 2. if not, create one
    if (!presentation) {
      await createLayerPresentation({
        wmsLayerId: layer.wms_layer_id,
        active: true,
      })
    }
    // 3. if yes, update it
    else {
      db.query(
        `
        UPDATE layer_presentations
        SET active = TRUE
        WHERE layer_presentation_id = $1
      `,
        [presentation.layer_presentation_id],
      )
      // add task to update server and rollback PGlite in case of error
      addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: presentation.layer_presentation_id,
        operation: 'update',
        draft: { active: true },
        prev: { ...presentation },
      })
    }
  }

  const onTabSelect = (event, data: SelectTabData) => setTab(data.value)

  const onDelete = () => {
    db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
      layer.wms_layer_id,
    ])
    // add task to update server and rollback PGlite in case of error
    addOperation({
      table: 'wms_layers',
      rowIdName: 'wms_layer_id',
      rowId: layer.wms_layer_id,
      operation: 'delete',
      prev: { ...layer },
    })
  }

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.wms_layer_id}
        className={styles.accordionItem}
        style={{
          '--top-border-width': isOpen ? 3 : 1,
          '--bottom-border-width': isOpen ? 3 : isLast ? 1 : 0,
        }}
      >
        <AccordionHeader
          expandIconPosition="end"
          size="extra-large"
          expandIcon={designing ? undefined : null}
          className={isOpen ? styles.headerOpen : undefined}
        >
          <div className={layerStyles.headerContainer}>
            <ToggleButton
              icon={<BsSquare className={layerStyles.headerToggleIcon} />}
              checked={false}
              onClick={onChange}
              className={`${styles.labelButton}${isOpen ? ` ${styles.toggleOpen}` : ''}`}
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
            <Tab value="config">Config</Tab>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button
                  size="medium"
                  icon={<MdDeleteOutline />}
                  title={formatMessage({ id: 'layerDeleteBtnTitle', defaultMessage: "Layer {label} löschen" }, { label: layer.label })}
                  className={layerStyles.deleteButton}
                />
              </MenuTrigger>

              <MenuPopover>
                <MenuList>
                  <MenuGroupHeader>{formatMessage({ id: 'layerDeleteConfirmHeader', defaultMessage: "Layer {label} löschen?" }, { label: layer.label })}</MenuGroupHeader>
                  <MenuItem onClick={onDelete}>{formatMessage({ id: 'layerDeleteYes', defaultMessage: 'Ja' })}</MenuItem>
                  <MenuItem>{formatMessage({ id: 'layerDeleteNo', defaultMessage: 'Nein' })}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </TabList>
          {tab === 'config' && <WmsLayerEditing layer={layer} />}
          {tab === 'overall-displays' && (
            <LayerPresentationForm layer={layer} />
          )}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
