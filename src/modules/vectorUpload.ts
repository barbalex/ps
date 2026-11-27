import type { Feature } from 'geojson'

export type SourceLayer = {
  name: string
  fields: string[]
  csv: boolean
  csvWkt?: boolean
  needsCrs: boolean
}
export type ReadVectorOptions = {
  index: number
  sourceCrs: string
  x: string
  y: string
}
export type VectorRequest = { file: File } | { read: ReadVectorOptions } | { geoPackage: File }
export type VectorResponse =
  { layers: SourceLayer[] } | { features: Feature[] } | { error: string } | { output: Blob }

// One worker per file: replacing the file or leaving the form also releases
// GDAL's WASM heap, mounted archive, and temporary converted datasets.
export function openVectorReader() {
  const worker = new Worker(
    new URL('./vectorUpload.worker.ts', import.meta.url),
    { type: 'module' },
  )
  let pending: ((error: Error) => void) | undefined
  const request = (message: VectorRequest) =>
    new Promise<VectorResponse>((resolve, reject) => {
      pending = reject
      worker.onerror = (event) => reject(new Error(event.message))
      worker.onmessage = ({ data }: MessageEvent<VectorResponse>) => {
        pending = undefined
        if ('error' in data) reject(new Error(data.error))
        else resolve(data)
      }
      worker.postMessage(message)
    })
  return {
    geoPackage: async (file: File) => {
      const result = await request({ geoPackage: file })
      if (!('output' in result)) throw new Error('Invalid GeoPackage response')
      return result.output
    },
    inspect: async (file: File) => {
      const result = await request({ file })
      if (!('layers' in result)) throw new Error('Invalid layer catalogue')
      return result.layers
    },
    read: async (read: ReadVectorOptions) => {
      const result = await request({ read })
      if (!('features' in result)) throw new Error('Invalid feature collection')
      return result.features
    },
    close: () => {
      worker.terminate()
      pending?.(new DOMException('Import cancelled', 'AbortError'))
    },
  }
}
