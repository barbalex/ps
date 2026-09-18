import { useSubprojectsNavData } from '../../../modules/useSubprojectsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectsNavData>[0]
}

export const SubprojectsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
