import { useSubprojectHistoriesNavData } from '../../../modules/useSubprojectHistoriesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectHistoriesFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectHistoriesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
