export const round = (num) => {
  if (!Number.isFinite(num)) return undefined
  const integerLength = Math.floor(num).toString().length
  if (integerLength > 6) {
    // if > 6 places before the comma: return as integer
    return parseInt(num, 10)
  }
  // round to 7 decimal places
  return Math.round(num * 10000000) / 10000000
}

export const formatCoordinate = (num) => {
  if (num === undefined || num === null) return undefined
  // Use apostrophe as thousands separator
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}
