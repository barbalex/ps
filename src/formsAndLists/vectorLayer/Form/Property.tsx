import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdRefresh } from 'react-icons/md'

import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import {
  builtInDisplayByProperties,
  ownTableToFieldsTable,
} from '../../../modules/displayByProperty.ts'
import {
  beginCapabilitiesFetch,
  endCapabilitiesFetch,
} from '../../../modules/capabilitiesFetchGuard.ts'
import { WFS_MAX_DISPLAY_VALUES } from '../../../modules/wfsDisplayByProperty.ts'
import { upsertVectorLayerDisplaysForVectorLayer } from './upsertVectorLayerDisplaysForVectorLayer.ts'
import {
  cacheWfsLayerFields,
  reReadWfsDisplayBy,
  setWfsDisplayByProperty,
  type WfsDisplaysResult,
} from './syncWfsLayerDisplays.ts'
import {
  addNotificationAtom,
  addOperationAtom,
  removeNotificationAtom,
} from '../../../store.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type WfsServices from '../../../models/public/WfsServices.ts'
import type { FieldChangeData } from '../../../components/shared/fieldChange.ts'
import styles from './Property.module.css'

const { Button, Spinner } = fluentUiReactComponents

export const Property = ({
  vectorLayer,
}: {
  vectorLayer: VectorLayers
  from?: string
}) => {
  const { projectId, vectorLayerId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const removeNotification = useSetAtom(removeNotificationAtom)
  const { formatMessage } = useIntl()
  const displayByLabel = formatMessage({
    id: 'Vy5WzB',
    defaultMessage: 'Anzeigen nach',
  })
  const displayByHint = formatMessage({
    id: 'Wz6XaC',
    defaultMessage:
      'Für jeden eindeutigen Wert dieses Felds wird eine Kartenanzeige generiert',
  })

  // fields are stored per real table, not per own_table view
  // (observation layers style the observations table)
  const { tableName, level } = ownTableToFieldsTable(
    vectorLayer?.own_table,
    vectorLayer?.own_table_level,
  )
  // level null: the fields span all levels (observations_to_assess etc.)
  const hasLevel = level != null

  const db = usePGlite()
  // get fields of table
  const res = useLiveQuery(
    `
    SELECT
      field_id,
      field_label AS label,
      name AS value
    FROM fields
    WHERE
      table_name = $1
      AND project_id = $2
      ${hasLevel ? 'AND level = $3' : ''}
    ORDER BY table_name, name, level`,
    hasLevel ? [tableName, projectId, level] : [tableName, projectId],
  )
  const options = ((res?.rows ?? []) as { label: string; value: string }[]).map(
    ({ label, value }) => ({
      label,
      value,
    }),
  )
  // real table columns that are not fields, e.g. observations.absence
  const builtInOptions = (
    builtInDisplayByProperties[vectorLayer?.own_table ?? ''] ?? []
  ).map((name) => ({
    label:
      name === 'absence' ?
        formatMessage({
          id: 'vldAbsenceCol',
          defaultMessage: 'Absenz (Spalte)',
        })
      : name,
    value: name,
  }))

  // wfs layers have no fields table: their fields are the schema's, read from
  // the service and cached in vector_layers.properties
  const isWfs = vectorLayer?.type === 'wfs'
  const wfsLayerId = vectorLayer?.vector_layer_id ?? null
  const wfsTypeName = vectorLayer?.wfs_service_layer_name ?? null
  const wfsFieldsCached = Array.isArray(vectorLayer?.properties)
  const serviceRes = useLiveQuery(
    `SELECT url, version FROM wfs_services WHERE wfs_service_id = $1`,
    [vectorLayer?.wfs_service_id ?? null],
  )
  const wfsService = serviceRes?.rows?.[0] as
    Pick<WfsServices, 'url' | 'version'> | undefined
  const wfsServiceUrl = wfsService?.url
  const wfsServiceVersion = wfsService?.version ?? null
  const wfsArgs =
    wfsLayerId && wfsServiceUrl ?
      {
        vectorLayerId: wfsLayerId,
        service: { url: wfsServiceUrl, version: wfsServiceVersion },
      }
    : null
  // a failed read shows no fields (instead of "reading" forever)
  const [wfsFieldsFailed, setWfsFieldsFailed] = useState(false)
  // a read of fields or values from the service is running
  const [busy, setBusy] = useState(false)
  const readingWfsFields =
    isWfs && !!wfsTypeName && !wfsFieldsCached && !wfsFieldsFailed

  useEffect(() => {
    if (!isWfs || !wfsLayerId || !wfsTypeName || !wfsServiceUrl) return
    if (wfsFieldsCached) return
    // the form is mounted twice when the map drawer and the route form are open
    const key = `wfs-fields:${wfsLayerId}`
    if (!beginCapabilitiesFetch(key)) return
    setWfsFieldsFailed(false)
    cacheWfsLayerFields({
      vectorLayerId: wfsLayerId,
      service: { url: wfsServiceUrl, version: wfsServiceVersion },
    })
      .catch((error: unknown) => {
        console.error('Property: reading the wfs fields failed', error)
        setWfsFieldsFailed(true)
        addNotification({
          title: formatMessage({
            id: 'vectorLayer.wfs.fieldsUnreadable',
            defaultMessage: 'Die Felder des WFS konnten nicht gelesen werden',
          }),
          body: error instanceof Error ? error.message : String(error),
          intent: 'error',
        })
      })
      .finally(() => endCapabilitiesFetch(key))
  }, [
    isWfs,
    wfsLayerId,
    wfsTypeName,
    wfsServiceUrl,
    wfsServiceVersion,
    wfsFieldsCached,
    addNotification,
    formatMessage,
  ])

  // reads from the service and reports what that led to
  const readFromWfs = async (
    read: () => Promise<WfsDisplaysResult>,
    field: string | null,
    // the outcome of an explicit re-read is announced. Choosing a field needs
    // no announcement: the displays show in the layer's list
    announceOutcome: boolean,
  ) => {
    setBusy(true)
    const notificationId = (await addNotification({
      title: formatMessage({
        id: 'vectorLayer.wfs.reading',
        defaultMessage: 'Lese Felder und Werte vom WFS…',
      }),
      intent: 'info',
      paused: true,
    })) as string
    let result: WfsDisplaysResult
    try {
      result = await read()
    } catch (error) {
      console.error('Property: reading from the wfs failed', error)
      result = {
        ok: false,
        reason: 'unreadable',
        message: error instanceof Error ? error.message : String(error),
      }
    }
    removeNotification(notificationId)
    setBusy(false)

    if (!result.ok) {
      addNotification({
        title:
          result.reason === 'tooManyValues' ?
            formatMessage(
              {
                id: 'vectorLayer.wfs.tooManyValues',
                defaultMessage:
                  'Das Feld «{field}» hat mehr als {max} verschiedene Werte. Bitte ein Feld mit weniger Werten wählen.',
              },
              { field, max: WFS_MAX_DISPLAY_VALUES },
            )
          : formatMessage(
              {
                id: 'vectorLayer.wfs.valuesUnreadable',
                defaultMessage:
                  'Die Werte des Felds «{field}» konnten nicht gelesen werden',
              },
              { field },
            ),
        // the service's answer, for tracking down why
        ...(result.reason === 'unreadable' ? { body: result.message } : {}),
        intent: 'error',
      })
    } else if (!result.complete) {
      // the service did not deliver the values: those of the loaded features
      // were used
      addNotification({
        title: formatMessage({
          id: 'vectorLayer.wfs.valuesIncomplete',
          defaultMessage: 'Der WFS liefert die Werte nicht vollständig',
        }),
        body: formatMessage({
          id: 'vectorLayer.wfs.valuesIncompleteBody',
          defaultMessage:
            'Verwendet wurden die Werte der aktuell geladenen Objekte. Fehlende Werte kannst du als Anzeige von Hand ergänzen.',
        }),
        intent: 'warning',
      })
    } else if (announceOutcome) {
      addNotification({
        title:
          !field ?
            formatMessage({
              id: 'vectorLayer.wfs.fieldsReRead',
              defaultMessage: 'Felder neu gelesen',
            })
          : result.created ?
            formatMessage(
              {
                id: 'vectorLayer.wfs.created',
                defaultMessage: 'Neue Anzeigen: {count}',
              },
              { count: result.created },
            )
          : formatMessage({
              id: 'vectorLayer.wfs.noneCreated',
              defaultMessage: 'Keine neuen Werte',
            }),
        intent: 'info',
      })
    }
  }

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    data?: FieldChangeData,
  ) => {
    const { value } = getValueFromChange(e, data)
    // the form also renders outside vector-layer routes (map drawer), where
    // params carry no vectorLayerId — the row prop is the source of truth
    const rowId = vectorLayer?.vector_layer_id ?? vectorLayerId
    const prevRes = await db.query(
      `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
      [rowId],
    )
    const prev = (prevRes?.rows?.[0] ?? vectorLayer) as VectorLayers

    // wfs: the values come from the service. They are read before anything is
    // written, so a field with too many values leaves the layer untouched
    if (prev.type === 'wfs') {
      const field = (value as string | null) ?? null
      if (wfsArgs) {
        await readFromWfs(
          () =>
            setWfsDisplayByProperty({ ...wfsArgs, displayByProperty: field }),
          field,
          false,
        )
      }
      return
    }

    const updated = { ...prev, display_by_property: (value as string) ?? null }
    if (prev.type === 'upload') {
      // Check cardinality before committing the new field; an ID column can
      // have a distinct value (and otherwise a queued display) for every row.
      const result = await upsertVectorLayerDisplaysForVectorLayer({
        vectorLayer: updated,
      })
      if (result === 'tooManyValues') {
        addNotification({
          title: formatMessage(
            {
              id: 'vectorLayer.wfs.tooManyValues',
              defaultMessage:
                'Das Feld «{field}» hat mehr als {max} verschiedene Werte. Bitte ein Feld mit weniger Werten wählen.',
            },
            { field: value as string, max: WFS_MAX_DISPLAY_VALUES },
          ),
          intent: 'warning',
        })
        return
      }
    }

    await db.query(
      `UPDATE vector_layers SET display_by_property = $1 WHERE vector_layer_id = $2`,
      [value, rowId],
    )
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: rowId as string,
      operation: 'update',
      draft: {
        display_by_property: value,
      },
      prev: prev as unknown as Record<string, unknown>,
    })
    // set vector_layer_displays
    // pass the updated row: prev still holds the old display_by_property
    if (prev.type !== 'upload')
      await upsertVectorLayerDisplaysForVectorLayer({ vectorLayer: updated })
  }

  // the service's data changes: the fields and the values of the field are
  // read anew
  const onReRead = async () => {
    if (!wfsArgs) return
    await readFromWfs(
      () => reReadWfsDisplayBy(wfsArgs),
      vectorLayer?.display_by_property ?? null,
      true,
    )
  }

  const cachedPropertyOptions =
    (isWfs || vectorLayer?.type === 'upload') && wfsFieldsCached ?
      (vectorLayer.properties as string[]).map((name) => ({
        label: name,
        value: name,
      }))
    : []
  const allOptions = [...options, ...builtInOptions, ...cachedPropertyOptions]
  // the values of a wfs layer are read live from the service
  const wfsHint =
    isWfs ?
      `${displayByHint}. ${formatMessage({
        id: 'vectorLayer.wfs.displayByHint',
        defaultMessage:
          'Die Werte werden vom WFS gelesen. Neue Werte erscheinen nach «Felder und Werte neu lesen» als eigene Anzeige',
      })}`
    : displayByHint

  const reReadButton =
    wfsArgs ?
      <Button
        className={styles.reReadButton}
        size="small"
        appearance="transparent"
        icon={busy ? <Spinner size="tiny" /> : <MdRefresh />}
        disabled={busy}
        onClick={onReRead}
      >
        {formatMessage({
          id: 'vectorLayer.wfs.reRead',
          defaultMessage: 'Felder und Werte neu lesen',
        })}
      </Button>
    : null

  // console.log('VectorLayerForm.PropertyField, fields:', fields)

  if (!allOptions.length) {
    return (
      <>
        <TextField
          label={displayByLabel}
          placeholder={
            readingWfsFields ?
              formatMessage({
                id: 'vectorLayer.wfs.readingFields',
                defaultMessage: 'Felder werden gelesen…',
              })
            : formatMessage({
                id: 'Xa7YbD',
                defaultMessage: 'keine Felder gefunden',
              })
          }
          hint={isWfs ? wfsHint : displayByHint}
          disabled
        />
        {reReadButton}
      </>
    )
  }

  return (
    <>
      <DropdownFieldOptions
        label={displayByLabel}
        name="display_by_property"
        value={vectorLayer.display_by_property}
        onChange={onChange}
        options={allOptions}
        validationMessage={isWfs ? wfsHint : displayByHint}
      />
      {reReadButton}
    </>
  )
}
