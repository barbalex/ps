export const parseRowsDates = (row) =>  Object.entries(row ?? {}).reduce((acc, [k, v]) => {
  let value = v
  // parse iso date if is or form will error
  // need to exclude numbers
  if (isNaN(value)) {
    let parsedDate
    try {
      parsedDate = Date.parse(value)
    } catch (error) {
      console.log('OrFilter, error parsing date:', error)
    }
    if (!isNaN(parsedDate)) {
      try {
        value = new Date(parsedDate)
      } catch (error) {
        console.log('OrFilter, error creating date:', error)
      }
    }
  }

  return { ...acc, [k]: value }
}, {})