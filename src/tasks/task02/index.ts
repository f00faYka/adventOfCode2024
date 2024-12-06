import { any, compose, curry, either, filter, length, map, pipe, split, trim, zip } from 'ramda';
import { readFileStrings } from '../../utils/input';

type Pair = [number, number];

const parseLine = pipe(
    trim,
    split(/\s+/),
    map(Number)
) as () => number[];

const parseInputIntoArrays = pipe(
    readFileStrings,
    map(parseLine),
);

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
    length as (x: any[]) => number,
)

const getSafeReportCountWithDampener = pipe(
    filter(isSafeWithDampener),
    length as (x: any[]) => number,
)

console.log(compose(getSafeReportCount, parseInputIntoArrays)("./src/tasks/task02", "./input.txt"));
console.log(compose(getSafeReportCountWithDampener, parseInputIntoArrays)("./src/tasks/task02", "./input.txt"));