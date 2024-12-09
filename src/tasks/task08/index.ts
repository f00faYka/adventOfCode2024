import { readFileStrings } from "../../utils/input";
import { flatten, filter, map, pipe, split, length, addIndex, reduce, values, unnest } from "ramda";

type Point = [number, number];

type Pair = [Point, Point];

type Pairs = Pair[];

type HashMap = Record<string, Point[]>;

type SymbolPoint = {
    symbol: string;
    point: Point;
};

const splitLines = map(split(""));

const mapSymbolsToPoints = (y: number) => addIndex<string, SymbolPoint>(map)(
    (symbol: string, x: number): SymbolPoint => ({
        symbol: symbol,
        point: [y, x]
    })
);

const mapToSymbolPoints = addIndex<string[], SymbolPoint[]>(map)(
    (line: string[], y: number) => mapSymbolsToPoints(y)(line)
);

const filterNonDots = filter<SymbolPoint>(({ symbol }) => symbol !== ".");

const groupBySymbol = reduce<SymbolPoint, HashMap>(
    (acc, { symbol, point: [y, x] }) => ({
        ...acc,
        [symbol]: [
            ...(acc[symbol] || []),
            [y, x]
        ]
    }),
    {}
);

const getBaseStations = pipe(
    splitLines,
    mapToSymbolPoints,
    flatten,
    filterNonDots,
    groupBySymbol,
    values,
);

const buildPairs = (points: Point[]): Pairs => unnest(
    addIndex<Point, Pair[]>(map)((point: Point, i: number) =>
        map<Point, Pair>(otherPoint => [point, otherPoint], points.slice(i + 1))
    )(points)
);


const getDeltas = ([[y1, x1], [y2, x2]]: Pair): Point => [
    y2 - y1,
    x2 - x1
];

const getAntiNodePair = ([[y1, x1], [y2, x2]]: Pair, [dy, dx]: [number, number]): Pair => [
    [y1 - dy, x1 - dx],
    [y2 + dy, x2 + dx]
];

const buildAntiNodes = (pairs: Pairs): Point[] => pipe(
    map((pair: Pair): Point[] => {
        const deltas = getDeltas(pair);
        return getAntiNodePair(pair, deltas);
    }),
    unnest,
)(pairs);

const lines = readFileStrings(__dirname, "./example.txt");
const createIsInRange = (width: number, height: number) => ([y, x]: Point) => x >= 0 && x < width && y >= 0 && y < height;

const isInRange = createIsInRange(lines[0].length, lines.length);
// const lines = readFileStrings(__dirname, "./input.txt");

const baseStations = getBaseStations(lines);

const processBaseStation = pipe(
    buildPairs,
    buildAntiNodes,
    filter(isInRange)
);

const processBaseStations = pipe(
    map(processBaseStation),
    reduce((acc: Set<string>, points: Point[]) => {
        points.forEach(([y, x]: Point) => acc.add(`[${y},${x}]`));
        return acc;
    }, new Set<string>())
);


const antiNodesSet = processBaseStations(baseStations);

console.log(antiNodesSet.size);