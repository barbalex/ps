import { useParams } from '@tanstack/react-router'

import { AnyFetcherImporter } from './AnyFetcherImporter.tsx'
import { ProjectsFetcher } from './ProjectsFetcher.tsx'
import { ProjectFetcher } from './ProjectFetcher.tsx'
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
import { UsersFetcher } from './UsersFetcher.tsx'
import { UserFetcher } from './UserFetcher.tsx'
import { AccountsFetcher } from './AccountsFetcher.tsx'
import { AccountFetcher } from './AccountFetcher.tsx'
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

export const FetcherRouter = ({ fetcherName, ...other }) => {
  console.log('FetcherRouter, name:', fetcherName)

  // need to get params here and pass as props otherwise
  // causes the compiler to: "Error: Rendered fewer hooks than expected"
  const params = useParams({ strict: false })

  switch (fetcherName) {
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
    default: {
      return (
        <AnyFetcherImporter
          fetcherName={fetcherName}
          params={params}
          {...other}
        />
      )
    }
  }
}
