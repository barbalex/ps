import { useWidgetTypeNavData } from '../../../modules/useWidgetTypeNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    widgetTypeId: string
  }
}

export const WidgetTypeFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWidgetTypeNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
