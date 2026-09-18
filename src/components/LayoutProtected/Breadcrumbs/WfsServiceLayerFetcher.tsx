import { useWfsServiceLayerNavData } from '../../../modules/useWfsServiceLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    wfsServiceId: string
    wfsServiceLayerId: string
  }
}

export const WfsServiceLayerFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWfsServiceLayerNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
