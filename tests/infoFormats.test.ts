import { describe, expect, it } from 'vitest'

import {
  infoFormatCandidates,
  rankedInfoFormats,
} from '../src/modules/infoFormats.ts'

/**
 * The formats a service advertises decide which one the info drawer asks for first
 * and which ones it falls back through. The lists below are what Swiss services
 * advertised on 2026-11-24.
 */
const GEO_ADMIN = [
  'application/json',
  'application/json; subtype=geojson',
  'application/vnd.ogc.gml',
  'text/plain',
  'text/xml',
  'text/xml; subtype=gml/3.1.1',
  'text/xml; subtype=gml/3.2.1',
]
const AARGAU_GEOSERVER = [
  'application/json',
  'application/vnd.ogc.gml',
  'application/vnd.ogc.gml/3.1.1',
  'text/html',
  'text/plain',
  'text/xml',
  'text/xml; subtype=gml/3.1.1',
]
const BERN_ARCGIS = [
  'application/geo+json',
  'application/vnd.esri.wms_featureinfo_xml',
  'application/vnd.esri.wms_raw_xml',
  'application/vnd.ogc.wms_xml',
  'text/html',
  'text/plain',
  'text/xml',
]
const ZUERICH_WFS = [
  'application/gml+xml; version=3.2',
  'text/xml; subtype=gml/3.2.1',
  'text/xml; subtype=gml/3.1.1',
  'text/xml; subtype=gml/2.1.2',
  'application/json; subtype=geojson',
  'application/json',
  'text/csv',
  'application/shapefile',
]
const GLARUS_WFS = [
  'text/xml; subtype=gml/2.1.2',
  'text/xml; subtype=gml/3.1.1',
  'application/vnd.geo+json',
]

describe('rankedInfoFormats', () => {
  it('puts GeoJSON first, then GML, XML, plain text and html', () => {
    expect(rankedInfoFormats(GEO_ADMIN)).toEqual([
      'application/json; subtype=geojson',
      'application/json',
      'application/vnd.ogc.gml',
      'text/xml; subtype=gml/3.1.1',
      'text/xml; subtype=gml/3.2.1',
      'text/xml',
      'text/plain',
    ])
  })

  it('keeps the advertised order within a rank', () => {
    // arcgis: the compact featureinfo_xml comes before the raw_xml that
    // carries the whole geometry
    expect(rankedInfoFormats(BERN_ARCGIS)).toEqual([
      'application/geo+json',
      'application/vnd.esri.wms_featureinfo_xml',
      'application/vnd.esri.wms_raw_xml',
      'application/vnd.ogc.wms_xml',
      'text/xml',
      'text/plain',
      'text/html',
    ])
  })

  it('ends with formats the drawer can not show', () => {
    expect(rankedInfoFormats(ZUERICH_WFS).slice(-2)).toEqual([
      'text/csv',
      'application/shapefile',
    ])
  })

  it('finds GeoJSON under every name it goes by', () => {
    expect(rankedInfoFormats(GLARUS_WFS)[0]).toBe('application/vnd.geo+json')
    expect(rankedInfoFormats(AARGAU_GEOSERVER)[0]).toBe('application/json')
  })

  it('drops empties, non-strings and the same format twice', () => {
    expect(
      rankedInfoFormats([
        null,
        undefined,
        '',
        '  ',
        42,
        'text/plain',
        'Text/Plain ',
        'application/json',
      ]),
    ).toEqual(['application/json', 'text/plain'])
  })

  it('returns nothing when nothing is advertised', () => {
    expect(rankedInfoFormats([])).toEqual([])
    expect(rankedInfoFormats(null)).toEqual([])
  })
})

describe('infoFormatCandidates', () => {
  const fallback = ['application/json', 'text/plain']

  it('orders the advertised formats, the stored one included', () => {
    expect(
      infoFormatCandidates({
        infoFormat: 'text/plain',
        infoFormats: AARGAU_GEOSERVER,
        fallback,
      }),
    ).toEqual(rankedInfoFormats(AARGAU_GEOSERVER))
  })

  it('keeps a stored format the capabilities no longer list', () => {
    // followed by the default the service does not have
    expect(
      infoFormatCandidates({
        infoFormat: 'application/vnd.ogc.gml',
        infoFormats: ['text/plain'],
        fallback,
      }),
    ).toEqual(['application/vnd.ogc.gml', 'text/plain', 'application/json'])
  })

  it('follows a stored format with the defaults when the service advertises none', () => {
    expect(
      infoFormatCandidates({
        infoFormat: 'text/xml',
        infoFormats: null,
        fallback,
      }),
    ).toEqual(['text/xml', 'application/json', 'text/plain'])
    // nothing at all: the defaults alone
    expect(infoFormatCandidates({ infoFormats: null, fallback })).toEqual(
      fallback,
    )
    // a wfs without formats ends with no outputFormat at all
    expect(
      infoFormatCandidates({
        infoFormat: 'application/json',
        infoFormats: null,
        fallback: [undefined],
      }),
    ).toEqual(['application/json', undefined])
  })
})
