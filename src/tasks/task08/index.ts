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

const gcd2 = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd2(b, a % b));

const createBuildAllAntiNodes = (gridHeight: number, gridWidth: number) => (pairs: [Point, Point][]): Point[] => {
    const result: Point[] = [];
    const isInRange = createIsInRange(gridWidth, gridHeight);

    pairs.forEach(([[y1, x1], [y2, x2]]) => {
        const dy = y2 - y1;
        const dx = x2 - x1;

        const gcd = Math.abs(gcd2(dy, dx));
        const stepY = dy / gcd;
        const stepX = dx / gcd;

        let currentY = y1;
        let currentX = x1;
        while (isInRange([currentY, currentX])) {
            result.push([currentY, currentX]);
            currentY -= stepY;
            currentX -= stepX;
        }

        currentY = y2;
        currentX = x2;
        while (isInRange([currentY, currentX])) {
            result.push([currentY, currentX]);
            currentY += stepY;
            currentX += stepX;
        }
    });

    return result;
};

const lines = readFileStrings(__dirname, "./input.txt");
// const lines = readFileStrings(__dirname, "./example.txt");

const createIsInRange = (width: number, height: number) => ([y, x]: Point) => x >= 0 && x < width && y >= 0 && y < height;

const isInRange = createIsInRange(lines[0].length, lines.length);

const baseStations = getBaseStations(lines);

const getAntiNodes = pipe(
    buildPairs,
    buildAntiNodes,
    filter(isInRange)
);

const processBaseStations = (getAntiNodes: (points: Point[]) => Point[]
) => pipe(
    map(getAntiNodes),
    reduce((acc: Set<string>, points: Point[]) => {
        points.forEach(([y, x]: Point) => acc.add(`[${y},${x}]`));
        return acc;
    }, new Set<string>())
);

// part 1

const antiNodesSet = processBaseStations(getAntiNodes)(baseStations);
console.log(antiNodesSet.size);

// part 2
const buildAntiNodesPart2 = createBuildAllAntiNodes(lines[0].length, lines.length);

const getAntiNodesPart2 = pipe(
    buildPairs,
    buildAntiNodesPart2,
    filter(isInRange)
);

const antiNodesSetPart2 = processBaseStations(getAntiNodesPart2)(baseStations);
console.log(antiNodesSetPart2.size);