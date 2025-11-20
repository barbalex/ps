import { useGoalNavData } from '../../../modules/useGoalNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalFetcher = ({ params, ...other }) => {
  const { navData } = useGoalNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
