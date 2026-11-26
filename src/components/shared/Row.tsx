import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useMapInfoForm } from '../../modules/mapInfoFormContext.ts'

import styles from './Row.module.css'

type Props = {
  // can be an element (e.g. observations' Absenz badge next to the label)
  label: React.ReactNode
  to: string
  onClick?: () => void
  imgSrc?: string
  lastHasImages?: boolean
  onDelete?: () => void | Promise<unknown>
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
  const mapForm = useMapInfoForm()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rowWidth, setRowWidth] = useState(0)
  const startXRef = useRef(0)
  const rowRef = useRef<HTMLDivElement>(null)
  // touchmove updates are deferred by react (continuous event), so the
  // release decision must read the offset from here, not from state —
  // otherwise touchend can see a stale offset and miss the threshold
  const swipeOffsetRef = useRef(0)

  const onClickLabel = () => {
    // when used in map drawer, we don't want to navigate
    if (onClick) return onClick()

    navigate({ to, ...(mapForm && { search: true }) })
  }

  const onClickImg = () => navigate({ to: `${to}/preview`, ...(mapForm && { search: true }) })

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onDelete) return
    startXRef.current = e.touches[0].clientX
    swipeOffsetRef.current = 0
    setRowWidth(rowRef.current?.offsetWidth || 0)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onDelete || !isSwiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    // Only allow right swipe
    const offset = diff > 0 ? diff : 0
    swipeOffsetRef.current = offset
    setSwipeOffset(offset)
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (!onDelete) return

    // released past the threshold (red bin): gmail-style delete — the row
    // collapses (rows below slide up, the bin gets squished) and the live
    // query removes it once the delete lands. if the delete does not land
    // (e.g. permission denied and reverted), the promise settling slides
    // the row back open. released before the threshold: nothing deleted,
    // the row slides back to the resting position.
    const swipePercentage = (swipeOffsetRef.current / rowWidth) * 100
    if (swipePercentage >= 30) {
      setIsDeleting(true)
      Promise.resolve(onDelete()).finally(() => {
        setIsDeleting(false)
        setSwipeOffset(0)
      })
      return
    }
    setSwipeOffset(0)
  }

  // e.g. the browser took over the gesture for vertical scrolling —
  // without resetting, the row stays stuck half-swiped
  const handleTouchCancel = () => {
    setIsSwiping(false)
    swipeOffsetRef.current = 0
    setSwipeOffset(0)
  }

  const swipePercentage = rowWidth > 0 ? (swipeOffset / rowWidth) * 100 : 0
  const isOverThreshold = swipePercentage >= 30

  return (
    <div
      ref={rowRef}
      className={`row ${styles.rowContainer}`}
      style={
        {
          '--swipe-offset': `${swipeOffset}px`,
          ...(isDeleting ? { height: 0, '--delete-scale': 0 } : null),
        } as React.CSSProperties
      }
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
      <div
        className={`${styles.rowContent}${isSwiping ? ` ${styles.rowContentNoTransition}` : ''}${isActive ? ` ${styles.rowContentActive}` : ''}`}
      >
        {imgSrc ? (
          <img
            onClick={onClickImg}
            src={imgSrc}
            alt={typeof label === 'string' ? label : ''}
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
    </div>
  )
}
