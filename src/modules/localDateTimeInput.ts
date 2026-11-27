// datetime-local uses the shortest representation (no trailing fractional
// zeroes, and no seconds when both seconds and milliseconds are zero).
export const localDateTimeInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local
    .toISOString()
    .slice(0, -1)
    .replace(/0{1,3}$/, '')
    .replace(/\.$/, '')
    .replace(/T(\d\d:\d\d):00$/, 'T$1')
}
