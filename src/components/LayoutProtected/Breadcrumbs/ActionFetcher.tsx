import { useActionNavData } from '../../../modules/useActionNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useActionNavData(
    params as Parameters<typeof useActionNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
