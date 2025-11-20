import { useSubprojectUserNavData } from '../../../modules/useSubprojectUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectUserFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectUserNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
