import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, DrawerBody, DrawerHeader } = fluentUiReactComponents
import { MdClose } from 'react-icons/md'
import { useAtom } from 'jotai'
import type { MouseEvent } from 'react'
import { Outlet, useMatches, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { Breadcrumbs } from '../../../LayoutProtected/Breadcrumbs/index.tsx'
import { usePaneVisibility } from '../../../LayoutProtected/usePaneVisibility.ts'
import { MapInfoFormRoot, MapInfoNavigation } from '../../../../modules/mapInfoFormContext.ts'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'
import { mapInfoAtom } from '../../../../store.ts'
import type { MapInfoLayer } from '../../../../store.ts'
import styles from './index.module.css'
import type ProjectCrs from '../../../../models/public/ProjectCrs.ts'
import type Projects from '../../../../models/public/Projects.ts'

const RoutedInfo = () => {
  const root = useMatches({
    select: (matches) => matches.findLast((match) =>
      /\/\$(placeId2?|checkId|actionId)_$/.test(match.routeId),
    )?.pathname,
  })
  return (
    <MapInfoFormRoot.Provider value={root}>
      <Outlet />
    </MapInfoFormRoot.Provider>
  )
}

export const Info = () => {
  const [mapInfo, setMapInfo] = useAtom(mapInfoAtom)
  const { treeVisible, dataVisible, mapVisible } = usePaneVisibility()
  const mapOnly = mapVisible && !treeVisible && !dataVisible
  const browse = () => setMapInfo((info) => !info || info.browsing ? info : {
    ...info,
    browsing: true,
    layers: info.layers.map((layer) => layer.formActive ? { ...layer, formActive: false } : layer),
  })
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const resProject = useLiveQuery<Projects>(
    `SELECT map_presentation_crs FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const project: Projects | undefined = resProject?.rows?.[0]
  const projectMapPresentationCrs = project?.map_presentation_crs

  const resProjectCrs = useLiveQuery<ProjectCrs>(
    `SELECT code, proj4 FROM project_crs WHERE project_id = $1`,
    [projectId],
  )
  const projectCrs: ProjectCrs[] = resProjectCrs?.rows ?? []

  const close = (e: MouseEvent) => {
    e.preventDefault()
    setMapInfo(null)
  }

  const layersExist = (mapInfo?.layers?.length ?? 0) > 0

  // Group layers by label
  const groupedLayers = (mapInfo?.layers ?? []).reduce<
    Record<string, MapInfoLayer[]>
  >((acc, layer) => {
    const label = layer.label || 'Unknown'
    if (!acc[label]) {
      acc[label] = []
    }
    acc[label].push(layer)
    return acc
  }, Object.create(null))

  return (
    <ErrorBoundary>
      <MapInfoNavigation.Provider value={mapOnly ? browse : undefined}>
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
        {mapOnly && mapInfo && <Breadcrumbs />}
        <DrawerBody className={styles.body}>
          {mapOnly && mapInfo?.browsing ? <RoutedInfo /> : <>
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
          </>}
        </DrawerBody>
      </div>
      </MapInfoNavigation.Provider>
    </ErrorBoundary>
  )
}
