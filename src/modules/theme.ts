import { createLightTheme, createDarkTheme } from '@fluentui/react-components'
import { brandRampHex } from './brandRamps'

export const customLightTheme = {
  ...createLightTheme(brandRampHex),
  fontFamilyBase: 'Roboto, Helvetica Neue, Helvetica, sans-serif',
}
export const customDarkTheme = {
  ...createDarkTheme(brandRampHex),
  fontFamilyBase: 'Roboto, Helvetica Neue, Helvetica, sans-serif',
}
