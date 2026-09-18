import { useActionTaxaNavData } from '../../../modules/useActionTaxaNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionTaxaFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionTaxaNavData(
    params as Parameters<typeof useActionTaxaNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
