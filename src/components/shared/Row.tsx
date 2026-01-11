import { useNavigate } from '@tanstack/react-router'

import styles from './Row.module.css'

export const Row = ({ label, to, onClick, imgSrc, lastHasImages = false }) => {
  const navigate = useNavigate()

  const onClickLabel = () => {
    // when used in map drawer, we don't want to navigate
    if (onClick) return onClick()

    navigate({ to })
  }

  const onClickImg = () => navigate({ to: `${to}/preview` })

  return (
    <div className="row">
      {imgSrc ? (
        <img
          onClick={onClickImg}
          src={imgSrc}
          alt={label}
          className={styles.img}
          width="50"
          height="50"
        />
      ) : lastHasImages ? (
        <div onClick={onClickImg} className={styles.imgDiv} />
      ) : (
        <div />
      )}
      <div onClick={onClickLabel} className={styles.label}>
        {label}
      </div>
    </div>
  )
}
