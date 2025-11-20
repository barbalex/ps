const labelStyle = {
  marginTop: '10px',
  cursor: 'text',
  fontSize: '0.8rem',
  color: 'rgba(0, 0, 0, 0.8)',
  pointerEvents: 'none',
  userSelect: 'none',
  paddingBottom: '8px',
}

// TODO: use fluent ui label
export const Label = ({ label }: { label: string }) => (
  <div style={labelStyle}>{label}</div>
)
