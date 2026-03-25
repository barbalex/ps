import { useSubprojectQcsRunNavData } from '../../../modules/useSubprojectQcsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectQcsRunFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectQcsRunNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
