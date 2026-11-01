/* eslint-disable react-hooks/rules-of-hooks --
   the `hook` properties below are navData hooks dispatched by Registrar,
   which calls exactly one of them per instance (the type is fixed per
   element key), so the rules of hooks hold at the call site */
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { designingAtom, isAppAmin } from '../../../store.ts'
import { useProjectsNavData } from '../../../modules/useProjectsNavData.ts'
import { useProjectNavData } from '../../../modules/useProjectNavData.ts'
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
import { useCheckNavData } from '../../../modules/useCheckNavData.ts'
import { useActionNavData } from '../../../modules/useActionNavData.ts'
import { useFilteredChecksNavData } from '../../../modules/useFilteredChecksNavData.ts'
import { useCheckQuantitiesNavData } from '../../../modules/useCheckQuantitiesNavData.ts'
import { useCheckTaxaNavData } from '../../../modules/useCheckTaxaNavData.ts'
import { useActionQuantitiesNavData } from '../../../modules/useActionQuantitiesNavData.ts'
import { useActionTaxaNavData } from '../../../modules/useActionTaxaNavData.ts'
import { useCheckReportsNavData } from '../../../modules/useCheckReportsNavData.ts'
import { useActionReportsNavData } from '../../../modules/useActionReportsNavData.ts'
import { useObservationsAssignedNavData } from '../../../modules/useObservationsAssignedNavData.ts'
import { usePlaceUsersNavData } from '../../../modules/usePlaceUsersNavData.ts'
import { useProjectReportsNavData } from '../../../modules/useProjectReportsNavData.ts'
import { useProjectReportDesignsNavData } from '../../../modules/useProjectReportDesignsNavData.ts'
import { useSubprojectReportDesignsNavData } from '../../../modules/useSubprojectReportDesignsNavData.ts'
import { useWmsServicesNavData } from '../../../modules/useWmsServicesNavData.ts'
import { useWmsLayersNavData } from '../../../modules/useWmsLayersNavData.ts'
import { useWfsServicesNavData } from '../../../modules/useWfsServicesNavData.ts'
import { useVectorLayersNavData } from '../../../modules/useVectorLayersNavData.ts'
import { useProjectUsersNavData } from '../../../modules/useProjectUsersNavData.ts'
import { useListsNavData } from '../../../modules/useListsNavData.ts'
import { useTaxonomiesNavData } from '../../../modules/useTaxonomiesNavData.ts'
import { useUnitsNavData } from '../../../modules/useUnitsNavData.ts'
import { useProjectCrssNavData } from '../../../modules/useProjectCrssNavData.ts'
import { usePlaceLevelsNavData } from '../../../modules/usePlaceLevelsNavData.ts'
import { useFieldsNavData } from '../../../modules/useFieldsNavData.ts'
import { useFilteredViewsNavData } from '../../../modules/useFilteredViewsNavData.ts'
import { useProjectQcsNavData } from '../../../modules/useProjectQcsNavData.ts'
import { useProjectExportsNavData } from '../../../modules/useProjectExportsNavData.ts'
import { useSubprojectReportsNavData } from '../../../modules/useSubprojectReportsNavData.ts'
import { useSubprojectUsersNavData } from '../../../modules/useSubprojectUsersNavData.ts'
import { useSubprojectQcsNavData } from '../../../modules/useSubprojectQcsNavData.ts'
import { useSubprojectQcsRunNavData } from '../../../modules/useSubprojectQcsRunNavData.ts'
import { useSubprojectExportsRunNavData } from '../../../modules/useSubprojectExportsRunNavData.ts'
import { useSubprojectExportAssignmentsNavData } from '../../../modules/useSubprojectExportAssignmentsNavData.ts'
import { useFieldTypesNavData } from '../../../modules/useFieldTypesNavData.ts'
import { useWidgetTypesNavData } from '../../../modules/useWidgetTypesNavData.ts'
import { useWidgetsForFieldsNavData } from '../../../modules/useWidgetsForFieldsNavData.ts'
import { useQcsNavData } from '../../../modules/useQcsNavData.ts'
import { useRootQcsNavData } from '../../../modules/useRootQcsNavData.ts'
import { useRootQcsRunNavData } from '../../../modules/useRootQcsRunNavData.ts'
import { useExportsNavData } from '../../../modules/useExportsNavData.ts'
import { useRootExportsNavData } from '../../../modules/useRootExportsNavData.ts'
import { useRootExportsRunNavData } from '../../../modules/useRootExportsRunNavData.ts'
import { useChartNavData } from '../../../modules/useChartNavData.ts'
import { useChartSubjectsNavData } from '../../../modules/useChartSubjectsNavData.ts'
import { useCheckReportNavData } from '../../../modules/useCheckReportNavData.ts'
import { useCheckReportQuantitiesNavData } from '../../../modules/useCheckReportQuantitiesNavData.ts'
import { useActionReportNavData } from '../../../modules/useActionReportNavData.ts'
import { useActionReportQuantitiesNavData } from '../../../modules/useActionReportQuantitiesNavData.ts'
import { useListNavData } from '../../../modules/useListNavData.ts'
import { useListValuesNavData } from '../../../modules/useListValuesNavData.ts'
import { useTaxonomyNavData } from '../../../modules/useTaxonomyNavData.ts'
import { useTaxaNavData } from '../../../modules/useTaxaNavData.ts'
import { useVectorLayerNavData } from '../../../modules/useVectorLayerNavData.ts'
import { useVectorLayerDisplaysNavData } from '../../../modules/useVectorLayerDisplaysNavData.ts'
import { useWfsServiceNavData } from '../../../modules/useWfsServiceNavData.ts'
import { useWfsServiceLayersNavData } from '../../../modules/useWfsServiceLayersNavData.ts'
import { useWmsServiceNavData } from '../../../modules/useWmsServiceNavData.ts'
import { useWmsServiceLayersNavData } from '../../../modules/useWmsServiceLayersNavData.ts'
import { useSubprojectTaxaNavData } from '../../../modules/useSubprojectTaxaNavData.ts'
import { useAccountNavData } from '../../../modules/useAccountNavData.ts'

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
     
    folderTypes: Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (params: any) => { type: string; params: Record<string, unknown> }
    >,
    childLevel?: number,
  ) =>
  ({
    params,
    navData,
    level,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nav: any
    navData: NavDataLike
    level: number
  }): TreeChild[] => {
    const children: TreeChild[] = []
    for (const nav of navData.navs ?? []) {
      const id = (nav.id as string) ?? ''
      // navs without id come from hooks of closed folders (counts only):
      // they are no rows - like the old components' navs[0].id check
      if (!id) continue
      // the form-link row (f.i. { id: 'subproject' }) has no folder
      const folder = folderTypes[id]
      if (folder) {
        children.push({
          orderKey: id,
          type: folder(params).type,
          params: folder(params).params,
          nav,
          level: childLevel ?? level + 1,
        })
      } else {
        // form link or entity row
        children.push({
          orderKey: id,
          type: 'formLink',
          params: {
            ownArray: [
              ...navData.ownArray.map((seg) => seg ?? ''),
              ...id.split('/').filter(Boolean),
            ],
            label: (nav as { label?: string }).label ?? id,
          },
          nav,
          level: childLevel ?? level + 1,
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
    (navData.navs ?? [])
      // navs without id come from hooks of closed folders (counts only)
      .filter((nav) => !!(nav as { id?: string }).id)
      .map((nav) => {
        const id = nav.id as string
        const childParams =
          type === 'formLink' ?
            {
              ownArray: [
                ...(navData.ownArray ?? []).map((seg) => seg ?? ''),
                id,
              ],
              label: (nav as { label?: string }).label ?? id,
            }
          : { ...params, nav }
        return {
          orderKey: id,
          type,
          params: childParams,
          nav,
          level: childLevel ?? level + 1,
        }
      })

export const treeConfigs: Record<string, TreeNodeConfig> = {
  projects: {
    isRoot: true,
    hook: (params) => useProjectsNavData(params).navData,
    children: collectionChildren('project', 2),
  },
  project: {
    childrenCount: 10,
    // the project's navs (ids = url segments, labels with counts, flags for
    // optional folders) come from the same hook the list view uses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hook: (_params: any, nav: any) => {
      const { navData } = useProjectNavData({ projectId: nav.id })
      return {
        ...navData,
        ownArray: ['data', 'projects', nav.id],
        ownUrl: `/data/projects/${nav.id}`,
        // the projects list already delivers the label; the hook's label
        // flips to 'not found' while its own query is still loading
        label: nav.label ?? navData.label,
        siblingType: 'editing' as const,
      }
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
        'subproject-charts': (p) => ({
          type: 'charts',
          params: {
            projectId: p.nav.id,
            forSubprojects: true,
            section: 'subproject-charts',
            level: 3,
          },
        }),
        'subproject-designs': (p) => ({
          type: 'subprojectReportDesigns',
          params: { projectId: p.nav.id },
        }),
        designs: (p) => ({
          type: 'projectReportDesigns',
          params: { projectId: p.nav.id },
        }),
        reports: (p) => ({
          type: 'projectReports',
          params: { projectId: p.nav.id },
        }),
        files: (p) => ({
          type: 'files',
          params: { projectId: p.nav.id, level: 3 },
        }),
        'wms-services': (p) => ({
          type: 'wmsServices',
          params: { projectId: p.nav.id },
        }),
        'wms-layers': (p) => ({
          type: 'wmsLayers',
          params: { projectId: p.nav.id },
        }),
        'wfs-services': (p) => ({
          type: 'wfsServices',
          params: { projectId: p.nav.id },
        }),
        'vector-layers': (p) => ({
          type: 'vectorLayers',
          params: { projectId: p.nav.id },
        }),
        users: (p) => ({
          type: 'projectUsers',
          params: { projectId: p.nav.id },
        }),
        lists: (p) => ({ type: 'lists', params: { projectId: p.nav.id } }),
        taxonomies: (p) => ({
          type: 'taxonomies',
          params: { projectId: p.nav.id },
        }),
        units: (p) => ({ type: 'units', params: { projectId: p.nav.id } }),
        crs: (p) => ({ type: 'projectCrss', params: { projectId: p.nav.id } }),
        'place-levels': (p) => ({
          type: 'placeLevels',
          params: { projectId: p.nav.id },
        }),
        fields: (p) => ({ type: 'fields', params: { projectId: p.nav.id } }),
        'filtered-views': (p) => ({
          type: 'filteredViews',
          params: { projectId: p.nav.id },
        }),
        qcs: (p) => ({ type: 'projectQcs', params: { projectId: p.nav.id } }),
        exports: (p) => ({
          type: 'projectExports',
          params: { projectId: p.nav.id },
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
    childrenCount: 6,
    hook: (params, nav) =>
      useSubprojectNavData({ ...params, subprojectId: nav.id }).navData,
    children: entityChildren(
      () => 'Subproject',
      {
        places: (p) => ({
          type: 'places',
          params: {
            projectId: p.projectId,
            subprojectId: p.nav.id,
            level: 5,
          },
        }),
        goals: (p) => ({
          type: 'goals',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'observation-imports': (p) => ({
          type: 'observationImports',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'observations-to-assess': (p) => ({
          type: 'observationsToAssess',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'observations-not-to-assign': (p) => ({
          type: 'observationsNotToAssign',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        files: (p) => ({
          type: 'files',
          params: {
            projectId: p.projectId,
            subprojectId: p.nav.id,
            level: 5,
          },
        }),
        charts: (p) => ({
          type: 'charts',
          params: {
            projectId: p.projectId,
            subprojectId: p.nav.id,
            level: 5,
          },
        }),
        reports: (p) => ({
          type: 'subprojectReports',
          params: {
            projectId: p.projectId,
            subprojectId: p.nav.id,
          },
        }),
        users: (p) => ({
          type: 'subprojectUsers',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'qc-assignments': (p) => ({
          type: 'subprojectQcs',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'qcs-run': (p) => ({
          type: 'subprojectQcsRun',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'exports-run': (p) => ({
          type: 'subprojectExportsRun',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        'export-assignments': (p) => ({
          type: 'subprojectExportAssignments',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
        taxa: (p) => ({
          type: 'subprojectTaxa',
          params: { projectId: p.projectId, subprojectId: p.nav.id },
        }),
      },
      5,
    ),
  },
  subprojectTaxa: {
    hook: (params) => useSubprojectTaxaNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  places: {
    hook: (params) => usePlacesNavData(params).navData,
    children: collectionChildren('place', undefined),
  },
  place: {
    childrenCount: 11,
    hook: (params, nav) =>
      usePlaceNavData({
        ...params,
        placeId: params.placeId ?? nav.id,
        placeId2: params.placeId ? nav.id : params.placeId2,
      }).navData,
    children: ({ params, nav, navData, level }) => {
      // resolve ids like the hook bridge does: a level-1 place row's
      // params carry no placeId - its id is nav.id
      const placeId = params.placeId ?? nav.id
      const placeId2 = params.placeId ? nav.id : params.placeId2
      const base = {
        projectId: params.projectId,
        subprojectId: params.subprojectId,
        placeId,
        placeId2,
      }
      const children: TreeChild[] = []
      for (const childNav of navData.navs ?? []) {
        const id = (childNav.id as string) ?? ''
        // navs without id come from hooks of closed folders (counts only)
        if (!id) continue
        if (id.startsWith('filtered-checks/')) {
          const filteredViewId = id.split('/')[1] ?? ''
          children.push({
            orderKey: id,
            type: 'filteredChecks',
            params: { ...base, filteredViewId },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'checks') {
          children.push({
            orderKey: id,
            type: 'checks',
            params: { ...base },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'actions') {
          children.push({
            orderKey: id,
            type: 'actions',
            params: { ...base },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'check-reports') {
          children.push({
            orderKey: id,
            type: 'checkReports',
            params: { ...base },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'action-reports') {
          children.push({
            orderKey: id,
            type: 'actionReports',
            params: { ...base },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'observations') {
          children.push({
            orderKey: id,
            type: 'observationsAssigned',
            params: { ...base },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'users') {
          children.push({
            orderKey: id,
            type: 'placeUsers',
            params: { ...base },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'files') {
          children.push({
            orderKey: id,
            type: 'files',
            params: { ...base, level: level + 1 },
            nav: childNav,
            level: level + 1,
          })
        } else if (id === 'places' && !placeId2) {
          children.push({
            orderKey: id,
            type: 'places',
            params: { ...base, placeId, level: level + 1 },
            nav: childNav,
            level: level + 1,
          })
        } else {
          // form links ('place') and nested places on level 2
          children.push({
            orderKey: id,
            type: 'formLink',
            params: {
              ownArray: [
                ...(navData.ownArray ?? []).map((seg) => seg ?? ''),
                ...id.split('/').filter(Boolean),
              ],
              label: (childNav as { label?: string }).label ?? id,
            },
            nav: childNav,
            level: level + 1,
          })
        }
      }
      return children
    },
  },
  goals: {
    hook: (params) => useGoalsNavData(params).navData,
    children: collectionChildren('goal', 6),
  },
  goal: {
    childrenCount: 1,
    hook: (params, nav) =>
      useGoalNavData({ ...params, goalId: nav.id }).navData,
    children: entityChildren(
      () => 'Ziel',
      {
        reports: (p) => ({
          type: 'goalReports',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            goalId: p.nav.id,
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
    children: collectionChildren('check', undefined),
  },
  filteredChecks: {
    hook: (params) => useFilteredChecksNavData(params).navData,
    children: collectionChildren('check', undefined),
  },
  checkReports: {
    hook: (params) => useCheckReportsNavData(params).navData,
    children: collectionChildren('checkReport', undefined),
  },
  checkReport: {
    childrenCount: 1,
    hook: (params, nav) =>
      useCheckReportNavData({ ...params, checkReportId: nav.id }).navData,
    children: entityChildren(
      () => 'Kontroll-Bericht',
      {
        quantities: (p) => ({
          type: 'checkReportQuantities',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            checkReportId: p.nav.id,
          },
        }),
      },
      undefined,
    ),
  },
  checkReportQuantities: {
    hook: (params) => useCheckReportQuantitiesNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  actionReports: {
    hook: (params) => useActionReportsNavData(params).navData,
    children: collectionChildren('actionReport', undefined),
  },
  actionReport: {
    childrenCount: 1,
    hook: (params, nav) =>
      useActionReportNavData({ ...params, actionReportId: nav.id }).navData,
    children: entityChildren(
      () => 'Massnahmen-Bericht',
      {
        quantities: (p) => ({
          type: 'actionReportQuantities',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            actionReportId: p.nav.id,
          },
        }),
      },
      undefined,
    ),
  },
  actionReportQuantities: {
    hook: (params) => useActionReportQuantitiesNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  observationsAssigned: {
    hook: (params) => useObservationsAssignedNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  placeUsers: {
    hook: (params) => usePlaceUsersNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  checkQuantities: {
    hook: (params) => useCheckQuantitiesNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  checkTaxa: {
    hook: (params) => useCheckTaxaNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  actionQuantities: {
    hook: (params) => useActionQuantitiesNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  actionTaxa: {
    hook: (params) => useActionTaxaNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  check: {
    childrenCount: 1,
    hook: (params, nav) =>
      useCheckNavData({ ...params, checkId: nav.id }).navData,
    children: entityChildren(
      () => 'Kontrolle',
      {
        quantities: (p) => ({
          type: 'checkQuantities',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            filteredViewId: p.filteredViewId,
            checkId: p.nav.id,
          },
        }),
        taxa: (p) => ({
          type: 'checkTaxa',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            filteredViewId: p.filteredViewId,
            checkId: p.nav.id,
          },
        }),
        files: (p) => ({
          type: 'files',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            checkId: p.nav.id,
          },
        }),
      },
      undefined,
    ),
  },
  action: {
    childrenCount: 11,
    hook: (params, nav) =>
      useActionNavData({ ...params, actionId: nav.id }).navData,
    children: entityChildren(
      () => 'Massnahme',
      {
        quantities: (p) => ({
          type: 'actionQuantities',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            actionId: p.nav.id,
          },
        }),
        taxa: (p) => ({
          type: 'actionTaxa',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            actionId: p.nav.id,
          },
        }),
        files: (p) => ({
          type: 'files',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            actionId: p.nav.id,
          },
        }),
      },
      undefined,
    ),
  },
  actions: {
    hook: (params) => useActionsNavData(params).navData,
    children: collectionChildren('action', undefined),
  },
  charts: {
    hook: (params) => useChartsNavData(params).navData,
    children: collectionChildren('chart', undefined),
  },
  chart: {
    childrenCount: 1,
    hook: (params, nav) =>
      useChartNavData({ ...params, chartId: nav.id }).navData,
    children: entityChildren(
      () => 'Diagramm',
      {
        subjects: (p) => ({
          type: 'chartSubjects',
          params: {
            projectId: p.projectId,
            subprojectId: p.subprojectId,
            placeId: p.placeId,
            placeId2: p.placeId2,
            section: p.section,
            chartId: p.nav.id,
          },
        }),
      },
      undefined,
    ),
  },
  chartSubjects: {
    hook: (params) => useChartSubjectsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  files: {
    hook: (params) => useFilesNavData(params).navData,
    children: collectionChildren('file', undefined),
  },
  file: {
    hook: (params, nav) =>
      useFileNavData({ ...params, fileId: nav.id }).navData,
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
    childrenCount: 1,
    hook: (params, nav) =>
      useUserNavData({ ...params, userId: nav.id }).navData,
    children: entityChildren(
      () => 'User',
      {
        accounts: (p) => ({ type: 'accounts', params: { userId: p.nav.id } }),
      },
      undefined,
    ),
  },
  accounts: {
    hook: (params) => useAccountsNavData(params).navData,
    children: collectionChildren('account', undefined),
  },
  account: {
    childrenCount: 1,
    hook: (params, nav) =>
      useAccountNavData({ ...params, accountId: nav.id }).navData,
    children: entityChildren(
      () => 'Konto',
      {
        'project-fields': (p) => ({
          type: 'fields',
          params: { accountId: p.nav.id, userId: p.userId },
        }),
      },
      undefined,
    ),
  },
  messages: {
    isRoot: true,
    hook: () => useMessagesNavData().navData,
    children: collectionChildren('message', 0),
  },
  message: {
    hook: (params, nav) =>
      useMessageNavData({ ...params, messageId: nav.id }).navData,
    children: undefined,
  },
  queuedOperations: {
    isRoot: true,
    hook: () => useQueuedOperationsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  projectReports: {
    hook: (params) => useProjectReportsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  projectReportDesigns: {
    hook: (params) => useProjectReportDesignsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectReportDesigns: {
    hook: (params) => useSubprojectReportDesignsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  wmsServices: {
    hook: (params) => useWmsServicesNavData(params).navData,
    children: collectionChildren('wmsService', undefined),
  },
  wmsService: {
    childrenCount: 1,
    hook: (params, nav) =>
      useWmsServiceNavData({ ...params, wmsServiceId: nav.id }).navData,
    children: entityChildren(
      () => 'WMS-Dienst',
      {
        layers: (p) => ({
          type: 'wmsServiceLayers',
          params: { projectId: p.projectId, wmsServiceId: p.nav.id },
        }),
      },
      undefined,
    ),
  },
  wmsServiceLayers: {
    hook: (params) => useWmsServiceLayersNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  wmsLayers: {
    hook: (params) => useWmsLayersNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  wfsServices: {
    hook: (params) => useWfsServicesNavData(params).navData,
    children: collectionChildren('wfsService', undefined),
  },
  wfsService: {
    childrenCount: 1,
    hook: (params, nav) =>
      useWfsServiceNavData({ ...params, wfsServiceId: nav.id }).navData,
    children: entityChildren(
      () => 'WFS-Dienst',
      {
        layers: (p) => ({
          type: 'wfsServiceLayers',
          params: { projectId: p.projectId, wfsServiceId: p.nav.id },
        }),
      },
      undefined,
    ),
  },
  wfsServiceLayers: {
    hook: (params) => useWfsServiceLayersNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  vectorLayers: {
    hook: (params) => useVectorLayersNavData(params).navData,
    children: collectionChildren('vectorLayer', undefined),
  },
  vectorLayer: {
    childrenCount: 1,
    hook: (params, nav) =>
      useVectorLayerNavData({ ...params, vectorLayerId: nav.id }).navData,
    children: entityChildren(
      () => 'Vektor-Ebene',
      {
        displays: (p) => ({
          type: 'vectorLayerDisplays',
          params: { projectId: p.projectId, vectorLayerId: p.nav.id },
        }),
      },
      undefined,
    ),
  },
  vectorLayerDisplays: {
    hook: (params) => useVectorLayerDisplaysNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  projectUsers: {
    hook: (params) => useProjectUsersNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  lists: {
    hook: (params) => useListsNavData(params).navData,
    children: collectionChildren('list', undefined),
  },
  list: {
    childrenCount: 1,
    hook: (params, nav) =>
      useListNavData({ ...params, listId: nav.id }).navData,
    children: entityChildren(
      () => 'Liste',
      {
        values: (p) => ({
          type: 'listValues',
          params: { projectId: p.projectId, listId: p.nav.id },
        }),
      },
      undefined,
    ),
  },
  listValues: {
    hook: (params) => useListValuesNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  taxonomies: {
    hook: (params) => useTaxonomiesNavData(params).navData,
    children: collectionChildren('taxonomy', undefined),
  },
  taxonomy: {
    childrenCount: 1,
    hook: (params, nav) =>
      useTaxonomyNavData({ ...params, taxonomyId: nav.id }).navData,
    children: entityChildren(
      () => 'Taxonomie',
      {
        taxa: (p) => ({
          type: 'taxa',
          params: { projectId: p.projectId, taxonomyId: p.nav.id },
        }),
      },
      undefined,
    ),
  },
  taxa: {
    hook: (params) => useTaxaNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  units: {
    hook: (params) => useUnitsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  projectCrss: {
    hook: (params) => useProjectCrssNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  placeLevels: {
    hook: (params) => usePlaceLevelsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  fields: {
    hook: (params) => useFieldsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  filteredViews: {
    hook: (params) => useFilteredViewsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  projectQcs: {
    hook: (params) => useProjectQcsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  projectExports: {
    hook: (params) => useProjectExportsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectReports: {
    hook: (params) => useSubprojectReportsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectUsers: {
    hook: (params) => useSubprojectUsersNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectQcs: {
    hook: (params) => useSubprojectQcsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectQcsRun: {
    hook: (params) => useSubprojectQcsRunNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectExportsRun: {
    hook: (params) => useSubprojectExportsRunNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  subprojectExportAssignments: {
    hook: (params) => useSubprojectExportAssignmentsNavData(params).navData,
    children: collectionChildren('formLink', undefined),
  },
  fieldTypes: {
    isRoot: true,
    hook: () => useFieldTypesNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  widgetTypes: {
    isRoot: true,
    hook: () => useWidgetTypesNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  widgetsForFields: {
    isRoot: true,
    hook: () => useWidgetsForFieldsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  qcs: {
    isRoot: true,
    hook: () => useQcsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  rootQcs: {
    isRoot: true,
    hook: () => useRootQcsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  rootQcsRun: {
    isRoot: true,
    hook: () => useRootQcsRunNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  exports: {
    isRoot: true,
    hook: () => useExportsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  rootExports: {
    isRoot: true,
    hook: () => useRootExportsNavData().navData,
    children: collectionChildren('formLink', undefined),
  },
  rootExportsRun: {
    isRoot: true,
    hook: () => useRootExportsRunNavData().navData,
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
    ...(designing ?
      [
        ...(isAppAdmin ?
          [
            { type: 'fieldTypes', params: {} },
            { type: 'widgetTypes', params: {} },
            { type: 'widgetsForFields', params: {} },
          ]
        : []),
        { type: 'qcs', params: {} },
        { type: 'rootQcs', params: {} },
        { type: 'rootQcsRun', params: {} },
        { type: 'exports', params: {} },
        { type: 'rootExports', params: {} },
        { type: 'rootExportsRun', params: {} },
      ]
    : []),
    { type: 'messages', params: {} },
  ]
}

void useIntl
