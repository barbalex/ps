import { useNavigate, useLocation } from '@tanstack/react-router'
import { FaChevronDown } from 'react-icons/fa'
import { useRef, useState, useEffect } from 'react'

import styles from './Section.module.css'

// need to place children under their own parent
// because some have position: relative which makes them overlay the section title
export const Section = ({
  title,
  children,
  onHeaderClick = undefined,
  onChevronClick = undefined,
  onNavigate = undefined,
  isOpen = undefined,
  titleStyle = undefined,
  childrenStyle = undefined,
  headerActions = undefined,
  parentUrl = undefined,
  listUrl = undefined,
}) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    // Find nearest scrollable ancestor (the form-container with overflow: auto)
    let root: HTMLElement | null = sentinel.parentElement
    while (root && root !== document.body) {
      const { overflow, overflowY } = getComputedStyle(root)
      if (/auto|scroll/.test(overflow + overflowY)) break
      root = root.parentElement
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 1, root: root !== document.body ? root : null },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const isAtList = listUrl
    ? pathname === listUrl || pathname === listUrl + '/'
    : false

  const effectiveHeaderClick =
    parentUrl && listUrl
      ? () =>
          isAtList ? navigate({ to: parentUrl }) : navigate({ to: listUrl })
      : onHeaderClick

  const effectiveChevronClick = parentUrl
    ? () => navigate({ to: parentUrl })
    : onChevronClick

  return (
    <section>
      <div ref={sentinelRef} className={styles.sentinel} />
      <h2
        className={`${styles.title}${isStuck ? ` ${styles.titleStuck}` : ''}${effectiveHeaderClick || onNavigate ? ` ${styles.titleClickable}` : ''}`}
        onClick={onNavigate ?? effectiveHeaderClick}
        style={titleStyle}
      >
        <span className={styles.titleText}>{title}</span>
        {(headerActions || isOpen !== undefined) && (
          <span
            className={styles.headerActions}
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
            {isOpen !== undefined && (
              <span
                className={styles.toggleButton}
                onClick={() =>
                  (isOpen
                    ? (effectiveChevronClick ?? effectiveHeaderClick)
                    : effectiveHeaderClick)?.()
                }
              >
                <FaChevronDown
                  className={styles.chevron}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </span>
            )}
          </span>
        )}
      </h2>
      {isOpen !== false && (
        <div
          className={`${styles.children}${isOpen ? ` ${styles.childrenOpen}` : ''}`}
          style={childrenStyle}
        >
          {children}
        </div>
      )}
    </section>
  )
}
