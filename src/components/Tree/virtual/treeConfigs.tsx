import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { designingAtom, isAppAmin } from '../../../store.ts'
import { useProjectsNavData } from '../../../modules/useProjectsNavData.ts'
import { useSubprojectsNavData } from '../../../modules/useSubprojectsNavData.ts'
import { useSubprojectNavData } from '../../../modules/useSubprojectNavData.ts'
import { usePlacesNavData } from '../../../modules/usePlacesNavData.ts'
import { usePlaceNavData } from '../../../modules/usePlaceNavData.ts'
import { useGoalsNavData } from '../../../modules/useGoalsNavData.ts'
import { useGoalNavData } from '../../../modules/useGoalNavData.ts'
import { useGoalReportsNavData } from '../../../modules/useGoalReportsNavData.ts'
import { useFilesNavData } from '../../../modules/useFilesNavData.ts'
import { useFileNavData } from '../../../modules/useFileNavData.ts'
import { useUsersNavData } from '../../../modules/useUsersNavData.ts'
import { useUserNavData } from '../../../modules/useUserNavData.ts'
import { useAccountsNavData } from '../../../modules/useAccountsNavData.ts'
import { useMessagesNavData } from '../../../modules/useMessagesNavData.ts'
import { useMessageNavData } from '../../../modules/useMessageNavData.ts'
import { useChecksNavData } from '../../../modules/useChecksNavData.ts'
import { useActionsNavData } from '../../../modules/useActionsNavData.ts'
import { useChartsNavData } from '../../../modules/useChartsNavData.ts'
import { useObservationImportsNavData } from '../../../modules/useObservationImportsNavData.ts'
import { useObservationsToAssessNavData } from '../../../modules/useObservationsToAssessNavData.ts'
import { useObservationsNotToAssignNavData } from '../../../modules/useObservationsNotToAssignNavData.ts'
import { useQueuedOperationsNavData } from '../../../modules/useQueuedOperationsNavData.ts'

import type { NavDataLike, TreeChild, TreeNodeConfig } from './types.ts'

/**
 * The tree structure as data: per node type its navData hook and how the
 * hook's navs map to child types.
 *
 * Children whose navs are entity rows (collections) map every nav to the
 * singular type. Children whose navs are folders map by nav.id.
 * Form-link rows (childrenCount 0, no children of their own) use the
 * formLink type.
 */

// children of an open entity: form link first, then folders from the hook's navs
const entityChildren =
  (
    formLinkLabel: (ctx: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navData: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: any
    }) => string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    folderTypes: Record<string, (params: any) => { type: string; params: Record<string, unknown> }>,
    childLevel: number,
  ) =>
  ({
    params,
    navData,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nav: any
    navData: NavDataLike
  }): TreeChild[] => {
    const children: TreeChild[] = []
    for (const nav of navData.navs ?? []) {
      const id = (nav.id as string) ?? ''
      // the form-link row (f.i. { id: 'subproject' }) has no folder
      const folder = folderTypes[id]
      if (folder) {
        children.push({
          orderKey: id,
          type: folder(params).type,
          params: folder(params).params,
          nav,
          level: childLevel,
        })
      } else {
        // form link or entity row
        children.push({
          orderKey: id,
          type: 'formLink',
          params: {
            ownArray: [...navData.ownArray.map((seg) => seg ?? ''), id],
            label: (nav as { label?: string }).label ?? id,
          },
          nav,
          level: childLevel,
        })
      }
    }
    void formLinkLabel
    return children
  }

// children of a collection: every nav is an entity row
const collectionChildren =
  (type: string, childLevel?: number) =>
  ({
    params,
    navData,
    level,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any
    navData: NavDataLike
    level: number
  }): TreeChild[] =>
    (navData.navs ?? []).map((nav) => ({
      orderKey: (nav.id as string) ?? '',
      type,
      params: { ...params, nav },
      nav,
      level: childLevel ?? level + 1,
    }))

/** flags of the project node, ported from Project/index.tsx */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useProjectFlags = (params: any) => {
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[params.nav.id] ?? false
  const res = useLiveQuery(
    `SELECT wms_layers, vector_layers, files_active_projects, project_files_in_project, charts, project_reports, project_roles_in_project FROM projects WHERE project_id = $1`,
    [params.nav.id as string],
  )
  const project = res?.rows?.[0] as
    | {
        wms_layers: boolean
        vector_layers: boolean
        files_active_projects: boolean
        project_files_in_project: boolean
        charts: boolean
        project_reports: boolean
        project_roles_in_project: boolean
      }
    | undefined
  return {
    designing,
    showCharts: designing || (project?.charts ?? false),
    showProjectReports: designing || (project?.project_reports ?? false),
    showFilesNav:
      (designing || (project?.files_active_projects ?? false)) &&
      !(project?.project_files_in_project ?? false),
  }
}

