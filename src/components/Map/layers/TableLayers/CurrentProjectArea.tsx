import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import type { FeatureCollection, MultiPolygon } from 'geojson'

import { userIdAtom } from '../../../../store.ts'
import { TableLayer, type TableLayerProps } from './TableLayer.tsx'

type ProjectFeature = {
  project_id: string
  name: string | null
  label: string | null
  geometry: MultiPolygon
  edit_version: string
}

export function CurrentProjectArea({
  layerPresentation,
}: Pick<TableLayerProps, 'layerPresentation'>) {
  const { projectId } = useParams({ strict: false })
  const userId = useAtomValue(userIdAtom)
  const result = useLiveQuery<ProjectFeature>(
    `SELECT project_id, name, label, ST_AsGeoJSON(geometry)::json AS geometry,
       md5(ROW(name, label, geometry)::text) AS edit_version
     FROM projects WHERE project_id = $2 AND NOT ST_IsEmpty(geometry)
       AND EXISTS (SELECT 1 FROM project_roles WHERE project_id = $2 AND project_user_id IN (
         SELECT project_user_id FROM user_project_user_ids($1)
       ))`,
    [userId, projectId ?? null],
  )
  const data = useMemo<FeatureCollection[]>(
    () =>
      (result?.rows ?? []).map(({ project_id, name, label, geometry }) => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry,
            properties: { project_id, name, label },
          },
        ],
      })),
    [result?.rows],
  )
  return data.length ?
      <TableLayer
        data={data}
        layerPresentation={layerPresentation}
        editVersion={result?.rows[0]?.edit_version}
        activeIdField="project_id"
      />
    : null
}
