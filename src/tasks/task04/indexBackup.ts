import { map, nth, reverse, split } from 'ramda';
import { parseInput } from '../../utils/input';

type Grid = string[][];

const getAllDirections = (lines: string[]) => {
    const directions: string[] = [...lines];
    const grid = map(split(""))(lines)

    const verticalLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[i].length; j++) {
            verticalLines[j] = (verticalLines[j] || "") + grid[i][j];
        }
    }
    const reversedVertical = verticalLines.map((line) => line.split("").reverse().join(""));
    directions.push(...verticalLines, ...reversedVertical);
    const { topLeftToBottomRight, topRightToBottomLeft } = getDiagonals(grid);
    directions.push(...topLeftToBottomRight, reverse())



    return directions;
}

// Function to extract all diagonals
const getDiagonals = (grid: Grid) => {
    const rows = grid.length;
    const cols = grid[0].length;

    const diagonalsTopLeftToBottomRight = [];
    const diagonalsTopRightToBottomLeft = [];

    // Top-left to bottom-right diagonals
    for (let startRow = 0; startRow < rows; startRow++) {
        let diagonal = [];
        for (let r = startRow, c = 0; r < rows && c < cols; r++, c++) {
            diagonal.push(grid[r][c]);
        }
        diagonalsTopLeftToBottomRight.push(diagonal);
    }
    for (let startCol = 1; startCol < cols; startCol++) {
        let diagonal = [];
        for (let r = 0, c = startCol; r < rows && c < cols; r++, c++) {
            diagonal.push(grid[r][c]);
        }
        diagonalsTopLeftToBottomRight.push(diagonal);
    }

    // Top-right to bottom-left diagonals
    for (let startRow = 0; startRow < rows; startRow++) {
        let diagonal = [];
        for (let r = startRow, c = cols - 1; r < rows && c >= 0; r++, c--) {
            diagonal.push(grid[r][c]);
        }
        diagonalsTopRightToBottomLeft.push(diagonal);
    }
    for (let startCol = cols - 2; startCol >= 0; startCol--) {
        let diagonal = [];
        for (let r = 0, c = startCol; r < rows && c >= 0; r++, c--) {
            diagonal.push(grid[r][c]);
        }
        diagonalsTopRightToBottomLeft.push(diagonal);
    }

    return {
        topLeftToBottomRight: diagonalsTopLeftToBottomRight,
        topRightToBottomLeft: diagonalsTopRightToBottomLeft,
    };
};


// const lines = parseInput("./src/tasks/task04", "./input.txt");
const lines = parseInput("./src/tasks/task04", "./example.txt");

const allStrings = getAllDirections(lines);

console.log(allStrings);