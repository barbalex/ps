import { createContext } from 'react'

export const POSITRON_LAYER_PRESENTATION_ID =
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
export const DARK_MATTER_LAYER_PRESENTATION_ID =
  'cccccccc-cccc-cccc-cccc-cccccccccccc'

export const ThemeBackground = createContext<string>(
  POSITRON_LAYER_PRESENTATION_ID,
)
