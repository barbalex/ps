import { useFieldsNavData } from '../../../modules/useFieldsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId?: string
    accountId?: string
    userId?: string
  }
}

export const FieldsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useFieldsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
