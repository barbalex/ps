import type { ComponentProps, FC } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, ToolbarButton } =
  fluentUiReactComponents
import { MdPrint } from 'react-icons/md'
import { useMap } from 'react-leaflet'
import { useIntl } from 'react-intl'
import { useSetAtom } from 'jotai'

import { printMap, PrintPopupBlockedError } from '../../mapExport.ts'

import { addNotificationAtom } from '../../../../store.ts'

import styles from './index.module.css'

// ToolbarButtonProps omits 'size', but the underlying button accepts it —
// bridge the type locally to keep passing it through.
const Button = ToolbarButton as unknown as FC<
  ComponentProps<typeof ToolbarButton> & {
    size?: string
  }
>

// easyprint's size modes, translated like the old defaultSizeTitles
const SIZE_MODES = [
  {
    id: 'mapPrintCurrentSize',
    defaultMessage: 'Aktuelle Grösse',
    pageSize: '',
  },
  {
    id: 'mapPrintA4Landscape',
    defaultMessage: 'A4 quer',
    pageSize: 'A4 landscape',
  },
  {
    id: 'mapPrintA4Portrait',
    defaultMessage: 'A4 hoch',
    pageSize: 'A4 portrait',
  },
] as const

// Ported from apf2: prints the captured map in the chosen page size
export const PrintButton = () => {
  const map = useMap()
  const { formatMessage } = useIntl()
  const addNotification = useSetAtom(addNotificationAtom)

  const print = async (pageSize: string) => {
    try {
      await printMap(map, pageSize)
    } catch (error) {
      const body =
        error instanceof PrintPopupBlockedError ?
          formatMessage({
            id: 'mapPrintPopupBlocked',
            defaultMessage:
              'Das Druckfenster wurde vom Browser blockiert. Bitte Popups für diese Seite erlauben.',
          })
        : (error as Error).message
      addNotification({
        title: formatMessage({
          id: 'mapPrint',
          defaultMessage: 'Karte drucken',
        }),
        body,
        intent: 'error',
      })
    }
  }

  const label = formatMessage({
    id: 'mapPrint',
    defaultMessage: 'Karte drucken',
  })

  return (
    <Menu positioning="before">
      <MenuTrigger disableButtonEnhancement>
        <Button
          name="print"
          aria-label={label}
          title={label}
          icon={<MdPrint />}
          size="large"
          className={styles.toolbarButton}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {SIZE_MODES.map((mode) => (
            <MenuItem
              key={mode.pageSize}
              onClick={() => void print(mode.pageSize)}
            >
              {formatMessage({
                id: mode.id,
                defaultMessage: mode.defaultMessage,
              })}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
