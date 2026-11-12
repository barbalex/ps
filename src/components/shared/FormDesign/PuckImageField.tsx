import { useRef, useState } from 'react'
import type { FieldProps } from '@puckeditor/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches Puck's override signature
type ImageFieldProps = FieldProps<any, any> & {
  children: React.ReactNode
  name: string
  label?: React.ReactNode
  Label?: (props: {
    children: React.ReactNode
    label?: React.ReactNode
    icon?: React.ReactNode
  }) => React.ReactElement
}

// images live inside the design jsonb as data URLs, which syncs to every
// client via the form_designs shape — the cap keeps the design (and the
// operation queue entries writing it) small
const MAX_DIMENSION = 1024
const MAX_DATA_URL_LENGTH = 200_000 // ~150 KB binary
const MIME = 'image/webp'

const compressToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      // step the quality down until below the cap (or give up at 0.3)
      let quality = 0.85
      let dataUrl = canvas.toDataURL(MIME, quality)
      while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.3) {
        quality -= 0.15
        dataUrl = canvas.toDataURL(MIME, quality)
      }
      resolve(dataUrl)
    }
    img.onerror = (event) => {
      URL.revokeObjectURL(url)
      reject(event)
    }
    img.src = url
  })

/**
 * Puck field for the form design's image component: picks a local file,
 * compresses it to a capped webp data URL and stores that inside the
 * design. Registered via Puck's fieldTypes override (type 'image').
 */
export const PuckImageField = ({
  value = '',
  onChange,
  name,
  label,
  Label,
}: ImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const onPick = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setError(null)
    try {
      onChange(await compressToDataUrl(file))
    } catch {
      setError('image could not be processed')
    }
  }

  const input = (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => void onPick(e.target.files)}
      />
      {value ?
        <img
          src={value as string}
          alt=""
          style={{ maxWidth: '100%', maxHeight: 120, display: 'block' }}
        />
      : null}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        choose image…
      </button>
      {value ?
        <button
          type="button"
          onClick={() => onChange('')}
        >
          remove
        </button>
      : null}
      {error ?
        <span>{error}</span>
      : null}
    </div>
  )
  if (!Label) return input
  return <Label label={label ?? name}>{input}</Label>
}
