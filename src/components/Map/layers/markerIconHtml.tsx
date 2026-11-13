import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'
import type { CSSProperties } from 'react'

/**
 * Cached renderToString for map marker icons. pointToLayer runs once per
 * point feature and thousands of features typically share the same handful
 * of icon variants (symbol × size × color), so each distinct variant is
 * rendered only once instead of once per marker.
 *
 * Returns undefined when the symbol does not exist in react-icons/md —
 * callers then fall back to a plain marker (or MdPlace).
 */
const htmlCache = new Map<string, string>()

export const cachedMarkerIconHtml = ({
  symbol,
  className,
  style,
}: {
  symbol: string | null | undefined
  className: string
  style: CSSProperties
}) => {
  if (!symbol) return undefined
  const cacheKey = `${symbol}|${className}|${JSON.stringify(style)}`
  let html = htmlCache.get(cacheKey)
  if (html === undefined) {
    const IconComponent = icons[symbol as keyof typeof icons]
    if (!IconComponent) return undefined
    html = ReactDOMServer.renderToString(
      <IconComponent
        className={className}
        style={style}
      />,
    )
    htmlCache.set(cacheKey, html)
  }
  return html
}
