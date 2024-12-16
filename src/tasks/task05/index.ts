import { map, pipe, sum } from "ramda";
import { readFileRaw } from "../../utils/input.ts"

type PairsMap = Record<number, number[]>;

function parsePairs(input: string): PairsMap {
    return input
        .split("\n")
        .filter(line => line.includes("|"))
        .reduce((acc, line) => {
            const [key, value] = line.split("|").map(Number);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(value);
            return acc;
        }, {} as PairsMap);
}

function parseGroups(input: string): number[][] {
    return input
        .split("\n")
        .filter(line => line.includes(","))
        .map(line => line.split(",").map(Number));
}

function parseRawData(input: string) {
    const pairs = parsePairs(input);
    const groups = parseGroups(input);

    return {
        pairs,
        groups
    }
}

// const rawData = await readFileRaw(__dirname, "./example.txt");
const rawData = await readFileRaw("./input.txt");

// part 1
const { pairs, groups } = parseRawData(rawData);
console.log("Pairs:", pairs);
console.log("Groups:", groups);

const validGroups = groups.filter(group => {
    for (let i = 0; i < group.length - 1; i++) {
        const a = group[i];

        for (let j = i + 1; j < group.length; j++) {
            const b = group[j];
            if (pairs[b]?.includes(a)) {
                return false;
            }
        }
    }
    return true;
});

console.log("Valid groups:", validGroups);

const getMiddleSum = pipe(
    map((group: number[]) => group[Math.floor(group.length / 2)]),
    sum
)(validGroups)

console.log("Middle sum:", getMiddleSum);

// part 2
const invalidGroups = groups.filter(group => {
    for (let i = 0; i < group.length - 1; i++) {
        const a = group[i];

        for (let j = i + 1; j < group.length; j++) {
            const b = group[j];
            if (pairs[b]?.includes(a)) {
                return true;
            }
        }
    }
    return false;
});

console.log("Invalid groups:", invalidGroups);

const correctedGroups = invalidGroups.map(group => group.slice().sort((a, b) => pairs[a]?.includes(b) ? -1 : 1));

console.log("Corrected groups:", correctedGroups);

const getCorrectedMiddleSum = pipe(
    map((group: number[]) => group[Math.floor(group.length / 2)]),
    sum
)(correctedGroups)

console.log("Corrected middle sum:", getCorrectedMiddleSum);