import { useWmsServiceNavData } from '../../../modules/useWmsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wmsServiceId: string
  }
}

export const WmsServiceFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWmsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
