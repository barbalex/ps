import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, DrawerBody, DrawerHeader } = fluentUiReactComponents
import { MdClose } from 'react-icons/md'
import { useAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import { useState, type MouseEvent } from 'react'
import { Outlet, useMatches, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { Breadcrumbs } from '../../../LayoutProtected/Breadcrumbs/index.tsx'
import { usePaneVisibility } from '../../../LayoutProtected/usePaneVisibility.ts'
import { MapInfoBreadcrumbSlot, MapInfoFormRoot, MapInfoNavigation } from '../../../../modules/mapInfoFormContext.ts'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'
import { languageAtom, mapInfoAtom } from '../../../../store.ts'
import { useNavRollups } from '../../../../modules/navRollupsContext.ts'
import { getPlaceLevelNames } from '../../../../modules/placeNameFallback.ts'
import { useOwnLayerScope } from '../../../../modules/useOwnLayerScope.ts'
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
  const [breadcrumbSlot, setBreadcrumbSlot] = useState<HTMLDivElement | null>(null)
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

  const { subprojectId } = useOwnLayerScope()
  const visible = selected ? [selected] : hits
  const hitKey = (layer: MapInfoLayer) => layer.ownObservationId ? `observation/${layer.ownObservationId}` : `${layer.ownTable}/${layer.ownId}`
  const lookup = subprojectId ? [] : visible.flatMap(layer =>
    layer.ownTable || layer.ownObservationId ? [{
      key: hitKey(layer), sid: layer.ownSubprojectId, oid: layer.ownObservationId,
      pid: layer.ownTable === 'place' ? layer.ownId : layer.ownPlaceId,
    }] : [],
  )
  const owners = useLiveQuery<{ key: string; id: string; label: string }>(
    `SELECT h.key, s.subproject_id AS id, coalesce(nullif(s.label,''), nullif(s.name,''), s.subproject_id::text) AS label
     FROM jsonb_to_recordset($1::jsonb) AS h(key text, sid uuid, oid uuid, pid uuid)
     LEFT JOIN observations o ON o.observation_id = h.oid
     LEFT JOIN observation_imports i USING (observation_import_id)
     LEFT JOIN places p ON p.place_id = h.pid
     LEFT JOIN places parent ON parent.place_id = p.parent_id
     JOIN subprojects s ON s.subproject_id = coalesce(i.subproject_id, h.sid, p.subproject_id, parent.subproject_id)
     WHERE s.project_id = $2`,
    [JSON.stringify(lookup), projectId],
  )?.rows ?? []
  const ownerByHit = new Map(owners.map(owner => [owner.key, owner]))
  const split = !selected && new Set(owners.map(owner => owner.id)).size > 1
  const term = projectRow(projectId)?.subproject_name_singular_current ||
    formatMessage({ id: 'gxCh0c', defaultMessage: 'Teilprojekt' })
  const groups = Map.groupBy(visible, layer => split ? ownerByHit.get(hitKey(layer))?.id : undefined)
  const tableLabel = (layer: MapInfoLayer) => {
    // A Leaflet marker can retain the label it had before place levels loaded.
    const level = layer.ownParentId ? 2 : 1
    const project = layer.projectId ?? projectId
    return layer.ownTable === 'place' ?
      getPlaceLevelNames(placeLevel(project, level), language, projectRow(project)?.type, level, formatMessage).plural
    : layer.label || 'Unknown'
  }
  const backLabel = formatMessage({ id: 'bFyZsS', defaultMessage: 'Zurück' })

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
        {mapOnly && (mapInfo?.browsing ? <Breadcrumbs /> : <div ref={setBreadcrumbSlot} />)}
        <MapInfoBreadcrumbSlot.Provider value={mapOnly ? breadcrumbSlot : null}>
        <DrawerBody className={styles.body}>
          {selected && <div className={styles.backOverlay}><Button size="small" onClick={back}>{backLabel}</Button></div>}
          {mapOnly && mapInfo?.browsing ? <RoutedInfo /> : <>
          <Location
            mapInfo={mapInfo}
            projectMapPresentationCrs={projectMapPresentationCrs}
            projectCrs={projectCrs}
          />
          {hits.length ?
            Array.from(groups, ([id, group]) => (
              <section key={id ?? ''}>
              {id && <h2 className={styles.subprojectHeading}>{term}: {ownerByHit.get(hitKey(group[0]))?.label}</h2>}
              {Array.from(Map.groupBy(group, tableLabel), ([label, layers]) => (
              <div
                key={label}
                className={styles.layerGroup}
              >
                {selected ? <button type="button" className={styles.groupHeader} onClick={back} title={backLabel}>
                  {label} ({layers.length})
                </button> : <div className={styles.groupHeader}>{label} ({layers.length})</div>}
                {layers.map((layer, i) => (
                  <Layer
                    key={`${label}/${i}`}
                    layerData={layer}
                    subprojectLabel={!split && ownerByHit.has(hitKey(layer)) ? `${term}: ${ownerByHit.get(hitKey(layer))?.label}` : undefined}
                    onChoose={!selected && hits.length > 1 && (layer.ownId || layer.ownObservationId) ? () => choose(layer) : undefined}
                  />
                ))}
              </div>
              ))}
              </section>
            ))
          : <p className={styles.noData}>No Data found at this location</p>}
          </>}
        </DrawerBody>
        </MapInfoBreadcrumbSlot.Provider>
      </div>
      </MapInfoNavigation.Provider>
    </ErrorBoundary>
  )
}
