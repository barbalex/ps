import { useQcNavData } from '../../../modules/useQcNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useQcNavData>[0]
}

export const QcFetcher = ({ params, ...other }: Props) => {
  const { navData } = useQcNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
