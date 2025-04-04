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

export const classificationMap = {
  A3: "Archer Third Class",
  A2: "Archer Second Class",
  A1: "Archer First Class",
  B3: "Bowman Third Class",
  B2: "Bowman Second Class",
  B1: "Bowman First Class",
  MB: "Master Bowman",
  GMB: "Grand Master Bowman",
  EMB: "Elite Master Bowman"
};