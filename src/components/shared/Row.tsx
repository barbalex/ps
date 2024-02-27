import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const imgStyle = {
  flexBasis: 50,
  flexGrow: 0,
  objectFit: 'cover',
}
const imgDivStyle = {
  flexBasis: 50,
  flexGrow: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
}
const labelStyle = {
  flexGrow: 1,
}

export const Row = ({ label, to, imgSrc, lastHasImages = false }) => {
  const navigate = useNavigate()
  const onClickLabel = useCallback(() => navigate(to), [navigate, to])
  const onClickImg = useCallback(
    () => navigate(`${to}/preview`),
    [navigate, to],
  )

  return (
    <div className="row">
      {imgSrc ? (
        <img
          onClick={onClickImg}
          src={imgSrc}
          alt={label}
          style={imgStyle}
          width="50"
          height="50"
        />
      ) : lastHasImages ? (
        <div onClick={onClickImg} style={imgDivStyle} />
      ) : (
        <div />
      )}
      <div onClick={onClickLabel} style={labelStyle}>
        {label}
      </div>
    </div>
  )
}
