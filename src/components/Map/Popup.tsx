import Linkify from 'react-linkify'

import { css } from '../../css'

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '85px 1fr',
  fontSize: 'x-small !important',
}
const titleStyle = {
  marginTop: 0,
  marginBottom: 8,
}
const labelStyle = {
  color: 'rgba(0, 0, 0, 0.6)',
  overflowWrap: 'anywhere',
}
const valueStyle = {
  overflowWrap: 'anywhere',
}

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
          <div
            style={css({
              ...titleStyle,
              '&:not(:first-of-type)': {
                marginTop: 8,
              },
            })}
          >
            {ld.label}
          </div>
          {ld.properties.map(([key, value], index) => (
            <div
              style={css({
                ...rowStyle,
                '&:nth-child(odd)': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  color: 'black',
                },
              })}
              key={`${key}/${index}`}
            >
              <div style={labelStyle}>{`${key}:`}</div>
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a target="blank" href={decoratedHref} key={key}>
                    {decoratedText}
                  </a>
                )}
              >
                <div style={valueStyle}>{value}</div>
              </Linkify>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
