// A form header can stay mounted several routes below its record (e.g. on
// a display or quantity). Resolve siblings from the record, not the URL.
export const siblingRecordPath = (recordPath: string, id: string, tab?: string) =>
  `${recordPath.slice(0, recordPath.lastIndexOf('/') + 1)}${id}${tab ? `/${tab}` : ''}`
