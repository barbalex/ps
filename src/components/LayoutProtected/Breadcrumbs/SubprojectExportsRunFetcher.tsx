import { useSubprojectExportsRunNavData } from '../../../modules/useSubprojectExportsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectExportsRunFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectExportsRunNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
