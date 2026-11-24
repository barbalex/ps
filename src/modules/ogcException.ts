// An OGC exception report: what WMS and WFS servers answer instead of features. WMS
// servers deliver it with status 200, and for a format they do not really support
// although they list it.
export type OgcException = {
  message: string
  // the server rejected the requested format — asking for another one can still work
  unsupportedFormat: boolean
}

const REPORT_NAMES = ['exceptionreport', 'serviceexceptionreport']

const childElements = (element: Element): Element[] =>
  Array.from(element.childNodes).filter(
    (node) => node.nodeType === 1,
  ) as Element[]

const textOf = (element: Element | undefined): string =>
  element?.textContent?.trim() ?? ''

const attributeValue = (element: Element, name: string): string => {
  const lower = name.toLowerCase()
  return (
    Array.from(element.attributes).find(
      (attribute) => attribute.localName.toLowerCase() === lower,
    )?.value ?? ''
  )
}

const isFormatProblem = (code: string, locator: string, text: string) =>
  code.toLowerCase() === 'invalidformat' ||
  /(?:info|output)[\s_-]?format/i.test(`${locator} ${text}`)

// the exception report the document holds, or undefined when it is none
export const ogcException = (xml: Document): OgcException | undefined => {
  const root = xml.documentElement
  if (!root || !REPORT_NAMES.includes(root.localName.toLowerCase())) {
    return undefined
  }
  // wms 1.3.0 and wfs: Exception elements holding ExceptionText.
  // wms 1.1.1: ServiceException holds the text itself
  const exceptions = childElements(root)
  const messages = exceptions.map((exception) => {
    const code =
      attributeValue(exception, 'exceptionCode') ||
      attributeValue(exception, 'code')
    const text =
      childElements(exception)
        .map((text) => textOf(text))
        .filter(Boolean)
        .join(' ') || textOf(exception)
    return { code, text, locator: attributeValue(exception, 'locator') }
  })
  const message = messages
    .map(({ code, text }) => [code, text].filter(Boolean).join(': '))
    .filter(Boolean)
    .join(' ')
  return {
    message: message || 'The server answered with an exception report',
    unsupportedFormat: messages.some(({ code, text, locator }) =>
      isFormatProblem(code, locator, text),
    ),
  }
}
