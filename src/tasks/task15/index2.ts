import { readFileStrings } from "../../utils/input.ts";

type Grid = string[][];
type Direction = ">" | "<" | "^" | "v";
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
    const [dy] = deltas[move];

    if (dy === 0) {
        return moveRobotHorizontally(grid, robot, move);
    } else {
        return moveRobotVertically(grid, robot, move);
    }
};

const moveRobotHorizontally = (grid: Grid, robot: Point, move: Direction): Point => {
    const [y, x] = robot;
    const [_, dx] = deltas[move];

    const line = getLineToWall(grid, robot, move);
    const freeSpaceIndex = line.findIndex(cell => cell === ".");

    if (freeSpaceIndex === -1) {
        return robot;
    }

    // Move everything one step in the direction starting from the wall
    for (let i = freeSpaceIndex; i > 0; i--) {
        const currentX = x + i * dx;
        const prevX = currentX - dx;

        grid[y][currentX] = grid[y][prevX];
    }

    // Clear robot's initial position
    grid[y][x] = ".";
    return [y, x + dx];
};

const moveRobotVertically = (grid: Grid, robot: Point, move: Direction): Point => {
    const [y, x] = robot;
    const [dy] = deltas[move];

    const moveOneStep = (currentY: number, indices: number[]): boolean => {
        const nextY = currentY + dy;
        if (nextY < 0 || nextY >= grid.length) {
            return false; // Early return if out of range
        }

        const nextIndices: number[] = [];

        for (const index of indices) {
            const cell = grid[nextY][index];

            switch (cell) {
                case "#":
                    return false; // Stop if a wall is encountered
                case "[":
                    if (!nextIndices.includes(index)) {
                        nextIndices.push(index);
                    }
                    if (!nextIndices.includes(index + 1)) {
                        nextIndices.push(index + 1);
                    }
                    break;
                case "]":
                    if (!nextIndices.includes(index)) {
                        nextIndices.push(index);
                    }
                    if (!nextIndices.includes(index - 1)) {
                        nextIndices.push(index - 1);
                    }
                    break;
            }
        }

        if (nextIndices.length > 0) {
            const result = moveOneStep(nextY, nextIndices);
            if (!result) {
                return false;
            }
        }

        // Move all indices if they are free to move
        for (const index of indices) {
            grid[nextY][index] = grid[currentY][index];
            grid[currentY][index] = ".";
        }

        return true;
    };

    const initialIndices: number[] = [x]; // Define initial indices
    const canMove = moveOneStep(y, initialIndices);
    if (!canMove) {
        return robot; // Return initial robot position if no move is possible
    }

    return [y + dy, x];
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
            if (grid[y][x] === "[") {
                sum += calculateBoxGPS(y, x);
            }
        }
    }
    return sum;
};

const adjustGridForWiderWarehouse = (grid: Grid): Grid => {
    return grid.map(line => {
        return line.map(cell => {
            switch (cell) {
                case "#":
                    return "##";
                case "O":
                    return "[]";
                case ".":
                    return "..";
                case "@":
                    return "@.";
                default:
                    return cell;
            }
        }).join("");
    }).map(line => line.split(""));
};

const main = async () => {
    const input = await readFileStrings("./input.txt");
    // const input = readFileStrings(__dirname, "./example.txt");

    const blankLineIndex = input.findIndex(line => line.trim() === "");

    const grid: Grid = adjustGridForWiderWarehouse(
        input
            .slice(0, blankLineIndex)
            .map((line: string) => line.split(""))
    );

    const moves = input
        .slice(blankLineIndex + 1)
        .join("");

    let robot = findRobot(grid);

    if (!robot) {
        throw new Error("Robot not found");
    }

    moves.split("").forEach((move) => {
        robot = moveRobot(grid, robot!, move as Direction);
    });

    const totalGPS = sumBoxGPS(grid);

    console.log(totalGPS);
}

main();
