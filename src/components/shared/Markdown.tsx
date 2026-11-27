import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({
  source,
  skipHtml = false,
}: {
  source: string
  skipHtml?: boolean
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml={skipHtml}
    >
      {source}
    </ReactMarkdown>
  )
}
