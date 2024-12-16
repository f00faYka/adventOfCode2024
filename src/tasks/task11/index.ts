import { split } from "ramda";
import { readFileRaw } from "../../utils/input.ts";

const isEven = (str: string): boolean => {
    return str.length % 2 === 0;
}

const getNextStone = (stone: string, multiplier: number): string | [string, string] => {
    if (stone === "0") {
        return "1"
    }
    if (isEven(stone)) {
        const midIdx = stone.length / 2;
        const left = Number(stone.slice(0, midIdx));
        const right = Number(stone.slice(midIdx));
        return [left.toString(), right.toString()];
    }

    return (Number(stone) * multiplier).toString();
}

const processStones = (stones: string[], iterations: number, multiplier: number): number => {
    for (let n = 0; n < iterations; n++) {
        for (let i = 0; i < stones.length; i++) {
            const stone = stones[i];
            const nextStone: string | [string, string] = getNextStone(stone, multiplier);

            if (typeof nextStone === "string") {
                stones[i] = nextStone;
            } else if (Array.isArray(nextStone)) {
                stones.splice(i, 1, ...nextStone);
                i++;
            }
        }
    }
    return stones.length;
}

export const part1 = async (): Promise<number> => {
    const numberLine = await readFileRaw("./input.txt");
    const stones = split(" ")(numberLine);
    return processStones(stones, 25, 2024);
};

export const part2 = async (): Promise<number> => {
    const numberLine = await readFileRaw("./input.txt");
    const stones = split(" ")(numberLine);
    return processStones(stones, 50, 2023);
};

const main = async () => {
    console.log("Part 1:", await part1());
    console.log("Part 2:", await part2());
}

main();