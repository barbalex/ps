import { formatNumber } from './formatNumber.ts'

export const buildNavLabel = ({
  countUnfiltered,
  countFiltered,
  namePlural,
  loading,
  isFiltered = false,
}) =>
  isFiltered ?
    `${namePlural} (${
      isFiltered ?
        `${loading ? '...' : formatNumber(countFiltered)}/${
          loading ? '...' : formatNumber(countUnfiltered)
        }`
      : loading ? '...'
      : formatNumber(countFiltered)
    })`
  : ` ${namePlural} (${loading ? '...' : formatNumber(countFiltered)})`
