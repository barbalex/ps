import { memo, useCallback, useState } from 'react'
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  ToggleButton,
  Tab,
  TabList,
  SelectTabData,
} from '@fluentui/react-components'
import { BsSquare } from 'react-icons/bs'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
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
} from '../styles.ts'
import { css } from '../../../../../css.ts'

type TabType = 'config' | 'overall-displays'

type Props = {
  layer: WmsLayer
  isLast: number
  isOpen: boolean
}

export const WmsLayer = memo(({ layer, isLast, isOpen }: Props) => {
  const [designing] = useAtom(designingAtom)
  const { db } = useElectric()!
  const [tab, setTab] = useState<TabType>('config')

  const onChange = useCallback(async () => {
    // 1. check if layer has a presentation
    const presentation = await db.layer_presentations.findFirst({
      where: { wms_layer_id: layer.wms_layer_id },
    })
    // 2. if not, create one
    if (!presentation) {
      const data = createLayerPresentation({
        wms_layer_id: layer.wms_layer_id,
        active: true,
      })
      db.layer_presentations.create({ data })
    }
    // 3. if yes, update it
    else {
      db.layer_presentations.update({
        where: { layer_presentation_id: presentation.layer_presentation_id },
        data: { active: true },
      })
    }
  }, [db.layer_presentations, layer.wms_layer_id])

  const onTabSelect = useCallback(
    (event, data: SelectTabData) => setTab(data.value),
    [],
  )

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.wms_layer_id}
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
              style={css({
                marginLeft: 2,
                border: 'none',
                ...(isOpen ? { background: 'none' } : {}),
                on: ($) => [
                  $('&:hover', {
                    backgroundColor: 'var(--colorNeutralBackground1Hover)',
                  }),
                ],
              })}
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
            <Tab value="config">Config</Tab>
            <Tab value="overall-displays">Overall Display</Tab>
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
