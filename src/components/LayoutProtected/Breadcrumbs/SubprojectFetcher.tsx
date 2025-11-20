import { useSubprojectNavData } from '../../../modules/useSubprojectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
