import Linkify from 'linkify-react'

import styles from './Popup.module.css'

export const Popup = ({
  layersData,
  mapSize = {},
  // src
}) => {
  // if (src) {
  //   return (
  //     <iframe
  //       id="inlineFrameExample"
  //       title="Inline Frame Example"
  //       width={mapSize.y - 40}
  //       height={mapSize.x - 60}
  //       src={src}
  //       style={{ border: 'none' }}
  //     ></iframe>
  //   )
  // }
  return (
    <div
      style={{
        '--popup-max-height': `${Math.max((mapSize?.y ?? 0) - 40, 0)}px`,
        '--popup-max-width': `${Math.max((mapSize?.x ?? 0) - 60, 0)}px`,
      } as React.CSSProperties}
      className={`${styles.container} ${styles.containerSized}`}
    >
      {layersData.map((ld, index) => (
        <div key={`${ld.label}/${index}`}>
          <div className={styles.title}>{ld.label}</div>
          {ld.properties.map(([key, value], index) => (
            <div className={styles.row} key={`${key}/${index}`}>
              <div className={styles.label}>{`${key}:`}</div>
              <Linkify options={{ target: '_blank' }}>
                <div className={styles.value}>{value}</div>
              </Linkify>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
