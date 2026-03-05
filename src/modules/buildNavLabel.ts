import { store, intlAtom } from '../store.ts'
import { formatNumber } from './formatNumber.ts'

export const buildNavLabel = ({
  countUnfiltered,
  countFiltered,
  namePlural,
  loading,
  isFiltered = false,
  isLimited = false,
  limit = 100,
}) => {
  const intl = store.get(intlAtom)
  const labelFirst = intl
    ? intl.formatMessage({ id: 'tZTfvu', defaultMessage: 'erste' })
    : 'erste'

  return isFiltered
    ? `${namePlural} (${
        isFiltered
          ? `${loading ? '...' : formatNumber(countFiltered)}/${
              loading ? '...' : formatNumber(countUnfiltered)
            }`
          : loading
            ? '...'
            : formatNumber(countFiltered)
      }${isLimited ? `, ${labelFirst} ${limit}` : ''})`
    : `${namePlural} (${loading ? '...' : formatNumber(countFiltered)}${isLimited ? `, ${labelFirst} ${limit}` : ''})`
}
