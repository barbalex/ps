import { useSubprojectsNavData } from '../../../modules/useSubprojectsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectsFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
