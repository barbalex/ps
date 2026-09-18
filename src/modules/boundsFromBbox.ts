// bbox comes from @turf/bbox: [minX, minY, maxX, maxY] (2D case)
export const boundsFromBbox = (
  bbox: number[],
): [[number, number], [number, number]] => {
  const [minY, minX, maxY, maxX] = bbox

  return [
    [minX, minY],
    [maxX, maxY],
  ]
}
