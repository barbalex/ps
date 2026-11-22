import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
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
} = fluentUiReactComponents
import type {
  SelectTabData,
  SelectTabEvent,
} from '@fluentui/react-components'
import { BsCheckSquareFill, BsSquare } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { useLayerActivation } from '../../../../../modules/useLayerActivation.ts'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { designingAtom, addOperationAtom } from '../../../../../store.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { WmsLayerEditing } from './Editing.tsx'
import layerStyles from '../index.module.css'
import styles from './WmsLayer.module.css'
import type LayerPresentations from '../../../../../models/public/LayerPresentations.ts'
import type WmsLayerType from '../../../../../models/public/WmsLayers.ts'

type TabType = 'overall-displays' | 'config'

type Props = {
  layer: WmsLayerType
  layerPresentations: LayerPresentations[]
  isLast: boolean
  isOpen: boolean
}

export const WmsLayer = ({ layer, isLast, isOpen }: Props) => {
  const { formatMessage } = useIntl()
  const { projectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const { isLayerVisible } = useUrlLayers()
  const { activateLayer, deactivateLayer, joinRenderList } =
    useLayerActivation()
  // the stored label is null (or empty) while no service layer has been
  // chosen
  const label =
    layer.label ||
    formatMessage({
      id: 'wmsLayerNoLayerChosen',
      defaultMessage: 'Kein Layer gewählt',
    })
  const [tab, setTab] = useState<TabType>('overall-displays')

  // effect: if layer has no wms_service_id or wms_service_layer_name: set tab to 'config'
  useEffect(() => {
    if (!layer.wms_service_id || !layer.wms_service_layer_name) {
      setTab('config')
    }
  }, [layer.wms_service_id, layer.wms_service_layer_name])

  // the layer's presentation, live so a newly created one is reflected
  const resPresentation = useLiveQuery(
    `SELECT * FROM layer_presentations WHERE wms_layer_id = $1`,
    [layer.wms_layer_id],
  )
  const presentation = resPresentation?.rows?.[0] as
    | LayerPresentations
    | undefined
  const isVisible = isLayerVisible(
    presentation?.layer_presentation_id ?? '',
    presentation?.active === true,
  )

  // toggling layer activation sets the design flag (layer_presentations.
  // active — what lists the layer under Active) and joins the render list,
  // like every other layer toggle
  const onChange = async () => {
    // deactivate a visible layer: view off and design flag off
    if (isVisible && presentation) {
      await deactivateLayer(presentation.layer_presentation_id)
      return
    }
    // activate: create the missing layer_presentation (already active) or
    // set the design flag, then make the layer render
    if (!presentation) {
      const newLayerPresentationId = await createLayerPresentation({
        wmsLayerId: layer.wms_layer_id,
        active: true,
      } as unknown as Parameters<typeof createLayerPresentation>[0])
      if (newLayerPresentationId) joinRenderList(newLayerPresentationId)
      return
    }
    await activateLayer(presentation.layer_presentation_id)
  }

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    setTab(data.value as TabType)

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
        className={`${styles.accordionItem}${isOpen ? ` ${styles.accordionOpen}` : isLast ? ` ${styles.accordionLast}` : ''}`}
      >
        <AccordionHeader
          expandIconPosition="end"
          size="extra-large"
          expandIcon={designing ? undefined : null}
          className={isOpen ? styles.headerOpen : undefined}
        >
          <div className={layerStyles.headerContainer}>
            <ToggleButton
              icon={
                isVisible ? (
                  <BsCheckSquareFill
                    className={layerStyles.headerToggleIcon}
                  />
                ) : (
                  <BsSquare className={layerStyles.headerToggleIcon} />
                )
              }
              checked={isVisible}
              onClick={(event) => {
                // only the visibility toggle, not the accordion header
                event.stopPropagation()
                onChange()
              }}
              className={`${styles.labelButton}${isOpen ? ` ${styles.toggleOpen}` : ''}`}
              // as the accordion header is a button, we need to set this as an a
              // because nested buttons are not allowed
              as="a"
            />
            <p className={layerStyles.headerLabel}>{label}</p>
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
                  title={formatMessage({ id: 'layerDeleteBtnTitle', defaultMessage: "Layer {label} löschen" }, { label })}
                  className={layerStyles.deleteButton}
                />
              </MenuTrigger>

              <MenuPopover>
                <MenuList>
                  <MenuGroupHeader>{formatMessage({ id: 'layerDeleteConfirmHeader', defaultMessage: "Layer {label} löschen?" }, { label })}</MenuGroupHeader>
                  <MenuItem onClick={onDelete}>{formatMessage({ id: 'layerDeleteYes', defaultMessage: 'Ja' })}</MenuItem>
                  <MenuItem>{formatMessage({ id: 'layerDeleteNo', defaultMessage: 'Nein' })}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </TabList>
          {tab === 'config' && <WmsLayerEditing layer={layer} />}
          {tab === 'overall-displays' && (
            <LayerPresentationForm
              layer={{
                ...layer,
                layer_presentation_id: presentation?.layer_presentation_id,
              }}
            />
          )}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
