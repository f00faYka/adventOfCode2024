import { readFileStrings } from "../../utils/input";

type Grid = string[][];
type Point = [number, number];
type Memo = Record<string, number>;

const DIRECTIONS: Point[] = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
];

const DIRECTION_SYMBOLS: Record<string, string> = {
    "0,1": ">",
    "1,0": "v",
    "0,-1": "<",
    "-1,0": "^"
};

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
    const points = grid.flatMap((row, y) =>
        row.map((_, x) => [y, x] as Point)
    );
    return points.find(isStartPoint) || null;
};

const getNeighbors = (grid: Grid) => ([y, x]: Point): Point[] => {
    return DIRECTIONS
        .map(([dy, dx]) => [y + dy, x + dx] as Point)
        .filter(([y, x]) => !createIsWall(grid)([y, x]));
};

function calculateDirectionChangeCost(currentDirection: Point, newDirection: Point): number {
    const isSameDirection = currentDirection[0] === newDirection[0] && currentDirection[1] === newDirection[1];
    return isSameDirection ? 0 : 1000;
}

function findCheapestPath(grid: Grid) {
    const isEndPoint = createIsEndPoint(grid);
    const startPoint = findStartPoint(grid);

    if (!startPoint) {
        throw new Error("Start point not found");
    }

    const memo: Memo = {};
    const visited: Set<string> = new Set();

    const calculateCost = ([y, x]: Point, [dy, dx]: Point): number => {
        const stateKey = `${y},${x},${dy},${dx}`;
        if (memo[stateKey] !== undefined) {
            return memo[stateKey];
        }

        // If this is the end point, cost is 0
        if (isEndPoint([y, x])) {
            return (memo[stateKey] = 0);
        }

        // Prevent revisiting the same state
        if (visited.has(stateKey)) {
            return Infinity;
        }
        visited.add(stateKey);

        // Get valid neighbors
        const neighbors = getNeighbors(grid)([y, x]);
        if (neighbors.length === 0) {
            visited.delete(stateKey); // Backtrack
            return (memo[stateKey] = Infinity);
        }

        // Compute costs for each neighbor
        const costs = neighbors.map(([ny, nx]) => {
            const newDirection: Point = [ny - y, nx - x];
            const directionChangeCost = calculateDirectionChangeCost([dy, dx], newDirection);
            return 1 + directionChangeCost + calculateCost([ny, nx], newDirection);
        });

        visited.delete(stateKey); // Backtrack

        // Memoize the minimum cost for this state
        return (memo[stateKey] = Math.min(...costs));
    };

    // Start the recursion with the initial direction (facing East)
    return calculateCost(startPoint, [0, 1]);
}

function main() {
    const input = readFileStrings(__dirname, "./input.txt");
    // const input = readFileStrings(__dirname, "./example.txt");

    const grid = input.map(line => line.split(""));

    const cheapestPath = findCheapestPath(grid);

    console.log(cheapestPath);
}

main();import { readFileStrings } from "../../utils/input.ts";

