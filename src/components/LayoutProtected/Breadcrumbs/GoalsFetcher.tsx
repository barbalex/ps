import { useGoalsNavData } from '../../../modules/useGoalsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
  }
}

export const GoalsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useGoalsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
