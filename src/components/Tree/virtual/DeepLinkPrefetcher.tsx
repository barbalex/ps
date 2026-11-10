import { useAtomValue } from 'jotai'
import { useLocation } from '@tanstack/react-router'

import { Registrar } from './Registrar.tsx'
import { treeRegisteredRowsAtom } from './atoms.ts'

interface Level {
  // same key rows are registered under: JSON.stringify(ownArray)
  key: string
  type: string
  params: Record<string, unknown>
  nav: { id: string }
  // visual row level: every hierarchy row is level = ownArray.length - 1
  level: number
}

/**
 * Registrars to mount for a deep url path, in path order.
 *
 * The treeConfigs children mappers build a child's {type, params} from the
 * parent's resolved navData - that is what makes the cascade sequential.
 * But on a deep url every id is already known, so the same descriptors can
 * be built from the path alone. The params mirror what collectionChildren/
 * entityChildren/the place children pass: entity rows receive nav: {id},
 * collections receive the parent ids they filter by, and places/files
 * receive level = their own visual row level.
 *
 * Segments without an entry here (charts, observations, users, ...) are not
 * prefetched: the sequential FocusPathLoader cascade loads them as before.
 * Levels whose children are formLink rows (quantities, taxa, files, ...)
 * end the walk - formLink rows have no hook, nothing to prefetch.
 */
