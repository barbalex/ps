import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Menu,
  MenuItem,
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
import { DeleteLayerTrigger } from '../DeleteLayerTrigger.tsx'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { useLayerActivation } from '../../../../../modules/useLayerActivation.ts'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { addOperationAtom, designingAtom } from '../../../../../store.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { TileLayerEditing } from './Editing.tsx'
import layerStyles from '../index.module.css'
import styles from '../WMS/WmsLayer.module.css'
import type TileLayers from '../../../../../models/public/TileLayers.ts'

export type TileLayerRowModel = TileLayers & {
  layer_presentation_id: string | null
  active: boolean | null
}

type TabType = 'overall-displays' | 'config'

type Props = {
  layer: TileLayerRowModel
  isLast: boolean
  isOpen: boolean
}

export const TileLayerRow = ({ layer, isLast, isOpen }: Props) => {
  const { formatMessage } = useIntl()
  const { projectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const { isLayerVisible } = useUrlLayers()
  const { activateLayer, deactivateLayer } = useLayerActivation()

  const label =
    layer.label ||
    formatMessage({
      id: 'tileLayerNoName',
      defaultMessage: 'Tile-Layer ohne Name',
    })
  const [tab, setTab] = useState<TabType>('overall-displays')

  // a tile layer without url template has no config yet: open the config tab
  useEffect(() => {
    if (!layer.url_template) {
      setTab('config')
    }
  }, [layer.url_template])

  const presentationId = layer.layer_presentation_id
  // background tile layers are not toggled here: they are chosen in the
  // Hintergrundkarte section, where render list membership is their visibility
  const isVisible =
    !layer.is_background &&
    isLayerVisible(presentationId ?? '', layer.active === true)

  const onChangeActive = async () => {
    if (!presentationId) return
    if (isVisible) {
      await deactivateLayer(presentationId)
      return
    }
    await activateLayer(presentationId)
  }

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    setTab(data.value as TabType)

  const onDelete = () => {
    db.query(`DELETE FROM tile_layers WHERE tile_layer_id = $1`, [
      layer.tile_layer_id,
    ])
    // add task to update server and rollback PGlite in case of error
    addOperation({
      table: 'tile_layers',
      rowIdName: 'tile_layer_id',
      rowId: layer.tile_layer_id,
      operation: 'delete',
      prev: { ...layer },
    })
  }

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.tile_layer_id}
        className={`${styles.accordionItem}${isOpen ? ` ${styles.accordionOpen}` : isLast ? ` ${styles.accordionLast}` : ''}`}
      >
        <AccordionHeader
          expandIconPosition="end"
          size="extra-large"
          expandIcon={designing ? undefined : null}
          className={isOpen ? styles.headerOpen : undefined}
        >
          <div className={layerStyles.headerContainer}>
            {!layer.is_background && (
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
                  onChangeActive()
                }}
                className={`${styles.labelButton}${isOpen ? ` ${styles.toggleOpen}` : ''}`}
                // as the accordion header is a button, we need to set this as an a
                // because nested buttons are not allowed
                as="a"
              />
            )}
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
              <DeleteLayerTrigger label={label} />
              <MenuPopover>
                <MenuList>
                  <MenuGroupHeader>
                    {formatMessage({
                      id: 'layerDeleteConfirmHeader',
                      defaultMessage: 'Layer {label} löschen?',
                    }, { label })}
                  </MenuGroupHeader>
                  <MenuItem onClick={onDelete}>
                    {formatMessage({ id: 'layerDeleteYes', defaultMessage: 'Ja' })}
                  </MenuItem>
                  <MenuItem>
                    {formatMessage({ id: 'layerDeleteNo', defaultMessage: 'Nein' })}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </TabList>
          {tab === 'config' && <TileLayerEditing layer={layer} />}
          {tab === 'overall-displays' && (
            <LayerPresentationForm
              layer={{
                ...layer,
                layer_presentation_id: presentationId ?? undefined,
              }}
            />
          )}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
