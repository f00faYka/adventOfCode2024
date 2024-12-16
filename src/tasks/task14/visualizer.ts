import { readFileStrings } from "../../utils/input";
import * as fs from "fs";
import * as path from "path";

type Point = [number, number];

interface Robot {
    point: Point;
    velocity: Point;
}

function parsePoint(line: string): Point {
    return line.split(",").map(Number) as Point;
}

function getNextPositions(robots: Robot[], width: number, height: number): Robot[] {
    return robots.map((robot) => ({
        point: [
            ((robot.point[0] + robot.velocity[0]) % width + width) % width,
            ((robot.point[1] + robot.velocity[1]) % height + height) % height,
        ],
        velocity: robot.velocity,
    }));
}

function hasConsecutiveBots(robots: Robot[], consecutiveCount: number): boolean {
    const rows: Map<number, number[]> = new Map();

    // Группируем роботов по строкам (координате Y)
    robots.forEach(({ point: [x, y] }) => {
        if (!rows.has(y)) {
            rows.set(y, []);
        }
        rows.get(y)?.push(x);
    });

    // Проверяем каждую строку
    for (const [y, xs] of rows) {
        // Сортируем координаты X
        xs.sort((a, b) => a - b);

        // Проверяем наличие подряд идущих роботов
        let streak = 1;
        for (let i = 1; i < xs.length; i++) {
            if (xs[i] === xs[i - 1] + 1) {
                streak++;
                if (streak >= consecutiveCount) {
                    return true; // Найдена строка с нужным количеством подряд роботов
                }
            } else {
                streak = 1; // Сброс серии
            }
        }
    }

    return false; // Ни одной строки с нужной серией не найдено
}

function drawGrid(robots: Robot[], width: number, height: number): string {
    const grid: string[][] = Array.from(
        { length: height },
        () => Array(width).fill(".")
    );

    robots.forEach(({ point: [x, y] }) => {
        grid[y][x] = "#";
    });

    return grid.map((row) => row.join("")).join("\n");
}

function visualizeTreeStepsWithGrid(
    robots: Robot[],
    width: number,
    height: number,
    maxSteps: number,
    outputPath: string
) {
    fs.writeFileSync(outputPath, "");

    let currentRobots = robots;

    for (let step = 0; step <= maxSteps; step++) {
        if (hasConsecutiveBots(currentRobots, 8)) {
            const gridRepresentation = drawGrid(currentRobots, width, height);
            let stepOutput = `StepNumber: ${step}\n`;
            stepOutput += gridRepresentation + "\n";
            stepOutput += "=".repeat(50) + "\n";

            fs.appendFileSync(outputPath, stepOutput);
            console.log(`Row with 8 consecutive bots found at step ${step}`);
        }

        currentRobots = getNextPositions(currentRobots, width, height);
    }
}

function main() {
    // const input = readFileStrings(__dirname, "./example.txt");
    const input = readFileStrings(__dirname, "./input.txt");
    const [width, height] = input[0].split(" ").map(Number);
    input.shift();

    const robots: Robot[] = input.map((line: string) => {
        const [p, v] = line.split(" ")
            .map((s) => parsePoint(s.split("=")[1]));
        return { point: p, velocity: v };
    });

    const outputPath = path.join(__dirname, "visualization_output.txt");
    console.log("Starting visualization...");
    visualizeTreeStepsWithGrid(robots, width, height, 100_000, outputPath);
    console.log("Visualization complete!");
}

main();