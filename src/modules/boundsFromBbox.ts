export const boundsFromBbox = (bbox) => {
  const [minY, minX, maxY, maxX] = bbox

  return [
    [minX, minY],
    [maxX, maxY],
  ]
}
