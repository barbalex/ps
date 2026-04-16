import { useParams } from '@tanstack/react-router'

import { docsMeta } from '../../../docs/metadata.ts'
import { NotFound } from '../../components/NotFound.tsx'

import '../../../docs/docs.css'

const htmlFiles = import.meta.glob('/docs/docs/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const Doc = () => {
  const { docId } = useParams({ strict: false })

  const meta = docsMeta.find((d) => d.id === docId)

  if (!meta) {
    return (
      <NotFound
        table="Doc"
        id={docId ?? ''}
      />
    )
  }

  const html = htmlFiles[`/docs/docs/${docId}.html`] ?? ''

  return (
    <div className="form-outer-container">
      <div className="doc-scroll">
        <div
          className="doc"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
