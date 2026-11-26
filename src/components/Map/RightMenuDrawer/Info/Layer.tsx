import { Fragment, type ReactNode } from 'react'
import Linkify from 'linkify-react'

import type { MapInfoLayer } from '../../../../store.ts'
import { SafeHtml } from '../../../shared/SafeHtml.tsx'
import { OwnHit } from './OwnHit.tsx'
import styles from './Layer.module.css'

type LayerData = MapInfoLayer & { html?: string; json?: unknown; text?: string }

const Properties = ({ properties = [], text, json, html }: LayerData) => {
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
    <div className={styles.propertyList}>
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
  const properties = <Properties {...layerData} />
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {layerData.featureLabel || layerData.label}
      </div>
      {ownId && ownTable ?
        <OwnHit
          key={`${ownTable}/${ownId}`}
          layer={layerData}
          id={ownId}
          table={ownTable}
        >
          {properties}
        </OwnHit>
      : properties}
    </div>
  )
}
