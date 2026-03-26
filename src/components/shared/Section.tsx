import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

import styles from './Section.module.css'

// need to place children under their own parent
// because some have position: relative which makes them overlay the section title
export const Section = ({
  title,
  children,
  onHeaderClick = undefined,
  onNavigate = undefined,
  isOpen = undefined,
  titleStyle = undefined,
  childrenStyle = undefined,
  headerActions = undefined,
}) => (
  <section>
    <h2
      className={styles.title}
      onClick={onNavigate ?? onHeaderClick}
      style={
        onHeaderClick || onNavigate
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
      {title}
      {(headerActions || isOpen !== undefined) && (
        <span
          style={{
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
                padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(0,0,0,0.10)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
              onClick={() => onHeaderClick?.()}
            >
              {isOpen ? <FaChevronDown /> : <FaChevronUp />}
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
