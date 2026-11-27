import type { Geometry } from 'geojson'
import type { QueryableDb } from './geoQueries.ts'
import type { GeometryTable } from './importOwnGeometries.ts'
import { openVectorReader } from './vectorUpload.ts'

export type GeometryFormat = 'geojson' | 'gpkg' | 'csv' | 'kml'
type Values = Record<string, unknown>
type ExportRow = {
  id: string
  properties: Values
  data: Values | null
  labels: Values
  custom_labels: Values
  geometry: Geometry | string
}

const units = [
  'actions',
  'checks',
  'action_taxa',
  'check_taxa',
  'action_reports',
  'check_reports',
]

// Allocate raw names first, across the entire layer (SQLite ignores case).
// Thus a real data.status_label wins over the generated label for data.status.
function flatten(rows: ExportRow[]) {
  const keys = (part: 'properties' | 'data' | 'labels' | 'custom_labels') =>
    [...new Set(rows.flatMap((r) => Object.keys(r[part] ?? {})))].sort()
  const occupied = new Set(['wkt', 'fid', 'geom'])
  const allocate = (name: string) => {
    let dest = name
    for (let i = 2; occupied.has(dest.toLowerCase()); i++) dest = `${name}_${i}`
    occupied.add(dest.toLowerCase())
    return dest
  }
  const names = (keys: string[], name: (key: string) => string) =>
    new Map(keys.map((k) => [k, allocate(name(k))]))
  const base = names(keys('properties'), (k) => k)
  const custom = names(keys('data'), (k) => `data_${k}`)
  const labels = names(keys('labels'), (k) => `${base.get(k)}_label`)
  const customLabels = names(
    keys('custom_labels'),
    (k) => `${custom.get(k)}_label`,
  )
  const groups = [
    ['properties', base],
    ['data', custom],
    ['labels', labels],
    ['custom_labels', customLabels],
  ] as const
  return rows.map((row) => ({
    id: row.id,
    geometry: row.geometry,
    properties: Object.fromEntries(
      groups.flatMap(([part, names]) =>
        [...names].map(([key, dest]) => {
          const values = row[part]
          const value =
            values && Object.hasOwn(values, key) ? values[key] : null
          return [
            dest,
            value !== null && typeof value === 'object' ?
              JSON.stringify(value)
            : value,
          ]
        }),
      ),
    ),
  }))
}

