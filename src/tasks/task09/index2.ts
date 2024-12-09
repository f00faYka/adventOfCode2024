import { join } from "path";
import { readFileRaw } from "../../utils/input";
import { writeFileSync } from "fs";

type DiskBlock =
    | { type: "file"; length: number; id: number }
    | { type: "free"; length: number };

function parseDiskMap(diskMap: string): DiskBlock[] {
    const parsed: DiskBlock[] = [];

    for (let i = 0, fileId = 0; i < diskMap.length; i += 2, fileId++) {
        const fileLength = parseInt(diskMap[i]);
        const freeSpaceLength = parseInt(diskMap[i + 1]);

        parsed.push({ type: "file", length: fileLength, id: fileId });
        parsed.push({ type: "free", length: isNaN(freeSpaceLength) ? 0 : freeSpaceLength });
    }
    return parsed;
}

function moveFiles(parsedMap: DiskBlock[]): DiskBlock[] {
    const files: { id: number; length: number; position: number }[] = [];
    let currentPosition = 0;

    parsedMap.forEach((block) => {
        if (block.type === "file") {
            files.push({ id: block.id, length: block.length, position: currentPosition });
        }
        currentPosition += block.length;
    });

    files.sort((a, b) => b.id - a.id);

    for (const { id, length, position } of files) {
        if (id === 0) {
            continue;
        }

        for (let i = 0, freePosition = 0; i < parsedMap.length; i++) {
            const block = parsedMap[i];

            if (block.type === "free") {
                const potentialPosition = freePosition;

                if (block.length >= length && potentialPosition < position) {
                    const originalFreeLength = block.length;

                    for (let j = 0; j < parsedMap.length; j++) {
                        const block = parsedMap[j];
                        if (block.type === "file" && block.id === id) {
                            parsedMap[j] = { type: "free", length: block.length };
                        }
                    }

                    parsedMap[i] = { type: "file", length, id };

                    if (originalFreeLength > length) {
                        parsedMap.splice(i + 1, 0, { type: "free", length: originalFreeLength - length });
                    }

                    break;
                }
            }

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
                checksum += position * block.id;
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
            result.push(...Array(block.length).fill(block.id.toString()));
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
    writeFileSync(join(__dirname, "result.txt"), JSON.stringify(finalArray));

    return calculateChecksum(compactedMap);
}

// const diskRaw = readFileRaw(__dirname, "./example.txt");
const diskRaw = readFileRaw(__dirname, "./input.txt");

const result = main(diskRaw.trim());
console.log(`Checksum: ${result}`);
