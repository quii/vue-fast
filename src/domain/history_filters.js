export function filterByPB(history, pbOnly) {
  return pbOnly ? history.filter(shoot => shoot.topScore) : history;
}

export function filterByRound(history, round) {
  return round ? history.filter(shoot => shoot.gameType === round) : history;
}

export function filterByDateRange(history, dateRange) {
  if (!dateRange?.startDate && !dateRange?.endDate) {
    return history;
  }

  return history.filter(shoot => {
    const shootDate = new Date(shoot.date);
    const afterStart = !dateRange.startDate || shootDate >= new Date(dateRange.startDate);
    const beforeEnd = !dateRange.endDate || shootDate <= new Date(dateRange.endDate);
    return afterStart && beforeEnd;
  });
}

export function filterByClassification(history, classification) {
  return classification
    ? history.filter(shoot => shoot.classification?.name === classification)
    : history;
}
