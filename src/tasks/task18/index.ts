import { readFileStrings } from "../../utils/input.ts";

type Point = [number, number];
type Grid = string[][];

const deltas: Point[] = [
  [0, 1], // >
  [0, -1], // <
  [-1, 0], // ^
  [1, 0], // v
];

const createIsOutOfGridChecker = (grid: Grid) => ([y, x]: Point) =>
  y < 0 || y >= grid.length || x < 0 || x >= grid[0].length;

const createIsObstacleChecker = (grid: Grid) => ([y, x]: Point) =>
  grid[y][x] === "#";

const getNextPoints = ([y, x]: Point) => {
  const nextPoints: Point[] = [];
  for (const [dy, dx] of deltas) {
    nextPoints.push([y + dy, x + dx]);
  }
  return nextPoints;
};

const findWay = (
  isOutOfGrid: (point: Point) => boolean,
  isObstacle: (point: Point) => boolean,
  start: Point,
  end: Point,
) => {
  const visited = new Set();
  const queue = [start];
  let stepCount = 0;

  const isInGrid = ([y, x]: Point) => !isOutOfGrid([y, x]);
  const isValid = ([y, x]: Point) =>
    !isObstacle([y, x]) && !visited.has(`${y}:${x}`);

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const [y, x] = queue.shift()!;
      if (visited.has(`${y}:${x}`)) continue;
      if (y === end[0] && x === end[1]) return stepCount;
      visited.add(`${y}:${x}`);

      const nextPoints = getNextPoints([y, x]);
      const validPoints = nextPoints
        .filter(isInGrid)
        .filter(isValid);

      queue.push(...validPoints);
    }
    stepCount++;
  }

  return -1;
};

const main = async () => {
  const input = await readFileStrings("input.txt");
  //   const input = await readFileStrings("example.txt");

  const [width, height] = input[0].split(":").map(Number);
  const bytes: Point[] = input.slice(1).map((line) =>
    line.split(",").map(Number) as Point
  );

  const grid = Array.from({ length: height }, () => Array(width).fill("."));

  for (const [x, y] of bytes.slice(0, 1024)) {
    grid[y][x] = "#";
  }

  const isOutOfGrid = createIsOutOfGridChecker(grid);
  const isObstacle = createIsObstacleChecker(grid);
  const start: Point = [0, 0];
  const end: Point = [height - 1, width - 1];

  const result = findWay(isOutOfGrid, isObstacle, start, end);
  console.log(result);
};

main();
