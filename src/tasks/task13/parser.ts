import { readFileSync } from "fs"
import path from "path"

type Point = [number, number]

interface GameRound {
    buttonA: Point
    buttonB: Point
    prize: Point
}

function parsePoint(line: string, isButton = false): Point | Point {
    const match = line.match(/X([+=])(\d+),\s*Y([+=])(\d+)/)
    if (!match) {
        throw new Error(`Invalid point format: ${line}`)
    }

    const [, xOperator, xValue, yOperator, yValue] = match
    const x = parseInt(xValue)
    const y = parseInt(yValue)

    return isButton ? [y, x] : [y, x]
}

function parseGameRounds(input: string): GameRound[] {
    const lines = input
        .trim()
        .split("\n")
        .filter(line => line.trim().length > 0)
    const rounds: GameRound[] = []

    // Process three lines at a time
    for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 >= lines.length) break

        const buttonALine = lines[i].replace("Button A: ", "")
        const buttonBLine = lines[i + 1].replace("Button B: ", "")
        const prizeLine = lines[i + 2].replace("Prize: ", "")

        rounds.push({
        buttonA: parsePoint(buttonALine, true) as Point,
        buttonB: parsePoint(buttonBLine, true) as Point,
        prize: parsePoint(prizeLine, false) as Point
        })
    }

    return rounds
}

function readInputFile(filePath: string): GameRound[] {
    const fullPath = path.join(__dirname, filePath);
    const fileContent = readFileSync(fullPath, "utf-8");
    return parseGameRounds(fileContent);
}

export {
    type Point as ButtonCoords,
    type Point as PrizeCoords,
    type GameRound,
    parsePoint,
    parseGameRounds,
    readInputFile
}