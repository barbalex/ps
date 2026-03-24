import { useSubprojectQcsNavData } from '../../../modules/useSubprojectQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectQcsFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectQcsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
