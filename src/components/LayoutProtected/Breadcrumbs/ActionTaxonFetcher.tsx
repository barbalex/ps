import { useActionTaxonNavData } from '../../../modules/useActionTaxonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionTaxonFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionTaxonNavData(
    params as Parameters<typeof useActionTaxonNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
