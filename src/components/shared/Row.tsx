import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

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

export const Row = memo(({ label, to, imgSrc, lastHasImages = false }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onClickLabel = useCallback(
    () => navigate({ pathname: to, search: searchParams.toString() }),
    [navigate, searchParams, to],
  )
  const onClickImg = useCallback(
    () =>
      navigate({ pathname: `${to}/preview`, search: searchParams.toString() }),
    [navigate, searchParams, to],
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
})
