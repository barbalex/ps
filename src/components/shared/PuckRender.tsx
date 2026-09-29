import { Render } from '@puckeditor/core'
import type { Config, Data } from '@puckeditor/core'

/**
 * Puck's Render for viewing saved designs, only reachable through the lazy
 * boundary in lazyPuck.tsx. Kept separate from PuckEditor so viewing a
 * report does not have to load the editor's bundle.
 */
export const PuckRender = ({
  config,
  data,
}: {
  config: Config
  data: Data
}) => <Render config={config} data={data} />
