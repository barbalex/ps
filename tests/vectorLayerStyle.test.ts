import { expect, it } from 'vitest'
import { vectorLayerDisplayToProperties } from '../src/modules/vectorLayerDisplayToProperties.ts'

it('respects disabled polygon stroke and fill and zero opacity in saved displays', () => {
  expect(
    vectorLayerDisplayToProperties({
      vectorLayerDisplay: {
        stroke: false,
        fill: false,
        fill_opacity_percent: 0,
      },
      presentation: { opacity_percent: 80 },
    }),
  ).toMatchObject({ stroke: false, fill: false, opacity: 0.8, fillOpacity: 0 })
  expect(
    vectorLayerDisplayToProperties({
      vectorLayerDisplay: { fill: true },
      presentation: { opacity_percent: 0 },
    }),
  ).toMatchObject({ fill: true, opacity: 0, fillOpacity: 0 })
})
