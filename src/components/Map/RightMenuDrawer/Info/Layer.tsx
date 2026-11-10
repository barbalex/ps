import { Fragment } from 'react'
import type { ReactNode } from 'react'
import Linkify from 'linkify-react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { useIntl } from 'react-intl'
import { MdOpenInNew, MdEdit, MdEditOff } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'

import type { MapInfoLayer } from '../../../../store.ts'
import {
  mapBoundsAtom,
  tabsAtom,
  editingPlaceGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
} from '../../../../store.ts'
import {
  extentSelect,
  queryExtent,
  extentToBoundsWithMargin,
} from '../../../../modules/geoQueries.ts'
import styles from './Layer.module.css'

const { Button } = fluentUiReactComponents

type Props = {
  layerData: MapInfoLayer & {
    properties?: [string, unknown][]
    html?: string
    json?: unknown
    text?: string
    projectId?: string
  }
}

export const Layer = ({ layerData }: Props) => {
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
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [editingPlaceGeometry, setEditingPlaceGeometry] = useAtom(
    editingPlaceGeometryAtom,
  )
  const [editingCheckGeometry, setEditingCheckGeometry] = useAtom(
    editingCheckGeometryAtom,
  )
  const [editingActionGeometry, setEditingActionGeometry] = useAtom(
    editingActionGeometryAtom,
  )

  const onNavigate = async () => {
    if (!ownTable || !ownId) return
    if (ownTable === 'place') {
      if (ownParentId) {
        navigate({
          to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/place',
          params: {
            projectId: projectId!,
            subprojectId: ownSubprojectId!,
            placeId: ownParentId,
            placeId2: ownId,
          },
        })
      } else {
        navigate({
          to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/place',
          params: {
            projectId: projectId!,
            subprojectId: ownSubprojectId!,
            placeId: ownId,
          },
        })
      }
    } else {
      const placeRes = await db.query(
        `SELECT subproject_id, parent_id FROM places WHERE place_id = $1`,
        [ownPlaceId],
      )
      const place = placeRes?.rows?.[0] as
        { subproject_id: string; parent_id: string | null } | undefined
      if (!place) return
      if (ownTable === 'check') {
        if (place.parent_id) {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/checks/$checkId/check',
            params: {
              projectId: projectId!,
              subprojectId: place.subproject_id,
              placeId: place.parent_id,
              placeId2: ownPlaceId!,
              checkId: ownId,
            },
          })
        } else {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/checks/$checkId/check',
            params: {
              projectId: projectId!,
              subprojectId: place.subproject_id,
              placeId: ownPlaceId!,
              checkId: ownId,
            },
          })
        }
      } else if (ownTable === 'action') {
        if (place.parent_id) {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/actions/$actionId/action',
            params: {
              projectId: projectId!,
              subprojectId: place.subproject_id,
              placeId: place.parent_id,
              placeId2: ownPlaceId!,
              actionId: ownId,
            },
          })
        } else {
          navigate({
            to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/actions/$actionId/action',
            params: {
              projectId: projectId!,
              subprojectId: place.subproject_id,
              placeId: ownPlaceId!,
              actionId: ownId,
            },
          })
        }
      }
    }
  }

  const tableName =
    ownTable === 'place' ? 'places'
    : ownTable === 'check' ? 'checks'
    : 'actions'

  // mirrors queryExtent returning null: no geometry or an empty one
  // (e.g. GeometryCollection without parts) can not be zoomed to
  const geometryRes = useLiveQuery(
    ownTable && ownId ?
      `SELECT (geometry IS NOT NULL AND NOT ST_IsEmpty(geometry)) AS has_geometry FROM ${tableName} WHERE ${ownTable}_id = $1`
    : `SELECT 1 WHERE false`,
    ownTable && ownId ? [ownId] : [],
  )
  const hasGeometry = geometryRes?.rows?.[0]?.has_geometry === true

  const onZoomTo = async () => {
    if (!ownTable || !ownId) return
    const extent = await queryExtent(
      db,
      `SELECT ${extentSelect()} FROM ${tableName} WHERE ${ownTable}_id = $1`,
      [ownId],
    )
    if (!extent) return
    if (!tabs.includes('map')) setTabs([...tabs, 'map'])
    setMapBounds(extentToBoundsWithMargin(extent))
  }

  const isEditing =
    (ownTable === 'place' && editingPlaceGeometry === ownId) ||
    (ownTable === 'check' && editingCheckGeometry === ownId) ||
    (ownTable === 'action' && editingActionGeometry === ownId)

  const onEdit = async () => {
    if (!ownTable || !ownId) return
    if (ownTable === 'place') {
      setEditingPlaceGeometry(isEditing ? null : ownId)
    } else if (ownTable === 'check') {
      setEditingCheckGeometry(isEditing ? null : ownId)
    } else if (ownTable === 'action') {
      setEditingActionGeometry(isEditing ? null : ownId)
    }
    if (!isEditing) {
      if (!tabs.includes('map')) setTabs([...tabs, 'map'])
      await onNavigate()
    }
  }

  // console.log('Map Info Drawer Layer', { label, properties, html, json, text })

  const editButton =
    ownTable ?
      <Button
        size="small"
        icon={isEditing ? <MdEditOff /> : <MdEdit />}
        onClick={onEdit}
        title={isEditing ? 'Stop editing geometry' : 'Edit geometry on map'}
        appearance={isEditing ? 'primary' : 'secondary'}
      />
    : null

  const zoomButton = (
    <Button
      size="small"
      icon={<TbZoomScan />}
      onClick={onZoomTo}
      disabled={!hasGeometry}
      title={
        hasGeometry ?
          formatMessage({
            id: 'bMapInfoZoomTo',
            defaultMessage: 'Zum Objekt in Karte zoomen',
          })
        : formatMessage({
            id: 'bMapInfoZoomToNoGeometry',
            defaultMessage:
              'Um auf ein Objekt zu zoomen, erstelle zuerst die Geometrie',
          })
      }
    />
  )

  const buttons =
    ownTable ?
      <div className={styles.buttons}>
        <Button
          size="small"
          icon={<MdOpenInNew />}
          onClick={onNavigate}
          title="Navigate to"
        />
        {zoomButton}
        {editButton}
      </div>
    : null

  if (text) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        {buttons}
        <div className={styles.text}>{text}</div>
      </div>
    )
  }

  if (json) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        {buttons}
        <pre className={styles.text}>{JSON.stringify(json, null, 2)}</pre>
      </div>
    )
  }

  if (html) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        {buttons}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{titleToShow}</div>
      {buttons}
      <div className={styles.propertyList}>
        {properties.map((p, i) => {
          const key = p[0]
          const value = p[1]
          const rowClassName = i % 2 === 0 ? styles.rowEven : undefined

          return (
            <Fragment key={`${i}/${key}`}>
              <div
                className={`${styles.label}${rowClassName ? ` ${rowClassName}` : ''}`}
              >
                {key}
              </div>
              <Linkify options={{ target: '_blank' }}>
                <div
                  className={`${styles.text}${rowClassName ? ` ${rowClassName}` : ''}`}
                >
                  {value as ReactNode}
                </div>
              </Linkify>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
