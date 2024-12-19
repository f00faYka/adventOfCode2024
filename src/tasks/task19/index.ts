import { readFileStrings } from "../../utils/input.ts";

const memo = new Map<string, boolean>();

const createIsValidDesign =
  (colors: Set<string>) => (design: string): boolean => {
    const checkStripes = (stripes: string[]): boolean => {
      const key = stripes.join("");

      if (memo.has(key)) {
        return memo.get(key)!;
      }

      if (stripes.length === 0) return true;

      for (let headSize = 1; headSize <= stripes.length; headSize++) {
        const head = stripes.slice(0, headSize).join("");
        const tail = stripes.slice(headSize);
        if (colors.has(head)) {
          const isTailValid = checkStripes(tail);
          if (isTailValid) {
            memo.set(key, true);
            return true;
          }
        }
      }

      memo.set(key, false);
      return false;
    };

    return checkStripes(design.split(""));
  };

const main = async () => {
  const input = await readFileStrings("./input.txt");
  //   const input = await readFileStrings("./example.txt");

  const colors = new Set(input[0].split(", "));
  const designs = input.slice(2);

  const isValidDesign = createIsValidDesign(colors);

  const validDesigns = designs.filter(isValidDesign);
  console.log(validDesigns);
  console.log(validDesigns.length);
};

main();
