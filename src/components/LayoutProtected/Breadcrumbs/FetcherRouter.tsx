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
    case 'useProjectNavData': {
      return (
        <ProjectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectProjectNavData': {
      return (
        <ProjectProjectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectsNavData': {
      return (
        <SubprojectsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectNavData': {
      return (
        <SubprojectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlacesNavData': {
      return (
        <PlacesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceNavData': {
      return (
        <PlaceFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChecksNavData': {
      return (
        <ChecksFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckNavData': {
      return (
        <CheckFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckValuesNavData': {
      return (
        <CheckValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckValueNavData': {
      return (
        <CheckValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckTaxaNavData': {
      return (
        <CheckTaxaFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useCheckTaxonNavData': {
      return (
        <CheckTaxonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionsNavData': {
      return (
        <ActionsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionNavData': {
      return (
        <ActionFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionValuesNavData': {
      return (
        <ActionValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionValueNavData': {
      return (
        <ActionValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportsNavData': {
      return (
        <ActionReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportNavData': {
      return (
        <ActionReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportReportNavData': {
      return (
        <ActionReportReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportValuesNavData': {
      return (
        <ActionReportValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useActionReportValueNavData': {
      return (
        <ActionReportValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportsNavData': {
      return (
        <PlaceReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportNavData': {
      return (
        <PlaceReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportReportNavData': {
      return (
        <PlaceReportReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportValuesNavData': {
      return (
        <PlaceReportValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceReportValueNavData': {
      return (
        <PlaceReportValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrencesAssignedNavData': {
      return (
        <OccurrencesAssignedFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceAssignedNavData': {
      return (
        <OccurrenceAssignedFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceUsersNavData': {
      return (
        <PlaceUsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceUserNavData': {
      return (
        <PlaceUserFetcher
          params={params}
          {...other}
        />
      )
    }

    case 'useSubprojectReportsNavData': {
      return (
        <SubprojectReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectReportNavData': {
      return (
        <SubprojectReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectHistoriesNavData': {
      return (
        <SubprojectHistoriesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectHistoryNavData': {
      return (
        <SubprojectHistoryFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceHistoriesNavData': {
      return (
        <PlaceHistoriesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceHistoryNavData': {
      return (
        <PlaceHistoryFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalsNavData': {
      return (
        <GoalsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalNavData': {
      return (
        <GoalFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalGoalNavData': {
      return (
        <GoalGoalFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportsNavData': {
      return (
        <GoalReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportNavData': {
      return (
        <GoalReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportReportNavData': {
      return (
        <GoalReportReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportValuesNavData': {
      return (
        <GoalReportValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useGoalReportValueNavData': {
      return (
        <GoalReportValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceImportsNavData': {
      return (
        <OccurrenceImportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceImportNavData': {
      return (
        <OccurrenceImportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrencesToAssessNavData': {
      return (
        <OccurrencesToAssessFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceToAssessNavData': {
      return (
        <OccurrenceToAssessFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrencesNotToAssignNavData': {
      return (
        <OccurrencesNotToAssignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useOccurrenceNotToAssignNavData': {
      return (
        <OccurrenceNotToAssignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectTaxaNavData': {
      return (
        <SubprojectTaxaFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectTaxonNavData': {
      return (
        <SubprojectTaxonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectUsersNavData': {
      return (
        <SubprojectUsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectUserNavData': {
      return (
        <SubprojectUserFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartsNavData': {
      return (
        <ChartsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartNavData': {
      return (
        <ChartFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartChartNavData': {
      return (
        <ChartChartFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartSubjectsNavData': {
      return (
        <ChartSubjectsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectReportDesignsNavData': {
      return (
        <SubprojectReportDesignsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useSubprojectReportDesignNavData': {
      return (
        <SubprojectReportDesignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportDesignsNavData': {
      return (
        <ProjectReportDesignsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportDesignNavData': {
      return (
        <ProjectReportDesignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useChartSubjectNavData': {
      return (
        <ChartSubjectFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportsNavData': {
      return (
        <ProjectReportsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectReportNavData': {
      return (
        <ProjectReportFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePersonsNavData': {
      return (
        <PersonsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePersonNavData': {
      return (
        <PersonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWmsLayersNavData': {
      return (
        <WmsLayersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWmsLayerNavData': {
      return (
        <WmsLayerFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayersNavData': {
      return (
        <VectorLayersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerNavData': {
      return (
        <VectorLayerFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerVectorLayerNavData': {
      return (
        <VectorLayerVectorLayerFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerDisplaysNavData': {
      return (
        <VectorLayerDisplaysFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useVectorLayerDisplayNavData': {
      return (
        <VectorLayerDisplayFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectUsersNavData': {
      return (
        <ProjectUsersFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectUserNavData': {
      return (
        <ProjectUserFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListValuesNavData': {
      return (
        <ListValuesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListValueNavData': {
      return (
        <ListValueFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListsNavData': {
      return (
        <ListsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectConfigurationNavData': {
      return (
        <ProjectDesignFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListNavData': {
      return (
        <ListFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useListListNavData': {
      return (
        <ListListFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonomiesNavData': {
      return (
        <TaxonomiesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonomyNavData': {
      return (
        <TaxonomyFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonomyTaxonomyNavData': {
      return (
        <TaxonomyTaxonomyFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxaNavData': {
      return (
        <TaxaFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useTaxonNavData': {
      return (
        <TaxonFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useUnitsNavData': {
      return (
        <UnitsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useUnitNavData': {
      return (
        <UnitFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectCrssNavData': {
      return (
        <ProjectCrssFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useProjectCrsNavData': {
      return (
        <ProjectCrsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceLevelsNavData': {
      return (
        <PlaceLevelsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'usePlaceLevelNavData': {
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
      return (
        <WidgetTypeFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWidgetsForFieldsNavData': {
      return (
        <WidgetsForFieldsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useWidgetForFieldNavData': {
      return (
        <WidgetForFieldFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFieldsNavData': {
      return (
        <FieldsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFieldNavData': {
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
      return (
        <CrsFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFilesNavData': {
      return (
        <FilesFetcher
          params={params}
          {...other}
        />
      )
    }
    case 'useFileNavData': {
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
      return (
        <MessageFetcher
          params={params}
          {...other}
        />
      )
    }
    // when using default the query only returns once, not the result
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
