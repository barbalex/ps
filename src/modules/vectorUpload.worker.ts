import initGdal from 'gdal3.js'
import wasm from 'gdal3.js/dist/package/gdal3WebAssembly.wasm?url'
import data from 'gdal3.js/dist/package/gdal3WebAssembly.data?url'
import { unzipSync } from 'fflate'
import { kmlWithFolders, type Folder, type Root } from '@tmcw/togeojson'
import { DOMParser, onErrorStopParsing } from '@xmldom/xmldom'
import type { Feature, FeatureCollection } from 'geojson'
import type {
  SourceLayer,
  VectorRequest,
  VectorResponse,
} from './vectorUpload.ts'

const gdal = () =>
  initGdal({
    useWorker: false,
    paths: { wasm, data },
    env: {
      GDAL_SKIP: 'VRT OGR_VRT WMTS',
      PROJ_NETWORK: 'OFF',
      OGR_SQLITE_LIST_ALL_TABLES: 'NO',
    },
  })
type Dataset = Awaited<
  ReturnType<Awaited<ReturnType<typeof gdal>>['open']>
>['datasets'][number]
const sources: { dataset: Dataset; layer: SourceLayer; ogrName: string }[] = []
const kmlSources: { layer: SourceLayer; features: Feature[] }[] = []
let input: File

function inspectKml(xml: string, name: string) {
  const doc = new DOMParser({ onError: onErrorStopParsing }).parseFromString(
    xml,
    'application/xml',
  )
  const visit = (group: Root | Folder, path: string) => {
    const features: Feature[] = []
    for (const child of group.children) {
      if (child.type === 'folder')
        visit(child, `${path} / ${child.meta.name ?? '(folder)'}`)
      else if (child.geometry)
        features.push({ ...child, geometry: child.geometry })
      else throw new Error('Empty or missing KML placemark geometry')
    }
    if (features.length)
      kmlSources.push({
        layer: { name: path, fields: [...new Set(features.flatMap((f) => Object.keys(f.properties ?? {})))], csv: false, needsCrs: false },
        features,
      })
  }
  visit(kmlWithFolders(doc), name)
}

async function inspect(file: File) {
  if (file.size > 64 * 1024 ** 2)
    throw new Error('Maximum input file size: 64 MiB')
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (
    !ext ||
    !['gpkg', 'zip', 'geojson', 'json', 'kml', 'kmz', 'gpx', 'csv'].includes(
      ext,
    )
  ) {
    throw new Error('Unsupported GIS file format')
  }
  if (ext === 'kml') {
    inspectKml(await file.text(), file.name)
    if (!kmlSources.length) throw new Error('No vector features found in KML')
    return kmlSources.map((s) => s.layer)
  }
  const csv = ext === 'csv'
  input = new File([file], `source.${ext === 'kmz' ? 'zip' : ext}`)
  const datasets: { dataset: Dataset; prefix: string }[] = []
  if (ext === 'zip' || ext === 'kmz') {
    const members = new Set<string>()
    let total = 0
    // Read the ZIP directory only. GDAL reads selected members through VSI;
    // nothing is extracted to the user's filesystem or sent to a service.
    const kmlMembers = unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter(entry) {
        total += entry.originalSize
        if (total > 256 * 1024 ** 2)
          throw new Error('Maximum expanded archive size: 256 MiB')
        const path = entry.name
        if (
          path.startsWith('/') ||
          path.includes('\\') ||
          path.split('/').includes('..')
        ) {
          throw new Error('Invalid path in GIS archive')
        }
        if (!path.startsWith('__MACOSX/')) {
          if (ext === 'kmz' ? /\.kml$/i.test(path) : /\.shp$/i.test(path))
            members.add(path)
          if (ext === 'zip') {
            const dir = path.match(/^(.+?\.gdb)\/[^/]+\.gdbtable$/i)?.[1]
            if (dir) members.add(dir)
          }
        }
        return ext === 'kmz' && members.has(path)
      },
    })
    if (!members.size) throw new Error('No vector dataset found in archive')
    if (ext === 'kmz') {
      for (const [path, bytes] of Object.entries(kmlMembers))
        inspectKml(new TextDecoder().decode(bytes), path)
      if (!kmlSources.length) throw new Error('No vector features found in KMZ')
      return kmlSources.map((s) => s.layer)
    }
    const api = await gdal()
    // open mounts the File in WORKERFS even if the archive root is not
    // itself a dataset (e.g. nested shapefiles). Then open the real members.
    try {
      const mounted = await api.open(input, [], ['vsizip'])
      for (const dataset of mounted.datasets) await api.close(dataset)
    } catch (error) {
      if (!Array.isArray(error)) throw error
    }
    for (const path of members) {
      const result = await api.open(
        `/input/${input.name}/${path}`,
        [],
        ['vsizip'],
      )
      for (const dataset of result.datasets)
        datasets.push({ dataset, prefix: members.size > 1 ? `${path} / ` : '' })
    }
  } else {
    const api = await gdal()
    const result = await api.open(
      input,
      csv ? ['HEADERS=YES', 'AUTODETECT_TYPE=YES', 'GEOM_POSSIBLE_NAMES=WKT'] : [],
    )
    for (const dataset of result.datasets)
      datasets.push({ dataset, prefix: '' })
  }
  const api = await gdal()
  for (const { dataset, prefix } of datasets) {
    const info = (await api.ogrinfo(dataset, ['-so', '-al'])) as {
      layers: {
        name: string
        fields: { name: string }[]
        geometryFields?: { type: string; coordinateSystem?: object | null }[]
        featureCount?: number
      }[]
    }
    for (const layer of info.layers) {
      if (layer.featureCount === 0 || (!csv && !layer.geometryFields?.length))
        continue
      const csvWkt = csv && layer.fields.some((f) => f.name.toUpperCase() === 'WKT')
      sources.push({
        dataset,
        ogrName: layer.name,
        layer: {
          name: prefix + (layer.name === 'source' ? file.name : layer.name),
          csv: csv && !csvWkt,
          csvWkt,
          fields: layer.fields.map((f) => f.name),
          needsCrs: csv || !layer.geometryFields?.[0]?.coordinateSystem,
        },
      })
    }
  }
  if (!sources.length) throw new Error('No non-empty vector layers found')
  return sources.map((s) => s.layer)
}

