import { useWidgetForFieldNavData } from '../../../modules/useWidgetForFieldNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    widgetForFieldId: string
  }
}

export const WidgetForFieldFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWidgetForFieldNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
