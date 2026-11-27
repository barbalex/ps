import { useEffect, useRef, useState } from 'react'
import type { Feature } from 'geojson'
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

const { Button, Checkbox, Field, Select, Input } = fluentUiReactComponents

type LayerChoice = {
  file: File
  index: number
  layer: SourceLayer
  name: string
  selected: boolean
  uuidField: string
  x: string
  y: string
  sourceCrs: string
}

export function GisUpload(
  props:
    | { vectorLayerId: string }
    | { target: GeometryTarget; onBusy: (busy: boolean) => void },
) {
  const { formatMessage } = useIntl()
  const reader = useRef<ReturnType<typeof openVectorReader> | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [layers, setLayers] = useState<LayerChoice[]>([])
  const [mode, setMode] = useState<'append' | 'replace'>('append')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(0)
  const selected = layers.filter((c) => c.selected)
  const target = 'target' in props ? props.target : undefined
  useEffect(
    () => () => {
      reader.current?.close()
      reader.current = null
    },
    [],
  )

  function update(choice: LayerChoice, patch: Partial<LayerChoice>) {
    setLayers((prev) =>
      prev.map((c) => (c === choice ? { ...c, ...patch } : c)),
    )
  }
  async function inspect(files: File[]) {
    reader.current?.close()
    reader.current = null
    setLayers([])
    setImported(0)
    setError('')
    setMode('append')
    if (!files.length) return
    setBusy(true)
    const choices: LayerChoice[] = []
    for (const file of files) {
      const current = openVectorReader()
      reader.current = current
      try {
        const list = await current.inspect(file)
        if (reader.current !== current) return
        choices.push(
          ...list.map((layer, index) => ({
            file,
            index,
            layer,
            selected: index === 0,
            name:
              files.length === 1 || layer.name.startsWith(file.name) ?
                layer.name
              : `${file.name} / ${layer.name}`,
            x:
              layer.fields.find((f) =>
                /^(lon(gitude)?|lng|x|easting)$/i.test(f),
              ) ?? '',
            y:
              layer.fields.find((f) => /^(lat(itude)?|y|northing)$/i.test(f)) ??
              '',
            uuidField:
              layer.fields.find(
                (f) =>
                  target &&
                  f.toLowerCase() === `${target.table.slice(0, -1)}_id`,
              ) ??
              layer.fields.find((f) => /^(uuid|id)$/i.test(f)) ??
              '',
            sourceCrs: layer.csv || layer.csvWkt ? 'EPSG:4326' : '',
          })),
        )
        // Keep at most one GDAL heap alive, even for many separate files.
        if (files.length > 1) {
          current.close()
          reader.current = null
        }
      } catch (e) {
        if (reader.current !== current) return
        setError(`${file.name}: ${e instanceof Error ? e.message : String(e)}`)
        current.close()
        reader.current = null
        setBusy(false)
        return
      }
    }
    setLayers(choices)
    setBusy(false)
  }
  async function commit() {
    if (!selected.length || busy) return
    setBusy(true)
    setError('')
    if ('onBusy' in props) props.onBusy(true)
    try {
      const batches: {
        name: string
        uuidField: string
        features: Feature[]
      }[] = []
      for (const file of new Set(selected.map((c) => c.file))) {
        const retained = reader.current
        const current = retained ?? openVectorReader()
        reader.current = current
        try {
          if (!retained) await current.inspect(file)
          for (const {
            index,
            x,
            y,
            sourceCrs,
            name,
            uuidField,
          } of selected.filter((c) => c.file === file)) {
            const features = await current.read({ index, x, y, sourceCrs })
            if (reader.current !== current) return
            batches.push({ name, uuidField, features })
          }
        } finally {
          if (!retained && reader.current === current) {
            current.close()
            reader.current = null
          }
        }
      }
      let count = batches[0].features.length
      if ('target' in props)
        count = await importOwnGeometries(props.target, batches, mode)
      else
        await importVectorFeatures({
          vectorLayerId: props.vectorLayerId,
          features: batches[0].features,
          mode,
        })
      setImported(count)
      setLayers([])
      reader.current?.close()
      reader.current = null
      if (fileInput.current) fileInput.current.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      if ('onBusy' in props) props.onBusy(false)
      setBusy(false)
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
            multiple={!!target}
            ref={fileInput}
            accept=".gpkg,.zip,.geojson,.json,.kml,.kmz,.gpx,.csv"
            disabled={busy}
            onChange={(event) =>
              void inspect(Array.from(event.target.files ?? []))
            }
          />
        )}
      </Field>
      {layers.length > 0 && (
        <>
          {!target && (
            <Field
              label={formatMessage({
                id: 'vectorUploadSourceLayer',
                defaultMessage: 'Ebene aus der Datei',
              })}
            >
              <Select
                disabled={busy}
                value={selected[0]?.index}
                onChange={(_, d) =>
                  setLayers((prev) =>
                    prev.map((c) => ({
                      ...c,
                      selected: c.index === Number(d.value),
                    })),
                  )
                }
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
          )}
          {layers.map((choice, i) => {
            const { layer, x, y, uuidField, sourceCrs } = choice
            return (
              <div
                key={i}
                role="group"
                aria-label={choice.name}
              >
                {target && layers.length > 1 && (
                  <Checkbox
                    label={choice.name}
                    checked={choice.selected}
                    disabled={busy}
                    onChange={(_, d) =>
                      update(choice, { selected: d.checked === true })
                    }
                  />
                )}
                {choice.selected && (
                  <>
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
                            onChange={(_, d) =>
                              update(
                                choice,
                                axis === 'X' ? { x: d.value } : { y: d.value },
                              )
                            }
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
                          defaultMessage:
                            'Koordinatensystem der Quelldaten (EPSG-Code)',
                        })}
                      >
                        <Input
                          disabled={busy}
                          placeholder="EPSG:2056"
                          value={sourceCrs}
                          onChange={(_, d) =>
                            update(choice, { sourceCrs: d.value.trim() })
                          }
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
                          onChange={(_, d) =>
                            update(choice, { uuidField: d.value })
                          }
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
                  </>
                )}
              </div>
            )
          })}
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
              !selected.length ||
              selected.some(
                ({ layer, x, y, sourceCrs }) =>
                  (layer.csv && (!x || !y || x === y)) ||
                  (layer.needsCrs && !/^EPSG:[1-9]\d*$/i.test(sourceCrs)),
              )
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
