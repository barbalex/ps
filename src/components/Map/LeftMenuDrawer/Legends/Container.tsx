const containerStyle = {
  padding: 10,
}
const titleStyle = {
  fontWeight: 'bold',
  paddingBottom: 5,
}

export const Container = ({ children, layer, isLast }) => (
  <section
    style={{
      ...containerStyle,
      borderTop: '1px solid rgba(55, 118, 28, 0.5)',
      ...(isLast ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' } : {}),
    }}
  >
    <div style={titleStyle}>{layer.label}</div>
    {children}
  </section>
)
