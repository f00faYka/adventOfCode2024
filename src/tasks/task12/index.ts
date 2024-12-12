import { filter, map, pipe, prop, propEq, split, tap } from "ramda";
import { readFileStrings } from "../../utils/input";

type Grid = string[][];
type Point = [number, number];

type BorderLabel = 'top' | 'bottom' | 'left' | 'right';

interface Line {
    points: [Point, Point];
    label: BorderLabel;
}

type SerializedDelta = `${number},${number}`
type PointPair = [Point, Point]

interface BorderInfo {
    label: BorderLabel
    getPoints: (y: number, x: number) => PointPair
}

interface GroupedLines {
    top: PointPair[]
    bottom: PointPair[]
    left: PointPair[]
    right: PointPair[]
}

const deltas = [[0, 1], [0, -1], [1, 0], [-1, 0]] as Point[];

const borderMap: Record<SerializedDelta, BorderInfo> = {
    "0,1": {
        label: "right",
        getPoints: (y, x) => [[y, x + 1], [y + 1, x + 1]]
    },
    "0,-1": {
        label: "left",
        getPoints: (y, x) => [[y, x], [y + 1, x]]
    },
    "1,0": {
        label: "bottom",
        getPoints: (y, x) => [[y + 1, x], [y + 1, x + 1]]
    },
    "-1,0": {
        label: "top",
        getPoints: (y, x) => [[y, x], [y, x + 1]]
    }
}

function getBorderLine(
    [y, x]: Point,
    [dy, dx]: Point,
): Line {
    const info = borderMap[`${dy},${dx}`]
    return {
        label: info.label,
        points: info.getPoints(y, x)
    }
}

const createIsOutOfRange = (grid: Grid) => ([y, x]: Point): boolean => {
    const height = grid.length;
    const width = grid[0].length;
    return (x < 0 || x >= width) || (y < 0 || y >= height);
};

const createIsInRange = (grid: Grid) => (point: Point): boolean => {
    return !createIsOutOfRange(grid)(point);
};

const createGetNeighbors = (grid: Grid) => ([y, x]: Point) => {
    const isInRange = createIsInRange(grid);
    return deltas
        .map(([dy, dx]) => [y + dy, x + dx] as Point)
        .filter(isInRange)
        .filter(([newY, newX]) => grid[y][x] === grid[newY][newX])
};

const createGetIslandData = (grid: Grid) => (point: Point) => {
    const queue: Point[] = [point];

    let perimeter = 0;
    let count = 0;

    while (queue.length) {
        const stepSize = queue.length;

        for (let i = 0; i < stepSize; i++) {
            const [y, x] = queue.shift()!;
            if (visited[`[${y}, ${x}]`]) {
                continue;
            }
            visited[`[${y}, ${x}]`] = true;
            count++;
            const neighbors = getNeighbors([y, x]);
            const nonVisitedNeighbors = neighbors
                .filter(([nextY, nextX]) => !visited[`[${nextY}, ${nextX}]`]);
            perimeter += 4 - neighbors.length;
            queue.push(...nonVisitedNeighbors);
        }
    }

    return [perimeter, count]
};

const getPointsByLabel = (
    lines: Line[],
    label: BorderLabel
): PointPair[] => {
    return pipe(
        filter((line: Line) => line.label === label),
        map<Line, PointPair>(prop("points")),
    )(lines);
}

const createGetLines = (
    grid: Grid,
    deltas: Point[],
) => ([y, x]: Point): GroupedLines => {
    const lines = deltas
        .filter(([dy, dx]) => isOutOfRange([y + dy, x + dx]) || grid[y + dy][x + dx] !== grid[y][x])
        .map(([dy, dx]) => getBorderLine([y, x], [dy, dx]));

    return {
        top: getPointsByLabel(lines, "top"),
        bottom: getPointsByLabel(lines, "bottom"),
        left: getPointsByLabel(lines, "left"),
        right: getPointsByLabel(lines, "right")
    };
};


