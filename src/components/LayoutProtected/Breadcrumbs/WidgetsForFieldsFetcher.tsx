import { useWidgetsForFieldsNavData } from '../../../modules/useWidgetsForFieldsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string | undefined>
}

export const WidgetsForFieldsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useWidgetsForFieldsNavData()

  return (
    <FetcherReturner
      key={`${(navData as { id?: string; ownUrl: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
