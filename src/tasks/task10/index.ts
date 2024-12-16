import { chain, forEach, map, reduce, split, sum } from "ramda";
import { readFileStrings } from "../../utils/input.ts";

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
        forEach<Point>(neighbor => findReachableNines(neighbor, visited))(neighbors);

        return visited;
    }

    const reachableNines = findReachableNines([y, x]);

    return Array
        .from(reachableNines)
        .filter(key => grid[+key.split(",")[0]][+key.split(",")[1]] === "9")
        .length;
}

const getIndices = <T>(array: T[]) => [...Array(array.length).keys()];

const getStartPoints = (grid: Grid) => {
    const rowIndices = getIndices(grid);
    const colIndices = getIndices(grid[0]);

    const isEqualToZero = ([y, x]: Point) => grid[y][x] === "0";

    return chain(y => map(x => [y, x] as Point, colIndices), rowIndices)
        .filter(isEqualToZero)
}

const main = async () => {
    // const lines = readFileStrings(__dirname, "./input.txt");
    const lines = await readFileStrings("./input.txt");
    const grid: Grid = map(split(""))(lines);

    const directions: Point[] = [
        [0, 1],  // right
        [0, -1], // left
        [-1, 0], // top
        [1, 0]   // bottom
    ];

    const startPoints = getStartPoints(grid);

    // part 1
    const getTrailHeadScore = createGetTrailHeadScore(grid, directions);
    const trailHeadsScore = sum(map(getTrailHeadScore)(startPoints));

    console.log("TrailHeadsScore: ", trailHeadsScore);

    // part 2
    const getUniqueTrailCount = createGetUniqueTrailsCount(grid, directions);
    const uniqueTrailsCount = sum(map(getUniqueTrailCount)(startPoints));

    console.log("Unique trails: ", uniqueTrailsCount);
}

main();