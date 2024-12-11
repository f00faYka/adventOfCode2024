import { readFileSync } from "fs"
import { join } from "path"

function getNextStones(stone: number): number[] {
    if (stone === 0) {
        return [1]
    }

    const str = stone.toString()
    if (str.length % 2 === 0) {
        const midIdx = str.length / 2
        const left = parseInt(str.slice(0, midIdx))
        const right = parseInt(str.slice(midIdx))
        return [left, right]
    } else {
        return [stone * 2024]
    }
}

function getNumberOfStonesAfterSteps(initialStone: number, steps: number, cache: Map<string, number>): number {
    const cacheKey = `${initialStone}-${steps}`
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!
    }

    if (steps === 0) {
        return 1
    }

    const nextStones = getNextStones(initialStone)
    let totalStones = 0

    for (const stone of nextStones) {
        totalStones += getNumberOfStonesAfterSteps(stone, steps - 1, cache)
    }

    cache.set(cacheKey, totalStones)
    return totalStones
}

function solution(input: string): number {
    const stones = input.split(" ").map(Number)
    const cache = new Map<string, number>();
    let totalStones = 0

    for (const stone of stones) {
        totalStones += getNumberOfStonesAfterSteps(stone, 75, cache)
    }

    return totalStones
}

function main() {
    const input = readFileSync(join(__dirname, "input.txt"), "utf-8").trim()
    console.log(solution(input))
}

main()
