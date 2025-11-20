import { useFieldTypeNavData } from '../../../modules/useFieldTypeNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const FieldTypeFetcher = ({ params, ...other }) => {
  const { navData } = useFieldTypeNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
