import { useSubprojectQcsRunNavData } from '../../../modules/useSubprojectQcsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectQcsRunNavData>[0]
}

export const SubprojectQcsRunFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectQcsRunNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
