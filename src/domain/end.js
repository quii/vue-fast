export function getLowestScoreForRecentEnd(scores) {
    const endSize = 6;
    const recentEndIndex = scores.length % endSize

    if(recentEndIndex===0) {
        return Infinity
    }

    const recentEndScores = scores.slice(-recentEndIndex).map((arrow) => {
        if (arrow === "M") return 0
        return arrow
    })

    let minScore = Infinity;
    for (let i = 0; i < recentEndScores.length; i++) {
        if (recentEndScores[i] < minScore) {
            minScore = recentEndScores[i];
        }
    }

    return minScore;
}


