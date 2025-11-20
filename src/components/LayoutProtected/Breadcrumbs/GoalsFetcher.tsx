import { useGoalsNavData } from '../../../modules/useGoalsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalsFetcher = ({ params, ...other }) => {
  const { navData } = useGoalsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
