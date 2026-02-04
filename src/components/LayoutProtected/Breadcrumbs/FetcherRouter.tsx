import { useParams } from '@tanstack/react-router'

// import { AnyFetcherImporter } from './AnyFetcherImporter.tsx'
import { ProjectsFetcher } from './ProjectsFetcher.tsx'
import { ProjectFetcher } from './ProjectFetcher.tsx'
import { ProjectProjectFetcher } from './ProjectProjectFetcher.tsx'
import { SubprojectsFetcher } from './SubprojectsFetcher.tsx'
import { SubprojectFetcher } from './SubprojectFetcher.tsx'

import { ProjectReportsFetcher } from './ProjectReportsFetcher.tsx'
import { ProjectReportFetcher } from './ProjectReportFetcher.tsx'
import { PersonsFetcher } from './PersonsFetcher.tsx'
import { PersonFetcher } from './PersonFetcher.tsx'
import { WmsLayersFetcher } from './WmsLayersFetcher.tsx'
import { WmsLayerFetcher } from './WmsLayerFetcher.tsx'
import { VectorLayerDisplaysFetcher } from './VectorLayerDisplaysFetcher.tsx'
import { VectorLayerDisplayFetcher } from './VectorLayerDisplayFetcher.tsx'
import { VectorLayersFetcher } from './VectorLayersFetcher.tsx'
import { VectorLayerFetcher } from './VectorLayerFetcher.tsx'
import { VectorLayerVectorLayerFetcher } from './VectorLayerVectorLayerFetcher.tsx'

import { PlacesFetcher } from './PlacesFetcher.tsx'
import { PlaceFetcher } from './PlaceFetcher.tsx'
import { PlaceHistoriesFetcher } from './PlaceHistoriesFetcher.tsx'
import { PlaceHistoryFetcher } from './PlaceHistoryFetcher.tsx'