async function handle(request: VectorRequest): Promise<VectorResponse> {
  if ('geoPackage' in request) {
    const api = await gdal()
    const { datasets: [source] } = await api.open(request.geoPackage)
    const output = await api.ogr2ogr(source, ['-f', 'GPKG', '-nlt', 'GEOMETRY'], 'export')
    const bytes = await api.getFileBytes(output)
    return { output: new Blob([new Uint8Array(bytes)], { type: 'application/geopackage+sqlite3' }) }
  }
  if ('file' in request) return { layers: await inspect(request.file) }
  const { index, x, y, sourceCrs } = request.read
  if (kmlSources[index]) return { features: kmlSources[index].features }
  const { dataset, ogrName, layer } = sources[index]
  const api = await gdal()
  let source = dataset
  if (layer.csv) {
    if (x === y || ![x, y].every((col) => layer.fields.includes(col)))
      throw new Error('Select distinct X and Y columns')
    source = (
      await api.open(input, [
        'HEADERS=YES',
        'AUTODETECT_TYPE=YES',
        `X_POSSIBLE_NAMES=${x}`,
        `Y_POSSIBLE_NAMES=${y}`,
      ])
    ).datasets[0]
  }
  if (layer.needsCrs && !/^EPSG:[1-9]\d*$/i.test(sourceCrs))
    throw new Error('Enter the source CRS as EPSG:code')
  const output = await api.ogr2ogr(
    source,
    [
      '-f',
      'GeoJSON',
      '-dim',
      'XY',
      '-nlt',
      'CONVERT_TO_LINEAR',
      ...(layer.needsCrs ? ['-s_srs', sourceCrs] : []),
      '-t_srs',
      'EPSG:4326',
      '-dialect',
      'OGRSQL',
      '-sql',
      `SELECT * FROM "${ogrName.replaceAll('"', '""')}"`,
    ],
    crypto.randomUUID(),
  )
  const bytes = await api.getFileBytes(output)
  if (layer.csv) await api.close(source)
  const collection: FeatureCollection = JSON.parse(
    new TextDecoder().decode(bytes),
  )
  if (
    !collection.features?.length ||
    collection.features.some((f) => !f.geometry)
  )
    throw new Error('Empty or missing feature geometry')
  return { features: collection.features }
}

self.onmessage = async ({ data }: MessageEvent<VectorRequest>) => {
  try {
    self.postMessage(await handle(data))
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
