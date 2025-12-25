import Linkify from 'react-linkify'

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
        overflow: 'auto',
        maxHeight: mapSize.y - 40,
        maxWidth: mapSize.x - 60,
        marginRight: -5,
      }}
    >
      {layersData.map((ld, index) => (
        <div key={`${ld.label}/${index}`}>
          <div className={styles.title}>{ld.label}</div>
          {ld.properties.map(([key, value], index) => (
            <div className={styles.row} key={`${key}/${index}`}>
              <div className={styles.label}>{`${key}:`}</div>
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a target="blank" href={decoratedHref} key={key}>
                    {decoratedText}
                  </a>
                )}
              >
                <div className={styles.value}>{value}</div>
              </Linkify>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
