import { join } from "path";
import { readFileRaw } from "../../utils/input";
import { writeFileSync } from "fs";

type DiskBlock = { type: "file" | "free"; length: number; id?: number };

function parseDiskMap(diskMap: string): DiskBlock[] {
    const parsed: DiskBlock[] = [];
    let fileId = 0;

    for (let i = 0; i < diskMap.length; i += 2) {
        const fileLength = parseInt(diskMap[i]);
        const freeSpaceLength = parseInt(diskMap[i + 1]);

        parsed.push({ type: "file", length: fileLength, id: fileId });
        fileId++;
        parsed.push({ type: "free", length: isNaN(freeSpaceLength) ? 0 : freeSpaceLength });
    }
    return parsed;
}

function moveFiles(parsedMap: DiskBlock[]): DiskBlock[] {
    const files: { id: number; length: number; position: number }[] = [];
    let currentPosition = 0;

    // Identify files and their positions
    parsedMap.forEach((block) => {
        if (block.type === "file") {
            files.push({ id: block.id!, length: block.length, position: currentPosition });
        }
        currentPosition += block.length;
    });

    // Sort files by ID in descending order
    files.sort((a, b) => b.id - a.id);

    for (const { id, length, position } of files) {
        if (id === 0) {
            continue; // Skip the first file
        }

        // Try to move the file to the leftmost valid free space
        for (let i = 0, freePosition = 0; i < parsedMap.length; i++) {
            const block = parsedMap[i];

            if (block.type === "free") {
                // Calculate the position where the file would start if moved here
                const potentialPosition = freePosition;

                if (block.length >= length && potentialPosition < position) {
                    const originalFreeLength = block.length;

                    // Mark the original file location as free space
                    for (let j = 0; j < parsedMap.length; j++) {
                        if (parsedMap[j].type === "file" && parsedMap[j].id === id) {
                            parsedMap[j] = { type: "free", length: parsedMap[j].length };
                        }
                    }

                    // Move the file to this span
                    parsedMap[i] = { type: "file", length, id };

                    // Adjust the remaining free space
                    if (originalFreeLength > length) {
                        parsedMap.splice(i + 1, 0, { type: "free", length: originalFreeLength - length });
                    }

                    break; // File has been moved, stop looking for free space
                }
            }

            // Update the position tracker for the free space
            freePosition += block.length;
        }
    }

    return parsedMap;
}

function calculateChecksum(parsedMap: DiskBlock[]): number {
    let checksum = 0;
    let position = 0;

    parsedMap.forEach((block) => {
        if (block.type === "file") {
            for (let i = 0; i < block.length; i++) {
                checksum += position * block.id!;
                position++;
            }
        } else {
            position += block.length;
        }
    });

    return checksum;
}

function generateFinalArray(parsedMap: DiskBlock[]): string[] {
    const result: string[] = [];

    parsedMap.forEach((block) => {
        if (block.type === "file") {
            result.push(...Array(block.length).fill(block.id!.toString()));
        } else if (block.type === "free") {
            result.push(...Array(block.length).fill("."));
        }
    });

    return result;
}


function main(diskMap: string): number {
    const parsedMap = parseDiskMap(diskMap);
    const compactedMap = moveFiles(parsedMap);

    const finalArray = generateFinalArray(compactedMap);
    writeFileSync(join(__dirname, "result.txt"), finalArray.join(""));

    return calculateChecksum(compactedMap);
}

// Read input from file
// const diskRaw = readFileRaw(__dirname, "./example.txt");
const diskRaw = readFileRaw(__dirname, "./input.txt");

const result = main(diskRaw.trim());
console.log(`Checksum: ${result}`);
