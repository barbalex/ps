import { Fragment } from 'react'
import Linkify from 'linkify-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom, useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { bbox } from '@turf/bbox'
import { buffer } from '@turf/buffer'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdOpenInNew, MdEdit } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'

import {
  mapBoundsAtom,
  tabsAtom,
  editingPlaceGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
} from '../../../../store.ts'
import { boundsFromBbox } from '../../../../modules/boundsFromBbox.ts'
import styles from './Layer.module.css'

export const Layer = ({ layerData }) => {
  const {
    label,
    featureLabel,
    properties = [],
    html,
    json,
    text,
    ownTable,
    ownId,
    ownPlaceId,
    ownSubprojectId,
    ownParentId,
    projectId,
  } = layerData
  const titleToShow = featureLabel || label

  const db = usePGlite()
  const navigate = useNavigate()
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const setEditingPlaceGeometry = useSetAtom(editingPlaceGeometryAtom)
  const setEditingCheckGeometry = useSetAtom(editingCheckGeometryAtom)
  const setEditingActionGeometry = useSetAtom(editingActionGeometryAtom)

  const onNavigate = async () => {
    if (!ownTable || !ownId) return
    if (ownTable === 'place') {
      if (ownParentId) {
        navigate({
          to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/place',
          params: {
            projectId,
            subprojectId: ownSubprojectId,
            placeId: ownParentId,
            placeId2: ownId,
          },
        })
      } else {
        navigate({
          to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/place',
          params: { projectId, subprojectId: ownSubprojectId, placeId: ownId },
        })
      }
    } else {
      const placeRes = await db.query(
        `SELECT subproject_id, parent_id FROM places WHERE place_id = $1`,
        [ownPlaceId],
      )
      const place = placeRes?.rows?.[0]
      if (!place) return
      if (ownTable === 'check') {
        if (place.parent_id) {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/checks/$checkId/check',
            params: {
              projectId,
              subprojectId: place.subproject_id,
              placeId: place.parent_id,
              placeId2: ownPlaceId,
              checkId: ownId,
            },
          })
        } else {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/checks/$checkId/check',
            params: {
              projectId,
              subprojectId: place.subproject_id,
              placeId: ownPlaceId,
              checkId: ownId,
            },
          })
        }
      } else if (ownTable === 'action') {
        if (place.parent_id) {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/actions/$actionId/action',
            params: {
              projectId,
              subprojectId: place.subproject_id,
              placeId: place.parent_id,
              placeId2: ownPlaceId,
              actionId: ownId,
            },
          })
        } else {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/actions/$actionId/action',
            params: {
              projectId,
              subprojectId: place.subproject_id,
              placeId: ownPlaceId,
              actionId: ownId,
            },
          })
        }
      }
    }
  }

  const onZoomTo = async () => {
    if (!ownTable || !ownId) return
    let geometry
    if (ownTable === 'place') {
      const res = await db.query(
        `SELECT geometry FROM places WHERE place_id = $1`,
        [ownId],
      )
      geometry = res?.rows?.[0]?.geometry
    } else if (ownTable === 'check') {
      const res = await db.query(
        `SELECT geometry FROM checks WHERE check_id = $1`,
        [ownId],
      )
      geometry = res?.rows?.[0]?.geometry
    } else if (ownTable === 'action') {
      const res = await db.query(
        `SELECT geometry FROM actions WHERE action_id = $1`,
        [ownId],
      )
      geometry = res?.rows?.[0]?.geometry
    }
    if (!geometry || !geometry.features?.length) return
    if (!tabs.includes('map')) setTabs([...tabs, 'map'])
    const buffered = buffer(geometry, 0.05)
    const newBbox = bbox(buffered)
    const bounds = boundsFromBbox(newBbox)
    if (!bounds) return
    setMapBounds(bounds)
  }

  const onEdit = () => {
    if (!ownTable || !ownId) return
    if (!tabs.includes('map')) setTabs([...tabs, 'map'])
    if (ownTable === 'place') setEditingPlaceGeometry(ownId)
    else if (ownTable === 'check') setEditingCheckGeometry(ownId)
    else if (ownTable === 'action') setEditingActionGeometry(ownId)
  }

  // console.log('Map Info Drawer Layer', { label, properties, html, json, text })

  if (text) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        {ownTable && (
          <div className={styles.buttons}>
            <Button size="small" icon={<MdOpenInNew />} onClick={onNavigate} title="Navigate to" />
            <Button size="small" icon={<TbZoomScan />} onClick={onZoomTo} title="Zoom to on map" />
            <Button size="small" icon={<MdEdit />} onClick={onEdit} title="Edit geometry on map" />
          </div>
        )}
        <div className={styles.text}>{text}</div>
      </div>
    )
  }

  if (json) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        {ownTable && (
          <div className={styles.buttons}>
            <Button size="small" icon={<MdOpenInNew />} onClick={onNavigate} title="Navigate to" />
            <Button size="small" icon={<TbZoomScan />} onClick={onZoomTo} title="Zoom to on map" />
            <Button size="small" icon={<MdEdit />} onClick={onEdit} title="Edit geometry on map" />
          </div>
        )}
        <pre className={styles.text}>{JSON.stringify(json, null, 2)}</pre>
      </div>
    )
  }

  if (html) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        {ownTable && (
          <div className={styles.buttons}>
            <Button size="small" icon={<MdOpenInNew />} onClick={onNavigate} title="Navigate to" />
            <Button size="small" icon={<TbZoomScan />} onClick={onZoomTo} title="Zoom to on map" />
            <Button size="small" icon={<MdEdit />} onClick={onEdit} title="Edit geometry on map" />
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{titleToShow}</div>
      {ownTable && (
        <div className={styles.buttons}>
          <Button size="small" icon={<MdOpenInNew />} onClick={onNavigate} title="Navigate to" />
          <Button size="small" icon={<TbZoomScan />} onClick={onZoomTo} title="Zoom to on map" />
          <Button size="small" icon={<MdEdit />} onClick={onEdit} title="Edit geometry on map" />
        </div>
      )}
      <div className={styles.propertyList}>
        {properties.map((p, i) => {
          const key = p[0]
          const value = p[1]
          const backgroundColor = i % 2 === 0 ? 'rgba(0, 0, 0, 0.05)' : 'unset'

          return (
            <Fragment key={`${i}/${key}`}>
              <div className={styles.label} style={{ backgroundColor }}>
                {key}
              </div>
              <Linkify options={{ target: '_blank' }}>
                <div className={styles.text} style={{ backgroundColor }}>
                  {value}
                </div>
              </Linkify>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
