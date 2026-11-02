export const observationFieldKey = Symbol('observationField')

export function isObservationFieldData(
  data: Record<string | symbol, unknown>,
) {
  return data[observationFieldKey] === true
}
