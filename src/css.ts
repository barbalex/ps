import { createHooks } from '@css-hooks/react'
import { recommended } from '@css-hooks/recommended'

export const [hooks, css] = createHooks(
  recommended({
    // breakpoints: ["500px", "1000px"],
    // colorSchemes: ["dark", "light"],
    pseudoClasses: [':hover', ':focus', ':active', ':disabled'],
  }),
)

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
