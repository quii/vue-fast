export const classificationList = [
  "A3",
  "A2",
  "A1",
  "B3",
  "B2",
  "B1",
  "MB",
  "GMB",
  "EMB",
  "PB"
];

export function getClassificationIndex(classification) {
  return classificationList.indexOf(classification);
}

export function isHigherOrEqualClassification(classification1, classification2) {
  return getClassificationIndex(classification1) >= getClassificationIndex(classification2);
}

export function getNextClassification(currentClassification) {
  const currentIndex = getClassificationIndex(currentClassification);
  if (currentIndex < classificationList.length - 1) {
    return classificationList[currentIndex + 1];
  }
  return currentClassification;
}
