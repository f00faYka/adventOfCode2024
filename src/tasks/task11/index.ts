import { split } from "ramda";
import { readFileRaw } from "../../utils/input";

// const numberLine = readFileRaw(__dirname, "./example.txt");
const numberLine = readFileRaw(__dirname, "./input.txt");

const stones = split(" ")(numberLine);

const isEven = (str: string): boolean => {
    return str.length % 2 === 0;
}


const getNextStone = (stone: string): string | [string, string] => {
    if (stone === "0") {
        return "1"
    }
    if (isEven(stone)) {
        const midIdx = stone.length / 2;
        const left = Number(stone.slice(0, midIdx));
        const right = Number(stone.slice(midIdx));
        return [left.toString(), right.toString()];
    }

    return (Number(stone) * 2024).toString();
}

for (let n = 0; n < 25; n++) {
    for (let i = 0; i < stones.length; i++) {
        const stone = stones[i];

        const nextStone: string | [string, string] = getNextStone(stone);

        if (typeof nextStone === "string") {
            stones[i] = nextStone;
        } else if (Array.isArray(nextStone)) {
            stones.splice(i, 1, ...nextStone);
            i++;
        }
    }
}

console.log(stones.length);