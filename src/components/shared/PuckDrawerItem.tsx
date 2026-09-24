import { createUsePuck } from '@puckeditor/core'

const usePuckStore = createUsePuck()

/**
 * Drawer card override for the design editors: the drawer truncates long
 * labels, so show the full label as a native tooltip on hover.
 */
export const PuckDrawerItem = ({
  children,
  name,
}: {
  children: React.ReactNode
  name: string
}) => {
  const label = usePuckStore((s) => s.config.components[name]?.label)
  return (
    <div title={label != null ? String(label) : name}>{children}</div>
  )
}