export const treeConfigs: Record<string, TreeNodeConfig> = {
  projects: {
    isRoot: true,
    hook: (params) => useProjectsNavData(params).navData,
    children: collectionChildren('project', 2),
  },
  project: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hook: (params: any, nav: any) => {
      const flags = useProjectFlags({ nav, params })
      const navData = {
        // project rows have no own hook: build the row data from the nav
        ownArray: ['data', 'projects', nav.id],
        ownUrl: `/data/projects/${nav.id}`,
        label: nav.label ?? nav.id,
        navs: [
          { id: 'project' },
          ...(params.subprojects !== false
            ? [{ id: 'subprojects', label: 'Teilprojekte' }]
            : []),
          ...(flags.showCharts ? [{ id: 'charts' }] : []),
          ...(flags.showProjectReports ? [{ id: 'projectReports' }] : []),
          ...(flags.showFilesNav ? [{ id: 'files' }] : []),
          { id: 'projectQcAssignments' },
          { id: 'projectQcsRun' },
        ],
      }
      void params
      return navData
    },
    children: entityChildren(
      () => 'Projekt',
      {
        subprojects: (p) => ({
          type: 'subprojects',
          params: { projectId: p.nav.id },
        }),
        charts: (p) => ({
          type: 'charts',
          params: { projectId: p.nav.id, level: 3 },
        }),
        projectReports: (p) => ({
          type: 'projectReports',
          params: { projectId: p.nav.id },
        }),
        files: (p) => ({
          type: 'files',
          params: { projectId: p.nav.id, level: 3 },
        }),
        projectQcAssignments: () => ({
          type: 'formLink',
          params: { label: 'Zuweisungen' },
        }),
        projectQcsRun: () => ({
          type: 'formLink',
          params: { label: 'QK' },
        }),
      },
      3,
    ),
  },
  subprojects: {
    hook: (params) => useSubprojectsNavData(params).navData,
    children: collectionChildren('subproject', 4),
  },
  subproject: {
    hook: (params) => useSubprojectNavData(params).navData,
    children: entityChildren(
      () => 'Subproject',
      {
        places: (p) => ({
          type: 'places',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            level: 5,
          },
        }),
        goals: (p) => ({
          type: 'goals',
          params: { projectId: p.projectId, subprojectId: p.subprojectId },
        }),
        observationImports: (p) => ({
          type: 'observationImports',
          params: { projectId: p.projectId, subprojectId: p.subprojectId },
        }),
        observationsToAssess: (p) => ({
          type: 'observationsToAssess',
          params: { projectId: p.projectId, subprojectId: p.subprojectId },
        }),
        observationsNotToAssign: (p) => ({
          type: 'observationsNotToAssign',
          params: { projectId: p.projectId, subprojectId: p.subprojectId },
        }),
        files: (p) => ({
          type: 'files',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            level: 5,
          },
        }),
        charts: (p) => ({
          type: 'charts',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            level: 5,
          },
        }),
        reports: (p) => ({
          type: 'goalReports',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
          },
        }),
      },
      5,
    ),
  },
  places: {
    hook: (params) => usePlacesNavData(params).navData,
    children: collectionChildren('place', undefined),
  },
  place: {
    hook: (params) => usePlaceNavData(params).navData,
    children: entityChildren(
      () => 'Place',
      {
        places: (p) => ({
          type: 'places',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            level: (p.level ?? 0) + 1,
          },
        }),
        checks: (p) => ({
          type: 'checks',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            level: (p.level ?? 0) + 1,
          },
        }),
        actions: (p) => ({
          type: 'actions',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            level: (p.level ?? 0) + 1,
          },
        }),
        checkReports: () => ({
          type: 'formLink',
          params: { label: 'Berichte' },
        }),
        files: (p) => ({
          type: 'files',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            level: (p.level ?? 0) + 1,
          },
        }),
      },
      0,
    ),
  },
  goals: {
    hook: (params) => useGoalsNavData(params).navData,
    children: collectionChildren('goal', 6),
  },
  goal: {
    hook: (params) => useGoalNavData(params).navData,
    children: entityChildren(
      () => 'Ziel',
      {
        reports: (p) => ({
          type: 'goalReports',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            goalId: p.goalId,
          },
        }),
      },
      7,
    ),
  },
  goalReports: {
    hook: (params) => useGoalReportsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  checks: {
    hook: (params) => useChecksNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  actions: {
    hook: (params) => useActionsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  charts: {
    hook: (params) => useChartsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  files: {
    hook: (params) => useFilesNavData(params).navData,
    children: collectionChildren('file', undefined),
  },
  file: {
    hook: (params) => useFileNavData(params).navData,
    children: undefined,
  },
  observationImports: {
    hook: (params) => useObservationImportsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  observationsToAssess: {
    hook: (params) => useObservationsToAssessNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  observationsNotToAssign: {
    hook: (params) => useObservationsNotToAssignNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  users: {
    isRoot: true,
    hook: () => useUsersNavData().navData,
    children: collectionChildren('user', undefined),
  },
  user: {
    hook: (params) => useUserNavData(params).navData,
    children: entityChildren(
      () => 'User',
      {
        accounts: (p) => ({ type: 'accounts', params: { userId: p.userId } }),
      },
      0,
    ),
  },
  accounts: {
    hook: (params) => useAccountsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  messages: {
    isRoot: true,
    hook: () => useMessagesNavData().navData,
    children: collectionChildren('message', 0),
  },
  message: {
    hook: (params) => useMessageNavData(params).navData,
    children: undefined,
  },
  queuedOperations: {
    isRoot: true,
    hook: () => useQueuedOperationsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  // a row without children: form links and (until their configs exist)
  // singular rows of collections like checks or actions
  formLink: {
    hook: (params) => ({
      ownArray: params.ownArray,
      ownUrl: `/${params.ownArray.join('/')}`,
      label: params.label ?? params.nav?.label ?? params.nav?.id ?? '',
      navs: [],
    }),
    children: undefined,
  },
}

// root order and mount conditions, ported from the former Tree/index.tsx
export const useTreeRoots = () => {
  const [designingMap] = useAtom(designingAtom)
  const designing = Object.values(designingMap).some(Boolean)
  const [isAppAdmin] = useAtom(isAppAmin)

  return [
    { type: 'projects', params: {} },
    { type: 'users', params: {} },
    // designing-only roots (fieldTypes, widgetTypes, ...) and
    // messages/queuedOperations follow in later steps
    ...(designing && isAppAdmin ? [] : []),
    { type: 'messages', params: {} },
  ]
}

void useIntl
