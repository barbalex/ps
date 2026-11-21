import { useState } from 'react'
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
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { setLayerPresentationActive } from '../../../../../modules/setLayerPresentationActive.ts'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
  addOperationAtom,
  mapLayerSortingAtom,
} from '../../../../../store.ts'
import { VectorLayerEditing } from './Editing.tsx'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { VectorLayerDisplays } from '../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { VectorLayerDisplay } from '../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import type VectorLayers from '../../../../../models/public/VectorLayers.ts'
import layerStyles from '../index.module.css'
import styles from './VectorLayer.module.css'

export type VectorLayerRow = VectorLayers & {
  label: string
  layer_presentations?: { layer_presentation_id: string; active: boolean }[]
  // passed to LayerPresentationForm (undefined for layers without presentation)
  layer_presentation_id?: string
}

type TabType = 'overall-displays' | 'feature-displays' | 'config'

export const VectorLayer = ({
  layer,
  isLast,
  isOpen,
}: {
  layer: VectorLayerRow
  isLast: boolean
  isOpen: boolean
}) => {
  const { formatMessage } = useIntl()
  const { projectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const addOperation = useSetAtom(addOperationAtom)
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )

  const db = usePGlite()
  const { isOverridden, setLayerVisible, isLayerVisible } = useUrlLayers()
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const [tab, setTab] = useState<TabType>(() => {
    // if layer has no wfs_service_id or wfs_service_layer_name: default to 'config'
    if (!layer.wfs_service_id || !layer.wfs_service_layer_name) {
      return 'config'
    }
    return 'overall-displays'
  })

  const presentation = layer.layer_presentations?.[0]
  const presentationId = presentation?.layer_presentation_id
  const isVisible = isLayerVisible(presentationId ?? '', presentation?.active === true)

  // joining the render list is what makes an activated layer actually show:
  // without a ?layers= override that is the mapLayerSorting atom, with an
  // active override the layer must join the url list
  const joinRenderList = (layerPresentationId: string) => {
    if (isOverridden) {
      setLayerVisible(layerPresentationId, true)
    } else if (!mapLayerSorting.includes(layerPresentationId)) {
      setMapLayerSorting([...mapLayerSorting, layerPresentationId])
    }
  }
  const leaveRenderList = (layerPresentationId: string) => {
    if (isOverridden) {
      setLayerVisible(layerPresentationId, false)
    } else {
      setMapLayerSorting(
        mapLayerSorting.filter((id) => id !== layerPresentationId),
      )
    }
  }

  const onChange = async () => {
    // deactivate a visible layer: view off and design flag off
    if (isVisible && presentationId) {
      leaveRenderList(presentationId)
      await setLayerPresentationActive(presentationId, false)
      return
    }
    // activate: design flag on, then make it render
    let layerPresentationId = presentationId
    if (!layerPresentationId) {
      layerPresentationId = await createLayerPresentation({
        vectorLayerId: layer.vector_layer_id,
        active: true,
      } as unknown as Parameters<typeof createLayerPresentation>[0])
    } else {
      await setLayerPresentationActive(layerPresentationId, true)
    }
    if (layerPresentationId) joinRenderList(layerPresentationId)
  }

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    setTab(data.value as TabType)

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
                  <BsCheckSquareFill className={layerStyles.headerToggleIcon} />
                ) : (
                  <BsSquare className={layerStyles.headerToggleIcon} />
                )
              }
              checked={isVisible}
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
            <Tab
              value="feature-displays"
              onClick={onClickFeatureDisplays}
            >
              Feature Displays
            </Tab>
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
          {tab === 'overall-displays' && (
            <LayerPresentationForm layer={layer} />
          )}
          {tab === 'feature-displays' && (
            <>
              {vectorLayerDisplayId ?
                <VectorLayerDisplay
                  vectorLayerDisplayId={vectorLayerDisplayId}
                />
              : <VectorLayerDisplays
                  vectorLayerId={layer.vector_layer_id}
                />
              }
            </>
          )}
          {tab === 'config' && <VectorLayerEditing layer={layer} />}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
