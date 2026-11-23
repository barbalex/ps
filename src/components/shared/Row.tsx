import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import styles from './Row.module.css'

type Props = {
  // can be an element (e.g. observations' Absenz badge next to the label)
  label: React.ReactNode
  to: string
  onClick?: () => void
  imgSrc?: string
  lastHasImages?: boolean
  onDelete?: () => void
  isActive?: boolean
}

export const Row = ({
  label,
  to,
  onClick,
  imgSrc,
  lastHasImages = false,
  onDelete,
  isActive = false,
}: Props) => {
  const navigate = useNavigate()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSwiping, setIsSwiping] = useState(false)
  const [rowWidth, setRowWidth] = useState(0)
  const startXRef = useRef(0)
  const rowRef = useRef<HTMLDivElement>(null)

  const onClickLabel = () => {
    // when used in map drawer, we don't want to navigate
    if (onClick) return onClick()

    navigate({ to })
  }

  const onClickImg = () => navigate({ to: `${to}/preview` })

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onDelete) return
    startXRef.current = e.touches[0].clientX
    setRowWidth(rowRef.current?.offsetWidth || 0)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onDelete || showConfirm || !isSwiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    // Only allow right swipe
    setSwipeOffset(diff > 0 ? diff : 0)
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (!onDelete) return

    const swipePercentage = (swipeOffset / rowWidth) * 100

    if (swipePercentage >= 30) {
      // Show confirm/cancel buttons
      setShowConfirm(true)
      setSwipeOffset(rowWidth * 0.3) // Lock at 30%
    } else {
      // Reset if swipe is less than 30%
      setSwipeOffset(0)
    }
  }

  // e.g. the browser took over the gesture for vertical scrolling —
  // without resetting, the row stays stuck half-swiped
  const handleTouchCancel = () => {
    setIsSwiping(false)
    setSwipeOffset(0)
  }

  const handleConfirmDelete = () => {
    onDelete?.()
    setShowConfirm(false)
    setSwipeOffset(0)
  }

  const handleCancelDelete = () => {
    setShowConfirm(false)
    setSwipeOffset(0)
  }

  const swipePercentage = rowWidth > 0 ? (swipeOffset / rowWidth) * 100 : 0
  const isOverThreshold = swipePercentage >= 30

  return (
    <div
      ref={rowRef}
      className={`row ${styles.rowContainer}`}
      style={{ '--swipe-offset': `${swipeOffset}px` } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {onDelete && (
        <div className={styles.deleteBackground}>
          <div
            className={`${styles.deleteIcon} ${isOverThreshold ? styles.deleteIconRed : ''}`}
          >
            🗑️
          </div>
        </div>
      )}
      {showConfirm && (
        <div className={styles.confirmContainer}>
          <button
            className={styles.confirmButton}
            onClick={handleConfirmDelete}
          >
            ✓
          </button>
          <button className={styles.cancelButton} onClick={handleCancelDelete}>
            ✕
          </button>
        </div>
      )}
      <div
        className={`${styles.rowContent}${isSwiping || showConfirm ? ` ${styles.rowContentNoTransition}` : ''}${isActive ? ` ${styles.rowContentActive}` : ''}`}
      >
        {imgSrc ? (
          <img
            onClick={showConfirm ? undefined : onClickImg}
            src={imgSrc}
            alt={typeof label === 'string' ? label : ''}
            className={styles.img}
            width="50"
            height="50"
          />
        ) : lastHasImages ? (
          <div onClick={showConfirm ? undefined : onClickImg} className={styles.imgDiv} />
        ) : (
          <div />
        )}
        <div onClick={showConfirm ? undefined : onClickLabel} className={styles.label}>
          {label}
        </div>
      </div>
    </div>
  )
}
