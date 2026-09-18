import { useActionQuantityNavData } from '../../../modules/useActionQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionQuantityFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionQuantityNavData(
    params as Parameters<typeof useActionQuantityNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
