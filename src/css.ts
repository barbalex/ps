import { createHooks } from '@css-hooks/react'

export const { styleSheet, on, and, or, not } = createHooks(
  '&:hover',
  '&:focus',
  '&:not(:first-of-type)',
  '&:nth-child(odd)',
  '&:focus-visible',
  '@supports not (field-sizing: content)',
  '@supports (field-sizing: content)',
)