const levelsForPath = (path: string[]): Level[] => {
  const levels: Level[] = []
  if (path[0] !== 'data' || path[1] !== 'projects') return levels
  const projectId = path[2]
  if (!projectId) return levels

  const ids: Record<string, string | undefined> = { projectId }
  const push = (length: number, type: string, params: Record<string, unknown>) => {
    levels.push({
      key: JSON.stringify(path.slice(0, length)),
      type,
      params,
      nav: { id: path[length - 1] },
      level: length - 1,
    })
  }
  // the ids the check/action folder mappers of a place receive
  const placeBase = () => ({
    projectId: ids.projectId,
    subprojectId: ids.subprojectId,
    placeId: ids.placeId,
    placeId2: ids.placeId2,
  })

  // entity params include nav: the config children mappers read the
  // entity id from params.nav.id (like collectionChildren passes it)
  push(3, 'project', { nav: { id: projectId } })

  let i = 3
  while (i < path.length) {
    const folder = path[i]
    const id = path[i + 1]
    if (!id) return levels

    if (folder === 'subprojects') {
      push(i + 1, 'subprojects', { projectId: ids.projectId })
      push(i + 2, 'subproject', { projectId: ids.projectId, nav: { id } })
      ids.subprojectId = id
      i += 2
      continue
    }

    if (folder === 'places' && !ids.placeId2) {
      // level-1 places hang below the subproject, nested ones below a place
      const collectionParams = ids.placeId
        ? { ...placeBase(), placeId: ids.placeId, level: i }
        : {
            projectId: ids.projectId,
            subprojectId: ids.subprojectId,
            level: i,
          }
      push(i + 1, 'places', collectionParams)
      push(i + 2, 'place', { ...collectionParams, nav: { id } })
      if (ids.placeId) ids.placeId2 = id
      else ids.placeId = id
      i += 2
      continue
    }

    if (folder === 'filtered-checks') {
      // multi-segment nav.id: filtered-checks/<filteredViewId>/checks
      const filteredViewId = path[i + 1]
      if (path[i + 2] !== 'checks') return levels
      push(i + 3, 'filteredChecks', { ...placeBase(), filteredViewId })
      ids.filteredViewId = filteredViewId
      i += 3
      continue
    }

    if (folder === 'checks' || folder === 'actions') {
      const base = placeBase()
      const collectionParams = ids.filteredViewId
        ? { ...base, filteredViewId: ids.filteredViewId }
        : base
      const type = folder === 'checks' ? 'checks' : 'actions'
      const entityType = folder === 'checks' ? 'check' : 'action'
      push(i + 1, type, collectionParams)
      push(i + 2, entityType, { ...collectionParams, nav: { id } })
      if (folder === 'checks') ids.checkId = id
      else ids.actionId = id
      i += 2
      continue
    }

    if (folder === 'goals') {
      const collectionParams = {
        projectId: ids.projectId,
        subprojectId: ids.subprojectId,
      }
      push(i + 1, 'goals', collectionParams)
      push(i + 2, 'goal', { ...collectionParams, nav: { id } })
      ids.goalId = id
      i += 2
      continue
    }

    if (folder === 'reports' && ids.goalId) {
      push(i + 1, 'goalReports', {
        projectId: ids.projectId,
        subprojectId: ids.subprojectId,
        goalId: ids.goalId,
      })
      // goal report rows are formLinks
      return levels
    }

    if (folder === 'check-reports' || folder === 'action-reports') {
      const isCheck = folder === 'check-reports'
      const listType = isCheck ? 'checkReports' : 'actionReports'
      const entityType = isCheck ? 'checkReport' : 'actionReport'
      const entityIdParam = isCheck ? 'checkReportId' : 'actionReportId'
      const base = placeBase()
      push(i + 1, listType, base)
      push(i + 2, entityType, { ...base, nav: { id } })
      if (path[i + 2] && path[i + 3] === 'quantities') {
        push(i + 4, isCheck ? 'checkReportQuantities' : 'actionReportQuantities', {
          projectId: ids.projectId,
          subprojectId: ids.subprojectId,
          placeId: ids.placeId,
          placeId2: ids.placeId2,
          [entityIdParam]: id,
        })
        // quantity rows are formLinks
        return levels
      }
      i += 2
      continue
    }

    if (folder === 'quantities' || folder === 'taxa') {
      const listType =
        folder === 'quantities' ?
          ids.checkId ? 'checkQuantities' : 'actionQuantities'
        : ids.checkId ? 'checkTaxa' : 'actionTaxa'
      const entityIdParam = ids.checkId ? 'checkId' : 'actionId'
      push(i + 1, listType, {
        projectId: ids.projectId,
        subprojectId: ids.subprojectId,
        placeId: ids.placeId,
        placeId2: ids.placeId2,
        filteredViewId: ids.filteredViewId,
        [entityIdParam]: ids.checkId ?? ids.actionId,
      })
      // quantity/taxon rows are formLinks
      return levels
    }

    if (folder === 'files') {
      // files folders exist below project, subproject, place, check, action;
      // the configs pass level below project/subproject/place but not below
      // the check/action entities
      const params: Record<string, unknown> = { projectId: ids.projectId }
      if (ids.checkId || ids.actionId) {
        params.subprojectId = ids.subprojectId
        params.placeId = ids.placeId
        params.placeId2 = ids.placeId2
        params.filteredViewId = ids.filteredViewId
        if (ids.checkId) params.checkId = ids.checkId
        else params.actionId = ids.actionId
      } else if (ids.placeId) {
        params.subprojectId = ids.subprojectId
        params.placeId = ids.placeId
        params.placeId2 = ids.placeId2
        params.level = i
      } else if (ids.subprojectId) {
        params.subprojectId = ids.subprojectId
        params.level = i
      } else {
        params.level = i
      }
      push(i + 1, 'files', params)
      // file rows are formLinks
      return levels
    }

    // unknown folder: the FocusPathLoader cascade loads it sequentially
    return levels
  }
  return levels
}

/**
 * Mounts Registrars for all levels of the active url path in parallel.
 *
 * The lazy tree registers rows level by level: a child's Registrar only
 * mounts once its parent row registered, so a deep url walks the hierarchy
 * sequentially (FocusPathLoader advances the frontier one level per
 * registration - with every level waiting on its live query, a kontrolle
 * url takes seconds). On a deep url every id is already known from the
 * path, so all levels' Registrars can run at once and the path completes
 * after the slowest single level instead of the sum of all.
 *
 * Registration is idempotent (the atom write skips equal rows), and the
 * per-open-row Registrars in the Tree (plus FocusPathLoader for folders
 * not covered above) take over the live subscriptions as rows register.
 */
export const DeepLinkPrefetcher = () => {
  const { pathname } = useLocation()
  const registeredRows = useAtomValue(treeRegisteredRowsAtom)

  const urlPath = pathname.split('/').filter((p) => p !== '')
  const levels = levelsForPath(urlPath).filter(
    (level) => !registeredRows.has(level.key),
  )

  if (!levels.length) return null

  return (
    <>
      {levels.map((level) => (
        <Registrar
          key={`${level.type}-${level.key}`}
          type={level.type}
          params={level.params}
          nav={level.nav}
          level={level.level}
        />
      ))}
    </>
  )
}
