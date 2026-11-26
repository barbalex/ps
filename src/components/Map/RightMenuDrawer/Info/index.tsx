import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, DrawerBody, DrawerHeader } = fluentUiReactComponents
import { MdClose } from 'react-icons/md'
import { useAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
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
import { languageAtom, mapInfoAtom } from '../../../../store.ts'
import { useNavRollups } from '../../../../modules/navRollupsContext.ts'
import { getPlaceLevelNames } from '../../../../modules/placeNameFallback.ts'
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
  const language = useAtomValue(languageAtom)
  const { formatMessage } = useIntl()
  const { placeLevel, projectRow } = useNavRollups()
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

  // Multipart features and multiple presentations can hit the same record.
  const seen = new Set<string>()
  const hits = (mapInfo?.layers ?? []).filter(layer => {
    const key = layer.ownObservationId ? `observation/${layer.ownObservationId}`
      : layer.ownTable && layer.ownId ? `${layer.ownTable}/${layer.ownId}` : null
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const selected = mapInfo?.layers[mapInfo?.selectedHit ?? -1]
  const choose = (layer: MapInfoLayer) => setMapInfo(info =>
    info && info.layers.includes(layer) ? {
      ...info, selectedHit: info.layers.indexOf(layer),
      layers: info.layers.map(hit => hit.formActive ? { ...hit, formActive: false } : hit),
    } : info,
  )
  const back = () => setMapInfo(info => !info ? info : {
    ...info, selectedHit: undefined, browsing: false,
    layers: info.layers.map(layer => layer.formActive ? { ...layer, formActive: false } : layer),
  })

  // Group layers by label
  const groupedLayers = (selected ? [selected] : hits).reduce<
    Record<string, MapInfoLayer[]>
  >((acc, layer) => {
    // A Leaflet marker can retain the label it had before place levels loaded.
    const level = layer.ownParentId ? 2 : 1
    const project = layer.projectId ?? projectId
    const label = layer.ownTable === 'place' ?
      getPlaceLevelNames(placeLevel(project, level), language, projectRow(project)?.type, level, formatMessage).plural
    : layer.label || 'Unknown'
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
          {selected && <Button onClick={back}>{formatMessage({ id: 'bFyZsS', defaultMessage: 'Zurück' })}</Button>}
          {mapOnly && mapInfo?.browsing ? <RoutedInfo /> : <>
          <Location
            mapInfo={mapInfo}
            projectMapPresentationCrs={projectMapPresentationCrs}
            projectCrs={projectCrs}
          />
          {hits.length ?
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
                    onChoose={!selected && hits.length > 1 && (layer.ownId || layer.ownObservationId) ? () => choose(layer) : undefined}
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
