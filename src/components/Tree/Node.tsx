const labelStyle = {
  fontSize: '1em',
  flexGrow: 1,
  paddingLeft: 5,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&:hover': {
    backgroundColor: 'rgba(55, 118, 28, 0.05)',
    cursor: 'pointer',
  },
}

export const Node = ({ inActiveNodeArray, active, level, node }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: inActiveNodeArray ? 'bold' : 'normal',
        ...(active && { color: 'red' }),
        marginLeft: level * 28,
      }}
    >
      <div style={labelStyle}>{node.label}</div>
    </div>
  )
}
