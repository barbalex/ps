import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { SwitchField } from '../../../../../components/shared/SwitchField.tsx'
import { TextField } from '../../../../../components/shared/TextField.tsx'
import { addOperationAtom } from '../../../../../store.ts'
import type TileLayers from '../../../../../models/public/TileLayers.ts'
import styles from '../WMS/Editing.module.css'

const parseSubdomains = (value: string | null | undefined) => {
  const subdomains = (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return subdomains.length ? subdomains : null
}

export const TileLayerEditing = ({ layer: row }: { layer: TileLayers }) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const onChange = async (
    e: Parameters<typeof getValueFromChange>[0],
    data?: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if ((row as unknown as Record<string, unknown>)[name] === value) return

    // subdomains are entered comma-separated but stored as a jsonb array
    const valueToSave =
      name === 'subdomains' ? parseSubdomains(value as string) : value

    try {
      await db.query(`UPDATE tile_layers SET ${name} = $1 WHERE tile_layer_id = $2`, [
        valueToSave,
        row.tile_layer_id,
      ])
    } catch (error) {
      console.log('TileLayerEditing, onChange, error:', error)
    }
    // add task to update server and rollback PGlite in case of error
    addOperation({
      table: 'tile_layers',
      rowIdName: 'tile_layer_id',
      rowId: row.tile_layer_id,
      operation: 'update',
      draft: { [name]: valueToSave },
      prev: { ...row },
    })
  }

  return (
    <ErrorBoundary>
      <div className={`${styles.formContainer} form-container-embedded`}>
        <TextField
          label={formatMessage({
            id: 'tileLayerLabel',
            defaultMessage: 'Bezeichnung',
          })}
          name="label"
          value={row.label ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'tileLayerUrlTemplate',
            defaultMessage: 'URL-Vorlage',
          })}
          name="url_template"
          value={row.url_template ?? ''}
          onChange={onChange}
          validationMessage={formatMessage({
            id: 'tileLayerUrlTemplateHint',
            defaultMessage:
              'z.B. https://base.map/{z}/{x}/{y}.png — mit {z}/{x}/{y}, {s} und {r}. Api-Schlüssel liegen in der URL und sind öffentlich',
          })}
        />
        <TextField
          label={formatMessage({
            id: 'tileLayerSubdomains',
            defaultMessage: 'Subdomains (kommagetrennt)',
          })}
          name="subdomains"
          value={
            (row.subdomains as string[] | null | undefined)?.join(', ') ?? ''
          }
          onChange={onChange}
          validationMessage={formatMessage({
            id: 'tileLayerSubdomainsHint',
            defaultMessage: 'z.B. a, b, c, d — leer: abc',
          })}
        />
        <TextField
          label={formatMessage({
            id: 'tileLayerMaxNativeZoom',
            defaultMessage: 'Max Native Zoom',
          })}
          name="max_native_zoom"
          value={row.max_native_zoom ?? ''}
          onChange={onChange}
          type="number"
          min={0}
          max={30}
          validationMessage={formatMessage({
            id: 'tileLayerMaxNativeZoomHint',
            defaultMessage:
              'Höchste Zoomstufe des Anbieters. Darüber wird gestreckt',
          })}
        />
        <TextField
          label={formatMessage({
            id: 'tileLayerAttribution',
            defaultMessage: 'Attribution',
          })}
          name="attribution"
          value={row.attribution ?? ''}
          onChange={onChange}
        />
        <SwitchField
          label={formatMessage({
            id: 'tileLayerIsBackground',
            defaultMessage: 'Hintergrundkarte',
          })}
          name="is_background"
          value={row.is_background}
          onChange={onChange}
          hint={formatMessage({
            id: 'tileLayerIsBackgroundHint',
            defaultMessage:
              'Wird im Abschnitt Hintergrundkarte als Basiskarte angeboten statt als stapelbarer Layer',
          })}
        />
      </div>
    </ErrorBoundary>
  )
}
