import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, DrawerBody, DrawerHeader } = fluentUiReactComponents
import { MdClose } from 'react-icons/md'
import { useAtom } from 'jotai'
import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'
import { mapInfoAtom } from '../../../../store.ts'
import styles from './index.module.css'
import type ProjectCrs from '../../../../models/public/ProjectCrs.ts'
import type Projects from '../../../../models/public/Projects.ts'

export const Info = () => {
  const [mapInfo, setMapInfo] = useAtom(mapInfoAtom)
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const resProject = useLiveQuery(
    `SELECT map_presentation_crs FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const project: Projects | undefined = resProject?.rows?.[0]
  const projectMapPresentationCrs = project?.map_presentation_crs

  const resProjectCrs = useLiveQuery(
    `SELECT code, proj4 FROM project_crs WHERE project_id = $1`,
    [projectId],
  )
  const projectCrs: ProjectCrs[] = resProjectCrs?.rows ?? []

  const close = (e) => {
    e.preventDefault()
    setMapInfo(null)
  }

  const layersExist = mapInfo?.layers?.length > 0

  // Group layers by label
  const groupedLayers = (mapInfo?.layers ?? []).reduce((acc, layer) => {
    const label = layer.label || 'Unknown'
    if (!acc[label]) {
      acc[label] = []
    }
    acc[label].push(layer)
    return acc
  }, {})

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <DrawerHeader className={styles.header}>
          <FormHeader
            title="Info"
            siblings={
              <Button
                size="medium"
                icon={<MdClose />}
                onClick={close}
                title="Close"
              />
            }
          />
        </DrawerHeader>
        <DrawerBody className={styles.body}>
          <Location
            mapInfo={mapInfo}
            projectMapPresentationCrs={projectMapPresentationCrs}
            projectCrs={projectCrs}
          />
          {layersExist ?
            Object.entries(groupedLayers).map(([label, layers]) => (
              <div
                key={label}
                className={styles.layerGroup}
              >
                <div className={styles.groupHeader}>
                  {label} ({layers.length})
                </div>
                {layers.map((layer, i) => (
                  <Layer
                    key={`${label}/${i}`}
                    layerData={layer}
                  />
                ))}
              </div>
            ))
          : <p className={styles.noData}>No Data found at this location</p>}
        </DrawerBody>
      </div>
    </ErrorBoundary>
  )
}
