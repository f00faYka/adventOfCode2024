import { map, reduce, split } from "ramda";
import { readFileStrings } from "../../utils/input";

interface Point {
    x: number;
    y: number;
}

const guardSigns = ['^', '>', 'v', '<'];

const directions: Record<typeof guardSigns[number], Point> = {
    '^': { x: 0, y: -1 },
    '>': { x: 1, y: 0 },
    'v': { x: 0, y: 1 },
    '<': { x: -1, y: 0 },
};

const getNextDirection = (current: typeof guardSigns[number]) =>
    guardSigns[(guardSigns.indexOf(current) + 1) % guardSigns.length];

const isInGrid = (width: number, height: number) =>
    (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;

const parseInput = (input: string[]): { grid: string[][], guardPos: Point, guardDir: typeof guardSigns[number] } => {
    const grid = map(split(""))(input);
    let guardPos: Point | null = null;
    let guardDir: typeof guardSigns[number] | null = null;

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (guardSigns.includes(grid[y][x])) {
                guardPos = { x, y };
                guardDir = grid[y][x] as typeof guardSigns[number];
                break;
            }
        }
        if (guardPos) break;
    }

    if (!guardPos || !guardDir) throw new Error("Guard not found in input");

    return { grid, guardPos, guardDir };
};

const simulateWithObstacle = (
    grid: string[][],
    guardPos: Point,
    guardDir: typeof guardSigns[number],
    obstacle: Point
): boolean => {
    const tempGrid = map(row => [...row], grid);
    tempGrid[obstacle.y][obstacle.x] = "#";

    const visitedStates = new Set<string>();
    const isGuardInGrid = isInGrid(grid[0].length, grid.length);
    const currentPos = { ...guardPos };
    let currentDir = guardDir;

    while (isGuardInGrid(currentPos.x, currentPos.y)) {
        const stateKey = `${currentPos.x},${currentPos.y},${currentDir}`;
        if (visitedStates.has(stateKey)) return true; // Застрял в цикле
        visitedStates.add(stateKey);

        const { x: dx, y: dy } = directions[currentDir];
        const nextPos = { x: currentPos.x + dx, y: currentPos.y + dy };

        if (tempGrid[nextPos.y]?.[nextPos.x] === "#") {
            currentDir = getNextDirection(currentDir);
            continue;
        }

        if (!isGuardInGrid(nextPos.x, nextPos.y)) {
            return false; // Охранник покинул карту
        }

        currentPos.x = nextPos.x;
        currentPos.y = nextPos.y;
    }

    return false;
};

const findValidObstaclePositions = (grid: string[][], guardPos: Point, guardDir: typeof guardSigns[number]) => {
    const potentialPositions = new Set<string>();

    // Симуляция траектории охранника
    const visitedStates = new Set<string>();
    const isGuardInGrid = isInGrid(grid[0].length, grid.length);
    const currentPos = { ...guardPos };
    let currentDir = guardDir;

    while (isGuardInGrid(currentPos.x, currentPos.y)) {
        const stateKey = `${currentPos.x},${currentPos.y},${currentDir}`;
        if (visitedStates.has(stateKey)) break; // Цикл завершён
        visitedStates.add(stateKey);

        const { x: dx, y: dy } = directions[currentDir];
        const nextPos = { x: currentPos.x + dx, y: currentPos.y + dy };

        if (!isGuardInGrid(nextPos.x, nextPos.y)) break;

        if (grid[nextPos.y]?.[nextPos.x] === "#") {
            currentDir = getNextDirection(currentDir);
            continue;
        }

        potentialPositions.add(`${nextPos.x},${nextPos.y}`);
        currentPos.x = nextPos.x;
        currentPos.y = nextPos.y;
    }

    // Проверяем, где препятствие вызовет зацикливание
    const validPositions: Point[] = [];
    for (const pos of potentialPositions) {
        const [x, y] = pos.split(",").map(Number);
        if (simulateWithObstacle(grid, guardPos, guardDir, { x, y })) {
            validPositions.push({ x, y });
        }
    }

    return validPositions;
};

// Implementation
const input = readFileStrings(__dirname, "input.txt");
const { grid, guardPos, guardDir } = parseInput(input);

const validPositions = findValidObstaclePositions(grid, guardPos, guardDir);

console.log(validPositions.length);
