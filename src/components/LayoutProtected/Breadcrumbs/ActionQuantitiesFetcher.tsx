import { useActionQuantitiesNavData } from '../../../modules/useActionQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionQuantitiesFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionQuantitiesNavData(
    params as Parameters<typeof useActionQuantitiesNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
