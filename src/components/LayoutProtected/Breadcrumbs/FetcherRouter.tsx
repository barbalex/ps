import { useParams } from '@tanstack/react-router'

import { AnyFetcherImporter } from './AnyFetcherImporter.tsx'
import { ProjectsFetcher } from './ProjectsFetcher.tsx'
import { ProjectFetcher } from './ProjectFetcher.tsx'
import { SubprojectsFetcher } from './SubprojectsFetcher.tsx'
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
