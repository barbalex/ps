// https://www.30secondsofcode.org/js/s/split-array-into-chunks/
export const chunkArrayWithMinSize = (arr, chunkSize, minChunkSize = 0) => {
  const remainder = arr.length % chunkSize
  const isLastChunkTooSmall = remainder < minChunkSize
  const totalChunks = isLastChunkTooSmall
    ? Math.floor(arr.length / chunkSize)
    : Math.ceil(arr.length / chunkSize)

  return Array.from({ length: totalChunks }, (_, i) => {
    const chunk = arr.slice(i * chunkSize, i * chunkSize + chunkSize)
    if (i === totalChunks - 1 && isLastChunkTooSmall) {
      chunk.push(...arr.slice(-remainder))
    }

    return chunk
  })
}
// const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// chunkArrayWithMinSize(x, 5, 3); // [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]]
// chunkArrayWithMinSize(x, 4, 2); // [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]
