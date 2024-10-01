import { createHooks } from '@css-hooks/react'

export const {styleSheet,  on, and, or, not} = createHooks('&:hover', '&:focus', '&:not(:first-of-type)', '&:nth-child(odd)', '&:focus-visible')



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
