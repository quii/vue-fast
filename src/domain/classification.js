const classifications = {
  "national50": {
    "men": {
      "senior": {
        "recurve": {
          "A3": 350,
          "A2": 425,
          "A1": 487
        }
      }
    }
  }
};

export function newClassificationCalculator(roundName, sex, age, bowtype) {
  const category = classifications[roundName]?.[sex]?.[age]?.[bowtype];

  return (score) => {
    return Object.keys(category).reduce((acc, key) => {
      if (category[key] <= score) {
        return { classification: key };
      }
      if (acc.next) {
        return acc;
      }
      return { ...acc, next: key, shortBy: category[key] - score };
    }, { classification: "Unclassified" });
  };
}
