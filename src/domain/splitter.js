
export default function splitIntoChunksofSizes(array, chunkSizes) {
  let result = [];
  let currentIndex = 0;

  for (let i = 0; i < chunkSizes.length; i++) {
    const chunkSize = chunkSizes[i];
    const chunk = array.slice(currentIndex, currentIndex + chunkSize);
    result.push(chunk);
    currentIndex += chunkSize;
  }

  return result;
}