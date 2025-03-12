export const formatNumber = (val: unknown) =>
  isNaN(val as number) ? val : new Intl.NumberFormat('de-CH').format(val)
