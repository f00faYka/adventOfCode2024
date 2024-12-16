import { type GameRound, readInputFile } from "./parser.ts";

type Point = [number, number];

const isEqual = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

const COST_A = 3;
const COST_B = 1;

// const getCost = (path: string[]) => {
//     return path.filter(p => p === "A").length * COST_A + path.filter(p => p === "B").length * COST_B;
// }

const getLowestPath = (round: GameRound) => {
    const [dyA, dxA] = round.buttonA;
    const [dyB, dxB] = round.buttonB;
    const { prize } = round;

    const memo = new Map<string, number | null>();

    function getPathCost(
        [y, x]: Point,
    ): number | null {
        if (isEqual([y, x], prize)) {
            return 0;
        }

        if (y > prize[0] || x > prize[1]) {
            return null;
        }

        const key = `${y},${x}`;
        if (memo.has(key)) {
            return memo.get(key)!;
        }

        const costA = getPathCost([y + dyA, x + dxA]);
        const costB = getPathCost([y + dyB, x + dxB]);

        let minCost: number | null = null;

        if (costA !== null) {
            minCost = COST_A + costA;
        }
        if (costB !== null) {
            const totalCostB = COST_B + costB;
            minCost = minCost === null ? totalCostB : Math.min(minCost, totalCostB);
        }

        memo.set(key, minCost);
        return minCost;
    }

    return getPathCost([0, 0]);
}

// const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const solveByKramer = (round: GameRound): number | null => {
    const [dyA, dxA] = round.buttonA;
    const [dyB, dxB] = round.buttonB;
    const [prizeY, prizeX] = round.prize;

    const detA = dxA * dyB - dxB * dyA;

    if (detA === 0) {
        return null;
    }

    const detAa = dyB * prizeX - dxB * prizeY;
    const detAb = -dyA * prizeX + dxA * prizeY;

    const a = detAa / detA;
    const b = detAb / detA;

    if (!Number.isInteger(a) || !Number.isInteger(b)) {
        return null;
    }

    const cost = Math.abs(a) * COST_A + Math.abs(b) * COST_B;
    return cost;
};

export const part1 = async (): Promise<number> => {
    const gameRounds = await readInputFile("./input.txt");
    return gameRounds
        .map(getLowestPath)
        .filter((cost): cost is number => cost !== null)
        .reduce((sum, cost) => sum + cost, 0);
};

export const part2 = async (): Promise<number> => {
    const gameRounds = await readInputFile("./input.txt");
    return gameRounds
        .map(({ buttonA, buttonB, prize }) => ({
            buttonA,
            buttonB,
            prize: [prize[0] + 10000000000000, prize[1] + 10000000000000] as Point
        }))
        .map(solveByKramer)
        .filter((cost): cost is number => cost !== null)
        .reduce((sum, cost) => sum + cost, 0);
};

const main = async () => {
    console.log("Part 1:", await part1());
    console.log("Part 2:", await part2());
}

main();