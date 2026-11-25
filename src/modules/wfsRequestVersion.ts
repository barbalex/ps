// The VERSION of a wfs request. WFS has the versions 1.0.0, 1.1.0 and 2.0.0 — a
// service without a stored version used to be asked for "1.3.0". The version cannot
// be left away either: MapServer answers "Incomplete WFS request: VERSION parameter
// missing". 1.1.0 is the one every server has spoken ever since it came out.
export const wfsRequestVersion = (version: string | null | undefined): string =>
  version || '1.1.0'
