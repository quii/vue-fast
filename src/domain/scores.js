import { gameTypeConfig } from "@/domain/game_types";

const GOLD = 9;
export const MISS = "M";
export const validScores = [GOLD, 7, 5, 3, 1, MISS];
export const scoresPerEnd = 6;
export const endsPerRound = 2;

export function calculateTotal(scores) {
    return getHits(scores).reduce((totalScore, score) => totalScore + score, 0)

}
export function calculateHitsCount(scores) {
    return getHits(scores).length
}
export function calculateGoldCount(scores) {
    return scores.reduce((total, score) => {
        if (score === GOLD) {
            return total + 1;
        }
        return total;
    }, 0);
}

function splitIntoChunks(array, chunkSize) {
    return array.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);
}

export function calculateRounds(scores, gameType = 'national') {
    const ends = splitIntoChunks(scores, scoresPerEnd);
    const roundScores = splitIntoChunks(ends, endsPerRound);
    const {firstDistance} = gameTypeConfig[gameType]

    // roundScores is an array of "roundScores" (which are just arrays)
    // therefore we need to return an array of objects instead
    let rt = 0;

    const rounds =  roundScores.map((e) => {
        // figure out subtotals
        const flatted = e.flat();
        let roundScore = calculateTotal(flatted);
        const subTotals = {
            hits: calculateHitsCount(flatted),
            golds: calculateGoldCount(flatted),
            score: roundScore,
            runningTotal: rt + roundScore
        };
        rt = subTotals.runningTotal;

        return {firstEnd: e[0] ?? [], secondEnd: e[1] ?? [], subTotals};
    });

    const roundBreakdown = splitIntoChunks(rounds, firstDistance);
    return {
        firstDistance: roundBreakdown[0],
        secondDistance : roundBreakdown[1] ?? [],
    }
}

function getHits(scores) {
    return scores.filter((score) => score !== MISS);
}

