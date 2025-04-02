import { formatNumber } from './formatNumber.ts'

export const buildNavLabel = ({
  countUnfiltered,
  countFiltered,
  namePlural,
  loading,
  isFiltered = false,
  isLimited = false,
  limit = 100,
}) =>
  isFiltered ?
    `${namePlural} (${
      isFiltered ?
        `${loading ? '...' : formatNumber(countFiltered)}/${
          loading ? '...' : formatNumber(countUnfiltered)
        }`
      : loading ? '...'
      : formatNumber(countFiltered)
    }${isLimited ? `, first ${limit}` : ''})`
  : ` ${namePlural} (${loading ? '...' : formatNumber(countFiltered)}${isLimited ? `, first ${limit}` : ''})`
