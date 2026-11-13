// from the individual packages, not the @fluentui/react-components barrel:
// this module is part of the eager entry, and any import from the barrel
// keeps re-export bindings to every fluent package alive — pulling the
// whole suite into the entry chunk
import { createLightTheme, createDarkTheme } from '@fluentui/react-theme'
import type { BrandVariants, Theme } from '@fluentui/react-theme'

const brandRamp: BrandVariants = {
  10: '#020400',
  20: '#111C07',
  30: '#172F0C',
  40: '#1A3D0C',
  50: '#1D4B0A',
  60: '#205A06',
  70: '#216900',
  80: 'rgb(55, 118, 28)',
  90: '#4C8333',
  100: '#609049',
  110: '#739E5E',
  120: '#86AB73',
  130: '#9AB889',
  140: '#ADC69F',
  150: '#C0D3B5',
  160: '#D4E1CC',
}

// https://fonts.google.com/knowledge/glossary/system_font_web_safe_font
// system-ui: doesn't need to be downloaded, looks consistent with the rest of the OS
// but: is different on different OSes
export const lightTheme: Theme = {
  ...createLightTheme(brandRamp),
  fontFamilyBase: 'system-ui, Helvetica Neue, Helvetica, sans-serif',
  // colorNeutralBackground1: 'transparent',
}

export const darkTheme: Theme = {
  ...createDarkTheme(brandRamp),
  fontFamilyBase: 'system-ui, Helvetica Neue, Helvetica, sans-serif',
}

darkTheme.colorBrandForeground1 = brandRamp[110]
darkTheme.colorBrandForeground2 = brandRamp[120]
