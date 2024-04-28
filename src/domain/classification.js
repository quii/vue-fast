const classifications = {
  "national 40": {
    "male": {
      "senior": {
        "recurve": {
          "A3": 434,
          "A2": 495
        }
      },
      "50+": {
        "recurve": {
          "A3": 367,
          "A2": 439,
          "A1": 499
        }
      }
    },
    "female": {
      "senior": {
        "recurve": {
          "A3": 383,
          "A2": 453
        }
      }
    }
  },
  "national 50": {
    "male": {
      "senior": {
        "recurve": {
          "A3": 350,
          "A2": 425,
          "A1": 487
        }
      },
      "50+": {
        "recurve": {
          "A3": 278,
          "A2": 356,
          "A1": 430,
          "B3": 491
      }
      },
    },
    "female": {
      "senior": {
        "recurve": {
          "A3": 294,
          "A2": 373,
          "A1": 444
        }
      }
    }
  },
  "national": {
    "male": {
      "senior": {
        "recurve": {
          "A3": 276,
          "A2": 354,
          "A1": 428,
          "B3": 491
        }
      },
      "50+": {
        "recurve": {
          "A3": 207,
          "A2": 281,
          "A1": 360,
          "B3": 433,
          "B2": 495
        }
      }
    },
    "female": {
      "senior": {
        "recurve": {
          "A3": 222,
          "A2": 298,
          "A1": 376,
          "B3": 447
        }
      }
    }
  },
  "long national": {
    "male": {
      "senior": {
        "recurve": {
          "A3": 185,
          "A2": 255,
          "A1": 332,
          "B3": 407,
          "B2": 473
        }
      },
      "50+": {
        "recurve": {
          "A3": 132,
          "A2": 190,
          "A1": 260,
          "B3": 337,
          "B2": 412,
          "B1": 477
        }
      }
    }
  },
  "new national": {
    "male": {
      "senior": {
        "recurve": {
          "A3": 113,
          "A2": 166,
          "A1": 233,
          "B3": 309,
          "B2": 386,
          "B1": 456
        }
      },
      "50+": {
        "recurve": {
          "A3": 77,
          "A2": 116,
          "A1": 160,
          "B3": 238,
          "B2": 315,
          "B1": 392
        }
      }
    }
  }
};

export function newClassificationCalculator(roundName, sex, age, bowtype) {
  const category = classifications[roundName]?.[sex]?.[age]?.[bowtype];

  if (!category) {
    return undefined;
  }

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
