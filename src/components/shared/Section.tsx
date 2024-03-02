import { memo } from 'react'

const sectionStyle = {
  margin: '5px 0',
  padding: '5px 10px',
  backgroundColor: 'rgb(225, 247, 224)',
  fontSize: '1em',
  marginLeft: -10,
  marginRight: -10,
  position: 'sticky',
  top: -12,
  zIndex: 1,
}

// need to place children under their own parent
// because some have position: relative which makes them overlay the section title
export const Section = memo(({ title, children }) => (
  <section>
    <h2 style={sectionStyle}>{title}</h2>
    {children}
  </section>
))
