import DocViewer, { TXTRenderer } from '@cyntler/react-doc-viewer'
import type { ComponentProps } from 'react'

import { audioRenderer, markdownRenderer } from './renderers.tsx'

// the package exports the component but not its props type
type DocViewerProps = ComponentProps<typeof DocViewer>

// wrapper so the custom renderers (and with them react-markdown) stay in
// the lazy chunk index.tsx loads on demand instead of the main bundle
const ViewerWithPlugins = (props: DocViewerProps) => (
  <DocViewer pluginRenderers={[markdownRenderer, audioRenderer, TXTRenderer]} {...props} />
)

export default ViewerWithPlugins
