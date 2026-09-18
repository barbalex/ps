import { useWidgetTypesNavData } from '../../../modules/useWidgetTypesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string | undefined>
}

export const WidgetTypesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWidgetTypesNavData()

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
