import { any, forEach, map, pipe, reduce, split, sum } from "ramda";
import { readFileStrings } from "../../utils/input";

type Grid = string[][];

type Point = [number, number];

const createIsInRange = (grid: Grid) => ([y, x]: Point): boolean => {
    return (x >= 0 && x < grid[0].length)
        && (y >= 0 && y < grid.length)
}

const createGetNeighbors = (grid: Grid, directions: Point[]) => ([y, x]: Point) => {
    const isInRange = createIsInRange(grid);
    return directions
        .map<Point>(([dy, dx]) => [y + dy, x + dx])
        .filter(isInRange)
        .filter(([nextY, nextX]) => Number(grid[nextY][nextX]) - Number(grid[y][x]) === 1)
}

const createGetUniqueTrailsCount = (grid: Grid, directions: Point[]) => ([y, x]: Point): number => {
    const getNeighbors = createGetNeighbors(grid, directions);

    const findPaths = ([y, x]: Point): number => {
        if (grid[y][x] === "9") {
            return 1;
        }

        const neighbors = getNeighbors([y, x]);

        if (neighbors.length === 0) {
            return 0;
        }

        return reduce<Point, number>((acc, cur) => {
            return acc + findPaths(cur)
        }, 0)(neighbors)
    }

    return findPaths([y,x])
}

const createGetTrailHeadScore = (grid: Grid, directions: Point[]) => ([y, x]: Point): number => {
    const getNeighbors = createGetNeighbors(grid, directions);

    const findReachableNines = (
        [y, x]: Point,
        visited: Set<string> = new Set()
    ): Set<string> => {
        const key = `${y},${x}`;
        if (visited.has(key)) return visited;

        visited.add(key);

        if (grid[y][x] === "9") {
            return visited;
        }

        const neighbors = getNeighbors([y, x]);
        neighbors.forEach(neighbor => findReachableNines(neighbor, visited));

        return visited;
    }

    const reachableNines = findReachableNines([y, x]);

    return Array
        .from(reachableNines)
        .filter(key => grid[+key.split(",")[0]][+key.split(",")[1]] === "9")
        .length;
}

const main = () => {
    // const lines = readFileStrings(__dirname, "./input.txt");
    const lines = readFileStrings(__dirname, "./example.txt");
    const grid: Grid = map(split(""))(lines);

    const directions: Point[] = [
        [0, 1],  // right
        [0, -1], // left
        [-1, 0], // top
        [1, 0]   // bottom
    ];

    // part 1

    const getTrailHeadScore = createGetTrailHeadScore(grid, directions);

    let trailHeadsScore = 0;
    for (let y = 0; y < grid.length; y++) {
        const line = grid[y];
        for (let x = 0; x < line.length; x++) {
            if (line[x] === "0") {
                trailHeadsScore += getTrailHeadScore([y, x]);
            }
        }
    }
    console.log("TrailHeads: ", trailHeadsScore);

    // part 2
    const getUniqueTrailCount = createGetUniqueTrailsCount(grid, directions);
    // rework this approach to map(map())
    let uniqueTrailsCount = 0;
    for (let y = 0; y < grid.length; y++) {
        const line = grid[y];
        for (let x = 0; x < line.length; x++) {
            if (line[x] === "0") {
                uniqueTrailsCount += getUniqueTrailCount([y, x]);
            }
        }
    }

    console.log("Unique trails: ", uniqueTrailsCount);
}

main();