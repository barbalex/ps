import { useGoalReportsNavData } from '../../../modules/useGoalReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
    goalId: string
  }
}

export const GoalReportsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useGoalReportsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
