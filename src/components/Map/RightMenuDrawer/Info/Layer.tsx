import { Fragment } from 'react'
import Linkify from 'react-linkify'

const containerStyle = {
  borderBottom: '1px solid #ccc',
  padding: '10px 0 0 0',
}
const titleStyle = {
  margin: 0,
  paddingBottom: 5,
  paddingLeft: 10,
  paddingRight: 10,
  fontWeight: 'bold',
}
const propertyListStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(100px, 30%) 1fr',
}

const baseTextStyle = {
  padding: 5,
  fontSize: '0.9em',
  lineHeight: '1.4em',
  overflowWrap: 'anywhere',
  color: 'black',
}
const textStyle = {
  ...baseTextStyle,
  paddingRight: 10,
}
const labelStyle = {
  ...baseTextStyle,
  fontWeight: 'bold',
  color: 'rgba(0, 0, 0, 0.5)',
  borderRight: '1px solid rgba(0, 0, 0, 0.2)',
  paddingLeft: 10,
  paddingRight: 5,
}

export const Layer = ({ layerData }) => {
  const { label, properties = [], html, json, text } = layerData
  // console.log('Map Info Drawer Layer', { label, properties, html, json, text })

  if (text) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>{label}</div>
        <div style={textStyle}>{text}</div>
      </div>
    )
  }

  if (json) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>{label}</div>
        <pre style={textStyle}>{JSON.stringify(json, null, 2)}</pre>
      </div>
    )
  }

  if (html) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>{label}</div>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{label}</div>
      <div style={propertyListStyle}>
        {properties.map((p, i) => {
          const key = p[0]
          const value = p[1]
          const backgroundColor = i % 2 === 0 ? 'rgba(0, 0, 0, 0.05)' : 'unset'

          return (
            <Fragment key={`${i}/${key}`}>
              <div style={{ ...labelStyle, backgroundColor }}>{key}</div>
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a
                    target="blank"
                    href={decoratedHref}
                    key={key}
                  >
                    {decoratedText}
                  </a>
                )}
              >
                <div style={{ ...textStyle, backgroundColor }}>{value}</div>
              </Linkify>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
