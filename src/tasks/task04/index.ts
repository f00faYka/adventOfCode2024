import { map, split } from "ramda";
import { parseInput } from "../../utils/input";

type Grid = string[][];

function getWordCount(word: string) {
    return (grid: Grid, y: number, x: number): number => {
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        let count = 0;

        function checkDirection([dy, dx]: number[]): void {
            let currWord = grid[y][x];
            let currY = y;
            let currX = x;

            for (let i = 1; i < word.length; i++) {
                currY += dy;
                currX += dx;

                if (
                    currY < 0 || currY >= grid.length ||
                    currX < 0 || currX >= grid[0].length
                ) {
                    return;
                }

                currWord += grid[currY][currX];
                if (!word.startsWith(currWord)) {
                    return;
                }
            }

            if (currWord === word) {
                count++;
            }
        }

        directions.forEach(checkDirection);
        return count;
    };
}

const lines = parseInput("./src/tasks/task04", "./input.txt");
// const lines = parseInput("./src/tasks/task04", "./example.txt");
const grid = map(split(""))(lines);


// part 1
let totalCount = 0;
for (let i = 0; i < grid.length; i++) {
    const line = grid[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] !== "X") {
            continue;
        }

        const count = getWordCount("XMAS")(grid, i, j);
        totalCount += count;
    }
}

console.log(totalCount);

// part 2
function isXmasSign(grid: Grid, y: number, x: number): boolean {
    // Check if we can form a complete X pattern
    if (y === 0 || y === grid.length - 1 || x === 0 || x === grid[0].length - 1) {
        return false; // Can't form X if A is on the edge
    }

    let topLeft = grid[y-1][x-1];
    let topRight = grid[y-1][x+1];
    let bottomLeft = grid[y+1][x-1];
    let bottomRight = grid[y+1][x+1];

    // Check diagonal \ then diagonal /
    return (
        ((topLeft === "M" && bottomRight === "S") ||
        (topLeft === "S" && bottomRight === "M")) &&
        ((topRight === "M" && bottomLeft === "S") ||
        (topRight === "S" && bottomLeft === "M"))
    );
}

let xmasSignCount = 0;

for (let i = 0; i < grid.length; i++) {
    const line = grid[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] !== "A") {
            continue;
        }

        if (isXmasSign(grid, i, j)) {
            xmasSignCount++;
        }
    }
}

console.log(xmasSignCount);
