import { readFileSync } from 'fs';
import { join } from 'path';

export const parseInput = (filename: string): string[] => {
    return readFileSync(join(__dirname, filename), 'utf-8')
        .trim()
        .split('\n');
};

export const part1 = (input: string[]): number => {
    // Implement your solution for part 1
    return 0;
};

export const part2 = (input: string[]): number => {
    // Implement your solution for part 2
    return 0;
};

if (require.main === module) {
    const input = parseInput('input.txt');

    console.log('Part 1:', part1(input));
    console.log('Part 2:', part2(input));
}