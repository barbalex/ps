import { Fragment, type ReactNode } from 'react'
import Linkify from 'linkify-react'

import type { MapInfoLayer } from '../../../../store.ts'
import { SafeHtml } from '../../../shared/SafeHtml.tsx'
import { Row } from '../../../shared/Row.tsx'
import { AbsenzBadge } from '../../../shared/AbsenzBadge.tsx'
import { OwnHit } from './OwnHit.tsx'
import styles from './Layer.module.css'

type LayerData = MapInfoLayer & { html?: string; json?: unknown; text?: string }

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

export const Layer = ({ layerData, subprojectLabel, onChoose }: { layerData: LayerData; subprojectLabel?: string; onChoose?: () => void }) => {
  const { ownId, ownTable } = layerData
  const id = layerData.ownObservationId ?? ownId
  const table = layerData.ownObservationId ? 'observation' : ownTable
  const properties = <Properties {...layerData} />
  const title = (
    <>
        {subprojectLabel && <div className={styles.subproject}>{subprojectLabel}</div>}
        {layerData.featureLabel || id || layerData.label}
    </>
  )
  if (onChoose && id) return (
    <div className="list-container" data-info-for={id}>
      <Row
        label={<>{title}{layerData.ownObservationId && layerData.properties.some(([key, value]) => key === 'absence' && value === true) && <AbsenzBadge />}</>}
        to={id}
        onClick={onChoose}
      />
    </div>
  )
  return (
    <div className={styles.container} data-info-for={id}>
      <div className={styles.title}>{title}</div>
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
