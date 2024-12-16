import { readFileStrings } from "../../utils/input.ts";

type Point = [number, number];

interface Robot {
    point: Point;
    velocity: Point;
}

const parsePoint = (line: string): Point => {
    return line.split(",").map(Number) as Point;
}

const getRobotsAfterSeconds = (
    robots: Robot[],
    width: number,
    height: number,
    seconds: number,
): Robot[] => {
    return robots.map((robot) => {
        // Calculate total distance
        const totalX = robot.point[0] + robot.velocity[0] * seconds;
        const totalY = robot.point[1] + robot.velocity[1] * seconds;

        // Wrap coordinates ensuring positive results
        const finalX = ((totalX % width) + width) % width;
        const finalY = ((totalY % height) + height) % height;


        return {
            point: [finalX, finalY],
            velocity: robot.velocity,
        };
    });
}

function getQuadrantCounts(robots: Robot[], width: number, height: number): number[] {
    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);
    const counts = [0, 0, 0, 0]; // [Q1, Q2, Q3, Q4]
    let onLines = 0;

    for (const robot of robots) {
        const [x, y] = robot.point;

        if (x === midX || y === midY) {
            onLines++;
            continue;
        }

        if (x > midX && y > midY) {
            counts[0]++;
        } else if (x < midX && y > midY) {
            counts[1]++;
        } else if (x < midX && y < midY) {
            counts[2]++;
        } else if (x > midX && y < midY) {
            counts[3]++;
        }
    }

    return counts;
}

// const input = await readFileStrings("./example.txt");
const input = await readFileStrings("./input.txt");

const [width, height] = input[0].split(" ").map(Number);
input.shift();

const robots: Robot[] = input.map((line) => {
    const [p, v] = line.split(" ")
        .map((s) => parsePoint(s.split("=")[1]));

    return {
        point: p,
        velocity: v,
    };
});

console.log(input);
console.log(robots);

const robotsAfterSeconds = getRobotsAfterSeconds(robots, width, height, 100);
const quadrantCounts = getQuadrantCounts(robotsAfterSeconds, width, height);

console.log(robotsAfterSeconds);
console.log(quadrantCounts);
console.log("Multiplication of quadrant counts:", quadrantCounts.reduce((acc, count) => acc * count, 1));
