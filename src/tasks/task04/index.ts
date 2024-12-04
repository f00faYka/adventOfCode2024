import { map, nth, reverse, split } from 'ramda';
import { parseInput } from '../../utils/input';

type Grid = string[][];

const getWays = (word: string) => (grid: Grid, y: number, x: number) => {
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    const size = word.length;

    const nextStep = (currWord: string, y: number, x: number) => {
        const nextLetters = directions
            .map(([dy, dx]) => [y + dy, x + dx])
            .filter(([newY, newX]) => newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[0].length)
            .filter(([newY, newX]) => word.startsWith(currWord + grid[newY][newX]));

        return nextLetters.length + nextStep(currWord + )
    }

    return nextStep("", y, x)
}

// const lines = parseInput("./src/tasks/task04", "./input.txt");
const lines = parseInput("./src/tasks/task04", "./example.txt");
const grid = map(split(""))(lines);

for (let i = 0; i < grid.length; i++) {
    const line = grid[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] !== "X") {
            continue;
        }

        const directions = getWays(4)(grid, i, j);
    }
}

console.log(allStrings);