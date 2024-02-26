import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const imgStyle = {
  flexBasis: 50,
  flexGrow: 0,
}
const imgDivStyle = {
  flexBasis: 50,
  flexGrow: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
}
const labelStyle = {
  flexGrow: 1,
}

export const Row = ({ label, to, imgSrc }) => {
  const navigate = useNavigate()
  const onClick = useCallback(() => {
    navigate(to)
  }, [navigate, to])

  return (
    <div className="row" onClick={onClick}>
      {imgSrc ? (
        <img src={imgSrc} alt={label} style={imgStyle} />
      ) : (
        <div style={imgDivStyle} />
      )}
      <div style={labelStyle}>{label}</div>
    </div>
  )
}
