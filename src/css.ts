import { createHooks } from '@css-hooks/react'
import { recommended } from '@css-hooks/recommended'

export const { styleSheet, css } = createHooks({
  hooks: {
    // implement breakpoints and color schemes later
    ...recommended({
      // breakpoints: ["500px", "1000px"],
      // colorSchemes: ["dark", "light"],
      pseudoClasses: [':hover', ':focus', ':active', ':disabled'],
    }),
    '&:not(:first-of-type)': '&:not(:first-of-type)',
    '&:nth-child(odd)': '&:nth-child(odd)',
    span: 'span',
    'path:nth-of-type(2)': 'path:nth-of-type(2)',
    '&:before': '&:before',
    '&:first-of-type': '&:first-of-type',
    '&:focus-visible': '&:focus-visible',
  },
})

/* Hooks created:
 - @media (width < 500px)
 - @media (500px <= width < 1000px)
 - @media (1000px <= width)
 - @media (prefers-color-scheme: dark)
 - @media (prefers-color-scheme: light)
 - &:hover
 - &:focus
 - &:disabled
 - &:active
*/
