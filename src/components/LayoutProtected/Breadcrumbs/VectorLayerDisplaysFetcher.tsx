import { useVectorLayerDisplaysNavData } from '../../../modules/useVectorLayerDisplaysNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    vectorLayerId: string
  }
}

export const VectorLayerDisplaysFetcher = ({ params, ...other }: Props) => {
  const { navData } = useVectorLayerDisplaysNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
