import { useGoalNavData } from '../../../modules/useGoalNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
    goalId: string
  }
}

export const GoalFetcher = ({ params, ...other }: Props) => {
  const { navData } = useGoalNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
