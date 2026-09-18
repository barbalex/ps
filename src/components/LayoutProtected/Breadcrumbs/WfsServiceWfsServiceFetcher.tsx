import { useWfsServiceWfsServiceNavData } from '../../../modules/useWfsServiceWfsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wfsServiceId: string
  }
}

export const WfsServiceWfsServiceFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWfsServiceWfsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
