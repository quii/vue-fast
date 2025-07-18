export default function splitIntoChunksofSizes(array: any[], chunkSizes: number[]): any[][] {
  const result: any[][] = []
  let currentIndex = 0

  for (let i = 0; i < chunkSizes.length; i++) {
    const chunkSize = Math.ceil(chunkSizes[i]);
    const chunk = array.slice(currentIndex, currentIndex + chunkSize)
    result.push(chunk)
    currentIndex += chunkSize
  }

  return result
}

export function splitIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  return array.reduce((resultArray: T[][], item: T, index: number) => {
    const chunkIndex = Math.floor(index / chunkSize)

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])
}
