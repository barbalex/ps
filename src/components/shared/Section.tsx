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
      <div ref={sentinelRef} style={{ height: 1, marginTop: -1 }} />
      <h2
        className={`${styles.title}${isStuck ? ` ${styles.titleStuck}` : ''}`}
        onClick={onNavigate ?? effectiveHeaderClick}
        style={
          effectiveHeaderClick || onNavigate
            ? {
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                ...titleStyle,
              }
            : titleStyle
        }
      >
        <span style={{ minWidth: 0, flex: '1 1 auto' }}>{title}</span>
        {(headerActions || isOpen !== undefined) && (
          <span
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: 'auto',
              paddingLeft: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
            {isOpen !== undefined && (
              <span
                style={{
                  fontSize: '1.3em',
                  width: 32,
                  height: 31.2,
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.10)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() =>
                  (isOpen
                    ? (effectiveChevronClick ?? effectiveHeaderClick)
                    : effectiveHeaderClick)?.()
                }
              >
                <FaChevronDown
                  style={{
                    transition: 'transform 0.25s ease',
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
          className={styles.children}
          style={
            isOpen
              ? { borderTop: '1px solid #cccccc9d', ...childrenStyle }
              : childrenStyle
          }
        >
          {children}
        </div>
      )}
    </section>
  )
}
