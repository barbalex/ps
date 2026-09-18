import { useGoalReportNavData } from '../../../modules/useGoalReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
    goalId: string
    goalReportId: string
  }
}

export const GoalReportFetcher = ({ params, ...other }: Props) => {
  const { navData } = useGoalReportNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
