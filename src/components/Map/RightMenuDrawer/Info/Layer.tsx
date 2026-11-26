import { Fragment, type ReactNode } from 'react'
import Linkify from 'linkify-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import type { MapInfoLayer } from '../../../../store.ts'
import { useOwnLayerScope } from '../../../../modules/useOwnLayerScope.ts'
import { useNavRollups } from '../../../../modules/navRollupsContext.ts'
import { SafeHtml } from '../../../shared/SafeHtml.tsx'
import { OwnHit } from './OwnHit.tsx'
import styles from './Layer.module.css'

type LayerData = MapInfoLayer & { html?: string; json?: unknown; text?: string }

// Look up just the inspected features, not every feature drawn on the map.
const SubprojectLabel = ({
  layer,
  projectId,
}: {
  layer: MapInfoLayer
  projectId: string
}) => {
  const { formatMessage } = useIntl()
  const { projectRow } = useNavRollups()
  const placeId = layer.ownTable === 'place' ? layer.ownId : layer.ownPlaceId
  const source =
    layer.ownObservationId ?
      `(SELECT i.subproject_id FROM observations o
      JOIN observation_imports i USING (observation_import_id) WHERE o.observation_id = $2)`
    : layer.ownSubprojectId ? '$2'
    : `(SELECT coalesce(p.subproject_id, parent.subproject_id) FROM places p
        LEFT JOIN places parent ON parent.place_id = p.parent_id WHERE p.place_id = $2)`
  const row = useLiveQuery<{ label: string }>(
    `SELECT coalesce(nullif(s.label,''), nullif(s.name,''), s.subproject_id::text) AS label
     FROM subprojects s WHERE s.project_id = $1 AND s.subproject_id = ${source}`,
    [projectId, layer.ownObservationId ?? layer.ownSubprojectId ?? placeId],
  )?.rows[0]
  if (!row) return null
  const term =
    projectRow(projectId)?.subproject_name_singular_current ||
    formatMessage({ id: 'gxCh0c', defaultMessage: 'Teilprojekt' })
  return (
    <div className={styles.subproject}>
      {term}: {row.label}
    </div>
  )
}

const Properties = ({ properties = [], text, json, html, ownId }: LayerData) => {
  if (text) return <div className={styles.text}>{text}</div>
  if (json)
    return <pre className={styles.text}>{JSON.stringify(json, null, 2)}</pre>
  if (html)
    return (
      <SafeHtml
        html={html}
        className={`${styles.text} ${styles.html}`}
      />
    )
  return (
    <div className={styles.propertyList} data-properties-for={ownId}>
      {properties.map(([key, value], i) => {
        const stripe = i % 2 === 0 ? ` ${styles.rowEven}` : ''
        return (
          <Fragment key={`${i}/${key}`}>
            <div className={`${styles.label}${stripe}`}>{key}</div>
            <Linkify options={{ target: '_blank' }}>
              <div className={`${styles.text}${stripe}`}>
                {value as ReactNode}
              </div>
            </Linkify>
          </Fragment>
        )
      })}
    </div>
  )
}

export const Layer = ({ layerData }: { layerData: LayerData }) => {
  const { ownId, ownTable } = layerData
  const id = layerData.ownObservationId ?? ownId
  const table = layerData.ownObservationId ? 'observation' : ownTable
  const { projectId, subprojectId } = useOwnLayerScope()
  const properties = <Properties {...layerData} />
  return (
    <div className={styles.container} data-info-for={id}>
      <div className={styles.title}>
        {projectId &&
          !subprojectId &&
          (ownTable || layerData.ownObservationId) && (
            <SubprojectLabel
              layer={layerData}
              projectId={projectId}
            />
          )}
        {layerData.featureLabel || layerData.label}
      </div>
      {id && table ?
        <OwnHit
          key={`${table}/${id}`}
          layer={layerData}
          id={id}
          table={table}
        >
          {properties}
        </OwnHit>
      : properties}
    </div>
  )
}
