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
import { designingAtom } from '../../../../../store.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { WmsLayerEditing } from './Editing.tsx'
import {
  panelStyle,
  tabListStyle,
  headerContainerStyle,
  headerToggleIconStyle,
  headerLabelStyle,
  deleteButtonStyle,
} from '../styles.ts'
import { on } from '../../../../../css.ts'

type TabType = 'overall-displays' | 'config'

// type Props = {
//   layer: WmsLayer
//   isLast: number
//   isOpen: boolean
// }

export const WmsLayer = memo(({ layer, isLast, isOpen }) => {
  const [designing] = useAtom(designingAtom)
  const db = usePGlite()
  const [tab, setTab] = useState<TabType>('overall-displays')

  // effect: if layer has no wms_service_id or wms_service_layer_name: set tab to 'config'
  useEffect(() => {
    if (!layer.wms_service_id || !layer.wms_service_layer_name) {
      setTab('config')
    }
  }, [layer.wms_service_id, layer.wms_service_layer_name])

  const onChange = useCallback(async () => {
    // 1. check if layer has a presentation
    const res = await db.query(
      `SELECT * FROM layer_presentations WHERE wms_layer_id = $1`,
      [layer.wms_layer_id],
    )
    const presentation = res?.rows?.[0]
    // 2. if not, create one
    if (!presentation) {
      await createLayerPresentation({
        wmsLayerId: layer.wms_layer_id,
        active: true,
        db,
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
    }
  }, [db, layer.wms_layer_id])

  const onTabSelect = useCallback(
    (event, data: SelectTabData) => setTab(data.value),
    [],
  )

  const onDelete = useCallback(
    () =>
      db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
        layer.wms_layer_id,
      ]),
    [db, layer.wms_layer_id],
  )

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.wms_layer_id}
        style={{
          borderTop: `${isOpen ? 3 : 1}px solid rgba(55, 118, 28, 0.5)`,
          ...(isLast ?
            { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
          : {}),
          ...(isOpen ?
            { borderBottom: `3px solid rgba(55, 118, 28, 0.5)` }
          : {}),
        }}
      >
        <AccordionHeader
          expandIconPosition="end"
          size="extra-large"
          expandIcon={designing ? undefined : null}
          style={
            isOpen ?
              {
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
          {tab === 'config' && <WmsLayerEditing layer={layer} />}
          {tab === 'overall-displays' && (
            <LayerPresentationForm layer={layer} />
          )}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
})
