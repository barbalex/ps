import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import styles from './Row.module.css'

export const Row = ({
  label,
  to,
  onClick,
  imgSrc,
  lastHasImages = false,
  onDelete,
}) => {
  const navigate = useNavigate()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
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
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onDelete || showConfirm) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    // Only allow right swipe
    if (diff > 0) {
      setSwipeOffset(diff)
    }
  }

  const handleTouchEnd = () => {
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {onDelete && (
        <div
          className={styles.deleteBackground}
          style={{
            width: `${swipeOffset}px`,
          }}
        >
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
          <button
            className={styles.cancelButton}
            onClick={handleCancelDelete}
          >
            ✕
          </button>
        </div>
      )}
      <div
        className={styles.rowContent}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: showConfirm ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {imgSrc ?
          <img
            onClick={onClickImg}
            src={imgSrc}
            alt={label}
            className={styles.img}
            width="50"
            height="50"
          />
        : lastHasImages ?
          <div
            onClick={onClickImg}
            className={styles.imgDiv}
          />
        : <div />}
        <div
          onClick={onClickLabel}
          className={styles.label}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