const xml = (v: unknown) =>
  String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const csv = (v: unknown) => {
  let text = String(v ?? '')
  if (typeof v === 'string' && /^[\s]*[=+@-]/.test(v)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export async function exportOwnGeometries(
  db: QueryableDb,
  table: GeometryTable,
  ids: string[],
  format: GeometryFormat,
  typeLabels: Record<string, string>,
) {
  const place = table === 'places' ? 't' : 'p'
  const joins =
    table === 'projects' ? '' : (
      `
    ${table === 'places' ? '' : 'LEFT JOIN places p ON p.place_id=t.place_id'}
    LEFT JOIN places parent ON parent.place_id=${place}.parent_id
    LEFT JOIN subprojects sp ON sp.subproject_id=coalesce(${place}.subproject_id,parent.subproject_id)`
    )
  const fieldScope =
    table === 'projects' ?
      'f.project_id IS NULL AND (f.account_id IS NULL OR f.account_id=t.account_id)'
    : `f.project_id=sp.project_id AND f.level=${place}.level`
  const pk = `${table.slice(0, -1)}_id`
  const geometry =
    format === 'csv' ? 'ST_AsText(t.geometry,17)'
    : format === 'kml' ?
      `(SELECT '<MultiGeometry>' || string_agg(ST_AsKML(d.geom,17), '' ORDER BY d.path) || '</MultiGeometry>' FROM ST_Dump(t.geometry) d)`
    : 'ST_AsGeoJSON(t.geometry,17)::json'
  const labels =
    table === 'projects' ?
      `jsonb_build_object(
    'account_id',(SELECT label FROM accounts WHERE account_id=t.account_id),
    'map_presentation_crs',(SELECT name FROM project_crs WHERE project_id=t.project_id AND code=t.map_presentation_crs ORDER BY project_crs_id LIMIT 1),
    ${units.map((u) => `'${u}_default_unit_id',(SELECT label FROM units WHERE unit_id=t.${u}_default_unit_id)`).join(',')})`
    : table === 'places' ?
      `jsonb_build_object('subproject_id',CASE WHEN t.subproject_id IS NOT NULL THEN sp.label END,'parent_id',parent.label)`
    : `jsonb_build_object('place_id',p.label)`
  const result = await db.query<ExportRow>(
    `
    SELECT t.${pk} AS id, to_jsonb(t)-'geometry'-
      (CASE WHEN jsonb_typeof(t.data)='object' OR t.data IS NULL THEN ARRAY['data'] ELSE ARRAY[]::text[] END) AS properties,
      CASE WHEN jsonb_typeof(t.data)='object' THEN t.data END AS data,${geometry} AS geometry,
      ${labels} AS labels, (SELECT jsonb_object_agg(f.name,
        CASE WHEN jsonb_typeof(t.data->f.name)='array' THEN
          (SELECT coalesce(jsonb_agg((SELECT lv.label FROM list_values lv WHERE lv.list_id=f.list_id
             AND to_jsonb(lv)->('value_' || l.value_type) = choice.code
             ORDER BY lv.list_value_id LIMIT 1) ORDER BY choice.ord), '[]'::jsonb)
           FROM jsonb_array_elements(t.data->f.name) WITH ORDINALITY AS choice(code,ord))
        ELSE to_jsonb((SELECT lv.label FROM list_values lv WHERE lv.list_id=f.list_id
           AND to_jsonb(lv)->>('value_' || l.value_type) = t.data->>f.name
           ORDER BY lv.list_value_id LIMIT 1)) END)
        FROM fields f JOIN lists l USING(list_id)
        WHERE ${fieldScope} AND f.table_name=$2 AND t.data ? f.name
      ) AS custom_labels
    FROM ${table} t ${joins}
    WHERE t.${pk}=ANY($1::uuid[]) AND t.geometry IS NOT NULL AND NOT ST_IsEmpty(t.geometry)
    ORDER BY t.${pk}`,
    [ids, table],
  )
  if (!result.rows.length) return null
  if (table === 'projects')
    for (const row of result.rows)
      row.labels.type = typeLabels[String(row.properties.type)] ?? null
  const rows = flatten(result.rows)
  if (format === 'csv') {
    const header = ['WKT', ...Object.keys(rows[0].properties)]
    return new Blob(
      [
        '\ufeff',
        [
          header.map(csv).join(','),
          ...rows.map((r) =>
            [r.geometry, ...Object.values(r.properties)].map(csv).join(','),
          ),
        ].join('\r\n'),
      ],
      { type: 'text/csv;charset=utf-8' },
    )
  }
  if (format === 'kml') {
    return new Blob(
      [
        '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>',
        ...rows.map(
          (r) =>
            `<Placemark><name>${xml(r.properties.label ?? r.id)}</name><ExtendedData>${Object.entries(
              r.properties,
            )
              .map(
                ([k, v]) =>
                  `<Data name="${xml(k)}"><value>${xml(v)}</value></Data>`,
              )
              .join('')}</ExtendedData>${r.geometry}</Placemark>`,
        ),
        '</Document></kml>',
      ],
      { type: 'application/vnd.google-earth.kml+xml' },
    )
  }
  const file = new File(
    [
      JSON.stringify({
        type: 'FeatureCollection',
        features: rows.map((r) => ({
          type: 'Feature',
          geometry: r.geometry,
          properties: r.properties,
        })),
      }),
    ],
    `${table}.geojson`,
    { type: 'application/geo+json' },
  )
  if (format === 'geojson') return file
  const worker = openVectorReader()
  try {
    return await worker.geoPackage(file)
  } finally {
    worker.close()
  }
}