import { ChecksFetcher } from './ChecksFetcher.tsx'
import { CheckFetcher } from './CheckFetcher.tsx'
import { CheckValuesFetcher } from './CheckValuesFetcher.tsx'
import { CheckValueFetcher } from './CheckValueFetcher.tsx'
import { CheckTaxaFetcher } from './CheckTaxaFetcher.tsx'
import { CheckTaxonFetcher } from './CheckTaxonFetcher.tsx'
import { ActionsFetcher } from './ActionsFetcher.tsx'
import { ActionFetcher } from './ActionFetcher.tsx'
import { ActionValuesFetcher } from './ActionValuesFetcher.tsx'
import { ActionValueFetcher } from './ActionValueFetcher.tsx'
import { ActionReportsFetcher } from './ActionReportsFetcher.tsx'
import { ActionReportFetcher } from './ActionReportFetcher.tsx'
import { ActionReportReportFetcher } from './ActionReportReportFetcher.tsx'
import { ActionReportValuesFetcher } from './ActionReportValuesFetcher.tsx'
import { ActionReportValueFetcher } from './ActionReportValueFetcher.tsx'
import { PlaceReportsFetcher } from './PlaceReportsFetcher.tsx'
import { PlaceReportFetcher } from './PlaceReportFetcher.tsx'
import { PlaceReportReportFetcher } from './PlaceReportReportFetcher.tsx'
import { PlaceReportValuesFetcher } from './PlaceReportValuesFetcher.tsx'
import { PlaceReportValueFetcher } from './PlaceReportValueFetcher.tsx'
import { OccurrencesAssignedFetcher } from './OccurrencesAssignedFetcher.tsx'
import { OccurrenceAssignedFetcher } from './OccurrenceAssignedFetcher.tsx'
import { PlaceUsersFetcher } from './PlaceUsersFetcher.tsx'
import { PlaceUserFetcher } from './PlaceUserFetcher.tsx'
import { SubprojectReportsFetcher } from './SubprojectReportsFetcher.tsx'
import { SubprojectReportFetcher } from './SubprojectReportFetcher.tsx'
import { SubprojectHistoriesFetcher } from './SubprojectHistoriesFetcher.tsx'
import { SubprojectHistoryFetcher } from './SubprojectHistoryFetcher.tsx'
import { GoalsFetcher } from './GoalsFetcher.tsx'
import { GoalFetcher } from './GoalFetcher.tsx'
import { GoalGoalFetcher } from './GoalGoalFetcher.tsx'
import { GoalReportsFetcher } from './GoalReportsFetcher.tsx'
import { GoalReportFetcher } from './GoalReportFetcher.tsx'
import { GoalReportReportFetcher } from './GoalReportReportFetcher.tsx'
import { GoalReportValuesFetcher } from './GoalReportValuesFetcher.tsx'
import { GoalReportValueFetcher } from './GoalReportValueFetcher.tsx'
import { OccurrenceImportsFetcher } from './OccurrenceImportsFetcher.tsx'
import { OccurrenceImportFetcher } from './OccurrenceImportFetcher.tsx'
import { OccurrencesToAssessFetcher } from './OccurrencesToAssessFetcher.tsx'
import { OccurrenceToAssessFetcher } from './OccurrenceToAssessFetcher.tsx'
import { OccurrencesNotToAssignFetcher } from './OccurrencesNotToAssignFetcher.tsx'
import { OccurrenceNotToAssignFetcher } from './OccurrenceNotToAssignFetcher.tsx'
import { SubprojectTaxaFetcher } from './SubprojectTaxaFetcher.tsx'
import { SubprojectTaxonFetcher } from './SubprojectTaxonFetcher.tsx'
import { SubprojectUsersFetcher } from './SubprojectUsersFetcher.tsx'
import { SubprojectUserFetcher } from './SubprojectUserFetcher.tsx'
import { ChartsFetcher } from './ChartsFetcher.tsx'
import { ChartFetcher } from './ChartFetcher.tsx'
import { ChartChartFetcher } from './ChartChartFetcher.tsx'
import { ChartSubjectsFetcher } from './ChartSubjectsFetcher.tsx'
import { ChartSubjectFetcher } from './ChartSubjectFetcher.tsx'
import { SubprojectReportDesignsFetcher } from './SubprojectReportDesignsFetcher.tsx'
import { SubprojectReportDesignFetcher } from './SubprojectReportDesignFetcher.tsx'
import { ProjectReportDesignsFetcher } from './ProjectReportDesignsFetcher.tsx'
import { ProjectReportDesignFetcher } from './ProjectReportDesignFetcher.tsx'
import { ProjectUsersFetcher } from './ProjectUsersFetcher.tsx'
import { ProjectUserFetcher } from './ProjectUserFetcher.tsx'
import { ListValuesFetcher } from './ListValuesFetcher.tsx'
import { ListValueFetcher } from './ListValueFetcher.tsx'
import { ListsFetcher } from './ListsFetcher.tsx'
import { ProjectDesignFetcher } from './ProjectDesignFetcher.tsx'
import { ListFetcher } from './ListFetcher.tsx'
import { ListListFetcher } from './ListListFetcher.tsx'
import { TaxonomiesFetcher } from './TaxonomiesFetcher.tsx'
import { TaxonomyFetcher } from './TaxonomyFetcher.tsx'
import { TaxonomyTaxonomyFetcher } from './TaxonomyTaxonomyFetcher.tsx'
import { TaxaFetcher } from './TaxaFetcher.tsx'
import { TaxonFetcher } from './TaxonFetcher.tsx'
import { UnitsFetcher } from './UnitsFetcher.tsx'
import { UnitFetcher } from './UnitFetcher.tsx'
import { ProjectCrssFetcher } from './ProjectCrssFetcher.tsx'
import { ProjectCrsFetcher } from './ProjectCrsFetcher.tsx'
import { PlaceLevelsFetcher } from './PlaceLevelsFetcher.tsx'
import { PlaceLevelFetcher } from './PlaceLevelFetcher.tsx'
import { UsersFetcher } from './UsersFetcher.tsx'
import { UserFetcher } from './UserFetcher.tsx'
import { AccountsFetcher } from './AccountsFetcher.tsx'
import { AccountFetcher } from './AccountFetcher.tsx'
import { FieldTypesFetcher } from './FieldTypesFetcher.tsx'
import { FieldTypeFetcher } from './FieldTypeFetcher.tsx'
import { WidgetTypesFetcher } from './WidgetTypesFetcher.tsx'
import { WidgetTypeFetcher } from './WidgetTypeFetcher.tsx'
import { WidgetsForFieldsFetcher } from './WidgetsForFieldsFetcher.tsx'
import { WidgetForFieldFetcher } from './WidgetForFieldFetcher.tsx'
import { FieldsFetcher } from './FieldsFetcher.tsx'
import { FieldFetcher } from './FieldFetcher.tsx'
import { CrssFetcher } from './CrssFetcher.tsx'
import { CrsFetcher } from './CrsFetcher.tsx'
import { FilesFetcher } from './FilesFetcher.tsx'
import { FileFetcher } from './FileFetcher.tsx'
import { MessagesFetcher } from './MessagesFetcher.tsx'
import { MessageFetcher } from './MessageFetcher.tsx'
import { DataFetcher } from './DataFetcher.tsx'

