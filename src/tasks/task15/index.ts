import { readFileStrings } from "../../utils/input.ts";

type Grid = string[][];
type Direction = ">" | "<" | "^" | "v";
type Robot = "@";
type Box = "O";
type Wall = "#";
type Empty = ".";
type Point = [number, number];

type Deltas = {
    [key in Direction]: [number, number];
};

const deltas: Deltas = {
    ">": [0, 1],
    "<": [0, -1],
    "^": [-1, 0],
    "v": [1, 0],
};

function getLineToWall(grid: Grid, robot: Point, direction: Direction): string[] {
    const [startY, startX] = robot;
    const [deltaY, deltaX] = deltas[direction];
    const line: string[] = [];

    let y = startY;
    let x = startX;

    while (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        const currentCell = grid[y][x];
        line.push(currentCell);

        if (currentCell === "#") {
            break;
        }

        y += deltaY;
        x += deltaX;
    }

    return line;
}

const moveRobot = (grid: Grid, robot: Point, move: Direction): Point => {
    const [y, x] = robot;

    const line = getLineToWall(grid, robot, move);
    const freeSpaceIndex = line.findIndex(cell => cell === ".");

    if (freeSpaceIndex === -1) {
        return robot;
    }

    const [dy, dx] = deltas[move];

    // Move everything one step in the direction starting from the wall
    for (let i = freeSpaceIndex; i > 0; i--) {
        const currentY = y + i * dy;
        const currentX = x + i * dx;
        const prevY = currentY - dy;
        const prevX = currentX - dx;

        grid[currentY][currentX] = grid[prevY][prevX];
    }

    // Clear robot's initial position
    grid[y][x] = ".";
    return [y + dy, x + dx];

    // The robot's new position is already handled by the loop
};

const findRobot = (grid: Grid): Point | null => {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === "@") {
                return [y, x];
            }
        }
    }
    return null;
};

const calculateBoxGPS = (y: number, x: number): number => {
    return 100 * y + x;
};

const sumBoxGPS = (grid: Grid): number => {
    let sum = 0;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === "O") {
                sum += calculateBoxGPS(y, x);
            }
        }
    }
    return sum;
};

const main = async () => {
    const input = await readFileStrings("./input.txt");
    // const input = readFileStrings(__dirname, "./example.txt");

    const blankLineIndex = input.findIndex(line => line.trim() === "");

    const grid: Grid = input
        .slice(0, blankLineIndex)
        .map((line: string) => line.split(""));

    const moves = input
        .slice(blankLineIndex + 1)
        .join("");

    console.log(grid);
    console.log(moves);

    let robot = findRobot(grid);

    if (!robot) {
        throw new Error("Robot not found");
    }

    moves.split("").forEach((move) => {
        robot = moveRobot(grid, robot!, move as Direction);
    });

    const totalGPS = sumBoxGPS(grid);
    console.log("Total GPS sum of all boxes:", totalGPS);
}

main();
