import { readFileStrings } from "../../utils/input.ts";

const memo = new Map<string, number>();

const createCountValidDesigns =
  (colors: Set<string>) => (design: string): number => {
    const countStripes = (stripes: string[]): number => {
      const key = stripes.join("");

      if (memo.has(key)) {
        return memo.get(key)!;
      }

      if (stripes.length === 0) return 1;

      let totalPaths = 0;
      for (let headSize = 1; headSize <= stripes.length; headSize++) {
        const head = stripes.slice(0, headSize).join("");
        const tail = stripes.slice(headSize);
        if (colors.has(head)) {
          const tailPaths = countStripes(tail);
          totalPaths += tailPaths;
        }
      }

      memo.set(key, totalPaths);
      return totalPaths;
    };

    return countStripes(design.split(""));
  };

const main = async () => {
  const input = await readFileStrings("./input.txt");
  //   const input = await readFileStrings("./example.txt");

  const colors = new Set(input[0].split(", "));
  const designs = input.slice(2);

  const countValidDesigns = createCountValidDesigns(colors);

  const results = designs.map((design) => {
    const count = countValidDesigns(design);
    return { design, count };
  });

  results.forEach(({ design, count }) => {
    console.log(`Design "${design}" can be made in ${count} ways`);
  });

  const totalPaths = results.reduce((sum, { count }) => sum + count, 0);
  console.log(`\nTotal number of possible paths: ${totalPaths}`);
};

main();
