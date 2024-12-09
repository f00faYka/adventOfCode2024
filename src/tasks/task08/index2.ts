import { readFileStrings } from "../../utils/input";
import { filter, head, map, split } from "ramda";

type Point = [number, number];

type Grid = string[][];

type HashMap = Record<string, Point[]>;

const createIsInRange = (width: number, height: number) => ([y, x]: Point) => x >= 0 && x < width && y >= 0 && y < height;

const getMap = map(split(""));

const getHashMap = (grid: Grid) => {
    const hashMap: HashMap = {};

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            const symbol = grid[y][x];
            if (symbol !== ".") {
                hashMap[symbol] = (hashMap[symbol] || []).concat([[y, x]]);
            }
        }
    }
    return hashMap;
}

const buildPairs = (points: Point[]): [Point, Point][] => {
    const result = [];

    for (let i = 0; i < points.length - 1; i++) {
        for (let j = i + 1; j < points.length; j++) {
            result.push([points[i], points[j]]);
        }
    }
    return result as [Point, Point][];
}

const buildAntiNodes = (pairs: [Point, Point][], gridHeight: number, gridWidth: number): Point[] => {
    const result: Point[] = [];

    pairs.forEach(([[y1, x1], [y2, x2]]) => {
        const dy = y2 - y1;
        const dx = x2 - x1;

        const gcd = Math.abs(gcd2(dy, dx));
        const stepY = dy / gcd;
        const stepX = dx / gcd;

        let currentY = y1;
        let currentX = x1;
        while (isValidPoint([currentY, currentX], gridHeight, gridWidth)) {
            result.push([currentY, currentX]);
            currentY -= stepY;
            currentX -= stepX;
        }

        currentY = y2;
        currentX = x2;
        while (isValidPoint([currentY, currentX], gridHeight, gridWidth)) {
            result.push([currentY, currentX]);
            currentY += stepY;
            currentX += stepX;
        }
    });

    return result;
};


// Utility function to find GCD
const gcd2 = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd2(b, a % b));

// Utility function to check if a point is valid within the grid
const isValidPoint = ([y, x]: Point, gridHeight: number, gridWidth: number): boolean => {
    return y >= 0 && y < gridHeight && x >= 0 && x < gridWidth;
};

// const lines = readFileStrings(__dirname, "./example.txt");
const lines = readFileStrings(__dirname, "./input.txt");

const symbolMap = getMap(lines);

const isInRange = createIsInRange(symbolMap.length, symbolMap[0].length);

const hashMap = getHashMap(symbolMap);

console.log(hashMap);

const antiNodesSet = new Set();

Object.values(hashMap).forEach((points) => {
    const pairs = buildPairs(points);
    const antiNodes = buildAntiNodes(pairs, symbolMap.length, symbolMap[0].length);
    const filteredAntiNodes = filter(isInRange)(antiNodes);

    filteredAntiNodes.forEach(([y, x]) => antiNodesSet.add(`[${y},${x}]`));
});

console.log(antiNodesSet);
console.log(antiNodesSet.size);