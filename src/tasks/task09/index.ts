import { flatten, join, repeat, split } from "ramda";
import { readFileRaw } from "../../utils/input";

type File = {
    id: number,
    length: number,
    moved: boolean,
}

type Space = {
    position: number,
    length: number,
    files: File[],
}

const buildFiles = (diskRaw: string): File[] => {
    return diskRaw
        .split('')
        .filter((_, i) => i % 2 === 0)
        .map(Number)
        .map((length, id) => ({
            id,
            length,
            moved: false,
        }));
}

const buildSpaces = (diskRaw: string): Space[] => {
    const chars = diskRaw.split('');
    const oddChars = chars.filter((_, i) => i % 2 === 1).map(Number);
    return oddChars.map((length, i) => ({
        position: i,
        length,
        files: [],
    }));
}

const diskRaw = readFileRaw(__dirname, "./example.txt");
// const diskRaw = readFileRaw(__dirname, "./input.txt");

const files = buildFiles(diskRaw);

const spaces = buildSpaces(diskRaw);

// for (let i = 0; i < spaces.length; i++){
//     for (let j = files.length - 1; j > i + 1; j--) {
//         if (files[j].moved) continue;
//         if (spaces[i].length >= files[j].length) {
//             spaces[i].files.push(files[j]);
//             spaces[i].length -= files[j].length;
//             files[j].moved = true;
//         }
//     }
// }

for (let j = files.length - 1; j > 0; j--) {
    inner: for (let i = 0; i < j - 1; i++){
        // if (files[j].moved) continue;
        if (spaces[i].length >= files[j].length) {
            spaces[i].files.push(files[j]);
            spaces[i].length -= files[j].length;
            files[j].moved = true;
            break inner;
        }
    }
}

console.log(files);

const compactedDisk: (number | string)[] = [];

files.forEach((file) => {
    const currentSpace = spaces.find((space) => space.files.includes(file)) || { files: [], length: 0 };

    if (file.moved) {
        // Process files already moved to currentSpace
        const movedFilesArray = flatten(currentSpace.files.map(({ id, length }) => repeat(id, length)));
        const dotsArray = repeat(".", currentSpace.length); // Remaining space as dots
        const dotsAfterFileArray = repeat(".", file.length); // Original space from where the file moved
        const combinedArray = [...dotsAfterFileArray, ...movedFilesArray, ...dotsArray];
        compactedDisk.push(...combinedArray);
    } else {
        // Process unmoved files
        const unmovedFilesArray = repeat(file.id, file.length); // File ID repeated for its length
        const movedFilesArray = flatten(currentSpace.files.map(({ id, length }) => repeat(id, length)));
        const dotsArray = repeat(".", currentSpace.length); // Remaining space as dots
        const combinedArray = [...unmovedFilesArray, ...movedFilesArray, ...dotsArray];
        compactedDisk.push(...combinedArray);
    }
});

// Convert compactedDisk to a flat structure
console.log(compactedDisk.join(""));
console.log(compactedDisk);

// Calculate checksum using compactedDisk array
const checksum = compactedDisk.reduce((sum, block, idx) => {
    if (block === ".") return sum; // Ignore dots (free space)
    return Number(sum) + idx * Number(parseInt(`${block}`)); // Multiply position by the real file ID
}, 0);

console.log("Checksum:", checksum);
