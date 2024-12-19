import { readFileStrings } from "../../utils/input.ts";

function runProgram(
  registers: [number, number, number],
  program: number[],
): string {
  let [A, B, C] = registers;
  const output: number[] = [];
  let step = 0;

  const getOperandValue = (operand: number): number => {
    switch (operand) {
      case 0:
      case 1:
      case 2:
      case 3:
        return operand;
      case 4:
        return A;
      case 5:
        return B;
      case 6:
        return C;
      default:
        throw new Error("Invalid combo operand 7"); // Операнд 7 зарезервирован
    }
  };

  while (step < program.length) {
    const opcode = program[step];
    const operand = program[step + 1];
    step += 2;

    switch (opcode) {
      case 0: // adv: деление A на 2^операнд
        A = Math.floor(A / Math.pow(2, getOperandValue(operand)));
        break;

      case 1: // bxl: B ^= операнд (литерал)
        B ^= operand;
        break;

      case 2: // bst: сохраняем операнд % 8 в B
        B = getOperandValue(operand) % 8;
        break;

      case 3: // jnz: прыжок, если A != 0
        if (A !== 0) step = operand;
        break;

      case 4: // bxc: B ^= C (игнорируем операнд)
        B ^= C;
        break;

      case 5: // out: вывод операнда % 8
        output.push(getOperandValue(operand) % 8);
        break;

      case 6: // bdv: деление A на 2^операнд, результат в B
        B = Math.floor(A / Math.pow(2, getOperandValue(operand)));
        break;

      case 7: // cdv: деление A на 2^операнд, результат в C
        C = Math.floor(A / Math.pow(2, getOperandValue(operand)));
        break;

      default:
        throw new Error(`Invalid opcode ${opcode}`);
    }
  }

  return output.join(",");
}

async function main() {
  const input = await readFileStrings("./input.txt");

  // Парсим первые три регистра
  const registers = [
    { register: "A", value: Number(input[0].split(": ")[1]) },
    { register: "B", value: Number(input[1].split(": ")[1]) },
    { register: "C", value: Number(input[2].split(": ")[1]) },
  ];

  const program = input[4].split(": ")[1].split(",").map(Number);

  const registerValues: [number, number, number] = [
    registers[0].value,
    registers[1].value,
    registers[2].value,
  ];

  const result = runProgram(registerValues, program);
  // `part1
  console.log("Result:", result);
}

main();

// 2,4 1,1 7,5 4,0 0,3 1,6 5,5 3,0
