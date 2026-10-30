import type { ReactNode } from 'react'

/**
 * ordered child descriptor, registered by a Registrar
 */
export interface TreeChild {
  // identifies the child within its parent (nav.id or index)
  orderKey: string
  // node type, key into treeConfigs
  type: string
  // params for the type's hook
  params: Record<string, unknown>
  // nav object from the parent's navs (label, id, counts...)
  nav?: Record<string, unknown>
  level: number
}

/**
 * a registered tree row. Live state (isOpen, isActive, isInActiveNodeArray)
 * is derived in the walker/renderer from treeOpenNodesAtom and the url,
 * NOT stored here - registrations can be stale while a row is outside
 * the virtualized window
 */
export interface TreeRegisteredRow {
  // JSON.stringify(ownArray) - unique row identity
  key: string
  ownArray: string[]
  isRoot?: boolean
  label: ReactNode
  level: number
  to: string
  toParams?: Record<string, string>
  id?: string
  childrenCount: number
  siblingType?: 'editing'
  children?: TreeChild[]
}

export interface NavDataLike {
  // can contain undefined while the row's own data is still loading
  ownArray: (string | undefined)[]
  label: ReactNode
  ownUrl: string
  navs?: Record<string, unknown>[]
  notFound?: boolean
  // marker, not an element: the row renderer materializes it
  // (elements would break the deep-equal registration guard)
  siblingType?: 'editing'
}

/**
 * per node type: how to run its navData hook and how to build
 * its ordered children descriptors
 */
export interface TreeNodeConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook: (params: any, nav: any) => NavDataLike
  isRoot?: boolean
  children?: (ctx: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nav: any
    navData: NavDataLike
    // this row's level (from its descriptor)
    level: number
  }) => TreeChild[]
}
