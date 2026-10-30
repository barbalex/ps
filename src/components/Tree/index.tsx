// TanStack Virtual is incompatible with React Compiler memoization
'use no memo'

import { useVirtualizer } from '@tanstack/react-virtual'
import type { Virtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'
import { Editing } from './Project/Editing.tsx'
import { Registrar } from './virtual/Registrar.tsx'
import { useVisibleTreeRows } from './virtual/useVisibleTreeRows.ts'
import type { TreeRow } from './virtual/useVisibleTreeRows.ts'
import { treeConfigs, useTreeRoots } from './virtual/treeConfigs.tsx'
import { treeRegisteredRowsAtom } from './virtual/atoms.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { operationsQueueAtom } from '../../store.ts'

import styles from './index.module.css'

/**
 * Scrolls the active node into view (port of apf2's approach):
 * the row is found by key in the flattened rows and scrolled to via
 * virtualizer.scrollToIndex, driven by rows changes. Urls without their
 * own row scroll to the deepest existing ancestor instead.
 */
const useScrollActiveNodeIntoView = (
  rows: TreeRow[],
  virtualizer: Virtualizer<HTMLDivElement, Element>,
) => {
  const { pathname } = useLocation()
  const rowsRef = useRef(rows)
  const virtualizerRef = useRef(virtualizer)
  const scrolledForKeyRef = useRef<string | null>(null)
  const ancestorScrolledForKeyRef = useRef<string | null>(null)

  useEffect(() => {
    rowsRef.current = rows
    virtualizerRef.current = virtualizer
  })

  useEffect(() => {
    const urlPath = pathname.split('/').filter((p) => p !== '')
    if (!urlPath.length) return
    const focusKey = JSON.stringify(urlPath)
    if (scrolledForKeyRef.current === focusKey) return

    const index = rowsRef.current.findIndex((row) => row.key === focusKey)
    if (index === -1) {
      // no exact row (yet): scroll to the deepest existing ancestor, once
      // per ancestor - progressively descends while rows register
      let ancestor = null as null | (typeof rowsRef.current)[number]
      for (let i = rowsRef.current.length - 1; i >= 0; i--) {
        const row = rowsRef.current[i]
        if (!row) continue
        const rowArray = row.row.ownArray
        if (rowArray.length >= urlPath.length) continue
        if (!isEqual(rowArray, urlPath.slice(0, rowArray.length))) continue
        ancestor = row
        break
      }
      if (!ancestor) return
      if (ancestorScrolledForKeyRef.current === ancestor.key) return
      ancestorScrolledForKeyRef.current = ancestor.key
      const ancestorIndex = rowsRef.current.indexOf(ancestor)
      virtualizerRef.current.scrollToIndex(ancestorIndex, { align: 'center' })
      return
    }
    scrolledForKeyRef.current = focusKey
    const virtualItems = virtualizerRef.current.getVirtualItems()
    const firstIndex = virtualItems[0]?.index
    const lastIndex = virtualItems.at(-1)?.index
    if (
      firstIndex !== undefined &&
      lastIndex !== undefined &&
      index >= firstIndex &&
      index <= lastIndex
    )
      return
    virtualizerRef.current.scrollToIndex(index, { align: 'center' })
  }, [pathname, rows])
}

/**
 * loads children of the active node's ancestors even when their rows are
 * outside the virtualized window (scroll-into-view deadlock)
 */
const FocusPathLoader = ({ rows }: { rows: TreeRow[] }) => {
  const { pathname } = useLocation()
  const registeredRows = useAtomValue(treeRegisteredRowsAtom)

  // find the deepest row that is an ancestor of the active node; if the
  // next row on the url path has no registered row yet, mount its
  // registrar. Synthesized rows render without registration - only rows
  // ON the path need loading (their children build the path below)
  const urlPath = pathname.split('/').filter((p) => p !== '')
  let toLoad: { type: string; params: Record<string, unknown>; nav?: Record<string, unknown>; level: number } | null = null
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]?.row
    if (!row) continue
    const rowArray = row.ownArray
    if (rowArray.length >= urlPath.length) continue
    if (!isEqual(rowArray, urlPath.slice(0, rowArray.length))) continue
    for (const child of row.children ?? []) {
      const nav = (child.nav ?? {}) as { id?: string }
      if (!nav.id) continue
      const childArray = [
        ...rowArray,
        ...String(nav.id).split('/').filter(Boolean),
      ]
      // only the child that is itself on the url path
      if (
        childArray.length > urlPath.length ||
        !isEqual(childArray, urlPath.slice(0, childArray.length))
      )
        continue
      const childKey = JSON.stringify(childArray)
      if (!registeredRows.has(childKey)) toLoad = child
    }
    break
  }

  if (!toLoad) return null
  return <Registrar
    key={`${toLoad.type}-${toLoad.nav?.id ?? ''}`}
    type={toLoad.type}
    params={toLoad.params}
    nav={toLoad.nav}
    level={toLoad.level}
  />
}

export const Tree = () => {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const rows = useVisibleTreeRows()
  const roots = useTreeRoots()
  const operationsQueue = useAtomValue(operationsQueueAtom)
  const { pathname } = useLocation()
  const urlPath = pathname.split('/').filter((p) => p !== '')
  const navigate = useNavigate()

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 22,
    getItemKey: (index) => rows[index]?.key ?? index,
    getScrollElement: () => scrollElementRef.current,
    overscan: 15,
  })

  useScrollActiveNodeIntoView(rows, virtualizer)

  return (
    <div
      className={`${styles.container} no-print`}
      ref={scrollElementRef}
    >
      {roots.map((root) => (
        <Registrar
          key={root.type}
          type={root.type}
          params={root.params}
          level={1}
        />
      ))}
      {operationsQueue.length > 0 && (
        <Registrar
          type="queuedOperations"
          params={{}}
          level={1}
        />
      )}
      <FocusPathLoader rows={rows} />
      <div
        className={styles.rows}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null
          const { row: registered } = row
          const ownArray = registered.ownArray
          const isOpen = row.isOpen
          const isInActiveNodeArray = ownArray.every(
            (part, i) => urlPath[i] === part,
          )
          const isActive = isEqual(urlPath, ownArray)
          const parentArray = ownArray.slice(0, -1)
          const parentUrl = `/${parentArray.join('/')}`

          const onClickButton = () => {
            if (isOpen) {
              void removeChildNodes({ node: ownArray, isRoot: registered.isRoot })
              if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
                navigate({ to: parentUrl })
              }
              return
            }
            addOpenNodes({ nodes: [ownArray] })
          }

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className={styles.row}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <Node
                label={registered.label}
                id={registered.id}
                level={registered.level}
                isOpen={isOpen}
                isInActiveNodeArray={isInActiveNodeArray}
                isActive={isActive}
                childrenCount={registered.childrenCount}
                to={registered.to}
                toParams={registered.toParams}
                onClickButton={onClickButton}
                sibling={
                  registered.siblingType === 'editing' ?
                    <Editing projectId={ownArray[2] ?? ''} />
                  : undefined
                }
              />
              {isOpen && registered.descriptor && (
                <Registrar
                  key={`${registered.descriptor.type}-${registered.key}`}
                  type={registered.descriptor.type}
                  params={registered.descriptor.params}
                  nav={registered.descriptor.nav}
                  level={registered.descriptor.level}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// keep the config table referenced for types that are not mounted yet
void treeConfigs
