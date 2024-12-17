import { readFileStrings } from "../../utils/input.ts";

type Grid = string[][];
type Point = [number, number];

type Direction = ">" | "v" | "<" | "^";
type State = {
  point: Point;
  direction: Direction;
  cost: number;
};

const DIRECTION_SYMBOLS: Direction[] = [">", "v", "<", "^"];

const DIRECTION_DELTAS: Record<Direction, Point> = {
  ">": [0, 1],
  "v": [1, 0],
  "<": [0, -1],
  "^": [-1, 0],
};

function getDirectionSymbol(dy: number, dx: number): Direction {
  return DIRECTION_SYMBOLS.find((dir) => {
    const [deltaY, deltaX] = DIRECTION_DELTAS[dir];
    return deltaY === dy && deltaX === dx;
  })!;
}

const createIsWall = (grid: Grid) => ([y, x]: Point): boolean => {
  return grid[y][x] === "#";
};

const createIsStartPoint = (grid: Grid) => ([y, x]: Point): boolean => {
  return grid[y][x] === "S";
};

const createIsEndPoint = (grid: Grid) => ([y, x]: Point): boolean => {
  return grid[y][x] === "E";
};

const findStartPoint = (grid: Grid) => {
  const isStartPoint = createIsStartPoint(grid);
  const points = grid.flatMap((row, y) => row.map((_, x) => [y, x] as Point));
  return points.find(isStartPoint) || null;
};

const createGetNeighbors = (grid: Grid) => ([y, x]: Point): Point[] => {
  const isWall = createIsWall(grid);
  return Object.values(DIRECTION_DELTAS)
    .map(([dy, dx]) => [y + dy, x + dx] as Point)
    .filter((point) => !isWall(point));
};

function calculateDirectionChangeCost(
  currentDirection: Direction,
  newDirection: Direction,
): number {
  return currentDirection === newDirection ? 0 : 1000;
}

function findCheapestPathIterative(grid: Grid): number {
  const isEndPoint = createIsEndPoint(grid);
  const startPoint = findStartPoint(grid);
  const getNeighbors = createGetNeighbors(grid);

  if (!startPoint) {
    throw new Error("Start point not found");
  }

  const costs: Record<string, Record<Direction, number>> = {};
  const queue: State[] = [];

  queue.push({ point: startPoint, direction: ">", cost: 0 });

  let minEndCost = Infinity;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const [y, x] = current.point;
    const stateKey = `${y},${x}`;

    if (
      costs[stateKey]?.[current.direction] !== undefined &&
      costs[stateKey][current.direction] <= current.cost
    ) {
      continue;
    }

    costs[stateKey] = costs[stateKey] || {};
    costs[stateKey][current.direction] = current.cost;

    if (isEndPoint(current.point)) {
      minEndCost = Math.min(minEndCost, current.cost);
      continue;
    }

    const neighbors = getNeighbors(current.point);
    for (const [ny, nx] of neighbors) {
      const dy = ny - y;
      const dx = nx - x;
      const newDirection = getDirectionSymbol(dy, dx);

      const directionChangeCost = calculateDirectionChangeCost(
        current.direction,
        newDirection,
      );

      const newCost = current.cost + 1 + directionChangeCost;
      const nextStateKey = `${ny},${nx}`;

      if (
        !costs[nextStateKey]?.[newDirection] ||
        costs[nextStateKey][newDirection] > newCost
      ) {
        queue.push({
          point: [ny, nx],
          direction: newDirection,
          cost: newCost,
        });
      }
    }
  }

  return minEndCost;
}

async function main() {
  const input = await readFileStrings("./input.txt");
  //   const input = await readFileStrings("./example.txt");
  const grid = input.map((line) => line.split(""));

  console.log("\nИтеративная версия:");
  const iterativePath = findCheapestPathIterative(grid);
  console.log("Результат:", iterativePath);
}

main();
