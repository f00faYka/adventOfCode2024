import { any, curry, either, filter, length, map, pipe, split, trim, zip } from 'ramda';
import { readFileStrings } from '../../utils/input.ts';

type Pair = [number, number];

const parseLine = pipe(
    trim,
    split(/\s+/),
    map(Number)
) as () => number[];

const parseInputIntoArrays = async (filename: string): Promise<number[][]> => {
    const lines = await readFileStrings(filename);
    return map(parseLine)(lines);
};

const isDampenedArraysSafe = (numbers: number[]): boolean => {
    const dampenedArrays: number[][] = [];
    for (let i = 0; i < numbers.length; i++){
        dampenedArrays.push([...numbers.slice(0, i), ...numbers.slice(i + 1)])
    }

    return any(isSafe)(dampenedArrays);
}

const isWrongDirection = curry((isAsc: boolean, [a, b]: Pair) => isAsc ? a > b : a < b);
const hasLargeGap = ([a, b]: Pair) => Math.abs(b - a) >= 4;
const createValidator = (isAsc: boolean) => either(
    isWrongDirection(isAsc),
    hasLargeGap,
);
const hasCorrectLength = (numbers: number[]) => length(numbers) >= 2;

const isSafe = (numbers: number[]): boolean => {
    if (!hasCorrectLength(numbers)) return false;
    const isInvalidPair = createValidator(numbers[0] < numbers[1]);

    const pairs = zip(numbers.slice(0, -1), numbers.slice(1));
    return !pairs.some(isInvalidPair);
}

const isSafeWithDampener = (numbers: number[]): boolean => {
    if (!hasCorrectLength(numbers)) return false;
    const isInvalidPair = createValidator(numbers[0] < numbers[1]);

    const pairs = zip(numbers.slice(0, -1), numbers.slice(1));
    if (pairs.some(isInvalidPair)) {
        return isDampenedArraysSafe(numbers);
    }

    return true;
}

const getSafeReportCount = pipe(
    filter(isSafe),
    length as (x: number[][]) => number,
)

const getSafeReportCountWithDampener = pipe(
    filter(isSafeWithDampener),
    length as (x: number[][]) => number,
)

export const part1 = async (): Promise<number> => {
    const arrays = await parseInputIntoArrays("./input.txt");
    return getSafeReportCount(arrays);
};

export const part2 = async (): Promise<number> => {
    const arrays = await parseInputIntoArrays("./input.txt");
    return getSafeReportCountWithDampener(arrays);
};

const main = async () => {
    console.log(await part1());
    console.log(await part2());
}
main();