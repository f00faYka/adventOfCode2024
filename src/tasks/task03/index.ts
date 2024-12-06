import { join, map, match, pipe, sum } from 'ramda';
import { readFileRaw } from '../../utils/input';

const rawString = readFileRaw("./src/tasks/task03", "./input.txt");
type Pair = [number, number];

const multiply = ([a, b]: Pair) => a * b;
const mulExpRegex = /mul\((\d{1,3}),(\d{1,3})\)/g;
const multipliersRegex = /\d+/g;

// part1
const strToNum = ([a, b]: string[]): Pair => [Number(a), Number(b)];

const processMultipliers = pipe(
    match(multipliersRegex),
    strToNum,
    multiply
);

const getSumOfMultiplications: (input: string) => number = pipe(
    match(mulExpRegex),
    map(processMultipliers),
    sum,
)

const sumOfAllMultiplications = getSumOfMultiplications(rawString);
console.log(sumOfAllMultiplications);

// part2
const enabledRegex = /(do\(\))[\s\S]*?(don\'t\(\))/g;
const disabledRegex = /(don\'t\(\))[\s\S]*?(do\(\))/g;

const getSumOfEnabledMultiplications = pipe(
    match(enabledRegex),
    join(""),
    getSumOfMultiplications,
);

const getSumOfDisabledMultiplications = pipe(
    match(disabledRegex),
    join(""),
    getSumOfMultiplications,
)

const sumOfEnabledMultiplications = getSumOfEnabledMultiplications(`do()${rawString}don't()`);
const sumOfDisabledMultiplications = getSumOfDisabledMultiplications(rawString);

console.log(sumOfEnabledMultiplications);
console.log(sumOfDisabledMultiplications);

console.log(sumOfDisabledMultiplications + sumOfEnabledMultiplications === sumOfAllMultiplications);


