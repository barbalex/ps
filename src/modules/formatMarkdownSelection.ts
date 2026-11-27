type Format =
  | 'bold'
  | 'italic'
  | 'paragraph'
  | 'heading'
  | 'subheading'
  | 'bullets'
  | 'numbers'
type Edit = {
  from: number
  to: number
  text: string
  start: number
  end: number
}

export function formatMarkdownSelection(
  source: string,
  start: number,
  end: number,
  format: Format,
): Edit {
  if (format === 'bold' || format === 'italic') {
    const mark = format === 'bold' ? '**' : '*'
    const selected = source.slice(start, end)
    const before = source.slice(0, start).match(/\**$/)![0].length
    const after = source.slice(end).match(/^\**/)![0].length
    const surrounding = Math.min(before, after)
    const remove = format === 'bold' ? surrounding >= 2 : surrounding % 2 === 1
    const shift = remove ? -mark.length : mark.length
    return {
      from: remove ? start - mark.length : start,
      to: remove ? end + mark.length : end,
      text: remove ? selected : mark + selected + mark,
      start: start + shift,
      end: end + shift,
    }
  }
  const from = source.slice(0, start).lastIndexOf('\n') + 1
  const next = source.indexOf(
    '\n',
    end > start && source[end - 1] === '\n' ? end - 1 : end,
  )
  const to = next < 0 ? source.length : next
  const lines = source.slice(from, to).split('\n')
  const remove =
    format === 'bullets' ?
      lines.every((line) => /^[-*+] /.test(line))
    : format === 'numbers' && lines.every((line) => /^\d+[.)] /.test(line))
  const text = lines
    .map((line, i) => {
      const prefix =
        remove || format === 'paragraph' ? ''
        : format === 'heading' ? '## '
        : format === 'subheading' ? '### '
        : format === 'numbers' ? `${i + 1}. `
        : '- '
      return prefix + line.replace(/^(?:#{1,6}|[-*+]|\d+[.)]) /, '')
    })
    .join('\n')
  return {
    from,
    to,
    text,
    start: start === end ? from + text.length : from,
    end: from + text.length,
  }
}

export function applyMarkdownEdit(input: HTMLTextAreaElement, edit: Edit) {
  input.focus()
  input.setSelectionRange(edit.from, edit.to)
  if (input.value.slice(edit.from, edit.to) !== edit.text) {
    // Unlike setRangeText or assigning .value, insertText participates in native Undo.
    const ok = input.ownerDocument.execCommand(
      edit.text ? 'insertText' : 'delete',
      false,
      edit.text,
    )
    if (!ok) throw new Error('The browser could not apply the Markdown edit')
  }
  input.setSelectionRange(edit.start, edit.end)
}
