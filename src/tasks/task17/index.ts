import { readFileStrings } from "../../utils/input.ts";

function runProgram(
  registers: [number, number, number],
  program: number[],
): string {
  let [A, B, C] = registers; // Инициализация регистров A, B, C
  const output: number[] = []; // Список для вывода значений
  let ip = 0; // Указатель инструкций

  // Функция для получения значения комбо-операнда
  const getOperandValue = (operand: number): number => {
    if (operand <= 3) return operand; // Литерал 0–3
    if (operand === 4) return A; // Регистр A
    if (operand === 5) return B; // Регистр B
    if (operand === 6) return C; // Регистр C
    throw new Error("Invalid combo operand 7"); // Операнд 7 зарезервирован
  };

  // Основной цикл выполнения программы
  while (ip < program.length) {
    const opcode = program[ip]; // Читаем код операции
    const operand = program[ip + 1]; // Читаем операнд
    ip += 2; // По умолчанию переходим к следующей инструкции

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
        if (A !== 0) ip = operand;
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

function runProgramForOutput(A: number, program: number[]): number[] {
  let B = 0, C = 0; // Registers B and C initialized to 0
  const output: number[] = []; // Collect program outputs
  let ip = 0; // Instruction pointer

  const getOperandValue = (operand: number): number => {
    if (operand <= 3) return operand; // Literal values 0–3
    if (operand === 4) return A; // Register A
    if (operand === 5) return B; // Register B
    if (operand === 6) return C; // Register C
    throw new Error("Invalid combo operand 7");
  };

  while (ip < program.length) {
    const opcode = program[ip];
    const operand = program[ip + 1];
    ip += 2;

    switch (opcode) {
      case 0: // adv
        A = Math.floor(A / Math.pow(2, getOperandValue(operand)));
        break;

      case 1: // bxl
        B ^= operand;
        break;

      case 2: // bst
        B = getOperandValue(operand) % 8;
        break;

      case 3: // jnz
        if (A !== 0) ip = operand;
        break;

      case 4: // bxc
        B ^= C;
        break;

      case 5: // out
        output.push(getOperandValue(operand) % 8);
        break;

      case 6: // bdv
        B = Math.floor(A / Math.pow(2, getOperandValue(operand)));
        break;

      case 7: // cdv
        C = Math.floor(A / Math.pow(2, getOperandValue(operand)));
        break;

      default:
        throw new Error(`Invalid opcode ${opcode}`);
    }
  }

  return output;
}

function findLowestA(program: number[]): number {
  let A = 13743869132800;

  while (true) {
    const output = runProgramForOutput(A, program);
    if (arraysEqual(output, program)) {
      return A;
    }
    A++;
  }
}

// Helper function to check if two arrays are equal
function arraysEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

async function main() {
  //   const input = await readFileStrings("./example.txt");
  const input = await readFileStrings("./input.txt");

  // Парсим первые три регистра
  const registers = [
    { register: "A", value: Number(input[0].split(": ")[1]) },
    { register: "B", value: Number(input[1].split(": ")[1]) },
    { register: "C", value: Number(input[2].split(": ")[1]) },
  ];

  // Парсим программу из четвертой строки
  const program = input[4].split(": ")[1].split(",").map(Number);

  // Преобразуем регистры в нужный формат
  const registerValues: [number, number, number] = [
    registers[0].value,
    registers[1].value,
    registers[2].value,
  ];

  const result = runProgram(registerValues, program);
  console.log("Part 1:");
  console.log("Program:", program);
  console.log("Registers:", registers);
  console.log("Result:", result);

  console.log("\nPart 2:");
  const lowestA = findLowestA(program);
  console.log("Lowest A that makes the program output itself:", lowestA);
}

main();
