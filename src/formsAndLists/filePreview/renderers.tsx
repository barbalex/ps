import Markdown from '../../components/shared/Markdown.tsx'
import { textFileLoader } from '@cyntler/react-doc-viewer'
import type { DocRenderer } from '@cyntler/react-doc-viewer'

import { audioMimetypes, markdownMimetypes } from './mimetypes.ts'
import styles from './index.module.css'

// markdown via react-markdown: it renders to React elements instead of
// dangerouslySetInnerHTML, so collaborator-uploaded files cannot inject
// markup (rehype-raw deliberately stays out). remark-gfm adds tables,
// strikethrough and task lists, as in editable Markdown fields.
export const markdownRenderer: DocRenderer = ({ mainState }) => {
  const fileData = mainState.currentDocument?.fileData
  return (
    <div className={styles.markdown}>
      <Markdown source={String(fileData ?? '')} />
    </div>
  )
}
markdownRenderer.fileTypes = ['md', 'markdown', ...markdownMimetypes]
markdownRenderer.weight = 0
markdownRenderer.fileLoader = textFileLoader

// audio: the native element streams from the uri, so no file data needs
// loading — the no-op loader mirrors the library's office renderer
export const audioRenderer: DocRenderer = ({ mainState }) => {
  const uri = mainState.currentDocument?.uri
  if (!uri) return null
  return (
    <div className={styles.audio}>
      <audio controls src={uri} />
    </div>
  )
}
audioRenderer.fileTypes = [...audioMimetypes]
audioRenderer.weight = 0
audioRenderer.fileLoader = ({ fileLoaderComplete }) => fileLoaderComplete()
