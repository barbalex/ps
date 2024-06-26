export const round = (num) => {
  const integerLength = Math.floor(num).toString().length
  if (integerLength > 6) {
    // if > 6 places before the comma: return as integer
    return parseInt(num, 10)
  }
  // round to 7 decimal places
  return Math.round(num * 10000000) / 10000000
}