const createGetIslandData2 = (
    grid: Grid,
) => (point: Point) => {
    const getLines = createGetLines(grid, deltas);
    const queue: Point[] = [point];
    const lines: GroupedLines = {
        top: [],
        bottom: [],
        left: [],
        right: []
    };
    let count = 0;

    while (queue.length) {
        const stepSize = queue.length;

        for (let i = 0; i < stepSize; i++) {
            const [y, x] = queue.shift()!;
            if (visited[`[${y}, ${x}]`]) {
                continue;
            }
            visited[`[${y}, ${x}]`] = true;
            count++;
            const neighbors = getNeighbors([y, x]);
            const nonVisitedNeighbors = neighbors
                .filter(([nextY, nextX]) => !visited[`[${nextY}, ${nextX}]`]);

            const cellLines = getLines([y, x]);

            lines.top.push(...cellLines.top);
            lines.bottom.push(...cellLines.bottom);
            lines.left.push(...cellLines.left);
            lines.right.push(...cellLines.right);

            queue.push(...nonVisitedNeighbors);
        }
    }

    const mergedLines = [
        ...mergeLines(lines.top),
        ...mergeLines(lines.bottom),
        ...mergeLines(lines.left),
        ...mergeLines(lines.right)
    ];

    const perimeter = mergedLines.length;
    return [perimeter, count];
}

const canMerge = ([[y1, x1], [y2, x2]]: [Point, Point], [[y3, x3], [y4, x4]]: [Point, Point]): boolean => {
    if (y1 === y2 && y3 === y4 && y1 === y3) {
        return x2 === x3 || x1 === x4;
    }
    if (x1 === x2 && x3 === x4 && x1 === x3) {
        return y2 === y3 || y1 === y4;
    }
    return false;
};

const mergeLine = ([[y1, x1], [y2, x2]]: [Point, Point], [[y3, x3], [y4, x4]]: [Point, Point]): [Point, Point] => {
    if (y1 === y2 && y3 === y4) {
        return [[y1, Math.min(x1, x3)], [y1, Math.max(x2, x4)]];
    }
    return [[Math.min(y1, y3), x1], [Math.max(y2, y4), x1]];
};

const mergeLines = (lines: [Point, Point][]): [Point, Point][] => {
    if (lines.length <= 1) return lines;

    const result: [Point, Point][] = [];
    const remaining = [...lines];

    while (remaining.length > 0) {
        let current = remaining.shift();
        if (!current) break;
        let hadMerge: boolean;

        do {
            hadMerge = false;
            for (let i = 0; i < remaining.length; i++) {
                if (canMerge(current, remaining[i])) {
                    current = mergeLine(current, remaining[i]);
                    remaining.splice(i, 1);
                    hadMerge = true;
                    break;
                }
            }
        } while (hadMerge);

        result.push(current);
    }

    return result;
};

// const grid = map(split(""))(readFileStrings(__dirname, "./example.txt"));
const grid = map(split(""))(readFileStrings(__dirname, "./input.txt"));

let visited: Record<string, boolean> = {};
const isOutOfRange = createIsOutOfRange(grid);
const getNeighbors = createGetNeighbors(grid);
const getIslandDataPart1 = createGetIslandData(grid);

// Part 1
let totalPrice = 0;
for (let y = 0; y < grid.length; y++){
    for (let x = 0; x < grid[0].length; x++){
        if (visited[`[${y}, ${x}]`]) {
            continue;
        }
        const [perimeter, count] = getIslandDataPart1([y, x]);
        totalPrice += perimeter * count;
    }
}

console.log(totalPrice);

// Part 2
visited = {};
const getIslandDataPart2 = createGetIslandData2(grid);
totalPrice = 0;
for (let y = 0; y < grid.length; y++){
    for (let x = 0; x < grid[0].length; x++){
        const [perimeter, count] = getIslandDataPart2([y, x]);
        totalPrice += perimeter * count;
    }
}
console.log(totalPrice);