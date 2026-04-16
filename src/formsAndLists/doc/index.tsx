import { useParams } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { docsMeta } from '../../../docs/metadata.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { languageAtom, type Language } from '../../store.ts'

import '../../../docs/docs.css'

const htmlFiles = import.meta.glob('/docs/docs/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const getHtml = (docId: string, lang: Language): string => {
  const langFile = htmlFiles[`/docs/docs/${docId}_${lang}.html`]
  if (langFile !== undefined) return langFile
  // fallback to German
  return htmlFiles[`/docs/docs/${docId}_de.html`] ?? ''
}

export const Doc = () => {
  const { docId } = useParams({ strict: false })
  const [language] = useAtom(languageAtom)

  const meta = docsMeta.find((d) => d.id === docId)

  if (!meta) {
    return <NotFound table="Doc" id={docId ?? ''} />
  }

  const html = getHtml(docId!, language)

  return (
    <div className="form-outer-container">
      <div className="doc-scroll">
        <div className="doc" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
