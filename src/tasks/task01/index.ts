import { evolve, map, pipe, reduce, sort, split, trim, zipWith, props, apply, add, curry, tap, toPairs } from 'ramda';
import { readFileStrings } from '../../utils/input';

type NumberArrays = {
    left: number[];
    right: number[];
};

const parseLine = pipe(
    trim,
    split(/\s+/),
    map(Number)
) as () => [number, number];

const parseInputIntoArrays = pipe(
    map(parseLine),
    reduce<[number, number], NumberArrays>(
        (acc, [left, right]) => ({
            left: [...acc.left, left],
            right: [...acc.right, right]
        }),
        { left: [], right: [] }
    )
);

const sortDesc = sort((a: number, b: number) => b - a);
const getSortedArrays = evolve({
    left: sortDesc,
    right: sortDesc
});

const calculateSum = pipe(
    props(['left', 'right']) as (numbers: NumberArrays) => [number[], number[]],
    apply(zipWith((a: number, b: number) => Math.abs(a - b))),
    reduce(add, 0)
);

const getSum = async (dir: string, filename: string): Promise<number> => {
    const lines = await readFileStrings(filename);
    return pipe(
        parseInputIntoArrays,
        getSortedArrays,
        calculateSum
    )(lines);
};

const getHash = curry(
    reduce<number, Record<number, number>>((acc, cur) => ({
        ...acc,
        [cur]: (acc[cur] ?? 0) + 1,
    }), {})
)

const getFrequency = (right: Record<number, number>) => (n: number) => right[n] ?? 0;

const calculateSimilarity = pipe(
    props(['left', 'right']) as (obj: { left: number[], right: Record<number, number> }) => [number[], Record<number, number>],
    ([left, right]) => pipe(
        map((n: number) => n * getFrequency(right)(n)),
        reduce(add, 0)
    )(left)
);

const getSimilarityScore = async (dir: string, filename: string): Promise<number> => {
    const lines = await readFileStrings(filename);
    return pipe(
        parseInputIntoArrays,
        evolve({
            right: getHash,
        }),
        calculateSimilarity,
    )(lines);
}

export const part1 = async (): Promise<number> => {
    return await getSum("./src/tasks/task01", "./input.txt");
};

export const part2 = async (): Promise<number> => {
    return await getSimilarityScore("./src/tasks/task01", "./input.txt");
}

// Для запуска используйте:
// const main = async () => {
//     console.log(await part1());
//     console.log(await part2());
// }
// main();