// @vitest-environment happy-dom
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SafeHtml } from '../src/components/shared/SafeHtml.tsx'

/**
 * A wms answers text/html with whatever it likes — a canton sends its whole portal
 * page, stylesheet and script tags included. SafeHtml builds that html as react
 * elements instead of setting it, so only what feature info needs reaches the page.
 */

const render = (html: string) =>
  renderToStaticMarkup(createElement(SafeHtml, { html }))

describe('SafeHtml', () => {
  it('shows the table a wms delivers its attributes in', () => {
    expect(
      render(`<!DOCTYPE html>
<head><title>Information</title><style>table, th, td { border: 1px solid black }</style></head>
<table>
  <tr><th>Zone</th><td>2</td></tr>
  <tr><th>Kalender</th><td><a href="https://www.riehen.ch/abfallkalender">abfallkalender</a></td></tr>
</table>`),
    ).toBe(
      '<div><table><tbody><tr><th>Zone</th><td>2</td></tr><tr><th>Kalender</th><td><a href="https://www.riehen.ch/abfallkalender" target="_blank" rel="noopener noreferrer">abfallkalender</a></td></tr></tbody></table></div>',
    )
  })

  it('leaves out the stylesheet, scripts and layout of the portal page around them', () => {
    // happy-dom's DOMParser is not inert like a browser's: it logs an error
    // about the stylesheet it is not allowed to load
    const page = render(`<html>
  <head>
    <link href="https://static.ag.ch/global/stylesheets/global.css" rel="stylesheet">
    <meta http-equiv="refresh" content="0; url=https://evil.example">
    <script>window.agsw = window.agsw || {};</script>
  </head>
  <body onload="alert(1)">
    <nav><a href="/">Home</a></nav>
    <table class="datalist" style="position: fixed; inset: 0"><tr><td class="first">Siedlungslandschaften</td></tr></table>
  </body>
</html>`)

    expect(page).toBe(
      '<div><a>Home</a><table><tbody><tr><td>Siedlungslandschaften</td></tr></tbody></table></div>',
    )
  })

  it('does not pass event handlers, other addresses and foreign content', () => {
    const markup = render(`
<p onclick="alert(1)">ok</p>
<a href="javascript:alert(1)">one</a>
<a href=" jAvAsCrIpT:alert(1)">two</a>
<a href="data:text/html,<script>alert(1)</script>">three</a>
<img src="x.png" onerror="alert(1)">
<img src="https://example.ch/a.png" alt="A" width="50" height="0">
<svg><script>alert(1)</script><circle onload="alert(1)"/></svg>
<math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>
<iframe src="https://evil.example"></iframe>
<form><input name="a"><button>Go</button></form>`)

    expect(markup).toBe(
      '<div><p>ok</p><a>one</a><a>two</a><a>three</a><img src="https://example.ch/a.png" alt="A" loading="lazy" referrerPolicy="no-referrer" width="50"/></div>',
    )
  })

  it('shows text as text', () => {
    expect(
      render('<p>&lt;img src=x onerror=alert(1)&gt; &amp; &quot;b&quot;</p>'),
    ).toBe(
      '<div><p>&lt;img src=x onerror=alert(1)&gt; &amp; &quot;b&quot;</p></div>',
    )
  })

  it('keeps inline spacing and the layout attributes of tables', () => {
    expect(
      render(
        '<p>a <b>bold</b> <span>i</span></p><table><tr><td colspan="2" rowspan="3">x</td><th scope="col">y</th><td colspan="aller">z</td></table>',
      ),
    ).toBe(
      '<div><p>a <b>bold</b> <span>i</span></p><table><tbody><tr><td colSpan="2" rowSpan="3">x</td><th scope="col">y</th><td>z</td></tr></tbody></table></div>',
    )
  })

  it('drops the indentation of the source, not the spaces between words', () => {
    expect(render('<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>')).toBe(
      '<div><ul><li>a</li><li>b</li></ul></div>',
    )
    expect(render('<p>a <b>b</b> <i>c</i></p>')).toBe(
      '<div><p>a <b>b</b> <i>c</i></p></div>',
    )
  })

  it('links http, https and mailto — relative addresses have no base', () => {
    expect(
      render(
        '<p><a href="mailto:info@example.ch">mail</a><a href="/docs/x.pdf">doc</a><a href="HTTPS://EXAMPLE.CH/A">up</a></p>',
      ),
    ).toBe(
      '<div><p><a href="mailto:info@example.ch" target="_blank" rel="noopener noreferrer">mail</a><a>doc</a><a href="https://example.ch/A" target="_blank" rel="noopener noreferrer">up</a></p></div>',
    )
  })

  it('leaves out images without an address that can be loaded', () => {
    expect(
      render(
        '<p>x</p><img src="data:image/png;base64,AAAA" alt="inline"><img alt="none">',
      ),
    ).toBe('<div><p>x</p></div>')
  })

  it('lets wrappers that are not rendered give way to their children', () => {
    expect(
      render(
        '<font color="red"><center><section>a<br>b</section></center></font>',
      ),
    ).toBe('<div>a<br/>b</div>')
  })

  it('renders a class name for the styles of the consumer', () => {
    expect(
      renderToStaticMarkup(
        createElement(SafeHtml, { html: '<p>x</p>', className: 'text' }),
      ),
    ).toBe('<div class="text"><p>x</p></div>')
  })
})
