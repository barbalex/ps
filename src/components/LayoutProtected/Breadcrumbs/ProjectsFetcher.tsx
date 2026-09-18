import { useProjectsNavData } from '../../../modules/useProjectsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectsNavData>[0]
}

// pass on TransitionGroup's props
export const ProjectsFetcher = ({ params, ...other }: Props) => {
  // need to pass in params
  // If not: When navigating up the tree while transitioning out lower levels,
  // those bookmark components will not have their params anymore and error
  const { navData } = useProjectsNavData(params)

  // TODO: navData.id does not (always?) exist
  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
