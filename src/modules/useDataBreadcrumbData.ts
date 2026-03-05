import { useIntl } from 'react-intl'

export const useDataBreadcrumbData = () => {
  const { formatMessage } = useIntl()
  const navData = {
    label: formatMessage({ id: 'w63miQ', defaultMessage: 'Daten' }),
    ownUrl: '/data',
  }
  return { navData, loading: false }
}
