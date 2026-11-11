import type { ComponentProps, FC } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToolbarButton } = fluentUiReactComponents
import { MdGetApp } from 'react-icons/md'
import { saveAs } from 'file-saver'
import { useMap } from 'react-leaflet'
import { useIntl } from 'react-intl'
import { useSetAtom } from 'jotai'

import { captureMap } from '../../mapExport.ts'

import { addNotificationAtom } from '../../../../store.ts'

import styles from './index.module.css'

// ToolbarButtonProps omits 'size', but the underlying button accepts it —
// bridge the type locally to keep passing it through.
const Button = ToolbarButton as unknown as FC<
  ComponentProps<typeof ToolbarButton> & {
    size?: string
  }
>

// Ported from apf2: saves the current map as a png file
export const ExportPngButton = () => {
  const map = useMap()
  const { formatMessage } = useIntl()
  const addNotification = useSetAtom(addNotificationAtom)

  const label = formatMessage({
    id: 'mapExportPng',
    defaultMessage: 'Karte als PNG speichern',
  })

  const savePng = async () => {
    try {
      const dataUrl = await captureMap(map)
      saveAs(dataUrl, 'artenFoerdernKarte.png')
    } catch (error) {
      addNotification({
        title: formatMessage({
          id: 'mapExportPngError',
          defaultMessage: 'Karte konnte nicht gespeichert werden',
        }),
        body: (error as Error).message,
        intent: 'error',
      })
    }
  }

  return (
    <Button
      name="export_png"
      onClick={() => void savePng()}
      aria-label={label}
      title={label}
      icon={<MdGetApp />}
      size="large"
      className={styles.toolbarButton}
    />
  )
}
