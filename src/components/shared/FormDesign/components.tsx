import styles from './FormDesign.module.css'

/**
 * Layout and content components of a form design, used by both the design
 * editor and the runtime renderer (they are plain React components — the
 * Puck config in buildFormDesignConfig wraps them).
 */

// a grid with N equal columns; fields are dropped into it and flow cell by
// cell. Wider widgets go outside the grid, on the design's root level
export const Grid = ({
  columns = 3,
  gap = 12,
  children,
}: {
  columns?: number
  gap?: number
  children?: React.ReactNode | (() => React.ReactNode)
}) => (
  <div
    className={styles.grid}
    style={{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: `${gap}px`,
    }}
  >
    {/* Puck hands slots to render components as functions (SlotComponent) */}
    {typeof children === 'function' ? children() : children}
  </div>
)

export const Heading = ({
  text = '',
  level = 3,
}: {
  text?: string
  level?: number
}) => {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5'
  return <Tag className={styles.heading}>{text}</Tag>
}

// images live inside the design jsonb as compressed data URLs, so they
// render offline and print without a network round-trip (see PuckImageField
// for the compression)
export const FormImage = ({
  src = '',
  alt = '',
  width = '50%',
}: {
  src?: string
  alt?: string
  width?: string
}) => {
  if (!src) return null
  return (
    <div className={styles.imageWrapper}>
      <img
        src={src}
        alt={alt}
        style={{ width }}
        className={styles.image}
      />
    </div>
  )
}

export const Spacer = ({ height = 24 }: { height?: number }) => (
  <div style={{ height: `${height}px` }} />
)

// only visible in print; a faint hint line in the editor so the component
// is not invisible while designing
export const PageBreak = () => <div className={styles.pageBreak} />
