// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'

import { layersDataFromRequestData } from '../src/components/Map/ClickListener/layersDataFromRequestData.ts'
import { featureXmlToLayersData } from '../src/modules/featureXmlToLayersData.ts'

/**
 * One parser turns the GetFeatureInfo (WMS) and GetFeature (WFS) responses of every
 * server family into drawer entries — it goes by the layout of the payload, not by
 * the format that was asked for. The documents below are shortened copies of what
 * Swiss services and Esri's sample server answered on 2026-11-24.
 */

const GEOSERVER = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:public="http://public">
  <gml:boundedBy><gml:null>unknown</gml:null></gml:boundedBy>
  <gml:featureMember>
    <public:landschaftstypen fid="landschaftstypen.35">
      <public:textur>4</public:textur>
      <public:landschaftstyp>11</public:landschaftstyp>
      <public:landschaftstyp1>Siedlungslandschaften mit städtischer Prägung</public:landschaftstyp1>
      <public:shape>
        <gml:Polygon srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
          <gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>47.4,8.09 47.4,8.09</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs>
        </gml:Polygon>
      </public:shape>
    </public:landschaftstypen>
  </gml:featureMember>
  <gml:featureMember>
    <public:landschaftstypen fid="landschaftstypen.36">
      <public:textur>5</public:textur>
    </public:landschaftstypen>
  </gml:featureMember>
</wfs:FeatureCollection>`

const WFS_2 = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ms="http://mapserver.gis.umn.edu/mapserver" numberReturned="1">
  <wfs:boundedBy><gml:Envelope><gml:lowerCorner>1 2</gml:lowerCorner></gml:Envelope></wfs:boundedBy>
  <wfs:member>
    <ms:bodenbedeckung_f gml:id="bodenbedeckung_f.565314014">
      <gml:name>bodenbedeckung_f.565314014</gml:name>
      <ms:art>Gebäude</ms:art>
      <ms:qualitaet>AV93</ms:qualitaet>
      <ms:geometry>
        <gml:MultiSurface srsName="urn:ogc:def:crs:EPSG::2056">
          <gml:surfaceMember><gml:Polygon><gml:exterior><gml:LinearRing><gml:posList>1 2 3 4</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:surfaceMember>
        </gml:MultiSurface>
      </ms:geometry>
    </ms:bodenbedeckung_f>
  </wfs:member>
</wfs:FeatureCollection>`

const FEATURE_MEMBERS = `<?xml version="1.0" encoding="UTF-8"?>
<gml:FeatureCollection xmlns:gml="http://www.opengis.net/gml/3.1" xmlns:app="http://app">
  <gml:featureMembers>
    <app:site gml:id="s.1"><app:name>One</app:name></app:site>
    <app:site gml:id="s.2"><app:name>Two</app:name><app:area uom="ha">12.5</app:area></app:site>
  </gml:featureMembers>
</gml:FeatureCollection>`

const OGR = `<?xml version="1.0" encoding="utf-8"?>
<ogr:FeatureCollection xmlns:ogr="http://ogr.maptools.org/" xmlns:gml="http://www.opengis.net/gml/3.2">
  <ogr:featureMember>
    <ogr:auen gml:id="auen.0">
      <gml:boundedBy><gml:Envelope><gml:lowerCorner>1 2</gml:lowerCorner></gml:Envelope></gml:boundedBy>
      <ogr:geometryProperty><gml:Polygon><gml:exterior><gml:LinearRing><gml:posList>1 2 3 4</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogr:geometryProperty>
      <objnummer>69</objnummer>
      <name>Belper Giessen</name>
    </ogr:auen>
  </ogr:featureMember>
</ogr:FeatureCollection>`