export const FetcherRouter = ({ fetcherName, ...other }) => {
  // need to get params here and pass as props otherwise
  // causes the compiler to: "Error: Rendered fewer hooks than expected"
  const params = useParams({ strict: false })

  switch (fetcherName) {
    case 'useDataBreadcrumbData': {
      return <DataFetcher {...other} />
    }
    case 'useProjectsNavData': {
      return (
        <ProjectsFetcher
          params={params}
          {...other}
        />
      )
    }
    // IMPORTANT: always ensure the necessary params are present before rendering the fetcher, otherwise it will cause errors
    case 'useProjectNavData': {
      if (!params.projectId) return null
      return (
        <ProjectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectProjectNavData': {
      if (!params.projectId) return null
      return (
        <ProjectProjectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectsNavData': {
      if (!params.projectId) return null
      return (
        <SubprojectsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectNavData': {
      if (!params.subprojectId || !params.projectId) return null
      return (
        <SubprojectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlacesNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <PlacesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <PlaceFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChecksNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <ChecksFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.checkId
      )
        return null
      return (
        <CheckFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckValuesNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.checkId
      )
        return null
      return (
        <CheckValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckValueNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.checkId ||
        !params.checkValueId
      )
        return null
      return (
        <CheckValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckTaxaNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.checkId
      )
        return null
      return (
        <CheckTaxaFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckTaxonNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.checkId ||
        !params.checkTaxonId
      )
        return null
      return (
        <CheckTaxonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionsNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <ActionsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId
      )
        return null
      return (
        <ActionFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionValuesNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId
      )
        return null
      return (
        <ActionValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionValueNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId ||
        !params.actionValueId
      )
        return null
      return (
        <ActionValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportsNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId
      )
        return null
      return (
        <ActionReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId ||
        !params.actionReportId
      )
        return null
      return (
        <ActionReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId ||
        !params.actionReportId
      )
        return null
      return (
        <ActionReportReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportValuesNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId ||
        !params.actionReportId
      )
        return null
      return (
        <ActionReportValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportValueNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.actionId ||
        !params.actionReportId ||
        !params.actionReportValueId
      )
        return null
      return (
        <ActionReportValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportsNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <PlaceReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.placeReportId
      )
        return null
      return (
        <PlaceReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.placeReportId
      )
        return null
      return (
        <PlaceReportReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportValuesNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.placeReportId
      )
        return null
      return (
        <PlaceReportValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportValueNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.placeReportId ||
        !params.placeReportValueId
      )
        return null
      return (
        <PlaceReportValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrencesAssignedNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <OccurrencesAssignedFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceAssignedNavData': {
      if (!params.projectId || !params.subprojectId || !params.occurrenceId)
        return null
      return (
        <OccurrenceAssignedFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceUsersNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <PlaceUsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceUserNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.placeUserId
      )
        return null
      return (
        <PlaceUserFetcher
          params={params}
          {...other}
        />
      )
    }

    case 'useSubprojectReportsNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <SubprojectReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.subprojectReportId
      )
        return null
      return (
        <SubprojectReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectHistoriesNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <SubprojectHistoriesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectHistoryNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.subprojectHistoryId
      )
        return null
      return (
        <SubprojectHistoryFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceHistoriesNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <PlaceHistoriesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceHistoryNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.placeHistoryId
      )
        return null
      return (
        <PlaceHistoryFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalsNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <GoalsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalNavData': {
      if (!params.projectId || !params.subprojectId || !params.goalId)
        return null
      return (
        <GoalFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalGoalNavData': {
      if (!params.projectId || !params.subprojectId || !params.goalId)
        return null
      return (
        <GoalGoalFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportsNavData': {
      if (!params.projectId || !params.subprojectId || !params.goalId)
        return null
      return (
        <GoalReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.goalId ||
        !params.goalReportId
      )
        return null
      return (
        <GoalReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportReportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.goalId ||
        !params.goalReportId
      )
        return null
      return (
        <GoalReportReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportValuesNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.goalId ||
        !params.goalReportId
      )
        return null
      return (
        <GoalReportValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportValueNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.goalId ||
        !params.goalReportId ||
        !params.goalReportValueId
      )
        return null
      return (
        <GoalReportValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceImportsNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <OccurrenceImportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceImportNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.occurrenceImportId
      )
        return null
      return (
        <OccurrenceImportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrencesToAssessNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <OccurrencesToAssessFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceToAssessNavData': {
      if (!params.projectId || !params.subprojectId || !params.occurrenceId)
        return null
      return (
        <OccurrenceToAssessFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrencesNotToAssignNavData': {
      if (!params.projectId || !params.subprojectId || !params.placeId)
        return null
      return (
        <OccurrencesNotToAssignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceNotToAssignNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.occurrenceId
      )
        return null
      return (
        <OccurrenceNotToAssignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectTaxaNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <SubprojectTaxaFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectTaxonNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.subprojectTaxonId
      )
        return null
      return (
        <SubprojectTaxonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectUsersNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <SubprojectUsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectUserNavData': {
      if (!params.projectId || !params.subprojectId || !params.subprojectUserId)
        return null
      return (
        <SubprojectUserFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartsNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <ChartsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartNavData': {
      if (!params.projectId || !params.subprojectId || !params.chartId)
        return null
      return (
        <ChartFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartChartNavData': {
      if (!params.projectId || !params.subprojectId || !params.chartId)
        return null
      return (
        <ChartChartFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartSubjectsNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.placeId ||
        !params.chartId
      )
        return null
      return (
        <ChartSubjectsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectReportDesignsNavData': {
      if (!params.projectId || !params.subprojectId) return null
      return (
        <SubprojectReportDesignsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectReportDesignNavData': {
      if (
        !params.projectId ||
        !params.subprojectId ||
        !params.subprojectReportDesignId
      )
        return null
      return (
        <SubprojectReportDesignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportDesignsNavData': {
      if (!params.projectId) return null
      return (
        <ProjectReportDesignsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportDesignNavData': {
      if (!params.projectId || !params.projectReportDesignId) return null
      return (
        <ProjectReportDesignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartSubjectNavData': {
      if (!params.chartId || !params.chartSubjectId) return null
      return (
        <ChartSubjectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportsNavData': {
      if (!params.projectId) return null
      return (
        <ProjectReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportNavData': {
      if (!params.projectId || !params.projectReportId) return null
      return (
        <ProjectReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePersonsNavData': {
      if (!params.projectId) return null
      return (
        <PersonsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePersonNavData': {
      if (!params.projectId || !params.personId) return null
      return (
        <PersonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWmsLayersNavData': {
      if (!params.projectId) return null
      return (
        <WmsLayersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWmsLayerNavData': {
      if (!params.projectId || !params.wmsLayerId) return null
      return (
        <WmsLayerFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayersNavData': {
      if (!params.projectId) return null
      return (
        <VectorLayersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerNavData': {
      if (!params.projectId || !params.vectorLayerId) return null
      return (
        <VectorLayerFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerVectorLayerNavData': {
      if (!params.projectId || !params.vectorLayerId) return null
      return (
        <VectorLayerVectorLayerFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerDisplaysNavData': {
      if (!params.projectId || !params.vectorLayerId) return null
      return (
        <VectorLayerDisplaysFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerDisplayNavData': {
      if (
        !params.projectId ||
        !params.vectorLayerId ||
        !params.vectorLayerDisplayId
      )
        return null
      return (
        <VectorLayerDisplayFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectUsersNavData': {
      if (!params.projectId) return null
      return (
        <ProjectUsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectUserNavData': {
      if (!params.projectId || !params.projectUserId) return null
      return (
        <ProjectUserFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListValuesNavData': {
      if (!params.projectId || !params.listId) return null
      return (
        <ListValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListValueNavData': {
      if (!params.projectId || !params.listId || !params.listValueId)
        return null
      return (
        <ListValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListsNavData': {
      if (!params.projectId) return null
      return (
        <ListsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectConfigurationNavData': {
      if (!params.projectId) return null
      return (
        <ProjectDesignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListNavData': {
      if (!params.projectId || !params.listId) return null
      return (
        <ListFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListListNavData': {
      if (!params.projectId || !params.listId) return null
      return (
        <ListListFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonomiesNavData': {
      if (!params.projectId) return null
      return (
        <TaxonomiesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonomyNavData': {
      if (!params.projectId || !params.taxonomyId) return null
      return (
        <TaxonomyFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonomyTaxonomyNavData': {
      if (!params.projectId || !params.taxonomyId) return null
      return (
        <TaxonomyTaxonomyFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxaNavData': {
      if (!params.projectId || !params.taxonomyId) return null
      return (
        <TaxaFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonNavData': {
      if (!params.projectId || !params.taxonomyId || !params.taxonId)
        return null
      return (
        <TaxonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useUnitsNavData': {
      if (!params.projectId) return null
      return (
        <UnitsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useUnitNavData': {
      if (!params.projectId || !params.unitId) return null
      return (
        <UnitFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectCrssNavData': {
      if (!params.projectId) return null
      return (
        <ProjectCrssFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectCrsNavData': {
      if (!params.projectId || !params.projectCrsId) return null
      return (
        <ProjectCrsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceLevelsNavData': {
      if (!params.projectId) return null
      return (
        <PlaceLevelsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceLevelNavData': {
      if (!params.projectId || !params.placeLevelId) return null
      return (
        <PlaceLevelFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useUsersNavData': {
      return (
        <UsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useUserNavData': {
      if (!params.userId) return null
      return (
        <UserFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useAccountsNavData': {
      return (
        <AccountsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useAccountNavData': {
      if (!params.accountId) return null
      return (
        <AccountFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFieldTypesNavData': {
      return (
        <FieldTypesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFieldTypeNavData': {
      if (!params.fieldTypeId) return null
      return (
        <FieldTypeFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWidgetTypesNavData': {
      return (
        <WidgetTypesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWidgetTypeNavData': {
      if (!params.widgetTypeId) return null
      return (
        <WidgetTypeFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWidgetsForFieldsNavData': {
      if (!params.projectId) return null
      return (
        <WidgetsForFieldsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWidgetForFieldNavData': {
      if (!params.widgetForFieldId) return null
      return (
        <WidgetForFieldFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFieldsNavData': {
      if (!params.projectId) return null
      return (
        <FieldsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFieldNavData': {
      if (!params.projectId || !params.fieldId) return null
      return (
        <FieldFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCrssNavData': {
      return (
        <CrssFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCrsNavData': {
      if (!params.crsId) return null
      return (
        <CrsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFilesNavData': {
      if (!params.projectId) return null
      return (
        <FilesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFileNavData': {
      if (!params.projectId || !params.fileId) return null
      return (
        <FileFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useMessagesNavData': {
      return (
        <MessagesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useMessageNavData': {
      if (!params.messageId) return null
      return (
        <MessageFetcher
          params={params}
          {...other}
        />
      )
    }
    // when using AnyFetcherImporter the query only returns once, not the result
    // so not great
    default: {
      throw new Error(`Für ${fetcherName} wurde kein "Fetcher" gefunden`)
      // return (
      //   <AnyFetcherImporter
      //     fetcherName={fetcherName}
      //     params={params}
      //     {...other}
      //   />
      // )
    }
  }
}
