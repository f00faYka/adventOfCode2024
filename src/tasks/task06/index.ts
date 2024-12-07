import { map, reduce, split } from "ramda";
import { readFileStrings } from "../../utils/input";

type Point = [y: number, x: number];

type Delta = [dy: number, dx: number];

type Grid = string[][];

type Direction = typeof directionSymbols[number];

interface Guard {
    point: Point;
    direction: Direction;
}

const directionSymbols = ['^', '>', 'v', '<'];

const deltas: Record<Direction, Delta> = {
    "^": [-1, 0],
    ">": [0, 1],
    "v": [1, 0],
    "<": [0, -1],
};

const getGuardPos = reduce<string[], Point | null>(
    (acc: Point | null, row: string[]) => {
        const x = row
            .findIndex(cell => directionSymbols.includes(cell));
        return x >= 0 ? [grid.indexOf(row), x] : acc;
    },
    null
);

const getNext = (direction: Direction): Direction => {
    const currentIndex = directionSymbols.indexOf(direction);
    return directionSymbols[currentIndex + 1] || directionSymbols[0];
}

const getDirection = (grid: Grid) => ([y, x]: Point): Direction => grid[y][x];

const isInRange = (width: number, height: number) => ([y, x]: Point) => x >= 0 && x < width && y >= 0 && y < height;

const getVisitedCount = reduce<boolean[], number>(
    (acc, row) => acc + reduce((acc, cell) => acc + (cell ? 1 : 0), 0, row),
    0
);

const createObstacleChecker = (grid: string[][]) => ([y, x]: Point) => grid[y]?.[x] === '#';

const findWay = (grid: Grid) => {
    const visitedGrid = map(map(() => false))(grid);
    const way: [...Point, Direction][] = [];

    const isObstacle = createObstacleChecker(grid);

    const guardPos = getGuardPos(grid);

    if (!guardPos) {
        throw new Error('Guard position not found');
    }

    const guard: Guard = {
        point: guardPos,
        direction: getDirection(grid)(guardPos),
    };
    grid[guardPos[0]][guardPos[1]] = '.';

    const isGuardInGrid = isInRange(grid[0].length, grid.length);


    // exit condition:
    // point is away from grid
    // point is already visited with the same direction

    while (isGuardInGrid(guard.point)) {
        const [y, x] = guard.point;
        visitedGrid[y][x] = true;
        way.push([y, x, guard.direction]);

        const [dy, dx] = deltas[guard.direction];

        const nextPoint: Point = [y + dy, x + dx];

        if (!isGuardInGrid(nextPoint)) {
            break;
        }

        if (isObstacle(nextPoint)) {
            guard.direction = getNext(guard.direction);
            continue;
        }

        guard.point = nextPoint;
    }


}

// Implementation

const input = readFileStrings(__dirname, 'example.txt');
// const input = readFileStrings(__dirname, 'input.txt');

// part 1

const grid = map(split(""))(input);


// part 2