import { useParams } from '@tanstack/react-router'

import { AnyFetcherImporter } from './AnyFetcherImporter.tsx'
import { ProjectsFetcher } from './ProjectsFetcher.tsx'
import { ProjectFetcher } from './ProjectFetcher.tsx'
import { SubprojectsFetcher } from './SubprojectsFetcher.tsx'
import { UsersFetcher } from './UsersFetcher.tsx'
import { UserFetcher } from './UserFetcher.tsx'
import { AccountsFetcher } from './AccountsFetcher.tsx'
import { AccountFetcher } from './AccountFetcher.tsx'
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
