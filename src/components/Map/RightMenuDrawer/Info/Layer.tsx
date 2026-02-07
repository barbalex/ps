import { Fragment } from 'react'
import Linkify from 'react-linkify'

import styles from './Layer.module.css'

export const Layer = ({ layerData }) => {
  const { label, featureLabel, properties = [], html, json, text } = layerData
  const titleToShow = featureLabel || label
  // console.log('Map Info Drawer Layer', { label, properties, html, json, text })

  if (text) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        <div className={styles.text}>{text}</div>
      </div>
    )
  }

  if (json) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        <pre className={styles.text}>{JSON.stringify(json, null, 2)}</pre>
      </div>
    )
  }

  if (html) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{titleToShow}</div>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{titleToShow}</div>
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
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a target="blank" href={decoratedHref} key={key}>
                    {decoratedText}
                  </a>
                )}
              >
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
