import DocViewer from '@cyntler/react-doc-viewer'
import type { DocViewerProps } from '@cyntler/react-doc-viewer'

import { audioRenderer, markdownRenderer } from './renderers.tsx'

// wrapper so the custom renderers (and with them react-markdown) stay in
// the lazy chunk index.tsx loads on demand instead of the main bundle
const ViewerWithPlugins = (props: DocViewerProps) => (
  <DocViewer pluginRenderers={[markdownRenderer, audioRenderer]} {...props} />
)

export default ViewerWithPlugins
