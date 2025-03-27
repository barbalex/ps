// TODO: use locale set by user for toLocaleString
export const formatNumber = (val: unknown) =>
  isNaN(val as number) ? val : new Intl.NumberFormat('de-CH').format(val)
