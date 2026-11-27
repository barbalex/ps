import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import {
  openVectorReader,
  type SourceLayer,
} from '../../modules/vectorUpload.ts'
import { importVectorFeatures } from '../../modules/importVectorFeatures.ts'
import {
  importOwnGeometries,
  type GeometryTarget,
} from '../../modules/importOwnGeometries.ts'

const { Button, Field, Select, Input } = fluentUiReactComponents

export function GisUpload(
  props:
    | { vectorLayerId: string }
    | { target: GeometryTarget; onBusy: (busy: boolean) => void },
) {
  const { formatMessage } = useIntl()
  const reader = useRef<ReturnType<typeof openVectorReader> | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [layers, setLayers] = useState<SourceLayer[]>([])
  const [index, setIndex] = useState(0)
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [sourceCrs, setSourceCrs] = useState('')
  const [uuidField, setUuidField] = useState('')
  const [mode, setMode] = useState<'append' | 'replace'>('append')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(0)
  const layer = layers[index]
  const target = 'target' in props ? props.target : undefined
  useEffect(
    () => () => {
      reader.current?.close()
      reader.current = null
    },
    [],
  )

  function selectLayer(list: SourceLayer[], i: number) {
    setIndex(i)
    const fields = list[i].fields
    if (target && 'rowIds' in target) {
      setUuidField(
        fields.find(
          (f) => f.toLowerCase() === `${target.table.slice(0, -1)}_id`,
        ) ??
          fields.find((f) => /^(uuid|id)$/i.test(f)) ??
          '',
      )
    }
    setX(fields.find((f) => /^(lon(gitude)?|lng|x|easting)$/i.test(f)) ?? '')
    setY(fields.find((f) => /^(lat(itude)?|y|northing)$/i.test(f)) ?? '')
    setSourceCrs(list[i].csv ? 'EPSG:4326' : '')
  }
  async function inspect(file?: File) {
    reader.current?.close()
    reader.current = null
    setLayers([])
    setImported(0)
    setError('')
    setMode('append')
    if (!file) return
    const current = openVectorReader()
    reader.current = current
    setBusy(true)
    try {
      const list = await current.inspect(file)
      if (reader.current !== current) return
      selectLayer(list, 0)
      setLayers(list)
    } catch (e) {
      if (reader.current === current)
        setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (reader.current === current) setBusy(false)
    }
  }
  async function commit() {
    const current = reader.current
    if (!current) return
    setBusy(true)
    setError('')
    if ('onBusy' in props) props.onBusy(true)
    try {
      const features = await current.read({ index, x, y, sourceCrs })
      if (reader.current !== current) return
      let count = features.length
      if ('target' in props)
        count = await importOwnGeometries(
          props.target,
          features,
          uuidField,
          mode,
        )
      else
        await importVectorFeatures({
          vectorLayerId: props.vectorLayerId,
          features,
          mode,
        })
      if (reader.current !== current) return
      setImported(count)
      setLayers([])
      current.close()
      if (fileInput.current) fileInput.current.value = ''
    } catch (e) {
      if (reader.current === current)
        setError(e instanceof Error ? e.message : String(e))
    } finally {
      if ('onBusy' in props) props.onBusy(false)
      if (reader.current === current) setBusy(false)
    }
  }
  return (
    <>
      <Field
        label={formatMessage({
          id: 'vectorUploadFile',
          defaultMessage: 'GIS-Datei auswählen',
        })}
        hint="GeoPackage, Shapefile (.zip), GeoJSON, KML/KMZ, GPX, CSV, File Geodatabase (.gdb.zip) · max. 64 MiB"
      >
        {(controlProps) => (
          <input
            {...controlProps}
            type="file"
            ref={fileInput}
            accept=".gpkg,.zip,.geojson,.json,.kml,.kmz,.gpx,.csv"
            disabled={busy}
            onChange={(event) => void inspect(event.target.files?.[0])}
          />
        )}
      </Field>
      {layer && (
        <>
          <Field
            label={formatMessage({
              id: 'vectorUploadSourceLayer',
              defaultMessage: 'Ebene aus der Datei',
            })}
          >
            <Select
              disabled={busy}
              value={index}
              onChange={(_, d) => selectLayer(layers, Number(d.value))}
            >
              {layers.map((l, i) => (
                <option
                  key={i}
                  value={i}
                >
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
          {layer.csv &&
            (['X', 'Y'] as const).map((axis) => (
              <Field
                key={axis}
                label={formatMessage(
                  {
                    id: 'vectorUploadColumn',
                    defaultMessage: 'Spalte für {axis}',
                  },
                  { axis },
                )}
              >
                <Select
                  disabled={busy}
                  value={axis === 'X' ? x : y}
                  onChange={(_, d) => (axis === 'X' ? setX : setY)(d.value)}
                >
                  <option value="">—</option>
                  {layer.fields.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </Select>
              </Field>
            ))}
          {layer.needsCrs && (
            <Field
              label={formatMessage({
                id: 'vectorUploadCrs',
                defaultMessage: 'Koordinatensystem der Quelldaten (EPSG-Code)',
              })}
            >
              <Input
                disabled={busy}
                placeholder="EPSG:2056"
                value={sourceCrs}
                onChange={(_, d) => setSourceCrs(d.value.trim())}
              />
            </Field>
          )}
          {target && 'rowIds' in target && (
            <Field
              label={formatMessage({
                id: 'geometryImportUuid',
                defaultMessage: 'UUID des Zielobjekts',
              })}
            >
              <Select
                value={uuidField}
                disabled={busy}
                onChange={(_, d) => setUuidField(d.value)}
              >
                <option value="">Feature-ID</option>
                {layer.fields.map((f) => (
                  <option
                    key={f}
                    value={f}
                  >
                    {f}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field
            label={formatMessage({
              id: 'vectorUploadMode',
              defaultMessage: 'Vorhandene Objekte',
            })}
          >
            <Select
              value={mode}
              disabled={busy}
              onChange={(_, d) =>
                setMode(d.value === 'replace' ? 'replace' : 'append')
              }
            >
              <option value="append">
                {target ?
                  formatMessage({
                    id: 'geometryImportAppend',
                    defaultMessage: 'Geometrien zu den Zielobjekten hinzufügen',
                  })
                : formatMessage({
                    id: 'vectorUploadAppend',
                    defaultMessage: 'Behalten und neue Objekte hinzufügen',
                  })
                }
              </option>
              <option value="replace">
                {target ?
                  formatMessage({
                    id: 'geometryImportReplace',
                    defaultMessage: 'Geometrien der Zielobjekte ersetzen',
                  })
                : formatMessage({
                    id: 'vectorUploadReplace',
                    defaultMessage:
                      'Alle durch die importierten Objekte ersetzen',
                  })
                }
              </option>
            </Select>
          </Field>
          <Button
            disabled={
              busy ||
              (layer.csv && (!x || !y || x === y)) ||
              (layer.needsCrs && !/^EPSG:[1-9]\d*$/i.test(sourceCrs))
            }
            onClick={() => void commit()}
          >
            {target ?
              formatMessage({
                id: 'geometryImport',
                defaultMessage: 'Geometrien importieren',
              })
            : formatMessage({
                id: 'vectorUploadImport',
                defaultMessage: 'Ebene importieren',
              })
            }
          </Button>
        </>
      )}
      {busy && (
        <span role="status">
          {formatMessage({
            id: 'vectorUploadBusy',
            defaultMessage: 'Import wird verarbeitet…',
          })}
        </span>
      )}
      {!!imported && (
        <span role="status">
          {formatMessage(
            {
              id: 'vectorUploadDone',
              defaultMessage: 'Importierte Objekte: {count}',
            },
            { count: imported },
          )}
        </span>
      )}
      {error && (
        <span role="alert">
          {formatMessage(
            {
              id: 'vectorUploadFailed',
              defaultMessage: 'Import fehlgeschlagen: {reason}',
            },
            { reason: error },
          )}
        </span>
      )}
    </>
  )
}