const MAPSERVER = `<?xml version="1.0" encoding="UTF-8"?>
<msGMLOutput xmlns:gml="http://www.opengis.net/gml">
  <ch.bafu.bundesinventare-auen_layer>
    <gml:name>Auengebiete</gml:name>
    <ch.bafu.bundesinventare-auen_feature>
      <gml:boundedBy><gml:Box srsName="EPSG:2056"><gml:coordinates>1 2 3 4</gml:coordinates></gml:Box></gml:boundedBy>
      <geom>
        <gml:Polygon srsName="EPSG:4326">
          <gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>8.8,47.1 8.9,47.1 8.9,47.2</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs>
        </gml:Polygon>
      </geom>
      <Nr.>69</Nr.>
      <Objektname>Belper Giessen</Objektname>
      <Fläche_ha>417.546</Fläche_ha>
      <Objektblatt>https://api3.geo.admin.ch/objectsheets/nr69.pdf</Objektblatt>
    </ch.bafu.bundesinventare-auen_feature>
  </ch.bafu.bundesinventare-auen_layer>
</msGMLOutput>`

const QGIS = `<?xml version="1.0" encoding="UTF-8"?>
<GetFeatureInfoResponse>
  <Layer title="Abfuhrzonen" name="ch.bs.abfuhrzonen_afrb">
    <Feature id="0">
      <Attribute value="2" name="Zone"/>
      <Attribute value="https://www.riehen.ch/abfallkalender" name="Kalender"/>
      <BoundingBox minx="7.6" miny="47.6" maxx="7.7" maxy="47.6" CRS="EPSG:4326"/>
      <Attribute value="MultiPolygon (((7.6 47.6, 7.7 47.6)))" name="geometry"/>
    </Feature>
    <Feature id="1">
      <Attribute value="3" name="Zone"/>
    </Feature>
  </Layer>
</GetFeatureInfoResponse>`

const ARC_GIS_FIELDS = `<?xml version="1.0" encoding="UTF-8"?>
<FeatureInfoResponse xmlns:esri_wms="http://www.esri.com/wms" xmlns="http://www.esri.com/wms">
  <FIELDS OBJECTID="1" Shape="Polygon" CONTINENT="Africa" SQMI="11583462.724" SQKM="30001150.724"></FIELDS>
</FeatureInfoResponse>`

const ARC_GIS_FIELDS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<FeatureInfoResponse version="1.3.0" xmlns="http://www.esri.com/wms">
  <FeatureInfoCollection layername="Continent">
    <FeatureInfo>
      <Field><FieldName>OBJECTID</FieldName><FieldValue>1</FieldValue></Field>
      <Field><FieldName>Shape</FieldName><FieldValue>Polygon</FieldValue></Field>
      <Field><FieldName>CONTINENT</FieldName><FieldValue>Africa</FieldValue></Field>
      <Field><FieldName>SQKM</FieldName><FieldValue>30001150.724</FieldValue></Field>
    </FeatureInfo>
  </FeatureInfoCollection>
</FeatureInfoResponse>`

const ARC_GIS_RAW = `<?xml version="1.0" encoding="UTF-8"?>
<esri_wms:FeatureInfoResponse version="1.3.0" xmlns:esri_wms="http://www.esri.com/wms" xmlns="http://www.esri.com/wms">
  <esri_wms:FeatureInfoCollection layername="Continent">
    <esri_wms:FeatureInfo>
      <esri_wms:CRS>4326</esri_wms:CRS>
      <esri_wms:Field><esri_wms:FieldName>OBJECTID</esri_wms:FieldName><esri_wms:FieldValue>1</esri_wms:FieldValue></esri_wms:Field>
      <esri_wms:Field>
        <esri_wms:FieldName>Shape</esri_wms:FieldName>
        <esri_wms:FieldValue>Polygon</esri_wms:FieldValue>
        <esri_wms:FieldGeometry><esri_wms:Polygon><esri_wms:Ring><esri_wms:Point>35.4,-21.6</esri_wms:Point></esri_wms:Ring></esri_wms:Polygon></esri_wms:FieldGeometry>
      </esri_wms:Field>
      <esri_wms:Field><esri_wms:FieldName>CONTINENT</esri_wms:FieldName><esri_wms:FieldValue>Africa</esri_wms:FieldValue></esri_wms:Field>
    </esri_wms:FeatureInfo>
  </esri_wms:FeatureInfoCollection>
