// shared between the preview's isReactDocViewable allowlist (index.tsx) and
// the custom renderers' fileTypes (renderers.tsx) — both must list a
// mimetype for it to preview using the uploaded file's recorded type

export const markdownMimetypes = [
  'text/markdown',
  'text/x-markdown',
] as const

export const audioMimetypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/flac',
  'audio/webm',
] as const
