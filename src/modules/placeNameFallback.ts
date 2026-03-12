type FM = (
  d: { id?: string; defaultMessage: string },
  values?: Record<string, string>,
) => string

export const getPlaceFallbackNames = (
  projectType: string | null | undefined,
  level: 1 | 2,
  formatMessage: FM,
): { singular: string; plural: string } => {
  if (projectType === 'species') {
    if (level === 2) {
      return {
        singular: formatMessage({
          id: 'XVWX78',
          defaultMessage: 'Teil-Population',
        }),
        plural: formatMessage({
          id: 'SmpPB8',
          defaultMessage: 'Teil-Populationen',
        }),
      }
    }
    return {
      singular: formatMessage({ id: '+EKK8l', defaultMessage: 'Population' }),
      plural: formatMessage({ id: 'Eb7rX4', defaultMessage: 'Populationen' }),
    }
  }
  if (projectType === 'biotope') {
    return {
      singular: formatMessage({ id: 'FndrDp', defaultMessage: 'Lebensraum' }),
      plural: formatMessage({ id: 'sH1lgT', defaultMessage: 'Lebensräume' }),
    }
  }
  // unknown project type → generic Ort
  return {
    singular: formatMessage({ id: 'TZgWxf', defaultMessage: 'Ort' }),
    plural: formatMessage({ id: 'h5g7Kk', defaultMessage: 'Orte' }),
  }
}

export const getPlaceHistoryNameSingular = (
  projectType: string | null | undefined,
  level: 1 | 2,
  formatMessage: FM,
): string => {
  const singular = getPlaceFallbackNames(projectType, level, formatMessage).singular
  return formatMessage(
    { id: 'tnPosW', defaultMessage: '{place}-Geschichte' },
    { place: singular },
  )
}

export const getPlaceReportValueNameSingular = (
  projectType: string | null | undefined,
  level: 1 | 2,
  formatMessage: FM,
): string => {
  const singular = getPlaceFallbackNames(projectType, level, formatMessage).singular
  return formatMessage(
    { id: 'DQ73WF', defaultMessage: '{place}-Bericht-Menge' },
    { place: singular },
  )
}
