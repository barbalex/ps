import { useFileNavData } from '../../../modules/useFileNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FileFetcher = ({ params, ...other }) => {
  const { navData } = useFileNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
