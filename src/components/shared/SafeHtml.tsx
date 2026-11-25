import { createElement, Fragment, type ReactNode } from 'react'

/**
 * Renders html that came from a server as react elements. None of it is set as
 * innerHTML: the elements and attributes feature info needs are built new, so
 * everything else a server sends stays out of the page — a canton's wms answers
 * text/html with its whole portal page, stylesheet and script tags included.
 *
 * Of the rest, wrappers like body, font or section give way to their children,
 * and elements of their own (script, style, svg, form controls, …) are dropped
 * with their content. Links and images need an absolute http(s) address.
 */

// what feature info is made of: text, lists, tables, links, images
const RENDERED = new Set(
  'a b blockquote br caption code col colgroup dd div dl dt em h1 h2 h3 h4 h5 h6 hr i img li ol p pre s small span strong sub sup table tbody td tfoot th thead tr u ul'.split(
    ' ',
  ),
)
// dropped together with their content
const DROPPED = new Set(
  'applet audio base button canvas datalist dialog embed fieldset frame frameset head iframe input link math meta noscript object optgroup option output script select slot source style svg template textarea title track video'.split(
    ' ',
  ),
)
// whitespace between their children is layout, not text
const STRUCTURAL = new Set(
  'colgroup dl ol table tbody tfoot thead tr ul'.split(' '),
)
const DIRS = ['ltr', 'rtl', 'auto']
const SCOPES = ['col', 'row', 'colgroup', 'rowgroup']

const positiveInt = (value: string | null): number | undefined => {
  const number = Number.parseInt(value ?? '', 10)
  return Number.isSafeInteger(number) && number > 0 ? number : undefined
}

// http(s) only — not javascript:, data: or whatever else a server sends.
// Relative addresses are left out too: there is no base to resolve them against
const absoluteUrl = (
  value: string | null,
  schemes: string[],
): string | undefined => {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return schemes.includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

const propsOf = (element: Element): Record<string, unknown> => {
  const tag = element.localName
  const props: Record<string, unknown> = {}
  const title = element.getAttribute('title')
  if (title) props.title = title
  const dir = element.getAttribute('dir')
  if (dir && DIRS.includes(dir)) props.dir = dir

  switch (element.localName) {
    // links open apart from the app, like the ones in the property lists
    case 'a': {
      const href = absoluteUrl(element.getAttribute('href'), [
        'http:',
        'https:',
        'mailto:',
      ])
      if (href) {
        Object.assign(props, {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        })
      }
      break
    }
    case 'td':
    case 'th': {
      const colSpan = positiveInt(element.getAttribute('colspan'))
      if (colSpan) props.colSpan = colSpan
      const rowSpan = positiveInt(element.getAttribute('rowspan'))
      if (rowSpan) props.rowSpan = rowSpan
      const scope = element.getAttribute('scope')?.toLowerCase()
      if (tag === 'th' && SCOPES.includes(scope ?? '')) props.scope = scope
      break
    }
    case 'col':
    case 'colgroup': {
      const span = positiveInt(element.getAttribute('span'))
      if (span) props.span = span
      break
    }
    default:
  }
  return props
}

const image = (element: Element): ReactNode => {
  const src = absoluteUrl(element.getAttribute('src'), ['http:', 'https:'])
  // nothing to show without an address that can be loaded
  if (!src) return undefined
  const props: Record<string, unknown> = {
    src,
    alt: element.getAttribute('alt') ?? '',
    loading: 'lazy',
    referrerPolicy: 'no-referrer',
  }
  const width = positiveInt(element.getAttribute('width'))
  if (width) props.width = width
  const height = positiveInt(element.getAttribute('height'))
  if (height) props.height = height
  return createElement('img', props)
}

// whitespace-only text is the formatting of the source, not a space, when it
// contains a line break or sits between the children of a table or list
const isLayoutWhitespace = (node: ReactNode, structural: boolean): boolean =>
  typeof node === 'string' &&
  !node.trim() &&
  (structural || /[\r\n]/.test(node))

const renderNode = (node: Node): ReactNode => {
  if (node.nodeType === 3) return node.nodeValue
  if (node.nodeType !== 1) return undefined
  const element = node as Element
  const tag = element.localName.toLowerCase()
  if (DROPPED.has(tag)) return undefined
  if (tag === 'img') return image(element)

  const structural = STRUCTURAL.has(tag)
  const children = Array.from(element.childNodes)
    .map(renderNode)
    .filter(
      (child): child is ReactNode =>
        child !== undefined && !isLayoutWhitespace(child, structural),
    )
  if (!RENDERED.has(tag)) {
    return children.length ?
        createElement(Fragment, undefined, ...children)
      : undefined
  }
  return createElement(tag, propsOf(element), ...children)
}

export const SafeHtml = ({
  html,
  className,
}: {
  html: string
  className?: string
}) => {
  const document = new window.DOMParser().parseFromString(html, 'text/html')
  // like any wrapper, body gives way to its children
  return createElement('div', { className }, renderNode(document.body))
}
