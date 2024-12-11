function calculateTendencies(steps: number = 10, outputFile: string = __dirname + "/tendencies.txt"): void {
    function transformStone(stone: number): number[] {
        /**
         * Transform a single stone according to the rules.
         */
        if (stone === 0) {
            return [1];
        } else if (stone.toString().length % 2 === 0) { // Even number of digits
            const mid = Math.floor(stone.toString().length / 2);
            const left = parseInt(stone.toString().slice(0, mid), 10);
            const right = parseInt(stone.toString().slice(mid), 10);
            return [left, right];
        } else { // Multiply by 2024
            return [stone * 2024];
        }
    }

    function evolve(stones: number[]): number[] {
        /**
         * Apply one step of the transformation to a list of stones.
         */
        const newStones: number[] = [];
        for (const stone of stones) {
            newStones.push(...transformStone(stone));
        }
        return newStones;
    }

    // Start calculating tendencies
    const tendencies: Record<number, number[]> = {};

    for (let initialStone = 1; initialStone <= 1000; initialStone++) {
        let stones: number[] = [initialStone];
        const tendency: number[] = [stones.length];
        for (let step = 0; step < steps; step++) {
            stones = evolve(stones);
            tendency.push(stones.length);
        }
        tendencies[initialStone] = tendency;
    }

    // Write to file (Node.js required for fs module)
    const fs = require("fs");
    let output = "Initial Stone Tendencies (10 Steps)\n";
    output += "===================================\n";
    for (const [stone, tendency] of Object.entries(tendencies)) {
        output += `Initial: ${stone} -> [${tendency.join(", ")}]\n`;
    }
    fs.writeFileSync(outputFile, output);
}

// Run the function
calculateTendencies();