import { expect, it } from 'vitest'
import { formatMarkdownSelection } from '../src/modules/formatMarkdownSelection.ts'

it('changes just the selected lines, excluding a trailing newline', () => {
  const source = 'Survey\n- Iris\n- Salix\nNotes'
  const edit = formatMarkdownSelection(
    source,
    8,
    source.indexOf('Notes'),
    'numbers',
  )
  expect(source.slice(0, edit.from) + edit.text + source.slice(edit.to)).toBe(
    'Survey\n1. Iris\n2. Salix\nNotes',
  )
})

it('switches between heading levels and ordinary paragraphs without accumulating markers', () => {
  const sub = formatMarkdownSelection('## Survey', 4, 4, 'subheading')
  expect(sub.text).toBe('### Survey')
  expect(
    formatMarkdownSelection(sub.text, sub.start, sub.end, 'paragraph').text,
  ).toBe('Survey')
})

it('removes just bold when the selection is also italic', () => {
  const source = '***Iris***'
  const edit = formatMarkdownSelection(source, 3, 7, 'bold')
  const next = source.slice(0, edit.from) + edit.text + source.slice(edit.to)
  expect(next).toBe('*Iris*')
  expect(next.slice(edit.start, edit.end)).toBe('Iris')
})