</esri_wms:FeatureInfoResponse>`

const ARC_GIS_FIELD_ELEMENTS = `<?xml version="1.0" encoding="UTF-8"?>
<FeatureInfoResponse xmlns="http://www.esri.com/wms">
  <FeatureInfo>
    <OBJECTID>1</OBJECTID>
    <CONTINENT>Africa</CONTINENT>
  </FeatureInfo>
  <FeatureInfo>
    <OBJECTID>2</OBJECTID>
    <CONTINENT>Europe</CONTINENT>
  </FeatureInfo>
</FeatureInfoResponse>`

const parseXml = (xml: string): Document =>
  new window.DOMParser().parseFromString(xml, 'text/xml')

const propertiesOf = (xml: string) => featureXmlToLayersData(parseXml(xml))

describe('featureXmlToLayersData', () => {
  describe('gml of every version', () => {
    it('reads what a gml:featureMember wraps, one entry per feature', () => {
      expect(propertiesOf(GEOSERVER)).toEqual([
        {
          properties: [
            ['textur', '4'],
            ['landschaftstyp', '11'],
            [
              'landschaftstyp1',
              'Siedlungslandschaften mit städtischer Prägung',
            ],
          ],
        },
        { properties: [['textur', '5']] },
      ])
    })

    it('reads wfs:member of wfs 2.0, without gml:name and the id', () => {
      expect(propertiesOf(WFS_2)).toEqual([
        {
          properties: [
            ['art', 'Gebäude'],
            ['qualitaet', 'AV93'],
          ],
        },
      ])
    })

    it('reads several features in one gml:featureMembers', () => {
      expect(propertiesOf(FEATURE_MEMBERS)).toEqual([
        { properties: [['name', 'One']] },
        {
          properties: [
            ['name', 'Two'],
            ['area', '12.5'],
          ],
        },
      ])
    })

    it('reads ogr:featureMember', () => {
      expect(propertiesOf(OGR)).toEqual([
        {
          properties: [
            ['objnummer', '69'],
            ['name', 'Belper Giessen'],
          ],
        },
      ])
    })
  })

  describe('server families with a layout of their own', () => {
    it("reads MapServer's msGMLOutput, titled by gml:name", () => {
      expect(propertiesOf(MAPSERVER)).toEqual([
        {
          label: 'Auengebiete',
          properties: [
            ['Nr.', '69'],
            ['Objektname', 'Belper Giessen'],
            ['Fläche_ha', '417.546'],
            ['Objektblatt', 'https://api3.geo.admin.ch/objectsheets/nr69.pdf'],
          ],
        },
      ])
    })

    it("reads QGIS Server's Attribute elements, without the geometry", () => {
      expect(propertiesOf(QGIS)).toEqual([
        {
          properties: [
            ['Zone', '2'],
            ['Kalender', 'https://www.riehen.ch/abfallkalender'],
          ],
        },
        { properties: [['Zone', '3']] },
      ])
    })

    it('reads the fields ArcGIS Server sends as attributes', () => {
      // Shape only tells the type of the geometry
      expect(propertiesOf(ARC_GIS_FIELDS)).toEqual([
        {
          properties: [
            ['OBJECTID', '1'],
            ['CONTINENT', 'Africa'],
            ['SQMI', '11583462.724'],
            ['SQKM', '30001150.724'],
          ],
        },
      ])
    })

    it('reads the Field elements of ArcGIS Server', () => {
      const expected = [
        {
          properties: [
            ['OBJECTID', '1'],
            ['CONTINENT', 'Africa'],
            ['SQKM', '30001150.724'],
          ],
        },
      ]
      expect(propertiesOf(ARC_GIS_FIELDS_XML)).toEqual(expected)
      // the raw variant names the crs and carries the geometry
      expect(propertiesOf(ARC_GIS_RAW)).toEqual([
        {
          properties: [
            ['OBJECTID', '1'],
            ['CONTINENT', 'Africa'],
          ],
        },
      ])
    })

    it('reads ArcGIS Server fields sent as elements', () => {
      expect(propertiesOf(ARC_GIS_FIELD_ELEMENTS)).toEqual([
        {
          properties: [
            ['OBJECTID', '1'],
            ['CONTINENT', 'Africa'],
          ],
        },
        {
          properties: [
            ['OBJECTID', '2'],
            ['CONTINENT', 'Europe'],
          ],
        },
      ])
    })

    it('counts a FIELDS element inside a FeatureInfo only once', () => {
      expect(
        propertiesOf(
          `<FeatureInfoResponse xmlns="http://www.esri.com/wms"><FeatureInfo><FIELDS OBJECTID="7" CONTINENT="Asia"></FIELDS></FeatureInfo></FeatureInfoResponse>`,
        ),
      ).toEqual([
        {
          properties: [
            ['OBJECTID', '7'],
            ['CONTINENT', 'Asia'],
          ],
        },
      ])
    })
  })

  it('finds no features where the server found none', () => {
    for (const empty of [
      '<?xml version="1.0" encoding="UTF-8"?><msGMLOutput xmlns:gml="http://www.opengis.net/gml"></msGMLOutput>',
      '<?xml version="1.0" encoding="UTF-8"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs"><gml:boundedBy><gml:null>unknown</gml:null></gml:boundedBy></wfs:FeatureCollection>',
      '<GetFeatureInfoResponse></GetFeatureInfoResponse>',
      '<FeatureInfoResponse xmlns="http://www.esri.com/wms"></FeatureInfoResponse>',
    ]) {
      expect(propertiesOf(empty)).toEqual([])
    }
  })
})

describe('layersDataFromRequestData', () => {
  describe('json (httpGet hands it over parsed)', () => {
    it('turns a GeoJSON FeatureCollection into one entry per feature', () => {
      expect(
        layersDataFromRequestData({
          requestData: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { Zone: 2, Kalender: 'https://www.riehen.ch' },
                geometry: { type: 'Polygon', coordinates: [[[1, 2]]] },
              },
              { type: 'Feature', properties: null },
            ],
          },
        }),
      ).toEqual({
        layersData: [
          {
            featureLabel: 'Feature',
            properties: [
              ['Zone', 2],
              ['Kalender', 'https://www.riehen.ch'],
            ],
          },
          { featureLabel: 'Feature', properties: [] },
        ],
      })
    })

    it('reads features that come without the collection around them', () => {
      expect(
        layersDataFromRequestData({
          requestData: [{ name: 'One', type: 'site' }],
        }),
      ).toEqual({
        layersData: [
          {
            featureLabel: 'Feature',
            properties: [
              ['name', 'One'],
              ['type', 'site'],
            ],
          },
        ],
      })
    })

    it('shows a value that is itself an object as text', () => {
      expect(
        layersDataFromRequestData({
          requestData: { features: [{ properties: { tags: ['a', 'b'] } }] },
        }),
      ).toEqual({
        layersData: [
          { featureLabel: 'Feature', properties: [['tags', '["a","b"]']] },
        ],
      })
    })

    it('finds no features in an empty collection', () => {
      expect(
        layersDataFromRequestData({
          requestData: { type: 'FeatureCollection', features: [] },
        }),
      ).toEqual({ layersData: [] })
    })

    it('shows json of an unknown shape as it is', () => {
      const unknown = { results: [{ id: 1 }] }
      expect(layersDataFromRequestData({ requestData: unknown })).toEqual({
        layersData: [{ json: unknown }],
      })
    })
  })

  describe('text', () => {
    it('shows plain text', () => {
      expect(
        layersDataFromRequestData({
          requestData: "Results for FeatureType 'x':\n-\ntextur = 4",
        }),
      ).toEqual({
        layersData: [{ text: "Results for FeatureType 'x':\n-\ntextur = 4" }],
      })
    })

    it('shows a number that httpGet parsed', () => {
      expect(layersDataFromRequestData({ requestData: 1980 })).toEqual({
        layersData: [{ text: '1980' }],
      })
    })

    it('finds nothing in an empty answer or in “no results”', () => {
      for (const empty of [
        '',
        '  \n',
        'GetFeatureInfo results: Search returned no results.',
      ]) {
        expect(layersDataFromRequestData({ requestData: empty })).toEqual({
          layersData: [],
        })
      }
    })
  })

  describe('html', () => {
    it('shows html that is not well-formed xml', () => {
      const html =
        '<!DOCTYPE html>\n<head><title>Information</title></head>\n<table><tr><th>Zone</th><td>2</td></tr></table>'
      expect(layersDataFromRequestData({ requestData: html })).toEqual({
        layersData: [{ html }],
      })
    })

    it('shows well-formed xhtml as html, not as a feature document', () => {
      const html =
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>t</title></head><body><p>x</p></body></html>'
      expect(layersDataFromRequestData({ requestData: html })).toEqual({
        layersData: [{ html }],
      })
    })
  })

  describe('xml', () => {
    it('reads the features, whatever the requested format was', () => {
      for (const xml of [GEOSERVER, MAPSERVER, QGIS, ARC_GIS_FIELDS]) {
        expect(
          layersDataFromRequestData({ requestData: xml }).layersData.length,
        ).toBeGreaterThan(0)
      }
    })

    it('shows xml that does not parse as text', () => {
      const broken =
        '<?xml version="1.0"?><wfs:FeatureCollection><gml:featureMember><a>'
      expect(layersDataFromRequestData({ requestData: broken })).toEqual({
        layersData: [{ text: broken }],
      })
    })

    it('finds nothing in xml without features', () => {
      expect(
        layersDataFromRequestData({
          requestData: '<?xml version="1.0"?><something><else/></something>',
        }),
      ).toEqual({ layersData: [] })
    })
  })

  describe('exception reports', () => {
    it('recognises a rejected format — with the status 200 wms servers send', () => {
      expect(
        layersDataFromRequestData({
          requestData: `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ServiceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc">
  <ServiceException code="InvalidFormat">
 Parameter 'InfoFormat' contains unacceptable value.
 </ServiceException>
