import { repeat } from "ramda";
import { readFileRaw } from "../../utils/input";

const buildFiles = (diskRaw: string) => {
    return diskRaw
        .split('')
        .filter((_, i) => i % 2 === 0)
        .map(Number)
}

const buildSpaces = (diskRaw: string) => {
    const chars = diskRaw.split('');
    const oddChars = chars.filter((_, i) => i % 2 === 1).map(Number);
    return oddChars;
}

const diskRaw = readFileRaw(__dirname, "./input.txt");

const files = buildFiles(diskRaw);
console.log(files);

const spaces = buildSpaces(diskRaw);

const filesAsBlocks = files.map((len, idx) => repeat(`${idx}`)(len));
const spacesAsDots = [...spaces, 0].map((len) => repeat(".")(len));

const diskData = filesAsBlocks
    .reduce((acc, block, i) => acc.concat(block, spacesAsDots[i]), []);

console.log(diskData);

for (let i = diskData.length - 1; i >= 0; i--) {
    inner: for (let j = 0; j < i; j++) {
        if (diskData[j] === ".") {
            [diskData[j], diskData[i]] = [diskData[i], diskData[j]];
            break inner;
        }
    }
}

const checksum = diskData.reduce((sum, block, idx) => {
    if (block === '.') return sum;
    return sum + idx * parseInt(block);
}, 0);



console.log(checksum);
// 6283404590840