import { useFilesNavData } from '../../../modules/useFilesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FilesFetcher = ({ params, ...other }) => {
  const { navData } = useFilesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
