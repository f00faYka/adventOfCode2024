import { filter, sum } from "ramda";
import { map } from "ramda";
import { type GameRound, readInputFile } from "./parser";

type Point = [number, number];

const isEqual = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

const COST_A = 3;
const COST_B = 1;

const getCost = (path: string[]) => {
    return path.filter(p => p === "A").length * COST_A + path.filter(p => p === "B").length * COST_B;
}

const getLowestPath = (round: GameRound) => {
    const [dyA, dxA] = round.buttonA;
    const [dyB, dxB] = round.buttonB;
    const { prize } = round;

    const memo = new Map<string, number | null>();


    // const path: string[] = [];

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

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const solveByKramer = (round: GameRound): number | null => {
    const [dyA, dxA] = round.buttonA;
    const [dyB, dxB] = round.buttonB;
    const [prizeY, prizeX] = round.prize;

    console.log(round);

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

    console.log(a, b, cost);

    return cost;
};

const gameRounds = readInputFile("./input.txt");
// const gameRounds = readInputFile("./example.txt");

console.log(
    gameRounds
        .map(getLowestPath)
        .filter((cost): cost is number => cost !== null)
        .reduce((sum, cost) => sum + cost, 0)
);

console.log(
    gameRounds
        .map(({ buttonA, buttonB, prize }) => ({
            buttonA,
            buttonB,
            prize: [prize[0] + 10000000000000, prize[1] + 10000000000000] as Point
        }))
        .map(solveByKramer)
        .filter((cost): cost is number => cost !== null)
        .reduce((sum, cost) => sum + cost, 0)
);


// 36525670146415 low