</ServiceExceptionReport>`,
        }),
      ).toEqual({
        layersData: [],
        exception: {
          message:
            "InvalidFormat: Parameter 'InfoFormat' contains unacceptable value.",
          unsupportedFormat: true,
        },
      })
    })

    it('recognises a rejected format in the wfs 2.0 report', () => {
      const { exception } = layersDataFromRequestData({
        requestData: `<?xml version="1.0" encoding="UTF-8"?>
<ows:ExceptionReport version="2.0.0" xmlns:ows="http://www.opengis.net/ows/1.1">
  <ows:Exception exceptionCode="InvalidParameterValue" locator="outputformat">
    <ows:ExceptionText>'application/x-bogus' is not a permitted output format for layer 'bodenbedeckung_f'</ows:ExceptionText>
  </ows:Exception>
</ows:ExceptionReport>`,
      })
      expect(exception?.unsupportedFormat).toBe(true)
      expect(exception?.message).toBe(
        "InvalidParameterValue: 'application/x-bogus' is not a permitted output format for layer 'bodenbedeckung_f'",
      )
    })

    it('leaves an exception that is not about the format to fail for every format', () => {
      expect(
        layersDataFromRequestData({
          requestData: `<?xml version="1.0" encoding="UTF-8"?>
<ServiceExceptionReport version="1.1.1" xmlns="http://www.opengis.net/ogc">
  <ServiceException code="LayerNotDefined" layer="x">
msWMSFeatureInfo(): Layer(s) specified in QUERY_LAYERS parameter is not offered by the service instance.
  </ServiceException>
</ServiceExceptionReport>`,
        }),
      ).toEqual({
        layersData: [],
        exception: {
          message:
            'LayerNotDefined: msWMSFeatureInfo(): Layer(s) specified in QUERY_LAYERS parameter is not offered by the service instance.',
          unsupportedFormat: false,
        },
      })
    })

    it('is no exception report when the features are fine', () => {
      expect(
        layersDataFromRequestData({ requestData: GEOSERVER }).exception,
      ).toBeUndefined()
    })
  })
})
