import { map, split } from "ramda";
import { readFileStrings } from "../../utils/input";

type Grid = string[][];
type Point = [number, number];

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

const createIsInRange = (grid: Grid) => ([y, x]: Point) => {
    const height = grid.length;
    const width = grid[0].length;
    return (x >= 0 && x < width) && (y >= 0 && y < height);
}

const createGetNeighbors = (grid: Grid) => ([y, x]: Point) => {
    return directions
        .map(([dy, dx]) => [y + dy, x + dx] as Point)
        .filter(isInRange)
        .filter(([newY, newX]) => grid[y][x] === grid[newY][newX])
}

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
}

const createGetIslandData2 = (grid: Grid) => (point: Point) => {
    interface Line {
        points: [Point, Point];
        label: 'top' | 'bottom' | 'left' | 'right';
    }

    const queue: Point[] = [point];
    let lines: Line[] = [];
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

            const newLines = directions.map(([dy, dx]) => {
                // Right border (dx = 1)
                if (dx === 1) {
                    if (!isInRange([y, x + 1]) || grid[y][x + 1] !== grid[y][x]) {
                        return {
                            points: [[y, x + 1], [y + 1, x + 1]] as [Point, Point],
                            label: 'right'
                        };
                    }
                }
                // Left border (dx = -1)
                if (dx === -1) {
                    if (!isInRange([y, x - 1]) || grid[y][x - 1] !== grid[y][x]) {
                        return {
                            points: [[y, x], [y + 1, x]] as [Point, Point],
                            label: 'left'
                        };
                    }
                }
                // Bottom border (dy = 1)
                if (dy === 1) {
                    if (!isInRange([y + 1, x]) || grid[y + 1][x] !== grid[y][x]) {
                        return {
                            points: [[y + 1, x], [y + 1, x + 1]] as [Point, Point],
                            label: 'bottom'
                        };
                    }
                }
                // Top border (dy = -1)
                if (dy === -1) {
                    if (!isInRange([y - 1, x]) || grid[y - 1][x] !== grid[y][x]) {
                        return {
                            points: [[y, x], [y, x + 1]] as [Point, Point],
                            label: 'top'
                        };
                    }
                }
                return null;
            }).filter((line): line is Line => line !== null);

            lines.push(...newLines);
            queue.push(...nonVisitedNeighbors);
        }
    }

    // Split lines by label
    const linesByLabel = {
        top: lines.filter(l => l.label === 'top').map(l => l.points),
        bottom: lines.filter(l => l.label === 'bottom').map(l => l.points),
        left: lines.filter(l => l.label === 'left').map(l => l.points),
        right: lines.filter(l => l.label === 'right').map(l => l.points)
    };

    // Merge lines by label
    const mergedLines = Object.values(linesByLabel).flatMap(labeledLines => {
        const horizontal = labeledLines.filter(([[y1], [y2]]) => y1 === y2)
            .sort(([[y1, x1]], [[y2, x2]]) => y1 - y2 || x1 - x2);
        const vertical = labeledLines.filter(([[_y1, x1], [_y2, x2]]) => x1 === x2)
            .sort(([[y1, x1]], [[y2, x2]]) => x1 - x2 || y1 - y2);

        return [...mergeLines(horizontal), ...mergeLines(vertical)];
    });

    const perimeter = mergedLines.length;
    return [perimeter, count];
}

// Helper functions
const canMerge = ([[y1, x1], [y2, x2]]: [Point, Point], [[y3, x3], [y4, x4]]: [Point, Point]): boolean => {
    // For horizontal lines (same y, and x2 of first line equals x1 of second line)
    if (y1 === y2 && y3 === y4 && y1 === y3) {
        return x2 === x3 || x1 === x4;
    }
    // For vertical lines (same x, and y2 of first line equals y1 of second line)
    if (x1 === x2 && x3 === x4 && x1 === x3) {
        return y2 === y3 || y1 === y4;
    }
    return false;
};

const mergeLine = ([[y1, x1], [y2, x2]]: [Point, Point], [[y3, x3], [y4, x4]]: [Point, Point]): [Point, Point] => {
    // For horizontal lines
    if (y1 === y2 && y3 === y4) {
        return [[y1, Math.min(x1, x3)], [y1, Math.max(x2, x4)]];
    }
    // For vertical lines
    return [[Math.min(y1, y3), x1], [Math.max(y2, y4), x1]];
};

const mergeLines = (lines: [Point, Point][]): [Point, Point][] => {
    if (lines.length <= 1) return lines;

    let hadMerge: boolean;
    do {
        hadMerge = false;
        const result: [Point, Point][] = [];
        let current = lines[0];

        for (let i = 1; i < lines.length; i++) {
            const next = lines[i];
            if (canMerge(current, next)) {
                current = mergeLine(current, next);
                hadMerge = true;
            } else {
                result.push(current);
                current = next;
            }
        }
        result.push(current);
        lines = result;
    } while (hadMerge);

    return lines;
};

// const grid = map(split(""))(readFileStrings(__dirname, "./example.txt"));
const grid = map(split(""))(readFileStrings(__dirname, "./input.txt"));

const visited: Record<string, boolean> = {};
const isInRange = createIsInRange(grid);
const getNeighbors = createGetNeighbors(grid);
// const getIslandData = createGetIslandData(grid);
const getIslandData = createGetIslandData2(grid);

let totalPrice = 0;

for (let y = 0; y < grid.length; y++){
    for (let x = 0; x < grid[0].length; x++){
        if (visited[`[${y}, ${x}]`]) {
            continue;
        }
        const [perimeter, count] = getIslandData([y, x]);
        totalPrice += perimeter * count;
    }
}

console.log(totalPrice);