type Grid = string[][];
type Point = [number, number];
// type Memo = Record<string, number>;
type Direction = ">" | "v" | "<" | "^";
type State = {
  point: Point;
  direction: Direction;
  cost: number;
  path: Point[];
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

// function findCheapestPath(grid: Grid) {
//   const isEndPoint = createIsEndPoint(grid);
//   const startPoint = findStartPoint(grid);
//   const getNeighbors = createGetNeighbors(grid);

//   if (!startPoint) {
//     throw new Error("Start point not found");
//   }

//   const memo: Memo = {};
//   const visited = new Set(`${startPoint[0]},${startPoint[1]}`);

//   const calculateCost = ([y, x]: Point, directionSymbol: Direction): number => {
//     const stateKey = `${y},${x}`;
//     const stateKeyWithDirection = `${stateKey},${directionSymbol}`;

//     if (memo[stateKey]) {
//       return memo[stateKey];
//     }

//     // if (visited.has(stateKey)) {
//     //   //we were here but result is not yet calculated
//     //   return Infinity;
//     // }

//     visited.add(stateKey);

//     console.log(`Вычисляем стоимость для состояния: ${stateKeyWithDirection}`);

//     if (isEndPoint([y, x])) {
//       console.log(`Найден конец пути: ${y}, ${x}`);
//       return (memo[stateKey] = 0);
//     }

//     const neighbors = getNeighbors([y, x]);
//     const nonVisitedNeighbors = neighbors.filter(([ny, nx]) => {
//       const nextStateKey = `${ny},${nx}`;
//       const nextStateKeyWithDirection = `${nextStateKey},${directionSymbol}`;
//       return memo[nextStateKey] || !visited.has(nextStateKey);
//     });

//     if (nonVisitedNeighbors.length === 0) {
//       return (memo[stateKey] = Infinity);
//     }

//     const costs = nonVisitedNeighbors.map(([ny, nx]) => {
//       const newDirectionSymbol = getDirectionSymbol(ny - y, nx - x);
//       const directionChangeCost = calculateDirectionChangeCost(
//         directionSymbol,
//         newDirectionSymbol,
//       );
//       visited.add(`${ny},${nx},${newDirectionSymbol}`);
//       const cost = 1 + directionChangeCost +
//         calculateCost([ny, nx], newDirectionSymbol);
//       visited.delete(`${ny},${nx},${newDirectionSymbol}`);
//       return cost;
//     });

//     return (memo[stateKey] = Math.min(...costs));
//   };

//   const result = calculateCost(startPoint, ">");
//   return result;
// }

function findAllCheapestPaths(
  grid: Grid,
): { minCost: number; bestPaths: Set<string> } {
  const isEndPoint = createIsEndPoint(grid);
  const startPoint = findStartPoint(grid);
  const getNeighbors = createGetNeighbors(grid);

  if (!startPoint) {
    throw new Error("Start point not found");
  }

  const costs: Record<string, Record<Direction, number>> = {};
  const queue: State[] = [];
  const bestPaths = new Set<string>();

  queue.push({
    point: startPoint,
    direction: ">",
    cost: 0,
    path: [startPoint],
  });

  let minEndCost = Infinity;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const [y, x] = current.point;
    const stateKey = `${y},${x}`;

    if (
      costs[stateKey]?.[current.direction] !== undefined &&
      costs[stateKey][current.direction] < current.cost
    ) {
      continue;
    }

    costs[stateKey] = costs[stateKey] || {};
    costs[stateKey][current.direction] = current.cost;

    if (isEndPoint(current.point)) {
      if (current.cost < minEndCost) {
        // Нашли новый лучший путь, очищаем предыдущие
        minEndCost = current.cost;
        bestPaths.clear();
        bestPaths.add(current.path.map(([y, x]) => `${y},${x}`).join("|"));
      } else if (current.cost === minEndCost) {
        // Нашли ещё один оптимальный путь
        bestPaths.add(current.path.map(([y, x]) => `${y},${x}`).join("|"));
      }
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
        costs[nextStateKey][newDirection] >= newCost
      ) {
        queue.push({
          point: [ny, nx],
          direction: newDirection,
          cost: newCost,
          path: [...current.path, [ny, nx]],
        });
      }
    }
  }

  return { minCost: minEndCost, bestPaths };
}

function countUniqueCellsInBestPaths(bestPaths: Set<string>): number {
  const uniqueCells = new Set<string>();

  for (const path of bestPaths) {
    const cells = path.split("|");
    cells.forEach((cell) => uniqueCells.add(cell));
  }

  return uniqueCells.size;
}

async function main() {
  //   const input = await readFileStrings("./input.txt");
  const input = await readFileStrings("./example.txt");
  const grid = input.map((line) => line.split(""));

  console.log("\nПоиск всех оптимальных путей:");
  const { minCost, bestPaths } = findAllCheapestPaths(grid);
  console.log("Минимальная стоимость:", minCost);
  console.log("Количество оптимальных путей:", bestPaths.size);

  // Визуализация путей
  const visualGrid = grid.map((row) => [...row]);
  for (const path of bestPaths) {
    const cells = path.split("|");
    cells.forEach((cell) => {
      const [y, x] = cell.split(",").map(Number);
      if (visualGrid[y][x] !== "S" && visualGrid[y][x] !== "E") {
        visualGrid[y][x] = "O";
      }
    });
  }

  // Подсчёт количества клеток на оптимальных путях (O)
  const pathCellsCount = visualGrid.reduce(
    (count, row) => count + row.filter((cell) => cell === "O").length,
    0,
  );

  console.log("\nКоличество клеток на оптимальных путях:", pathCellsCount);
}

main();

// too low: 461
